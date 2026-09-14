import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Button, Avatar, IconButton, Card, CardContent } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentIcon from '@mui/icons-material/Assignment';

const MyDashboard: React.FC = () => {
  const { token, userInfo } = useAuth();
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
      color: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      action: () => navigate('/gnpage'),
      btnText: 'Start Exploring'
    },
    {
      title: 'Industry Surveys',
      desc: `You have ${submittedCount} completed submissions and ${draftCount} drafts in progress. Manage your survey data here.`,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      action: () => navigate('/fill-data'),
      btnText: 'View Submissions'
    },
    {
      title: 'Profile Settings',
      desc: 'Manage your account credentials and personal preferences.',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      action: () => {},
      btnText: 'Manage Profile'
    }
  ];

  return (
    <Box sx={{ pb: 6, fontFamily: "'Inter', sans-serif" }}>
      <Container maxWidth="xl" disableGutters>
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                boxShadow: '0 8px 16px rgba(99,102,241,0.2)',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B', letterSpacing: '-0.5px' }}>
                Welcome back, {userName}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#64748B' }}>
                Here's what is happening in your Ceylonica workspace today.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              sx={{ 
                bgcolor: '#FFFFFF', 
                color: '#64748B',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: '#F8FAFC', color: '#1E293B' }
              }}
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton 
              sx={{ 
                bgcolor: '#FFFFFF', 
                color: '#64748B',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: '#F8FAFC', color: '#1E293B' }
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
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: hoveredCard === index ? 'translateY(-8px)' : 'none',
                  boxShadow: hoveredCard === index ? '0 20px 40px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.03)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
              >
                
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '16px',
                      background: card.color,
                      color: '#FFF',
                      mb: 3,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#0F172A', mb: 1.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748B', mb: 4, flexGrow: 1, lineHeight: 1.6 }}>
                    {card.desc}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Button 
                      onClick={card.action}
                      endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.3s', transform: hoveredCard === index ? 'translateX(4px)' : 'none' }}/>}
                      sx={{ 
                        color: hoveredCard === index ? '#4F46E5' : '#64748B',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        p: 0,
                        '&:hover': { bgcolor: 'transparent', color: '#4F46E5' }
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
