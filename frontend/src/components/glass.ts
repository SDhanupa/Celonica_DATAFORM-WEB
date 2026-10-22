// Liquid-glass surfaces for everything that floats over the live village map (gnpage, mobile map view).

/** Solid colour to fade scroll edges into; close to the glass tint so the fade reads as part of the card. */
export const glassEdge = (isDark: boolean) => (isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.7)');

// Without backdrop-filter the map would show through behind text, so fall back to near-opaque.
// Uses `background` (not bgcolor) so it also replaces the gradient below.
const noBlurFallback = (isDark: boolean) => ({
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.96)',
  },
});

export const glassSx = (isDark: boolean) => ({
  background: isDark
    ? 'linear-gradient(135deg, rgba(30,41,59,0.72) 0%, rgba(15,23,42,0.58) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
  border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.7)',
  // Bright top rim + soft inner glow is what makes it read as liquid glass rather than a flat tint.
  boxShadow: isDark
    ? '0 16px 40px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.14), inset 0 0 24px rgba(255,255,255,0.04)'
    : '0 16px 40px rgba(15,23,42,0.16), inset 0 1px 1px rgba(255,255,255,0.95), inset 0 -1px 1px rgba(255,255,255,0.35), inset 0 0 24px rgba(255,255,255,0.22)',
  ...noBlurFallback(isDark),
});

/** Inner tiles inside a glass panel: lighter glass, no blur of their own. */
export const glassTileSx = (isDark: boolean) => ({
  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.5)',
  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
  boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.95)',
});
