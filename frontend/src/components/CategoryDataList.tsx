import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  IconButton,
  Paper,
  CardMedia
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import { useAuth } from '../auth/AuthProvider';

interface CategoryDataListProps {
  slug: string;
  categoryName: string;
  districtId?: string;
  dsDivisionCode?: string;
  gnId?: string;
  isSuperAdmin?: boolean;
  hideIfEmpty?: boolean;
}

const CategoryDataList: React.FC<CategoryDataListProps> = ({ 
  slug, 
  categoryName,
  districtId, 
  dsDivisionCode, 
  gnId,
  isSuperAdmin,
  hideIfEmpty
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // Use a simple mock language state or retrieve it from context if available
  const lang = 'en'; // Hardcoded for simplicity, adjust if you pass lang down

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Build query string
        const params = new URLSearchParams();
        if (districtId) params.append('district_id', districtId);
        if (dsDivisionCode) params.append('ds_division_code', dsDivisionCode);
        if (gnId) params.append('gn_id', gnId);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';

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
          setData(result.data);
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
  }, [slug, token, districtId, dsDivisionCode, gnId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    if (hideIfEmpty) return null;
    return <Alert severity="error" sx={{ mt: 4 }}>Error loading data: {error}</Alert>;
  }

  if (data.length === 0) {
    if (hideIfEmpty) return null;
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available for your selected location.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {categoryName}
        </Typography>
        {isSuperAdmin && (
          <Chip label="All Locations (Admin View)" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />
        )}
      </Box>
      
      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid item xs={12} md={6} lg={4} key={item.id || index}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%', 
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
                  borderColor: 'primary.light'
                }
              }}
            >
              {item.image_path && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`/api/uploads/category_images/${item.image_path}`}
                  alt={item.name_en || 'Category Image'}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>
                    {item.name_en || item.name_si || item.name_ta}
                  </Typography>
                  {item.reg_number && (
                    <Chip label={item.reg_number} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                  )}
                </Box>
                
                {item.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />
                
                <Stack spacing={1.5}>
                  {item.address && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                      <Typography variant="body2" color="text.primary">
                        {item.address}
                      </Typography>
                    </Box>
                  )}

                  {(item.district_name || item.ds_name || item.gn_name) && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                      <LocationOnIcon fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {item.district_name} District &gt; {item.ds_name} DS &gt; {item.gn_name} GN
                      </Typography>
                    </Box>
                  )}
                  
                  {item.mobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {item.mobile}
                      </Typography>
                    </Box>
                  )}
                  
                  {item.contact_person_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.primary">
                        {item.contact_person_name}
                      </Typography>
                    </Box>
                  )}
                  
                  {(item.latitude && item.longitude) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`, '_blank')}>
                        View on Map
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryDataList;
