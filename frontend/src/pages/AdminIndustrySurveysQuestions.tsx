import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useAuth } from '../auth/AuthProvider';
import { MAX_STEP_INDEX, SURVEY_STEPS, getStepMeta } from '../components/survey/surveySteps';

/* ── Domain types ─────────────────────────────────────────────────────────── */

type QuestionType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'multiselect' | 'custom';

interface OptionRow {
  en: string;
  si: string;
  ta: string;
}

interface SurveyQuestion {
  id: number;
  step_index: number;
  field_key: string;
  type: QuestionType;
  question_en: string;
  question_si?: string | null;
  question_ta?: string | null;
  explanation_en?: string | null;
  explanation_si?: string | null;
  explanation_ta?: string | null;
  explanation_image_url?: string | null;
  options_json?: { en?: string[]; si?: string[]; ta?: string[] } | null;
  depends_on?: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Draft {
  step_index: number;
  field_key: string;
  type: QuestionType;
  question_en: string;
  question_si: string;
  question_ta: string;
  explanation_en: string;
  explanation_si: string;
  explanation_ta: string;
  depends_on: string;
  is_active: boolean;
  sort_order: number;
}

/* ── Type catalogue ───────────────────────────────────────────────────────── */

/**
 * Only these render on the form. DynamicQuestionRenderer falls through to `null`
 * for anything else, which shows the label with no input under it — so the
 * builder must never offer a type the renderer cannot draw.
 */
const TYPE_META: Record<QuestionType, { label: string; color: 'default' | 'primary' | 'secondary' | 'info' | 'warning'; hint: string }> = {
  text: { label: 'Short text', color: 'default', hint: 'Single-line free text answer.' },
  textarea: { label: 'Paragraph', color: 'default', hint: 'Multi-line free text answer.' },
  number: { label: 'Number', color: 'info', hint: 'Numeric answer only.' },
  email: { label: 'Email', color: 'info', hint: 'Email address, validated by the browser.' },
  tel: { label: 'Phone', color: 'info', hint: 'Telephone number with a numeric keypad on mobile.' },
  select: { label: 'Single choice', color: 'primary', hint: 'Dropdown — the respondent picks one option.' },
  multiselect: { label: 'Multiple choice', color: 'secondary', hint: 'The respondent may pick several options.' },
  custom: { label: 'Built-in UI', color: 'warning', hint: 'Drawn by fixed code on steps 0-1. Only its wording is editable.' },
};

const SELECTABLE_TYPES: QuestionType[] = ['text', 'textarea', 'number', 'email', 'tel', 'select', 'multiselect'];
const CHOICE_TYPES: QuestionType[] = ['select', 'multiselect'];

const FIELD_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Option labels are authored as "1. Label" and the survey stores only the part
 * before the first dot. Conditional logic and the validation rules both compare
 * against that prefix, so the numbering is data, not decoration.
 */
const storedValueOf = (label: string): string => (label || '').split('.')[0].trim();
const isNumbered = (label: string): boolean => /^\s*\d+\s*\./.test(label || '');

const EMPTY_DRAFT: Draft = {
  step_index: 2,
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

const draftFromQuestion = (q: SurveyQuestion): Draft => ({
  step_index: q.step_index,
  field_key: q.field_key,
  type: q.type,
  question_en: q.question_en || '',
  question_si: q.question_si || '',
  question_ta: q.question_ta || '',
  explanation_en: q.explanation_en || '',
  explanation_si: q.explanation_si || '',
  explanation_ta: q.explanation_ta || '',
  depends_on: q.depends_on || '',
  is_active: q.is_active !== false,
  sort_order: q.sort_order ?? 0,
});

const optionsFromQuestion = (q: SurveyQuestion): OptionRow[] => {
  const raw = q.options_json;
  if (!raw) return [];
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const en = Array.isArray(parsed.en) ? parsed.en : [];
  const si = Array.isArray(parsed.si) ? parsed.si : [];
  const ta = Array.isArray(parsed.ta) ? parsed.ta : [];
  const length = Math.max(en.length, si.length, ta.length);
  return Array.from({ length }, (_, i) => ({ en: en[i] || '', si: si[i] || '', ta: ta[i] || '' }));
};

const parseDependsOn = (value: string): { parentKey: string; values: string[] } => {
  if (!value) return { parentKey: '', values: [] };
  const [parentKey, rest] = value.split(':');
  return {
    parentKey: (parentKey || '').trim(),
    values: (rest || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  };
};

const buildDependsOn = (parentKey: string, values: string[]): string =>
  parentKey && values.length ? `${parentKey}:${values.join(',')}` : '';

/* ── Draft validation ─────────────────────────────────────────────────────── */

interface DraftIssues {
  blocking: string[];
  warnings: string[];
}

const validateDraft = (
  draft: Draft,
  options: OptionRow[],
  all: SurveyQuestion[],
  editingId: number | null,
): DraftIssues => {
  const blocking: string[] = [];
  const warnings: string[] = [];
  const others = all.filter((q) => q.id !== editingId);

  if (!draft.field_key.trim()) {
    blocking.push('A field key is required.');
  } else if (!FIELD_KEY_PATTERN.test(draft.field_key)) {
    blocking.push('The field key must be lower snake_case, starting with a letter (for example q_total_workers).');
  } else if (others.some((q) => q.field_key === draft.field_key)) {
    blocking.push(`The field key "${draft.field_key}" is already used by another question.`);
  }

  if (!draft.question_en.trim()) blocking.push('The English question text is required.');

  if (draft.step_index < 0 || draft.step_index > MAX_STEP_INDEX) {
    blocking.push(`The survey only has steps 0-${MAX_STEP_INDEX}.`);
  }

  const stepMeta = getStepMeta(draft.step_index);
  if (draft.type === 'custom' && !stepMeta?.hardcoded) {
    blocking.push("The 'Built-in UI' type only renders on steps 0 and 1.");
  }
  if (draft.type !== 'custom' && stepMeta?.hardcoded) {
    warnings.push('Steps 0 and 1 are drawn by fixed code, so changing the type here has no visible effect.');
  }

  if (CHOICE_TYPES.includes(draft.type)) {
    const filled = options.filter((o) => o.en.trim());
    if (!filled.length) {
      blocking.push('A choice question needs at least one option with English text.');
    }
    if (filled.some((o) => !isNumbered(o.en))) {
      warnings.push('Some options are not numbered ("1. Yes"). The survey stores the text before the first dot as the answer value, so unnumbered options save their full label.');
    }
    const values = filled.map((o) => storedValueOf(o.en));
    if (new Set(values).size !== values.length) {
      blocking.push('Two options would save the same answer value. Give each option a distinct number.');
    }
    if (filled.some((o) => !o.si.trim() || !o.ta.trim())) {
      warnings.push('Some options are missing Sinhala or Tamil text and will fall back to English.');
    }
  }

  if (draft.depends_on) {
    const { parentKey, values } = parseDependsOn(draft.depends_on);
    if (!parentKey || !values.length) {
      blocking.push('Conditional logic needs a parent question and at least one value.');
    } else if (parentKey === draft.field_key) {
      blocking.push('A question cannot depend on itself.');
    } else {
      const parent = others.find((q) => q.field_key === parentKey);
      if (!parent) {
        blocking.push(`No question has the field key "${parentKey}", so this question would never appear.`);
      } else {
        if (parent.step_index > draft.step_index) {
          warnings.push(`The parent question sits on step ${parent.step_index}, after this one — the condition cannot be met when this step is shown.`);
        }
        const parentValues = (parent.options_json?.en || []).map(storedValueOf);
        if (parentValues.length) {
          const unknown = values.filter((v) => !parentValues.includes(v));
          if (unknown.length) {
            warnings.push(`The parent question has no option with value ${unknown.map((v) => `"${v}"`).join(', ')}.`);
          }
        }
      }
    }
  }

  if (!draft.question_si.trim() || !draft.question_ta.trim()) {
    warnings.push('Missing Sinhala or Tamil wording — respondents in that language will see the English text.');
  }

  return { blocking, warnings };
};

/* ── Request payload ──────────────────────────────────────────────────────── */

const toFormData = (
  draft: Draft,
  options: OptionRow[],
  imageFile: File | null,
  removeImage: boolean,
  isUpdate: boolean,
): FormData => {
  const fd = new FormData();
  fd.append('step_index', String(draft.step_index));
  fd.append('field_key', draft.field_key.trim());
  fd.append('type', draft.type);
  fd.append('question_en', draft.question_en.trim());
  fd.append('question_si', draft.question_si.trim());
  fd.append('question_ta', draft.question_ta.trim());
  fd.append('explanation_en', draft.explanation_en.trim());
  fd.append('explanation_si', draft.explanation_si.trim());
  fd.append('explanation_ta', draft.explanation_ta.trim());
  fd.append('depends_on', draft.depends_on.trim());
  fd.append('is_active', draft.is_active ? '1' : '0');
  fd.append('sort_order', String(draft.sort_order));

  if (CHOICE_TYPES.includes(draft.type)) {
    const filled = options.filter((o) => o.en.trim());
    fd.append(
      'options_json',
      JSON.stringify({
        en: filled.map((o) => o.en.trim()),
        si: filled.map((o) => o.si.trim()).filter(Boolean),
        ta: filled.map((o) => o.ta.trim()).filter(Boolean),
      }),
    );
  } else {
    // Sent empty on purpose: it clears options stranded by an earlier type change.
    fd.append('options_json', '');
  }

  if (imageFile) fd.append('explanation_image', imageFile);
  if (removeImage) fd.append('remove_explanation_image', '1');
  if (isUpdate) fd.append('_method', 'PUT');

  return fd;
};

const extractApiError = (payload: any, status: number): string => {
  if (payload?.errors && typeof payload.errors === 'object') {
    const first = Object.values(payload.errors)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
  }
  return payload?.message || `Request failed with status ${status}.`;
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

const AdminIndustrySurveysQuestions: React.FC = () => {
  const { getToken } = useAuth();

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [search, setSearch] = useState('');
  const [stepFilter, setStepFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([2]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [pendingDelete, setPendingDelete] = useState<SurveyQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Every request takes a freshly refreshed token: access tokens expire in ~5
   *  minutes and this screen is typically left open far longer than that. */
  const authedFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      return fetch(path, {
        ...init,
        headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
    },
    [getToken],
  );

  const loadQuestions = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const res = await authedFetch('/api/business-survey-questions/all');
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.success) throw new Error(extractApiError(payload, res.status));
        setQuestions(payload.data || []);
        setLoadError('');
      } catch (err: any) {
        setLoadError(err.message || 'Could not load the survey questions.');
      } finally {
        setLoading(false);
      }
    },
    [authedFetch],
  );

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /* ── Derived data ───────────────────────────────────────────────────────── */

  const byStep = useMemo(() => {
    const map = new Map<number, SurveyQuestion[]>();
    questions.forEach((q) => {
      const list = map.get(q.step_index) || [];
      list.push(q);
      map.set(q.step_index, list);
    });
    map.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
    return map;
  }, [questions]);

  /** Steps present in the data but outside the wizard's range. Nothing can reach
   *  these rows, so they are surfaced rather than quietly hidden. */
  const unmappedSteps = useMemo(
    () => Array.from(byStep.keys()).filter((s) => !getStepMeta(s)).sort((a, b) => a - b),
    [byStep],
  );

  const matchesFilters = useCallback(
    (q: SurveyQuestion) => {
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (issuesOnly && q.explanation_en && q.is_active !== false && q.question_si && q.question_ta) return false;
      if (search.trim()) {
        const needle = search.trim().toLowerCase();
        const haystack = [q.field_key, q.question_en, q.question_si, q.question_ta, q.explanation_en]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    },
    [typeFilter, issuesOnly, search],
  );

  const visibleByStep = useMemo(() => {
    const map = new Map<number, SurveyQuestion[]>();
    byStep.forEach((list, step) => {
      if (stepFilter !== 'all' && step !== stepFilter) return;
      const filtered = list.filter(matchesFilters);
      map.set(step, filtered);
    });
    return map;
  }, [byStep, stepFilter, matchesFilters]);

  const stats = useMemo(() => {
    const total = questions.length;
    const inactive = questions.filter((q) => q.is_active === false).length;
    const missingDescription = questions.filter((q) => !q.explanation_en).length;
    const missingTranslation = questions.filter((q) => !q.question_si || !q.question_ta).length;
    return { total, inactive, missingDescription, missingTranslation };
  }, [questions]);

  const filtersActive = search.trim() !== '' || stepFilter !== 'all' || typeFilter !== 'all' || issuesOnly;
  const matchCount = useMemo(
    () => Array.from(visibleByStep.values()).reduce((sum, list) => sum + list.length, 0),
    [visibleByStep],
  );

  const stepsToRender = useMemo(() => {
    const known = SURVEY_STEPS.map((s) => s.index);
    return [...known, ...unmappedSteps].filter((s) => stepFilter === 'all' || s === stepFilter);
  }, [unmappedSteps, stepFilter]);

  /* ── Dialog control ─────────────────────────────────────────────────────── */

  const resetDialogState = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setSaveError('');
    setTab(0);
  };

  const openCreate = (step?: number) => {
    const targetStep = step ?? (stepFilter !== 'all' ? stepFilter : 2);
    const existing = byStep.get(targetStep) || [];
    setEditingId(null);
    setDraft({ ...EMPTY_DRAFT, step_index: targetStep, sort_order: existing.length });
    setOptions([]);
    resetDialogState();
    setDialogOpen(true);
  };

  const openEdit = (q: SurveyQuestion) => {
    setEditingId(q.id);
    setDraft(draftFromQuestion(q));
    setOptions(optionsFromQuestion(q));
    resetDialogState();
    setImagePreview(q.explanation_image_url || null);
    setDialogOpen(true);
  };

  const openDuplicate = (q: SurveyQuestion) => {
    const base = draftFromQuestion(q);
    const candidate = `${q.field_key}_copy`;
    setEditingId(null);
    setDraft({
      ...base,
      field_key: questions.some((other) => other.field_key === candidate) ? '' : candidate,
      sort_order: (byStep.get(q.step_index)?.length ?? 0),
    });
    setOptions(optionsFromQuestion(q));
    resetDialogState();
    setDialogOpen(true);
  };

  const issues = useMemo(() => validateDraft(draft, options, questions, editingId), [draft, options, questions, editingId]);

  const patchDraft = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));

