<?php

namespace App\Http\Controllers;

use App\Services\RapidFire\RapidFireScoring;
use App\Services\RapidFire\TopicCatalog;
use App\Support\GnRecordScope;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Rapid fire: timed yes / no / not-sure rounds that ask whether each topic
 * exists in the player's village. The server issues the cards, accepts an
 * answer only for a card it issued, and is the sole authority on score.
 */
class RapidFireController extends Controller
{
    private const ANSWERS = ['yes', 'no', 'unsure', 'skip'];

    public function __construct(private TopicCatalog $catalog)
    {
    }

    /** GET /api/rapid-fire/decks?ccode= — decks with what is left for me in this village. */
    public function decks(Request $request): JsonResponse
    {
        $sub = $this->sub($request);
        $ccode = $this->validatedVillage($request->query('ccode'));

        $answered = DB::table('village_topic_answers')
            ->where('ccode', $ccode)
            ->where('contributor_sub', $sub)
            ->pluck('category_id')
            ->map(fn ($id) => (int) $id)
            ->flip();

        $decks = $this->catalog->decks()->map(function ($deck) use ($answered) {
            $leaves = $this->catalog->leafIdsUnder($deck->id);
            $done = count(array_filter($leaves, fn ($id) => isset($answered[$id])));
            return [
                'slug' => $deck->slug,
                'name_en' => $deck->name_en,
                'name_si' => $deck->name_si,
                'name_ta' => $deck->name_ta,
                'total' => count($leaves),
                'answered' => $done,
                'remaining' => count($leaves) - $done,
            ];
        })->filter(fn ($d) => $d['total'] > 0)->values();

        return response()->json([
            'success' => true,
            'data' => [
                'decks' => $decks,
                'total' => $decks->sum('total'),
                'answered' => $decks->sum('answered'),
                'remaining' => $decks->sum('remaining'),
                'rules' => $this->rules(),
            ],
        ]);
    }

