import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useMutation } from '@apollo/client';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '../graphql/mutations';
import { GET_CATEGORIES, GET_CATEGORY_BY_SLUG } from '../graphql/queries';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: any; // If edit mode
  parentId?: string; // If adding child
  parentSlug?: string; // To refetch
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onClose, category, parentId, parentSlug }) => {
  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameSi, setNameSi] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionSi, setDescriptionSi] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  useEffect(() => {
    if (category) {
      setSlug(category.slug || '');
      setNameEn(category.nameEn || '');
      setNameSi(category.nameSi || '');
      setDescriptionEn(category.descriptionEn || '');
      setDescriptionSi(category.descriptionSi || '');
      setImagePath(category.imagePath || '');
      setSortOrder(category.sortOrder || 0);
    } else {
      setSlug('');
      setNameEn('');
      setNameSi('');
      setDescriptionEn('');
      setDescriptionSi('');
      setImagePath('');
      setSortOrder(0);
    }
  }, [category, open]);

  const handleSave = async () => {
    try {
      const refetchQueries = parentSlug
        ? [{ query: GET_CATEGORY_BY_SLUG, variables: { slug: parentSlug } }]
        : [{ query: GET_CATEGORIES }];

      if (category) {
        await updateCategory({
          variables: {
            id: category.id,
            slug,
            nameEn,
            nameSi,
            descriptionEn,
            descriptionSi,
            imagePath,
            sortOrder: parseInt(sortOrder.toString()),
          },
          refetchQueries,
        });
      } else {
        await createCategory({
          variables: {
            parentId,
            slug,
            nameEn,
            nameSi,
            descriptionEn,
            descriptionSi,
            imagePath,
            sortOrder: parseInt(sortOrder.toString()),
          },
          refetchQueries,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Failed to save category');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-category-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImagePath(data.url);
      } else {
        alert(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Slug (Unique Identifier)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          fullWidth
        />
        <TextField
          label="Name (English)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          fullWidth
        />
        <TextField
          label="Name (Sinhala)"
          value={nameSi}
          onChange={(e) => setNameSi(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description / Instructions (English)"
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          label="Description / Instructions (Sinhala)"
          value={descriptionSi}
          onChange={(e) => setDescriptionSi(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px dashed #ccc', p: 2, borderRadius: 1, alignItems: 'center' }}>
          <Typography variant="subtitle2" color="textSecondary">Category Icon</Typography>
          {imagePath && (
            <img src={imagePath} alt="Preview" style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 8 }} />
          )}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="icon-upload-button"
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label htmlFor="icon-upload-button">
            <Button
              variant="outlined"
              component="span"
              startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Browse Image'}
            </Button>
          </label>
        </Box>

        <TextField
          label="Sort Order"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
