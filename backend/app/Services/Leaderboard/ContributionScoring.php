<?php

namespace App\Services\Leaderboard;

/**
 * Leaderboard points. Pure and deterministic, so the rules are testable and the
 * API can publish them to players.
 *
 * Verified work is worth far more than unverified work, so submitting junk for
 * review cannot beat real contributions; rejected work and drafts earn nothing.
 * Rapid Fire counts at a fifth of its game points: one round takes a minute,
 * while an approved place is real data someone went and collected.
 */
final class ContributionScoring
{
    public const APPROVED_PLACE = 100;
    public const REVIEW_PLACE = 20;
    public const APPROVED_UPDATE = 50;
    public const REVIEW_UPDATE = 10;
    public const APPROVED_BUSINESS = 150;
    public const REVIEW_BUSINESS = 30;
    public const GAME_POINTS_PER_POINT = 5;

    /** Lowest all-time score for each level, ascending. */
    public const LEVELS = [
        ['key' => 'seedling', 'min' => 0],
        ['key' => 'scout', 'min' => 100],
        ['key' => 'mapper', 'min' => 400],
        ['key' => 'guardian', 'min' => 1000],
        ['key' => 'legend', 'min' => 2500],
    ];

    /** @param array<string,int> $tally counts keyed like emptyTally() */
    public static function score(array $tally): int
    {
        $tally += self::emptyTally();

        return $tally['approved_places'] * self::APPROVED_PLACE
            + $tally['review_places'] * self::REVIEW_PLACE
            + $tally['approved_updates'] * self::APPROVED_UPDATE
            + $tally['review_updates'] * self::REVIEW_UPDATE
            + $tally['approved_businesses'] * self::APPROVED_BUSINESS
            + $tally['review_businesses'] * self::REVIEW_BUSINESS
            + intdiv(max(0, $tally['game_points']), self::GAME_POINTS_PER_POINT);
    }

    /** @return array<string,int> */
    public static function emptyTally(): array
    {
        return [
            'approved_places' => 0,
            'review_places' => 0,
            'approved_updates' => 0,
            'review_updates' => 0,
            'approved_businesses' => 0,
            'review_businesses' => 0,
            'game_points' => 0,
            'answers' => 0,
        ];
    }

    /**
     * Highest score first, players with no points dropped. Equal scores share a
     * rank and the next rank skips (1, 2, 2, 4). The tie-break only fixes display
     * order: more approved work first, then a stable key.
     *
     * @param array<string,array<string,int>> $tallies player key => tally
     * @return list<array{key:string,rank:int,score:int,approved:int,in_review:int,answers:int}>
     */
    public static function rank(array $tallies): array
    {
        $rows = [];
        foreach ($tallies as $key => $tally) {
            $tally += self::emptyTally();
            $score = self::score($tally);
            if ($score <= 0) {
                continue;
            }
            $rows[] = [
                'key' => (string) $key,
                'score' => $score,
                'approved' => $tally['approved_places'] + $tally['approved_updates'] + $tally['approved_businesses'],
                'in_review' => $tally['review_places'] + $tally['review_updates'] + $tally['review_businesses'],
                'answers' => $tally['answers'],
            ];
        }

        usort($rows, fn ($a, $b) => [$b['score'], $b['approved'], $a['key']] <=> [$a['score'], $a['approved'], $b['key']]);

        $ranked = [];
        foreach ($rows as $i => $row) {
            $sameAsPrevious = $i > 0 && $ranked[$i - 1]['score'] === $row['score'];
            $ranked[] = ['rank' => $sameAsPrevious ? $ranked[$i - 1]['rank'] : $i + 1] + $row;
        }

        return $ranked;
    }

    /** @return array{key:string,index:int,min:int,next_key:?string,next_min:?int} */
    public static function level(int $score): array
    {
        $index = 0;
        foreach (self::LEVELS as $i => $level) {
            if ($score >= $level['min']) {
                $index = $i;
            }
        }
        $next = self::LEVELS[$index + 1] ?? null;

        return [
            'key' => self::LEVELS[$index]['key'],
            'index' => $index,
            'min' => self::LEVELS[$index]['min'],
            'next_key' => $next['key'] ?? null,
            'next_min' => $next['min'] ?? null,
        ];
    }

    /**
     * Public name: first name and last initial, never a full name. A value that
     * looks like an email or phone number returns null, so contact details that
     * ended up in a name field are not shown to other players.
     */
    public static function displayName(?string $first, ?string $last, ?string $full): ?string
    {
        $first = trim((string) $first);
        $last = trim((string) $last);
        if ($first === '') {
            $parts = preg_split('/\s+/u', trim((string) $full), -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $first = $parts[0] ?? '';
            $last = count($parts) > 1 ? end($parts) : $last;
        }
        if ($first === '' || str_contains($first, '@') || preg_match('/\d{3}/', $first)) {
            return null;
        }
        if ($last === '' || str_contains($last, '@') || preg_match('/\d/', $last)) {
            return $first;
        }

        return $first . ' ' . mb_strtoupper(mb_substr($last, 0, 1)) . '.';
    }
}
