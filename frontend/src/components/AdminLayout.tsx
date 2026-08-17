import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

import { useAuth } from '../auth/AuthProvider';
import { useQuery } from '@apollo/client';
import { GET_ME, GET_ADMINS } from '../graphql/queries';
import OnboardingModal from './OnboardingModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { userInfo } = useAuth();
  const { data, refetch } = useQuery(GET_ME, { 
    errorPolicy: 'ignore',
    fetchPolicy: 'network-only'
  });
  const needsOnboarding = data?.needsOnboarding === true;

  const roles = userInfo?.realm_roles || [];
  const isAdmin = roles.some((r: string) => ['super_admin', 'admin', 'moderator'].includes(r));
  const isSuperAdmin = roles.includes('super_admin');

  // Background Prefetching for instant 0ms loads
  useQuery(GET_ADMINS, { skip: !isSuperAdmin, fetchPolicy: 'cache-first', errorPolicy: 'ignore' });

  return (
    <>
      <OnboardingModal open={needsOnboarding} onComplete={() => refetch()} />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        {isAdmin && <Sidebar />}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <TopBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default AdminLayout;
