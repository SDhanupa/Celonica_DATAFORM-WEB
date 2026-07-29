import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, userInfo } = useAuth();
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = userInfo?.realm_roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    
    if (!hasRole) {
      // Redirect unauthorized users to their dashboard or home
      return <Navigate to="/user" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
