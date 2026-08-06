import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Determine the intended destination before being redirected to login
    const from = location.state?.from?.pathname || '/user';
    const redirectUrl = window.location.origin + from;
    login(redirectUrl);
  }, [login, location]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A1A 0%, #0D0D28 50%, #0A0A1A 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={60} sx={{ color: '#6C63FF', mb: 3 }} />
      <Typography variant="h6" sx={{ color: '#9898CC', fontWeight: 500 }}>
        Redirecting to secure login...
      </Typography>
    </Box>
  );
};

export default LoginPage;
