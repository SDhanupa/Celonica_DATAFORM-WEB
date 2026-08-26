<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\IndustrySurvey;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class IndustrySurveyController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id'          => 'nullable|integer',
                'ccode'       => 'nullable|string',
                'district'    => 'nullable|string',
                'ds_division' => 'nullable|string',
                'gn_name'     => 'nullable|string',
                'latitude'    => 'nullable|numeric',
                'longitude'   => 'nullable|numeric',
                'status'      => 'nullable|string|in:draft,submitted,approved',
                'form_data'   => 'nullable|array',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed: ' . json_encode($validator->errors()));
                return response()->json(['error' => $validator->errors()], 422);
            }

            $userId = $request->user() ? $request->user()->keycloak_sub : null;
            $data = [
                'user_id'     => $userId,
                'ccode'       => $request->ccode,
                'district'    => $request->district,
                'ds_division' => $request->ds_division,
                'gn_name'     => $request->gn_name,
                'latitude'    => $request->latitude,
                'longitude'   => $request->longitude,
                'status'      => $request->status ?? 'draft',
                'form_data'   => $request->form_data,
            ];

            if ($request->has('id') && $request->id) {
                $survey = IndustrySurvey::where('id', $request->id)
                            ->where(function($q) use ($userId) {
                                if ($userId) $q->where('user_id', $userId);
                            })->first();

                if ($survey) {
                    $survey->update($data);
                } else {
                    $survey = IndustrySurvey::create($data);
                }
            } else {
                $survey = IndustrySurvey::create($data);
            }

            return response()->json([
                'message' => 'Survey saved successfully',
                'survey'  => $survey
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error submitting industry survey: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Generate a unique registration number for an industry survey.
     * Format: {CCODE}/{CATEGORY_CODE}/{NN}
     * Example: GKEDK/SAPDSGV/02
     */
    public function generateRegNumber(Request $request)
    {
        $ccode        = strtoupper(trim($request->input('ccode', '')));
        $categorySlug = trim($request->input('category_slug', ''));

        if (!$ccode || !$categorySlug) {
            return response()->json(['error' => 'ccode and category_slug are required'], 422);
        }

        // Fetch category code from DB (falls back to derived abbreviation from slug)
        $category = DB::table('categories')->where('slug', $categorySlug)->first();
        $catCode  = ($category && !empty($category->code))
            ? strtoupper($category->code)
            : $this->slugToCode($categorySlug);

        $base = $ccode . '/' . $catCode . '/';

        // Count existing industry surveys for this GN + category combo
        $existing = IndustrySurvey::where('ccode', $ccode)
            ->where(function($query) use ($categorySlug) {
                $query->whereRaw("form_data->'formValues'->>'b_type' = ?", [$categorySlug])
                      ->orWhereRaw("form_data->>'b_type' = ?", [$categorySlug]);
            })
            ->count();

        $sequence  = $existing + 1;
        $regNumber = $base . str_pad($sequence, 2, '0', STR_PAD_LEFT);

        // Safety: ensure uniqueness even if collisions exist
        while (IndustrySurvey::whereRaw("form_data->'formValues'->>'b_reg_no' = ?", [$regNumber])
            ->orWhereRaw("form_data->>'b_reg_no' = ?", [$regNumber])
            ->exists()) {
            $sequence++;
            $regNumber = $base . str_pad($sequence, 2, '0', STR_PAD_LEFT);
        }

        return response()->json([
            'reg_number'    => $regNumber,
            'ccode'         => $ccode,
            'category_code' => $catCode,
            'sequence'      => $sequence,
        ]);
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
