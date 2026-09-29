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
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'saturate(180%) blur(14px)',
        borderBottom: 1,
        borderColor: 'divider',
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

        <Box component="nav" aria-label="Contributor" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 2 }}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Button
                key={item.key}
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                sx={{
                  boxShadow: 'none',
                  px: 1.5,
                  fontWeight: 600,
                  color: active ? 'primary.main' : 'text.secondary',
                  bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  '&:hover': { boxShadow: 'none', transform: 'none', bgcolor: (theme) => alpha(theme.palette.primary.main, active ? 0.12 : 0.05) },
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
            display: { xs: 'none', sm: 'inline-flex' },
            '& .MuiToggleButton-root': { px: 1.1, py: 0.35, fontSize: '0.75rem', fontWeight: 600, border: 1, borderColor: 'divider', textTransform: 'none' },
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
              p: 0.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'background-color 150ms ease',
              '&:hover': { bgcolor: 'action.hover' },
              '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 600 }}>{initial}</Avatar>
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
