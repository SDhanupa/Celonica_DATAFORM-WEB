import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, IconButton, Avatar, Container } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PublicIcon from '@mui/icons-material/Public';

interface Survey {
  id: number | string;
  ccode: string;
  district: string;
  ds_division: string;
  gn_name: string;
  status: string;
  created_at: string;
  form_data: any;
  isLocal?: boolean;
}

const MySubmissionsDashboard: React.FC = () => {
  const { token, userInfo } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSurvey, setViewSurvey] = useState<Survey | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/my-industry-surveys', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const dbSurveys = await res.json();
          
          const localSurveys: Survey[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('survey_draft_') && !key.endsWith('_db_id')) {
              const ccode = key.replace('survey_draft_', '');
              const dbId = localStorage.getItem(`${key}_db_id`);
              
              if (!dbId || !dbSurveys.some((s: any) => s.id.toString() === dbId)) {
                try {
                  const draftData = JSON.parse(localStorage.getItem(key) || '{}');
                  localSurveys.push({
                    id: `local_${ccode}`,
                    ccode: ccode,
                    district: 'Local',
                    ds_division: 'Draft',
                    gn_name: 'Unsynced',
                    status: 'draft',
                    created_at: draftData.surveyStartTime || new Date().toISOString(),
                    form_data: draftData,
                    isLocal: true
                  });
                } catch(e) {}
              }
            }
          }
          
          setSurveys([...localSurveys, ...dbSurveys]);
        }
      } catch (err) {
        console.error('Failed to fetch user surveys:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, [token]);

  const handleDeleteDraft = async (survey: Survey) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    
    if (survey.isLocal) {
      localStorage.removeItem(`survey_draft_${survey.ccode}`);
      localStorage.removeItem(`survey_draft_${survey.ccode}_db_id`);
      setSurveys(surveys.filter(s => s.id !== survey.id));
      return;
    }
    
    try {
      const res = await fetch(`/api/industry-survey/${survey.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSurveys(surveys.filter(s => s.id !== survey.id));
      } else {
        alert('Failed to delete draft');
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const submittedCount = surveys.filter(s => s.status === 'submitted' || s.status === 'approved').length;
  const draftCount = surveys.filter(s => s.status === 'draft').length;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#F8FAFC',
      color: '#1E293B',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* ── Top Nav ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 50,
        bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid rgba(0,0,0,0.06)`,
        px: { xs: 2, sm: 4 }, py: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0', color: '#1E293B' } }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/')} sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0', color: '#1E293B' } }}>
            <HomeOutlinedIcon />
          </IconButton>
          <Typography sx={{ ml: 2, fontWeight: 700, fontSize: '1.2rem', color: '#0F172A', display: { xs: 'none', sm: 'block' } }}>
            Submissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddCircleIcon />}
          onClick={() => {
            localStorage.setItem('force_new_submission', 'true');
            const saved = sessionStorage.getItem('user_selected_location') || localStorage.getItem('user_selected_location');
            if (saved) {
              const loc = JSON.parse(saved);
              navigate(`/industry-survey/${encodeURIComponent(loc.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(loc.CCODE)}`);
            } else {
              navigate('/industry-survey');
            }
          }}
          sx={{ 
            bgcolor: '#10B981', color: '#fff',
            borderRadius: 8, textTransform: 'none', px: 3, fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)' }
          }}
        >
          New Survey
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
            <CircularProgress sx={{ color: '#10B981' }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 4, 
                  background: '#FFFFFF',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)'
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.1)', mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: '#10B981' }} />
                    </Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#0F172A', mb: 1 }}>{submittedCount}</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 500 }}>Completed Submissions</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 4, 
                  background: '#FFFFFF',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  boxShadow: '0 10px 30px rgba(245, 158, 11, 0.08)'
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'rgba(245, 158, 11, 0.1)', mb: 2 }}>
                      <DraftsIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
                    </Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#0F172A', mb: 1 }}>{draftCount}</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 500 }}>Drafts In Progress</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: '#1E293B' }}>
              <AssignmentIcon sx={{ color: '#3B82F6' }} /> My Submissions
            </Typography>
            
            {surveys.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 3 }}>
                  You haven't submitted any surveys yet.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/industry-survey')}
                  sx={{ color: '#3B82F6', borderColor: 'rgba(59, 130, 246, 0.3)', fontWeight: 600, '&:hover': { borderColor: '#2563EB', color: '#2563EB', bgcolor: 'rgba(59, 130, 246, 0.05)' } }}
                >
                  Start Your First Survey
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {surveys.map(survey => (
                  <Grid item xs={12} md={6} key={survey.id}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 4, 
                      background: '#FFFFFF', 
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)', borderColor: 'rgba(59, 130, 246, 0.3)' }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A', pr: 2 }}>
                          {survey.form_data?.formValues?.b_name || survey.form_data?.b_name || 'Unnamed Business'}
                        </Typography>
                        <Chip 
                          label={survey.status.toUpperCase()} 
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', borderRadius: 2,
                            bgcolor: survey.status === 'draft' ? 'rgba(245, 158, 11, 0.1)' : survey.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: survey.status === 'draft' ? '#D97706' : survey.status === 'approved' ? '#059669' : '#2563EB',
                            border: `1px solid ${survey.status === 'draft' ? 'rgba(245, 158, 11, 0.2)' : survey.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" sx={{ color: '#94A3B8' }} /> {survey.gn_name}, {survey.ds_division}
                        </Typography>
                        {(survey.form_data?.formValues?.b_category || survey.form_data?.b_category) && (
                          <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon fontSize="small" sx={{ color: '#94A3B8' }} /> {survey.form_data?.formValues?.b_category || survey.form_data?.b_category}
                          </Typography>
                        )}
                        {(survey.form_data?.formValues?.b_mobile || survey.form_data?.b_mobile) && (
                          <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" sx={{ color: '#94A3B8' }} /> {survey.form_data?.formValues?.b_mobile || survey.form_data?.b_mobile}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ color: '#94A3B8' }} /> {new Date(survey.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      {survey.status === 'draft' ? (
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Completion</Typography>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: '#10B981' }}>{Math.round(((survey.form_data?.currentStep || 0) / 14) * 100)}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.round(((survey.form_data?.currentStep || 0) / 14) * 100)} 
                            sx={{ mb: 3, borderRadius: 2, height: 6, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#10B981' } }} 
                          />
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button 
                              variant="contained" 
                              size="small" 
                              sx={{ flex: 1.5, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}
                              onClick={() => {
                                if (survey.isLocal) {
                                  localStorage.setItem('force_new_submission', 'false');
                                  const targetGn = survey.gn_name && survey.gn_name !== 'Unsynced' ? survey.gn_name : 'Unknown';
                                  navigate(`/industry-survey/${encodeURIComponent(targetGn.replace(/ /g, '-'))}/${encodeURIComponent(survey.ccode)}`);
                                } else {
                                  const draftKey = `survey_draft_${survey.ccode}`;
                                  localStorage.setItem(draftKey, JSON.stringify(survey.form_data));
                                  localStorage.setItem(`${draftKey}_db_id`, survey.id.toString());
                                  navigate(`/industry-survey`);
                                }
                              }}
                            >
                              Continue
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={{ flex: 1, borderColor: '#CBD5E1', color: '#475569', borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' } }}
                              onClick={() => setViewSurvey(survey)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444', borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: '#DC2626', bgcolor: 'rgba(239, 68, 68, 0.05)' } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(survey);
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', pt: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ flex: 1, borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3B82F6', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#2563EB', color: '#2563EB', bgcolor: 'rgba(59, 130, 246, 0.05)' } }}
                            onClick={() => setViewSurvey(survey)}
                          >
                            View Data
                          </Button>
                          
                          {(() => {
                            const rno = survey.form_data?.formValues?.b_reg_number || survey.form_data?.b_reg_number || survey.form_data?.b_reg_no || (survey as any).reg_number;
                            if (rno) {
                              return (
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  startIcon={<PublicIcon fontSize="small" />}
                                  sx={{ flex: 1.2, bgcolor: '#3B82F6', color: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#2563EB' } }}
                                  onClick={() => navigate(`/business/${encodeURIComponent(rno)}`)}
                                >
                                  Public Profile
                                </Button>
                              );
                            }
                            return null;
                          })()}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>

      {/* View Survey Modal */}
      <Dialog open={!!viewSurvey} onClose={() => setViewSurvey(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#FFFFFF', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#0F172A' }}>
          {viewSurvey?.form_data?.formValues?.b_name || viewSurvey?.form_data?.b_name || 'Survey Details'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <Grid container spacing={3}>
            {Object.entries(viewSurvey?.form_data?.formValues || viewSurvey?.form_data || {}).map(([key, val]) => {
              if (['currentStep', 'surveyStartTime', 'gpsCoordinates'].includes(key)) return null;
              
              const label = key
                .replace(/^b_/, 'Business ')
                .replace(/^q_/, 'Question ')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
                
              return (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {label}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 500, mt: 0.5, wordBreak: 'break-word' }}>
                      {typeof val === 'object' ? JSON.stringify(val) : String(val || '-')}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: '#FFFFFF' }}>
          <Button variant="outlined" onClick={() => setViewSurvey(null)} sx={{ color: '#475569', borderColor: '#CBD5E1', borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#94A3B8', bgcolor: '#F1F5F9' } }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySubmissionsDashboard;
