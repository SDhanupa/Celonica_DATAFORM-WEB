import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import { DashboardOutlined as DashboardIcon, SupervisorAccountOutlined as AdminsIcon,
  QuizOutlined as QuestionsIcon, FlagOutlined as ReportsIcon,
  CategoryOutlined as CategoryIcon, MapOutlined as MapIcon, AssignmentOutlined as AssignmentIcon,
  MenuOpen, Menu, Close } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { visibleAdminTools, toolGroups, matchesToolLocation } from '../config/adminTools';

const icons = { home: <DashboardIcon />, people: <AdminsIcon />, review: <ReportsIcon />, survey: <QuestionsIcon />, content: <CategoryIcon />, map: <MapIcon />, data: <AssignmentIcon /> };
const workspaceItems = [
  { id: 'workspace', title: 'Overview', path: '/admins', group: 'Workspace', icon: 'home' },
  { id: 'tools', title: 'All tools', path: '/admins?view=tools', group: 'Workspace', icon: 'content' },
  { id: 'data', title: 'Data collections', path: '/admins?view=data', group: 'Workspace', icon: 'data' },
] as const;
const Sidebar: React.FC<{ mobileOpen: boolean; onMobileClose: () => void }> = ({ mobileOpen, onMobileClose }) => {
  const [expanded, setExpanded] = useState(false);
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roles = userInfo?.realm_roles || [];
  const allTools = visibleAdminTools(roles);
  const isSuperAdmin = roles.includes('super_admin');
  // Keep the rail small; the full, searchable catalogue remains one click away.
  const quickTools = isSuperAdmin ? allTools.filter(tool => tool.group === 'Review' || tool.id === 'admins' || tool.id === 'map') : allTools;
  const navItems = [...(isSuperAdmin ? workspaceItems : []), ...quickTools];
  const groups = ['Workspace', ...toolGroups];
  const go = (path: string) => {
    const lastGn = localStorage.getItem('last_gn_url');
    navigate(path === '/gnpage' && lastGn?.startsWith('/gnpage') ? lastGn : path);
    onMobileClose();
  };
  const navigation = (labels: boolean, mobile = false) => <>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: labels ? 'space-between' : 'center', px: 1, pb: 1 }}>
      {labels && <Typography variant="body2" sx={{ fontWeight: 600, pl: 1 }}>Workspace</Typography>}
      <Tooltip title={mobile ? 'Close navigation' : expanded ? 'Collapse navigation' : 'Expand navigation'}>
        <IconButton aria-label={mobile ? 'Close navigation' : expanded ? 'Collapse navigation' : 'Expand navigation'}
          onClick={mobile ? onMobileClose : () => setExpanded(!expanded)} sx={{ width: 44, height: 44 }}>
          {mobile ? <Close /> : expanded ? <MenuOpen /> : <Menu />}
        </IconButton>
      </Tooltip>
    </Box>
    {groups.map((group, index) => {
      const items = navItems.filter(item => item.group === group);
      if (!items.length) return null;
      return <Box key={group} sx={{ borderTop: index ? '1px solid' : 'none', borderColor: 'divider', pt: index ? 1 : 0, mt: index ? 1 : 0 }}>
        {labels && index > 0 && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1 }}>{group}</Typography>}
        <List disablePadding>
          {items.map(item => {
            const hiddenToolActive = item.id === 'tools' && location.pathname !== '/admins' && allTools.some(tool =>
              matchesToolLocation(tool.path, location.pathname, location.search) && !quickTools.some(quick => quick.id === tool.id));
            const selected = hiddenToolActive || (matchesToolLocation(item.path, location.pathname, location.search) &&
              !navItems.some(other => other.path !== item.path && other.path.startsWith(item.path + '/') && matchesToolLocation(other.path, location.pathname, location.search)));
            return <Tooltip key={item.path} title={!labels ? item.title : ''} placement="right">
              <ListItemButton aria-label={item.title} aria-current={selected ? 'page' : undefined} selected={selected} onClick={() => go(item.path)}
                sx={{ minHeight: 44, borderRadius: '14px', mb: 0.5, mx: 0.5, px: labels ? 1.5 : 0, justifyContent: 'center',
                  color: selected ? '#ffffff' : 'text.secondary',
                  '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } },
                  '&:hover': { bgcolor: '#edf4ee' } }}>
                <ListItemIcon sx={{ minWidth: labels ? 34 : 0, color: 'inherit', '& svg': { fontSize: 21 } }}>{icons[item.icon]}</ListItemIcon>
                {labels && <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: 'inherit' }} />}
              </ListItemButton>
            </Tooltip>;
          })}
        </List>
      </Box>;
    })}
  </>;
  return <>
    <Box component="nav" aria-label="Admin navigation" sx={{ display: { xs: 'none', md: 'block' }, width: expanded ? 248 : 64,
      flexShrink: 0, bgcolor: 'background.paper', borderRadius: '24px', p: 0.75, position: 'sticky', top: 112,
      maxHeight: 'calc(100vh - 136px)', overflowY: 'auto', scrollbarWidth: 'thin' }}>
      {navigation(expanded)}
    </Box>
    <Drawer open={mobileOpen} onClose={onMobileClose} sx={{ display: { md: 'none' } }}
      PaperProps={{ sx: { width: 288, p: 1.5 } }}>
      <Box component="nav" aria-label="Mobile admin navigation">{navigation(true, true)}</Box>
    </Drawer>
  </>;
};
export default Sidebar;
