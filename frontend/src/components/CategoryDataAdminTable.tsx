import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useAuth } from '../auth/AuthProvider';

interface CategoryDataAdminTableProps {
  slug: string;
  districtId?: string;
  dsDivisionCode?: string;
  gnId?: string;
  hideIfEmpty?: boolean;
  categoryName?: string;
  filterType?: 'mapped' | 'unmapped' | 'all';
}

const CategoryDataAdminTable: React.FC<CategoryDataAdminTableProps> = ({ slug, districtId, dsDivisionCode, gnId, hideIfEmpty, categoryName, filterType }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // Edit & Delete state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Bulk Delete state
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  
  // Fetch data function extracted so it can be re-used after edit/delete
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (districtId) params.append('district_id', districtId);
      if (dsDivisionCode) params.append('ds_division_code', dsDivisionCode);
      if (gnId) params.append('gn_id', gnId);
      if (filterType === 'mapped') params.append('mapped_only', 'true');
      if (filterType === 'unmapped') params.append('unmapped_only', 'true');
      
      const queryString = params.toString() ? '?' + params.toString() : '';

      const response = await fetch(`/api/category-data/${slug}${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
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

  const handleDeleteClick = (row: any) => {
    setRecordToDelete(row);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/${recordToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setDeleteModalOpen(false);
        setRecordToDelete(null);
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

  const handleBulkDeleteSubmit = async () => {
    if (rowSelectionModel.length === 0) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ids: rowSelectionModel })
      });
      const result = await response.json();
      if (result.success) {
        setBulkDeleteModalOpen(false);
        setRowSelectionModel([]);
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
    setSelectedFile(null);
    setEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = async () => {
    if (!editData) return;
    try {
      setActionLoading(true);

      // If a file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const imageRes = await fetch(`/api/category-data/${slug}/${editData.id}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
        });
        const imageResult = await imageRes.json();
        if (!imageResult.success) {
            alert('Failed to upload image: ' + (imageResult.message || imageResult.error || JSON.stringify(imageResult)));
            setActionLoading(false);
            return; // Stop saving if image upload fails
        }
      }

      // Then save the rest of the text data
      const response = await fetch(`/api/category-data/${slug}/${editData.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
    {
      field: 'image_path',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img 
              src={`/api/uploads/category_images/${params.value}`} 
              alt="thumbnail" 
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          </Box>
        );
      }
    },
    { field: 'reg_number', headerName: 'Reg Number', width: 130 },
    { field: 'name_en', headerName: 'Name (EN)', width: 180 },
    { field: 'name_si', headerName: 'Name (SI)', width: 180 },
    { field: 'name_ta', headerName: 'Name (TA)', width: 180 },
    { field: 'national', headerName: 'National', width: 100, valueGetter: () => 'Sri Lanka' },
    { field: 'province_name', headerName: 'Province', width: 130 },
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
          <IconButton onClick={() => handleDeleteClick(params.row)} color="error" size="small" disabled={actionLoading}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 4, mb: 4, height: 500, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {categoryName ? (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {categoryName} (Admin View)
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bulk Uploaded Data (Admin View)
          </Typography>
        )}
        
        {rowSelectionModel.length > 0 && (
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => setBulkDeleteModalOpen(true)}
            disabled={actionLoading}
          >
            Delete Selected ({rowSelectionModel.length})
          </Button>
        )}
      </Box>
      <DataGrid
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        checkboxSelection
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
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
              
              <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Image Upload (Max 50MB)</Typography>
                {editData.image_path && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={`/api/uploads/category_images/${editData.image_path}`} 
                      alt="Current" 
                      style={{ maxHeight: 100, borderRadius: 4 }} 
                    />
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ flex: 1 }} 
                  />
                </Box>
              </Box>
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this record?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="inherit" disabled={actionLoading}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {rowSelectionModel.length} selected records?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteModalOpen(false)} color="inherit" disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleBulkDeleteSubmit} variant="contained" color="error" disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete All Selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryDataAdminTable;
