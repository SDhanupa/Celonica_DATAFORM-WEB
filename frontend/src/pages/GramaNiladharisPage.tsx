import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery } from '@apollo/client';
import { GET_GRAMA_NILADHARIS } from '../graphql/queries';

const GramaNiladharisPage: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });

  const [rowCountState, setRowCountState] = useState(0);

  const { data, loading, error } = useQuery(GET_GRAMA_NILADHARIS, {
    variables: {
      first: paginationModel.pageSize,
      page: paginationModel.page + 1, // Lighthouse pagination is 1-indexed
    },
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (data?.gramaNiladharis?.paginatorInfo?.total !== undefined) {
      setRowCountState(data.gramaNiladharis.paginatorInfo.total);
    }
  }, [data]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'provinceCode', headerName: 'Province Code', width: 120 },
    { field: 'PCCODE', headerName: 'PCCODE', width: 100 },
    { field: 'districtCode', headerName: 'District Code', width: 120 },
    { field: 'DCCODE', headerName: 'DCCODE', width: 100 },
    { field: 'divisionalSecretariatCode', headerName: 'DS Code', width: 120 },
    { field: 'DSCCODE', headerName: 'DSCCODE', width: 100 },
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'CCODE', headerName: 'CCODE', width: 100 },
    { field: 'nameEn', headerName: 'Name (EN)', flex: 1, minWidth: 200 },
    { field: 'nameSi', headerName: 'Name (SI)', flex: 1, minWidth: 200 },
    { field: 'nameTa', headerName: 'Name (TA)', flex: 1, minWidth: 200 },
  ];

  if (error) return <Typography color="error">Error loading GM Divisions</Typography>;

  const rowData = data?.gramaNiladharis?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Grama Niladhari Divisions
        </Typography>
      </Box>

      <Box sx={{ height: 'calc(100vh - 180px)', width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={rowData}
          columns={columns}
          rowCount={rowCountState}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[50, 100]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(224, 224, 224, 1)' },
            '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid rgba(224, 224, 224, 1)' }
          }}
        />
      </Box>
    </Box>
  );
};

export default GramaNiladharisPage;
