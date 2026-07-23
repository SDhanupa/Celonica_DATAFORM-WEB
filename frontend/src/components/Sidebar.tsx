import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SupervisorAccount as AdminsIcon,
  People as UsersIcon,
  Quiz as QuestionsIcon,
  Flag as ReportsIcon,
  Person as ProfileIcon,
  ChevronLeft,
  ChevronRight,
  AutoAwesome,
  Menu as MenuIcon,
  PersonAdd as UserPlusIcon,
  Category as CategoryIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 70;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Admins', icon: <AdminsIcon />, path: '/admins', roles: ['super_admin', 'admin'] },
  { label: 'Users', icon: <UsersIcon />, path: '/users', roles: ['super_admin', 'admin', 'moderator'] },
  { label: 'Questions', icon: <QuestionsIcon />, path: '/questions', roles: ['super_admin', 'admin', 'moderator'] },
  { label: 'Reports', icon: <ReportsIcon />, path: '/reports', roles: ['super_admin', 'admin', 'moderator'] },
  { label: 'Categories', icon: <CategoryIcon />, path: '/categories', roles: ['super_admin'] },
  { label: 'GM Divisions', icon: <MapIcon />, path: '/gm-divisions', roles: ['super_admin'] },
  { label: 'Register User', icon: <UserPlusIcon />, path: '/registration', roles: ['super_admin'] },
  { label: 'Data Base Mapping', icon: <MapIcon />, path: '/police-database-map', roles: ['super_admin'] },
  { label: 'Post Office Mapping', icon: <MapIcon />, path: '/postoffice-database-map', roles: ['super_admin'] },
  { label: 'Health Mapping', icon: <MapIcon />, path: '/health-database-map', roles: ['super_admin'] },
  { label: 'Telecom Mapping', icon: <MapIcon />, path: '/trs-database-map', roles: ['super_admin'] },
  { label: 'District-Prov Mapping', icon: <MapIcon />, path: '/district-province-map', roles: ['super_admin'] },
  { label: 'Take Survey', icon: <QuestionsIcon />, path: '/survey', roles: ['user'] },
];

const roleColors: Record<string, 'primary' | 'success' | 'warning'> = {
  super_admin: 'primary',
  admin: 'success',
  moderator: 'warning',
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = userInfo?.realm_roles?.find((r) =>
    ['super_admin', 'admin', 'moderator'].includes(r)
  ) || 'user';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        transition: 'width 0.2s',
        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          transition: 'width 0.2s',
          overflow: 'hidden',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo Area */}
      <Box
        sx={{
          p: collapsed ? 1 : '0 15px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 64, // AdminBite topbar height
          borderBottom: '1px solid #e9ecef',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ color: 'text.secondary' }}>
          <MenuIcon />
        </IconButton>
        {!collapsed && (
          <Box
            sx={{
              width: 35,
              height: 35,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: 1,
            }}
          >
            <AutoAwesome sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
        )}
        {!collapsed && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1,
              }}
            >
              Ceylonica
            </Typography>
          </Box>
        )}
      </Box>

      {/* User Info */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderBottom: '1px solid #e9ecef',
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {userInfo?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {userInfo?.name || 'Admin'}
            </Typography>
            <Chip
              label={role.replace('_', ' ').toUpperCase()}
              size="small"
              color={roleColors[role] as any}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 500,
                mt: 0.5,
              }}
            />
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List 
        sx={{ 
          px: 0, 
          flex: 1, 
          mt: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,0,0,0.3)',
          },
        }}
      >
        {navItems.map((item: any) => {
          if (item.roles && !item.roles.includes(role)) {
            return null;
          }
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 2.5 : 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 'auto' : 35,
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { fontSize: 'small' })}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 500 : 300,
                        color: isActive ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
