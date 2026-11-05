import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Container,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import AssignmentSharpIcon from '@mui/icons-material/AssignmentSharp';
import BoltSharpIcon from '@mui/icons-material/BoltSharp';
import DashboardSharpIcon from '@mui/icons-material/DashboardSharp';
import EditLocationAltSharpIcon from '@mui/icons-material/EditLocationAltSharp';
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import MapSharpIcon from '@mui/icons-material/MapSharp';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../context/LanguageContext';
import { useContributeCopy } from './copy';
import { readSavedVillage, villagePath } from './village';
import { FOREST, LINE, SURFACE_HOVER, TEXT, TEXT_SOFT, rfFont, squareSegmented } from '../rapidFire/Backdrop';

const NAV = [
  { key: 'dashboard', path: '/mydashboard', Icon: DashboardSharpIcon, match: (p: string) => p === '/mydashboard' },
  { key: 'contribute', path: '/user', Icon: AddBoxSharpIcon, match: (p: string) => p === '/user' || p.startsWith('/user/categories') },
  { key: 'rapid', path: '/user/rapid-fire', Icon: BoltSharpIcon, match: (p: string) => p.startsWith('/user/rapid-fire') },
  { key: 'mine', path: '/user/contributions', Icon: AssignmentSharpIcon, match: (p: string) => p.startsWith('/user/contributions') },
] as const;

const useNavLabels = () => {
  const { t } = useContributeCopy();
  return { dashboard: t.navDashboard, contribute: t.navContribute, rapid: t.navRapidFire, mine: t.navMyContributions };
};

/** Space the shell keeps free under each page, so the last row is never behind the bottom bar. */
export const BOTTOM_NAV_INSET = 'calc(64px + env(safe-area-inset-bottom))';

