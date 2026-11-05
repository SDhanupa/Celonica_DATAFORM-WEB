<?php

namespace Tests\Unit;

use App\Services\Leaderboard\ContributionScoring as S;
use PHPUnit\Framework\TestCase;

class ContributionScoringTest extends TestCase
{
    public function test_score_weights_verified_work_and_scales_down_game_points(): void
    {
        $this->assertSame(0, S::score([]));
        $this->assertSame(100 + 20 + 50 + 10 + 150 + 30 + 3, S::score([
            'approved_places' => 1, 'review_places' => 1, 'approved_updates' => 1,
            'review_updates' => 1, 'approved_businesses' => 1, 'review_businesses' => 1,
            'game_points' => 19,
        ]));
        $this->assertSame(0, S::score(['game_points' => -50]));
    }

    public function test_rank_shares_ties_skips_next_and_drops_zero_scores(): void
    {
        $ranked = S::rank([
            'zero' => ['answers' => 4],
            'b' => ['approved_places' => 1],
            'a' => ['review_places' => 5],
            'top' => ['approved_places' => 2],
            'last' => ['review_places' => 1],
        ]);

        $this->assertSame(['top', 'b', 'a', 'last'], array_column($ranked, 'key'));
        $this->assertSame([1, 2, 2, 4], array_column($ranked, 'rank'));
        $this->assertSame([], S::rank(['nobody' => []]));
    }

    public function test_level_boundaries(): void
    {
        $this->assertSame('seedling', S::level(0)['key']);
        $this->assertSame('seedling', S::level(99)['key']);
        $this->assertSame('scout', S::level(100)['key']);
        $this->assertSame(400, S::level(100)['next_min']);
        $legend = S::level(999999);
        $this->assertSame('legend', $legend['key']);
        $this->assertNull($legend['next_key']);
        $this->assertNull($legend['next_min']);
    }

    public function test_display_name_never_exposes_full_names_or_contact_details(): void
    {
        $this->assertSame('Nimal P.', S::displayName('Nimal', 'Perera', 'Nimal Perera'));
        $this->assertSame('Nimal P.', S::displayName(null, null, 'Nimal Kumara Perera'));
        $this->assertSame('Nimal', S::displayName('Nimal', '', null));
        $this->assertSame('නිමල් ප.', S::displayName('නිමල්', 'පෙරේරා', null));
        $this->assertNull(S::displayName(null, null, 'nimal@example.com'));
        $this->assertNull(S::displayName(null, null, '0771234567'));
        $this->assertNull(S::displayName(null, null, null));
        $this->assertSame('Nimal', S::displayName('Nimal', 'a@b.com', null));
    }
}
