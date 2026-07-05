import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  PersonAdd,
  Block,
  CheckCircle,
  Edit,
  Search,
  SupervisorAccount,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ADMINS } from '../graphql/queries';
import { REGISTER_ADMIN, UPDATE_ADMIN_ROLE, DEACTIVATE_ADMIN, ACTIVATE_ADMIN } from '../graphql/mutations';

// Fallback mock data in case backend is not connected yet
const MOCK_ADMINS = [
  { id: '1', name: 'Super Admin', email: 'superadmin@celonica.com', role: 'SUPER_ADMIN', isActive: true, keycloakSub: 'kc-001', lastLoginAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '2', name: 'John Doe', email: 'john@celonica.com', role: 'ADMIN', isActive: true, keycloakSub: 'kc-002', lastLoginAt: null, createdAt: new Date().toISOString() },
  { id: '3', name: 'Jane Smith', email: 'jane@celonica.com', role: 'MODERATOR', isActive: false, keycloakSub: 'kc-003', lastLoginAt: null, createdAt: new Date().toISOString() },
];

const roleConfig: Record<string, { label: string; color: 'primary' | 'success' | 'warning' }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'primary' },
  ADMIN: { label: 'Admin', color: 'success' },
  MODERATOR: { label: 'Moderator', color: 'warning' },
};

const AdminsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ keycloakSub: '', email: '', name: '', role: 'ADMIN' });
  const [successMsg, setSuccessMsg] = useState('');

  const { data, loading, refetch } = useQuery(GET_ADMINS, { errorPolicy: 'ignore' });
  const [registerAdmin] = useMutation(REGISTER_ADMIN);
  const [updateAdminRole] = useMutation(UPDATE_ADMIN_ROLE);
  const [deactivateAdmin] = useMutation(DEACTIVATE_ADMIN);
  const [activateAdmin] = useMutation(ACTIVATE_ADMIN);

  const admins = data?.admins || MOCK_ADMINS;

  const filtered = admins.filter(
    (a: any) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAdmin = async () => {
    try {
      await registerAdmin({ variables: newAdmin });
      setAddOpen(false);
      setNewAdmin({ keycloakSub: '', email: '', name: '', role: 'ADMIN' });
      setSuccessMsg('Admin registered successfully!');
      refetch();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateAdminRole({ variables: { id: selectedAdmin.id, role: selectedAdmin.role } });
      setEditOpen(false);
      setSuccessMsg('Role updated successfully!');
      refetch();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (admin: any) => {
    try {
      if (admin.isActive) {
        await deactivateAdmin({ variables: { id: admin.id } });
      } else {
        await activateAdmin({ variables: { id: admin.id } });
      }
      setSuccessMsg(`Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully!`);
      refetch();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600, mb: 0.5 }}>
            Admin Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage administrator accounts and their permissions
          </Typography>
        </Box>
        <Button
          id="add-admin-btn"
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={() => setAddOpen(true)}
        >
          Add Admin
        </Button>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          id="admin-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400, bgcolor: 'background.paper' }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e9ecef', borderRadius: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Admin</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((admin: any) => (
                <TableRow key={admin.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {admin.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {admin.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {admin.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<SupervisorAccount sx={{ fontSize: '14px !important' }} />}
                      label={roleConfig[admin.role]?.label || admin.role}
                      size="small"
                      color={roleConfig[admin.role]?.color || 'primary'}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={admin.isActive ? 'success' : 'error'}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Edit Role">
                        <IconButton
                          id={`edit-role-${admin.id}`}
                          size="small"
                          color="primary"
                          onClick={() => { setSelectedAdmin({ ...admin }); setEditOpen(true); }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={admin.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          id={`toggle-active-${admin.id}`}
                          size="small"
                          color={admin.isActive ? 'error' : 'success'}
                          onClick={() => handleToggleActive(admin)}
                        >
                          {admin.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Register New Admin</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField
            label="Full Name"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email Address"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="Keycloak Subject ID"
            value={newAdmin.keycloakSub}
            onChange={(e) => setNewAdmin({ ...newAdmin, keycloakSub: e.target.value })}
            fullWidth
            helperText="Found in Keycloak admin console under the user's details"
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newAdmin.role}
              label="Role"
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            >
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MODERATOR">Moderator</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setAddOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddAdmin}>
            Register Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Update Role</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changing role for: <strong>{selectedAdmin?.name}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedAdmin?.role || 'ADMIN'}
              label="Role"
              onChange={(e) => setSelectedAdmin({ ...selectedAdmin, role: e.target.value })}
            >
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MODERATOR">Moderator</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateRole}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminsPage;
