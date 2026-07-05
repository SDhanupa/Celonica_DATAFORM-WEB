import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Email,
  CalendarToday,
  VpnKey,
  Shield,
  Logout,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { UPDATE_USER_PROFILE } from '../graphql/mutations';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfilePage: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { userInfo, logout } = useAuth();
  const { data, refetch } = useQuery(GET_ME, { errorPolicy: 'ignore' });

  const admin = data?.me || data?.meUser;
  const role = data?.me?.role || userInfo?.realm_roles?.[0] || 'USER';

  const [editOpen, setEditOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const [formData, setFormData] = useState({
    nic: '',
    mobileNumber: '',
    address: '',
    dob: '',
    gender: '',
  });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      setEditOpen(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      refetch();
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: 'Failed to update profile: ' + error.message, severity: 'error' });
    }
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        nic: admin.nic || '',
        mobileNumber: admin.mobileNumber || '',
        address: admin.address || '',
        dob: admin.dob || '',
        gender: admin.gender || '',
      });
    }
  }, [admin]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfile({
      variables: {
        nic: formData.nic,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        dob: formData.dob,
        gender: formData.gender,
      }
    });
  };

  const roleColors: Record<string, 'primary' | 'success' | 'warning'> = {
    SUPER_ADMIN: 'primary',
    ADMIN: 'success',
    MODERATOR: 'warning',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box>
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600 }}>
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your account details
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    mb: 2.5,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {(admin?.name || userInfo?.name || 'A').charAt(0).toUpperCase()}
                  </Avatar>
                </Box>

                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {admin?.name || userInfo?.name || 'Admin'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {admin?.email || userInfo?.email}
                </Typography>

                <Chip
                  icon={<Shield sx={{ fontSize: '14px !important' }} />}
                  label={(role || 'ADMIN').replace('_', ' ')}
                  color={roleColors[role] || 'primary'}
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    mb: 3,
                    px: 1,
                  }}
                />

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Logout />}
                  onClick={() => { onClose(); logout(); }}
                  fullWidth
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Details Card */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ height: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                    Account Information
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditOpen(true)}
                  >
                    Edit
                  </Button>
                </Box>

                {[
                  {
                    icon: <Email />,
                    label: 'Email Address',
                    value: admin?.email || userInfo?.email || '—',
                  },
                  {
                    icon: <VpnKey />,
                    label: 'NIC',
                    value: admin?.nic || '—',
                  },
                  {
                    icon: <CalendarToday />,
                    label: 'Mobile',
                    value: admin?.mobileNumber || '—',
                  },
                  {
                    icon: <Shield />,
                    label: 'Gender',
                    value: admin?.gender || '—',
                  },
                  {
                    icon: <CalendarToday />,
                    label: 'Date of Birth',
                    value: admin?.dob || '—',
                  },
                  {
                    icon: <Email />,
                    label: 'Address',
                    value: admin?.address || '—',
                  },
                  {
                    icon: <VpnKey />,
                    label: 'Keycloak Subject ID',
                    value: admin?.keycloakSub || userInfo?.sub || '—',
                    mono: true,
                  },
                  {
                    icon: <Shield />,
                    label: 'Role',
                    value: (role || 'ADMIN').replace('_', ' '),
                  },
                  {
                    icon: <CalendarToday />,
                    label: 'Member Since',
                    value: admin?.createdAt
                      ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—',
                  },
                  {
                    icon: <CalendarToday />,
                    label: 'Last Login',
                    value: admin?.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleString()
                      : 'Current session',
                  },
                ].map((item, index, arr) => (
                  <Box key={item.label}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        py: 2,
                      }}
                    >
                      <Box
                        sx={{
                          color: 'primary.main',
                          mt: 0.2,
                          p: 1,
                          display: 'flex',
                        }}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { fontSize: 'small' })}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.primary"
                          sx={{
                            fontWeight: 500,
                            fontFamily: item.mono ? 'monospace' : 'inherit',
                            fontSize: item.mono ? '0.85rem' : 'inherit',
                            wordBreak: 'break-all',
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                    {index < arr.length - 1 && (
                      <Divider />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            Edit Profile
          </Typography>
          <IconButton onClick={() => setEditOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIC"
                name="nic"
                value={formData.nic}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleEditChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleEditChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setEditOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProfilePage;
