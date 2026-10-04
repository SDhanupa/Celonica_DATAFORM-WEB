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
import { alpha } from '@mui/material/styles';
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
import { ink, segmented } from './tokens';

interface UserTopBarProps {
  onChangeVillage?: () => void;
}

const NAV = [
  { key: 'contribute', path: '/user', match: (p: string) => p === '/user' || p.startsWith('/user/categories') },
  { key: 'rapid', path: '/user/rapid-fire', match: (p: string) => p.startsWith('/user/rapid-fire') },
  { key: 'mine', path: '/user/contributions', match: (p: string) => p.startsWith('/user/contributions') },
] as const;

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
        bgcolor: alpha('#FFFFFF', 0.72),
        backdropFilter: 'saturate(180%) blur(18px)',
        WebkitBackdropFilter: 'saturate(180%) blur(18px)',
        borderBottom: `1px solid ${alpha(ink[900], 0.06)}`,
      }}
    >
      <Container maxWidth="lg" sx={{ height: { xs: 56, sm: 64 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 } }}>
        <ButtonBase
          onClick={() => navigate('/user')}
          aria-label="Ceylonica"
          sx={{ borderRadius: '10px', p: 0.5, gap: 1.25, flexShrink: 0, '&:focus-visible': { outline: 2, outlineColor: 'primary.main' } }}
        >
          <Box component="img" src="/logo.png" alt="" sx={{ width: 30, height: 30, objectFit: 'contain' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', display: { xs: 'none', sm: 'block' } }}>
            Ceylonica
          </Typography>
        </ButtonBase>

        <Box component="nav" aria-label="Contributor" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.25, ml: 2, p: 0.5, borderRadius: 999, bgcolor: alpha(ink[900], 0.04) }}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Button
                key={item.key}
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                sx={{
                  boxShadow: active ? '0 1px 2px rgba(10,12,15,.08), 0 4px 12px rgba(10,12,15,.06)' : 'none',
                  px: 1.75,
                  py: 0.6,
                  minHeight: 0,
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: active ? ink[900] : ink[500],
                  bgcolor: active ? '#fff' : 'transparent',
                  transition: 'background-color 250ms ease, color 250ms ease, box-shadow 250ms ease',
                  '&:hover': { transform: 'none', color: ink[900], bgcolor: active ? '#fff' : alpha(ink[900], 0.05), boxShadow: active ? '0 1px 2px rgba(10,12,15,.08), 0 4px 12px rgba(10,12,15,.06)' : 'none' },
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
          sx={{
            ...segmented,
            display: { xs: 'none', sm: 'inline-flex' },
            '& .MuiToggleButtonGroup-grouped': { ...segmented['& .MuiToggleButtonGroup-grouped'], px: 1.1, py: 0.3, fontSize: '0.74rem' },
          }}
        >
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
            sx={{
              borderRadius: 999,
              p: 0.4,
              border: `1px solid ${ink[200]}`,
              bgcolor: '#fff',
              transition: 'border-color 200ms ease, box-shadow 200ms ease',
              '&:hover': { borderColor: ink[400], boxShadow: `0 0 0 4px ${alpha(ink[900], 0.05)}` },
              '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
            }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: ink[900], fontSize: '0.85rem', fontWeight: 600 }}>{initial}</Avatar>
          </ButtonBase>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 250, borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: '0 16px 40px rgba(23,43,58,0.12)' } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {displayName}
            </Typography>
            {userInfo?.email && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {userInfo.email}
              </Typography>
            )}
          </Box>
          <Divider />
          {/* Primary nav lives here on phones, where the inline nav is hidden. */}
          <MenuItem onClick={() => go('/user')} sx={{ display: { md: 'none' } }}>
            <ListItemIcon>
              <AddCircleOutlineRoundedIcon fontSize="small" />
            </ListItemIcon>
            {t.navContribute}
          </MenuItem>
          <MenuItem onClick={() => go('/user/rapid-fire')} sx={{ display: { md: 'none' } }}>
            <ListItemIcon>
              <BoltRoundedIcon fontSize="small" />
            </ListItemIcon>
            {t.navRapidFire}
          </MenuItem>
          <MenuItem onClick={() => go('/user/contributions')} sx={{ display: { md: 'none' } }}>
            <ListItemIcon>
              <HistoryRoundedIcon fontSize="small" />
            </ListItemIcon>
            {t.navMyContributions}
          </MenuItem>
          {village && (
            <MenuItem onClick={() => go(villagePath(village))}>
              <ListItemIcon>
                <MapOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {t.navHome}
            </MenuItem>
          )}
          {onChangeVillage && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onChangeVillage();
              }}
            >
              <ListItemIcon>
                <EditLocationAltOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {t.navChangeRegion}
            </MenuItem>
          )}
          <Box sx={{ display: { sm: 'none' }, px: 2, py: 1 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={language}
              onChange={(_, value) => value && setLanguage(value)}
              aria-label="Language"
              sx={{ '& .MuiToggleButton-root': { py: 0.5, fontSize: '0.8rem', fontWeight: 600, textTransform: 'none' } }}
            >
              <ToggleButton value="si">සිංහල</ToggleButton>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
              <ToggleButton value="en">English</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Divider />
          <MenuItem onClick={() => logout()} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            {t.navLogout}
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default UserTopBar;
