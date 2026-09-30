import React, { useState } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../context/LanguageContext';
import { useContributeCopy } from './copy';
import { readSavedVillage, villagePath } from './village';
import { ink } from './tokens';

interface UserTopBarProps {
  onChangeVillage?: () => void;
}

const NAV = [
  { key: 'contribute', path: '/user', match: (p: string) => p === '/user' || p.startsWith('/user/categories') },
  { key: 'rapid', path: '/user/rapid-fire', match: (p: string) => p.startsWith('/user/rapid-fire') },
  { key: 'mine', path: '/user/contributions', match: (p: string) => p.startsWith('/user/contributions') },
] as const;

const langToggleSx = {
  bgcolor: ink[100],
  borderRadius: '8px',
  p: '3px',
  gap: '2px',
  border: 'none',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: '6px !important',
    px: 1.1,
    py: 0.35,
    fontSize: '0.72rem',
    fontWeight: 600,
    color: ink[500],
    textTransform: 'none',
    lineHeight: 1.4,
    '&.Mui-selected': { bgcolor: ink[900], color: '#fff', '&:hover': { bgcolor: ink[800] } },
    '&:hover': { bgcolor: ink[200] },
  },
};

const UserTopBar: React.FC<UserTopBarProps> = ({ onChangeVillage }) => {
  const { userInfo, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useContributeCopy();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const displayName = userInfo?.name || userInfo?.preferred_username || '';
  const initial = (displayName || '?').charAt(0).toUpperCase();
  const village = readSavedVillage();
  const labels = { contribute: t.navContribute, rapid: t.navRapidFire, mine: t.navMyContributions };

  const go = (path: string) => {
    setMenuAnchor(null);
    navigate(path);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'rgba(251, 251, 252, 0.8)',
        backdropFilter: 'saturate(180%) blur(16px)',
        borderBottom: '1px solid',
        borderColor: ink[200],
      }}
    >
      <Container maxWidth="lg" sx={{ height: { xs: 54, sm: 60 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 } }}>
        <ButtonBase
          onClick={() => navigate('/user')}
          aria-label="Ceylonica"
          sx={{ borderRadius: '8px', p: 0.5, gap: 1, flexShrink: 0, '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 } }}
        >
          <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: ink[900], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.9rem' }}>C</Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: ink[900], display: { xs: 'none', sm: 'block' } }}>Ceylonica</Typography>
        </ButtonBase>

        <Box component="nav" aria-label="Contributor" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.25, ml: 2 }}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Button
                key={item.key}
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                disableRipple
                sx={{
                  boxShadow: 'none',
                  px: 1.5,
                  py: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  color: active ? ink[900] : ink[500],
                  bgcolor: active ? ink[100] : 'transparent',
                  '&:hover': { boxShadow: 'none', transform: 'none', bgcolor: active ? ink[100] : ink[50], color: ink[900] },
                }}
              >
                {labels[item.key]}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />

        <ToggleButtonGroup size="small" exclusive value={language} onChange={(_, value) => value && setLanguage(value)} aria-label="Language" sx={{ display: { xs: 'none', sm: 'inline-flex' }, ...langToggleSx }}>
          <ToggleButton value="si">සිං</ToggleButton>
          <ToggleButton value="ta">த</ToggleButton>
          <ToggleButton value="en">EN</ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={displayName || 'Account'}>
          <ButtonBase
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={Boolean(menuAnchor)}
            sx={{ borderRadius: '999px', '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 } }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: ink[900], fontSize: '0.8rem', fontWeight: 600 }}>{initial}</Avatar>
          </ButtonBase>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 244, borderRadius: '12px', border: '1px solid', borderColor: ink[200], boxShadow: '0 12px 32px rgba(10,12,15,0.10)' } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: ink[900] }} noWrap>
              {displayName}
            </Typography>
            {userInfo?.email && (
              <Typography variant="caption" sx={{ color: ink[500], display: 'block' }} noWrap>
                {userInfo.email}
              </Typography>
            )}
          </Box>
          <Divider sx={{ borderColor: ink[200] }} />
          <MenuItem onClick={() => go('/user')} sx={{ display: { md: 'none' } }}>
            <ListItemIcon><AddCircleOutlineRoundedIcon fontSize="small" /></ListItemIcon>
            {t.navContribute}
          </MenuItem>
          <MenuItem onClick={() => go('/user/rapid-fire')} sx={{ display: { md: 'none' } }}>
            <ListItemIcon><BoltRoundedIcon fontSize="small" /></ListItemIcon>
            {t.navRapidFire}
          </MenuItem>
          <MenuItem onClick={() => go('/user/contributions')} sx={{ display: { md: 'none' } }}>
            <ListItemIcon><HistoryRoundedIcon fontSize="small" /></ListItemIcon>
            {t.navMyContributions}
          </MenuItem>
          {village && (
            <MenuItem onClick={() => go(villagePath(village))}>
              <ListItemIcon><MapOutlinedIcon fontSize="small" /></ListItemIcon>
              {t.navHome}
            </MenuItem>
          )}
          {onChangeVillage && (
            <MenuItem onClick={() => { setMenuAnchor(null); onChangeVillage(); }}>
              <ListItemIcon><EditLocationAltOutlinedIcon fontSize="small" /></ListItemIcon>
              {t.navChangeRegion}
            </MenuItem>
          )}
          <Box sx={{ display: { sm: 'none' }, px: 2, py: 1 }}>
            <ToggleButtonGroup size="small" exclusive fullWidth value={language} onChange={(_, value) => value && setLanguage(value)} aria-label="Language" sx={langToggleSx}>
              <ToggleButton value="si">සිංහල</ToggleButton>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
              <ToggleButton value="en">English</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Divider sx={{ borderColor: ink[200] }} />
          <MenuItem onClick={() => logout()} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
            {t.navLogout}
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default UserTopBar;
