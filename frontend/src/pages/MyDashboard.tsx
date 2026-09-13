import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const MyDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '60vh',
          borderRadius: 3
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom color="primary.main" fontWeight={700}>
          Welcome to your Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          This is your personal space. More features coming soon!
        </Typography>
      </Paper>
    </Container>
  );
};

export default MyDashboard;
