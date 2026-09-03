import React, { useState } from 'react';
import { Box, Typography, Container, Button, Grid, Card, CardActionArea, CardMedia, CardContent, CircularProgress, Chip, Avatar, Fade, Stack, Paper, IconButton, TextField, InputAdornment, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import SearchIcon from '@mui/icons-material/Search';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreIcon from '@mui/icons-material/Explore';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

const UserPage: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<any>(() => {
    const saved = sessionStorage.getItem('user_selected_location') || localStorage.getItem('user_selected_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLocationModal, setShowLocationModal] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('user_selected_location') || localStorage.getItem('user_selected_location');
    return !saved;
  });

  const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);

  const searchOptions = React.useMemo(() => {
    if (!catData?.categories) return [];
    const options: any[] = [];
    const processChildren = (children: any[], parentPath: string, rootName: string) => {
      if (!children) return;
      children.forEach((child: any) => {
        const fullPath = `${parentPath}/${child.slug}`;
        options.push({
          type: 'subcategory',
          label: child.nameEn || '',
          labelSi: child.nameSi || '',
          slug: fullPath,
          parentName: rootName
        });
        if (child.children) {
          processChildren(child.children, fullPath, rootName);
        }
      });
    };

    catData.categories.forEach((cat: any) => {
      options.push({
        type: 'category',
        label: cat.nameEn || '',
        labelSi: cat.nameSi || '',
        slug: cat.slug,
        parentName: null
      });
      if (cat.children) {
        processChildren(cat.children, cat.slug, cat.nameEn || '');
      }
    });
    return options;
  }, [catData]);

  const handleLocationSelected = (gn: any) => {
    setSelectedLocation(gn);
    sessionStorage.setItem('user_selected_location', JSON.stringify(gn));
    localStorage.setItem('user_selected_location', JSON.stringify(gn)); // persist across sessions
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
        pt: { xs: 10, sm: 14 },
        pb: 12,
        backgroundColor: '#ffffff', // Clean white background
        background: 'radial-gradient(circle at top center, #f8fafc 0%, #ffffff 100%)',
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle animated floating elements in the background */}
      <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', animation: 'float 10s ease-in-out infinite' }} />
      <Box sx={{ position: 'absolute', bottom: '20%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', animation: 'float 15s ease-in-out infinite reverse' }} />

      {/* Glassmorphic Floating Top Dock */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 3 },
          pointerEvents: 'auto',
          bgcolor: 'rgba(255, 255, 255, 0.7)', // Light glass
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,1)',
          px: { xs: 2, sm: 4 },
          py: { xs: 1, sm: 1.5 },
          borderRadius: '100px', // Perfect pill
          color: '#0f172a',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)',
          maxWidth: '95vw'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => {
                if (selectedLocation) {
                  navigate(`/gnpage/${encodeURIComponent(selectedLocation.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(selectedLocation.CCODE)}`);
                } else {
                  navigate('/gnpage');
                }
              }}
              size="small"
              sx={{ color: '#0ea5e9', bgcolor: 'rgba(14,165,233,0.1)', p: 1, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.1)', bgcolor: 'rgba(14,165,233,0.2)' } }}
            >
              <ExploreIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, fontWeight: 500, fontSize: '0.95rem' }}>
            <Typography 
              onClick={() => navigate('/gnpage')} 
              sx={{ cursor: 'pointer', transition: 'all 0.2s', color: '#64748b', '&:hover': { color: '#0f172a' } }}
            >
              Home
            </Typography>
            <Typography sx={{ color: '#cbd5e1', fontWeight: 300 }}>|</Typography>
            <Typography onClick={() => navigate('/user')} sx={{ cursor: 'pointer', transition: 'all 0.2s', color: '#0f172a', fontWeight: 600 }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: '#cbd5e1', fontWeight: 300 }}>|</Typography>
            <Typography onClick={() => logout()} sx={{ cursor: 'pointer', transition: 'all 0.2s', color: '#ef4444', '&:hover': { color: '#dc2626' } }}>
              Logout
            </Typography>
            <Typography sx={{ color: '#cbd5e1', fontWeight: 300 }}>|</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: '#8b5cf6', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                {(userInfo?.preferred_username || userInfo?.name || 'U')[0].toUpperCase()}
              </Avatar>
              <Typography sx={{ fontWeight: 600, color: '#334155' }}>
                {userInfo?.preferred_username || userInfo?.name || 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10 }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            {/* Location Boarding Pass */}
            {selectedLocation ? (
              <Box 
                sx={{ 
                  mt: 6, 
                  mb: 5, 
                  mx: 'auto',
                  maxWidth: 650,
                  p: { xs: 3, sm: 4 }, 
                  bgcolor: 'rgba(255, 255, 255, 0.8)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: 6, 
                  border: '1px solid rgba(255,255,255,1)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Accent glow on top edge */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)' }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
                  <MapRoundedIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '0.5px' }}>
                    Active Survey Region
                  </Typography>
                </Box>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
                  <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 3, flex: 1, width: '100%', border: '1px solid #f1f5f9' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, mb: 0.5 }}>District</Typography>
                    <Typography sx={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>{selectedLocation.pDistrict?.admin2NameEn || '-'}</Typography>
                  </Box>
                  <KeyboardArrowRightRoundedIcon sx={{ color: '#cbd5e1', display: { xs: 'none', sm: 'block' } }} />
                  <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 3, flex: 1, width: '100%', border: '1px solid #f1f5f9' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, mb: 0.5 }}>DS Division</Typography>
                    <Typography sx={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>{selectedLocation.dsEn || '-'}</Typography>
                  </Box>
                  <KeyboardArrowRightRoundedIcon sx={{ color: '#cbd5e1', display: { xs: 'none', sm: 'block' } }} />
                  <Box sx={{ bgcolor: '#f0f9ff', border: '1px solid #bae6fd', p: 1.5, borderRadius: 3, flex: 1.2, width: '100%' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#0284c7', textTransform: 'uppercase', fontWeight: 800, mb: 0.5 }}>Grama Niladhari</Typography>
                    <Typography sx={{ fontSize: '1.1rem', color: '#0369a1', fontWeight: 700 }}>{selectedLocation.nameEn || '-'}</Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 5, mb: 6 }}>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 3, fontSize: '1.1rem' }}>
                  Select your physical location to begin viewing data and submitting surveys.
                </Typography>
              </Box>
            )}
            
            {/* Primary Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                size="large"
                startIcon={<DashboardRoundedIcon />}
                onClick={() => {
                  if (selectedLocation) {
                    navigate(`/gnpage/${encodeURIComponent(selectedLocation.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(selectedLocation.CCODE)}`);
                  } else {
                    setShowLocationModal(true);
                  }
                }}
                sx={{ 
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 20px 30px -5px rgba(14, 165, 233, 0.5)',
                  } 
                }}
              >
                {selectedLocation ? 'Access Regional Platform' : 'Set Your Location'}
              </Button>
              
              {selectedLocation && (
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<EditLocationAltIcon />}
                  onClick={() => setShowLocationModal(true)}
                  sx={{ 
                    color: '#475569', 
                    borderColor: '#cbd5e1',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: '16px',
                    px: 4,
                    py: 1.5,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: '#f8fafc', 
                      borderColor: '#94a3b8',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Change Region
                </Button>
              )}
            </Stack>

            {/* Local Category Search Dropdown */}
            {selectedLocation && (
              <Box sx={{ mt: 5, maxWidth: 650, mx: 'auto' }}>
                <Autocomplete
                  options={searchOptions}
                  getOptionLabel={(option) => `${option.label} ${option.labelSi ? `(${option.labelSi})` : ''}`}
                  filterOptions={(options, state) => {
                    const keywords = state.inputValue.toLowerCase().split(/\s+/).filter(Boolean);
                    if (keywords.length === 0) return options;
                    return options.filter((option) => {
                      const text = `${option.label} ${option.labelSi} ${option.parentName || ''}`.toLowerCase();
                      return keywords.every(kw => text.includes(kw));
                    });
                  }}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      navigate(`/user/categories/${newValue.slug}`);
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>{option.label} {option.labelSi && <span style={{ color: '#64748b', fontSize: '0.9em', fontWeight: 400 }}> - {option.labelSi}</span>}</Typography>
                      {option.type === 'subcategory' && (
                        <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 700 }}>
                          Found in Category: {option.parentName}
                        </Typography>
                      )}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Search for any category or subcategory..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start" sx={{ pl: 1 }}>
                            <SearchIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '20px',
                          '& fieldset': { borderColor: '#cbd5e1' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                        }
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        </Fade>
      </Container>
      
      {catLoading && (
        <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={50} sx={{ color: '#0ea5e9' }} />
        </Box>
      )}

      {selectedLocation && catData?.categories && (
        <Fade in timeout={1200}>
          <Container maxWidth="xl" sx={{ mt: 8, position: 'relative', zIndex: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 6 }}>
              <Box sx={{ height: '2px', flex: 1, maxWidth: 200, background: 'linear-gradient(90deg, transparent, #e2e8f0)' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Survey Categories
              </Typography>
              <Box sx={{ height: '2px', flex: 1, maxWidth: 200, background: 'linear-gradient(270deg, transparent, #e2e8f0)' }} />
            </Box>
            
            <Grid container spacing={3} justifyContent="center">
              {catData.categories
                .map((cat: any) => {
                const isClickable = cat.children && cat.children.length > 0;
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        borderRadius: 6,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,1)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        opacity: isClickable ? 1 : 0.6,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        '&::before': isClickable ? {
                          content: '""',
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(135deg, rgba(14,165,233,0) 0%, rgba(14,165,233,0.05) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.4s'
                        } : {},
                        '&:hover': isClickable ? {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                          borderColor: 'rgba(56,189,248,0.5)',
                          '&::before': { opacity: 1 }
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
                          p: 3,
                          '& .MuiCardActionArea-focusHighlight': {
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        {cat.imagePath && (
                          <Box sx={{ 
                            height: 140, 
                            mb: 3, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: '#ffffff',
                            borderRadius: 4,
                            p: 2,
                            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02), 0 4px 10px rgba(0,0,0,0.02)'
                          }}>
                            <img
                              src={cat.imagePath}
                              alt={cat.nameEn}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: '0 !important', display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center' }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.3, width: '100%', color: '#0f172a' }}>
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
