/**
 * Monochromatic design tokens for the contributor experience (/user, contribute,
 * rapid fire). One neutral ink scale, white/grey surfaces, hairline borders and a
 * single near-black accent for primary actions and focus. Colour is used only
 * where meaning depends on it (errors), never for decoration or category identity.
 *
 * Everything in this surface reads from here, so the whole look retunes from one
 * place. Kept independent of the global MUI theme so the admin screens are untouched.
 */

export const ink = {
  900: '#0A0C0F', // near-black — primary text, primary action
  800: '#16191D',
  700: '#3A4048', // strong body text
  600: '#565D66',
  500: '#727982', // secondary text
  400: '#9AA0A8', // muted text / disabled
  300: '#C4C9CF', // strong border
  200: '#E4E7EA', // hairline border
  100: '#F0F2F4', // subtle fill / track
  50: '#F7F8F9', // page background wash
} as const;

export const surface = {
  page: '#FBFBFC',
  card: '#FFFFFF',
  muted: '#F5F6F8',
  inverse: '#0A0C0F', // dark surface (rapid-fire stage)
} as const;

// Functional colours — used only where the meaning is the colour.
export const semantic = {
  danger: '#C0362C',
  dangerSoft: 'rgba(192, 54, 44, 0.08)',
} as const;

/** A single hairline card. The default surface for the whole experience. */
export const card = {
  bgcolor: surface.card,
  border: '1px solid',
  borderColor: ink[200],
  borderRadius: '12px',
} as const;

export const radius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  pill: '999px',
} as const;

/** Primary action: solid ink. */
export const inkButton = {
  bgcolor: ink[900],
  color: '#fff',
  boxShadow: 'none',
  textTransform: 'none' as const,
  fontWeight: 600,
  borderRadius: radius.md,
  '&:hover': { bgcolor: ink[700], boxShadow: 'none', transform: 'none' },
  '&.Mui-disabled': { bgcolor: ink[200], color: ink[400] },
} as const;

/** Secondary action: hairline ghost. */
export const ghostButton = {
  bgcolor: 'transparent',
  color: ink[700],
  border: '1px solid',
  borderColor: ink[200],
  boxShadow: 'none',
  textTransform: 'none' as const,
  fontWeight: 600,
  borderRadius: radius.md,
  '&:hover': { bgcolor: ink[50], borderColor: ink[300], boxShadow: 'none', transform: 'none' },
} as const;

/** Tertiary action: quiet text button. */
export const quietButton = {
  bgcolor: 'transparent',
  color: ink[600],
  boxShadow: 'none',
  textTransform: 'none' as const,
  fontWeight: 600,
  '&:hover': { bgcolor: ink[100], boxShadow: 'none', transform: 'none' },
} as const;

/** Visible focus ring for keyboard users, monochrome. */
export const focusRing = {
  '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
} as const;

export const reducedMotion = {
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none !important',
    animation: 'none !important',
    '&:hover': { transform: 'none' },
  },
} as const;
