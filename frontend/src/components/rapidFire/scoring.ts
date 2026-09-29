import type { RapidFireAnswer, RapidFireRules } from './api';

/**
 * Client mirror of App\Services\RapidFire\RapidFireScoring, used only for
 * instant feedback. The server's total is authoritative and replaces this
 * running estimate as each answer is confirmed.
 */
export const scoreAnswer = (
  rules: RapidFireRules,
  answer: RapidFireAnswer,
  responseMs: number | null,
  streakBefore: number,
): { points: number; streak: number; hasty: boolean } => {
  const hasty = answer !== 'skip' && responseMs !== null && responseMs < rules.hasty_threshold_ms;
  const p = rules.points;

  if (hasty || answer === 'skip') return { points: 0, streak: 0, hasty };
  if (answer === 'unsure') return { points: p.unsure, streak: 0, hasty };

  const streak = streakBefore + 1;
  let points = p.definite;
  if (responseMs !== null) {
    if (responseMs <= p.fast_ms) points += p.fast_bonus;
    else if (responseMs <= p.quick_ms) points += p.quick_bonus;
  }
  points += p.streak_step * Math.min(streak - 1, p.streak_cap);
  return { points, streak, hasty };
};

export type RankKey = 'rfRankScout' | 'rfRankMapper' | 'rfRankExpert' | 'rfRankLegend';

/** Rank by share of the round's best possible score, so it is fair for short decks. */
export const rankFor = (score: number, cards: number, rules: RapidFireRules): RankKey => {
  const p = rules.points;
  let max = 0;
  for (let i = 1; i <= cards; i += 1) max += p.definite + p.fast_bonus + p.streak_step * Math.min(i - 1, p.streak_cap);
  const share = max > 0 ? score / max : 0;
  if (share >= 0.85) return 'rfRankLegend';
  if (share >= 0.6) return 'rfRankExpert';
  if (share >= 0.3) return 'rfRankMapper';
  return 'rfRankScout';
};
