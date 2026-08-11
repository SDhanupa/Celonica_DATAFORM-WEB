import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAuth } from '../auth/AuthProvider';

interface CategoryDataAdminTableProps {
  slug: string;
}

const CategoryDataAdminTable: React.FC<CategoryDataAdminTableProps> = ({ slug }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Do not pass location filters so it fetches ALL data for admin
        const response = await fetch(`/api/category-data/${slug}`, {
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

    if (slug) {
      fetchData();
    }
  }, [slug, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading data: {error}</Alert>;
  }

  if (data.length === 0) {
    return null; // Let the SubCategoryPage decide what to show
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
  ];

  return (
    <Box sx={{ mt: 4, mb: 4, height: 500, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Bulk Uploaded Data (Admin View)
      </Typography>
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
    </Box>
  );
};

export default CategoryDataAdminTable;
