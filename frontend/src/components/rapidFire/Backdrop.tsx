// Shared look of the contributor dashboard: pale green page, hairline rules instead of cards, near-black text,
// Poppins, square corners, and the brand green as the only accent.
export const CANVAS = '#f1faee';
export const LINE = '#E3E6E1';
export const TEXT = '#101814';
export const TEXT_SOFT = '#4B5650';
export const FOREST = '#2d5e41';
export const FOREST_DEEP = '#1f4530';
export const WARNING = '#B45309';
export const DANGER = '#B91C1C';
export const SURFACE_HOVER = 'rgba(16,24,20,0.05)';

/** Dashboard scale from md up. Phones and tablets stay at 100%: touch targets and 16px inputs must not shrink. */
export const UI_SCALE = 0.9;
export const scaledSx = { '@media (min-width: 900px)': { zoom: UI_SCALE } };

const focusRing = { '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: 2 } };

export const squareButton = {
  bgcolor: FOREST,
  color: '#fff',
  boxShadow: 'none',
  borderRadius: 0,
  minHeight: 48,
  px: 2.5,
  fontWeight: 600,
  textTransform: 'none',
  transition: 'background-color 120ms ease',
  '&:hover': { bgcolor: FOREST_DEEP, boxShadow: 'none', transform: 'none' },
  '&.Mui-disabled': { bgcolor: 'rgba(16,24,20,0.1)', color: 'rgba(16,24,20,0.4)' },
  ...focusRing,
};

export const squareOutlineButton = {
  borderRadius: 0,
  minHeight: 48,
  px: 2.5,
  bgcolor: 'transparent',
  color: TEXT,
  border: `1px solid ${TEXT_SOFT}`,
  boxShadow: 'none',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'background-color 120ms ease',
  '&:hover': { bgcolor: SURFACE_HOVER, border: `1px solid ${TEXT}`, boxShadow: 'none', transform: 'none' },
  ...focusRing,
};

export const quietButton = {
  minHeight: 48,
  borderRadius: 0,
  px: 1.5,
  fontWeight: 600,
  textTransform: 'none',
  color: TEXT,
  boxShadow: 'none',
  '&:hover': { bgcolor: SURFACE_HOVER, boxShadow: 'none', transform: 'none' },
  ...focusRing,
};

export const textLink = {
  p: 0,
  minHeight: 44,
  color: TEXT,
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 600,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  '&:hover': { textDecorationThickness: '2px' },
  ...focusRing,
};

export const sectionRule = { pt: 2, borderTop: `2px solid ${TEXT}` };

/** One row of a ruled list. */
export const rowSx = {
  width: '100%',
  minHeight: 64,
  px: 1,
  py: 1.5,
  textAlign: 'left',
  fontFamily: 'inherit',
  borderTop: `1px solid ${LINE}`,
  transition: 'background-color 120ms ease',
  // Hover only where it exists: on touch screens it would stay stuck on the last row tapped.
  '@media (hover: hover)': { '&:hover': { bgcolor: SURFACE_HOVER } },
  '&:active': { bgcolor: SURFACE_HOVER },
  touchAction: 'manipulation',
  '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: -2 },
};

/** Tight tracking only suits Latin; Sinhala and Tamil need the room. */
export const pageTitleSx = (language: string) => ({
  color: TEXT,
  fontWeight: 700,
  fontSize: { xs: '1.875rem', sm: '2.5rem', md: '3.5rem' },
  letterSpacing: language === 'en' ? '-0.03em' : 0,
  lineHeight: language === 'en' ? 1.15 : 1.3,
  textWrap: 'balance',
});

export const sectionTitleSx = (language: string) => ({
  color: TEXT,
  fontWeight: 700,
  fontSize: { xs: '1.5rem', md: '1.75rem' },
  letterSpacing: language === 'en' ? '-0.02em' : 0,
  lineHeight: language === 'en' ? 1.25 : 1.35,
});

export const squareSegmented = {
  gap: 0,
  borderRadius: 0,
  border: `1px solid ${LINE}`,
  '& .MuiToggleButtonGroup-grouped': {
    border: 0,
    borderRadius: '0 !important',
    m: '0 !important',
    px: 1.5,
    minHeight: 44,
    fontFamily: 'inherit',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: TEXT_SOFT,
    transition: 'background-color 120ms ease, color 120ms ease',
    '&:hover': { bgcolor: SURFACE_HOVER, color: TEXT },
    '&.Mui-selected, &.Mui-selected:hover': { bgcolor: TEXT, color: '#fff' },
    '&.Mui-disabled': { border: 0, color: 'rgba(16,24,20,0.45)' },
    ...focusRing,
  },
};

const FONT = "'Poppins', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif";

/** Poppins on every text element of a dashboard screen (Sinhala/Tamil fall back to Noto). */
export const rfFont = {
  fontFamily: FONT,
  '& .MuiTypography-root, & .MuiButton-root, & .MuiChip-root, & .MuiAlert-root, & .MuiInputBase-root, & .MuiFormLabel-root, & .MuiFormHelperText-root, & .MuiMenuItem-root, & .MuiAutocomplete-option, & .MuiAutocomplete-noOptions': {
    fontFamily: FONT,
  },
};
