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
        <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', letterSpacing: '1px' }}>
          CEYLONICA
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
