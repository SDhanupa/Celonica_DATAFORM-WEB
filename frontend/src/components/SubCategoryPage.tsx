import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Card,
  CardActionArea,
  CardMedia,
  CardContent
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORY_BY_SLUG, GET_CATEGORY_ANSWERS } from '../graphql/queries';
import { DELETE_CATEGORY, DELETE_QUESTION, ANSWER_QUESTION } from '../graphql/mutations';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import CategoryDialog from './CategoryDialog';
import QuestionDialog from './QuestionDialog';
import { useAuth } from '../auth/AuthProvider';
import { TextField, RadioGroup, FormControlLabel, Radio, Snackbar, Alert } from '@mui/material';

interface SubCategoryPageProps {
  slug: string;
  backUrl: string;
}

const SubCategoryPage: React.FC<SubCategoryPageProps> = ({ slug, backUrl }) => {
  const [lang, setLang] = useState<'en' | 'si'>('en');
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const roles = userInfo?.realm_roles || [];
  const isSuperAdmin = roles.includes('super_admin');
  const isAdmin = roles.includes('super_admin') || roles.includes('admin') || roles.includes('moderator');

  const { data, loading, error } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug },
  });

  const parentCategory = data?.categoryBySlug;

  const { data: answersData, loading: answersLoading, refetch: refetchAnswers } = useQuery(GET_CATEGORY_ANSWERS, {
    variables: { categoryId: parentCategory?.id },
    skip: !parentCategory?.id,
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORY_BY_SLUG, variables: { slug } }],
  });

  const [deleteQuestion] = useMutation(DELETE_QUESTION, {
    refetchQueries: [{ query: GET_CATEGORY_BY_SLUG, variables: { slug } }],
  });

  const [answerQuestion] = useMutation(ANSWER_QUESTION);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [qDialogOpen, setQDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // User survey state
  const [userAnswersForm, setUserAnswersForm] = useState<Record<string, string>>({});
  const [savingAnswers, setSavingAnswers] = useState(false);
  
  // Snackbar state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Wizard state
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const hasAutoResumed = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);

  const questions = parentCategory?.questions || [];

  // Compute steps for wizard
  const steps = useMemo(() => {
    if (questions.length === 0) return [];
    
    const result = [];
    const repeaterIndex = questions.findIndex((q: any) => q.isRepeater);
    
    if (repeaterIndex === -1) {
       return questions.map((q: any) => ({ question: q, iteration: 1 }));
    }
  
    // Add questions up to and including the repeater
    for (let i = 0; i <= repeaterIndex; i++) {
       result.push({ question: questions[i], iteration: 1 });
    }
  
    const repeaterQuestion = questions[repeaterIndex];
    const ans = userAnswersForm[`${repeaterQuestion.id}_1`];
    const parsedAns = parseInt(ans || '0', 10);
    const iterations = isNaN(parsedAns) || parsedAns < 1 ? 1 : parsedAns;
  
    // For each iteration, add the subsequent questions
    for (let iter = 1; iter <= iterations; iter++) {
       for (let i = repeaterIndex + 1; i < questions.length; i++) {
          result.push({ question: questions[i], iteration: iter });
       }
    }
  
    return result;
  }, [questions, userAnswersForm]);

  // Load existing answers into form
  useEffect(() => {
    if (answersData?.categoryAnswers && !isAdmin) {
      const initialForm: Record<string, string> = {};
      answersData.categoryAnswers.forEach((ans: any) => {
        if (ans.question && ans.answerValue) {
          initialForm[`${ans.question.id}_${ans.iteration || 1}`] = ans.answerValue;
        }
      });
      setUserAnswersForm(initialForm);
      setInitialLoadComplete(true);
    } else if (isAdmin) {
      setInitialLoadComplete(true);
    }
  }, [answersData, isAdmin]);

  // Auto-resume to first unanswered question
  useEffect(() => {
    if (initialLoadComplete && !hasAutoResumed.current && steps.length > 0 && !isAdmin) {
         let firstUnanswered = 0;
         for (let i = 0; i < steps.length; i++) {
             const step = steps[i];
             if (!userAnswersForm[`${step.question.id}_${step.iteration}`]) {
                 firstUnanswered = i;
                 break;
             }
         }
         setCurrentStep(firstUnanswered);
         hasAutoResumed.current = true;
    }
  }, [initialLoadComplete, steps, userAnswersForm, isAdmin]);

  const handleNext = async () => {
    const step = steps[currentStep];
    const answerValue = userAnswersForm[`${step.question.id}_${step.iteration}`] || '';
    
    setSavingAnswers(true);
    try {
        await answerQuestion({
            variables: {
                questionId: step.question.id,
                iteration: step.iteration,
                answerValue: answerValue,
                isSkipped: !answerValue
            }
        });
        
        await refetchAnswers();

        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            setToast({ open: true, message: lang === 'en' ? 'Survey completed!' : 'සමීක්ෂණය අවසන්!', severity: 'success' });
            setTimeout(() => navigate(backUrl), 1500);
        }
    } catch (err) {
        console.error('Failed to save answers', err);
        setToast({ open: true, message: lang === 'en' ? 'Failed to save answer.' : 'පිළිතුර සුරැකීමට අසමත් විය.', severity: 'error' });
    } finally {
        setSavingAnswers(false);
    }
  };

  const handleSkip = async () => {
    const step = steps[currentStep];
    setSavingAnswers(true);
    try {
        await answerQuestion({
            variables: {
                questionId: step.question.id,
                iteration: step.iteration,
                answerValue: null,
                isSkipped: true
            }
        });
        
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            setToast({ open: true, message: lang === 'en' ? 'Survey completed!' : 'සමීක්ෂණය අවසන්!', severity: 'success' });
            setTimeout(() => navigate(backUrl), 1500);
        }
    } catch (err) {
        setToast({ open: true, message: lang === 'en' ? 'Failed to skip.' : 'මඟ හැරීමට අසමත් විය.', severity: 'error' });
    } finally {
        setSavingAnswers(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error || !parentCategory) return <Typography color="error">Failed to load category.</Typography>;

  const categories = parentCategory.children || [];

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

  const ancestors = [...(parentCategory.ancestors || [])].reverse();
  let currentPath = '/categories';

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={RouterLink} underline="hover" color="inherit" to="/categories">
          {lang === 'en' ? 'Categories' : 'වර්ග'}
        </MuiLink>
        {ancestors.map((anc: any) => {
          currentPath += `/${anc.slug}`;
          return (
            <MuiLink 
              key={anc.id}
              component={RouterLink} 
              underline="hover" 
              color="inherit" 
              to={currentPath}
            >
              {lang === 'en' ? anc.nameEn : anc.nameSi}
            </MuiLink>
          );
        })}
        <Typography color="text.primary">
          {lang === 'en' ? parentCategory.nameEn : parentCategory.nameSi}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(backUrl)} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {lang === 'en' ? parentCategory.nameEn : parentCategory.nameSi}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isSuperAdmin && (
            <>
              <Button variant="contained" color="primary" startIcon={<QuizIcon />} onClick={() => { setEditingQuestion(null); setQDialogOpen(true); }}>
                Add Question
              </Button>
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAdd}>
                Add Sub-Category
              </Button>
            </>
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
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
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
                    const currentPath = window.location.pathname;
                    navigate(`${currentPath}/${cat.slug}`);
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
                  {!isAdmin && cat.progress !== undefined && (
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

      {/* Admin Questions Table (All questions at once) */}
      {isAdmin && questions.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Questions (Admin View)</Typography>
          <Grid container spacing={2}>
            {questions.map((q: any) => (
              <Grid item xs={12} key={q.id}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {q.questionTextEn} {q.isRepeater ? '(Multiplier)' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      setEditingQuestion(q);
                      setQDialogOpen(true);
                    }}><EditIcon color="primary" /></IconButton>
                    <IconButton size="small" onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this question?')) {
                        await deleteQuestion({ variables: { id: q.id } });
                      }
                    }}><DeleteIcon color="error" /></IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* User Wizard View */}
      {!isAdmin && steps.length > 0 && (
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, width: '100%', maxWidth: 800, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
             
             {/* Progress Bar top of wizard */}
             <LinearProgress 
                variant="determinate" 
                value={(currentStep / steps.length) * 100} 
                sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, '& .MuiLinearProgress-bar': { backgroundColor: '#FFD700' } }} 
             />

             <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Question {currentStep + 1} of {steps.length}
             </Typography>
             
             {(() => {
                const step = steps[currentStep];
                const q = step.question;
                
                // Check if this category HAS a repeater somewhere before this question, to show "(Item 1)"
                const hasRepeater = questions.some((x:any) => x.isRepeater);
                const isAfterRepeater = hasRepeater && !q.isRepeater;

                return (
                  <Box sx={{ my: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                      {lang === 'en' ? q.questionTextEn : (q.questionTextSi || q.questionTextEn)}
                    </Typography>
                    
                    {isAfterRepeater && (
                      <Typography variant="subtitle1" color="primary" sx={{ mb: 3 }}>
                         {lang === 'en' ? `Entry #${step.iteration}` : `ඇතුළත් කිරීම #${step.iteration}`}
                      </Typography>
                    )}

                    <Box sx={{ mt: 3 }}>
                      {q.inputType === 'boolean' ? (
                        <RadioGroup
                          row
                          value={userAnswersForm[`${q.id}_${step.iteration}`] || ''}
                          onChange={(e) => setUserAnswersForm({ ...userAnswersForm, [`${q.id}_${step.iteration}`]: e.target.value })}
                        >
                          <FormControlLabel value="Yes" control={<Radio color="primary" />} label={lang === 'en' ? 'Yes' : 'ඔව්'} />
                          <FormControlLabel value="No" control={<Radio color="primary" />} label={lang === 'en' ? 'No' : 'නැත'} />
                        </RadioGroup>
                      ) : (
                        <TextField
                          fullWidth
                          autoFocus
                          size="medium"
                          type={q.inputType === 'number' ? 'number' : 'text'}
                          variant="outlined"
                          placeholder={lang === 'en' ? 'Your answer...' : 'ඔබේ පිළිතුර...'}
                          value={userAnswersForm[`${q.id}_${step.iteration}`] || ''}
                          onChange={(e) => setUserAnswersForm({ ...userAnswersForm, [`${q.id}_${step.iteration}`]: e.target.value })}
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={() => navigate(backUrl)}>
                           {lang === 'en' ? 'Quit' : 'ඉවත් වන්න'}
                        </Button>
                        <Button 
                           variant="outlined" 
                           onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
                           disabled={currentStep === 0}
                        >
                           {lang === 'en' ? 'Back' : 'ආපසු'}
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="text" color="secondary" onClick={handleSkip} disabled={savingAnswers}>
                           {lang === 'en' ? 'Skip' : 'මඟ හරින්න'}
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleNext} disabled={savingAnswers}>
                           {savingAnswers ? (lang === 'en' ? 'Saving...' : 'සුරකිමින්...') : (currentStep === steps.length - 1 ? (lang === 'en' ? 'Finish' : 'අවසන් කරන්න') : (lang === 'en' ? 'Next' : 'ඊළඟට'))}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
             })()}
          </Paper>
        </Box>
      )}

      <CategoryDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        category={editingCategory}
        parentId={parentCategory.id}
        parentSlug={slug}
      />

      <QuestionDialog
        open={qDialogOpen}
        onClose={() => setQDialogOpen(false)}
        question={editingQuestion}
        categoryId={parentCategory.id}
        parentSlug={slug}
      />

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubCategoryPage;
