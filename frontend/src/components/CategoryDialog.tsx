import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
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
  const [imagePath, setImagePath] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  useEffect(() => {
    if (category) {
      setSlug(category.slug || '');
      setNameEn(category.nameEn || '');
      setNameSi(category.nameSi || '');
      setImagePath(category.imagePath || '');
      setSortOrder(category.sortOrder || 0);
    } else {
      setSlug('');
      setNameEn('');
      setNameSi('');
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
          label="Image Path (Optional, e.g., /images/categories/xxx.png)"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          fullWidth
        />
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
