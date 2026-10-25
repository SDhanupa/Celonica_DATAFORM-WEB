import { useEffect, useState, type RefObject } from 'react';
import type { MapInsets } from './VillageMap';

/** Insets plus the container's width, so callers can size things that live in the uncovered lane. */
export type OverlayInsets = MapInsets & { width: number };

const ZERO: OverlayInsets = { top: 0, right: 0, bottom: 0, left: 0, width: 0 };

/**
 * How much of a full-bleed background map is covered by overlay panels, measured from the panels' real
 * boxes so it stays correct across breakpoints, font sizes and content changes.
 * top: bottom edge of `top`; left: right edge of `left`; right: distance from `right`'s left edge to the
 * container's right edge; bottom: distance from `bottom`'s top edge to the container's bottom. Missing panels count as 0.
 */
export function useOverlayInsets(
  container: RefObject<HTMLElement | null>,
  panels: {
    top?: RefObject<HTMLElement | null>;
    left?: RefObject<HTMLElement | null>;
    right?: RefObject<HTMLElement | null>;
    bottom?: RefObject<HTMLElement | null>;
  },
  layoutKey: unknown,
): OverlayInsets {
  const [insets, setInsets] = useState<OverlayInsets>(ZERO);

  useEffect(() => {
    const box = container.current;
    if (!box) return;

    const measure = () => {
      const c = box.getBoundingClientRect();
      const t = panels.top?.current?.getBoundingClientRect();
      const l = panels.left?.current?.getBoundingClientRect();
      const r = panels.right?.current?.getBoundingClientRect();
      const b = panels.bottom?.current?.getBoundingClientRect();
      const next: OverlayInsets = {
        width: Math.round(c.width),
        top: t ? Math.max(0, Math.round(t.bottom - c.top)) : 0,
        left: l ? Math.max(0, Math.round(l.right - c.left)) : 0,
        right: r ? Math.max(0, Math.round(c.right - r.left)) : 0,
        bottom: b ? Math.max(0, Math.round(c.bottom - b.top)) : 0,
      };
      setInsets((prev) =>
        prev.top === next.top && prev.left === next.left && prev.right === next.right && prev.bottom === next.bottom && prev.width === next.width ? prev : next,
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    [box, panels.top?.current, panels.left?.current, panels.right?.current, panels.bottom?.current].forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
    // Refs are stable; layoutKey re-subscribes when panels mount or unmount (breakpoint changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey]);

  return insets;
}
