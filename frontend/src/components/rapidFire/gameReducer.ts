import type { AnswerResponse, CompleteResponse, RapidFireAnswer, RapidFireCard, RapidFireRules, StartResponse } from './api';
import { scoreAnswer } from './scoring';

export type Phase = 'lobby' | 'starting' | 'countdown' | 'playing' | 'finishing' | 'results';

export interface Outcome {
  cardId: number;
  answer: RapidFireAnswer;
  points: number;
  hasty: boolean;
}

export interface Feedback {
  seq: number;
  answer: RapidFireAnswer;
  points: number;
  hasty: boolean;
}

export interface GameState {
  phase: Phase;
  deck: string | null;
  sessionId: string | null;
  rules: RapidFireRules | null;
  cards: RapidFireCard[];
  index: number;
  outcomes: Outcome[];
  /** Server-confirmed total, and how many outcomes it covers. */
  confirmedScore: number;
  confirmedCount: number;
  streak: number;
  bestStreak: number;
  feedback: Feedback | null;
  summary: CompleteResponse | null;
  error: string | null;
  expired: boolean;
}

export type GameAction =
  | { type: 'START_REQUEST'; deck: string }
  | { type: 'START_SUCCESS'; response: StartResponse }
  | { type: 'START_FAILURE'; error: string }
  | { type: 'COUNTDOWN_DONE' }
  | { type: 'ANSWER'; answer: RapidFireAnswer; responseMs: number | null }
  | { type: 'CONFIRMED'; cardId: number; response: AnswerResponse | null }
  | { type: 'FINISH_REQUEST' }
  | { type: 'FINISH_SUCCESS'; summary: CompleteResponse }
  | { type: 'FINISH_FAILURE'; error: string }
  | { type: 'EXPIRED' }
  | { type: 'RESET' };

export const initialGameState: GameState = {
  phase: 'lobby',
  deck: null,
  sessionId: null,
  rules: null,
  cards: [],
  index: 0,
  outcomes: [],
  confirmedScore: 0,
  confirmedCount: 0,
  streak: 0,
  bestStreak: 0,
  feedback: null,
  summary: null,
  error: null,
  expired: false,
};

/** What the player sees: confirmed total plus estimates not yet confirmed. */
export const displayScore = (state: GameState): number =>
  state.confirmedScore + state.outcomes.slice(state.confirmedCount).reduce((sum, o) => sum + o.points, 0);

export const currentCard = (state: GameState): RapidFireCard | null =>
  state.phase === 'playing' ? state.cards[state.index] ?? null : null;

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_REQUEST':
      if (state.phase !== 'lobby' && state.phase !== 'results') return state;
      return { ...initialGameState, phase: 'starting', deck: action.deck };

    case 'START_SUCCESS':
      if (state.phase !== 'starting') return state;
      return {
        ...state,
        phase: 'countdown',
        sessionId: action.response.session.id,
        rules: action.response.rules,
        cards: action.response.cards,
      };

    case 'START_FAILURE':
      return { ...state, phase: 'lobby', error: action.error };

    case 'COUNTDOWN_DONE':
      return state.phase === 'countdown' ? { ...state, phase: 'playing' } : state;

    case 'ANSWER': {
      const card = currentCard(state);
      if (!card || !state.rules) return state;
      const result = scoreAnswer(state.rules, action.answer, action.responseMs, state.streak);
      const outcomes = [...state.outcomes, { cardId: card.id, answer: action.answer, points: result.points, hasty: result.hasty }];
      const index = state.index + 1;
      return {
        ...state,
        outcomes,
        index,
        streak: result.streak,
        bestStreak: Math.max(state.bestStreak, result.streak),
        feedback: { seq: outcomes.length, answer: action.answer, points: result.points, hasty: result.hasty },
        phase: index >= state.cards.length ? 'finishing' : 'playing',
      };
    }

    case 'CONFIRMED': {
      // Answers are confirmed strictly in order (the queue is sequential).
      const position = state.confirmedCount;
      const outcome = state.outcomes[position];
      if (!outcome || outcome.cardId !== action.cardId) return state;
      if (!action.response) {
        return { ...state, confirmedCount: position + 1, confirmedScore: state.confirmedScore + outcome.points };
      }
      const outcomes = state.outcomes.slice();
      outcomes[position] = { ...outcome, points: action.response.points, hasty: action.response.hasty };
      return {
        ...state,
        outcomes,
        confirmedCount: position + 1,
        confirmedScore: action.response.score,
        bestStreak: Math.max(state.bestStreak, action.response.best_streak),
      };
    }

    case 'FINISH_REQUEST':
      return state.phase === 'playing' || state.phase === 'finishing' ? { ...state, phase: 'finishing' } : state;

    case 'FINISH_SUCCESS':
      return { ...state, phase: 'results', summary: action.summary, bestStreak: action.summary.best_streak, confirmedScore: action.summary.score, confirmedCount: state.outcomes.length };

    case 'FINISH_FAILURE':
      return { ...state, phase: 'results', error: action.error };

    case 'EXPIRED':
      return { ...state, phase: 'lobby', expired: true, error: null };

    case 'RESET':
      return { ...initialGameState };

    default:
      return state;
  }
}
