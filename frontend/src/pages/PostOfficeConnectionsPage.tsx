import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, LocalPostOffice as LocalPostOfficeIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery } from '@apollo/client';
import { GET_DISTRICTS, GET_POST_OFFICES_BY_DISTRICT } from '../graphql/queries';

const PostOfficeConnectionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  const { data: districtsData, loading: districtsLoading } = useQuery(GET_DISTRICTS, {
    variables: { search },
    fetchPolicy: 'network-only',
  });

  const { data: postOfficesData, loading: postOfficesLoading } = useQuery(GET_POST_OFFICES_BY_DISTRICT, {
    variables: { district: selectedDistrict?.nameEn || '' },
    skip: !viewModalOpen || !selectedDistrict?.nameEn,
    fetchPolicy: 'network-only',
  });

  const handleViewClick = (district: any) => {
    setSelectedDistrict(district);
    setViewModalOpen(true);
  };

  const districtColumns: GridColDef[] = [
    { field: 'code', headerName: 'District Code (DCCODE)', width: 200 },
    { field: 'nameEn', headerName: 'District Name (EN)', flex: 1 },
    { field: 'nameSi', headerName: 'District Name (SI)', flex: 1 },
    { field: 'nameTa', headerName: 'District Name (TA)', flex: 1 },
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Post Office Mapping</Typography>
        <TextField
          size="small"
          placeholder="Search District..."
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
          rows={districtsData?.districts || []}
          columns={districtColumns}
          getRowId={(row) => row.code + '-' + row.nameEn}
          loading={districtsLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>

      {/* Main View Connections Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Post Offices in District
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDistrict?.nameEn} ({selectedDistrict?.code})
            {!postOfficesLoading && postOfficesData?.postOfficesByDistrict && (
              <strong style={{ marginLeft: '8px' }}>
                - Total: {postOfficesData.postOfficesByDistrict.length}
              </strong>
            )}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f5f5f5', p: 0 }}>
          {postOfficesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {postOfficesData?.postOfficesByDistrict && postOfficesData.postOfficesByDistrict.length > 0 ? (
                postOfficesData.postOfficesByDistrict.map((po: any) => (
                  <ListItem key={po.id} divider>
                    <ListItemIcon>
                      <LocalPostOfficeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={po.placeNameEnglish} 
                      secondary={po.postalCode ? `Postal Code: ${po.postalCode}` : null}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No post offices found for this district." />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostOfficeConnectionsPage;
