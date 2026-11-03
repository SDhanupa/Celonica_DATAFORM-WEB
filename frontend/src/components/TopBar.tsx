import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  SpaOutlined,
  KeyboardArrowDown,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

import ProfilePage from '../pages/ProfilePage';
import GlobalSearchBar from './GlobalSearchBar';



const TopBar: React.FC<{ onOpenNavigation?: () => void }> = ({ onOpenNavigation }) => {
  const { userInfo, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const roles = userInfo?.realm_roles || [];
  const isAdmin = roles.some((r: string) => ['super_admin', 'admin', 'moderator'].includes(r));

  return (
    <>
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: 1100,
        background: '#ffffff',
        color: 'text.primary',
        borderRadius: '32px',
        top: 12,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2.5 }, minHeight: { xs: 60, sm: 72 }, gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' }, py: { xs: 1, sm: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onOpenNavigation && <IconButton aria-label="Open navigation" onClick={onOpenNavigation} sx={{ display: { md: 'none' }, mr: 0.5 }}><MenuIcon /></IconButton>}
          {isAdmin && <Button onClick={() => navigate('/gnpage')} startIcon={<SpaOutlined />} sx={{ color: 'primary.main', fontSize: { xs: 17, sm: 21 }, fontWeight: 700, px: 1 }}>Ceylonica</Button>}
          {!isAdmin && (
            <Typography 
              variant="h6" 
              sx={{ fontWeight: 600, color: 'text.primary', mr: 4, cursor: 'pointer' }}
              onClick={() => { window.location.href = '/'; }}
            >
              Ceylonica
            </Typography>
          )}
          {!isAdmin && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => { window.location.href = '/'; }} sx={{ fontWeight: 500, textTransform: 'none', color: 'text.secondary' }}>
                Home
              </Button>
              <Button onClick={() => navigate('/user')} sx={{ fontWeight: 500, textTransform: 'none', color: 'text.secondary' }}>
                Survey
              </Button>
              <Button onClick={() => navigate('/mydashboard')} sx={{ fontWeight: 500, textTransform: 'none', color: 'text.secondary' }}>
                My dashboard
              </Button>
            </Box>
          )}
        </Box>

        {/* Center Search Bar */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: 1 }, order: { xs: 3, sm: 0 }, minWidth: 0, maxWidth: { sm: 480 }, display: 'flex', justifyContent: 'center', mx: { xs: 0, sm: 2 } }}>
          <GlobalSearchBar isDarkMode={false} />
        </Box>

        {/* Right Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1.5 }, ml: 'auto' }}>
          {/* User Menu */}
          <Button
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={Boolean(anchorEl)}
            onClick={handleMenu}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: '6px 12px',
              borderRadius: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: 'primary.main',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                {userInfo?.name || 'Admin'}
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: 'text.secondary', fontSize: 18 }} />
          </Button>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e9ecef',
                borderRadius: 3,
                '& .MuiMenuItem-root': {
                  fontSize: '0.9rem',
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {userInfo?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userInfo?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setProfileOpen(true); handleClose(); }}>
              <PersonIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} /> My Profile
            </MenuItem>
            <Divider />
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>Language / භාෂාව / மொழி</Typography>
            <MenuItem 
              selected={i18n.language === 'en'} 
              onClick={() => { i18n.changeLanguage('en'); handleClose(); }}
            >
              <Typography variant="body2" sx={{ ml: 4 }}>English</Typography>
            </MenuItem>
            <MenuItem 
              selected={i18n.language === 'si'} 
              onClick={() => { i18n.changeLanguage('si'); handleClose(); }}
            >
              <Typography variant="body2" sx={{ ml: 4 }}>සිංහල</Typography>
            </MenuItem>
            <MenuItem 
              selected={i18n.language === 'ta'} 
              onClick={() => { i18n.changeLanguage('ta'); handleClose(); }}
            >
              <Typography variant="body2" sx={{ ml: 4 }}>தமிழ்</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); handleClose(); }} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
    <ProfilePage open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default TopBar;
