import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import { useAuth } from '../auth/AuthProvider';
import homeBg from '../assets/ABC.png';
import logoImg from '../assets/logo.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEnterSystem = () => {
    setIsTransitioning(true);
    // Wait for the fade-in and reading time, then navigate
    setTimeout(() => {
      navigate('/gnpage');
    }, 2800); // 2.8 seconds
  };

  const handleLogin = () => {
    login(window.location.origin + '/user');
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh', // Uses dynamic viewport height for perfect mobile browser support (e.g. iOS Safari)
        width: '100vw',
        backgroundImage: `url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >

      {/* Decorative borders (simulating the reference image's traditional borders) */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '15px', background: 'linear-gradient(90deg, #b45309, #f59e0b, #b45309)', zIndex: 11 }} />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '15px', background: 'linear-gradient(90deg, #b45309, #f59e0b, #b45309)', zIndex: 11 }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', minHeight: '100dvh', pt: 8, pb: { xs: 8, md: 4 } }}>
        
        {/* Top Titles Section */}
        <Box sx={{ mt: 2, mb: 8, textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box 
              component="img" 
              src={logoImg} 
              alt="Ceylonica Logo" 
              sx={{ 
                height: { xs: '80px', sm: '120px' }, 
                width: 'auto', 
                filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.5))' 
              }} 
            />
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              color: '#FBBF24', // Gold color matching the reference
              fontSize: { xs: '1.5rem', sm: '3rem', md: '4rem', lg: '5rem' },
              mb: 1,
              fontFamily: '"Iskoola Pota", "Abhaya Libre", sans-serif',
              letterSpacing: { xs: '0.5px', md: '2px' },
              wordBreak: 'break-word'
            }}
          >
            සිලෝනිකා ප්‍රජා තොරතුරු පද්ධතිය
          </Typography>
          
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' },
              mb: 3,
              letterSpacing: '1px'
            }}
          >
            Ceylonica Community Information System - CDIC
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#000000', // Changed to black to match the reference image's central text
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(4px)',
              padding: { xs: '10px 15px', sm: '10px 30px' },
              borderRadius: '50px',
              fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
              maxWidth: '900px',
              mx: 'auto',
              mt: 2,
              lineHeight: 1.5,
              fontFamily: '"Iskoola Pota", "Abhaya Libre", sans-serif',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            "පුරාණ ග්‍රාම ළඳානය ඩිජිටල් කර, ප්‍රජා හිමි තොරතුරු වේදිකාවක් තනා, ස්වයංපෝෂිත, එක්සත් ගැමි ජනතාවක් බිහිකිරීම"
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center', width: '100%', px: { xs: 2, sm: 0 } }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ExploreIcon />}
            onClick={handleEnterSystem}
            sx={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Gold/Orange gradient
              color: 'white',
              px: { xs: 2, sm: 4, md: 6 },
              py: { xs: 1.5, md: 2 },
              borderRadius: '50px',
              fontSize: { xs: '0.85rem', sm: '1.1rem', md: '1.3rem' },
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 10px 25px rgba(217, 119, 6, 0.5)',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              lineHeight: 1.3,
              width: { xs: '100%', sm: 'auto' },
              maxWidth: '600px',
              '&:hover': {
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 15px 35px rgba(217, 119, 6, 0.6)',
              },
            }}
          >
            Your Own Village Community Information Platform <br/> ඔබේම ගමේ ප්‍රජා තොරතුරු වේදිකාව
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleLogin}
            sx={{
              background: 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              backdropFilter: 'blur(5px)',
              px: { xs: 2, sm: 4, md: 6 },
              py: { xs: 1, md: 1.5 },
              borderRadius: '50px',
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.3rem' },
              fontWeight: 700,
              textTransform: 'none',
              border: '2px solid rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease',
              width: { xs: '100%', sm: 'auto' },
              maxWidth: '400px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.6)',
                border: '2px solid #FBBF24',
                color: '#FBBF24',
                transform: 'translateY(-3px) scale(1.02)',
              },
            }}
          >
            එන්න අපි ගම ගොඩනගමු
          </Button>
        </Box>

      </Container>

      {/* Transition Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${homeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: isTransitioning ? 1 : 0,
          pointerEvents: isTransitioning ? 'auto' : 'none',
          transition: 'opacity 1s ease-in-out',
          px: { xs: 2, sm: 4 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" sx={{ color: '#FBBF24', mb: { xs: 2, md: 4 }, fontWeight: 700, fontFamily: '"Iskoola Pota", "Abhaya Libre", sans-serif', maxWidth: '1200px', lineHeight: 1.4, fontSize: { xs: '1.2rem', sm: '2rem', md: '3rem' } }}>
          මේ ඔබ පිවිසෙන්නේ ලංකා සංවර්ධන හා තොරතුරු සාමූහිකය මඟින් පහසුකම් සලසන ඔබේම ගමේ ප්‍රජා තොරතුරු වේදිකාවටය.
        </Typography>
        <Typography variant="h4" sx={{ color: 'white', mb: { xs: 2, md: 4 }, fontWeight: 500, maxWidth: '1200px', lineHeight: 1.4, fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' } }}>
          You are now entering your own village community information platform, facilitated by the Ceylon Development and Information Collective.
        </Typography>
        <Typography variant="h4" sx={{ color: '#94a3b8', fontWeight: 500, maxWidth: '1200px', lineHeight: 1.4, fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.5rem' } }}>
          நீங்கள் இப்போது இலங்கை அபிவிருத்தி மற்றும் தகவல் கூட்டு நிறுவனத்தால் வசதியளிக்கப்பட்ட உங்கள் சொந்த கிராம சமூக தகவல் தளத்தில் நுழைகிறீர்கள்.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