    /** POST /api/rapid-fire/sessions — deal a new round. */
    public function start(Request $request): JsonResponse
    {
        $sub = $this->sub($request);
        $data = $request->validate([
            'ccode' => ['required', 'string', 'max:32'],
            'deck' => ['required', 'string', 'max:120'],
        ]);
        $ccode = $this->validatedVillage($data['ccode']);

        if ($data['deck'] === 'mix') {
            $pool = $this->catalog->allPlayableLeafIds();
        } else {
            $deck = $this->catalog->deckBySlug($data['deck']);
            if (!$deck) {
                return $this->fail('Unknown deck.', 422);
            }
            $pool = $this->catalog->leafIdsUnder($deck->id);
        }

        $answered = DB::table('village_topic_answers')
            ->where('ccode', $ccode)
            ->where('contributor_sub', $sub)
            ->whereIn('category_id', $pool)
            ->pluck('category_id')
            ->map(fn ($id) => (int) $id)
            ->flip();

        $remaining = array_values(array_filter($pool, fn ($id) => !isset($answered[$id])));
        if (!$remaining) {
            return $this->fail('You have answered every question in this deck for this village.', 409);
        }

        // Spread effort: topics the village has answered least come first, so
        // players together cover the whole list instead of repeating the same cards.
        $communityCounts = DB::table('village_topic_answers')
            ->where('ccode', $ccode)
            ->where('is_hasty', false)
            ->whereIn('category_id', $remaining)
            ->groupBy('category_id')
            ->pluck(DB::raw('count(*)'), 'category_id')
            ->mapWithKeys(fn ($count, $id) => [(int) $id => (int) $count]);

        shuffle($remaining);
        usort($remaining, fn ($a, $b) => ($communityCounts[$a] ?? 0) <=> ($communityCounts[$b] ?? 0));
        $topicIds = array_slice($remaining, 0, max(1, (int) config('rapid_fire.session_size')));

        $cards = array_values(array_filter(array_map(fn ($id) => $this->catalog->cardFor($id), $topicIds)));
        $now = CarbonImmutable::now();
        $id = (string) Str::uuid();

        DB::table('rapid_fire_sessions')->insert([
            'id' => $id,
            'contributor_sub' => $sub,
            'ccode' => $ccode,
            'deck' => $data['deck'],
            'topic_ids' => json_encode(array_column($cards, 'id')),
            'resolved_ids' => json_encode([]),
            'expires_at' => $now->addMinutes((int) config('rapid_fire.session_ttl_minutes')),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'session' => [
                    'id' => $id,
                    'deck' => $data['deck'],
                    'ccode' => $ccode,
                    'size' => count($cards),
                    'expires_at' => $now->addMinutes((int) config('rapid_fire.session_ttl_minutes'))->toIso8601String(),
                ],
                'rules' => $this->rules(),
                'cards' => $cards,
            ],
        ], 201);
    }

    /** POST /api/rapid-fire/sessions/{id}/answers — play one card. */
    public function answer(Request $request, string $id): JsonResponse
    {
        $sub = $this->sub($request);
        $data = $request->validate([
            'category_id' => ['required', 'integer'],
            'answer' => ['required', 'string', 'in:' . implode(',', self::ANSWERS)],
            'response_ms' => ['nullable', 'integer', 'min:0', 'max:600000'],
        ]);
        if (!Str::isUuid($id)) {
            return $this->fail('Round not found.', 404);
        }

        return DB::transaction(function () use ($id, $sub, $data) {
            // Row lock: two quick taps must not both score, or both claim a card.
            $session = DB::table('rapid_fire_sessions')->where('id', $id)->lockForUpdate()->first();

            if (!$session) {
                return $this->fail('Round not found.', 404);
            }
            if ($session->contributor_sub !== $sub) {
                return $this->fail('This round belongs to someone else.', 403);
            }
            if ($session->completed_at !== null) {
                return $this->fail('This round is already finished.', 409);
            }
            if (CarbonImmutable::parse($session->expires_at)->isPast()) {
                return $this->fail('This round has expired. Start a new one.', 410);
            }

            $topicId = (int) $data['category_id'];
            $issued = array_map('intval', json_decode($session->topic_ids, true) ?: []);
            $resolved = array_map('intval', json_decode($session->resolved_ids, true) ?: []);

            if (!in_array($topicId, $issued, true)) {
                return $this->fail('That question is not part of this round.', 422);
            }
            if (in_array($topicId, $resolved, true)) {
                return $this->fail('That question was already answered.', 409);
            }

            $now = CarbonImmutable::now();
            $responseMs = $data['response_ms'] ?? null;
            $serverGapMs = $session->last_answer_at
                ? (int) CarbonImmutable::parse($session->last_answer_at)->diffInMilliseconds($now, true)
                : PHP_INT_MAX;
            $hasty = $data['answer'] !== 'skip' && (
                ($responseMs !== null && $responseMs < (int) config('rapid_fire.hasty_threshold_ms'))
                || $serverGapMs < (int) config('rapid_fire.min_server_gap_ms')
            );

            $result = RapidFireScoring::score($data['answer'], $responseMs, $hasty, (int) $session->current_streak);

            if ($data['answer'] !== 'skip') {
                $result['points'] = $this->recordAnswer($session, $sub, $topicId, $data['answer'], $responseMs, $hasty, $result['points'], $now);
            }

            $resolved[] = $topicId;
            $score = (int) $session->score + $result['points'];
            $best = max((int) $session->best_streak, $result['streak']);

            DB::table('rapid_fire_sessions')->where('id', $id)->update([
                'resolved_ids' => json_encode($resolved),
                'score' => $score,
                'current_streak' => $result['streak'],
                'best_streak' => $best,
                // Explicit milliseconds: the default grammar writes whole seconds,
                // which would make the minimum-gap check flag honest answers.
                'last_answer_at' => $now->format('Y-m-d H:i:s.v'),
                'updated_at' => $now,
            ]);

            ContributionController::forgetVillageCache($session->ccode);

            return response()->json([
                'success' => true,
                'data' => [
                    'points' => $result['points'],
                    'streak' => $result['streak'],
                    'best_streak' => $best,
                    'score' => $score,
                    'hasty' => $hasty,
                    'resolved' => count($resolved),
                    'remaining' => count($issued) - count($resolved),
                ],
            ]);
        });
    }

    /** POST /api/rapid-fire/sessions/{id}/complete — close the round (idempotent). */
    public function complete(Request $request, string $id): JsonResponse
    {
        $sub = $this->sub($request);
        if (!Str::isUuid($id)) {
            return $this->fail('Round not found.', 404);
        }

        $session = DB::table('rapid_fire_sessions')->where('id', $id)->first();
        if (!$session) {
            return $this->fail('Round not found.', 404);
        }
        if ($session->contributor_sub !== $sub) {
            return $this->fail('This round belongs to someone else.', 403);
        }

        if ($session->completed_at === null) {
            DB::table('rapid_fire_sessions')->where('id', $id)->whereNull('completed_at')->update(['completed_at' => now(), 'updated_at' => now()]);
        }

        $answers = DB::table('village_topic_answers')->where('session_id', $id)->get(['category_id', 'answer', 'is_hasty']);
        $issued = json_decode($session->topic_ids, true) ?: [];
        $resolved = json_decode($session->resolved_ids, true) ?: [];

        $yesTopics = $answers->where('answer', 'yes')->where('is_hasty', false)
            ->map(fn ($a) => $this->catalog->cardFor((int) $a->category_id))
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'score' => (int) $session->score,
                'best_streak' => (int) $session->best_streak,
                'issued' => count($issued),
                'answered' => $answers->count(),
                'skipped' => count($resolved) - $answers->count(),
                'unplayed' => count($issued) - count($resolved),
                'yes' => $answers->where('answer', 'yes')->count(),
                'no' => $answers->where('answer', 'no')->count(),
                'unsure' => $answers->where('answer', 'unsure')->count(),
                'hasty' => $answers->where('is_hasty', true)->count(),
                'yes_topics' => $yesTopics,
            ],
        ]);
    }

    /**
     * Stores the answer, returning the points it actually earns: a topic that
     * this person already answered for this village (in a concurrent round) is
     * updated but earns nothing, so replays cannot farm points.
     */
    private function recordAnswer(object $session, string $sub, int $topicId, string $answer, ?int $responseMs, bool $hasty, int $points, CarbonImmutable $now): int
    {
        $existing = DB::table('village_topic_answers')
            ->where('ccode', $session->ccode)
            ->where('category_id', $topicId)
            ->where('contributor_sub', $sub)
            ->lockForUpdate()
            ->first();

        $values = [
            'answer' => $answer,
            'response_ms' => $responseMs,
            'is_hasty' => $hasty,
            'session_id' => $session->id,
            'updated_at' => $now,
        ];

        if ($existing) {
            DB::table('village_topic_answers')->where('id', $existing->id)->update($values + ['points' => 0]);
            return 0;
        }

        DB::table('village_topic_answers')->insert($values + [
            'ccode' => $session->ccode,
            'category_id' => $topicId,
            'contributor_sub' => $sub,
            'points' => $points,
            'created_at' => $now,
        ]);

        return $points;
    }

    private function rules(): array
    {
        return [
            'session_size' => (int) config('rapid_fire.session_size'),
            'seconds_per_question' => (int) config('rapid_fire.seconds_per_question'),
            'hasty_threshold_ms' => (int) config('rapid_fire.hasty_threshold_ms'),
            'points' => [
                'definite' => RapidFireScoring::DEFINITE_POINTS,
                'unsure' => RapidFireScoring::UNSURE_POINTS,
                'fast_bonus' => RapidFireScoring::FAST_BONUS,
                'fast_ms' => RapidFireScoring::FAST_MS,
                'quick_bonus' => RapidFireScoring::QUICK_BONUS,
                'quick_ms' => RapidFireScoring::QUICK_MS,
                'streak_step' => RapidFireScoring::STREAK_STEP,
                'streak_cap' => RapidFireScoring::STREAK_CAP,
            ],
        ];
    }

    private function sub(Request $request): string
    {
        $sub = $request->attributes->get('keycloak_sub');
        if (!is_string($sub) || $sub === '') {
            abort(response()->json(['success' => false, 'message' => 'Sign in to play.'], 401));
        }
        return $sub;
    }

    private function validatedVillage(mixed $ccode): string
    {
        if (!is_string($ccode) || !preg_match('/^[A-Za-z0-9_-]{1,32}$/', $ccode) || !GnRecordScope::resolveGn($ccode)) {
            abort(response()->json(['success' => false, 'message' => 'Choose a valid village first.'], 422));
        }
        return strtoupper($ccode);
    }

    private function fail(string $message, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message], $status);
    }
}
