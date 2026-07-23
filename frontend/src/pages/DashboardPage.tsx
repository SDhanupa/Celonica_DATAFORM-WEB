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
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
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
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h3" color="text.primary" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 50,
            height: 50,
            bgcolor: `${color}.main`,
            color: '#fff',
            borderRadius: '100%', // Circle avatars in stat cards
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
              fontWeight: 500,
            }}
          />
        )}
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Simulated stats
const mockStats = {
  totalAdmins: 5,
  activeAdmins: 4,
  totalUsers: 1248,
  totalQuestions: 342,
  totalReports: 28,
  pendingReports: 7,
};

const recentActivity = [
  { action: 'New admin registered', user: 'john@example.com', time: '2 min ago', type: 'success' },
  { action: 'Question reported', user: 'user123', time: '15 min ago', type: 'warning' },
  { action: 'User deactivated', user: 'spam_user', time: '1 hr ago', type: 'error' },
  { action: 'New user registered', user: 'mary@mail.com', time: '2 hr ago', type: 'success' },
  { action: 'Admin role updated', user: 'mike@admin.com', time: '3 hr ago', type: 'info' },
];

const DashboardPage: React.FC = () => {
  const { userInfo } = useAuth();
  const { data, refetch } = useQuery(GET_ME, { errorPolicy: 'ignore' });

  const needsOnboarding = data?.needsOnboarding === true;
  const adminName = data?.me?.name || userInfo?.name || 'User';
  const roles = userInfo?.realm_roles || [];
  const isAdmin = roles.includes('super_admin') || roles.includes('admin');

  if (!isAdmin) {
    return (
      <Box>
        <TopNavbar />
        <UserDashboard user={data?.me || data?.meUser || userInfo} />
      </Box>
    );
  }

  return (
    <AdminLayout>
      <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600, mb: 0.5 }}>
          Welcome back, {adminName.split(' ')[0]}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening on your platform today.
        </Typography>
      </Box>

      {/* Welcome Card */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.2) 0%, rgba(108, 99, 255, 0.05) 100%)',
          border: '1px solid rgba(108, 99, 255, 0.2)',
          mb: 3,
          width: '100%',
        }}
      >
        <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#E8E8FF', mb: 1 }}>
              Welcome back, {data?.me?.name || data?.meUser?.firstName || 'User'}! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: '#9898CC', maxWidth: 600 }}>
              Here's what's happening on your platform today. You have {mockStats.pendingReports} pending reports that require your attention.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Admins"
            value={mockStats.totalAdmins}
            subtitle={`${mockStats.activeAdmins} active`}
            icon={<AdminsIcon />}
            color="primary"
            trend="+1 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Users"
            value={mockStats.totalUsers.toLocaleString()}
            subtitle="Registered accounts"
            icon={<UsersIcon />}
            color="success"
            trend="+48 today"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Questions"
            value={mockStats.totalQuestions}
            subtitle="Published questions"
            icon={<QuestionsIcon />}
            color="warning"
            trend="+12 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Reports"
            value={mockStats.totalReports}
            subtitle={`${mockStats.pendingReports} pending review`}
            icon={<ReportsIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500, mb: 3 }}>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivity.map((item, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: `${item.type}.main`,
                          color: '#fff',
                        }}
                      >
                        {item.user.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                          {item.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.user}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {item.time}
                      </Typography>
                    </Box>
                    {index < recentActivity.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Test Accounts & System Health */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Test Accounts Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500, mb: 3 }}>
                🔑 Test Credentials
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
                  <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1, fontWeight: 700 }}>
                    Admin Account
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                    Email: admin@ceylonica.com
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                    Pass: Password@123
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.2)' }}>
                  <Typography variant="subtitle2" color="success.main" sx={{ mb: 1, fontWeight: 700 }}>
                    Normal User Account
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                    Email: user@ceylonica.com
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ fontFamily: 'monospace' }}>
                    Pass: Password@123
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500, mb: 3 }}>
                System Status
              </Typography>
              {[
                { label: 'API Response', value: 98, color: 'success', status: 'Healthy' },
                { label: 'Database', value: 87, color: 'primary', status: 'Normal' },
                { label: 'Auth Service', value: 100, color: 'success', status: 'Online' },
                { label: 'Storage', value: 64, color: 'warning', status: 'Moderate' },
              ].map((metric) => (
                <Box key={metric.label} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                      {metric.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={metric.value >= 80 ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Warning sx={{ fontSize: '14px !important' }} />}
                        label={metric.status}
                        size="small"
                        color={metric.color as any}
                        variant="outlined"
                        sx={{ height: 22, fontWeight: 500 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35, textAlign: 'right' }}>
                        {metric.value}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.value}
                    color={metric.color as any}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;
