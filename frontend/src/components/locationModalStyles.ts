import { useLayoutEffect, useState } from 'react';

// Shared look for both "Select Your Location" popups: frosted dark-green glass card with the
// Sri Lanka relief map blended in behind the fields, outlined inputs and a solid green CTA.
const forest = '#2d5e41';
const pop = 'clamp(45px, 9.6vh, 102px)'; // how far the map rises above the card; also the card's top margin so it is never clipped

export const locationPaperSx = {
  isolation: 'isolate',
  overflow: 'visible', // the map pops out; the Dialog uses scroll="body" so tall content scrolls the page, not this card
  // Wordmark size, also used to reserve room above the card and below its top edge. Scales with the phone's width;
  // short screens (landscape phones) get a smaller one so it never runs into the logo.
  '--wm': 'clamp(36px, 13.5vw, 56px)',
  '@media (min-width: 600px)': { '--wm': '74px' },
  '@media (max-height: 560px)': { '--wm': '44px' },
  width: 'min(352px, calc(100vw - 24px))',
  minWidth: 0,
  // !important: MUI's scroll="body" paper caps itself at calc(100% - 64px) on small screens, which left a 256px card
  // with 32px gutters on a 320px phone.
  maxWidth: 'none !important',
  mt: `calc(max(${pop}, var(--wm) * 0.9) + env(safe-area-inset-top))`,
  mr: 'max(12px, env(safe-area-inset-right))',
  mb: 'max(16px, env(safe-area-inset-bottom))',
  ml: 'max(12px, env(safe-area-inset-left))',
  color: '#fff',
  // Poppins has no Sinhala/Tamil glyphs, so those fall back to the Noto fonts already loaded.
  '& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-root, & .MuiInputLabel-root, & .MuiAlert-root': {
    fontFamily: "'Poppins', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif !important",
    textShadow: '0 2px 6px rgba(0,0,0,0.55)',
  },
  // Liquid glass: near-transparent, strongly blurred and saturated, bright edge highlights.
  // A light forest tint under the glass keeps the white text readable over the brightest parts of the map.
  background: 'linear-gradient(135deg, rgba(16,44,34,0.45) 0%, rgba(16,44,34,0.32) 55%, rgba(16,44,34,0.42) 100%)',
  backdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: { xs: '16px', sm: '19px' },
  '@media (max-width: 600px)': { backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)' },
  // Without backdrop-filter the glass would be see-through text on the page, so use a solid tint.
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': { background: 'rgba(16,44,34,0.94)' },
  boxShadow: '0 28px 70px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.65), inset 0 -1px 1px rgba(255,255,255,0.18), inset 0 0 40px rgba(255,255,255,0.06)',
  // Full card height, static, poking out past the right edge (and slightly top/bottom) like the leaf in the reference.
  '&::before': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    // Sized from the card's width (not height) so it keeps its proportions whatever the card's content height.
    width: { xs: '82%', sm: '113%' },
    right: { xs: '-16%', sm: '-46%' },
    top: `calc(${pop} * -1)`,
    aspectRatio: '1155 / 1899',
    backgroundImage: 'url("/mapgeo-v2.webp")',
    backgroundSize: '100% 100%',
    filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.5))',
    // Faded so it sits behind the form as atmosphere; at full strength it drowned out the labels and fields.
    opacity: 0.35,
    pointerEvents: 'none',
  },
  // "CEYLONICA" wordmark, layered like the iOS lock-screen clock: over the card's glass but under the island (z -2 vs
  // the map's -1 inside this isolated stack), so the map's top overlaps the letters and their foot fades into the card.
  '&::after': {
    content: '"CEYLONICA"',
    position: 'absolute',
    zIndex: -2,
    left: '50%',
    // Straddles the card's top edge (the foot of the letters inside it), as the clock sits into the photo.
    top: 'calc(var(--wm) * -0.8)',
    width: 'max-content',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800,
    fontSize: 'var(--wm)',
    lineHeight: 1,
    letterSpacing: '-0.035em',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    // Text filled with a soft white-to-mint sheen that drifts across the letters like a breeze.
    color: 'transparent',
    backgroundImage:
      'linear-gradient(105deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.92) 38%, rgba(214,255,228,1) 48%, rgba(255,255,255,1) 52%, rgba(255,255,255,0.92) 62%, rgba(255,255,255,0.92) 100%)',
    backgroundSize: '260% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    // The foot of the letters dissolves into the glass, so the word reads as part of the card, not stuck on top.
    WebkitMaskImage: 'linear-gradient(to bottom, #000 58%, rgba(0,0,0,0.55) 100%)',
    maskImage: 'linear-gradient(to bottom, #000 58%, rgba(0,0,0,0.55) 100%)',
    filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.35))',
    transform: 'translateX(-50%)',
    '@keyframes ceyIn': {
      from: { opacity: 0, letterSpacing: '0.18em', filter: 'blur(10px) drop-shadow(0 6px 18px rgba(0,0,0,0.35))' },
      to: { opacity: 1, letterSpacing: '-0.035em', filter: 'blur(0) drop-shadow(0 6px 18px rgba(0,0,0,0.35))' },
    },
    '@keyframes ceyBreeze': {
      '0%': { transform: 'translateX(-50%) translateY(0) skewX(0deg)' },
      '50%': { transform: 'translateX(calc(-50% + 3px)) translateY(-2px) skewX(-1.2deg)' },
      '100%': { transform: 'translateX(calc(-50% - 2px)) translateY(1px) skewX(0.8deg)' },
    },
    '@keyframes ceySheen': {
      from: { backgroundPosition: '100% 0' },
      to: { backgroundPosition: '-100% 0' },
    },
    animation:
      'ceyIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) both, ceyBreeze 7s ease-in-out 1.1s infinite alternate, ceySheen 6.5s linear 0.6s infinite',
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
};

