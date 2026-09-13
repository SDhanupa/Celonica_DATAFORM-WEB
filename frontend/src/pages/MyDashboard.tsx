import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Button, Avatar, IconButton, useTheme, Card, CardContent } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';

const MyDashboard: React.FC = () => {
  const { token, userInfo } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [surveys, setSurveys] = useState<any[]>([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/my-industry-surveys', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSurveys(data);
        }
      } catch (err) {
        console.error('Failed to fetch user surveys:', err);
      }
    };
    fetchSurveys();
  }, [token]);

  const submittedCount = surveys.filter(s => s.status === 'submitted' || s.status === 'approved').length;
  const draftCount = surveys.filter(s => s.status === 'draft').length;

  const userName = userInfo?.preferred_username || userInfo?.name || 'User';
  
  // Dashboard Action Cards
  const cards = [
    {
      title: 'Explore Demographics',
      desc: 'Dive into interactive data for Grama Niladhari divisions across Sri Lanka.',
      icon: <ExploreIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
      action: () => navigate('/gnpage'),
      btnText: 'Start Exploring'
    },
    {
      title: 'Industry Surveys',
      desc: `You have ${submittedCount} completed submissions and ${draftCount} drafts in progress. Manage your survey data here.`,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #F5AF19 0%, #F12711 100%)',
      action: () => navigate('/fill-data'),
      btnText: 'View Submissions'
    },
    {
      title: 'Profile Settings',
      desc: 'Manage your account credentials and personal preferences.',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
      action: () => {},
      btnText: 'Manage Profile'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0F172A',
        backgroundImage: 'radial-gradient(circle at top right, rgba(0,114,255,0.15) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(56,239,125,0.15) 0%, transparent 40%)',
        color: '#F8FAFC',
        pt: 10,
        pb: 12,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Container maxWidth="xl">
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: '0 8px 16px rgba(99,102,241,0.3)',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                Welcome back, {userName}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#94A3B8' }}>
                Here's what is happening in your Ceylonica workspace today.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                color: '#CBD5E1',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#FFF' }
              }}
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                color: '#CBD5E1',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#FFF' }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Feature Grid */}
        <Grid container spacing={4}>
          {cards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{ 
                  background: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '24px',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: hoveredCard === index ? 'translateY(-12px)' : 'none',
                  boxShadow: hoveredCard === index ? '0 24px 48px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.2)',
                  cursor: 'pointer'
                }}
              >
                {/* Glowing orb effect */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    background: card.color,
                    borderRadius: '50%',
                    filter: 'blur(50px)',
                    opacity: hoveredCard === index ? 0.3 : 0.1,
                    transition: 'opacity 0.4s ease'
                  }}
                />
                
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '16px',
                      background: card.color,
                      color: '#FFF',
                      mb: 3,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#F8FAFC', mb: 1.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4, flexGrow: 1, lineHeight: 1.6 }}>
                    {card.desc}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Button 
                      onClick={card.action}
                      endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.3s', transform: hoveredCard === index ? 'translateX(4px)' : 'none' }}/>}
                      sx={{ 
                        color: hoveredCard === index ? '#FFF' : '#CBD5E1',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        p: 0,
                        '&:hover': { bgcolor: 'transparent', color: '#FFF' }
                      }}
                    >
                      {card.btnText}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MyDashboard;
