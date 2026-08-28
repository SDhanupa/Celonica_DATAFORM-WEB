import React, { useState, useEffect } from 'react';
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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Alert,
  Stack,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Translate as TranslateIcon,
  HelpOutline as HelpOutlineIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

const STEP_LABELS: Record<number, { en: string; badge: string; locked?: boolean }> = {
  0: { en: 'Business Information', badge: 'Step 0', locked: true },
  1: { en: 'Business Owner Information', badge: 'Step 1', locked: true },
  2: { en: 'Legal Status of the Business', badge: 'Step 2' },
  3: { en: 'Location & Infrastructure', badge: 'Step 3' },
  4: { en: 'Infrastructure and Services', badge: 'Step 4' },
  5: { en: 'Capital Sources & Workforce', badge: 'Step 5' },
  6: { en: 'Production & Operations', badge: 'Step 6' },
  7: { en: 'Finance & Marketing', badge: 'Step 7' },
  8: { en: 'Challenges & Future Plans', badge: 'Step 8' },
};

const TYPE_LABELS: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' }> = {
  text: { label: 'Text', color: 'default' },
  number: { label: 'Number', color: 'info' },
  select: { label: 'Dropdown', color: 'primary' },
  multiselect: { label: 'Multi-select', color: 'secondary' },
  custom: { label: 'Custom UI', color: 'warning' },
  photo: { label: 'Photo Upload', color: 'success' },
};

const EMPTY_FORM = {
  step_index: 2,
  field_key: '',
  type: 'text',
  question_en: '',
  question_si: '',
  question_ta: '',
  explanation_en: '',
  explanation_si: '',
  explanation_ta: '',
  options_json: '',
  depends_on: '',
  is_active: true,
  sort_order: 0,
};

const AdminIndustrySurveysQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'question' | 'description' | 'options'>('question');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [expandedStep, setExpandedStep] = useState<number | false>(0);
  const { token } = useAuth();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/business-survey-questions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data || []);
      } else {
        setError('Failed to fetch questions');
      }
    } catch {
      setError('Network error fetching questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleOpen = (question?: any) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        step_index: question.step_index ?? 2,
        field_key: question.field_key || '',
        type: question.type || 'text',
        question_en: question.question_en || '',
        question_si: question.question_si || '',
        question_ta: question.question_ta || '',
        explanation_en: question.explanation_en || '',
        explanation_si: question.explanation_si || '',
        explanation_ta: question.explanation_ta || '',
        options_json: question.options_json ? JSON.stringify(question.options_json, null, 2) : '',
        depends_on: question.depends_on || '',
        is_active: question.is_active === undefined ? true : question.is_active,
        sort_order: question.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
    }
    setActiveTab('question');
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'sort_order' || name === 'step_index') ? (parseInt(value) || 0) : value,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (payload.options_json) {
        try { payload.options_json = JSON.parse(payload.options_json); }
        catch { alert('Invalid JSON format in Options field. Please fix it before saving.'); setSaving(false); return; }
      } else {
        payload.options_json = null;
      }
      if (!payload.explanation_en) payload.explanation_en = null;
      if (!payload.explanation_si) payload.explanation_si = null;
      if (!payload.explanation_ta) payload.explanation_ta = null;

      const url = editingId ? `/api/business-survey-questions/${editingId}` : `/api/business-survey-questions`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchQuestions();
        setOpen(false);
      } else {
        alert('Error saving: ' + (data.message || JSON.stringify(data.errors)));
      }
    } catch {
      alert('Network error saving question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, fieldKey: string) => {
    if (window.confirm(`Delete question "${fieldKey}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`/api/business-survey-questions/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) fetchQuestions();
        else alert('Failed to delete question');
      } catch { alert('Network error deleting.'); }
    }
  };

  // Group by step
  const grouped = Object.keys(STEP_LABELS).reduce((acc: Record<number, any[]>, key) => {
    const step = parseInt(key);
    acc[step] = questions.filter(q => q.step_index === step).sort((a, b) => a.sort_order - b.sort_order);
    return acc;
  }, {} as Record<number, any[]>);

  const totalCount = questions.length;
  const descCount = questions.filter(q => q.explanation_en).length;

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress size={48} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Industry Survey Questions Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all survey questions, labels, and tooltip descriptions across 3 languages (English, Sinhala, Tamil).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ background: 'linear-gradient(45deg, #6C63FF 30%, #8A84FF 90%)', boxShadow: '0 3px 5px 2px rgba(108,99,255,.3)', borderRadius: 2 }}
        >
          Add New Question
        </Button>
      </Box>

      {/* Stats banner */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip icon={<InfoIcon />} label={`${totalCount} Total Questions`} color="primary" variant="outlined" />
        <Chip icon={<TranslateIcon />} label={`${descCount} with Descriptions`} color={descCount === totalCount ? 'success' : 'warning'} variant="outlined" />
        <Chip icon={<LockIcon />} label="Steps 0 & 1: Custom UI (labels editable)" color="default" variant="outlined" size="small" />
      </Stack>

      {descCount < totalCount && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>{totalCount - descCount} questions</strong> don't have descriptions/tooltips yet. Click ✏️ Edit on any question to add them. Descriptions appear as help tooltips (ℹ️) to users filling out the survey.
        </Alert>
      )}

      {/* Steps Accordion */}
      {Object.entries(STEP_LABELS).map(([stepKey, stepInfo]) => {
        const step = parseInt(stepKey);
        const stepQuestions = grouped[step] || [];
        return (
          <Accordion
            key={step}
            expanded={expandedStep === step}
            onChange={() => setExpandedStep(expandedStep === step ? false : step)}
            sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip label={stepInfo.badge} color={step <= 1 ? 'warning' : 'primary'} size="small" sx={{ fontWeight: 700 }} />
                <Typography fontWeight={600}>{stepInfo.en}</Typography>
                {stepInfo.locked && (
                  <Tooltip title="Steps 0 & 1 use custom UI logic (OTP, NIC, Photo). Their labels and descriptions are still editable here.">
                    <Chip icon={<LockIcon fontSize="small" />} label="Custom UI" size="small" variant="outlined" color="warning" />
                  </Tooltip>
                )}
                <Chip label={`${stepQuestions.length} questions`} size="small" variant="outlined" />
                {stepQuestions.some(q => !q.explanation_en) && (
                  <Chip label="Missing descriptions" size="small" color="warning" variant="outlined" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 140 }}>Field Key</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 110 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Question (English)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 100 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stepQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                        No questions in this step yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stepQuestions.map((q, idx) => (
                      <TableRow key={q.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 0.8, py: 0.3, borderRadius: 1, display: 'inline-block' }}>
                            {q.field_key}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(TYPE_LABELS[q.type] || { label: q.type }).label}
                            color={(TYPE_LABELS[q.type] || { color: 'default' }).color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{q.question_en}</Typography>
                          {q.question_si && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              🇱🇰 {q.question_si.substring(0, 60)}{q.question_si.length > 60 ? '…' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {q.explanation_en ? (
                            <Tooltip title={q.explanation_en} arrow>
                              <Typography variant="caption" sx={{ color: 'success.main', cursor: 'help', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <HelpOutlineIcon sx={{ fontSize: 14 }} /> {q.explanation_en.substring(0, 40)}{q.explanation_en.length > 40 ? '…' : ''}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="warning.main">⚠️ No description</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit question & description">
                            <IconButton size="small" onClick={() => handleOpen(q)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {step >= 2 && (
                            <Tooltip title="Delete question">
                              <IconButton size="small" onClick={() => handleDelete(q.id, q.field_key)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {step >= 2 && (
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => { setFormData({ ...EMPTY_FORM, step_index: step, sort_order: stepQuestions.length }); setEditingId(null); setActiveTab('question'); setOpen(true); }}>
                    Add Question to {stepInfo.badge}
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Edit / Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingId ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
            <Typography variant="h6" fontWeight={700}>
              {editingId ? `Edit: ${formData.field_key}` : 'Add New Question'}
            </Typography>
          </Box>
          {formData.step_index <= 1 && (
            <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
              <strong>Steps 0 & 1 are hardcoded UI.</strong> You can only change the question label and description/tooltip text here — the input layout is fixed.
            </Alert>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {/* Tab buttons */}
          <Stack direction="row" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, pt: 1 }} spacing={1}>
            {(['question', 'description', 'options'] as const).map(tab => (
              <Button
                key={tab}
                size="small"
                variant={activeTab === tab ? 'contained' : 'text'}
                onClick={() => setActiveTab(tab)}
                sx={{ borderRadius: '8px 8px 0 0', mb: '-1px', textTransform: 'capitalize', fontWeight: 600 }}
              >
                {tab === 'question' ? '📝 Question Labels' : tab === 'description' ? '💬 Descriptions (Tooltips)' : '⚙️ Options & Advanced'}
              </Button>
            ))}
          </Stack>

          <Box sx={{ p: 3 }}>
            {/* Tab: Question Labels */}
            {activeTab === 'question' && (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Step (0 = Business Info, 1 = Owner Info, 2-8 = Dynamic)"
                    name="step_index"
                    type="number"
                    value={formData.step_index}
                    onChange={handleChange}
                    fullWidth
                    disabled={!!editingId && formData.step_index <= 1}
                    InputProps={{ inputProps: { min: 0, max: 8 } }}
                  />
                  <TextField
                    label="Sort Order"
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleChange}
                    sx={{ width: 160 }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Field Key (unique identifier, e.g. b_name)"
                    name="field_key"
                    value={formData.field_key}
                    onChange={handleChange}
                    fullWidth
                    disabled={!!editingId && formData.step_index <= 1}
                    InputProps={{ sx: { fontFamily: 'monospace' }, startAdornment: <InputAdornment position="start">🔑</InputAdornment> }}
                  />
                  <TextField
                    select
                    label="Input Type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange as any}
                    sx={{ width: 200 }}
                    disabled={!!editingId && formData.step_index <= 1}
                  >
                    <MenuItem value="text">Text (Short Answer)</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="select">Dropdown</MenuItem>
                    <MenuItem value="multiselect">Multi-select</MenuItem>
                    <MenuItem value="custom">Custom (Steps 0 & 1)</MenuItem>
                    <MenuItem value="photo">Photo Upload</MenuItem>
                  </TextField>
                </Box>
                <Divider>Question Text in 3 Languages</Divider>
                <TextField label="🇬🇧 Question (English)" name="question_en" value={formData.question_en} onChange={handleChange} fullWidth required />
                <TextField label="🇱🇰 Question (Sinhala)" name="question_si" value={formData.question_si} onChange={handleChange} fullWidth />
                <TextField label="🇮🇳 Question (Tamil)" name="question_ta" value={formData.question_ta} onChange={handleChange} fullWidth />
              </Stack>
            )}

            {/* Tab: Descriptions */}
            {activeTab === 'description' && (
              <Stack spacing={2}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Descriptions appear as a <strong>tooltip (ℹ️ help icon)</strong> next to each question label in the survey form. They guide respondents on how to answer correctly. Leave blank to show the default tooltip.
                </Alert>
                <TextField label="🇬🇧 Description / Tooltip (English)" name="explanation_en" value={formData.explanation_en} onChange={handleChange} multiline rows={3} fullWidth placeholder="E.g.: Enter the official registered name of your business as it appears on your business certificate." />
                <TextField label="🇱🇰 Description / Tooltip (Sinhala)" name="explanation_si" value={formData.explanation_si} onChange={handleChange} multiline rows={3} fullWidth placeholder="සිංහල විස්තරය ඇතුළු කරන්න..." />
                <TextField label="🇮🇳 Description / Tooltip (Tamil)" name="explanation_ta" value={formData.explanation_ta} onChange={handleChange} multiline rows={3} fullWidth placeholder="தமிழ் விளக்கம் உள்ளிடவும்..." />
              </Stack>
            )}

            {/* Tab: Options & Advanced */}
            {activeTab === 'options' && (
              <Stack spacing={2}>
                {(formData.type === 'select' || formData.type === 'multiselect') ? (
                  <>
                    <Alert severity="info">
                      Provide options as a JSON object with <code>en</code>, <code>si</code>, and <code>ta</code> keys. Each value is a string where options are separated by spaces (e.g. <code>"1. Option A 2. Option B"</code>).
                    </Alert>
                    <TextField
                      label="Options JSON (en/si/ta)"
                      name="options_json"
                      value={formData.options_json}
                      onChange={handleChange}
                      multiline
                      rows={8}
                      fullWidth
                      placeholder={`{\n  "en": "1. Option A 2. Option B 3. Option C",\n  "si": "1. විකල්පය අ 2. විකල්පය ඇ 3. විකල්පය ඈ",\n  "ta": "1. விருப்பம் A 2. விருப்பம் B 3. விருப்பம் C"\n}`}
                      InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                    />
                  </>
                ) : (
                  <Alert severity="info">Options are only needed for <strong>Dropdown</strong> and <strong>Multi-select</strong> field types. Change the Input Type in the "Question Labels" tab to enable this.</Alert>
                )}
                <Divider />
                <TextField
                  label="Conditional Display (Depends On)"
                  name="depends_on"
                  value={formData.depends_on}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g. q_legal_status:1,2"
                  helperText="Format: field_key:value1,value2 — This question will only show when the referenced field matches one of the values."
                />
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !formData.question_en || !formData.field_key}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
            sx={{ background: 'linear-gradient(45deg, #6C63FF 30%, #8A84FF 90%)' }}
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Question'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminIndustrySurveysQuestions;
