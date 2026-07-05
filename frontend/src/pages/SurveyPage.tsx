import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  LinearProgress,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_QUESTIONS, GET_MY_ANSWERS } from '../graphql/queries';
import { ANSWER_QUESTION } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

const SurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: questionsData, loading: questionsLoading, error: questionsError } = useQuery(GET_QUESTIONS, {
    fetchPolicy: 'network-only'
  });
  
  const { data: answersData, loading: answersLoading, error: answersError, refetch: refetchAnswers } = useQuery(GET_MY_ANSWERS, {
    fetchPolicy: 'network-only'
  });

  const [answerQuestion, { loading: answering }] = useMutation(ANSWER_QUESTION);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const questions = questionsData?.questions || [];
  const myAnswers = answersData?.myAnswers || [];

  // Determine starting point based on existing answers
  useEffect(() => {
    if (questions.length > 0 && myAnswers.length > 0) {
      const answeredIds = new Set(myAnswers.map((a: any) => a.question.id));
      const firstUnanswered = questions.findIndex((q: any) => !answeredIds.has(q.id));
      if (firstUnanswered !== -1) {
        setCurrentIndex(firstUnanswered);
      } else {
        // All answered!
        setCurrentIndex(questions.length);
      }
    }
  }, [questions, myAnswers]);

  if (questionsLoading || answersLoading) return <CircularProgress />;
  if (questionsError || answersError) return <Typography color="error">Error loading survey data.</Typography>;

  const handleSave = async (isSkipped: boolean = false) => {
    if (currentIndex >= questions.length) return;
    
    const currentQ = questions[currentIndex];
    setSaveError(null);
    
    try {
      await answerQuestion({
        variables: {
          questionId: currentQ.id,
          answerValue: isSkipped ? null : currentValue,
          isSkipped
        }
      });
      
      setCurrentValue('');
      await refetchAnswers();
      setCurrentIndex(prev => prev + 1);
    } catch (err: any) {
      console.error('Error saving answer:', err);
      setSaveError(err.message || 'Failed to save answer. Please ensure you are logged in as a standard user, as Admins cannot take the survey.');
    }
  };

  if (currentIndex >= questions.length && questions.length > 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 2, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>Survey Complete!</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 4 }}>Thank you for completing the questionnaire.</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ width: { xs: '100%', sm: 'auto' } }}>Return to Dashboard</Button>
      </Box>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return <Typography>No questions available.</Typography>;

  const progress = (currentIndex / questions.length) * 100;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
          Progress: {currentIndex + 1} of {questions.length}
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
      </Box>

      <Card sx={{ 
        bgcolor: 'background.paper', 
        p: { xs: 1, sm: 3 }
      }}>
        <CardContent>
          {saveError && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'error.main', color: 'error.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">{saveError}</Typography>
            </Box>
          )}
          <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Section {currentQ.section}
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 4, fontWeight: 500, lineHeight: 1.4, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {currentQ.questionText}
          </Typography>

          {currentQ.inputType === 'boolean' ? (
            <RadioGroup
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              sx={{ color: 'text.primary' }}
            >
              <FormControlLabel value="Yes" control={<Radio color="primary" />} label="ඔව් (Yes)" />
              <FormControlLabel value="No" control={<Radio color="primary" />} label="නැත (No)" />
            </RadioGroup>
          ) : (
            <TextField
              fullWidth
              variant="outlined"
              label={currentQ.inputType === 'percentage' ? 'Percentage (%)' : 'Your Answer'}
              type={currentQ.inputType === 'number' || currentQ.inputType === 'percentage' ? 'number' : 'text'}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              sx={{
                input: { color: 'text.primary' }
              }}
            />
          )}

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column-reverse', sm: 'row' }, 
            justifyContent: 'space-between', 
            gap: 2,
            mt: 5 
          }}>
            <Button
              variant="outlined"
              onClick={() => handleSave(true)}
              disabled={answering}
              color="secondary"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Skip Question
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSave(false)}
              disabled={answering || (!currentValue && currentQ.inputType !== 'boolean')}
              color="primary"
              sx={{ px: 4, width: { xs: '100%', sm: 'auto' } }}
            >
              {answering ? 'Saving...' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SurveyPage;
