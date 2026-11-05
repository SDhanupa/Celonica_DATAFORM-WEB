import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import keycloak from './keycloak';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, userInfo } = useAuth();
  const location = useLocation();
  const needsLogin = !isLoading && !isAuthenticated;

  // Back to the page that asked for the login. Built from our own origin, so it cannot be pointed at another site.
  useEffect(() => {
    if (needsLogin) keycloak.login({ redirectUri: window.location.origin + location.pathname + location.search, prompt: 'login' });
  }, [needsLogin, location.pathname, location.search]);

  if (isLoading) {
    return (
      <Box role="status" aria-label="Loading" sx={{ display: 'grid', placeItems: 'center', height: '100dvh' }}>
        <CircularProgress size={32} sx={{ color: '#2d5e41' }} />
      </Box>
    );
  }

  if (needsLogin) return null;

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
