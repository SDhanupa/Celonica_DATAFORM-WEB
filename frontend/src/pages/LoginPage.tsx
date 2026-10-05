import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/gnpage';

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Already logged in — redirect to where they came from
        window.location.href = from;
      } else {
        // Not logged in — redirect straight to Keycloak
        login(window.location.origin + from);
      }
    }
  }, [isLoading, isAuthenticated]);

  // Show a brief loading screen while Keycloak redirects
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f2a1e 0%, #19392b 100%)',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img src="/logo.png" alt="Ceylonica" style={{ height: 48, width: 48, borderRadius: '50%' }} />
      </Box>
      <CircularProgress
        size={48}
        sx={{
          color: '#4ade80',
          filter: 'drop-shadow(0 0 16px rgba(74, 222, 128, 0.5))',
        }}
      />
      <Typography
        variant="h6"
        sx={{ color: '#86efac', mt: 1, fontWeight: 500, fontFamily: '"Outfit", "Inter", sans-serif' }}
      >
        Redirecting to login...
      </Typography>
    </Box>
  );
};

export default LoginPage;
