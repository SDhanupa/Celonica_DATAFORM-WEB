import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@apollo/client';
import { GET_P_DISTRICTS, GET_P_DISTRICT_WITH_GNS } from '../graphql/queries';

const DistrictDetailsModal: React.FC<{ districtId: string | null; onClose: () => void }> = ({ districtId, onClose }) => {
  const { data, loading } = useQuery(GET_P_DISTRICT_WITH_GNS, {
    variables: { id: districtId },
    skip: !districtId,
    fetchPolicy: 'network-only',
  });

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'GN Code', width: 120 },
    { field: 'nameEn', headerName: 'GN Name (EN)', width: 200 },
    { field: 'nameSi', headerName: 'GN Name (SI)', width: 200 },
    { field: 'divisionalSecretariatCode', headerName: 'DS Code', width: 120 },
    { 
      field: 'populationBoth', 
      headerName: 'Total Pop.', 
      width: 120,
      valueGetter: (value, row) => row.pGn?.populationBoth || 0,
      type: 'number'
    },
    { 
      field: 'populationMale', 
      headerName: 'Male Pop.', 
      width: 120,
      valueGetter: (value, row) => row.pGn?.populationMale || 0,
      type: 'number'
    },
    { 
      field: 'populationFemale', 
      headerName: 'Female Pop.', 
      width: 120,
      valueGetter: (value, row) => row.pGn?.populationFemale || 0,
      type: 'number'
    }
  ];

  const rows = useMemo(() => {
    if (!data?.pDistrict?.gramaNiladharis) return [];
    return data.pDistrict.gramaNiladharis;
  }, [data]);

  return (
    <Dialog open={!!districtId} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Grama Niladharis in {data?.pDistrict?.admin2NameEn || 'District'}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const DistrictProvinceConnectionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_P_DISTRICTS, {
    fetchPolicy: 'network-only',
  });

  const columns: GridColDef[] = [
    { field: 'admin2Pcode', headerName: 'District Code', width: 120 },
    { field: 'admin2NameEn', headerName: 'District Name (EN)', width: 150 },
    { field: 'admin2NameSi', headerName: 'District Name (SI)', width: 150 },
    { field: 'admin2NameTa', headerName: 'District Name (TA)', width: 150 },
    { 
      field: 'populationBoth', 
      headerName: 'Total Pop.', 
      width: 120,
      type: 'number'
    },
    { 
      field: 'populationMale', 
      headerName: 'Male Pop.', 
      width: 120,
      type: 'number'
    },
    { 
      field: 'populationFemale', 
      headerName: 'Female Pop.', 
      width: 120,
      type: 'number'
    },
    {
      field: 'province',
      headerName: 'Province',
      flex: 1,
      renderCell: (params) => {
        const province = params.row.pProvince;
        if (!province) return <span style={{ fontStyle: 'italic', color: 'gray' }}>No mapping</span>;
        return (
          <Box>
            <Typography variant="body2">{province.admin1NameEn} ({province.admin1Pcode})</Typography>
            <Typography variant="caption" color="text.secondary">
              {province.admin1NameSi} | {province.admin1NameTa}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={() => setSelectedDistrictId(params.row.id)}
        >
          View GNs
        </Button>
      )
    }
  ];

  // Filter rows manually since we fetch all districts
  const rows = useMemo(() => {
    if (!data?.pDistricts) return [];
    if (!search) return data.pDistricts;
    const lowerSearch = search.toLowerCase();
    return data.pDistricts.filter((row: any) => 
      row.admin2NameEn?.toLowerCase().includes(lowerSearch) ||
      row.admin2NameSi?.toLowerCase().includes(lowerSearch) ||
      row.admin2NameTa?.toLowerCase().includes(lowerSearch) ||
      row.admin2Pcode?.toLowerCase().includes(lowerSearch) ||
      row.pProvince?.admin1NameEn?.toLowerCase().includes(lowerSearch)
    );
  }, [data, search]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>District & Province Mapping</Typography>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>
      
      <DistrictDetailsModal 
        districtId={selectedDistrictId} 
        onClose={() => setSelectedDistrictId(null)} 
      />
    </Box>
  );
};

export default DistrictProvinceConnectionsPage;
