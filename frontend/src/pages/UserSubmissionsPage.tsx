import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from '../auth/AuthProvider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FindReplaceIcon from '@mui/icons-material/FindReplace';

const UserSubmissionsPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { token, userInfo } = useAuth();

  const isSuperAdmin = userInfo?.role === 'super_admin';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        // Only show current user's submissions if not super_admin
        const filtered = isSuperAdmin 
          ? json.data 
          : json.data.filter((row: any) => row.added_by_user_id === parseInt(userInfo?.id || '0'));
        setData(filtered.map((r: any, idx: number) => ({...r, unique_id: `${r.category_slug}_${r.id}` })));
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, userInfo, isSuperAdmin]);

  const handleApprove = async (row: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${row.category_slug}/${row.id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplace = async (row: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${row.category_slug}/${row.id}/replace`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'category_name', headerName: 'Category', width: 150 },
    { field: 'reg_number', headerName: 'Reg Number', width: 130 },
    { field: 'name_en', headerName: 'Name (EN)', width: 150 },
    { field: 'raw_gn', headerName: 'GN Code', width: 100 },
    { field: 'is_update_proposal', headerName: 'Type', width: 130, renderCell: (p) => (
       <Typography variant="body2" color={p.value ? "warning.main" : "info.main"} sx={{ fontWeight: 'bold' }}>
         {p.value ? "Update Proposal" : "New Record"}
       </Typography>
    )},
    { field: 'coordinate_mismatch', headerName: 'Geo Match', width: 120, renderCell: (p) => (
       <Typography variant="body2" color={p.value ? "error.main" : "success.main"}>
         {p.value ? "Mismatch" : "OK"}
       </Typography>
    )},
  ];

  if (isSuperAdmin) {
    columns.push({
      field: 'actions',
      headerName: 'Admin Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          {params.row.is_update_proposal ? (
            <Button size="small" variant="contained" color="warning" startIcon={<FindReplaceIcon />} onClick={() => handleReplace(params.row)} disabled={actionLoading}>
              Replace
            </Button>
          ) : (
            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(params.row)} disabled={actionLoading}>
              Approve
            </Button>
          )}
        </Box>
      )
    });
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        {isSuperAdmin ? 'Master User Submissions' : 'My Submissions'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ height: 600, width: '100%', p: 2 }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.unique_id}
          disableRowSelectionOnClick
          getRowClassName={(params) => {
             if (params.row.coordinate_mismatch) return 'mismatch-row';
             return '';
          }}
          sx={{
            '& .mismatch-row': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default UserSubmissionsPage;
