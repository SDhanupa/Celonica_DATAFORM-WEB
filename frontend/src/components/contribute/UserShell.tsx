import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../auth/AuthProvider';
import { GET_ME } from '../../graphql/queries';
import OnboardingModal from '../OnboardingModal';
import UserTopBar, { BOTTOM_NAV_INSET, UserBottomNav } from './UserTopBar';
import { CANVAS, FOREST, FOREST_DEEP, LINE, rfFont, scaledSx, TEXT, TEXT_SOFT, UI_SCALE } from '../rapidFire/Backdrop';

/** RapidFirePage hides the top bar during a round, so a stray tap cannot leave the game. */
export interface UserShellContext {
  setFocusMode: (on: boolean) => void;
}

const flat = { borderRadius: 0, boxShadow: 'none' };

// Square, flat and green for everything inside the dashboard, popups included, without touching the admin or public pages.
const contributorTheme = (outer: Theme) =>
  createTheme(outer, {
    shape: { borderRadius: 0 },
    palette: {
      primary: { main: FOREST, dark: FOREST_DEEP, light: FOREST, contrastText: '#fff' },
      text: { primary: TEXT, secondary: TEXT_SOFT },
    },
    typography: { body1: { color: TEXT }, body2: { color: TEXT } },
    components: {
      MuiButton: { styleOverrides: { root: { ...flat, fontWeight: 600, '&:hover': { boxShadow: 'none', transform: 'none' } } } },
      MuiPaper: { styleOverrides: { root: { ...rfFont, borderRadius: 0 } } },
      MuiCard: { styleOverrides: { root: { ...flat, border: `1px solid ${LINE}` } } },
      // Popups render outside the shell, so they take the scale here. Menus and dropdowns scale their contents only:
      // MUI positions the outer layer in screen pixels, and zooming it would move it away from its anchor.
      MuiDialog: { styleOverrides: { paper: { ...flat, ...scaledSx, border: `1px solid ${TEXT}` } } },
      MuiMenu: { styleOverrides: { list: scaledSx } },
      MuiAutocomplete: {
        styleOverrides: {
          // The dropdown takes its width from the zoomed field's unzoomed width and is centred on the field, so it comes back to size in the middle.
          paper: { '@media (min-width: 900px)': { width: `${UI_SCALE * 100}%`, marginLeft: 'auto', marginRight: 'auto' } },
          listbox: scaledSx,
          noOptions: scaledSx,
          loading: scaledSx,
        },
      },
      // 16px, because iPhones zoom the whole page when a smaller field takes focus.
      MuiInputBase: { styleOverrides: { root: { fontSize: '1rem' } } },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 0 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 0 } } },
      MuiSkeleton: { styleOverrides: { root: { borderRadius: 0 } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 0 } } },
    },
  });

const watermarkIn = keyframes`
  from { opacity: 0; }
`;

// Stays put while the page scrolls. Lighter on phones, where text runs across the whole map.
const watermark = {
  position: 'fixed',
  inset: 0,
  zIndex: -1,
  pointerEvents: 'none',
  backgroundImage: 'url(/Mapwm.png)',
  backgroundRepeat: 'no-repeat',
  // 1080px is the 1200px content column at the dashboard's scale.
  backgroundPosition: { xs: 'right -64px bottom 48px', md: 'right max(16px, calc((100vw - 1080px) / 2 - 86px)) bottom 0' },
  // Capped because the source is 688px tall and turns soft when enlarged much further.
  backgroundSize: { xs: 'auto 70dvh', md: 'auto min(88dvh, 774px)' },
  opacity: { xs: 0.4, md: 0.55 },
  animation: `${watermarkIn} 900ms ease-out both`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

/**
 * The contributor dashboard: one guard, one top bar and one page style for every page in it.
 * Staff have their own consoles. The API still checks every request; this only routes people.
 */
const UserShell: React.FC = () => {
  const { userInfo } = useAuth();
  const { pathname } = useLocation();
  const [focusMode, setFocusMode] = useState(false);
  const roles = userInfo?.realm_roles || [];
  const isSuperAdmin = roles.includes('super_admin');
  const isStaff = isSuperAdmin || roles.includes('admin') || roles.includes('moderator');

  const { data, refetch } = useQuery(GET_ME, {
    errorPolicy: 'ignore',
    fetchPolicy: 'network-only',
    skip: isStaff,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isSuperAdmin) return <Navigate to="/admins" replace />;
  if (isStaff) return <Navigate to="/users" replace />;

  return (
    <ThemeProvider theme={contributorTheme}>
      <Box sx={{ ...rfFont, minHeight: '100dvh', overflowX: 'clip', isolation: 'isolate', bgcolor: CANVAS, color: TEXT, '& ::selection': { bgcolor: FOREST, color: '#fff' } }}>
        <Box aria-hidden sx={watermark} />
        <OnboardingModal open={data?.needsOnboarding === true} onComplete={() => refetch()} />
        <Box sx={{ ...scaledSx, pb: { xs: focusMode ? 0 : BOTTOM_NAV_INSET, md: 0 } }}>
          {!focusMode && <UserTopBar />}
          {/* Inside the shell, so the top bar stays put while a page's code loads. */}
          <React.Suspense fallback={null}>
            <Outlet context={{ setFocusMode } satisfies UserShellContext} />
          </React.Suspense>
        </Box>
        {!focusMode && <UserBottomNav />}
      </Box>
    </ThemeProvider>
  );
};

export default UserShell;
