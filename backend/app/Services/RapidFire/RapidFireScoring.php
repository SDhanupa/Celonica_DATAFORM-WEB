<?php

namespace App\Services\RapidFire;

/**
 * Points for one rapid-fire card. Pure and deterministic so the server is the
 * authority and the client can mirror it for instant feedback.
 *
 *   yes / no   10, plus a speed bonus and a streak bonus
 *   not sure    5, and it ends the streak (honest, but not a confident answer)
 *   skip        0, ends the streak (the timer ran out or the player passed)
 *   hasty       0, ends the streak (answered faster than it could be read)
 */
final class RapidFireScoring
{
    public const DEFINITE_POINTS = 10;
    public const UNSURE_POINTS = 5;
    public const FAST_BONUS = 5;        // answered within FAST_MS
    public const QUICK_BONUS = 2;       // answered within QUICK_MS
    public const FAST_MS = 3000;
    public const QUICK_MS = 5000;
    public const STREAK_STEP = 2;       // per consecutive definite answer after the first
    public const STREAK_CAP = 5;        // bonus stops growing after this many steps

    /**
     * @return array{points:int, streak:int}
     */
    public static function score(string $answer, ?int $responseMs, bool $hasty, int $streakBefore): array
    {
        if ($hasty || $answer === 'skip') {
            return ['points' => 0, 'streak' => 0];
        }

        if ($answer === 'unsure') {
            return ['points' => self::UNSURE_POINTS, 'streak' => 0];
        }

        $streak = $streakBefore + 1;
        $points = self::DEFINITE_POINTS;

        if ($responseMs !== null) {
            if ($responseMs <= self::FAST_MS) {
                $points += self::FAST_BONUS;
            } elseif ($responseMs <= self::QUICK_MS) {
                $points += self::QUICK_BONUS;
            }
        }

        $points += self::STREAK_STEP * min($streak - 1, self::STREAK_CAP);

        return ['points' => $points, 'streak' => $streak];
    }
}
