import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useMutation } from '@apollo/client';
import { CREATE_QUESTION, UPDATE_QUESTION } from '../graphql/mutations';
import { GET_CATEGORY_BY_SLUG, GET_CATEGORY_ANSWERS } from '../graphql/queries';

interface QuestionDialogProps {
  open: boolean;
  onClose: () => void;
  question?: any; // If edit mode
  categoryId: string; // The category to attach to
  parentSlug: string; // For refetching the category questions
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({ open, onClose, question, categoryId, parentSlug }) => {
  const [questionTextEn, setQuestionTextEn] = useState('');
  const [questionTextSi, setQuestionTextSi] = useState('');
  const [inputType, setInputType] = useState('text');
  const [isRepeater, setIsRepeater] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const [createQuestion] = useMutation(CREATE_QUESTION);
  const [updateQuestion] = useMutation(UPDATE_QUESTION);

  useEffect(() => {
    if (question) {
      setQuestionTextEn(question.questionTextEn || '');
      setQuestionTextSi(question.questionTextSi || '');
      setInputType(question.inputType || 'text');
      setIsRepeater(question.isRepeater || false);
      setSortOrder(question.sortOrder || 0);
    } else {
      setQuestionTextEn('');
      setQuestionTextSi('');
      setInputType('text');
      setIsRepeater(false);
      setSortOrder(0);
    }
  }, [question, open]);

  const handleSave = async () => {
    try {
      const refetchQueries = [
        { query: GET_CATEGORY_BY_SLUG, variables: { slug: parentSlug } }
      ];

      if (question) {
        await updateQuestion({
          variables: {
            id: question.id,
            categoryId,
            questionTextEn,
            questionTextSi,
            inputType,
            isRepeater,
            sortOrder: parseInt(sortOrder.toString()),
          },
          refetchQueries,
        });
      } else {
        await createQuestion({
          variables: {
            categoryId,
            questionTextEn,
            questionTextSi,
            inputType,
            isRepeater,
            sortOrder: parseInt(sortOrder.toString()),
          },
          refetchQueries,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save question');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{question ? 'Edit Question' : 'Add Question'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Question Text (English)"
          value={questionTextEn}
          onChange={(e) => setQuestionTextEn(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <TextField
          label="Question Text (Sinhala)"
          value={questionTextSi}
          onChange={(e) => setQuestionTextSi(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <FormControl fullWidth>
          <InputLabel>Input Type</InputLabel>
          <Select
            value={inputType}
            label="Input Type"
            onChange={(e) => setInputType(e.target.value)}
          >
            <MenuItem value="text">Text (Short Answer)</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="boolean">Yes/No (Boolean)</MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
          </Select>
        </FormControl>

        {inputType === 'number' && (
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeater}
                onChange={(e) => setIsRepeater(e.target.checked)}
              />
            }
            label="Is Multiplier? (Determines how many times subsequent questions repeat)"
          />
        )}

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

export default QuestionDialog;
