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
import { Search as SearchIcon, Visibility as VisibilityIcon, SettingsInputAntenna as AntennaIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery } from '@apollo/client';
import { GET_GRAMA_NILADHARIS, GET_TRS_AREAS_BY_DISTRICT } from '../graphql/queries';

const TrsConnectionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedGnd, setSelectedGnd] = useState<any>(null);

  const { data: gndData, loading: gndLoading } = useQuery(GET_GRAMA_NILADHARIS, {
    variables: { 
      first: pageSize, 
      page: page + 1, 
      search 
    },
    fetchPolicy: 'network-only',
  });

  const { data: trsAreasData, loading: trsAreasLoading } = useQuery(GET_TRS_AREAS_BY_DISTRICT, {
    variables: { district: selectedGnd?.nameEn || '' },
    skip: !viewModalOpen || !selectedGnd?.nameEn,
    fetchPolicy: 'network-only',
  });

  const handleViewClick = (gnd: any) => {
    setSelectedGnd(gnd);
    setViewModalOpen(true);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Telecom Regions Mapping</Typography>
        <TextField
          size="small"
          placeholder="Search GND Name..."
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
          <Typography variant="h6" component="div">
            Telecom Regions for GND
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedGnd?.nameEn} ({selectedGnd?.code})
            {!trsAreasLoading && trsAreasData?.trsAreasByDistrict && (
              <strong style={{ marginLeft: '8px' }}>
                - Total: {trsAreasData.trsAreasByDistrict.length}
              </strong>
            )}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f5f5f5', p: 0 }}>
          {trsAreasLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {trsAreasData?.trsAreasByDistrict && trsAreasData.trsAreasByDistrict.length > 0 ? (
                trsAreasData.trsAreasByDistrict.map((trs: any) => (
                  <ListItem key={trs.id} divider>
                    <ListItemIcon>
                      <AntennaIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={trs.nameEn || trs.fullLocationName} 
                      secondary={trs.code ? `Code: ${trs.code} | Type: ${trs.locationType}` : `Type: ${trs.locationType}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No Telecom regions found mapped to this GND name." />
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

export default TrsConnectionsPage;
