import React, { useState } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import adminTheme from '../theme/adminTheme';
import { useAuth } from '../auth/AuthProvider';
import { useQuery } from '@apollo/client';
import { GET_ADMINS } from '../graphql/queries';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userInfo } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const roles = userInfo?.realm_roles || [];
  const isAdmin = roles.some((r) => ['super_admin', 'admin', 'moderator'].includes(r));
  useQuery(GET_ADMINS, { skip: !roles.includes('super_admin'), fetchPolicy: 'cache-first', errorPolicy: 'ignore' });
  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 1.5, md: 3 },
        '& ::selection': { bgcolor: '#c7e9d7', color: '#163c2b' },
        '& input': { caretColor: '#087f5b' },
        '& .MuiInputBase-root input::placeholder': { color: '#606b64', opacity: 1 },
        '& :focus-visible': { outline: '2px solid #087f5b', outlineOffset: 3 },
        scrollbarColor: '#b9c8be transparent',
      }}>
        <TopBar onOpenNavigation={isAdmin ? () => setMobileNavOpen(true) : undefined} />
        <Box sx={{ display: 'flex', gap: { md: 3, lg: 4 }, mt: { xs: 3, md: 4 }, alignItems: 'flex-start' }}>
          {isAdmin && <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />}
          <Box component="main" id="admin-main" sx={{ flex: 1, minWidth: 0, maxWidth: 1600, mx: 'auto', pb: 4 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default AdminLayout;
