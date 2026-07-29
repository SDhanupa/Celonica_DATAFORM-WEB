import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { Link } from 'react-router-dom';

const TopNavbar: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="absolute" sx={{ bgcolor: 'transparent', color: 'white', boxShadow: 'none', borderBottom: 'none', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box
          onClick={() => { window.location.href = '/'; }}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img src="/logo.png" alt="Ceylonica Logo" style={{ height: '55px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