/** Phone and tablet navigation: always within thumb reach. Inline tabs in the top bar replace it from 900px. */
export const UserBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useContributeCopy();
  // Shorter wording: each tab gets a quarter of a phone's width, as little as 80px.
  const labels = { ...useNavLabels(), rapid: t.navRapidShort, mine: t.navMineShort };
  const [typing, setTyping] = useState(false);

  // The on-screen keyboard pushes fixed bars up over the form, so the bar steps aside while someone types.
  useEffect(() => {
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches('input:not([type=radio]):not([type=checkbox]):not([type=file]), textarea, select');
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  return (
    <Box
      component="nav"
      aria-label="Contributor"
      sx={{
        display: { xs: typing ? 'none' : 'grid', md: 'none' },
        gridTemplateColumns: `repeat(${NAV.length}, minmax(0, 1fr))`,
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: '#fff',
        borderTop: `1px solid ${LINE}`,
        pb: 'env(safe-area-inset-bottom)',
        pl: 'env(safe-area-inset-left)',
        pr: 'env(safe-area-inset-right)',
      }}
    >
      {NAV.map(({ key, path, Icon, match }) => {
        const active = match(pathname);
        return (
          <ButtonBase
            key={key}
            component={RouterLink}
            to={path}
            aria-current={active ? 'page' : undefined}
            sx={{
              minWidth: 0,
              height: 64,
              px: 0.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.25,
              fontFamily: 'inherit',
              color: active ? TEXT : TEXT_SOFT,
              // Drawn inset so the label does not move when a tab becomes active.
              boxShadow: active ? `inset 0 2px 0 ${TEXT}` : 'none',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              '&:active': { bgcolor: SURFACE_HOVER },
              '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: -2 },
            }}
          >
            <Icon sx={{ fontSize: 22, flexShrink: 0 }} />
            <Typography component="span" sx={{ color: 'inherit', fontSize: '0.75rem', fontWeight: active ? 600 : 500, lineHeight: 1.2, textAlign: 'center', overflowWrap: 'anywhere' }}>
              {labels[key]}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

const UserTopBar: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useContributeCopy();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const displayName = userInfo?.name || userInfo?.preferred_username || '';
  const initial = (displayName || '?').charAt(0).toUpperCase();
  const village = readSavedVillage();
  const labels = useNavLabels();

  const go = (path: string, state?: { chooseVillage: boolean }) => {
    setMenuAnchor(null);
    navigate(path, { state });
  };

  return (
    <Box
      component="header"
      sx={{
        ...rfFont,
        // Scrolls away below 900px: the bottom bar already holds the navigation, and the screen is better spent on content.
        position: { xs: 'static', md: 'sticky' },
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: '#fff',
        color: TEXT,
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <Container maxWidth="lg" sx={{ minHeight: 56, display: 'flex', alignItems: 'center', columnGap: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
        <ButtonBase
          onClick={() => navigate('/mydashboard')}
          aria-label="Ceylonica"
          sx={{ height: 56, gap: 1, flexShrink: 0, '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: -2 } }}
        >
          <Box component="img" src="/logo.png" alt="" sx={{ width: 28, height: 28, objectFit: 'contain' }} />
          {/* Very narrow phones: the logo alone, so the 44px language buttons still fit on one row. */}
          <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', '@media (max-width: 359.95px)': { display: 'none' } }}>Ceylonica</Typography>
        </ButtonBase>

        <Box
          component="nav"
          aria-label="Contributor"
          sx={{ display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch', gap: 2.5, ml: 2 }}
        >
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Button
                key={item.key}
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                disableRipple
                sx={{
                  flexShrink: 0,
                  minWidth: 0,
                  minHeight: 44,
                  px: 0,
                  py: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                  textTransform: 'none',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: active ? TEXT : TEXT_SOFT,
                  borderBottom: `2px solid ${active ? TEXT : 'transparent'}`,
                  transition: 'color 120ms ease',
                  '&:hover': { transform: 'none', boxShadow: 'none', bgcolor: 'transparent', color: TEXT },
                  '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: -2 },
                }}
              >
                {labels[item.key]}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />

        <ToggleButtonGroup
          size="small"
          exclusive
          value={language}
          onChange={(_, value) => value && setLanguage(value)}
          aria-label="Language"
          sx={{ ...squareSegmented, '& .MuiToggleButtonGroup-grouped': { ...squareSegmented['& .MuiToggleButtonGroup-grouped'], minHeight: { xs: 44, md: 32 }, minWidth: { xs: 44, md: 0 }, px: { xs: 0.5, md: 1 }, fontSize: '0.75rem' } }}
        >
          <ToggleButton value="si">සිං</ToggleButton>
          <ToggleButton value="ta">த</ToggleButton>
          <ToggleButton value="en">EN</ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={displayName || 'Account'} slotProps={{ tooltip: { sx: { borderRadius: 0 } } }}>
          <ButtonBase
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={Boolean(menuAnchor)}
            sx={{ width: 44, height: 44, mr: -0.75, flexShrink: 0, '&:focus-visible': { outline: `2px solid ${FOREST}`, outlineOffset: -2 } }}
          >
            <Avatar variant="square" sx={{ width: 32, height: 32, bgcolor: TEXT, fontSize: '0.875rem', fontWeight: 600 }}>{initial}</Avatar>
          </ButtonBase>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { ...rfFont, mt: 1, minWidth: 250, borderRadius: 0, border: `1px solid ${LINE}`, boxShadow: '0 8px 24px rgba(16,24,20,0.12)', '& .MuiMenuItem-root': { minHeight: 44, fontFamily: 'inherit', '&:hover': { bgcolor: SURFACE_HOVER } } } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT }} noWrap>
              {displayName}
            </Typography>
            {userInfo?.email && (
              <Typography variant="caption" noWrap sx={{ display: 'block', color: TEXT_SOFT }}>
                {userInfo.email}
              </Typography>
            )}
          </Box>
          <Divider />
          {village && (
            <MenuItem onClick={() => go(villagePath(village))}>
              <ListItemIcon>
                <MapSharpIcon fontSize="small" />
              </ListItemIcon>
              {t.navHome}
            </MenuItem>
          )}
          <MenuItem onClick={() => go('/user', { chooseVillage: true })}>
            <ListItemIcon>
              <EditLocationAltSharpIcon fontSize="small" />
            </ListItemIcon>
            {t.navChangeRegion}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => logout()} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutSharpIcon fontSize="small" />
            </ListItemIcon>
            {t.navLogout}
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default UserTopBar;
