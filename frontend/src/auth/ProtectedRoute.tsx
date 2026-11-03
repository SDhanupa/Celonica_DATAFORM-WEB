import React, { useEffect, useRef, useState } from 'react';
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
  const redirectStarted = useRef(false);
  const [redirectFailed, setRedirectFailed] = useState(false);

  useEffect(() => {
    if (isLoading || isAuthenticated || redirectStarted.current) return;
    redirectStarted.current = true;
    void keycloak.login({
      redirectUri: window.location.origin + location.pathname + location.search + location.hash,
      prompt: 'login',
    }).catch(() => setRedirectFailed(true));
  }, [isLoading, isAuthenticated, location.pathname, location.search, location.hash]);

  if (isLoading || (!isAuthenticated && !redirectFailed)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
          background: '#f5f7f2',
        }}
      >
        <CircularProgress
          size={36}
          sx={{
            color: '#2d5a27',
          }}
        />
        <Typography role="status" sx={{ color: '#344a35', mt: 2, fontWeight: 500 }}>
          {isLoading ? 'Checking your session…' : 'Opening secure login…'}
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography role="alert">We couldn’t open login. Please try again.</Typography>
      <Button onClick={() => window.location.reload()}>Try again</Button>
    </Box>;
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
