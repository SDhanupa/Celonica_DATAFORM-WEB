import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sectionFilter = searchParams.get('section');

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
    questionTextEn: '',
    questionTextSi: '',
    questionTextTa: '',
      explanationEn: '',
      explanationSi: '',
      explanationTa: '',
    inputType: 'text',
    sortOrder: 0
  });

  const handleOpen = (question?: any) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        section: question.section,
        questionTextEn: question.questionTextEn || '',
        questionTextSi: question.questionTextSi || '',
        questionTextTa: question.questionTextTa || '',
          explanationEn: question.explanationEn || '',
          explanationSi: question.explanationSi || '',
          explanationTa: question.explanationTa || '',
        inputType: question.inputType,
        sortOrder: question.sortOrder
      });
    } else {
      setEditingId(null);
      setFormData({
        section: sectionFilter || 'A',
        questionTextEn: '',
        questionTextSi: '',
        questionTextTa: '',
      explanationEn: '',
      explanationSi: '',
      explanationTa: '',
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
    { field: 'section', headerName: 'Section', width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} color="primary" size="small" />
      )
    },
    { field: 'sortOrder', headerName: 'Order', width: 90 },
    { field: 'questionTextEn', headerName: 'Question (EN)', flex: 1, minWidth: 200 },
    { field: 'questionTextSi', headerName: 'Question (SI)', flex: 1, minWidth: 200 },
    { field: 'inputType', headerName: 'Input Type', width: 130 },
    { field: 'actions', headerName: 'Actions', width: 130, sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpen(params.row)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          {!params.row.isStandard && (
            <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
          {params.row.isStandard && (
             <Chip label="Standard" size="small" color="secondary" sx={{ ml: 1, fontSize: '0.65rem', height: 20 }} />
          )}
        </Box>
      )
    }
  ];

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading questions</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {sectionFilter === 'INDUSTRY_SURVEY' ? 'Industry Survey Questions' : 'Questions Management'}
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
          rows={(data?.questions || []).filter((q: any) => !sectionFilter || q.section === sectionFilter)}
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
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'INDUSTRY_SURVEY'].map((opt) => (
                <MenuItem key={opt} value={opt}>{opt === 'INDUSTRY_SURVEY' ? 'Industry Survey' : `Section ${opt}`}</MenuItem>
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
              label="Question Text (English)"
              name="questionTextEn"
              value={formData.questionTextEn}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Question Text (Sinhala)"
              name="questionTextSi"
              value={formData.questionTextSi}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Question Text (Tamil)"
              name="questionTextTa"
              value={formData.questionTextTa}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />
              <TextField
                label="Explanation (English)"
                name="explanationEn"
                value={formData.explanationEn}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Explanation (Sinhala)"
                name="explanationSi"
                value={formData.explanationSi}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Explanation (Tamil)"
                name="explanationTa"
                value={formData.explanationTa}
                onChange={handleChange}
                multiline
                rows={2}
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
              <MenuItem value="image">Image Upload</MenuItem>
              <MenuItem value="location_province">Location: Province</MenuItem>
              <MenuItem value="location_district">Location: District</MenuItem>
              <MenuItem value="location_ds">Location: DS Division</MenuItem>
              <MenuItem value="location_gn">Location: GN Division</MenuItem>
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
