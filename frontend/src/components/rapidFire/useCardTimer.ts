import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Per-card countdown. Time only runs while the tab is visible, so switching
 * apps does not burn the clock or inflate response times.
 *
 * Two clocks, on purpose: requestAnimationFrame drives the bar smoothly, but
 * browsers stop delivering frames whenever a window is not being drawn — even
 * when the page still reports itself visible — so expiry is also guarded by a
 * plain timeout. Without it a card could sit past its limit indefinitely.
 */
export function useCardTimer(durationMs: number, cardKey: string | number | null, active: boolean, onExpire: () => void) {
  const barRef = useRef<HTMLDivElement>(null);
  const accumulated = useRef(0);
  const startedAt = useRef<number | null>(null);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(durationMs / 1000));

  const getElapsed = useCallback(
    () => accumulated.current + (startedAt.current !== null ? performance.now() - startedAt.current : 0),
    [],
  );

  // New card: fresh clock.
  useEffect(() => {
    accumulated.current = 0;
    startedAt.current = null;
    expired.current = false;
    setSecondsLeft(Math.ceil(durationMs / 1000));
    if (barRef.current) barRef.current.style.transform = 'scaleX(1)';
  }, [cardKey, durationMs]);

  useEffect(() => {
    let frame = 0;
    let backstop: ReturnType<typeof setTimeout> | undefined;

    const pause = () => {
      if (startedAt.current !== null) {
        accumulated.current += performance.now() - startedAt.current;
        startedAt.current = null;
      }
      if (backstop) clearTimeout(backstop);
      cancelAnimationFrame(frame);
    };

    if (!active || cardKey === null) {
      pause();
      return;
    }

    const expire = () => {
      if (expired.current) return;
      expired.current = true;
      if (barRef.current) barRef.current.style.transform = 'scaleX(0)';
      setSecondsLeft(0);
      onExpireRef.current();
    };

    const checkBackstop = () => {
      const remaining = durationMs - getElapsed();
      if (remaining <= 0) expire();
      else backstop = setTimeout(checkBackstop, remaining + 5);
    };

    const tick = () => {
      const remaining = Math.max(0, durationMs - getElapsed());
      if (barRef.current) barRef.current.style.transform = `scaleX(${remaining / durationMs})`;
      const seconds = Math.ceil(remaining / 1000);
      setSecondsLeft((prev) => (prev === seconds ? prev : seconds));
      if (remaining <= 0) {
        expire();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const resume = () => {
      if (expired.current || startedAt.current !== null) return;
      startedAt.current = performance.now();
      frame = requestAnimationFrame(tick);
      checkBackstop();
    };

    const onVisibility = () => (document.hidden ? pause() : resume());

    if (!document.hidden) resume();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      pause();
    };
  }, [active, cardKey, durationMs, getElapsed]);

  return { barRef, secondsLeft, getElapsed };
}
