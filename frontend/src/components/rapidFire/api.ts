import { ApiError } from '../../api/contributions';

/* Mirrors RapidFireController responses. */

export interface RapidFireRules {
  session_size: number;
  seconds_per_question: number;
  hasty_threshold_ms: number;
  points: {
    definite: number;
    unsure: number;
    fast_bonus: number;
    fast_ms: number;
    quick_bonus: number;
    quick_ms: number;
    streak_step: number;
    streak_cap: number;
  };
}

export interface RapidFireDeck {
  slug: string;
  name_en: string;
  name_si: string | null;
  name_ta: string | null;
  total: number;
  answered: number;
  remaining: number;
}

export interface DecksResponse {
  decks: RapidFireDeck[];
  total: number;
  answered: number;
  remaining: number;
  rules: RapidFireRules;
}

export interface RapidFireCard {
  id: number;
  slug: string;
  path: string;
  name_en: string;
  name_si: string | null;
  name_ta: string | null;
  context_en: string | null;
  context_si: string | null;
  context_ta: string | null;
  deck_slug: string;
  deck_name_en: string;
}

export interface StartResponse {
  session: { id: string; deck: string; ccode: string; size: number; expires_at: string };
  rules: RapidFireRules;
  cards: RapidFireCard[];
}

export type RapidFireAnswer = 'yes' | 'no' | 'unsure' | 'skip';

export interface AnswerResponse {
  points: number;
  streak: number;
  best_streak: number;
  score: number;
  hasty: boolean;
  resolved: number;
  remaining: number;
}

export interface CompleteResponse {
  score: number;
  best_streak: number;
  issued: number;
  answered: number;
  skipped: number;
  unplayed: number;
  yes: number;
  no: number;
  unsure: number;
  hasty: number;
  yes_topics: RapidFireCard[];
}

type TokenSource = () => Promise<string | undefined>;

const request = async <T>(getToken: TokenSource, path: string, init: RequestInit = {}, signal?: AbortSignal, timeoutMs = 8000): Promise<T> => {
  const token = await getToken();
  if (!token) {
    console.error('[RapidFire] request: getToken() returned undefined for', path);
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }

  // Safety timeout so a hung server can't hold the "saving" spinner indefinitely.
  // Uses a plain AbortController for broad browser compatibility.
  const timeoutCtrl = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn('[RapidFire] request: timeout after', timeoutMs, 'ms for', path);
    timeoutCtrl.abort();
  }, timeoutMs);

  // Forward external abort (cleanup on unmount) to the timeout controller.
  const onExternalAbort = () => timeoutCtrl.abort();
  if (signal) signal.addEventListener('abort', onExternalAbort, { once: true });

  try {
    console.log('[RapidFire] fetch ->', init.method ?? 'GET', path);
    const res = await fetch(`/api/rapid-fire${path}`, {
      ...init,
      signal: timeoutCtrl.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    const body = await res.json().catch(() => null);
    console.log('[RapidFire] response', res.status, path, body?.success ?? body?.message);
    if (!res.ok || !body?.success) {
      const first = body?.errors && Object.values(body.errors)[0];
      throw new ApiError((Array.isArray(first) && first[0]) || body?.message || `Request failed (${res.status})`, res.status);
    }
    return body.data as T;
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onExternalAbort);
  }
};

export const rapidFireApi = (getToken: TokenSource) => ({
  decks: (ccode: string, signal?: AbortSignal) => request<DecksResponse>(getToken, `/decks?ccode=${encodeURIComponent(ccode)}`, {}, signal),
  start: (ccode: string, deck: string) => request<StartResponse>(getToken, '/sessions', { method: 'POST', body: JSON.stringify({ ccode, deck }) }),
  // Answers are fire-and-forget with a retry queue; 3 s is generous for a local
  // server and keeps the "finishing" wait short if something goes wrong.
  answer: (sessionId: string, categoryId: number, answer: RapidFireAnswer, responseMs: number | null) =>
    request<AnswerResponse>(getToken, `/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId, answer, response_ms: responseMs }),
    }, undefined, 3000),
  complete: (sessionId: string) => request<CompleteResponse>(getToken, `/sessions/${sessionId}/complete`, { method: 'POST' }),
});

export type RapidFireApi = ReturnType<typeof rapidFireApi>;
