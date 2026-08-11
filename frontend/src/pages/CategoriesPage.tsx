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
  LinearProgress,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { DELETE_CATEGORY } from '../graphql/mutations';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CategoryDialog from '../components/CategoryDialog';
import BulkUploadDialog from '../components/BulkUploadDialog';
import { useAuth } from '../auth/AuthProvider';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CategoriesPage: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const isSuperAdmin = userInfo?.realm_roles?.includes('super_admin');

  const { data, loading, error } = useQuery(GET_CATEGORIES);
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [bulkUploadCategory, setBulkUploadCategory] = useState<any>(null);

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

  const handleBulkUploadClick = (cat: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setBulkUploadCategory(cat);
    setBulkUploadOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Reg Number', 'Name si', 'Name en', 'Name ta', 'Name singlish', 'Longitute', 'Latitude', 'Mobile', 'Description', 'Contact person name', 'Address'];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'category_data_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {lang === 'en' ? 'Categories' : lang === 'si' ? 'වර්ග' : 'வகைகள்'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isSuperAdmin && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={handleDownloadTemplate}>
                Download Template
              </Button>
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAdd}>
                Add Category
              </Button>
            </Box>
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
              sx={{ mr: 1 }}
            >
              සිංහල
            </Button>
            <Button 
              variant={lang === 'ta' ? 'contained' : 'outlined'} 
              onClick={() => setLang('ta')}
            >
              தமிழ்
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
              {(cat.descriptionEn || cat.descriptionSi) && (
                <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                  <Tooltip 
                    title={lang === 'en' ? (cat.descriptionEn || cat.descriptionSi) : lang === 'si' ? (cat.descriptionSi || cat.descriptionEn) : (cat.descriptionTa || cat.descriptionEn)}
                    arrow
                    placement="top"
                  >
                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}>
                      <HelpOutlineIcon fontSize="small" color="info" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              {isSuperAdmin && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Bulk Upload Data" arrow placement="top">
                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleBulkUploadClick(cat, e)}>
                      <CloudUploadIcon fontSize="small" color="secondary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Category" arrow placement="top">
                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleEdit(cat, e)}>
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Category" arrow placement="top">
                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleDelete(cat.id, e)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
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
                    alt={lang === 'en' ? cat.nameEn : lang === 'si' ? cat.nameSi : cat.nameTa}
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
                    {lang === 'en' ? cat.nameEn : lang === 'si' ? (cat.nameSi || cat.nameEn) : (cat.nameTa || cat.nameEn)}
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

      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        category={bulkUploadCategory}
        onSuccess={() => {
          // Refetch categories to show the newly created one
          window.location.reload();
        }}
      />
    </Box>
  );
};

export default CategoriesPage;
