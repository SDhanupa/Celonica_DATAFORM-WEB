import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/contributions';
import type { AnswerResponse, RapidFireAnswer } from './api';

export interface QueuedAnswer {
  sessionId: string;
  cardId: number;
  answer: RapidFireAnswer;
  responseMs: number | null;
}

interface Options {
  send: (item: QueuedAnswer) => Promise<AnswerResponse>;
  onConfirmed: (item: QueuedAnswer, response: AnswerResponse | null) => void;
  onExpired: () => void;
  onUnauthorized: () => void;
  /**
   * The server flags answers that arrive too close together. Pacing sends here
   * keeps honest play on a jittery connection from being misread as a burst.
   */
  minGapMs?: number;
  maxRetries?: number;
  /** How long flush() will wait before giving up and resolving anyway. Default 12 s. */
  flushTimeoutMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends answers one at a time, in order, so the server sees the same sequence
 * the player produced (streaks depend on it). The UI never waits on it.
 */
export function useAnswerQueue({ send, onConfirmed, onExpired, onUnauthorized, minGapMs = 250, maxRetries = 3, flushTimeoutMs = 12000 }: Options) {
  const queue = useRef<QueuedAnswer[]>([]);
  const running = useRef(false);
  const lastSentAt = useRef(0);
  const disposed = useRef(false);
  const waiters = useRef<Array<() => void>>([]);
  const handlers = useRef({ send, onConfirmed, onExpired, onUnauthorized });
  handlers.current = { send, onConfirmed, onExpired, onUnauthorized };

  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    disposed.current = false;
    return () => {
      disposed.current = true;
    };
  }, []);

  const settle = useCallback(() => {
    if (queue.current.length === 0 && !running.current) {
      waiters.current.splice(0).forEach((resolve) => resolve());
    }
  }, []);

  const pump = useCallback(async () => {
    if (running.current) return;
    running.current = true;

    while (queue.current.length > 0 && !disposed.current) {
      const item = queue.current[0];
      const wait = lastSentAt.current + minGapMs - performance.now();
      if (wait > 0) await sleep(wait);

      for (let attempt = 0; ; attempt += 1) {
        lastSentAt.current = performance.now();
        try {
          const response = await handlers.current.send(item);
          if (!disposed.current) handlers.current.onConfirmed(item, response);
          break;
        } catch (err) {
          const status = err instanceof ApiError ? err.status : 0;
          if (status === 409) {
            // Already recorded (e.g. a retry after a lost response) — nothing to redo.
            if (!disposed.current) handlers.current.onConfirmed(item, null);
            break;
          }
          if (status === 410) {
            queue.current = [item];
            if (!disposed.current) handlers.current.onExpired();
            break;
          }
          if (status === 401) {
            queue.current = [item];
            if (!disposed.current) handlers.current.onUnauthorized();
            break;
          }
          const transient = status === 0 || status === 429 || status >= 500;
          if (transient && attempt < maxRetries) {
            await sleep(500 * 2 ** attempt);
            continue;
          }
          if (!disposed.current) setFailed((n) => n + 1);
          break;
        }
      }

      queue.current.shift();
      if (!disposed.current) setPending(queue.current.length);
    }

    running.current = false;
    settle();
  }, [maxRetries, minGapMs, settle]);

  const enqueue = useCallback(
    (item: QueuedAnswer) => {
      queue.current.push(item);
      setPending(queue.current.length);
      void pump();
    },
    [pump],
  );

  /** Resolves once every queued answer has been sent (or given up on), with a
   * safety timeout so the results screen is never permanently blocked. */
  const flush = useCallback(
    () =>
      new Promise<void>((resolve) => {
        waiters.current.push(resolve);
        settle();
        // Failsafe: if the queue still hasn't drained after flushTimeoutMs, resolve
        // anyway so the game can move to the results screen.
        setTimeout(resolve, flushTimeoutMs);
      }),
    [flushTimeoutMs, settle],
  );

  const reset = useCallback(() => {
    queue.current = [];
    setPending(0);
    setFailed(0);
  }, []);

  return { enqueue, flush, reset, pending, failed };
}
