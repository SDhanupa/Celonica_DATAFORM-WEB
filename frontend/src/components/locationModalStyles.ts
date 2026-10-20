// Shared look for both "Select Your Location" popups: frosted dark-green glass card with the
// Sri Lanka relief map blended in behind the fields, outlined inputs and a solid green CTA.
const forest = '#2d5e41';

export const locationPaperSx = {
  isolation: 'isolate',
  overflow: 'visible',
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
  borderRadius: '24px',
  boxShadow: '0 28px 70px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.65), inset 0 -1px 1px rgba(255,255,255,0.18), inset 0 0 40px rgba(255,255,255,0.06)',
  // Full card height, static, poking out past the right edge (and slightly top/bottom) like the leaf in the reference.
  '&::before': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    top: '-26%',
    height: '130%',
    right: '-46%',
    aspectRatio: '1213 / 2000',
    backgroundImage: 'url("/mapgeo.webp")',
    backgroundSize: '100% 100%',
    filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.5))',
    pointerEvents: 'none',
  },
};

export const locationHeaderSx = (_isDarkMode?: boolean) => ({
  pt: 3.5,
  pb: 0,
  px: 3.5,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 1,
  // Logo is shown as-is: no tile, no backing circle.
  '& > div:has(> img)': { display: 'inline-flex', mb: 1.5 },
  '& img': { height: '76px !important', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))' },
  '& .MuiTypography-root': { textAlign: 'left', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  '& .MuiTypography-h6': {
    fontSize: '2.1rem',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    pb: 1.5,
    alignSelf: 'stretch',
    borderBottom: '1px solid rgba(255,255,255,0.3)',
  },
  '& .MuiTypography-caption': { color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', pt: 0.5 },
});

export const locationBodySx = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 3,
  pt: 4,
  pb: 2,
  px: 3.5,
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
  },
  '& .MuiDivider-root::before, & .MuiDivider-root::after': { borderColor: 'rgba(255,255,255,0.45)' },
  '& .MuiButton-outlined': {
    alignSelf: 'stretch',
    py: 1.5,
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
  py: 1.5,
  borderRadius: '6px',
  bgcolor: forest,
  color: '#fff',
  fontWeight: 700,
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.05rem',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#37754f', boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)' },
  transition: 'background-color 0.2s',
});
