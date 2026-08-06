import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const FloatingEditButton: React.FC = () => {
  const { isAuthenticated, login, userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on public pages
  const isPublicPage = location.pathname === '/' || location.pathname.startsWith('/gnpage');
  
  if (!isPublicPage) {
    return null;
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      login(window.location.href);
      return;
    }

    // User is authenticated, figure out where to navigate
    const path = location.pathname;
    
    // If on a specific category page (e.g., /gnpage/District/Ccode/slug)
    if (path.startsWith('/gnpage/')) {
      const parts = path.split('/').filter(Boolean);
      // parts[0] = 'gnpage'
      // parts[1] = gnName
      // parts[2] = ccode
      // parts[3] = categorySlug
      if (parts.length >= 4) {
        const slug = parts[3];
        navigate(`/user/categories/${slug}`);
        return;
      }
    }
    
    // Fallback if not on a specific category page
    navigate('/user');
  };

  return (
    <Tooltip title="Add your village details to web" placement="left" arrow>
      <Fab
        color="primary"
        aria-label="edit"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, sm: 32 },
          right: { xs: 24, sm: 32 },
          zIndex: 1000,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 12px 28px rgba(37, 99, 235, 0.5)',
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <EditIcon />
      </Fab>
    </Tooltip>
  );
};

export default FloatingEditButton;
