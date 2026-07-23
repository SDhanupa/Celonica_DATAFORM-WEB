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
  Badge,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

import ProfilePage from '../pages/ProfilePage';

import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';

const TopBar: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data } = useQuery(GET_ME, { errorPolicy: 'ignore' });
  const needsOnboarding = data?.needsOnboarding === true;

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
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: '64px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Removed dynamic page title, adding Nav Links instead for non-admins */}
          {!isAdmin && (
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', mr: 4 }}>
              Ceylonica
            </Typography>
          )}
          {!isAdmin && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/')} sx={{ fontWeight: 500, textTransform: 'none' }}>
                Home
              </Button>
              <Button color="inherit" onClick={() => navigate('/survey')} sx={{ fontWeight: 500, textTransform: 'none' }}>
                Survey
              </Button>
              <Button color="inherit" onClick={() => navigate('/categories')} sx={{ fontWeight: 500, textTransform: 'none' }}>
                Category
              </Button>
            </Box>
          )}
        </Box>

        {/* Right Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              onClick={(e) => setNotifAnchorEl(e.currentTarget)}
              sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#fff' } }}
            >
              <Badge badgeContent={needsOnboarding ? 1 : 0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={() => setNotifAnchorEl(null)}
            PaperProps={{
              sx: { mt: 1.5, minWidth: 250, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Notifications</Typography>
            </Box>
            <Divider />
            {needsOnboarding ? (
              <MenuItem sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Action Required
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Please complete your profile details.
                </Typography>
              </MenuItem>
            ) : (
              <MenuItem sx={{ py: 2, justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  No new notifications
                </Typography>
              </MenuItem>
            )}
          </Menu>

          {/* User Menu */}
          <Box
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
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: '#ffffff',
                color: 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>
                {userInfo?.name || 'Admin'}
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 18 }} />
          </Box>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '1px 0px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e9ecef',
                borderRadius: 0,
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
            <MenuItem onClick={handleClose}>
              <SettingsIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} /> Settings
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
