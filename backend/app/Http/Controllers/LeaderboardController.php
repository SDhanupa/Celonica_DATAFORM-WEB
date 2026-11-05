<?php

namespace App\Http\Controllers;

use App\Services\Leaderboard\ContributionScoring;
use App\Support\CategoryDataSchema;
use App\Support\GnRecordScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Who has contributed most, across the country or in one village. Read-only.
 * Players are exposed only as a shortened name: no Keycloak subject, email or
 * other account detail leaves this controller.
 */
class LeaderboardController extends Controller
{
    private const CACHE_SECONDS = 300;
    private const TOP_LIMIT = 50;

    /** GET /api/contributions/leaderboard?scope=all|village&period=all|month&ccode= */
    public function index(Request $request): JsonResponse
    {
        $sub = $request->attributes->get('keycloak_sub');
        if (!is_string($sub) || $sub === '') {
            return response()->json(['success' => false, 'message' => 'Sign in to see the leaderboard.'], 401);
        }

        $data = $request->validate([
            'scope' => ['sometimes', 'string', 'in:all,village'],
            'period' => ['sometimes', 'string', 'in:all,month'],
            'ccode' => ['required_if:scope,village', 'nullable', 'string', 'regex:/^[A-Za-z0-9_-]{1,32}$/'],
        ]);
        $scope = $data['scope'] ?? 'all';
        $period = $data['period'] ?? 'all';

        $ccode = null;
        $gn = null;
        if ($scope === 'village') {
            $ccode = strtoupper($data['ccode']);
            $gn = GnRecordScope::resolveGn($ccode);
            if (!$gn) {
                return response()->json(['success' => false, 'message' => 'Village not found.'], 404);
            }
        }

        $since = $period === 'month' ? Carbon::now()->startOfMonth() : null;
        $ranked = $this->ranked($ccode, $gn, $since);
        // Levels reflect a player's whole record, whichever board is being viewed.
        $allTime = ($scope === 'all' && $period === 'all') ? $ranked : $this->ranked(null, null, null);
        $allTimeScores = array_column($allTime, 'score', 'key');

        $top = array_slice($ranked, 0, self::TOP_LIMIT);
        $mine = null;
        foreach ($ranked as $row) {
            if ($row['key'] === $sub) {
                $mine = $row;
                break;
            }
        }

        $names = $this->names(array_values(array_unique([...array_column($top, 'key'), $sub])));
        $present = fn (array $row) => [
            'rank' => $row['rank'],
            'name' => $names[$row['key']] ?? null,
            'score' => $row['score'],
            'approved' => $row['approved'],
            'in_review' => $row['in_review'],
            'answers' => $row['answers'],
            'level' => ContributionScoring::level($allTimeScores[$row['key']] ?? 0)['key'],
            'is_me' => $row['key'] === $sub,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'scope' => $scope,
                'period' => $period,
                'players' => count($ranked),
                'entries' => array_map($present, $top),
                'me' => [
                    'rank' => $mine['rank'] ?? null,
                    'name' => $names[$sub] ?? null,
                    'score' => $mine['score'] ?? 0,
                    'approved' => $mine['approved'] ?? 0,
                    'in_review' => $mine['in_review'] ?? 0,
                    'answers' => $mine['answers'] ?? 0,
                    'all_time_score' => $allTimeScores[$sub] ?? 0,
                    'level' => ContributionScoring::level($allTimeScores[$sub] ?? 0),
                ],
                'scoring' => [
                    'approved_place' => ContributionScoring::APPROVED_PLACE,
                    'review_place' => ContributionScoring::REVIEW_PLACE,
                    'approved_update' => ContributionScoring::APPROVED_UPDATE,
                    'approved_business' => ContributionScoring::APPROVED_BUSINESS,
                    'game_points_per_point' => ContributionScoring::GAME_POINTS_PER_POINT,
                ],
            ],
        ]);
    }

    private function ranked(?string $ccode, ?object $gn, ?Carbon $since): array
    {
        // shortcut: a new contribution can take up to CACHE_SECONDS to appear; forget these keys on approval if that ever matters.
        $key = 'leaderboard_' . ($ccode ?? 'all') . '_' . ($since ? $since->format('Y-m') : 'all');

        return Cache::remember($key, self::CACHE_SECONDS, fn () => ContributionScoring::rank($this->tallies($ccode, $gn, $since)));
    }

    /** @return array<string,array<string,int>> contributor subject => counts */
    private function tallies(?string $ccode, ?object $gn, ?Carbon $since): array
    {
        $tallies = [];
        $add = function (string $sub, string $field, int $count) use (&$tallies) {
            $tallies[$sub] ??= ContributionScoring::emptyTally();
            $tallies[$sub][$field] += $count;
        };

        foreach (CategoryDataSchema::allTables() as $table) {
            if (!GnRecordScope::hasColumn($table, 'contributor_sub') || ($since && !GnRecordScope::hasColumn($table, 'created_at'))) {
                continue;
            }

            // Same reading of a row's state as ContributionController::placeStatus(). Column names here are constants.
            $approved = GnRecordScope::hasColumn($table, 'is_approved') ? 'COALESCE(is_approved, false)' : 'false';
            $isUpdate = GnRecordScope::hasColumn($table, 'is_update_proposal') ? 'COALESCE(is_update_proposal, false)' : 'false';
            $rejected = GnRecordScope::hasColumn($table, 'status') ? "COALESCE(status = 'rejected', false)" : 'false';

            $query = DB::table($table)->whereNotNull('contributor_sub');
            if ($ccode) {
                GnRecordScope::apply($query, $table, $ccode, $gn);
            }
            if ($since) {
                $query->where('created_at', '>=', $since);
            }

            $rows = $query
                ->selectRaw("contributor_sub, {$approved} AS approved, {$isUpdate} AS is_update, {$rejected} AS rejected, COUNT(*) AS total")
                ->groupByRaw('1, 2, 3, 4')
                ->get();

            foreach ($rows as $row) {
                if ($row->approved) {
                    $add($row->contributor_sub, $row->is_update ? 'approved_updates' : 'approved_places', (int) $row->total);
                } elseif (!$row->rejected) {
                    $add($row->contributor_sub, $row->is_update ? 'review_updates' : 'review_places', (int) $row->total);
                }
            }
        }

        $surveys = DB::table('industry_surveys')->whereNotNull('user_id')->whereIn('status', ['submitted', 'approved']);
        if ($ccode) {
            $surveys->where('ccode', $ccode);
        }
        if ($since) {
            $surveys->where('created_at', '>=', $since);
        }
        foreach ($surveys->selectRaw('user_id, status, COUNT(*) AS total')->groupBy('user_id', 'status')->get() as $row) {
            $add($row->user_id, $row->status === 'approved' ? 'approved_businesses' : 'review_businesses', (int) $row->total);
        }

        // Rapid Fire: hasty answers already score 0, and answers a moderator rejected do not count.
        $answers = DB::table('village_topic_answers')
            ->where('is_hasty', false)
            ->where('points', '>', 0)
            ->where(fn ($q) => $q->whereNull('status')->orWhere('status', '<>', 'rejected'));
        if ($ccode) {
            $answers->where('ccode', $ccode);
        }
        if ($since) {
            $answers->where('created_at', '>=', $since);
        }
        foreach ($answers->selectRaw('contributor_sub, SUM(points) AS points, COUNT(*) AS total')->groupBy('contributor_sub')->get() as $row) {
            $add($row->contributor_sub, 'game_points', (int) $row->points);
            $add($row->contributor_sub, 'answers', (int) $row->total);
        }

        return $tallies;
    }

    /** @return array<string,?string> contributor subject => public name */
    private function names(array $subs): array
    {
        return DB::table('users')
            ->whereIn('keycloak_sub', $subs)
            ->get(['keycloak_sub', 'first_name', 'last_name', 'name'])
            ->mapWithKeys(fn ($u) => [$u->keycloak_sub => ContributionScoring::displayName($u->first_name, $u->last_name, $u->name)])
            ->all();
    }
}
