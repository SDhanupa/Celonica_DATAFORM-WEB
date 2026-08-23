import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Divider, Grid, Tooltip,
  IconButton, Alert, CircularProgress, Badge
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAuth } from '../auth/AuthProvider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import FactoryIcon from '@mui/icons-material/Factory';

interface Survey {
  id: number;
  user_id: string;
  ccode: string;
  district: string;
  ds_division: string;
  gn_name: string;
  latitude: number;
  longitude: number;
  form_data: any;
  status: string;
  created_at: string;
}

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; color: 'success' | 'primary' | 'default' | 'warning'; icon: string }> = {
    approved: { label: 'Approved',  color: 'success',  icon: '✅' },
    submitted: { label: 'Submitted', color: 'primary',  icon: '📤' },
    draft:     { label: 'Draft',     color: 'default',  icon: '📝' },
  };
  const s = map[status] ?? { label: status, color: 'default', icon: '❓' };
  return (
    <Chip
      label={`${s.icon} ${s.label}`}
      color={s.color}
      size="small"
      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
    />
  );
};

const InfoRow: React.FC<{ label: string; value?: string | number | null; mono?: boolean }> = ({ label, value, mono }) => {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'flex-start' }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 170, flexShrink: 0, pt: 0.2 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2.5, mb: 1.5 }}>
    {icon}
    <Typography variant="subtitle1" fontWeight={700} color="primary">
      {title}
    </Typography>
    <Divider sx={{ flex: 1 }} />
  </Box>
);

