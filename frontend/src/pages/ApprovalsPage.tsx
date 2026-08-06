import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, CircularProgress, Stack,
  ToggleButton, ToggleButtonGroup, Grid, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES, GET_ALL_SUBMISSIONS_BY_CATEGORY, APPROVE_CATEGORY_SUBMISSION } from '../graphql/queries';

const ApprovalsPage: React.FC = () => {
  const { data: catData, loading: catLoading } = useQuery(GET_CATEGORIES);
  const rootCategories = catData?.categories?.filter((c: any) => !c.parent) || [];
  
  const [activeTab, setActiveTab] = useState(0);
  const selectedCategoryId = rootCategories[activeTab]?.id;

  // Status filter state: 'all', 'pending', 'approved', 'rejected'
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: subData, loading: subLoading, refetch } = useQuery(GET_ALL_SUBMISSIONS_BY_CATEGORY, {
    variables: { 
      categoryId: selectedCategoryId,
      status: null
    },
    skip: !selectedCategoryId,
    fetchPolicy: 'cache-and-network'
  });

  const allSubmissions = subData?.allSubmissionsByCategory || [];
  const displayedSubmissions = allSubmissions.filter((sub: any) => statusFilter === 'all' || sub.status === statusFilter);

  const [approveSubmission] = useMutation(APPROVE_CATEGORY_SUBMISSION);

  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ id: string; status: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleApproveClick = (id: string, status: string) => {
    setConfirmData({ id, status });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmData) return;
    try {
      await approveSubmission({ variables: { id: confirmData.id, status: confirmData.status } });
      await refetch();
      setDetailsOpen(false);
      setSnackbar({
        open: true,
        message: `Submission successfully marked as ${confirmData.status}!`,
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error updating status', err);
      const errorMsg = err.message || 'Unknown error occurred';
      setSnackbar({
        open: true,
        message: `Failed to update status: ${errorMsg}`,
        severity: 'error'
      });
      alert(`Failed to update status: ${errorMsg}`);
    } finally {
      setConfirmOpen(false);
      setConfirmData(null);
    }
  };

  const handleView = (sub: any) => {
    setSelectedSub(sub);
    setDetailsOpen(true);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="✅ Approved" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case 'rejected':
        return <Chip label="❌ Rejected" color="error" size="small" sx={{ fontWeight: 700 }} />;
      case 'pending':
      default:
        return <Chip label="⏳ Pending" color="warning" size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  // Calculate stats for current category view
  const stats = {
    total: allSubmissions.length,
    approved: allSubmissions.filter((s: any) => s.status === 'approved').length,
    pending: allSubmissions.filter((s: any) => s.status === 'pending').length,
    rejected: allSubmissions.filter((s: any) => s.status === 'rejected').length,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Inter', sans-serif" }}>
          Data Approvals & History
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
          Review submitted category data, approve new entries, and inspect previously approved or rejected records.
        </Typography>
      </Box>

      {catLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Category Tabs */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, nv) => setActiveTab(nv)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                bgcolor: '#f8fafc',
                '& .MuiTab-root': { fontWeight: 700, py: 2, fontSize: '0.95rem' }
              }}
            >
              {rootCategories.map((c: any) => (
                <Tab key={c.id} label={c.nameEn} />
              ))}
            </Tabs>
          </Paper>

          {/* Filter Bar & Status Overview */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontWeight: 700, mr: 1, color: 'text.secondary' }}>Filter Status:</Typography>
              <ToggleButtonGroup
                value={statusFilter}
                exclusive
                onChange={(_, newVal) => { if (newVal !== null) setStatusFilter(newVal); }}
                size="small"
                sx={{ bgcolor: '#fff', borderRadius: 2, '& .MuiToggleButton-root': { px: 2, fontWeight: 700, textTransform: 'none' } }}
              >
                <ToggleButton value="all">All Records</ToggleButton>
                <ToggleButton value="pending">⏳ Pending</ToggleButton>
                <ToggleButton value="approved">✅ Approved</ToggleButton>
                <ToggleButton value="rejected">❌ Rejected</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Chip label={`Approved: ${stats.approved}`} color="success" variant="outlined" sx={{ fontWeight: 700, bgcolor: '#f0fdf4' }} />
              <Chip label={`Pending: ${stats.pending}`} color="warning" variant="outlined" sx={{ fontWeight: 700, bgcolor: '#fffbeb' }} />
              <Chip label={`Rejected: ${stats.rejected}`} color="error" variant="outlined" sx={{ fontWeight: 700, bgcolor: '#fef2f2' }} />
            </Stack>
          </Box>

          {/* Submissions Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ p: 0 }}>
              {subLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Code / Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sub-Category</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>GN Location</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedSubmissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              No submissions found matching this filter.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {displayedSubmissions.map((sub: any) => (
                        <TableRow key={sub.id} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell>{getStatusChip(sub.status)}</TableCell>
                          <TableCell><Chip label={sub.generated_code || 'N/A'} size="small" variant="outlined" sx={{ fontWeight: 600, fontFamily: 'monospace' }} /></TableCell>
                          <TableCell><Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>{sub.category?.nameEn || '—'}</Typography></TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.user?.name || 'Unknown'}</Typography>
                            {sub.user?.email && <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{sub.user.email}</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>{sub.gn_name} ({sub.gn_code})</Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{sub.ds_division}, {sub.district}</Typography>
                          </TableCell>
                          <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <Button variant="outlined" size="small" onClick={() => handleView(sub)} sx={{ mr: 1, fontWeight: 600, borderRadius: 2 }}>View Details</Button>
                            {sub.status !== 'approved' && (
                              <Button variant="contained" color="success" size="small" onClick={() => handleApproveClick(sub.id, 'approved')} sx={{ mr: 0.5, fontWeight: 700, borderRadius: 2 }}>
                                {sub.status === 'rejected' ? 'Re-approve' : 'Accept'}
                              </Button>
                            )}
                            {sub.status !== 'rejected' && (
                              <Button variant="outlined" color="error" size="small" onClick={() => handleApproveClick(sub.id, 'rejected')} sx={{ fontWeight: 700, borderRadius: 2 }}>
                                {sub.status === 'approved' ? 'Revoke' : 'Reject'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <span>Submission Details</span>
          {selectedSub && getStatusChip(selectedSub.status)}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedSub && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Location Data</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>GN Division: {selectedSub.gn_name} ({selectedSub.gn_code})</Typography>
                    <Typography variant="body2" color="text.secondary">DS Division: {selectedSub.ds_division}</Typography>
                    <Typography variant="body2" color="text.secondary">District: {selectedSub.district}</Typography>
                    {selectedSub.latitude && (
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', fontFamily: 'monospace', color: 'primary.main', fontWeight: 700 }}>
                        GPS: {selectedSub.latitude}, {selectedSub.longitude}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Submission Info</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Category: {selectedSub.category?.nameEn}</Typography>
                    <Typography variant="body2" color="text.secondary">Submitted By: {selectedSub.user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Date: {new Date(selectedSub.created_at).toLocaleString()}</Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', fontFamily: 'monospace', color: 'text.secondary' }}>
                      Ref Code: {selectedSub.generated_code}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Submitted Answers</Typography>
              <Paper variant="outlined" sx={{ mt: 0.5, borderRadius: 2, overflow: 'hidden' }}>
                {(() => {
                  if (!selectedSub.answers_data) return <Box sx={{ p: 2 }}><Typography>No answers provided.</Typography></Box>;
                  try {
                    const parsedAnswers = typeof selectedSub.answers_data === 'string' ? JSON.parse(selectedSub.answers_data) : selectedSub.answers_data;
                    const questions = selectedSub.category?.questions || [];
                    
                    return (
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, py: 1.5, width: '40%' }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Answer</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(parsedAnswers).map(([key, val]) => {
                            const [qId, iter] = key.split('_');
                            const q = questions.find((q: any) => String(q.id) === String(qId));
                            const label = q ? q.questionTextEn || q.questionTextSi || q.questionTextTa : `Question #${qId}`;
                            return (
                              <TableRow key={key}>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                  {label} {iter && iter !== '1' ? `(Item #${iter})` : ''}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{String(val)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    );
                  } catch (e) {
                    return <Typography color="error" sx={{ p: 2 }}>Failed to parse answers.</Typography>;
                  }
                })()}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDetailsOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Close</Button>
          {selectedSub && selectedSub.status !== 'rejected' && (
            <Button onClick={() => handleApproveClick(selectedSub.id, 'rejected')} color="error" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }}>
              Reject Data
            </Button>
          )}
          {selectedSub && selectedSub.status !== 'approved' && (
            <Button onClick={() => handleApproveClick(selectedSub.id, 'approved')} color="success" variant="contained" sx={{ fontWeight: 700, borderRadius: 2 }}>
              Accept Data
            </Button>
          )}
        </DialogActions>
      </Dialog>
    
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 350 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Status Update</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to change this submission status to <strong>{confirmData?.status}</strong>?
          </Typography>
          {confirmData?.status === 'approved' && (
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              ✓ This record will become visible immediately on public GN category pages.
            </Typography>
          )}
          {confirmData?.status === 'rejected' && (
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
              ✗ This record will be hidden from public category pages.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            color={confirmData?.status === 'rejected' ? 'error' : 'success'} 
            variant="contained"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Confirm {confirmData?.status === 'approved' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalsPage;
