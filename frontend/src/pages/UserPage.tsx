import React, { useState } from 'react';
import { Box, Typography, Container, Button, Grid, Card, CardActionArea, CardMedia, CardContent, CircularProgress, Chip, Avatar, Fade, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreIcon from '@mui/icons-material/Explore';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';

const UserPage: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<any>(() => {
    const saved = sessionStorage.getItem('user_selected_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLocationModal, setShowLocationModal] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('user_selected_location');
    return !saved;
  });

  const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);

  const handleLocationSelected = (gn: any) => {
    setSelectedLocation(gn);
    sessionStorage.setItem('user_selected_location', JSON.stringify(gn));
    setShowLocationModal(false);
  };

  React.useEffect(() => {
    if (!userInfo) return;
    const roles = userInfo.realm_roles || [];
    if (roles.includes('super_admin')) {
      navigate('/admins', { replace: true });
    } else if (roles.includes('admin') || roles.includes('moderator')) {
      navigate('/users', { replace: true });
    }
  }, [userInfo, navigate]);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        pt: 8,
        pb: 12,
        background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', // Premium modern slate-blue gradient
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              p: { xs: 4, md: 6 }, 
              bgcolor: 'rgba(255, 255, 255, 0.7)', 
              backdropFilter: 'blur(20px)',
              borderRadius: 6, 
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative background circle */}
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(255,255,255,0) 70%)' }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mb: 2, 
                  bgcolor: '#0ea5e9',
                  boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)'
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
                Welcome Back
              </Typography>
              {userInfo?.name && (
                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Hello, {userInfo.name}
                </Typography>
              )}
            </Box>

            {selectedLocation ? (
              <Box 
                sx={{ 
                  mt: 5, 
                  mb: 5, 
                  p: 3, 
                  bgcolor: 'rgba(255,255,255,0.9)', 
                  borderRadius: 4, 
                  border: '1px solid #e2e8f0',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                  <LocationOnIcon sx={{ color: '#10b981' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
                    Active Survey Location
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
                  <Chip label={`District: ${selectedLocation.pDistrict?.admin2NameEn || '-'}`} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                  <Chip label={`DS: ${selectedLocation.dsEn || '-'}`} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                  <Chip label={`GN: ${selectedLocation.nameEn || '-'}`} sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, border: '1px solid #bae6fd' }} />
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 4, mb: 5 }}>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                  Please select your location to begin viewing data and completing surveys.
                </Typography>
              </Box>
            )}
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<ExploreIcon />}
                onClick={() => {
                  if (selectedLocation) {
                    navigate(`/gnpage/${encodeURIComponent(selectedLocation.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(selectedLocation.CCODE)}`);
                  } else {
                    setShowLocationModal(true);
                  }
                }}
                sx={{ 
                  bgcolor: '#0ea5e9', 
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.4)',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: '#0284c7',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 20px 25px -5px rgba(14, 165, 233, 0.4)',
                  } 
                }}
              >
                {selectedLocation ? 'Explore Platform Data' : 'Select Location'}
              </Button>
              
              {selectedLocation && (
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<EditLocationAltIcon />}
                  onClick={() => setShowLocationModal(true)}
                  sx={{ 
                    color: '#64748b', 
                    borderColor: '#cbd5e1',
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 3,
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                  }}
                >
                  Change Location
                </Button>
              )}

              <Button 
                variant="text" 
                size="large"
                startIcon={<LogoutIcon />}
                onClick={() => logout()}
                sx={{ 
                  color: '#ef4444', 
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 3,
                  '&:hover': { bgcolor: '#fef2f2' }
                }}
              >
                Logout
              </Button>
            </Stack>
          </Paper>
        </Fade>
      </Container>
      
      {catLoading && (
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={50} sx={{ color: '#0ea5e9' }} />
        </Box>
      )}

      {selectedLocation && catData?.categories && (
        <Fade in timeout={1200}>
          <Container maxWidth="lg" sx={{ mt: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 5 }}>
              <Box sx={{ height: 2, width: 40, bgcolor: '#cbd5e1', borderRadius: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Survey Categories
              </Typography>
              <Box sx={{ height: 2, width: 40, bgcolor: '#cbd5e1', borderRadius: 1 }} />
            </Box>
            
            <Grid container spacing={4} justifyContent="center">
              {catData.categories.map((cat: any) => {
                const isClickable = cat.children && cat.children.length > 0;
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isClickable ? 1 : 0.6,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        '&:hover': isClickable ? {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                          borderColor: '#bae6fd',
                        } : {}
                      }}
                    >
                      <CardActionArea 
                        onClick={() => {
                          navigate(`/user/categories/${cat.slug}`);
                        }}
                        disabled={!isClickable}
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'stretch',
                          p: 1.5,
                          '& .MuiCardActionArea-focusHighlight': {
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        {cat.imagePath && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={cat.imagePath}
                            alt={cat.nameEn}
                            sx={{ 
                              objectFit: 'contain', 
                              borderRadius: 4,
                              p: 2,
                              backgroundColor: '#ffffff',
                              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
                            }}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: '20px 10px !important', display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.3, width: '100%', color: '#1e293b' }}>
                            {cat.nameEn}
                          </Typography>
                          {cat.nameSi && (
                            <Typography variant="body2" sx={{ width: '100%', mt: 1, color: '#64748b', fontWeight: 500 }}>
                              {cat.nameSi}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Fade>
      )}

      <LocationSelectorModal 
        open={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
        onLocationSelected={handleLocationSelected}
        language="en"
      />
    </Box>
  );
};

export default UserPage;
