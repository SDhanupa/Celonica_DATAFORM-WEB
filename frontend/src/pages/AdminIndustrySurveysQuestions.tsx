import React, { useState, useEffect, useMemo } from 'react';
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
  Image as ImageIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

export interface SubsectionInfo {
  code: string;
  title_si: string;
  title_en: string;
}

export interface SectionConfig {
  number: number;
  badge: string;
  title_en: string;
  title_si: string;
  subsections: SubsectionInfo[];
}

export const DOCX_SECTIONS: Record<number, SectionConfig> = {
  1: {
    number: 1,
    badge: 'Section 1',
    title_en: 'Identification Information',
    title_si: '1 වන කොටස: හඳුනාගැනීමේ තොරතුරු',
    subsections: [
      { code: '1.1', title_si: 'සමීක්ෂණ හඳුනාගැනීම', title_en: 'Survey Identification (GPS)' },
      { code: '1.2', title_si: 'ව්‍යාපාර හිමිකරු පිළිබඳ තොරතුරු', title_en: 'Business Owner Information' },
      { code: '1.3', title_si: 'ව්‍යාපාරයේ නීතිමය තත්ත්වය', title_en: 'Legal Status of the Business' },
    ],
  },
  2: {
    number: 2,
    badge: 'Section 2',
    title_en: 'Location & Infrastructure',
    title_si: '2 වන කොටස: ස්ථානය හා යටිතල පහසුකම්',
    subsections: [
      { code: '2.1', title_si: 'ව්‍යාපාරික ස්ථානය', title_en: 'Business Location & Premises' },
      { code: '2.2', title_si: 'යටිතල පහසුකම් හා සේවා', title_en: 'Infrastructure & Utilities' },
    ],
  },
  3: {
    number: 3,
    badge: 'Section 3',
    title_en: 'Business Characteristics',
    title_si: '3 වන කොටස: ව්‍යාපාරික ලක්ෂණ',
    subsections: [
      { code: '3.1', title_si: 'ව්‍යාපාරයේ මූලික තොරතුරු', title_en: 'Basic Information & ISIC' },
      { code: '3.2', title_si: 'ප්‍රාග්ධනය සපයාගත් ආකාරය', title_en: 'Startup Capital Sources' },
      { code: '3.3', title_si: 'ව්‍යාපාරික පරිමාණය හා වර්ගීකරණය', title_en: 'Scale & Nature' },
    ],
  },
  4: {
    number: 4,
    badge: 'Section 4',
    title_en: 'Workforce & Human Resources',
    title_si: '4 වන කොටස: ශ්‍රම බලකාය හා මානව සම්පත්',
    subsections: [
      { code: '4.1', title_si: 'සේවක පිරිස', title_en: 'Workforce Demographics' },
      { code: '4.2', title_si: 'ශ්‍රම දායකත්වය', title_en: 'Labor Setup & Training' },
    ],
  },
  5: {
    number: 5,
    badge: 'Section 5',
    title_en: 'Production & Operations',
    title_si: '5 වන කොටස: නිෂ්පාදන හා මෙහෙයුම්',
    subsections: [
      { code: '5.1', title_si: 'යන්ත්‍රෝපකරණ හා මෙවලම්', title_en: 'Machinery & Tools' },
      { code: '5.2', title_si: 'නිෂ්පාදනය', title_en: 'Production Output & Capacity' },
      { code: '5.3', title_si: 'අමුද්‍රව්‍ය', title_en: 'Raw Materials & Sourcing' },
      { code: '5.4', title_si: 'අපද්‍රව්‍ය කළමනාකරණය', title_en: 'Waste Management & Recycling' },
    ],
  },
  6: {
    number: 6,
    badge: 'Section 6',
    title_en: 'Finance & Accounting',
    title_si: '6 වන කොටස: මූල්‍ය හා ගිණුම්කරණය',
    subsections: [
      { code: '6.1', title_si: 'මූල්‍ය තොරතුරු', title_en: 'Financial Metrics & Debt' },
      { code: '6.2', title_si: 'බැංකු හා ගිණුම්කරණය', title_en: 'Banking & Bookkeeping' },
      { code: '6.3', title_si: 'මූල්‍ය සාක්ෂරතාව', title_en: 'Financial Literacy (OECD/INFE)' },
    ],
  },
  7: {
    number: 7,
    badge: 'Section 7',
    title_en: 'Market & Marketing',
    title_si: '7 වන කොටස: වෙළඳපල හා අලෙවිකරණය',
    subsections: [
      { code: '7.1', title_si: 'ගනුදෙනුකරුවන් හා වෙළඳපල', title_en: 'Buyers & Market Reach' },
      { code: '7.2', title_si: 'තරඟකාරිත්වය', title_en: 'Competition Intensity' },
      { code: '7.3', title_si: 'අලෙවිකරණය', title_en: 'Marketing Methods & E-commerce' },
    ],
  },
  8: {
    number: 8,
    badge: 'Section 8',
    title_en: 'Innovation & Technology',
    title_si: '8 වන කොටස: නවෝත්පාදන හා තාක්ෂණය',
    subsections: [
      { code: '8.1', title_si: 'නිෂ්පාදන/ක්‍රියාවලි නවෝත්පාදන', title_en: 'Product & Process Innovation' },
      { code: '8.2', title_si: 'තොරතුරු හා සන්නිවේදන තාක්ෂණය (ICT)', title_en: 'ICT & Digital Payments' },
    ],
  },
  9: {
    number: 9,
    badge: 'Section 9',
    title_en: 'Business Environment & Government Relations',
    title_si: '9 වන කොටස: ව්‍යාපාරික පරිසරය හා රාජ්‍ය සම්බන්ධතා',
    subsections: [
      { code: '9.1', title_si: 'රාජ්‍ය සම්බන්ධතා', title_en: 'State Support & Officials' },
      { code: '9.2', title_si: 'ව්‍යාපාරික ගැටළු හා බාධක', title_en: 'Business Challenges' },
      { code: '9.3', title_si: 'ව්‍යාපාරික පරිසරයේ බාධක (World Bank)', title_en: 'World Bank Barriers (1-5)' },
    ],
  },
  10: {
    number: 10,
    badge: 'Section 10',
    title_en: 'Environmental & Social Impact',
    title_si: '10 වන කොටස: පාරිසරික හා සමාජීය බලපෑම',
    subsections: [
      { code: '10.1', title_si: 'පාරිසරික බලපෑම', title_en: 'Environmental Footprint' },
      { code: '10.2', title_si: 'සමාජීය බලපෑම', title_en: 'Community Impact & Neighbors' },
    ],
  },
  11: {
    number: 11,
    badge: 'Section 11',
    title_en: 'Business Networks & Relationships',
    title_si: '11 වන කොටස: ව්‍යාපාරික ජාල හා සබඳතා',
    subsections: [
      { code: '11.1', title_si: 'පවුල් සම්බන්ධතා', title_en: 'Family Dynamics' },
      { code: '11.2', title_si: 'ප්‍රජා හා සංවිධාන සම්බන්ධතා', title_en: 'Community Societies & Chambers' },
    ],
  },
  12: {
    number: 12,
    badge: 'Section 12',
    title_en: 'Business Development Needs',
    title_si: '12 වන කොටස: ව්‍යාපාරික සංවර්ධන අවශ්‍යතා',
    subsections: [
      { code: '12.1', title_si: 'අවශ්‍යතා හා අපේක්ෂාවන්', title_en: 'Support Needs & Land' },
      { code: '12.2', title_si: 'අනාගත සැලසුම්', title_en: 'Future 1-Year Plans' },
    ],
  },
  13: {
    number: 13,
    badge: 'Section 13',
    title_en: 'Government Programs & Support',
    title_si: '13 වන කොටස: රාජ්‍ය වැඩසටහන් හා සහාය',
    subsections: [
      { code: '13.1', title_si: 'රාජ්‍ය වැඩසටහන් සම්බන්ධතා', title_en: 'Special Government Schemes' },
      { code: '13.2', title_si: 'ඇගයීම් හා පිළිගැනීම්', title_en: 'Awards & Recognitions' },
    ],
  },
  14: {
    number: 14,
    badge: 'Section 14',
    title_en: 'Transport & Logistics',
    title_si: '14 වන කොටස: ප්‍රවාහන හා සැපයුම්',
    subsections: [
      { code: '14.1', title_si: 'ප්‍රවාහනය', title_en: 'Vehicles, Logistics & Freight Costs' },
    ],
  },
  15: {
    number: 15,
    badge: 'Section 15',
    title_en: 'Additional Information',
    title_si: '15 වන කොටස: අතිරේක තොරතුරු',
    subsections: [
      { code: '15.1', title_si: 'ගම තුළ ව්‍යාප්තිය', title_en: 'Expansion in the Village' },
      { code: '15.2', title_si: 'වෙනත් අදහස්/යෝජනා', title_en: 'Comments & Suggestions' },
    ],
  },
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
  step_index: 1,
  field_key: '',
  type: 'text',
  question_en: '',
  question_si: '',
  question_ta: '',
  explanation_en: '',
  explanation_si: '',
  explanation_ta: '',
  depends_on: '',
  is_active: true,
  sort_order: 0,
};

