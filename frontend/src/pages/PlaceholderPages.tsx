import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { Construction } from '@mui/icons-material';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => (
  <Box>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#E8E8FF', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: '#9898CC', mb: 4 }}>
      {description}
    </Typography>
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        textAlign: 'center',
        p: 6,
      }}
    >
      <CardContent>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'rgba(108, 99, 255, 0.1)',
            border: '1px solid rgba(108, 99, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Construction sx={{ fontSize: 36, color: '#6C63FF' }} />
        </Box>
        <Chip
          label="Coming Soon"
          sx={{
            background: 'rgba(108, 99, 255, 0.1)',
            color: '#9D96FF',
            border: '1px solid rgba(108, 99, 255, 0.2)',
            fontWeight: 700,
            mb: 1.5,
          }}
        />
        <Typography variant="h6" sx={{ color: '#E8E8FF', fontWeight: 600, mb: 1 }}>
          {title} Module
        </Typography>
        <Typography variant="body2" sx={{ color: '#9898CC', maxWidth: 320, mx: 'auto' }}>
          This section is under development and will be available in the next phase.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export const UsersPage = () => (
  <PlaceholderPage title="User Management" description="View and manage platform users" />
);

export const ReportsPage: React.FC = () => (
  <PlaceholderPage
    title="Reports & Analytics"
    description="Generate and view detailed reports."
  />
);
