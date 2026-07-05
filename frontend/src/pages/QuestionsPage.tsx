import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_QUESTIONS } from '../graphql/queries';
import { CREATE_QUESTION, UPDATE_QUESTION, DELETE_QUESTION } from '../graphql/mutations';

const QuestionsPage: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS, {
    fetchPolicy: 'network-only'
  });

  const [createQuestion] = useMutation(CREATE_QUESTION);
  const [updateQuestion] = useMutation(UPDATE_QUESTION);
  const [deleteQuestion] = useMutation(DELETE_QUESTION);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    section: 'A',
    questionText: '',
    inputType: 'text',
    sortOrder: 0
  });

  const handleOpen = (question?: any) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        section: question.section,
        questionText: question.questionText,
        inputType: question.inputType,
        sortOrder: question.sortOrder
      });
    } else {
      setEditingId(null);
      setFormData({
        section: 'A',
        questionText: '',
        inputType: 'text',
        sortOrder: 0
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateQuestion({ variables: { id: editingId, ...formData } });
      } else {
        await createQuestion({ variables: formData });
      }
      refetch();
      handleClose();
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion({ variables: { id } });
        refetch();
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'section', headerName: 'Section', width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} color="primary" size="small" />
      )
    },
    { field: 'sortOrder', headerName: 'Order', width: 90 },
    { field: 'questionText', headerName: 'Question Text', flex: 1, minWidth: 300 },
    { field: 'inputType', headerName: 'Input Type', width: 130 },
    { field: 'actions', headerName: 'Actions', width: 130, sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading questions</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Questions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            background: 'linear-gradient(45deg, #6C63FF 30%, #8A84FF 90%)',
            boxShadow: '0 3px 5px 2px rgba(108, 99, 255, .3)'
          }}
        >
          Add Question
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={data?.questions || []}
          columns={columns}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(224, 224, 224, 1)' },
            '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid rgba(224, 224, 224, 1)' }
          }}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              fullWidth
            >
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((opt) => (
                <MenuItem key={opt} value={opt}>Section {opt}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Question Text (Sinhala)"
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              select
              label="Input Type"
              name="inputType"
              value={formData.inputType}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="text">Text (Short Answer)</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Yes/No (Boolean)</MenuItem>
              <MenuItem value="percentage">Percentage (%)</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionsPage;
