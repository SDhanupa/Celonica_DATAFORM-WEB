// Liquid-glass surfaces for everything that floats over the live village map (gnpage, mobile map view).

/** Solid colour to fade scroll edges into; close to the glass tint so the fade reads as part of the card. */
export const glassEdge = (isDark: boolean) => (isDark ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.45)');

// Without backdrop-filter the map would show through behind text, so fall back to near-opaque.
// Uses `background` (not bgcolor) so it also replaces the gradient below.
const noBlurFallback = (isDark: boolean) => ({
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.96)',
  },
});

// Clear liquid glass (iOS style): mostly see-through, the map behind lifted with brightness + saturation so dark
// grey secondary text stays readable over dark terrain. A light 10px blur keeps the per-frame cost low over the
// moving 3D map (60 fps measured while panning) and smooths busy imagery behind text.
export const glassSx = (isDark: boolean) => ({
  background: isDark
    ? 'linear-gradient(160deg, rgba(30,41,59,0.42) 0%, rgba(15,23,42,0.22) 55%, rgba(30,41,59,0.34) 100%)'
    : 'linear-gradient(160deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.4) 55%, rgba(255,255,255,0.5) 100%)',
  backdropFilter: isDark ? 'blur(10px) saturate(180%) brightness(0.85)' : 'blur(10px) saturate(180%) brightness(1.45)',
  WebkitBackdropFilter: isDark ? 'blur(10px) saturate(180%) brightness(0.85)' : 'blur(10px) saturate(180%) brightness(1.45)',
  border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.55)',
  // Specular rim (bright top/left edge, soft bottom) is what makes clear glass read as glass.
  boxShadow: isDark
    ? '0 12px 32px rgba(0,0,0,0.4), inset 0 1.5px 0.5px rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 1px rgba(255,255,255,0.06)'
    : '0 12px 32px rgba(15,23,42,0.18), inset 0 1.5px 0.5px rgba(255,255,255,0.95), inset 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 1px rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.12)',
  ...noBlurFallback(isDark),
});

/** Inner tiles inside a glass panel: lighter glass, no blur of their own. */
export const glassTileSx = (isDark: boolean) => ({
  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.45)',
  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)',
  boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.95)',
});