export const locationHeaderSx = (_isDarkMode?: boolean) => ({
  // Clears the foot of the wordmark that sits inside the card's top edge.
  pt: 'calc(var(--wm, 0px) * 0.22 + 12px)',
  pb: 0,
  px: { xs: 2.1, sm: 2.8 },
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 1,
  // Logo is shown as-is: no tile, no backing circle.
  '& > div:has(> img)': { display: 'inline-flex', mb: 1.5 },
  '& img': { height: 'clamp(42px, 14vw, 56px) !important', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))' },
  '& .MuiTypography-root': { textAlign: 'left', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  '& .MuiTypography-h6': {
    fontSize: 'clamp(1.2rem, 5.2vw, 1.6rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    pb: 1.5,
    alignSelf: 'stretch',
    borderBottom: '1px solid rgba(255,255,255,0.3)',
  },
  '& .MuiTypography-caption': { color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(0.68rem, 2.4vw, 0.74rem)', pt: 0.5 },
  '@media (max-height: 900px)': {
    '& img': { height: 'clamp(38px, 5.8vh, 50px) !important' },
    '& .MuiTypography-h6': { fontSize: 'clamp(1.15rem, 3.5vh, 1.45rem)', pb: 1 },
  },
  // Short viewports (phones in landscape): drop the subtitle and shrink the logo so the fields stay reachable.
  '@media (max-height: 560px)': {
    '& img': { height: '38px !important' },
    '& .MuiTypography-h6': { fontSize: '1.2rem', pb: 1 },
    '& .MuiTypography-caption': { display: 'none' },
  },
});

export const locationBodySx = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: { xs: 1.6, sm: 2.4 },
  pt: { xs: 2, sm: 3.2 },
  pb: 1.6,
  px: { xs: 2.1, sm: 2.8 },
  '@media (max-height: 900px)': { pt: 2.5, gap: 2.2 },
  '@media (max-height: 560px)': { pt: 2, gap: 2 },
  '& .MuiTypography-root': { color: '#f0fff6' },
  '& .MuiTypography-body2, & .MuiTypography-caption': { color: 'rgba(240,255,246,0.8)' },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    borderRadius: '6px',
    bgcolor: 'rgba(255,255,255,0.08)',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.9)' },
    '&:hover fieldset': { borderColor: '#fff' },
    '&.Mui-focused fieldset': { borderColor: '#fff', borderWidth: 2 },
    '& input::placeholder': { color: 'rgba(255,255,255,0.65)', opacity: 1 },
    '& .MuiSvgIcon-root, & .MuiIconButton-root': { color: '#fff' },
    '& .MuiInputBase-input': { fontSize: { xs: '1rem', sm: '0.85rem' } }, // 16px minimum: smaller makes iOS Safari zoom on focus
    // Phones and other touch screens: 48px fields and 40px arrow targets, without the default 56px eating the screen.
    '@media (max-width: 599.95px), (pointer: coarse)': {
      '& .MuiInputBase-input': { paddingTop: '12px !important', paddingBottom: '12px !important' },
      '&.MuiAutocomplete-inputRoot': { paddingTop: '3px !important', paddingBottom: '3px !important' },
      '&.MuiAutocomplete-inputRoot .MuiAutocomplete-input': { paddingTop: '9px !important', paddingBottom: '9px !important' },
      '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': { p: '8px' },
    },
    '@media (min-width: 600px)': {
      '& .MuiInputBase-input': { paddingTop: '12.5px !important', paddingBottom: '12.5px !important' },
      '&.MuiAutocomplete-inputRoot': { paddingTop: '5px !important', paddingBottom: '5px !important' },
      '&.MuiAutocomplete-inputRoot .MuiAutocomplete-input': { paddingTop: '7px !important', paddingBottom: '7px !important' },
    },
  },
  '& .MuiDivider-root::before, & .MuiDivider-root::after': { borderColor: 'rgba(255,255,255,0.45)' },
  '& .MuiButton-outlined': {
    alignSelf: 'stretch',
    minHeight: { xs: 44, sm: 40 }, // 44px touch target on phones
    py: 1.1,
    fontSize: { xs: '0.92rem', sm: '0.82rem' },
    whiteSpace: 'nowrap',
    color: '#fff',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '6px',
    borderColor: 'rgba(255,255,255,0.9)',
    bgcolor: 'rgba(0,0,0,0.2)',
    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
  },
};

