import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { DELETE_CATEGORY } from '../graphql/mutations';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryDialog from '../components/CategoryDialog';
import { useAuth } from '../auth/AuthProvider';

const CategoriesPage: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'si'>('en');
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const isSuperAdmin = userInfo?.realm_roles?.includes('super_admin');

  const { data, loading, error } = useQuery(GET_CATEGORIES);
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Failed to load categories.</Typography>;

  const categories = data?.categories || [];

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory({ variables: { id } });
    }
  };

  const handleEdit = (cat: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {lang === 'en' ? 'Categories' : 'වර්ග'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isSuperAdmin && (
            <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Category
            </Button>
          )}
          <Box>
            <Button 
              variant={lang === 'en' ? 'contained' : 'outlined'} 
              onClick={() => setLang('en')}
              sx={{ mr: 1 }}
            >
              English
            </Button>
            <Button 
              variant={lang === 'si' ? 'contained' : 'outlined'} 
              onClick={() => setLang('si')}
            >
              සිංහල
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {categories.map((cat: any) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={cat.id}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 4,
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                  borderColor: 'primary.main',
                }
              }}
            >
              {isSuperAdmin && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleEdit(cat, e)}>
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                  <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleDelete(cat.id, e)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              )}
              <CardActionArea 
                onClick={() => {
                  navigate(`/categories/${cat.slug}`);
                }}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'stretch',
                  p: 1
                }}
              >
                {cat.imagePath && (
                  <CardMedia
                    component="img"
                    height="110"
                    image={cat.imagePath}
                    alt={lang === 'en' ? cat.nameEn : cat.nameSi}
                    sx={{ 
                      objectFit: 'contain', 
                      borderRadius: 3,
                      p: 1,
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: '12px !important', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {lang === 'en' ? cat.nameEn : cat.nameSi}
                  </Typography>
                </CardContent>
                {!isSuperAdmin && cat.progress !== undefined && (
                  <LinearProgress 
                    variant="determinate" 
                    value={cat.progress} 
                    sx={{ width: '100%', height: 6, mt: 'auto', '& .MuiLinearProgress-bar': { backgroundColor: '#FFD700' } }} 
                  />
                )}
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CategoryDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        category={editingCategory}
      />
    </Box>
  );
};

export default CategoriesPage;
