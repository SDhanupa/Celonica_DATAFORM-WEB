import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, InputAdornment, Tabs, Tab, LinearProgress,
} from '@mui/material';
import { PersonAddOutlined, Block, CheckCircleOutline, EditOutlined, Search, ArrowForward, Refresh, GroupOutlined, ShieldOutlined } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ADMINS } from '../graphql/queries';
import { REGISTER_ADMIN, UPDATE_ADMIN_ROLE, DEACTIVATE_ADMIN, ACTIVATE_ADMIN } from '../graphql/mutations';

interface AdminRecord { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt?: string; createdAt?: string; }
const roleConfig: Record<string, { label: string; color: string; background: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: '#176247', background: '#e9f4ed' },
  ADMIN: { label: 'Admin', color: '#315b79', background: '#eaf1f6' },
  MODERATOR: { label: 'Moderator', color: '#815e19', background: '#f8f2e2' },
};
const formatDate = (value?: string) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const AdminsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRecord | null>(null);
  const [newAdmin, setNewAdmin] = useState({ keycloakSub: '', email: '', name: '', role: 'ADMIN' });
  const [successMsg, setSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const { data, loading, error, refetch } = useQuery<{ admins: AdminRecord[] }>(GET_ADMINS, { fetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true });
  const [registerAdmin] = useMutation(REGISTER_ADMIN);
  const [updateAdminRole] = useMutation(UPDATE_ADMIN_ROLE);
  const [deactivateAdmin] = useMutation(DEACTIVATE_ADMIN);
  const [activateAdmin] = useMutation(ACTIVATE_ADMIN);
  const admins = data?.admins ?? [];
  const activeCount = admins.filter(a => a.isActive).length;
  const filtered = admins.filter(a =>
    `${a.name || ''} ${a.email || ''}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (status === 'all' || a.isActive === (status === 'active')) && (roleFilter === 'all' || a.role === roleFilter));
  const loaded = Boolean(data) && !error;
  const runAction = async (action: () => Promise<unknown>, message: string, close?: () => void) => {
    setSaving(true); setActionError(''); setSuccessMsg('');
    try { await action(); close?.(); setSuccessMsg(message); await refetch(); }
    catch { setActionError('The change could not be saved. Check your connection and permissions, then try again.'); }
    finally { setSaving(false); }
  };
  const handleAddAdmin = () => runAction(() => registerAdmin({ variables: { ...newAdmin, name: newAdmin.name.trim(), email: newAdmin.email.trim(), keycloakSub: newAdmin.keycloakSub.trim() } }), 'Administrator registered successfully.', () => { setAddOpen(false); setNewAdmin({ keycloakSub: '', email: '', name: '', role: 'ADMIN' }); });
  const handleUpdateRole = () => { if (selectedAdmin) void runAction(() => updateAdminRole({ variables: { id: selectedAdmin.id, role: selectedAdmin.role } }), 'Role updated successfully.', () => setEditOpen(false)); };
  const handleToggleActive = (admin: AdminRecord) => runAction(() => admin.isActive ? deactivateAdmin({ variables: { id: admin.id } }) : activateAdmin({ variables: { id: admin.id } }), `Administrator ${admin.isActive ? 'deactivated' : 'activated'} successfully.`);
  const clearFilters = () => { setSearch(''); setStatus('all'); setRoleFilter('all'); };

  const accountActions = (admin: AdminRecord) => (<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit role"><span><IconButton aria-label={`Edit role for ${admin.name}`} disabled={saving} onClick={() => { setActionError(''); setSelectedAdmin({ ...admin }); setEditOpen(true); }} sx={{ width: 40, height: 40 }}><EditOutlined sx={{ fontSize: 18 }} /></IconButton></span></Tooltip>
                    <Tooltip title={admin.isActive ? 'Deactivate' : 'Activate'}><span><IconButton aria-label={`${admin.isActive ? 'Deactivate' : 'Activate'} ${admin.name}`} disabled={saving} onClick={() => handleToggleActive(admin)} sx={{ width: 40, height: 40, color: admin.isActive ? 'text.secondary' : 'primary.main' }}>{admin.isActive ? <Block sx={{ fontSize: 18 }} /> : <CheckCircleOutline sx={{ fontSize: 18 }} />}</IconButton></span></Tooltip>
                  </Box>);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography component="h1" variant="h4" sx={{ mb: 0.75 }}>Admin management</Typography>
          <Typography color="text.secondary">Your team, their roles, and access to Ceylonica.</Typography>
        </Box>
        <Button id="add-admin-btn" variant="contained" startIcon={<PersonAddOutlined />} onClick={() => { setActionError(''); setAddOpen(true); }}>Add Admin</Button>
      </Box>
      {successMsg && <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>{successMsg}</Alert>}
      {actionError && !addOpen && !editOpen && <Alert severity="error" onClose={() => setActionError('')} sx={{ mb: 2 }}>{actionError}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => refetch()}>Retry</Button>}>Unable to load administrator accounts.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Total administrators', value: admins.length, detail: 'Across all team roles', icon: <GroupOutlined />, featured: true },
          { label: 'Active accounts', value: activeCount, detail: 'Enabled administrator accounts', icon: <CheckCircleOutline />, featured: false },
          { label: 'Inactive accounts', value: admins.length - activeCount, detail: 'Administrator access disabled', icon: <Block />, featured: false },
        ].map(metric => <Paper key={metric.label} elevation={0} sx={{ p: { xs: 2, sm: 3 }, display: { xs: 'grid', sm: 'block' }, gridTemplateColumns: '1fr auto', alignItems: 'center', columnGap: 2, borderRadius: '24px', bgcolor: metric.featured ? 'primary.main' : 'background.paper', color: metric.featured ? '#fff' : 'text.primary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: { xs: 0, sm: 2 }, '& > svg': { display: { xs: 'none', sm: 'block' } } }}>
            <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 500 }}>{metric.label}</Typography>{metric.icon}
          </Box>
          <Typography sx={{ fontSize: { xs: 32, sm: 40 }, gridColumn: { xs: 2, sm: 'auto' }, gridRow: { xs: '1 / 3', sm: 'auto' }, lineHeight: 1.15, fontWeight: 500, color: 'inherit', fontVariantNumeric: 'tabular-nums' }}>{loaded ? metric.value : '—'}</Typography>
          <Typography variant="caption" sx={{ color: metric.featured ? '#e0f4e9' : 'text.secondary', display: 'block', mt: { xs: 0.5, sm: 1 } }}>{metric.detail}</Typography>
        </Paper>)}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', '@media (min-width: 1350px)': { gridTemplateColumns: 'minmax(0, 1fr) 260px' }, gap: 3, alignItems: 'start' }}>
        <Paper elevation={0} sx={{ borderRadius: '24px', overflow: 'hidden', minWidth: 0 }}>
          <Box sx={{ p: { xs: 2, md: 3 }, pb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box><Typography component="h2" variant="h5">Administrator directory</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage who can access your workspace.</Typography></Box>
              <Tooltip title="Refresh accounts"><IconButton aria-label="Refresh accounts" onClick={() => refetch()} disabled={loading}><Refresh fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
              <TextField id="admin-search" placeholder="Search by name or email" value={search} onChange={e => setSearch(e.target.value)} size="small"
                inputProps={{ 'aria-label': 'Search administrators' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ flex: '1 1 230px' }} />
              <FormControl size="small" sx={{ minWidth: 150, flex: { xs: '1 1 150px', sm: '0 0 160px' } }}><InputLabel id="role-filter-label">Role</InputLabel>
                <Select labelId="role-filter-label" label="Role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><MenuItem value="all">All roles</MenuItem>{Object.entries(roleConfig).map(([key, role]) => <MenuItem key={key} value={key}>{role.label}</MenuItem>)}</Select>
              </FormControl>
            </Box>
            <Tabs value={status} onChange={(_, value) => setStatus(value)} aria-label="Filter administrators by status" variant="scrollable" scrollButtons="auto" sx={{ '& .MuiTab-root': { minWidth: 70, px: 1.5 } }}>
              <Tab label={`All accounts${loaded ? ` (${admins.length})` : ''}`} value="all" /><Tab label="Active" value="active" /><Tab label="Inactive" value="inactive" />
            </Tabs>
          </Box>
          {loading && <LinearProgress aria-label="Loading administrators" />}
          <TableContainer sx={{ overflowX: 'auto', display: { xs: 'none', sm: 'block' } }} tabIndex={0} aria-label="Administrator directory, scroll horizontally for more columns">
            <Table sx={{ minWidth: 710, '& .MuiTableCell-root': { px: 1.5 }, '& .MuiTableCell-root:first-of-type': { pl: 3 } }} aria-label="Administrators">
              <TableHead><TableRow><TableCell>Administrator</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Last login</TableCell><TableCell>Joined</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {loading && !data ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} aria-label="Loading accounts" /></TableCell></TableRow> : filtered.map(admin => <TableRow key={admin.id} hover>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ bgcolor: '#edf4ee', color: '#216344', width: 40, height: 40, fontSize: 15 }}>{admin.name?.charAt(0).toUpperCase() || '?'}</Avatar><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{admin.name || 'Unnamed administrator'}</Typography><Typography variant="caption" color="text.secondary">{admin.email}</Typography></Box></Box></TableCell>
                  <TableCell><Chip size="small" label={roleConfig[admin.role]?.label || admin.role} sx={{ color: roleConfig[admin.role]?.color, bgcolor: roleConfig[admin.role]?.background, fontSize: 11 }} /></TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: admin.isActive ? '#176247' : 'text.secondary' }}><Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: admin.isActive ? '#168453' : '#929b94' }} />{admin.isActive ? 'Active' : 'Inactive'}</Box></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12, color: 'text.secondary' }}>{admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12, color: 'text.secondary' }}>{formatDate(admin.createdAt)}</TableCell>
                  <TableCell align="right">{accountActions(admin)}</TableCell>
                </TableRow>)}
                {!loading && !error && filtered.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><Typography sx={{ fontWeight: 600 }}>No administrators found</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Try a different name, role or account status.</Typography><Button onClick={clearFilters} sx={{ mt: 1 }}>Clear filters</Button></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }} aria-label="Administrator accounts">
            {filtered.map(admin => <Box key={admin.id} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#edf4ee', color: '#216344', width: 36, height: 36 }}>{admin.name?.charAt(0).toUpperCase() || '?'}</Avatar>
                <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{admin.name}</Typography><Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{admin.email}</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><Chip size="small" label={roleConfig[admin.role]?.label || admin.role} sx={{ color: roleConfig[admin.role]?.color, bgcolor: roleConfig[admin.role]?.background }} /><Typography variant="caption" color="text.secondary">{admin.isActive ? 'Active' : 'Inactive'}</Typography></Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Last login: {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'} · Joined: {formatDate(admin.createdAt)}</Typography>
              {accountActions(admin)}
            </Box>)}
            {!loading && !error && filtered.length === 0 && <Box sx={{ p: 3, textAlign: 'center' }}><Typography sx={{ fontWeight: 600 }}>No administrators found</Typography><Typography variant="body2" color="text.secondary">Try another name, role or status.</Typography><Button onClick={clearFilters}>Clear filters</Button></Box>}
          </Box>
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary" aria-live="polite">{loaded ? `Showing ${filtered.length} of ${admins.length} administrators` : loading ? 'Loading accounts…' : 'Account data unavailable'}</Typography></Box>
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, '@media (min-width: 1350px)': { gridTemplateColumns: '1fr' }, gap: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}><Typography component="h2" variant="h5">Team roles</Typography><ShieldOutlined sx={{ color: 'text.secondary', fontSize: 21 }} /></Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Account distribution by role</Typography>
            {Object.entries(roleConfig).map(([key, role]) => {
              const count = admins.filter(a => a.role === key).length;
              return <Box key={key} sx={{ mt: 2.5 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2">{role.label}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{loaded ? count : '—'}</Typography></Box><LinearProgress variant="determinate" value={loaded && admins.length ? count / admins.length * 100 : 0} aria-label={`${role.label} share`} sx={{ height: 5, borderRadius: 3, bgcolor: '#edf1ed', '& .MuiLinearProgress-bar': { bgcolor: role.color, borderRadius: 3 } }} /></Box>;
            })}
          </Paper>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px' }}>
            <Typography component="h2" variant="h5" sx={{ mb: 1 }}>Continue your work</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Move between team and content management.</Typography>
            <Button fullWidth endIcon={<ArrowForward fontSize="small" />} onClick={() => navigate('/registration')} sx={{ justifyContent: 'space-between', px: 0 }}>Register user</Button>
            <Button fullWidth endIcon={<ArrowForward fontSize="small" />} onClick={() => navigate('/approvals')} sx={{ justifyContent: 'space-between', px: 0 }}>Review approvals</Button>
          </Paper>
        </Box>
      </Box>
      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onClose={() => { if (!saving) setAddOpen(false); }} aria-labelledby="register-admin-title" maxWidth="sm" fullWidth>
        <DialogTitle id="register-admin-title" sx={{ fontWeight: 600 }}>Register new administrator</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          {actionError && <Alert severity="error">{actionError}</Alert>}
          <TextField
            autoFocus required disabled={saving}
            label="Full Name"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            fullWidth
          />
          <TextField
            required disabled={saving} type="email" label="Email Address"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            fullWidth
          />
          <TextField
            required disabled={saving} label="Keycloak Subject ID"
            value={newAdmin.keycloakSub}
            onChange={(e) => setNewAdmin({ ...newAdmin, keycloakSub: e.target.value })}
            fullWidth
            helperText="Found in Keycloak admin console under the user's details"
          />
          <FormControl fullWidth disabled={saving}>
            <InputLabel id="register-role-label">Role</InputLabel>
            <Select
              labelId="register-role-label" value={newAdmin.role}
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
          <Button disabled={saving} onClick={() => setAddOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" disabled={saving || !newAdmin.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email.trim()) || !newAdmin.keycloakSub.trim()} onClick={handleAddAdmin}>
            {saving ? 'Registering…' : 'Register Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onClose={() => { if (!saving) setEditOpen(false); }} aria-labelledby="edit-role-title" maxWidth="xs" fullWidth>
        <DialogTitle id="edit-role-title" sx={{ fontWeight: 600 }}>Update role</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changing role for: <strong>{selectedAdmin?.name}</strong>
          </Typography>
          <FormControl fullWidth disabled={saving}>
            <InputLabel id="edit-role-label">Role</InputLabel>
            <Select
              labelId="edit-role-label" value={selectedAdmin?.role || 'ADMIN'}
              label="Role"
              onChange={(e) => setSelectedAdmin(selectedAdmin ? { ...selectedAdmin, role: e.target.value } : null)}
            >
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MODERATOR">Moderator</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button disabled={saving} onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" disabled={saving} onClick={handleUpdateRole}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AdminsPage;
