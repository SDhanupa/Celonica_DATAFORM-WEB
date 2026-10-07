import React from 'react';
import { Box, Container } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../../graphql/queries';
import OnboardingModal from '../OnboardingModal';
import UserTopBar from './UserTopBar';
import { ink } from './tokens';

interface UserShellProps {
  children: React.ReactNode;
}

const UserShell: React.FC<UserShellProps> = ({ children }) => {
  const { data, refetch } = useQuery(GET_ME, {
    errorPolicy: 'ignore',
    fetchPolicy: 'network-only',
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: ink[50] }}>
      <OnboardingModal
        open={data?.needsOnboarding === true}
        onComplete={() => refetch()}
      />
      <UserTopBar />
      <Container
        component="main"
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, md: 5 } }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default UserShell;
