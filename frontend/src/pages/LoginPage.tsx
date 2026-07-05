import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import {
  Lock as LockIcon,
  AutoAwesome,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

const features = [
  { icon: <ShieldIcon />, title: 'Secure Auth', desc: 'Keycloak SSO with PKCE' },
  { icon: <SpeedIcon />, title: 'Fast & Reliable', desc: 'GraphQL API backend' },
  { icon: <AnalyticsIcon />, title: 'Full Analytics', desc: 'Real-time insights' },
];

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A1A 0%, #0D0D28 50%, #0A0A1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
            '50%': { transform: 'scale(1.1)', opacity: 1 },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,101,132,0.08) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-150px',
          animation: 'pulse 5s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          {/* Left: Branding */}
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6C63FF 0%, #9D96FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)',
                  }}
                >
                  <AutoAwesome sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6C63FF, #9D96FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Celonica
                </Typography>
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: '#E8E8FF',
                  lineHeight: 1.15,
                  mb: 2,
                  fontSize: { xs: '2.2rem', md: '2.8rem' },
                }}
              >
                Admin
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Control Center
                </Box>
              </Typography>

              <Typography variant="body1" sx={{ color: '#9898CC', mb: 4, lineHeight: 1.7, maxWidth: 380 }}>
                Manage your platform with a powerful, secure admin dashboard powered by Keycloak SSO and GraphQL.
              </Typography>

              {/* Feature chips */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {features.map((f) => (
                  <Box
                    key={f.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 3,
                      background: 'rgba(108, 99, 255, 0.06)',
                      border: '1px solid rgba(108, 99, 255, 0.12)',
                    }}
                  >
                    <Box
                      sx={{
                        color: '#6C63FF',
                        display: 'flex',
                        p: 0.5,
                        borderRadius: 2,
                        background: 'rgba(108, 99, 255, 0.1)',
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#E8E8FF' }}>
                        {f.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9898CC' }}>
                        {f.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right: Login Card */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 5,
                background: 'rgba(18, 18, 42, 0.9)',
                border: '1px solid rgba(108, 99, 255, 0.2)',
                backdropFilter: 'blur(30px)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(108, 99, 255, 0.1)',
                textAlign: 'center',
              }}
            >
              {/* Lock icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.2), rgba(157, 150, 255, 0.1))',
                  border: '1px solid rgba(108, 99, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                  },
                }}
              >
                <LockIcon sx={{ fontSize: 36, color: '#6C63FF' }} />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, color: '#E8E8FF', mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: '#9898CC', mb: 4, lineHeight: 1.6 }}>
                Sign in with your administrator credentials to access the control panel
              </Typography>

              <Button
                id="keycloak-login-btn"
                variant="contained"
                size="large"
                fullWidth
                onClick={login}
                sx={{
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6C63FF 0%, #9D96FF 100%)',
                  borderRadius: 3,
                  boxShadow: '0 8px 30px rgba(108, 99, 255, 0.4)',
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4B44CC 0%, #6C63FF 100%)',
                    boxShadow: '0 12px 40px rgba(108, 99, 255, 0.6)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                Sign in with Keycloak
              </Button>

              <Button
                id="keycloak-register-btn"
                variant="outlined"
                size="large"
                fullWidth
                onClick={register}
                sx={{
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#6C63FF',
                  borderColor: 'rgba(108, 99, 255, 0.5)',
                  borderRadius: 3,
                  mb: 2,
                  '&:hover': {
                    borderColor: '#6C63FF',
                    background: 'rgba(108, 99, 255, 0.08)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                Sign Up
              </Button>

              <Typography variant="caption" sx={{ color: '#9898CC', display: 'block', mt: 1 }}>
                🔒 Secured by Keycloak SSO — Admin access only
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;