export const locationContinueSx = (_enabled: boolean) => ({
  width: '100%',
  minHeight: { xs: 44, sm: 40 },
  py: 1.1,
  borderRadius: '6px',
  bgcolor: forest,
  color: '#fff',
  fontWeight: 700,
  fontFamily: "'Inter', sans-serif",
  fontSize: { xs: '1rem', sm: '0.88rem' },
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#37754f', boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.7)' },
  transition: 'background-color 0.2s',
});

/**
 * Scales the location popup (wordmark, map and form together, via CSS zoom) so all of it, Continue button included,
 * fits the screen height without scrolling. Never below MIN_FIT so text stays legible; a screen shorter than that
 * still scrolls. Returns a ref callback for the Dialog paper.
 */
const MIN_FIT = 0.62;
export function useFitToViewport(open: boolean) {
  const [paper, setPaper] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!paper || !open) return;
    const fit = () => {
      // An open phone keyboard shrinks the viewport; re-scaling then would shrink the form under the user's finger.
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && paper.contains(active)) return;
      const zoom = parseFloat(paper.style.zoom) || 1;
      const cs = getComputedStyle(paper);
      // Unzoomed height of the card plus the room reserved above it (wordmark, map) and below it.
      const needed = paper.getBoundingClientRect().height / zoom + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      const scale = Math.max(MIN_FIT, Math.min(1, window.innerHeight / needed));
      const next = scale > 0.995 ? '' : scale.toFixed(3);
      if (paper.style.zoom !== next) paper.style.zoom = next;
    };
    fit();
    const ro = new ResizeObserver(fit); // content changes (GPS result, manual mode, language)
    ro.observe(paper);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
      paper.style.zoom = '';
    };
  }, [paper, open]);
  return setPaper;
}
