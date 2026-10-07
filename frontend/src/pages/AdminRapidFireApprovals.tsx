import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../auth/AuthProvider';

interface RapidFireAnswer {
  id: number;
  ccode: string;
  gn_name: string | null;
  contributor_sub: string;
  user_name: string | null;
  user_email: string | null;
  category_name: string;
  answer: string;
  status: string;
  created_at: string;
}

const AdminRapidFireApprovals: React.FC = () => {
  const { token } = useAuth();
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [data, setData] = useState<RapidFireAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rapid-fire-approvals?status=${statusTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          console.error("API success=false:", json);
        }
      } else {
        const errText = await res.text();
        console.error("HTTP Error:", res.status, errText);
      }
    } catch (err) {
      console.error('Failed to fetch rapid fire approvals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusTab, token]);

  const updateStatus = async (ids: number[], newStatus: 'approved' | 'rejected') => {
    const loadingState = { ...actionLoading };
    ids.forEach(id => loadingState[id] = true);
    setActionLoading(loadingState);

    try {
      const res = await fetch('/api/admin/rapid-fire-approvals/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids, status: newStatus })
      });
      if (res.ok) {
        // Remove updated items from current view
        setData(prev => prev.filter(item => !ids.includes(item.id)));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    } finally {
      const finalLoading = { ...actionLoading };
      ids.forEach(id => delete finalLoading[id]);
      setActionLoading(finalLoading);
    }
  };

  // Group by Village -> User
  const groupedData = data.reduce((acc, curr) => {
    const villageKey = curr.gn_name || curr.ccode || 'Unknown Village';
    if (!acc[villageKey]) acc[villageKey] = {};
    
    const userKey = curr.user_name || curr.user_email || curr.contributor_sub || 'Unknown User';
    if (!acc[villageKey][userKey]) acc[villageKey][userKey] = [];
    
    acc[villageKey][userKey].push(curr);
    return acc;
  }, {} as Record<string, Record<string, RapidFireAnswer[]>>);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        GN Location Approvals (Rapid Fire)
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={statusTab} onChange={(e, v) => setStatusTab(v)}>
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Rejected" value="rejected" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Alert severity="info">No {statusTab} records found.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(groupedData).map(([villageName, users]) => (
            <Accordion key={villageName} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{villageName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(users).map(([userName, answers]) => (
                    <Paper key={userName} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          User: {userName}
                        </Typography>
                        {statusTab === 'pending' && (
                          <Stack direction="row" spacing={1}>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success" 
                              startIcon={<CheckCircleIcon />}
                              onClick={() => updateStatus(answers.map(a => a.id), 'approved')}
                              disabled={answers.some(a => actionLoading[a.id])}
                            >
                              Approve All
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error" 
                              startIcon={<CancelIcon />}
                              onClick={() => updateStatus(answers.map(a => a.id), 'rejected')}
                              disabled={answers.some(a => actionLoading[a.id])}
                            >
                              Reject All
                            </Button>
                          </Stack>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {answers.map(ans => (
                          <Chip
                            key={ans.id}
                            label={`${ans.category_name}: ${ans.answer.toUpperCase()}`}
                            color={ans.answer === 'yes' ? 'success' : ans.answer === 'no' ? 'error' : 'warning'}
                            variant="outlined"
                            onDelete={statusTab === 'pending' ? () => updateStatus([ans.id], 'rejected') : undefined}
                            deleteIcon={<CancelIcon />}
                          />
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdminRapidFireApprovals;