  /* ── Persistence ────────────────────────────────────────────────────────── */

  const handleSave = async () => {
    if (issues.blocking.length) return;
    setSaving(true);
    setSaveError('');
    try {
      const isUpdate = editingId !== null;
      const res = await authedFetch(
        isUpdate ? `/api/business-survey-questions/${editingId}` : '/api/business-survey-questions',
        { method: 'POST', body: toFormData(draft, options, imageFile, removeImage, isUpdate) },
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) throw new Error(extractApiError(payload, res.status));
      setDialogOpen(false);
      setToast({ severity: 'success', message: isUpdate ? `Saved "${draft.field_key}".` : `Added "${draft.field_key}".` });
      await loadQuestions(false);
    } catch (err: any) {
      setSaveError(err.message || 'Could not save the question.');
    } finally {
      setSaving(false);
    }
  };

  /** Row-level writes send the whole record because the API validates a full
   *  payload on update, not a patch. */
  const persistRow = async (q: SurveyQuestion, overrides: Partial<Draft>) => {
    const body = toFormData({ ...draftFromQuestion(q), ...overrides }, optionsFromQuestion(q), null, false, true);
    const res = await authedFetch(`/api/business-survey-questions/${q.id}`, { method: 'POST', body });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) throw new Error(extractApiError(payload, res.status));
  };

  const handleToggleActive = async (q: SurveyQuestion) => {
    setBusyId(q.id);
    try {
      await persistRow(q, { is_active: q.is_active === false });
      setToast({
        severity: 'success',
        message: q.is_active === false ? `"${q.field_key}" is now shown on the survey.` : `"${q.field_key}" is now hidden from the survey.`,
      });
      await loadQuestions(false);
    } catch (err: any) {
      setToast({ severity: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (q: SurveyQuestion, direction: -1 | 1) => {
    const siblings = byStep.get(q.step_index) || [];
    const index = siblings.findIndex((s) => s.id === q.id);
    const neighbour = siblings[index + direction];
    if (!neighbour) return;
    setBusyId(q.id);
    try {
      await persistRow(q, { sort_order: neighbour.sort_order });
      await persistRow(neighbour, { sort_order: q.sort_order });
      await loadQuestions(false);
    } catch (err: any) {
      setToast({ severity: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/business-survey-questions/${pendingDelete.id}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) throw new Error(extractApiError(payload, res.status));
      setToast({ severity: 'success', message: `Deleted "${pendingDelete.field_key}".` });
      setPendingDelete(null);
      await loadQuestions(false);
    } catch (err: any) {
      setToast({ severity: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  /* ── Option editing ─────────────────────────────────────────────────────── */

  const patchOption = (index: number, lang: keyof OptionRow, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, [lang]: value } : o)));

  const addOption = () =>
    setOptions((prev) => [...prev, { en: `${prev.length + 1}. `, si: `${prev.length + 1}. `, ta: `${prev.length + 1}. ` }]);

  const removeOption = (index: number) => setOptions((prev) => prev.filter((_, i) => i !== index));

  const moveOption = (index: number, direction: -1 | 1) =>
    setOptions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  /** Rewrites the leading "N." on every option so the stored answer values stay
   *  sequential after rows are added, removed or reordered. */
  const renumberOptions = () =>
    setOptions((prev) =>
      prev.map((o, i) => {
        const strip = (v: string) => v.replace(/^\s*\d+\s*\.\s*/, '').trim();
        const n = i + 1;
        return {
          en: o.en.trim() ? `${n}. ${strip(o.en)}` : o.en,
          si: o.si.trim() ? `${n}. ${strip(o.si)}` : o.si,
          ta: o.ta.trim() ? `${n}. ${strip(o.ta)}` : o.ta,
        };
      }),
    );

  const dependency = parseDependsOn(draft.depends_on);
  const dependencyParent = questions.find((q) => q.field_key === dependency.parentKey);
  const dependencyParentOptions = (dependencyParent?.options_json?.en || []).map((label) => ({
    value: storedValueOf(label),
    label,
  }));

  const stepMeta = getStepMeta(draft.step_index);
  const isHardcodedDraft = !!stepMeta?.hardcoded;
  const typeChoices: QuestionType[] = isHardcodedDraft ? ['custom', ...SELECTABLE_TYPES] : SELECTABLE_TYPES;

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Survey Question Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage the {stats.total} questions of the industry survey across {SURVEY_STEPS.length} steps and three languages.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadQuestions()}>
            Refresh
          </Button>
          <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openCreate()}>
            New question
          </Button>
        </Stack>
      </Stack>

      {loadError && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button size="small" onClick={() => loadQuestions()}>Retry</Button>}>
          {loadError}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 2, mb: 3 }}>
        <MetricCard label="Total questions" value={stats.total} icon={<InfoOutlinedIcon fontSize="small" />} />
        <MetricCard
          label="Without guidance"
          value={stats.missingDescription}
          icon={<HelpOutlineIcon fontSize="small" />}
          tone={stats.missingDescription ? 'warning' : 'success'}
        />
        <MetricCard
          label="Missing translations"
          value={stats.missingTranslation}
          icon={<WarningAmberOutlinedIcon fontSize="small" />}
          tone={stats.missingTranslation ? 'warning' : 'success'}
        />
        <MetricCard
          label="Hidden from survey"
          value={stats.inactive}
          icon={<VisibilityOffOutlinedIcon fontSize="small" />}
          tone={stats.inactive ? 'warning' : 'success'}
        />
      </Box>

      {unmappedSteps.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningAmberOutlinedIcon />}>
          <AlertTitle sx={{ fontWeight: 600 }}>Questions outside the survey</AlertTitle>
          Step {unmappedSteps.join(', ')} {unmappedSteps.length === 1 ? 'is' : 'are'} beyond the last step of the wizard
          (step {MAX_STEP_INDEX}), so those questions are never shown to respondents. Edit each one and move it to a step
          between 0 and {MAX_STEP_INDEX}.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <TextField
            size="small"
            placeholder="Search by field key, question or guidance"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <TextField
            select
            size="small"
            label="Step"
            value={stepFilter}
            onChange={(e) => setStepFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            sx={{ minWidth: 210 }}
          >
            <MenuItem value="all">All steps</MenuItem>
            {SURVEY_STEPS.map((s) => (
              <MenuItem key={s.index} value={s.index}>
                {s.index}. {s.en}
              </MenuItem>
            ))}
            {unmappedSteps.map((s) => (
              <MenuItem key={s} value={s}>
                {s}. Outside the survey
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as QuestionType | 'all')}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">All types</MenuItem>
            {(Object.keys(TYPE_META) as QuestionType[]).map((t) => (
              <MenuItem key={t} value={t}>
                {TYPE_META[t].label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Switch size="small" checked={issuesOnly} onChange={(e) => setIssuesOnly(e.target.checked)} />}
            label={<Typography variant="body2">Needs attention</Typography>}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {filtersActive && (
            <>
              <Typography variant="caption" color="text.secondary">
                {matchCount} of {stats.total} questions match
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setSearch('');
                  setStepFilter('all');
                  setTypeFilter('all');
                  setIssuesOnly(false);
                }}
              >
                Clear filters
              </Button>
              <Box sx={{ flex: 1 }} />
            </>
          )}
          {!filtersActive && <Box sx={{ flex: 1 }} />}
          <Button size="small" startIcon={<UnfoldMoreIcon />} onClick={() => setExpanded(stepsToRender)}>
            Expand all
          </Button>
          <Button size="small" startIcon={<UnfoldLessIcon />} onClick={() => setExpanded([])}>
            Collapse all
          </Button>
        </Stack>
      </Paper>

      {stepsToRender.map((step) => {
        const meta = getStepMeta(step);
        const all = byStep.get(step) || [];
        const rows = visibleByStep.get(step) || [];
        const hiddenByFilter = all.length - rows.length;
        const isOpen = expanded.includes(step);

        return (
          <Accordion
            key={step}
            expanded={isOpen}
            onChange={() => setExpanded((prev) => (prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]))}
            disableGutters
            elevation={0}
            sx={{
              mb: 1.5,
              border: '1px solid',
              borderColor: meta ? 'divider' : 'warning.light',
              borderRadius: 2,
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, flexWrap: 'wrap', my: 1 } }}>
              <Chip
                label={`Step ${step}`}
                size="small"
                color={meta ? (meta.hardcoded ? 'default' : 'primary') : 'warning'}
                variant={meta?.hardcoded ? 'outlined' : 'filled'}
                sx={{ fontWeight: 600 }}
              />
              <Typography sx={{ fontWeight: 600 }}>{meta ? meta.en : 'Outside the survey'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {all.length} {all.length === 1 ? 'question' : 'questions'}
              </Typography>
              {meta?.hardcoded && (
                <Tooltip title="This step is drawn by fixed code. Wording and guidance are editable; fields cannot be added or removed.">
                  <Chip icon={<LockOutlinedIcon />} label="Fixed layout" size="small" variant="outlined" />
                </Tooltip>
              )}
              {!meta && <Chip icon={<WarningAmberOutlinedIcon />} label="Never shown" size="small" color="warning" variant="outlined" />}
              {all.some((q) => q.is_active === false) && (
                <Chip
                  icon={<VisibilityOffOutlinedIcon />}
                  label={`${all.filter((q) => q.is_active === false).length} hidden`}
                  size="small"
                  variant="outlined"
                />
              )}
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0, borderTop: '1px solid', borderColor: 'divider' }}>
              {rows.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {all.length === 0 ? 'No questions on this step yet.' : 'No questions on this step match the current filters.'}
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'action.hover', whiteSpace: 'nowrap' } }}>
                      <TableCell sx={{ width: 84 }}>Order</TableCell>
                      <TableCell sx={{ width: 190 }}>Field key</TableCell>
                      <TableCell sx={{ width: 130 }}>Type</TableCell>
                      <TableCell>Question</TableCell>
                      <TableCell sx={{ width: 150 }}>Guidance</TableCell>
                      <TableCell sx={{ width: 130 }}>Logic</TableCell>
                      <TableCell sx={{ width: 90 }} align="center">Shown</TableCell>
                      <TableCell sx={{ width: 130 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((q) => {
                      const positionInStep = all.findIndex((s) => s.id === q.id);
                      const dep = parseDependsOn(q.depends_on || '');
                      const hidden = q.is_active === false;
                      return (
                        <TableRow key={q.id} hover sx={{ opacity: hidden ? 0.55 : 1 }}>
                          <TableCell>
                            <Stack direction="row" sx={{ alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                disabled={positionInStep <= 0 || busyId === q.id || filtersActive}
                                onClick={() => handleMove(q, -1)}
                                aria-label="Move up"
                              >
                                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                disabled={positionInStep === all.length - 1 || busyId === q.id || filtersActive}
                                onClick={() => handleMove(q, 1)}
                                aria-label="Move down"
                              >
                                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.75, py: 0.35, borderRadius: 0.75, display: 'inline-block', wordBreak: 'break-all' }}
                            >
                              {q.field_key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={TYPE_META[q.type]?.hint || ''}>
                              <Chip
                                label={TYPE_META[q.type]?.label || q.type}
                                color={TYPE_META[q.type]?.color || 'default'}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {q.question_en}
                            </Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                              <LanguageBadge code="EN" present={!!q.question_en} />
                              <LanguageBadge code="SI" present={!!q.question_si} />
                              <LanguageBadge code="TA" present={!!q.question_ta} />
                              {CHOICE_TYPES.includes(q.type) && (
                                <Chip
                                  label={`${q.options_json?.en?.length || 0} options`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {q.explanation_en ? (
                              <Tooltip title={q.explanation_en} arrow>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'success.main', cursor: 'help' }}>
                                  <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                                  <Typography variant="caption">Added</Typography>
                                </Stack>
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                None
                              </Typography>
                            )}
                            {q.explanation_image_url && (
                              <Tooltip title="Has an explanatory image">
                                <Chip icon={<ImageOutlinedIcon />} label="Image" size="small" variant="outlined" sx={{ mt: 0.5, height: 20 }} />
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell>
                            {dep.parentKey ? (
                              <Tooltip title={`Shown only when ${dep.parentKey} is ${dep.values.join(' or ')}`}>
                                <Chip
                                  label={dep.parentKey}
                                  size="small"
                                  variant="outlined"
                                  sx={{ maxWidth: 120, fontFamily: 'monospace', fontSize: '0.65rem' }}
                                />
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Always
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={hidden ? 'Hidden from the survey' : 'Shown on the survey'}>
                              <Switch
                                size="small"
                                checked={!hidden}
                                disabled={busyId === q.id}
                                onChange={() => handleToggleActive(q)}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(q)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Duplicate">
                              <IconButton size="small" onClick={() => openDuplicate(q)}>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={meta?.hardcoded ? 'Fixed-layout questions cannot be deleted' : 'Delete'}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={!!meta?.hardcoded}
                                  onClick={() => setPendingDelete(q)}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <Stack
                direction="row"
                sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
              >
                <Typography variant="caption" color="text.secondary">
                  {hiddenByFilter > 0 && `${hiddenByFilter} hidden by filters. `}
                  {filtersActive ? 'Clear filters to reorder questions.' : 'Use the arrows to change the order respondents see.'}
                </Typography>
                {!meta?.hardcoded && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => openCreate(step)}>
                    Add to step {step}
                  </Button>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* ── Add / edit dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {editingId ? 'Edit question' : 'New question'}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary">
            {editingId ? draft.field_key : `Step ${draft.step_index} — ${stepMeta?.en || 'unknown step'}`}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab label="Question" />
            <Tab label="Guidance" />
            <Tab label={CHOICE_TYPES.includes(draft.type) ? `Options (${options.length})` : 'Options'} />
            <Tab label="Visibility" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {isHardcodedDraft && (
              <Alert severity="info" icon={<LockOutlinedIcon />} sx={{ mb: 2 }}>
                Steps 0 and 1 are drawn by fixed code. Wording and guidance changes apply, but the field key, type and
                input layout are locked.
              </Alert>
            )}

            {tab === 0 && (
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Step"
                    value={draft.step_index}
                    onChange={(e) => patchDraft({ step_index: Number(e.target.value) })}
                    fullWidth
                    disabled={isHardcodedDraft}
                    helperText={isHardcodedDraft ? 'Fixed-layout steps cannot be moved.' : 'Where this question appears in the survey.'}
                  >
                    {SURVEY_STEPS.map((s) => (
                      <MenuItem key={s.index} value={s.index} disabled={s.hardcoded && !isHardcodedDraft}>
                        {s.index}. {s.en}
                        {s.hardcoded ? ' (fixed layout)' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Position"
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => patchDraft({ sort_order: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    sx={{ width: { sm: 150 } }}
                    inputProps={{ min: 0 }}
                    helperText="Lower shows first"
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Field key"
                    value={draft.field_key}
                    onChange={(e) => patchDraft({ field_key: e.target.value.trim() })}
                    fullWidth
                    required
                    disabled={isHardcodedDraft}
                    error={!!draft.field_key && !FIELD_KEY_PATTERN.test(draft.field_key)}
                    helperText={
                      isHardcodedDraft
                        ? 'Locked — this key is referenced by fixed code.'
                        : 'Lower snake_case. Used to store the answer, so changing it on a live question orphans existing answers.'
                    }
                    InputProps={{ sx: { fontFamily: 'monospace' } }}
                  />
                  <TextField
                    select
                    label="Answer type"
                    value={draft.type}
                    onChange={(e) => patchDraft({ type: e.target.value as QuestionType })}
                    sx={{ width: { sm: 220 } }}
                    disabled={isHardcodedDraft}
                    helperText={TYPE_META[draft.type]?.hint}
                  >
                    {typeChoices.map((t) => (
                      <MenuItem key={t} value={t}>
                        {TYPE_META[t].label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Divider textAlign="left">
                  <Typography variant="caption" color="text.secondary">
                    QUESTION WORDING
                  </Typography>
                </Divider>

                <TextField
                  label="English"
                  value={draft.question_en}
                  onChange={(e) => patchDraft({ question_en: e.target.value })}
                  fullWidth
                  required
                  multiline
                  maxRows={3}
                />
                <TextField
                  label="Sinhala"
                  value={draft.question_si}
                  onChange={(e) => patchDraft({ question_si: e.target.value })}
                  fullWidth
                  multiline
                  maxRows={3}
                />
                <TextField
                  label="Tamil"
                  value={draft.question_ta}
                  onChange={(e) => patchDraft({ question_ta: e.target.value })}
                  fullWidth
                  multiline
                  maxRows={3}
                />
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2.5}>
                <Alert severity="info" icon={<InfoOutlinedIcon />}>
                  Guidance appears as a help icon beside the question. Use it to explain how to answer correctly.
                </Alert>
                <TextField
                  label="Guidance (English)"
                  value={draft.explanation_en}
                  onChange={(e) => patchDraft({ explanation_en: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Guidance (Sinhala)"
                  value={draft.explanation_si}
                  onChange={(e) => patchDraft({ explanation_si: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Guidance (Tamil)"
                  value={draft.explanation_ta}
                  onChange={(e) => patchDraft({ explanation_ta: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />

                <Divider textAlign="left">
                  <Typography variant="caption" color="text.secondary">
                    EXPLANATORY IMAGE
                  </Typography>
                </Divider>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Button variant="outlined" component="label" startIcon={<ImageOutlinedIcon />}>
                    {imagePreview ? 'Replace image' : 'Upload image'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                        setRemoveImage(false);
                      }}
                    />
                  </Button>
                  {imagePreview && (
                    <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                      <img src={imagePreview} alt="Guidance preview" style={{ height: 96, display: 'block', objectFit: 'contain' }} />
                      <IconButton
                        size="small"
                        aria-label="Remove image"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setRemoveImage(true);
                        }}
                        sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Stack>
                {removeImage && (
                  <Typography variant="caption" color="warning.main">
                    The existing image will be removed when you save.
                  </Typography>
                )}
              </Stack>
            )}

            {tab === 2 && (
              <Stack spacing={2}>
                {!CHOICE_TYPES.includes(draft.type) ? (
                  <Alert severity="info" icon={<InfoOutlinedIcon />}>
                    Options apply to single-choice and multiple-choice questions. Change the answer type on the Question
                    tab to add them.
                  </Alert>
                ) : (
                  <>
                    <Alert severity="info" icon={<InfoOutlinedIcon />}>
                      Number every option as <strong>1. Label</strong>. The survey saves only the text before the first
                      dot, and conditional logic matches that value.
                    </Alert>

                    {options.map((opt, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={`Saves as: ${storedValueOf(opt.en) || '—'}`}
                            size="small"
                            color={isNumbered(opt.en) ? 'primary' : 'warning'}
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                          />
                          <Box sx={{ flex: 1 }} />
                          <IconButton size="small" disabled={i === 0} onClick={() => moveOption(i, -1)} aria-label="Move option up">
                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" disabled={i === options.length - 1} onClick={() => moveOption(i, 1)} aria-label="Move option down">
                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeOption(i)} aria-label="Remove option">
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Stack>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                          <TextField size="small" label="English" value={opt.en} onChange={(e) => patchOption(i, 'en', e.target.value)} fullWidth />
                          <TextField size="small" label="Sinhala" value={opt.si} onChange={(e) => patchOption(i, 'si', e.target.value)} fullWidth />
                          <TextField size="small" label="Tamil" value={opt.ta} onChange={(e) => patchOption(i, 'ta', e.target.value)} fullWidth />
                        </Stack>
                      </Paper>
                    ))}

                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<AddIcon />} onClick={addOption}>
                        Add option
                      </Button>
                      <Button size="small" onClick={renumberOptions} disabled={!options.length}>
                        Renumber
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            )}

            {tab === 3 && (
              <Stack spacing={2.5}>
                <FormControlLabel
                  control={<Switch checked={draft.is_active} onChange={(e) => patchDraft({ is_active: e.target.checked })} />}
                  label={
                    <Box>
                      <Typography variant="body2">Show this question on the survey</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hidden questions keep their stored answers but are not asked.
                      </Typography>
                    </Box>
                  }
                />

                <Divider textAlign="left">
                  <Typography variant="caption" color="text.secondary">
                    CONDITIONAL DISPLAY
                  </Typography>
                </Divider>

                <TextField
                  select
                  label="Only show when"
                  value={dependency.parentKey}
                  onChange={(e) => patchDraft({ depends_on: buildDependsOn(e.target.value, []) })}
                  fullWidth
                  helperText="Leave as Always shown to display this question unconditionally."
                >
                  <MenuItem value="">Always shown</MenuItem>
                  {questions
                    .filter((q) => q.field_key !== draft.field_key && q.step_index <= draft.step_index && CHOICE_TYPES.includes(q.type))
                    .sort((a, b) => a.step_index - b.step_index || a.sort_order - b.sort_order)
                    .map((q) => (
                      <MenuItem key={q.id} value={q.field_key}>
                        Step {q.step_index} — {q.question_en?.slice(0, 60) || q.field_key}
                      </MenuItem>
                    ))}
                </TextField>

                {dependency.parentKey && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      is one of:
                    </Typography>
                    {dependencyParentOptions.length ? (
                      <Select
                        multiple
                        size="small"
                        fullWidth
                        value={dependency.values}
                        onChange={(e) => {
                          const next = typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]);
                          patchDraft({ depends_on: buildDependsOn(dependency.parentKey, next) });
                        }}
                        renderValue={(selected) => (
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((v) => (
                              <Chip key={v} label={v} size="small" />
                            ))}
                          </Stack>
                        )}
                      >
                        {dependencyParentOptions.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <TextField
                        size="small"
                        fullWidth
                        label="Values (comma separated)"
                        value={dependency.values.join(',')}
                        onChange={(e) =>
                          patchDraft({
                            depends_on: buildDependsOn(
                              dependency.parentKey,
                              e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                            ),
                          })
                        }
                        helperText="The parent question has no option list, so enter the values to match."
                      />
                    )}
                    {draft.depends_on && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}>
                        {draft.depends_on}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            )}

            {(issues.blocking.length > 0 || issues.warnings.length > 0 || saveError) && (
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                {saveError && <Alert severity="error">{saveError}</Alert>}
                {issues.blocking.length > 0 && (
                  <Alert severity="error">
                    <AlertTitle sx={{ fontWeight: 600 }}>Fix before saving</AlertTitle>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {issues.blocking.map((msg) => (
                        <li key={msg}>
                          <Typography variant="body2">{msg}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Alert>
                )}
                {issues.warnings.length > 0 && (
                  <Alert severity="warning">
                    <AlertTitle sx={{ fontWeight: 600 }}>Worth checking</AlertTitle>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {issues.warnings.map((msg) => (
                        <li key={msg}>
                          <Typography variant="body2">{msg}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Alert>
                )}
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSave}
            disabled={saving || issues.blocking.length > 0}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {saving ? 'Saving' : editingId ? 'Save changes' : 'Add question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <Dialog open={!!pendingDelete} onClose={() => !deleting && setPendingDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete this question?</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {pendingDelete?.field_key}
              </Box>{' '}
              will be removed from step {pendingDelete?.step_index} and will no longer be asked.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Answers already submitted are kept in the survey records. To stop asking a question without deleting it,
              switch it off in the Shown column instead.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
          >
            {deleting ? 'Deleting' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

/* ── Small presentational pieces ──────────────────────────────────────────── */

const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: 'default' | 'success' | 'warning';
}> = ({ label, value, icon, tone = 'default' }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: tone === 'default' ? 'text.secondary' : `${tone}.main`, mb: 0.5 }}>
      {icon}
      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Stack>
    <Typography variant="h5" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Paper>
);

const LanguageBadge: React.FC<{ code: string; present: boolean }> = ({ code, present }) => (
  <Chip
    label={code}
    size="small"
    variant={present ? 'filled' : 'outlined'}
    color={present ? 'default' : 'warning'}
    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, opacity: present ? 1 : 0.8 }}
  />
);

export default AdminIndustrySurveysQuestions;
