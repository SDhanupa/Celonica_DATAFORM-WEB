import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';
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

  // Snackbar for reg number feedback
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [totalRowCount, setTotalRowCount] = useState(0);

  // Bulk Delete state
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  
  // Bulk Generate state
  const [bulkGenerateSkippedModalOpen, setBulkGenerateSkippedModalOpen] = useState(false);
  const [bulkGenerateSkippedNames, setBulkGenerateSkippedNames] = useState<string[]>([]);
  const [bulkGenerateStats, setBulkGenerateStats] = useState<{ total: number; generated: number }>({ total: 0, generated: 0 });
  const [bulkGenerateExcludeIds, setBulkGenerateExcludeIds] = useState<number[]>([]);
  
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
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', paginationModel.pageSize.toString());
      params.append('offset', (paginationModel.page * paginationModel.pageSize).toString());
      params.append('is_admin', 'true');
      
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
        if (result.total !== undefined) {
          setTotalRowCount(result.total);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      setLoading(false);
    }
  };

  const handleApprove = async (row: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/${row.id}/approve`, {
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
      const response = await fetch(`/api/category-data/${slug}/${row.id}/replace`, {
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

  const handleGenerateRegNumber = async (row: any) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/${row.id}/generate-reg-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setSnackbar({ open: true, message: `✅ ${result.message}`, severity: 'success' });
        await fetchData();
      } else {
        setSnackbar({ open: true, message: `❌ ${result.message}`, severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Check if a row has all required fields to generate a reg number
  // Button hidden if reg_number already exists (must stay unique)
  const canGenerateRegNumber = (row: any): boolean => {
    if (row.reg_number) return false; // already has a code — hide button
    return !!(row.name_ta && row.province_name && row.district_name && row.ds_name && row.gn_name);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (slug) {
        fetchData();
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [slug, token, districtId, dsDivisionCode, gnId, filterType, searchQuery, paginationModel.page, paginationModel.pageSize]);

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
        alert('Failed to delete: ' + (result.message || result.error || JSON.stringify(result) || 'Unknown error'));
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
        alert('Failed to delete: ' + (result.message || result.error || JSON.stringify(result) || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkGenerateSubmit = async () => {
    if (rowSelectionModel.length === 0) return;
    
    const rowsToProcess = rowSelectionModel.map(id => data.find(r => r.id === id)).filter(Boolean);
    const skippedNames: string[] = [];
    let generatedCount = 0;
    
    setActionLoading(true);
    
    for (const row of rowsToProcess) {
        const rowName = row.name_en || row.name_si || row.name_ta || `ID: ${row.id}`;
        if (row.reg_number) {
           skippedNames.push(`${rowName} (Already has a Reg Number)`);
           continue;
        }
        if (!canGenerateRegNumber(row)) {
           skippedNames.push(`${rowName} (Missing required data: name, province, district, DS, or GN)`);
           continue;
        }
        
        try {
           const response = await fetch(`/api/category-data/${slug}/${row.id}/generate-reg-number`, {
             method: 'POST',
             headers: {
               'Authorization': `Bearer ${token}`,
               'Accept': 'application/json'
             }
           });
           const res = await response.json();
           if (res.success) {
               generatedCount++;
           } else {
               skippedNames.push(`${rowName} (Error: ${res.message})`);
           }
        } catch (err: any) {
           skippedNames.push(`${rowName} (Error: ${err.message})`);
        }
    }
    
    setActionLoading(false);
    fetchData(); // Refresh data to show new reg numbers
    setRowSelectionModel([]); // clear selection
    
    // Always show summary if we skipped something, else just an alert/snackbar
    if (skippedNames.length > 0) {
        setBulkGenerateStats({ total: rowsToProcess.length, generated: generatedCount });
        setBulkGenerateSkippedNames(skippedNames);
        setBulkGenerateSkippedModalOpen(true);
    } else {
        setSnackbar({ open: true, message: `✅ Successfully generated Reg Numbers for ${generatedCount} records.`, severity: 'success' });
    }
  };

  const handleGenerateAllSubmit = async (isContinue: boolean = false) => {
    try {
      setActionLoading(true);
      
      const currentExcludeIds = isContinue ? bulkGenerateExcludeIds : [];
      if (!isContinue) {
          setBulkGenerateExcludeIds([]); // reset if starting fresh
          setBulkGenerateStats({ total: 0, generated: 0 });
          setBulkGenerateSkippedNames([]);
      }

      const response = await fetch(`/api/category-data/${slug}/generate-all-reg-numbers`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ exclude_ids: currentExcludeIds })
      });
      const result = await response.json();
      if (result.success) {
        setRowSelectionModel([]);
        fetchData();
        
        const newTotal = (isContinue ? bulkGenerateStats.total : 0) + result.total;
        const newGenerated = (isContinue ? bulkGenerateStats.generated : 0) + result.generated;
        const newSkippedNames = isContinue ? [...bulkGenerateSkippedNames, ...(result.skipped || [])] : (result.skipped || []);
        const newExcludeIds = isContinue ? [...bulkGenerateExcludeIds, ...(result.skipped_ids || [])] : (result.skipped_ids || []);

        setBulkGenerateStats({ total: newTotal, generated: newGenerated });
        setBulkGenerateSkippedNames(newSkippedNames);
        setBulkGenerateExcludeIds(newExcludeIds);

        // Even if we generated 1000, we show the summary modal so they can click "Next 1000"
        // if result.total === 1000, it means there are probably more left.
        if (result.total > 0 || newSkippedNames.length > 0) {
            setBulkGenerateSkippedModalOpen(true);
        } else {
            setSnackbar({ open: true, message: `✅ Successfully generated Reg Numbers for all eligible records.`, severity: 'success' });
        }
      } else {
        alert('Failed to generate all: ' + (result.message || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error generating all: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAllSubmit = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/category-data/${slug}/clear-all`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setClearAllModalOpen(false);
        setRowSelectionModel([]);
        fetchData();
        alert(result.message || 'All data cleared.');
      } else {
        alert('Failed to clear data: ' + (result.message || result.error || JSON.stringify(result) || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error clearing data: ' + err.message);
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

  if (loading && data.length === 0) {
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
      width: 320,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%', flexWrap: 'wrap' }}>
          {params.row.is_approved === false ? (
            params.row.is_update_proposal ? (
              <Button size="small" variant="contained" color="warning" onClick={() => handleReplace(params.row)} disabled={actionLoading}>
                Replace
              </Button>
            ) : (
              <Button size="small" variant="contained" color="success" onClick={() => handleApprove(params.row)} disabled={actionLoading}>
                Approve
              </Button>
            )
          ) : null}

          {/* Generate Reg Number button — shown when all required fields filled */}
          {canGenerateRegNumber(params.row) && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<TagIcon fontSize="small" />}
              onClick={() => handleGenerateRegNumber(params.row)}
              disabled={actionLoading}
              sx={{ fontSize: '0.7rem', px: 1, py: 0.3, minWidth: 'auto', whiteSpace: 'nowrap' }}
            >
              Gen Reg #
            </Button>
          )}

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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {categoryName ? (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {categoryName} (Admin View)
            </Typography>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bulk Uploaded Data (Admin View)
            </Typography>
          )}
          
          <TextField
            size="small"
            placeholder="Search keywords..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {rowSelectionModel.length > 0 && (
            <>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<TagIcon />}
                onClick={handleBulkGenerateSubmit}
                disabled={actionLoading}
              >
                Gen Reg # ({rowSelectionModel.length})
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => setBulkDeleteModalOpen(true)}
                disabled={actionLoading}
              >
                Delete Selected ({rowSelectionModel.length})
              </Button>
            </>
          )}
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<TagIcon />}
            onClick={() => handleGenerateAllSubmit(false)}
            disabled={actionLoading || data.length === 0}
          >
            Gen Reg # (All Data)
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => setClearAllModalOpen(true)}
            disabled={actionLoading || data.length === 0}
          >
            Clear All Data
          </Button>
        </Box>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelectionModel) => {
            setRowSelectionModel(newSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
          getRowClassName={(params) => {
             if (params.row.is_approved === false) {
               return 'unapproved-row';
             }
             if (params.row.coordinate_mismatch) {
               return 'mismatch-row';
             }
             return '';
          }}
          sx={{
            '& .unapproved-row': {
              backgroundColor: 'rgba(255, 235, 59, 0.2)', // Yellow tint
              '&:hover': {
                backgroundColor: 'rgba(255, 235, 59, 0.3)',
              },
            },
            '& .mismatch-row': {
              color: 'red', // Red text for mismatches
              fontWeight: 'bold'
            }
          }}
          paginationMode="server"
          rowCount={totalRowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>

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
            {actionLoading ? 'Deleting...' : 'Delete Selected'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bulk Generate Skipped Summary Dialog */}
      <Dialog open={bulkGenerateSkippedModalOpen} onClose={() => setBulkGenerateSkippedModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Generate Summary</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Successfully generated: {bulkGenerateStats.generated} / {bulkGenerateStats.total}
          </Typography>
          {bulkGenerateSkippedNames.length > 0 && (
            <>
              <Typography color="error" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                The following records were skipped:
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.03)', p: 1, borderRadius: 1 }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {bulkGenerateSkippedNames.map((name, index) => (
                    <li key={index}>
                      <Typography variant="body2">{name}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkGenerateSkippedModalOpen(false)} color="inherit" disabled={actionLoading}>
            Close
          </Button>
          <Button onClick={() => handleGenerateAllSubmit(true)} variant="contained" color="secondary" disabled={actionLoading}>
            {actionLoading ? 'Processing...' : 'Process Next 1000'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearAllModalOpen} onClose={() => setClearAllModalOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Confirm Clear All Data</DialogTitle>
        <DialogContent>
          <Typography fontWeight="bold" color="error" sx={{ mb: 2 }}>
            WARNING: You are about to permanently delete ALL data in this category.
          </Typography>
          <Typography>
            This will remove all {data.length > 0 ? 'records' : ''} currently in the database for this category, not just the ones on this page. This action cannot be undone. Are you absolutely sure?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllModalOpen(false)} color="inherit" disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleClearAllSubmit} variant="contained" color="error" disabled={actionLoading}>
            {actionLoading ? 'Clearing Data...' : 'Yes, Clear All Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for reg number generation feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryDataAdminTable;
