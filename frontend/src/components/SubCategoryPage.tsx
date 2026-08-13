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
  CardContent,
  Tooltip
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORY_BY_SLUG, GET_CATEGORY_ANSWERS, SUBMIT_CATEGORY_DATA, GET_APPROVED_SUBMISSIONS } from '../graphql/queries';
import SurveyPage from '../pages/SurveyPage';
import { DELETE_CATEGORY, DELETE_QUESTION, ANSWER_QUESTION } from '../graphql/mutations';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExploreIcon from '@mui/icons-material/Explore';
import CategoryDialog from './CategoryDialog';
import BulkUploadDialog from './BulkUploadDialog';
import CategoryDataList from './CategoryDataList';
import CategoryDataAdminTable from './CategoryDataAdminTable';
import QuestionDialog from './QuestionDialog';
import { useAuth } from '../auth/AuthProvider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { TextField, RadioGroup, FormControlLabel, Radio, Snackbar, Alert } from '@mui/material';

interface SubCategoryPageProps {
  slug: string;
  backUrl: string;
}

const SubCategoryPage: React.FC<SubCategoryPageProps> = ({ slug, backUrl }) => {
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();
  
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

  const selectedLocation = JSON.parse(localStorage.getItem('user_selected_location') || sessionStorage.getItem('user_selected_location') || 'null');
  
  const { data: approvedSubmissionsData } = useQuery(GET_APPROVED_SUBMISSIONS, {
    variables: { categoryId: parentCategory?.id, gnCode: selectedLocation?.CCODE || selectedLocation?.ccode || selectedLocation?.code || '' },
    skip: !parentCategory?.id || !(selectedLocation?.CCODE || selectedLocation?.ccode || selectedLocation?.code),
    fetchPolicy: 'cache-and-network'
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORY_BY_SLUG, variables: { slug } }],
  });

  const [deleteQuestion] = useMutation(DELETE_QUESTION, {
    refetchQueries: [{ query: GET_CATEGORY_BY_SLUG, variables: { slug } }],
  });

  const [answerQuestion] = useMutation(ANSWER_QUESTION);
  const [submitCategoryData] = useMutation(SUBMIT_CATEGORY_DATA);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [bulkUploadCategory, setBulkUploadCategory] = useState<any>(null);

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

  // We intentionally do not load previous answers from the database globally
  // so that when a user switches GN, they start with a completely fresh form.
  useEffect(() => {
    if (isAdmin) {
      setInitialLoadComplete(true);
    } else {
      setInitialLoadComplete(true);
    }
  }, [isAdmin]);

  // Start from step 0 always
  useEffect(() => {
    if (initialLoadComplete && !hasAutoResumed.current && steps.length > 0 && !isAdmin) {
         setCurrentStep(0);
         hasAutoResumed.current = true;
    }
  }, [initialLoadComplete, steps, isAdmin]);

  const handleNext = async () => {
    // We only update the local state. No more saving to database per step.
    if (currentStep < steps.length - 1) {
        setCurrentStep(c => c + 1);
    } else {
        // Final step! Submit Category Data with GPS
        submitFinalData();
    }
  };

  const submitFinalData = async () => {
    // Get stored location
    const savedLocation = localStorage.getItem('user_selected_location') || sessionStorage.getItem('user_selected_location');
    const locationData = savedLocation ? JSON.parse(savedLocation) : null;
    
    const district = locationData?.pDistrict?.admin2NameEn || null;
    const dsDivision = locationData?.dsEn || null;
    const gnName = locationData?.nameEn || locationData?.nameSi || locationData?.nameTa || 'Unknown';
    const gnCode = locationData?.CCODE || locationData?.ccode || locationData?.code || null;
    
    const categoryId = parentCategory?.id;
    const answersData = JSON.stringify(userAnswersForm);
    
    setToast({ open: true, message: lang === 'en' ? 'Requesting Location...' : 'ස්ථානය ඉල්ලමින් පවතී...', severity: 'success' });
    
    const sendData = async (lat: number | null, lng: number | null) => {
        try {
            await submitCategoryData({
                variables: {
                    categoryId, district, dsDivision, gnName, gnCode,
                    latitude: lat, longitude: lng, answersData
                }
            });
            setToast({ open: true, message: lang === 'en' ? 'Data submitted successfully!' : 'දත්ත සාර්ථකව යවන ලදී!', severity: 'success' });
            setTimeout(() => navigate(backUrl), 1500);
        } catch (err) {
            console.error('Final submit error', err);
            setToast({ open: true, message: lang === 'en' ? 'Error submitting data.' : 'දත්ත යැවීමේ දෝෂයක්.', severity: 'error' });
        } finally {
            setSavingAnswers(false);
        }
    };

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => sendData(pos.coords.latitude, pos.coords.longitude),
            (err) => sendData(null, null), // user denied or error
            { timeout: 10000 }
        );
    } else {
        sendData(null, null);
    }
  };


  const handleSkip = async () => {
    // We only update the local state. No more saving to database per step.
    if (currentStep < steps.length - 1) {
        setCurrentStep(c => c + 1);
    } else {
        submitFinalData();
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

  const handleBulkUploadClick = (cat: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setBulkUploadCategory(cat);
    setBulkUploadOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const ancestors = [...(parentCategory.ancestors || [])].reverse();
  let currentPath = '/categories';

  const isUserArea = backUrl.startsWith('/user');

  return (
    <>
      {isUserArea && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, pointerEvents: 'none' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 3 },
            pointerEvents: 'auto',
            bgcolor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 30,
            color: '#000000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: 'max-content'
          }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton onClick={() => navigate('/gnpage')} size="small" sx={{ color: '#000000', p: 0.5, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}>
                <ExploreIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5, fontWeight: 600, fontSize: '0.95rem' }}>
              <Typography onClick={() => navigate('/gnpage')} sx={{ cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.7 } }}>Home</Typography>
              <Typography sx={{ opacity: 0.4, fontWeight: 300 }}>|</Typography>
              <Typography onClick={() => navigate('/user')} sx={{ cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.7 } }}>Dashboard</Typography>
              <Typography sx={{ opacity: 0.4, fontWeight: 300 }}>|</Typography>
              <Typography onClick={() => logout()} sx={{ cursor: 'pointer', transition: 'opacity 0.2s', color: '#ef4444', '&:hover': { opacity: 0.7 } }}>Logout</Typography>
              <Typography sx={{ opacity: 0.4, fontWeight: 300 }}>|</Typography>
              <Typography sx={{ fontWeight: 600 }}>{userInfo?.preferred_username || userInfo?.name || 'User'}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      <Box sx={{ p: 4, pt: isUserArea ? 12 : 4, maxWidth: 1200, mx: 'auto' }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={RouterLink} underline="hover" color="inherit" to={isUserArea ? backUrl : "/categories"}>
            {lang === 'en' ? 'Categories' : lang === 'si' ? 'වර්ග' : 'வகைகள்'}
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
              {lang === 'en' ? anc.nameEn : lang === 'si' ? (anc.nameSi || anc.nameEn) : (anc.nameTa || anc.nameEn)}
            </MuiLink>
          );
        })}
        <Typography color="text.primary">
          {lang === 'en' ? parentCategory.nameEn : lang === 'si' ? (parentCategory.nameSi || parentCategory.nameEn) : (parentCategory.nameTa || parentCategory.nameEn)}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(backUrl)} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {lang === 'en' ? parentCategory.nameEn : lang === 'si' ? (parentCategory.nameSi || parentCategory.nameEn) : (parentCategory.nameTa || parentCategory.nameEn)}
            </Typography>
            {(parentCategory.descriptionEn || parentCategory.descriptionSi) && (
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {lang === 'en' ? (parentCategory.descriptionEn || parentCategory.descriptionSi) : lang === 'si' ? (parentCategory.descriptionSi || parentCategory.descriptionEn) : (parentCategory.descriptionTa || parentCategory.descriptionEn)}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isSuperAdmin && (
            <>
              <Button variant="contained" color="secondary" startIcon={<CloudUploadIcon />} onClick={(e) => handleBulkUploadClick(parentCategory, e as any)}>
                Bulk Upload Data
              </Button>
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
                    <Tooltip title="Edit Sub-Category" arrow placement="top">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleEdit(cat, e)}>
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Sub-Category" arrow placement="top">
                      <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} onClick={(e) => handleDelete(cat.id, e)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
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
                      {lang === 'en' ? q.questionTextEn : lang === 'si' ? (q.questionTextSi || q.questionTextEn) : (q.questionTextTa || q.questionTextEn)} {q.isRepeater ? '(Multiplier)' : ''}
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

      {/* User Empty State / Go Back Button */}
      {!isAdmin && steps.length === 0 && categories.length === 0 && (
        <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Typography variant="h6" color="text.secondary">
            {lang === 'en' ? 'No data or questions available for this category yet.' : 'මෙම කාණ්ඩය සඳහා මෙතෙක් දත්ත හෝ ප්‍රශ්න නොමැත.'}
          </Typography>
        </Box>
      )}

      {/* User Wizard View */}
      {!isAdmin && categories.length === 0 && (
        <Box sx={{ mt: 6 }}>
          <SurveyPage slug={slug} />
        </Box>
      )}

      {/* Approved Submissions Section */}
      {!isAdmin && approvedSubmissionsData?.approvedSubmissions?.length > 0 && (
        <Box sx={{ mt: 6, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
             {lang === 'en' ? 'Approved Data' : 'අනුමත දත්ත'}
          </Typography>
          <Grid container spacing={2}>
            {approvedSubmissionsData.approvedSubmissions.map((sub: any, index: number) => {
               let answers: any = {};
               try {
                 answers = typeof sub.answers_data === 'string' ? JSON.parse(sub.answers_data) : (sub.answers_data || {});
               } catch { answers = {}; }
               return (
                 <Grid item xs={12} key={sub.id}>
                   <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '4px solid #10b981' }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                       <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981' }}>
                         #{index + 1}
                       </Typography>
                       <Typography variant="subtitle2" color="text.secondary">
                         {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : ''}
                       </Typography>
                     </Box>
                     {/* Parse the answers object and display */}
                     <Grid container spacing={1}>
                       {Object.entries(answers).map(([key, val]: any) => {
                         // try to find the question text
                         const parts = key.split('_');
                         const qIdStr = parts[0];
                         const iter = parts[1];
                         const q = questions.find((x: any) => String(x.id) === String(qIdStr));
                         let qLabel = q ? (lang === 'en' ? q.questionTextEn : lang === 'si' ? (q.questionTextSi || q.questionTextEn) : (q.questionTextTa || q.questionTextEn)) : `Question #${qIdStr}`;
                         if (iter && iter !== '1') qLabel += ` (Item #${iter})`;
                         return (
                           <Grid item xs={12} sm={6} key={key}>
                             <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{qLabel}</Typography>
                             <Typography variant="body2" sx={{ fontWeight: 600 }}>{val || '-'}</Typography>
                           </Grid>
                         );
                       })}
                     </Grid>
                   </Paper>
                 </Grid>
               );
            })}
          </Grid>
        </Box>
      )}

      {/* Bulk Uploaded Data Section */}
      <Box sx={{ mt: 4 }}>
        {isSuperAdmin ? (
          <CategoryDataAdminTable 
            slug={slug || ''} 
          />
        ) : (
          <CategoryDataList 
            slug={slug || ''} 
            categoryName={parentCategory?.nameEn || parentCategory?.nameSi || parentCategory?.nameTa || 'Category Data'}
            districtId={selectedLocation?.district_id}
            dsDivisionCode={selectedLocation?.ds_division_code}
            gnId={selectedLocation?.CCODE || selectedLocation?.ccode || selectedLocation?.code}
          />
        )}
      </Box>

      <CategoryDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        category={editingCategory}
        parentId={parentCategory?.id}
        parentSlug={slug}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        category={bulkUploadCategory}
        onSuccess={() => {
          window.location.reload();
        }}
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
    </>
  );
};

export default SubCategoryPage;
