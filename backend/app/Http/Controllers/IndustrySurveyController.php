<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IndustrySurvey;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\QueryException;

class IndustrySurveyController extends Controller
{
    /** Postgres SQLSTATE for a unique-constraint violation. */
    private const UNIQUE_VIOLATION = '23505';

    /**
     * Resolve the caller's identity as set by KeycloakAuthGuard.
     *
     * The guard authenticates via `$request->merge([...])`, not Laravel's Auth
     * facade — `$request->user()` is always null here regardless of token
     * validity, and reading it (as this controller used to) silently treats
     * every caller, authenticated or not, as anonymous. `keycloak_sub` is only
     * present for a real, verified JWT; a guest token or an onboarding-only
     * session (no DB user/admin row yet) leaves it null, which this endpoint
     * must refuse — a survey has to be owned by someone identifiable so the
     * ownership check below is a check, not a formality.
     */
    private function requireIdentity(Request $request): ?string
    {
        $sub = $request->input('keycloak_sub');
        return is_string($sub) && $sub !== '' ? $sub : null;
    }

    public function store(Request $request)
    {
        $userId = $this->requireIdentity($request);
        if (!$userId) {
            return response()->json(['error' => 'Unauthorized: a verified account is required to save or submit a survey'], 401);
        }

        $validator = Validator::make($request->all(), [
            'id'          => 'nullable|integer|min:1',
            'ccode'       => 'nullable|string|max:50',
            'district'    => 'nullable|string|max:255',
            'ds_division' => 'nullable|string|max:255',
            'gn_name'     => 'nullable|string|max:255',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            // 'approved' is intentionally excluded: it can only be set via the
            // dedicated, super_admin-gated approve() endpoint below. Accepting
            // it here would let any authenticated caller self-approve.
            'status'      => 'nullable|string|in:draft,submitted',
            'form_data'   => 'nullable|array',
            // Single-use proof from OtpController::verify(), required only when
            // actually submitting (drafts can be saved before verification).
            'mobile_verification_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            // A failed request-shape validation is routine client behaviour
            // (stale form state, a manual API call), not an application fault —
            // logging it at error level would drown real errors in noise.
            Log::info('Industry survey validation failed', ['errors' => $validator->errors(), 'user_id' => $userId]);
            return response()->json(['error' => $validator->errors()], 422);
        }

        $status = $request->input('status', 'draft');
        $formData = $request->input('form_data') ?? [];
        // Both write paths nest survey answers under `formValues` (see the
        // frontend's handleSaveDraft/handleSubmit) — this is the one shape new
        // rows are written in; the dual-path reads elsewhere stay only for
        // rows that predate that being consistent.
        $formValues = $formData['formValues'] ?? [];

        if ($status === 'submitted') {
            $mobile = $formValues['b_mobile'] ?? null;
            $proof = $request->input('mobile_verification_token');
            if (!$mobile || !$proof || !hash_equals((string) Cache::get('otp_verified_' . $mobile, ''), (string) $proof)) {
                return response()->json([
                    'error' => 'Mobile number is not verified. Please verify via OTP before submitting.',
                ], 422);
            }
        }

        try {
            return DB::transaction(function () use ($request, $userId, $status, $formData) {
                $data = [
                    'user_id'     => $userId,
                    'ccode'       => $request->input('ccode'),
                    'district'    => $request->input('district'),
                    'ds_division' => $request->input('ds_division'),
                    'gn_name'     => $request->input('gn_name'),
                    'latitude'    => $request->input('latitude'),
                    'longitude'   => $request->input('longitude'),
                    'status'      => $status,
                    'form_data'   => $formData,
                ];

                $id = $request->input('id');
                $survey = $id ? IndustrySurvey::find($id) : null;

                if ($id && !$survey) {
                    // Client believes it has an existing draft that no longer
                    // exists server-side (e.g. wiped local DB). Silently
                    // creating a new row under that ID would be surprising —
                    // fail clearly so the frontend can clear its stale local
                    // reference and retry as a fresh save.
                    return response()->json(['error' => 'The referenced survey no longer exists'], 404);
                }

                if ($survey) {
                    // Ownership is a hard boundary, not a best-effort filter:
                    // never silently fall through to creating a duplicate row
                    // for someone else's ID, and never update a row that
                    // belongs to a different account.
                    if ($survey->user_id !== $userId) {
                        return response()->json(['error' => 'You do not have permission to modify this survey'], 403);
                    }
                    if ($survey->status === 'approved') {
                        return response()->json(['error' => 'This survey has already been approved and can no longer be modified'], 409);
                    }
                    $survey->update($data);
                } else {
                    $survey = IndustrySurvey::create($data);
                }

                if ($status === 'submitted') {
                    $this->persistRegistrationNumber($survey, $formData);
                    // The proof is single-use: forget it so the same OTP
                    // verification can't be replayed against a second, later
                    // submission with a different (or since-changed) phone.
                    if ($mobile = ($formData['formValues']['b_mobile'] ?? null)) {
                        Cache::forget('otp_verified_' . $mobile);
                    }
                }

                return response()->json([
                    'message' => 'Survey saved successfully',
                    'survey'  => $survey->fresh(),
                ], 200);
            });
        } catch (\Throwable $e) {
            Log::error('Error submitting industry survey: ' . $e->getMessage(), ['user_id' => $userId]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Copy the client-supplied registration number (already computed via
     * generateRegNumber() and shown to the user before they submitted) into
     * the indexed, UNIQUE `reg_number` column. On a genuine collision — two
     * submissions racing past the advisory lock in generateRegNumber(), or a
     * client retrying with a stale number — increment the numeric suffix and
     * retry a bounded number of times rather than let the request fail on a
     * transient race.
     */
    private function persistRegistrationNumber(IndustrySurvey $survey, array $formData): void
    {
        $regNumber = $formData['formValues']['b_reg_no'] ?? $formData['b_reg_no'] ?? null;
        if (!$regNumber) {
            return;
        }

        $prefix = $regNumber;
        $sequence = null;
        if (preg_match('/^(.*\/)(\d+)$/', $regNumber, $m)) {
            $prefix = $m[1];
            $sequence = (int) $m[2];
        }

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $candidate = $sequence !== null
                ? $prefix . str_pad((string) ($sequence + $attempt), 2, '0', STR_PAD_LEFT)
                : $regNumber;
            try {
                // This method runs inside store()'s outer transaction. Postgres
                // (unlike MySQL) aborts the *entire* transaction on the first
                // failed statement — every subsequent query in it raises
                // "current transaction is aborted" until a rollback happens,
                // so a bare retry loop here would only ever succeed on its
                // first attempt and hard-fail on every one after. Wrapping
                // each attempt in its own DB::transaction() makes Laravel
                // issue a SAVEPOINT for it; on a caught exception only that
                // savepoint rolls back, leaving the outer transaction (and the
                // survey row/status write already done in store()) intact.
                DB::transaction(function () use ($survey, $candidate) {
                    $survey->forceFill(['reg_number' => $candidate])->save();
                });
                return;
            } catch (QueryException $e) {
                $isUniqueViolation = ($e->errorInfo[0] ?? null) === self::UNIQUE_VIOLATION;
                if (!$isUniqueViolation || $sequence === null) {
                    throw $e;
                }
                // Fall through and retry with the next sequence number.
            }
        }

        Log::warning('Could not allocate a unique registration number after retries', [
            'survey_id' => $survey->id,
            'attempted' => $regNumber,
        ]);
    }

    /**
     * Generate a *proposed* unique registration number for an industry survey.
     * Format: {CCODE}/{CATEGORY_CODE}/{NN}
     * Example: GKEDK/SAPDSGV/02
     *
     * This is shown to the user before they submit; store() re-validates and
     * persists it into the UNIQUE `reg_number` column, which is the actual
     * source of truth for uniqueness. The advisory lock here only prevents two
     * concurrent preview requests for the same ccode+category from computing
     * the same "next" number in the common case — it cannot protect against a
     * client that fetches a preview and takes a long time to submit, which is
     * exactly why persistRegistrationNumber() also retries on conflict.
     */
    public function generateRegNumber(Request $request)
    {
        if (!$this->requireIdentity($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $ccode        = strtoupper(trim($request->input('ccode', '')));
        $categorySlug = trim($request->input('category_slug', ''));

        if (!$ccode || !$categorySlug) {
            return response()->json(['error' => 'ccode and category_slug are required'], 422);
        }

        $category = DB::table('categories')->where('slug', $categorySlug)->first();
        $catCode  = ($category && !empty($category->code))
            ? strtoupper($category->code)
            : $this->slugToCode($categorySlug);

        $base = $ccode . '/' . $catCode . '/';

        // Serialize generation per ccode+category prefix so two concurrent
        // requests for the *same* combination can't both compute sequence N.
        // Different prefixes hash to (almost certainly) different lock keys
        // and don't block each other.
        return DB::transaction(function () use ($base, $ccode, $categorySlug, $catCode) {
            DB::statement('SELECT pg_advisory_xact_lock(hashtext(?))', [$base]);

            $existing = IndustrySurvey::where('ccode', $ccode)
                ->where(function ($query) use ($categorySlug) {
                    $query->whereRaw("form_data->'formValues'->>'b_type' = ?", [$categorySlug])
                          ->orWhereRaw("form_data->>'b_type' = ?", [$categorySlug]);
                })
                ->count();

            $sequence  = $existing + 1;
            $regNumber = $base . str_pad((string) $sequence, 2, '0', STR_PAD_LEFT);

            while (
                IndustrySurvey::where('reg_number', $regNumber)
                    ->orWhereRaw("form_data->'formValues'->>'b_reg_no' = ?", [$regNumber])
                    ->orWhereRaw("form_data->>'b_reg_no' = ?", [$regNumber])
                    ->exists()
            ) {
                $sequence++;
                $regNumber = $base . str_pad((string) $sequence, 2, '0', STR_PAD_LEFT);
            }

            return response()->json([
                'reg_number'    => $regNumber,
                'ccode'         => $ccode,
                'category_code' => $catCode,
                'sequence'      => $sequence,
            ]);
        });
    }

    /**
     * Derive a short uppercase code from a slug.
     * e.g. "small-scale-food-processing" → "SSFP"
     */
    private function slugToCode(string $slug): string
    {
        $parts = explode('-', $slug);
        $code  = implode('', array_map(fn($p) => strtoupper(substr($p, 0, 1)), $parts));
        return substr($code, 0, 8);
    }

    public function approve($id)
    {
        try {
            $survey = IndustrySurvey::findOrFail($id);
            $survey->update(['status' => 'approved']);

            return response()->json([
                'message' => 'Survey approved successfully',
                'survey'  => $survey
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error approving industry survey: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $query = IndustrySurvey::query();

            if ($request->filled('district')) {
                $query->where('district', $request->district);
            }
            if ($request->filled('ds_division')) {
                $query->where('ds_division', $request->ds_division);
            }
            if ($request->filled('gn_name')) {
                $query->where('gn_name', $request->gn_name);
            }

            $surveys = $query->latest()->paginate($request->get('per_page', 15));

            return response()->json($surveys);
        } catch (\Exception $e) {
            Log::error('Error fetching industry surveys: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
