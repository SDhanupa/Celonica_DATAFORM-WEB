import React from 'react';
import { Box, Container } from '@mui/material';
import UserTopBar from './UserTopBar';
import { ink } from './tokens';

interface UserShellProps {
  children: React.ReactNode;
}

const UserShell: React.FC<UserShellProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: ink[50] }}>
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
