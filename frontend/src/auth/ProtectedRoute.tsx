import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import keycloak from './keycloak';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, userInfo, profileSyncFailed, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
          background: 'linear-gradient(135deg, #0A0A1A 0%, #0D0D22 100%)',
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: '#6C63FF',
            filter: 'drop-shadow(0 0 20px rgba(108, 99, 255, 0.6))',
          }}
        />
        <Typography variant="h6" sx={{ color: '#9898CC', mt: 2, fontWeight: 500 }}>
          Authenticating...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Admin-only pages redirect back to themselves after login.
    // All other pages (including user-only pages like /gnpage) redirect to /gnpage after login.
    const isAdminOnlyPage = allowedRoles && allowedRoles.length > 0 &&
      allowedRoles.every(r => ['admin', 'superadmin', 'moderator'].includes(r.toLowerCase()));

    const redirectAfterLogin = isAdminOnlyPage
      ? window.location.origin + location.pathname
      : window.location.origin + '/gnpage';

    keycloak.login({ redirectUri: redirectAfterLogin, prompt: 'login' });
    return null;
  }

  if (profileSyncFailed) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', p: 3, pt: 8, textAlign: 'center' }}>
        <Typography variant="h6">We couldn’t load your account details</Typography>
        <Typography sx={{ my: 2 }}>Your signup details are saved. Please try again, or contact greenceylonica@gmail.com if this continues.</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Try again</Button>
        <Button onClick={logout} sx={{ ml: 1 }}>Sign out</Button>
      </Box>
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = userInfo?.realm_roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      // Redirect unauthorized users to their dashboard
      return <Navigate to="/gnpage" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
