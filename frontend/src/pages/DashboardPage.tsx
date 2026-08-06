import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  SupervisorAccount as AdminsIcon,
  People as UsersIcon,
  Quiz as QuestionsIcon,
  Flag as ReportsIcon,
  TrendingUp,
  CheckCircle,
  Warning,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useQuery } from '@apollo/client';
import { GET_ME, GET_DASHBOARD_STATS } from '../graphql/queries';
import UserDashboard from './UserDashboard';
import TopNavbar from '../components/TopNavbar';
import AdminLayout from '../components/AdminLayout';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, trend }) => (
  <Card sx={{ 
    height: '100%', 
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      '& .MuiAvatar-root': {
        transform: 'scale(1.1)',
      }
    }
  }}>
    {/* Decorative blur blob */}
    <Box sx={{
      position: 'absolute',
      top: -20,
      right: -20,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: (theme) => `linear-gradient(135deg, ${theme.palette[color].light}40, ${theme.palette[color].main}20)`,
      filter: 'blur(20px)',
      zIndex: 0,
      pointerEvents: 'none'
    }} />
    
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Typography variant="h3" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 54,
            height: 54,
            bgcolor: `${color}.main`,
            color: '#fff',
            borderRadius: 3,
            transition: 'transform 0.3s ease',
            boxShadow: `0 8px 16px rgba(0,0,0,0.1)`
          }}
        >
          {icon}
        </Avatar>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
        {trend && (
          <Chip
            icon={<TrendingUp sx={{ fontSize: '14px !important' }} />}
            label={trend}
            size="small"
            color="success"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          />
        )}
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);



const DashboardPage: React.FC = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const { gnName, ccode } = useParams<{ gnName: string; ccode: string }>();
  const { data, refetch } = useQuery(GET_ME, { errorPolicy: 'ignore' });
  const { data: statsData } = useQuery(GET_DASHBOARD_STATS, { 
    errorPolicy: 'ignore', 
    skip: !['super_admin', 'admin', 'moderator'].some(r => userInfo?.realm_roles?.includes(r)) 
  });

  const stats = statsData?.dashboardStats || {
    totalAdmins: 0,
    activeAdmins: 0,
    totalUsers: 0,
    totalQuestions: 0,
    totalReports: 0,
    pendingReports: 0,
  };

  const needsOnboarding = data?.needsOnboarding === true;
  const adminName = data?.me?.name || userInfo?.name || 'User';
  const roles = userInfo?.realm_roles || [];
  const isAdmin = roles.includes('super_admin') || roles.includes('admin') || roles.includes('moderator');

  // /gnpage is the public census data explorer - ALWAYS show UserDashboard here.
  // Admins can visit their admin panel via /admins, /users, /approvals, etc.
  // We only show the admin panel when gnName AND ccode are both missing AND the user
  // navigated here via an admin route (handled by separate admin-only routes).
  // On the /gnpage route, always show UserDashboard regardless of role.
  return (
    <Box>
      <UserDashboard user={data?.me || data?.meUser || userInfo} />
    </Box>
  );

};

export default DashboardPage;
