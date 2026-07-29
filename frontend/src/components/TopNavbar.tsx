import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';

const TopNavbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Logo — always visible, transitions style on scroll */}
      <Box
        onClick={() => { window.location.href = '/'; }}
        sx={{
          position: 'fixed',
          top: scrolled ? '12px' : '16px',
          left: scrolled ? '12px' : '16px',
          zIndex: 1200,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          // Glassmorphism bubble appears after scroll
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          border: scrolled ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
          boxShadow: scrolled ? '0 8px 32px rgba(0, 0, 0, 0.18)' : 'none',
          borderRadius: '50%',
          p: scrolled ? '6px' : '0px',
        }}
      >
        <img
          src="/logo.png"
          alt="Ceylonica Logo"
          style={{
            height: scrolled ? '64px' : '75px',
            width: scrolled ? '64px' : '75px',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.45))',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '50%',
          }}
        />
      </Box>
    </>
  );
};

export default TopNavbar;