const AdminIndustrySurveys: React.FC = () => {
  const { token } = useAuth();
  const [surveys, setSurveys]         = useState<Survey[]>([]);
  const [loading, setLoading]         = useState(false);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterDS, setFilterDS]       = useState('');
  const [filterGN, setFilterGN]       = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [approving, setApproving]     = useState(false);
  const [approveError, setApproveError] = useState('');
  const [approveSuccess, setApproveSuccess] = useState('');

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDistrict) params.append('district', filterDistrict);
      if (filterDS)       params.append('ds_division', filterDS);
      if (filterGN)       params.append('gn_name', filterGN);

      const res = await fetch(`http://localhost:8000/api/industry-surveys?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.data || data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setApproving(true);
    setApproveError('');
    setApproveSuccess('');
    try {
      const res = await fetch(`http://localhost:8000/api/industry-surveys/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setApproveSuccess('Survey approved successfully!');
        fetchSurveys();
        setSurveys(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
        if (selectedSurvey?.id === id) {
          setSelectedSurvey(prev => prev ? { ...prev, status: 'approved' } : null);
        }
      } else {
        setApproveError('Failed to approve survey.');
      }
    } catch {
      setApproveError('Network error while approving.');
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => { fetchSurveys(); }, [filterDistrict, filterDS, filterGN]);

  // Handle nested form_data structure (drafts nest fields under formValues)
  const resolveFormData = (data: any) => {
    if (!data) return {};
    if (data.formValues) return data.formValues;
    return data;
  };

  const fd = (row: Survey) => resolveFormData(row.form_data);

  const columns: GridColDef[] = [
    {
      field: 'b_reg_no',
      headerName: '🏷️ Reg Number',
      width: 190,
      valueGetter: (_p, row) => fd(row).b_reg_no || '—',
      renderCell: (p: GridRenderCellParams) => (
        <Typography
          variant="body2"
          fontFamily="monospace"
          fontWeight={p.value !== '—' ? 800 : 400}
          color={p.value !== '—' ? 'primary.main' : 'text.disabled'}
          sx={{ letterSpacing: p.value !== '—' ? 1 : 0 }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p: GridRenderCellParams) => <StatusChip status={p.row.status} />,
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 110,
      valueGetter: (_p, row) => new Date(row.created_at).toLocaleDateString('en-GB'),
    },
    { field: 'district',    headerName: 'District',    width: 140 },
    { field: 'ds_division', headerName: 'DS Division', width: 160 },
    { field: 'gn_name',     headerName: 'GN Division', width: 170 },
    {
      field: 'b_name',
      headerName: '🏢 Business Name',
      width: 200,
      valueGetter: (_p, row) => fd(row).b_name || '—',
    },
    {
      field: 'b_type_name',
      headerName: '🏭 Business Type',
      width: 180,
      valueGetter: (_p, row) => fd(row).b_type_name || fd(row).b_type || '—',
    },
    {
      field: 'b_owner_name',
      headerName: '👤 Owner',
      width: 160,
      valueGetter: (_p, row) => fd(row).b_owner_name || '—',
    },
    {
      field: 'b_mobile',
      headerName: '📱 Mobile',
      width: 130,
      valueGetter: (_p, row) => fd(row).b_mobile || '—',
    },
    {
      field: 'ccode',
      headerName: 'CCODE',
      width: 100,
      renderCell: (p: GridRenderCellParams) => (
        <Chip label={p.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => { setSelectedSurvey(p.row); setApproveError(''); setApproveSuccess(''); }}
          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const s = selectedSurvey;
  const f = s ? resolveFormData(s.form_data) : {};

  const counts = {
    submitted: surveys.filter(x => x.status === 'submitted').length,
    approved:  surveys.filter(x => x.status === 'approved').length,
    draft:     surveys.filter(x => x.status === 'draft').length,
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FactoryIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">Industry Surveys</Typography>
          <Typography variant="body2" color="text.secondary">Super Admin — All submissions across all GN Divisions</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSurveys} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: surveys.length, color: '#1976d2', bg: '#e3f2fd' },
          { label: 'Submitted', value: counts.submitted, color: '#0288d1', bg: '#e1f5fe' },
          { label: 'Approved', value: counts.approved,  color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'Draft',    value: counts.draft,     color: '#757575', bg: '#f5f5f5' },
        ].map(c => (
          <Paper key={c.label} sx={{ px: 3, py: 2, borderRadius: 3, bgcolor: c.bg, border: `1px solid ${c.color}30`, minWidth: 110 }}>
            <Typography variant="h4" fontWeight={800} color={c.color}>{c.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{c.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderRadius: 3 }}>
        <SearchIcon color="action" />
        <TextField
          label="District" variant="outlined" size="small" value={filterDistrict}
          onChange={e => setFilterDistrict(e.target.value)} sx={{ minWidth: 160 }}
        />
        <TextField
          label="DS Division" variant="outlined" size="small" value={filterDS}
          onChange={e => setFilterDS(e.target.value)} sx={{ minWidth: 160 }}
        />
        <TextField
          label="GN Division" variant="outlined" size="small" value={filterGN}
          onChange={e => setFilterGN(e.target.value)} sx={{ minWidth: 160 }}
        />
        <Button variant="contained" onClick={fetchSurveys} startIcon={<SearchIcon />} sx={{ borderRadius: 2 }}>
          Search
        </Button>
        <Button variant="outlined" onClick={() => { setFilterDistrict(''); setFilterDS(''); setFilterGN(''); }} sx={{ borderRadius: 2 }}>
          Clear
        </Button>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ height: 620, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <DataGrid
          rows={surveys}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 15 } } }}
          pageSizeOptions={[15, 30, 50]}
          getRowClassName={p => {
            if (p.row.status === 'approved') return 'row-approved';
            if (p.row.status === 'draft')    return 'row-draft';
            return 'row-submitted';
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'primary.main', color: 'white', fontWeight: 700 },
            '& .MuiDataGrid-columnHeader': { bgcolor: 'primary.main' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, color: 'white' },
            '& .MuiDataGrid-sortIcon': { color: 'white' },
            '& .row-approved': { bgcolor: '#f1f8e9', '&:hover': { bgcolor: '#dcedc8' } },
            '& .row-draft':    { bgcolor: '#fafafa', color: 'text.secondary', '&:hover': { bgcolor: '#f5f5f5' } },
            '& .row-submitted':{ bgcolor: '#ffffff', '&:hover': { bgcolor: '#f3f4f6' } },
          }}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={!!s} onClose={() => setSelectedSurvey(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FactoryIcon />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {f.b_reg_no ? f.b_reg_no : `Survey #${s?.id}`}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {f.b_name || 'Industry Survey'} &nbsp;·&nbsp; <StatusChip status={s?.status || ''} />
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <StatusChip status={s?.status || ''} />
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {approveError   && <Alert severity="error"   sx={{ mb: 2 }}>{approveError}</Alert>}
          {approveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{approveSuccess}</Alert>}

          {/* Registration & Location */}
          <SectionTitle icon={<LocationOnIcon color="primary" />} title="Registration & Location" />
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Reg Number"      value={f.b_reg_no}      mono />
              <InfoRow label="GN CCODE"        value={s?.ccode}        mono />
              <InfoRow label="District"        value={s?.district} />
              <InfoRow label="DS Division"     value={s?.ds_division} />
              <InfoRow label="GN Division"     value={s?.gn_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label="GPS Latitude"    value={s?.latitude}  mono />
              <InfoRow label="GPS Longitude"   value={s?.longitude} mono />
              <InfoRow label="Survey Date"     value={new Date(s?.created_at || '').toLocaleString('en-GB')} />
              <InfoRow label="Status"          value={s?.status} />
            </Grid>
          </Grid>

          {/* Business Info */}
          <SectionTitle icon={<BusinessIcon color="primary" />} title="Business Information (මූලික තොරතුරු)" />
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Business Name"      value={f.b_name} />
              <InfoRow label="Business Type"      value={f.b_type_name || f.b_type} />
              <InfoRow label="Business Type Code" value={f.b_type} mono />
              <InfoRow label="Registration No"    value={f.b_reg_no} mono />
              <InfoRow label="Address"            value={f.b_address} />
              <InfoRow label="Start Year"         value={f.b_start_year} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label="NIC"                value={f.b_nic} mono />
              <InfoRow label="Mobile"             value={f.b_mobile} />
              <InfoRow label="Email"              value={f.b_email} />
              <InfoRow label="Annual Revenue"     value={f.b_annual_revenue ? `Rs. ${Number(f.b_annual_revenue).toLocaleString()}` : null} />
              <InfoRow label="Employees"          value={f.b_employees} />
            </Grid>
          </Grid>

          {/* Owner Info */}
          <SectionTitle icon={<PersonIcon color="primary" />} title="Owner / Contact Information" />
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Owner Name"         value={f.b_owner_name} />
              <InfoRow label="Owner NIC"          value={f.b_owner_nic || f.b_nic} mono />
              <InfoRow label="Owner Mobile"       value={f.b_owner_mobile || f.b_mobile} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InfoRow label="Owner Email"        value={f.b_owner_email || f.b_email} />
              <InfoRow label="Surveyor Name"      value={f.q_surveyor_name} />
              <InfoRow label="Survey Start Time"  value={f.survey_start_time} />
              <InfoRow label="Survey End Time"    value={f.survey_end_time} />
            </Grid>
          </Grid>

          {/* Production */}
          {(f.q_main_machinery || f.q_main_tools || f.q_main_materials || f.q_production_daily) && (
            <>
              <SectionTitle icon={<FactoryIcon color="primary" />} title="Production & Operations" />
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Daily Production"   value={f.q_production_daily   ? `${f.q_production_daily} units`   : null} />
                  <InfoRow label="Weekly Production"  value={f.q_production_weekly  ? `${f.q_production_weekly} units`  : null} />
                  <InfoRow label="Monthly Production" value={f.q_production_monthly ? `${f.q_production_monthly} units` : null} />
                  <InfoRow label="Yearly Production"  value={f.q_production_yearly  ? `${f.q_production_yearly} units`  : null} />
                  <InfoRow label="Capacity Used"      value={f.q_production_capacity ? `${f.q_production_capacity}%`   : null} />
                  <InfoRow label="Operating Hours/Day" value={f.q_operating_hours  ? `${f.q_operating_hours} hrs`      : null} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Machinery Value"    value={f.q_machinery_value ? `Rs. ${Number(f.q_machinery_value).toLocaleString()}` : null} />
                  <InfoRow label="Machinery Source"   value={f.q_machinery_source} />
                  <InfoRow label="Main Machinery"     value={f.q_main_machinery} />
                  <InfoRow label="Main Tools"         value={f.q_main_tools} />
                  <InfoRow label="Main Materials"     value={f.q_main_materials} />
                  <InfoRow label="Material Sources"   value={f.q_material_sources} />
                </Grid>
              </Grid>
            </>
          )}

          {/* Raw fallback: any remaining form_data fields not shown above */}
          {(() => {
            const shownKeys = new Set([
              'b_name','b_type','b_type_name','b_reg_no','b_address','b_start_year','b_nic','b_mobile',
              'b_email','b_annual_revenue','b_employees','b_owner_name','b_owner_nic','b_owner_mobile',
              'b_owner_email','b_photo','q_surveyor_name','survey_start_time','survey_end_time',
              'q_main_machinery','q_main_tools','q_main_materials','q_machinery_value','q_machinery_source',
              'q_production_daily','q_production_weekly','q_production_monthly','q_production_yearly',
              'q_production_capacity','q_operating_hours','q_material_sources',
            ]);
            const extras = Object.entries(f).filter(([k]) => !shownKeys.has(k));
            if (extras.length === 0) return null;
            return (
              <>
                <SectionTitle icon={<BadgeIcon color="primary" />} title="Additional Survey Data" />
                {extras.map(([k, v]) => (
                  <InfoRow key={k} label={k} value={typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')} />
                ))}
              </>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {s?.status !== 'approved' && (
            <Button
              variant="contained"
              color="success"
              startIcon={approving ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
              disabled={approving}
              onClick={() => handleApprove(s!.id)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {approving ? 'Approving...' : 'Approve Survey'}
            </Button>
          )}
          <Button variant="outlined" onClick={() => setSelectedSurvey(null)} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminIndustrySurveys;
