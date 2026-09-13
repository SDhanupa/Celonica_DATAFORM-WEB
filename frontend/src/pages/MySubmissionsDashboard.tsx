import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DraftsIcon from '@mui/icons-material/Drafts';

interface Survey {
  id: number;
  ccode: string;
  district: string;
  ds_division: string;
  gn_name: string;
  status: string;
  created_at: string;
  form_data: any;
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
          const data = await res.json();
          setSurveys(data);
        }
      } catch (err) {
        console.error('Failed to fetch user surveys:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, [token]);

  const submittedCount = surveys.filter(s => s.status === 'submitted' || s.status === 'approved').length;
  const draftCount = surveys.filter(s => s.status === 'draft').length;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon fontSize="large" color="primary" />
          Industry Survey
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
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
          sx={{ borderRadius: 8, textTransform: 'none', px: 3, fontWeight: 'bold' }}
        >
          New Industry Survey
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: '#f0fdf4' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="success.main">{submittedCount}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">Completed Submissions</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: '#fffbeb' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <DraftsIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="warning.main">{draftCount}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">Drafts In Progress</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Submissions</Typography>
          
          {surveys.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You haven't submitted any surveys yet.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/industry-survey')}
              >
                Start Your First Survey
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {surveys.map(survey => (
                <Grid item xs={12} md={6} key={survey.id}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { boxShadow: 3, borderColor: 'primary.main' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {survey.form_data?.formValues?.b_name || survey.form_data?.b_name || 'Unnamed Business'}
                      </Typography>
                      <Chip 
                        label={survey.status.toUpperCase()} 
                        color={survey.status === 'draft' ? 'warning' : survey.status === 'approved' ? 'success' : 'primary'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Location:</strong> {survey.gn_name}, {survey.ds_division}, {survey.district}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Date:</strong> {new Date(survey.created_at).toLocaleDateString()}
                    </Typography>
                    
                    {survey.status === 'draft' ? (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        onClick={() => {
                          const draftKey = `survey_draft_${survey.ccode}`;
                          localStorage.setItem(draftKey, JSON.stringify(survey.form_data?.formValues || survey.form_data));
                          localStorage.setItem(`${draftKey}_db_id`, survey.id.toString());
                          navigate(`/industry-survey`);
                        }}
                      >
                        Continue Draft
                      </Button>
                    ) : (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        onClick={() => setViewSurvey(survey)}
                      >
                        View Data
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* View Survey Modal */}
      <Dialog open={!!viewSurvey} onClose={() => setViewSurvey(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {viewSurvey?.form_data?.formValues?.b_name || viewSurvey?.form_data?.b_name || 'Survey Details'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, overflow: 'auto', maxHeight: '60vh' }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {JSON.stringify(viewSurvey?.form_data?.formValues || viewSurvey?.form_data, null, 2)}
            </pre>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setViewSurvey(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySubmissionsDashboard;
