import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Button } from '@mui/material';
import CategoryDataAdminTable from '../components/CategoryDataAdminTable';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BulkUploadDialog from '../components/BulkUploadDialog';

const BulkDataPage: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    fetch('/api/category-data-tables')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTables(data.categories || []);
          if (data.categories && data.categories.length > 0) {
            setSelectedSlug(data.categories[0].slug);
            setSelectedName(data.categories[0].name_en);
          }
        } else {
          setError(data.message || 'Failed to load bulk data categories.');
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (event: any) => {
    const slug = event.target.value as string;
    setSelectedSlug(slug);
    const cat = tables.find(t => t.slug === slug);
    if (cat) setSelectedName(cat.name_en);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Global Bulk Uploaded Data
          </Typography>
        </Box>
        {selectedSlug && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadOpen(true)}
          >
            Upload New Data
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Select a category below to view all bulk uploaded data across every District, DS Division, and GN in the country.
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : tables.length === 0 ? (
          <Alert severity="info">No bulk uploaded data found in the system yet.</Alert>
        ) : (
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel id="category-select-label">Data Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedSlug}
              label="Data Category"
              onChange={handleCategoryChange}
            >
              {tables.map(table => (
                <MenuItem key={table.slug} value={table.slug}>
                  {table.name_en} ({table.slug})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {selectedSlug && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
              Complete Data (Successfully Mapped)
            </Typography>
            <CategoryDataAdminTable 
              slug={selectedSlug} 
              categoryName={selectedName}
              filterType="mapped"
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
              Unmapped Data (Missing or Incorrect Location)
            </Typography>
            <CategoryDataAdminTable 
              slug={selectedSlug} 
              categoryName={selectedName}
              filterType="unmapped"
            />
          </Box>
        </Box>
      )}

      {selectedSlug && (
        <BulkUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            // Force a reload of the table data by tricking React, or just reload the page for simplicity
            window.location.reload();
          }}
          category={{
            slug: selectedSlug,
            nameEn: selectedName,
          }}
        />
      )}
    </Box>
  );
};

export default BulkDataPage;
