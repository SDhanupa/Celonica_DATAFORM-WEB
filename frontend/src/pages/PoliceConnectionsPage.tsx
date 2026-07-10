import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GRAMA_NILADHARIS, GET_POLICES } from '../graphql/queries';
import { UPDATE_POLICE_MAPPING } from '../graphql/mutations';
import { enqueueSnackbar } from 'notistack';

const PoliceConnectionsPage: React.FC = () => {
  // Main table state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  // View Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedGnd, setSelectedGnd] = useState<any>(null);

  // Police Selection Modal state
  const [policeModalOpen, setPoliceModalOpen] = useState(false);
  const [policePage, setPolicePage] = useState(0);
  const [policeSearch, setPoliceSearch] = useState('');

  // Queries
  const { data: gndData, loading: gndLoading, refetch: refetchGnd } = useQuery(GET_GRAMA_NILADHARIS, {
    variables: { first: pageSize, page: page + 1, search },
    fetchPolicy: 'network-only',
  });

  const { data: policeData, loading: policeLoading } = useQuery(GET_POLICES, {
    variables: { first: 10, page: policePage + 1, search: policeSearch },
    skip: !policeModalOpen,
    fetchPolicy: 'network-only',
  });

  const [updateMapping] = useMutation(UPDATE_POLICE_MAPPING, {
    onCompleted: (data) => {
      enqueueSnackbar('Mapping updated successfully', { variant: 'success' });
      refetchGnd();
      setPoliceModalOpen(false);
      // Update the selectedGnd with new police data so the view modal reflects it immediately
      setSelectedGnd({ ...selectedGnd, police: data.updatePoliceMapping });
    },
    onError: (err) => {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  });

  const handleViewClick = (gnd: any) => {
    setSelectedGnd(gnd);
    setViewModalOpen(true);
  };

  const handleEditPoliceClick = () => {
    setPoliceSearch('');
    setPolicePage(0);
    setPoliceModalOpen(true);
  };

  const handleSelectPolice = (police: any) => {
    if (selectedGnd) {
      updateMapping({
        variables: {
          code: selectedGnd.code,
          psId: police.psId,
          psName: police.psName,
          psNameSi: police.psNameSi,
          psNameTa: police.psNameTa
        }
      });
    }
  };

  const gndColumns: GridColDef[] = [
    { field: 'code', headerName: 'GND Code', width: 130 },
    { field: 'nameEn', headerName: 'GND Name (EN)', flex: 1 },
    { field: 'nameSi', headerName: 'GND Name (SI)', flex: 1 },
    { field: 'nameTa', headerName: 'GND Name (TA)', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => handleViewClick(params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  const policeColumns: GridColDef[] = [
    { field: 'psName', headerName: 'Station Name', flex: 1 },
    { field: 'psNameSi', headerName: 'Name (SI)', flex: 1 },
    { field: 'psNameTa', headerName: 'Name (TA)', flex: 1 },
    {
      field: 'actions',
      headerName: 'Select',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleSelectPolice(params.row)}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Database Mapping</Typography>
        <TextField
          size="small"
          placeholder="Search GND..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300, bgcolor: '#fff' }}
        />
      </Box>

      <Paper sx={{ width: '100%', mb: 2, height: 'calc(100vh - 200px)' }}>
        <DataGrid
          rows={gndData?.gramaNiladharis?.data || []}
          columns={gndColumns}
          loading={gndLoading}
          paginationMode="server"
          rowCount={gndData?.gramaNiladharis?.paginatorInfo?.total || 0}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(newModel) => {
            setPage(newModel.page);
            setPageSize(newModel.pageSize);
          }}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>

      {/* Main View Connections Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Connection Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedGnd?.nameEn} ({selectedGnd?.code})
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f5f5f5' }}>
          
          {/* Category: Police Mapping */}
          <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Police Station
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={handleEditPoliceClick}
                >
                  {selectedGnd?.police ? 'Edit' : 'Connect'}
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {selectedGnd?.police ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Connected Station:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedGnd.police.psName} 
                    {selectedGnd.police.psNameSi && ` (${selectedGnd.police.psNameSi})`}
                  </Typography>
                  
                  {selectedGnd.police.name && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mapped as GND Name:
                      </Typography>
                      <Typography variant="body2">
                        {selectedGnd.police.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No police station connected yet.
                </Typography>
              )}
            </CardContent>
          </Card>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Police Selection Modal */}
      <Dialog open={policeModalOpen} onClose={() => setPoliceModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Select Police Station for {selectedGnd?.nameEn}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Police Station..."
              value={policeSearch}
              onChange={(e) => {
                setPoliceSearch(e.target.value);
                setPolicePage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={policeData?.polices?.data || []}
              columns={policeColumns}
              loading={policeLoading}
              paginationMode="server"
              rowCount={policeData?.polices?.paginatorInfo?.total || 0}
              pageSizeOptions={[10]}
              paginationModel={{ page: policePage, pageSize: 10 }}
              onPaginationModelChange={(newModel) => {
                setPolicePage(newModel.page);
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPoliceModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PoliceConnectionsPage;