interface Option {
  en: string;
  si: string;
  ta: string;
}

const AdminIndustrySurveysQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'question' | 'description' | 'options'>('question');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [optionsList, setOptionsList] = useState<Option[]>([]);
  const [explanationImageFile, setExplanationImageFile] = useState<File | null>(null);
  const [explanationImageUrl, setExplanationImageUrl] = useState<string | null>(null);

  const [expandedSection, setExpandedSection] = useState<number | false>(1);
  const { token } = useAuth();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/business-survey-questions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpen = (question?: any, defaultSection = 1) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        step_index: question.step_index === 0 ? 1 : (question.step_index ?? 1),
        field_key: question.field_key || '',
        type: question.type || 'text',
        question_en: question.question_en || '',
        question_si: question.question_si || '',
        question_ta: question.question_ta || '',
        explanation_en: question.explanation_en || '',
        explanation_si: question.explanation_si || '',
        explanation_ta: question.explanation_ta || '',
        depends_on: question.depends_on || '',
        is_active: question.is_active === undefined ? true : question.is_active,
        sort_order: question.sort_order || 0,
      });

      // Parse options
      const parsedOpts: Option[] = [];
      if (question.options_json) {
        try {
          const o = typeof question.options_json === 'string' ? JSON.parse(question.options_json) : question.options_json;
          const enArr = Array.isArray(o.en) ? o.en : o.en ? o.en.split(' ') : [];
          const siArr = Array.isArray(o.si) ? o.si : o.si ? o.si.split(' ') : [];
          const taArr = Array.isArray(o.ta) ? o.ta : o.ta ? o.ta.split(' ') : [];

          const len = Math.max(enArr.length, siArr.length, taArr.length);
          for (let i = 0; i < len; i++) {
            parsedOpts.push({
              en: enArr[i] || '',
              si: siArr[i] || '',
              ta: taArr[i] || '',
            });
          }
        } catch (e) {
          console.error('Error parsing options', e);
        }
      }
      setOptionsList(parsedOpts);
      setExplanationImageUrl(question.explanation_image_url || null);
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_FORM, step_index: defaultSection });
      setOptionsList([]);
      setExplanationImageUrl(null);
    }
    setExplanationImageFile(null);
    setActiveTab('question');
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sort_order' || name === 'step_index' ? parseInt(value) || 0 : value,
    }));
  };

  const handleOptionChange = (index: number, lang: keyof Option, value: string) => {
    const newOpts = [...optionsList];
    newOpts[index][lang] = value;
    setOptionsList(newOpts);
  };

  const handleAddOption = () => {
    setOptionsList([...optionsList, { en: '', si: '', ta: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptionsList(optionsList.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExplanationImageFile(e.target.files[0]);
      setExplanationImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setExplanationImageFile(null);
    setExplanationImageUrl(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          fd.append(k, String(v));
        }
      });

      // Format options JSON properly as array format
      if ((formData.type === 'select' || formData.type === 'multiselect') && optionsList.length > 0) {
        const finalOpts = {
          en: optionsList.map(o => o.en).filter(Boolean),
          si: optionsList.map(o => o.si).filter(Boolean),
          ta: optionsList.map(o => o.ta).filter(Boolean),
        };
        fd.append('options_json', JSON.stringify(finalOpts));
      }

      if (explanationImageFile) {
        fd.append('explanation_image', explanationImageFile);
      }

      let url = '/api/business-survey-questions';
      if (editingId) {
        url = `/api/business-survey-questions/${editingId}`;
        fd.append('_method', 'PUT');
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: fd,
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await res.json();
        if (res.ok && data.success) {
          fetchQuestions();
          setOpen(false);
        } else {
          alert('Error saving: ' + (data.message || JSON.stringify(data.errors) || 'Unknown error.'));
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response from server:', text);
        alert('Server returned an unexpected response. Status: ' + res.status);
      }
    } catch (err: any) {
      alert('Network error saving question: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, fieldKey: string) => {
    if (window.confirm(`Delete question "${fieldKey}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`/api/business-survey-questions/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) fetchQuestions();
        else alert('Failed to delete question');
      } catch {
        alert('Network error deleting.');
      }
    }
  };

  // Filter questions based on search term
  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;
    const term = searchTerm.toLowerCase();
    return questions.filter(
      q =>
        q.field_key?.toLowerCase().includes(term) ||
        q.question_en?.toLowerCase().includes(term) ||
        q.question_si?.toLowerCase().includes(term) ||
        q.question_ta?.toLowerCase().includes(term)
    );
  }, [questions, searchTerm]);

  // Group by DOCX 15 sections. If a question has step_index 0 or 1, map it to Section 1.
  const grouped = useMemo(() => {
    return Object.keys(DOCX_SECTIONS).reduce((acc: Record<number, any[]>, key) => {
      const secNum = parseInt(key);
      acc[secNum] = filteredQuestions
        .filter(q => (secNum === 1 ? q.step_index === 1 || q.step_index === 0 : q.step_index === secNum))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      return acc;
    }, {} as Record<number, any[]>);
  }, [filteredQuestions]);

  const totalCount = questions.length;
  const descCount = questions.filter(q => q.explanation_en || q.explanation_si).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>
              Industry Survey Questions Builder
            </Typography>
            <Chip
              label="DOCX 15 Sections Standard"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Structured according to <strong>කර්මාන්ත හා ව්‍යාපාර සමීක්ෂණ ප්‍රශ්නාවලිය</strong> across all 15 sections with trilingual labels, subsections, options, tooltips, and explanatory pictures.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)',
            boxShadow: '0 3px 5px 2px rgba(26,35,126,.3)',
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 700,
          }}
        >
          Add New Question
        </Button>
      </Box>

      {/* Stats and Search bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Chip icon={<InfoIcon />} label={`${totalCount} Questions Across 15 Sections`} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
          <Chip icon={<TranslateIcon />} label={`${descCount} with Descriptions/Tooltips`} color={descCount === totalCount ? 'success' : 'warning'} variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>

        <TextField
          size="small"
          placeholder="Search questions by text or key..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {descCount < totalCount && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>{totalCount - descCount} questions</strong> don't have descriptions/tooltips yet. Click ✏️ <strong>Edit</strong> on any question to add them. Descriptions appear as help tooltips (ℹ️) to respondents filling out the survey.
        </Alert>
      )}

      {/* 15 Sections Accordion */}
      {Object.entries(DOCX_SECTIONS).map(([secKey, secInfo]) => {
        const secNum = parseInt(secKey);
        const sectionQuestions = grouped[secNum] || [];
        const isExpanded = expandedSection === secNum;

        return (
          <Accordion
            key={secNum}
            expanded={isExpanded}
            onChange={() => setExpandedSection(isExpanded ? false : secNum)}
            sx={{
              mb: 1.5,
              borderRadius: '10px !important',
              '&:before': { display: 'none' },
              boxShadow: isExpanded ? '0 4px 12px rgba(26,35,126,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid',
              borderColor: isExpanded ? 'primary.light' : 'divider',
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: isExpanded ? 'rgba(26,35,126,0.04)' : 'background.paper',
                borderBottom: isExpanded ? '1px solid' : 'none',
                borderColor: 'divider',
                py: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: '100%', pr: 2 }}>
                <Chip
                  label={secInfo.badge}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 800, bgcolor: '#1a237e', color: '#fff' }}
                />
                <Box>
                  <Typography fontWeight={700} variant="subtitle1" sx={{ color: '#0d47a1', lineHeight: 1.2 }}>
                    {secInfo.title_si}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {secInfo.title_en}
                  </Typography>
                </Box>

                {/* Subsections tags */}
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', ml: 'auto' }}>
                  {secInfo.subsections.map(sub => (
                    <Tooltip key={sub.code} title={`${sub.code}: ${sub.title_si} (${sub.title_en})`}>
                      <Chip
                        label={`${sub.code} ${sub.title_si}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', height: 22, bgcolor: 'background.paper' }}
                      />
                    </Tooltip>
                  ))}
                  <Chip
                    label={`${sectionQuestions.length} Questions`}
                    size="small"
                    color={sectionQuestions.length > 0 ? 'default' : 'error'}
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700, width: 45 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 150 }}>Field Key</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 110 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Question Text (Trilingual)</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 220 }}>Description & Tooltip</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 90, textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sectionQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No questions in this section yet. Click below to add the first question.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sectionQuestions.map((q, idx) => (
                      <TableRow key={q.id || q.field_key} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: 'grey.100',
                              px: 0.8,
                              py: 0.3,
                              borderRadius: 1,
                              display: 'inline-block',
                              fontWeight: 600,
                            }}
                          >
                            {q.field_key}
                          </Typography>
                          {q.depends_on && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', mt: 0.3 }}>
                              ↳ depends: {q.depends_on}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(TYPE_LABELS[q.type] || { label: q.type }).label}
                            color={(TYPE_LABELS[q.type] || { color: 'default' }).color as any}
                            size="small"
                            sx={{ fontSize: '0.72rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {q.question_en}
                          </Typography>
                          {q.question_si && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'primary.dark', fontWeight: 500 }}>
                              🇱🇰 {q.question_si}
                            </Typography>
                          )}
                          {q.question_ta && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              🇮🇳 {q.question_ta}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {q.explanation_en || q.explanation_si ? (
                              <Tooltip title={q.explanation_en || q.explanation_si} arrow>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'success.main',
                                    cursor: 'help',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  <HelpOutlineIcon sx={{ fontSize: 14 }} />{' '}
                                  {(q.explanation_en || q.explanation_si).substring(0, 32)}
                                  {(q.explanation_en || q.explanation_si).length > 32 ? '…' : ''}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="warning.main">
                                ⚠️ No description
                              </Typography>
                            )}
                            {q.explanation_image_url && (
                              <Tooltip title="Has visual explanatory picture">
                                <Chip
                                  icon={<ImageIcon sx={{ fontSize: '14px !important' }} />}
                                  label="Pic"
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  sx={{ height: 20 }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit question, labels, options & tooltip">
                            <IconButton size="small" onClick={() => handleOpen(q, secNum)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete question">
                            <IconButton size="small" onClick={() => handleDelete(q.id, q.field_key)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpen(undefined, secNum)}
                >
                  Add Question to {secInfo.badge} ({secInfo.title_en})
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Edit / Add Question Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingId ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
            <Typography variant="h6" fontWeight={700}>
              {editingId ? `Edit Question: ${formData.field_key}` : 'Add New Survey Question'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {/* Tab navigation */}
          <Stack direction="row" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, pt: 1 }} spacing={1}>
            {(['question', 'description', 'options'] as const).map(tab => (
              <Button
                key={tab}
                size="small"
                variant={activeTab === tab ? 'contained' : 'text'}
                onClick={() => setActiveTab(tab)}
                sx={{ borderRadius: '8px 8px 0 0', mb: '-1px', textTransform: 'capitalize', fontWeight: 600 }}
              >
                {tab === 'question' ? '📝 Question Details' : tab === 'description' ? '💬 Descriptions & Pics' : '⚙️ Options & Logic'}
              </Button>
            ))}
          </Stack>

          <Box sx={{ p: 3 }}>
            {/* Tab: Question Labels & Section */}
            {activeTab === 'question' && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    select
                    label="Survey Section (1 to 15)"
                    name="step_index"
                    value={formData.step_index || 1}
                    onChange={handleChange}
                    fullWidth
                    helperText="Assign this question to one of the 15 official survey sections from the DOCX."
                  >
                    {Object.values(DOCX_SECTIONS).map(sec => (
                      <MenuItem key={sec.number} value={sec.number}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                          <Chip label={sec.badge} size="small" color="primary" sx={{ fontWeight: 700 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sec.title_en} ({sec.title_si})
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Field Key (unique database identifier)"
                    name="field_key"
                    value={formData.field_key}
                    onChange={handleChange}
                    sx={{ flex: 1, minWidth: 260 }}
                    required
                    InputProps={{ sx: { fontFamily: 'monospace' }, startAdornment: <InputAdornment position="start">🔑</InputAdornment> }}
                    helperText="e.g. q_machinery_value or q_profit_margin (lowercase, underscores)"
                  />

                  <TextField
                    select
                    label="Question Type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange as any}
                    sx={{ width: 220 }}
                  >
                    <MenuItem value="text">Text (Short Answer)</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="select">Dropdown (Single Choice)</MenuItem>
                    <MenuItem value="multiselect">Multi-select (Multiple Choice)</MenuItem>
                    <MenuItem value="photo">Photo Upload</MenuItem>
                    <MenuItem value="custom">Custom UI</MenuItem>
                  </TextField>

                  <TextField
                    label="Sort Order"
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleChange}
                    sx={{ width: 130 }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Box>

                <Divider sx={{ my: 1 }}>Question Text in 3 Official Languages</Divider>
                <TextField
                  label="🇬🇧 Question in English"
                  name="question_en"
                  value={formData.question_en}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="🇱🇰 Question in Sinhala"
                  name="question_si"
                  value={formData.question_si}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="🇮🇳 Question in Tamil"
                  name="question_ta"
                  value={formData.question_ta}
                  onChange={handleChange}
                  fullWidth
                />
              </Stack>
            )}

            {/* Tab: Descriptions & Pictures */}
            {activeTab === 'description' && (
              <Stack spacing={2}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Descriptions appear as a <strong>help tooltip (ℹ️ icon)</strong> next to the question in the survey. They guide field officers and business owners on how to answer accurately.
                </Alert>
                <TextField
                  label="🇬🇧 Description / Tooltip (English)"
                  name="explanation_en"
                  value={formData.explanation_en}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="Enter helpful instructions in English..."
                />
                <TextField
                  label="🇱🇰 Description / Tooltip (Sinhala)"
                  name="explanation_si"
                  value={formData.explanation_si}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="සිංහල විස්තරය හෝ උපදෙස් මෙහි ඇතුළත් කරන්න..."
                />
                <TextField
                  label="🇮🇳 Description / Tooltip (Tamil)"
                  name="explanation_ta"
                  value={formData.explanation_ta}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="தமிழ் விளக்கம் அல்லது வழிமுறைகள்..."
                />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  🖼️ Visual Explanatory Picture (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Attach a reference image (e.g. document sample, sample machinery, or certificate format) to guide the respondent visually.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
                    Upload Picture
                    <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                  </Button>

                  {explanationImageUrl && (
                    <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                      <img src={explanationImageUrl} alt="Preview" style={{ height: 100, objectFit: 'contain', borderRadius: 4 }} />
                      <IconButton
                        size="small"
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'error.lighter', color: 'error.main' },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Stack>
            )}

            {/* Tab: Options & Advanced Logic */}
            {activeTab === 'options' && (
              <Stack spacing={2}>
                {formData.type === 'select' || formData.type === 'multiselect' ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Choice Options (Trilingual)
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Add options for respondents to choose from. Please provide at least the English and Sinhala text for each option.
                    </Alert>

                    {optionsList.map((opt, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ width: 24, textAlign: 'center', color: 'text.secondary', fontWeight: 700 }}>
                          {i + 1}.
                        </Typography>
                        <TextField size="small" label="English" value={opt.en} onChange={e => handleOptionChange(i, 'en', e.target.value)} fullWidth />
                        <TextField size="small" label="සිංහල" value={opt.si} onChange={e => handleOptionChange(i, 'si', e.target.value)} fullWidth />
                        <TextField size="small" label="தமிழ்" value={opt.ta} onChange={e => handleOptionChange(i, 'ta', e.target.value)} fullWidth />
                        <Tooltip title="Remove Option">
                          <IconButton size="small" onClick={() => handleRemoveOption(i)} color="error">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddOption} sx={{ mt: 1 }}>
                      Add Choice Option
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info">
                    Options are only applicable for <strong>Dropdown (select)</strong> and <strong>Multi-select (multiselect)</strong> question types.
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Conditional Logic (Visibility Rules)
                </Typography>
                <TextField
                  label="Depends On (field_key:value)"
                  name="depends_on"
                  value={formData.depends_on}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g. q_registered:1 or q_ownership:2"
                  helperText="Format: parent_field_key:value. This question will only appear if the parent question matches that value."
                />
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !formData.question_en || !formData.field_key}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
            sx={{ background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)' }}
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Question'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminIndustrySurveysQuestions;
