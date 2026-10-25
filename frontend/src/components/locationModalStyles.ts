// Shared look for both "Select Your Location" popups: frosted dark-green glass card with the
// Sri Lanka relief map blended in behind the fields, outlined inputs and a solid green CTA.
const forest = '#2d5e41';
const pop = 'clamp(45px, 9.6vh, 102px)'; // how far the map rises above the card; also the card's top margin so it is never clipped

export const locationPaperSx = {
  isolation: 'isolate',
  overflow: 'visible', // the map pops out; the Dialog uses scroll="body" so tall content scrolls the page, not this card
  width: 'min(352px, calc(100vw - 32px))',
  minWidth: 0,
  maxWidth: 'none',
  mt: `calc(${pop} + env(safe-area-inset-top))`,
  mr: 'max(16px, env(safe-area-inset-right))',
  mb: 'max(16px, env(safe-area-inset-bottom))',
  ml: 'max(16px, env(safe-area-inset-left))',
  color: '#fff',
  // Poppins has no Sinhala/Tamil glyphs, so those fall back to the Noto fonts already loaded.
  '& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-root, & .MuiInputLabel-root, & .MuiAlert-root': {
    fontFamily: "'Poppins', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif !important",
    textShadow: '0 2px 6px rgba(0,0,0,0.55)',
  },
  // Liquid glass: near-transparent, strongly blurred and saturated, bright edge highlights.
  background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.1) 100%)',
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
    pointerEvents: 'none',
  },
};

export const locationHeaderSx = (_isDarkMode?: boolean) => ({
  pt: { xs: 2.1, sm: 2.8 },
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
    pt: 2.5,
    '& img': { height: 'clamp(38px, 5.8vh, 50px) !important' },
    '& .MuiTypography-h6': { fontSize: 'clamp(1.15rem, 3.5vh, 1.45rem)', pb: 1 },
  },
  // Short viewports (phones in landscape): drop the subtitle and shrink the logo so the fields stay reachable.
  '@media (max-height: 560px)': {
    pt: 2,
    '& img': { height: '38px !important' },
    '& .MuiTypography-h6': { fontSize: '1.2rem', pb: 1 },
    '& .MuiTypography-caption': { display: 'none' },
  },
});

export const locationBodySx = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: { xs: 2.1, sm: 2.4 },
  pt: { xs: 2.5, sm: 3.2 },
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
    fontSize: { xs: '0.95rem', sm: '0.82rem' },
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
  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' },
  transition: 'background-color 0.2s',
});
