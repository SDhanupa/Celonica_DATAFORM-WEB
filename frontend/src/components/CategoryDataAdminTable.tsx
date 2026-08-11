import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from '../auth/AuthProvider';

interface CategoryDataAdminTableProps {
  slug: string;
  districtId?: string;
  dsDivisionCode?: string;
  gnId?: string;
  hideIfEmpty?: boolean;
  categoryName?: string;
}

const CategoryDataAdminTable: React.FC<CategoryDataAdminTableProps> = ({ slug, districtId, dsDivisionCode, gnId, hideIfEmpty, categoryName }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // Edit & Delete state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch data function extracted so it can be re-used after edit/delete
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (districtId) params.append('district_id', districtId);
      if (dsDivisionCode) params.append('ds_division_code', dsDivisionCode);
      if (gnId) params.append('gn_id', gnId);
      
      const queryString = params.toString() ? '?' + params.toString() : '';

      const response = await fetch(`/api/category-data/${slug}${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      if (result.success) {
        const rowsWithIds = result.data.map((row: any, index: number) => ({
          ...row,
          id: row.id || index
        }));
        setData(rowsWithIds);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug, token, districtId, dsDivisionCode, gnId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        fetchData();
      } else {
        alert('Failed to delete: ' + result.message);
      }
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (row: any) => {
    setEditData({ ...row });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editData) return;
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/${editData.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      const result = await response.json();
      if (result.success) {
        setEditModalOpen(false);
        fetchData();
      } else {
        alert('Failed to update: ' + result.message);
      }
    } catch (err: any) {
      alert('Error updating: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    if (hideIfEmpty) return null;
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (data.length === 0) {
    if (hideIfEmpty) return null;
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available for your selected location.
      </Alert>
    );
  }

  const columns: GridColDef[] = [
    { field: 'reg_number', headerName: 'Reg Number', width: 130 },
    { field: 'name_en', headerName: 'Name (EN)', width: 180 },
    { field: 'name_si', headerName: 'Name (SI)', width: 180 },
    { field: 'name_ta', headerName: 'Name (TA)', width: 180 },
    { field: 'district_name', headerName: 'District', width: 130 },
    { field: 'ds_name', headerName: 'DS Division', width: 150 },
    { field: 'gn_name', headerName: 'GN Name', width: 150 },
    { field: 'mobile', headerName: 'Mobile', width: 130 },
    { field: 'contact_person_name', headerName: 'Contact Person', width: 150 },
    { field: 'address', headerName: 'Address', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditClick(params.row)} color="primary" size="small" disabled={actionLoading}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small" disabled={actionLoading}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 4, mb: 4, height: 500, width: '100%' }}>
      {categoryName ? (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {categoryName} (Admin View)
        </Typography>
      ) : (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Bulk Uploaded Data (Admin View)
        </Typography>
      )}
      <DataGrid
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />

      {/* Edit Dialog */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent dividers>
          {editData && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Reg Number" name="reg_number" value={editData.reg_number || ''} onChange={handleEditChange} fullWidth size="small" />
              <TextField label="Name (EN)" name="name_en" value={editData.name_en || ''} onChange={handleEditChange} fullWidth size="small" />
              <TextField label="Name (SI)" name="name_si" value={editData.name_si || ''} onChange={handleEditChange} fullWidth size="small" />
              <TextField label="Name (TA)" name="name_ta" value={editData.name_ta || ''} onChange={handleEditChange} fullWidth size="small" />
              <TextField label="Mobile" name="mobile" value={editData.mobile || ''} onChange={handleEditChange} fullWidth size="small" />
              <TextField label="Contact Person" name="contact_person_name" value={editData.contact_person_name || ''} onChange={handleEditChange} fullWidth size="small" />
              <TextField label="Address" name="address" value={editData.address || ''} onChange={handleEditChange} fullWidth size="small" multiline rows={2} />
              <TextField label="Description" name="description" value={editData.description || ''} onChange={handleEditChange} fullWidth size="small" multiline rows={2} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="inherit" disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryDataAdminTable;
