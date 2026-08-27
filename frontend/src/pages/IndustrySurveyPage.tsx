import React, { useState, useEffect } from 'react';
import GnTopHeaderBar from '../components/GnTopHeaderBar';
import GnPageFooter from '../components/GnPageFooter';
import { Box, Typography, Button, Container, TextField, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Autocomplete, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip, IconButton } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_QUESTIONS, GET_GN_BY_CCODE, GET_CATEGORIES_BY_ROOT_SLUG } from '../graphql/queries';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LocationSelectorModal from '../components/LocationSelectorModal';

// ─── Reusable Photo Uploader Component ───────────────────────────────────────
interface PhotoUploaderProps {
  fieldKey: string;
  value: string;
  multiple?: boolean;
  language: string;
  onChange: (names: string, previews: string[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ fieldKey, value, multiple = false, language, onChange }) => {
  const [previews, setPreviews] = React.useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const names = arr.map(f => f.name).join(', ');
    const readers = arr.map(f => new Promise<string>(resolve => {
      const r = new FileReader();
      r.onload = e => resolve(e.target?.result as string);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(urls => {
      const next = multiple ? [...previews, ...urls] : urls;
      setPreviews(next);
      onChange(names, next);
    });
  };

  const removePreview = (idx: number) => {
    const next = previews.filter((_, i) => i !== idx);
    setPreviews(next);
    onChange(next.length ? `${next.length} photo(s)` : '', next);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: previews.length ? 1.5 : 0 }}>
        {/* Gallery / Drive */}
        <Button
          component="label"
          variant="outlined"
          startIcon={<FolderOpenIcon />}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
        >
          {language === 'si' ? 'ගැලරිය / ෆයිල්' : language === 'ta' ? 'கோப்பு / கேலரி' : 'Gallery / Drive'}
          <input
            type="file"
            hidden
            accept="image/*"
            multiple={multiple}
            onChange={e => handleFiles(e.target.files)}
          />
        </Button>

        {/* Camera */}
        <Button
          component="label"
          variant="contained"
          color="secondary"
          startIcon={<CameraAltIcon />}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
        >
          {language === 'si' ? 'කැමරාවෙන් ගන්න' : language === 'ta' ? 'புகைப்படம் எடு' : 'Take Photo'}
          <input
            type="file"
            hidden
            accept="image/*"
            capture="environment"
            onChange={e => handleFiles(e.target.files)}
          />
        </Button>
      </Box>

      {value && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
          {value}
        </Typography>
      )}

      {previews.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {previews.map((src, i) => (
            <Box key={i} sx={{ position: 'relative', display: 'inline-block' }}>
              <Box
                component="img"
                src={src}
                alt={`preview-${i}`}
                sx={{
                  width: 90, height: 90,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: 2,
                }}
              />
              <IconButton
                size="small"
                onClick={() => removePreview(i)}
                sx={{
                  position: 'absolute', top: -8, right: -8,
                  bgcolor: 'error.main', color: 'white',
                  width: 22, height: 22,
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const extractNICDetails = (nic: string) => {
  let year = 0;
  let dayText = 0;
  const cleanNic = nic.trim().toUpperCase();

  if (cleanNic.length === 10) {
    year = 1900 + parseInt(cleanNic.substring(0, 2), 10);
    dayText = parseInt(cleanNic.substring(2, 5), 10);
  } else if (cleanNic.length === 12) {
    year = parseInt(cleanNic.substring(0, 4), 10);
    dayText = parseInt(cleanNic.substring(4, 7), 10);
  } else if (cleanNic.length === 9) {
    year = 1900 + parseInt(cleanNic.substring(0, 2), 10);
    dayText = parseInt(cleanNic.substring(2, 5), 10);
  } else {
    return { dob: '', age: '' };
  }

  if (isNaN(year) || isNaN(dayText)) return { dob: '', age: '' };

  if (dayText > 500) {
    dayText -= 500;
  }

  if (dayText < 1 || dayText > 366) {
    return { dob: '', age: '' };
  }

  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  if (!isLeapYear(year) && dayText > 59) {
    dayText -= 1;
  }

  const dob = new Date(year, 0);
  dob.setDate(dayText);

  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  const age = Math.abs(age_dt.getUTCFullYear() - 1970);

  return { dob: dob.toLocaleDateString(), age: age.toString() };
};

// ─── Dynamic Question Renderer ──────────────────────────────────────────────
interface DynamicQuestionRendererProps {
  question: any;
  language: string;
  formValues: Record<string, string>;
  handleInputChange: (key: string, value: string) => void;
}

const DynamicQuestionRenderer: React.FC<DynamicQuestionRendererProps> = ({ question, language, formValues, handleInputChange }) => {
  const langKey = language === 'si' ? 'question_si' : language === 'ta' ? 'question_ta' : 'question_en';
  const label = question[langKey] || question.question_en;
  
  const expKey = language === 'si' ? 'explanation_si' : language === 'ta' ? 'explanation_ta' : 'explanation_en';
  const explanation = question[expKey] || question.explanation_en;

  // Check dependencies
  if (question.depends_on) {
    const [depKey, depValsStr] = question.depends_on.split(':');
    const depVals = depValsStr.split(',');
    const currentVal = formValues[depKey] || '';
    const isMatched = depVals.some(v => currentVal.includes(v) || currentVal === v);
    if (!isMatched) return null;
  }

  const getOptions = () => {
    if (!question.options_json) return [];
    const opts = question.options_json[language] || question.options_json['en'];
    return opts || [];
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type={question.type}
            value={formValues[question.field_key] || ''}
            onChange={(e) => handleInputChange(question.field_key, e.target.value)}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="number"
            value={formValues[question.field_key] || ''}
            onChange={(e) => handleInputChange(question.field_key, e.target.value)}
          />
        );
      case 'select':
        return (
          <Select
            fullWidth
            size="small"
            value={formValues[question.field_key] || ''}
            onChange={(e) => handleInputChange(question.field_key, e.target.value as string)}
          >
            {getOptions().map((opt: string, idx: number) => (
              <MenuItem key={idx} value={opt.split('.')[0]}>{opt}</MenuItem>
            ))}
          </Select>
        );
      case 'multiselect':
        const selected = formValues[question.field_key] ? formValues[question.field_key].split(', ') : [];
        return (
          <Select
            fullWidth
            size="small"
            multiple
            value={selected}
            onChange={(e) => {
              const val = e.target.value;
              handleInputChange(question.field_key, (typeof val === 'string' ? val.split(',') : val).join(', '));
            }}
            input={<OutlinedInput />}
            renderValue={(selected: string[]) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const optLabel = getOptions().find((o: string) => o.startsWith(val + '.')) || val;
                  return <Chip key={val} label={optLabel} size="small" />;
                })}
              </Box>
            )}
          >
            {getOptions().map((opt: string, idx: number) => (
              <MenuItem key={idx} value={opt.split('.')[0]}>
                <Checkbox checked={selected.indexOf(opt.split('.')[0]) > -1} />
                <ListItemText primary={opt} />
              </MenuItem>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{label}</Typography>
        {explanation && (
          <Tooltip title={explanation} arrow placement="right">
            <IconButton size="small" sx={{ ml: 1, color: 'text.secondary' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {renderInput()}
    </Box>
  );
};
// ────────────────────────────────────────────────────────────────────────────
const IndustrySurveyPage: React.FC = () => {
  const { isAuthenticated, login, isLoading, userInfo, token } = useAuth();
  const { language } = useLanguage();
  const { gnName, ccode } = useParams<{ gnName?: string, ccode?: string }>();
  const navigate = useNavigate();
  const locationState = useLocation().state as { fromSelector?: boolean };

  const { data, loading, error } = useQuery(GET_QUESTIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: gnData, loading: gnLoading } = useQuery(GET_GN_BY_CCODE, {
    variables: { CCODE: ccode },
    skip: !ccode,
  });

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Business category search
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [fetchCategories, { data: catData, loading: catLoading }] = useLazyQuery(GET_CATEGORIES_BY_ROOT_SLUG, {
    fetchPolicy: 'cache-first',
  });
  const businessCategories: any[] = catData?.categoriesByRootSlug || [];

  // Load categories once auth is ready
  useEffect(() => {
    if (!isLoading) {
      fetchCategories({ variables: { rootSlug: 'location-1-4' } });
    }
  }, [isLoading]);

  // Restore selectedCategory from saved formValues when categories load
  useEffect(() => {
    if (businessCategories.length > 0 && formValues['b_type'] && !selectedCategory) {
      const saved = businessCategories.find((c: any) => c.slug === formValues['b_type']);
      if (saved) setSelectedCategory(saved);
    }
  }, [businessCategories, formValues['b_type']]);

  // Auto-generate registration number when ccode + category are both available and b_reg_no not yet set
  useEffect(() => {
    if (!ccode || !selectedCategory?.slug || formValues['b_reg_no']) return;
    let cancelled = false;
    fetch('/api/industry-survey/generate-reg-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ccode, category_slug: selectedCategory.slug }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.reg_number) {
          setFormValues(prev => ({ ...prev, b_reg_no: data.reg_number }));
        }
      })
      .catch(() => { }); // silent fail — user can type manually
    return () => { cancelled = true; };
  }, [ccode, selectedCategory?.slug]);


  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [loadingDynamicQuestions, setLoadingDynamicQuestions] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/business-survey-questions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDynamicQuestions(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingDynamicQuestions(false));
  }, []);

  const getDynamicLabel = (key: string, defaultEn: string, defaultSi: string, defaultTa: string) => {
    const q = dynamicQuestions.find(q => q.field_key === key);
    if (!q) return language === 'si' ? defaultSi : language === 'ta' ? defaultTa : defaultEn;
    return language === 'si' ? q.question_si : language === 'ta' ? q.question_ta : q.question_en;
  };

  const getDynamicExplanation = (key: string, defaultEn?: string, defaultSi?: string, defaultTa?: string) => {
    const q = dynamicQuestions.find(q => q.field_key === key);
    if (!q) return language === 'si' ? defaultSi : language === 'ta' ? defaultTa : defaultEn;
    return language === 'si' ? q.explanation_si : language === 'ta' ? q.explanation_ta : q.explanation_en;
  };

  const stepTitles: Record<number, any> = {
    2: { en: 'Legal Status of the Business', si: 'ව්‍යාපාරයේ නීතිමය තත්ත්වය', ta: 'வணிகத்தின் சட்ட நிலை' },
    3: { en: 'Location & Infrastructure', si: 'ස්ථානය හා යටිතල පහසුකම්', ta: 'இடம் மற்றும் உள்கட்டமைப்பு' },
    4: { en: 'Infrastructure and Services', si: 'යටිතල පහසුකම් හා සේවා', ta: 'உள்கட்டமைப்பு மற்றும் சேவைகள்' },
    5: { en: 'Capital Sources', si: '3 වන කොටස: ප්‍රාග්ධන මූලාශ්‍ර', ta: '3 வது பகுதி: மூலதன ஆதாரங்கள்' },
    6: { en: 'Workforce & Human Resources', si: '4 වන කොටස: ශ්‍රම බලකාය හා මානව සම්පත්', ta: '4 வது பகுதி: பணியாளர்கள் & மனித வளங்கள்' },
    7: { en: 'Production & Operations', si: '5 වන කොටස: නිෂ්පාදනය හා මෙහෙයුම්', ta: '5 வது பகுதி: உற்பத்தி & செயல்பாடுகள்' },
    8: { en: 'Finance & Accounting', si: '6 වන කොටස: මූල්‍ය හා ගිණුම්කරණය', ta: '6 வது பகுதி: நிதி & கணக்கியல்' },
  };

  const renderDynamicStep = (stepIndex: number) => {
    const stepQuestions = dynamicQuestions.filter(q => q.step_index === stepIndex).sort((a, b) => a.sort_order - b.sort_order);

    if (stepQuestions.length === 0) {
      if (loadingDynamicQuestions) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
      }
      return <Typography>No questions found for this step.</Typography>;
    }

    const titleObj = stepTitles[stepIndex];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {titleObj && (
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
            {language === 'si' ? titleObj.si : language === 'ta' ? titleObj.ta : titleObj.en}
          </Typography>
        )}
        {stepQuestions.map(q => (
          <DynamicQuestionRenderer
            key={q.field_key}
            question={q}
            language={language}
            formValues={formValues}
            handleInputChange={handleInputChange}
          />
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(stepIndex - 1)}>
            {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
          </Button>
          <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(stepIndex + 1)}>
            {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
          </Button>
          <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
            💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
          </Button>
        </Box>
      </Box>
    );
  };


  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [submitSuccessData, setSubmitSuccessData] = useState<{ startTime: string, endTime: string } | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showMetadataPopup, setShowMetadataPopup] = useState(false);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [saveDraftDialogOpen, setSaveDraftDialogOpen] = useState(false);
  const [showGpsPopup, setShowGpsPopup] = useState(false);
  const [gpsErrorPopup, setGpsErrorPopup] = useState<string | null>(null);
  const [surveyStartTime, setSurveyStartTime] = useState<Date | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [gpsChecking, setGpsChecking] = useState(false);
  const [gpsWrongLocationPopup, setGpsWrongLocationPopup] = useState<{ lat: number, lng: number } | null>(null);

  // Universal draft key works with or without ccode
  const draftKey = ccode ? `survey_draft_${ccode}` : `survey_draft_user_${userInfo?.sub || 'anon'}`;

  useEffect(() => {
    // On route change: check for existing draft and silently resume
    const draftStr = localStorage.getItem(draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.formValues && Object.keys(draft.formValues).length > 0) {
          setFormValues(draft.formValues);
          if (draft.currentStep !== undefined) setCurrentStep(draft.currentStep);
          if (draft.gpsCoordinates) setGpsCoordinates(draft.gpsCoordinates);
          if (draft.surveyStartTime) setSurveyStartTime(new Date(draft.surveyStartTime));
          // Skip all popups, go straight to form
          setLocationConfirmed(true);
          setShowLocationSelector(false);
          return;
        }
      } catch { }
    }

    // No draft — normal flow
    setFormValues({});
    setCurrentStep(0);
    setSurveyStartTime(null);
    setShowMetadataPopup(false);
    setShowResumePopup(false);
    setShowGpsPopup(false);
    setGpsCoordinates(null);

    if (!ccode) {
      setShowLocationSelector(true);
      setLocationConfirmed(false);
    } else if (gnName && ccode) {
      localStorage.setItem('last_gn_url', `/gnpage/${encodeURIComponent(gnName)}/${encodeURIComponent(ccode)}`);
      if (locationState?.fromSelector) {
        setLocationConfirmed(true);
        setShowMetadataPopup(true);
      } else {
        setLocationConfirmed(false);
      }
    }
  }, [ccode, gnName, locationState]);

  // Auto-save draft on every change
  useEffect(() => {
    if (Object.keys(formValues).length > 0 || currentStep > 0) {
      localStorage.setItem(draftKey, JSON.stringify({
        formValues,
        currentStep,
        surveyStartTime: surveyStartTime?.toISOString() || new Date().toISOString(),
        gpsCoordinates,
      }));
    }
  }, [formValues, currentStep, surveyStartTime, gpsCoordinates, draftKey]);

  const handleSaveDraft = async () => {
    const draftData = {
      formValues,
      currentStep,
      surveyStartTime: surveyStartTime?.toISOString() || new Date().toISOString(),
      gpsCoordinates,
    };

    // Save to local storage for instant resume
    localStorage.setItem(draftKey, JSON.stringify(draftData));

    // Sync draft to backend
    try {
      const existingId = localStorage.getItem(`${draftKey}_db_id`);
      const payload: any = {
        ccode: ccode || 'unknown',
        district: gnData?.gnByCcode?.districtEn,
        ds_division: gnData?.gnByCcode?.dsEn,
        gn_name: gnData?.gnByCcode?.nameEn,
        latitude: gpsCoordinates?.lat,
        longitude: gpsCoordinates?.lng,
        form_data: draftData,
        status: 'draft',
      };
      if (existingId) {
        payload.id = parseInt(existingId, 10);
      }

      const res = await fetch('/api/industry-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.survey?.id) {
          localStorage.setItem(`${draftKey}_db_id`, data.survey.id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to sync draft to server', err);
    }

    setSaveDraftDialogOpen(true);
  };

  const title = {
    en: 'Industry and Business Survey Questionnaire',
    si: 'කර්මාන්ත හා ව්‍යාපාර සමීක්ෂණ ප්‍රශ්නාවලිය',
    ta: 'தொழில் மற்றும் வணிக ஆய்வு கேள்வித்தாள்',
  }[language] || 'Industry and Business Survey Questionnaire';

  const subtitle = {
    en: 'Note: This survey covers all production, services, sales, industries and business establishments within the Grama Niladhari Division. Please answer all questions. Mark "Not Applicable" for irrelevant questions.',
    si: 'සටහන: මෙම සමීක්ෂණය ග්‍රාම නිලධාරි වසම තුළ ඇති සියලුම නිෂ්පාදන, සේවා, විකුණුම්, කර්මාන්ත හා ව්‍යාපාර ආයතන ආවරණය කරයි. කරුණාකර සියලු ප්‍රශ්නවලට පිළිතුරු සපයන්න. අදාළ නොවන ප්‍රශ්න සඳහා "අදාළ නොවේ" ලෙස සලකුණු කරන්න.',
    ta: 'குறிப்பு: இந்த கணக்கெடுப்பு கிராம உத்தியோகத்தர் பிரிவுக்குள் உள்ள அனைத்து உற்பத்தி, சேவைகள், விற்பனை, தொழில்கள் மற்றும் வணிக நிறுவனங்களை உள்ளடக்கியது. அனைத்து கேள்விகளுக்கும் பதிலளிக்கவும். பொருத்தமற்ற கேள்விகளுக்கு "பொருந்தாது" என்று குறிக்கவும்.',
  }[language] || 'Note: This survey covers all production, services, sales, industries and business establishments within the Grama Niladhari Division. Please answer all questions. Mark "Not Applicable" for irrelevant questions.';

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login(window.location.href);
    }
  }, [isLoading, isAuthenticated, login]);

  if (isLoading || !isAuthenticated) {
    return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Failed to load survey questions.</Typography>;

  const questions = (data?.questions || []).filter((q: any) => q.section === 'INDUSTRY_SURVEY').sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const QuestionLabel = ({ text, fieldKey }: { text: string, fieldKey?: string }) => {
    const dq = fieldKey ? dynamicQuestions.find((q: any) => q.field_key === fieldKey) : null;
    const q = questions.find((q: any) => q.questionTextEn === text || q.questionTextSi === text || q.questionTextTa === text);
    let explanation = "Explanation will be added soon";
    if (dq) {
      const exp = language === 'si' ? dq.explanation_si : language === 'ta' ? dq.explanation_ta : dq.explanation_en;
      if (exp) explanation = exp;
    } else if (q) {
      const exp = language === 'si' ? q.explanationSi : language === 'ta' ? q.explanationTa : q.explanationEn;
      if (exp) explanation = exp;
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="600" mb={0}>{text}</Typography>
        <Tooltip title={explanation} arrow>
          <IconButton size="small" sx={{ ml: 0.5, p: 0 }}><HelpOutlineIcon fontSize="small" color="action" /></IconButton>
        </Tooltip>
      </Box>
    );
  };


  const handleSendOtp = async () => {
    const mobile = formValues['b_mobile'];
    if (!mobile) {
      alert(language === 'si' ? 'කරුණාකර මොබයිල් අංකය ඇතුළත් කරන්න' : 'Please enter a mobile number first.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpDialogOpen(true);
      } else {
        alert('Error: ' + (data.error || 'Failed to send OTP'));
      }
    } catch (e) {
      alert('Error sending OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const mobile = formValues['b_mobile'];
    if (!otpCode || otpCode.length !== 6) {
      alert('Please enter the 6-digit code.');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ mobile, code: otpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsMobileVerified(true);
        setOtpDialogOpen(false);
        setOtpCode('');
      } else {
        alert('Verification failed: ' + (data.error || 'Invalid OTP'));
      }
    } catch (e) {
      alert('Error verifying OTP.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleInputChange = (id: string, val: string) => {
    if (id === 'b_mobile') {
      setIsMobileVerified(false);
    }
    setFormValues(prev => ({ ...prev, [id]: val }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission on Enter
      e.preventDefault();

      const form = e.currentTarget;
      const focusableElements = Array.from(
        form.querySelectorAll(
          'input, select, textarea, button[type="button"], button[type="submit"]'
        )
      ) as HTMLElement[];
      const activeElement = document.activeElement as HTMLElement;

      const currentIndex = focusableElements.indexOf(activeElement);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        let nextIndex = currentIndex + 1;
        let nextElement = focusableElements[nextIndex];

        // Skip hidden, disabled, or specific MUI wrapper elements
        while (
          nextElement &&
          (nextElement.hidden ||
            (nextElement as any).disabled ||
            nextElement.getAttribute('type') === 'hidden' ||
            nextElement.tabIndex === -1)
        ) {
          nextIndex++;
          nextElement = focusableElements[nextIndex];
        }

        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endTime = new Date();
    const existingId = localStorage.getItem(`${draftKey}_db_id`);
    const payload: any = {
      ccode: ccode || 'unknown',
      district: gnData?.gnByCcode?.districtEn,
      ds_division: gnData?.gnByCcode?.dsEn,
      gn_name: gnData?.gnByCcode?.nameEn,
      latitude: gpsCoordinates?.lat,
      longitude: gpsCoordinates?.lng,
      status: 'submitted',
      form_data: {
        ...formValues,
        survey_metadata: {
          date: new Date().toISOString(),
          surveyor: userInfo?.name,
          startTime: surveyStartTime?.toISOString(),
          endTime: endTime.toISOString(),
        }
      }
    };
    if (existingId) {
      payload.id = parseInt(existingId, 10);
    }

    try {
      const response = await fetch('/api/industry-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      setSubmitSuccessData({
        startTime: surveyStartTime?.toLocaleTimeString() || '',
        endTime: endTime.toLocaleTimeString()
      });
      setSuccessDialogOpen(true);

      localStorage.removeItem(draftKey);
      localStorage.removeItem(`${draftKey}_db_id`);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Error submitting survey. Please try again.');
    }
  };

  const mockDistricts = gnData?.gnByCcode ? [{ id: 'mock-dist', nameEn: gnData.gnByCcode.disEn }] : [];
  const mockDs = gnData?.gnByCcode ? [{ divisionalSecretariatCode: 'mock-ds', dsEn: gnData.gnByCcode.dsEn }] : [];
  const mockGns = gnData?.gnByCcode ? [{ id: ccode, CCODE: ccode, nameEn: gnData.gnByCcode.nameEn }] : [];

  return (
    <Box>
      <GnTopHeaderBar
        districts={mockDistricts}
        selectedDistrict={mockDistricts.length ? 'mock-dist' : ''}
        dsDivisions={mockDs}
        selectedCity={mockDs.length ? 'mock-ds' : ''}
        gramaNiladharis={mockGns}
        selectedGN={mockGns.length ? ccode : ''}
        // Type assertion to bypass TS error if any, though passing extra props is usually fine in plain JS/React
        {...{ activeCcode: ccode, activeGnObj: gnName ? { nameEn: gnName } : null }}
      />

      {surveyStartTime && !showGpsPopup && (
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '20px', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" color="primary">{title}</Typography>
            <Typography variant="body1" textAlign="center" color="textSecondary" sx={{ mb: 2, px: { xs: 1, sm: 4 } }}>{subtitle}</Typography>

            <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {currentStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                    {language === 'si' ? 'මූලික තොරතුරු (Basic Information)' : language === 'ta' ? 'அடிப்படை தகவல்கள்' : 'Basic Information'}
                  </Typography>

                  {formValues['b_reg_no'] && (
                    <Box sx={{
                      bgcolor: 'success.50',
                      p: 2,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'success.main',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        {language === 'si' ? 'ඔබගේ ලියාපදිංචි අංකය' : 'Your Registration Number'}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.dark" sx={{ letterSpacing: 2 }}>
                        {formValues['b_reg_no']}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <QuestionLabel fieldKey="b_name" text={getDynamicLabel('b_name', 'Business Location Name', 'ව්‍යාපාර ස්ථානයේ නම', 'வணிகத்தின் பெயர்')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['b_name'] || ''} onChange={(e) => handleInputChange('b_name', e.target.value)} />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                      <QuestionLabel fieldKey="b_reg_no" text={getDynamicLabel('b_reg_no', 'Business Registration Number', 'ව්‍යාපාර ලියාපදිංචි අංකය', 'வணிக பதிவு எண்')} />

                      {formValues['b_reg_no'] && selectedCategory && (
                        <Chip
                          label={language === 'si' ? '⚡ ස්වයංක්‍රීය' : '⚡ Auto'}
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.65rem', height: 20, ml: -0.5 }}
                        />
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={formValues['b_reg_no'] || ''}
                      onChange={(e) => handleInputChange('b_reg_no', e.target.value)}
                      placeholder={
                        !selectedCategory
                          ? (language === 'si' ? 'ව්‍යාපාර වර්ගය තෝරන්න...' : 'Select business type first...')
                          : (!ccode ? (language === 'si' ? 'ස්ථානය තෝරන්න...' : 'Select location first...') : '')
                      }
                      helperText={
                        formValues['b_reg_no']
                          ? (language === 'si' ? 'ස්වයංක්‍රීයව ජනනය කෙරිණ — ඔබ වෙනස් කළ හැක' : 'Auto-generated — you can edit this')
                          : (!selectedCategory ? (language === 'si' ? 'ව්‍යාපාර වර්ගය තෝරන විට ස්වයංක්‍රීය අංකයක් ලැබේ' : 'A number will be generated when you select a business type') : '')
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': formValues['b_reg_no'] ? {
                          bgcolor: 'success.50',
                          '& fieldset': { borderColor: 'success.300' },
                        } : {},
                      }}
                      InputProps={{
                        sx: { fontFamily: 'monospace', fontWeight: formValues['b_reg_no'] ? 700 : 400, letterSpacing: formValues['b_reg_no'] ? 1 : 0 }
                      }}
                    />
                  </Box>


                  <Box>
                    <QuestionLabel fieldKey="b_address" text={getDynamicLabel('b_address', 'Address', 'ලිපිනය', 'முகவரி')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['b_address'] || ''} onChange={(e) => handleInputChange('b_address', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="b_owner_name" text={getDynamicLabel('b_owner_name', 'Business Owner Name', 'ව්‍යාපාර හිමියාගේ නම', 'உரிமையாளரின் பெயர்')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['b_owner_name'] || ''} onChange={(e) => handleInputChange('b_owner_name', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="b_mobile" text={getDynamicLabel('b_mobile', 'WhatsApp / Mobile Number', 'වට්ස්ඇප්/ මොබයිල් අංකය', 'வாட்ஸ்அப்/ மொபைல் எண்')} />
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['b_mobile'] || ''} onChange={(e) => handleInputChange('b_mobile', e.target.value)} />
                      {!isMobileVerified ? (
                        <Button variant="contained" onClick={handleSendOtp} disabled={otpSending || !formValues['b_mobile']} sx={{ minWidth: '120px' }}>
                          {otpSending ? <CircularProgress size={24} color="inherit" /> : (language === 'si' ? 'තහවුරු කරන්න' : 'Verify')}
                        </Button>
                      ) : (
                        <Button variant="contained" color="success" sx={{ minWidth: '120px', pointerEvents: 'none' }}>Verified ✓</Button>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="b_type" text={getDynamicLabel('b_type', 'Business Type', 'ව්‍යාපාර වර්ගය', 'வணிக வகை')} />
                    <Autocomplete
                      options={businessCategories}
                      loading={catLoading}
                      getOptionLabel={(opt: any) => {
                        const name = language === 'si' ? opt.nameSi : language === 'ta' ? opt.nameTa : opt.nameEn;
                        return name || opt.nameEn;
                      }}
                      filterOptions={(options, state) => {
                        const q = state.inputValue.toLowerCase();
                        return options.filter((o: any) =>
                          o.nameEn?.toLowerCase().includes(q) ||
                          o.nameSi?.toLowerCase().includes(q) ||
                          o.nameTa?.toLowerCase().includes(q) ||
                          o.breadcrumb?.toLowerCase().includes(q)
                        );
                      }}
                      value={selectedCategory}
                      onChange={(_: any, newVal: any) => {
                        setSelectedCategory(newVal);
                        handleInputChange('b_type', newVal ? newVal.slug : '');
                        handleInputChange('b_type_name', newVal ? newVal.nameEn : '');
                        handleInputChange('b_reg_no', '');
                      }}
                      renderOption={(props: any, opt: any) => (
                        <li {...props} key={opt.id}>
                          <Box sx={{ pl: opt.depth * 1.5 }}>
                            <Typography variant="body2" fontWeight={opt.depth === 0 ? 700 : 400}>
                              {language === 'si' ? opt.nameSi : language === 'ta' ? opt.nameTa : opt.nameEn}
                            </Typography>
                            {opt.depth > 0 && (
                              <Typography variant="caption" color="text.secondary">{opt.breadcrumb}</Typography>
                            )}
                          </Box>
                        </li>
                      )}
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          size="small"
                          fullWidth
                          variant="outlined"
                          placeholder={language === 'si' ? 'ව්‍යාපාර වර්ගය සොයන්න...' : language === 'ta' ? 'வணிக வகையை தேடுங்கள்...' : 'Search business type...'}
                          InputProps={{ ...params.InputProps, endAdornment: (<>{catLoading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>) }}
                        />
                      )}
                    />
                    {selectedCategory && (
                      <Box sx={{ mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                              <TableCell sx={{ color: 'white', fontWeight: 700, width: '40%' }}>{language === 'si' ? 'මට්ටම' : language === 'ta' ? 'நிலை' : 'Level'}</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 700 }}>{language === 'si' ? 'නම' : language === 'ta' ? 'பெயர்' : 'Name'}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedCategory.breadcrumb.split(' > ').map((part: string, i: number) => (
                              <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? 'grey.50' : 'white' }}>
                                <TableCell>
                                  <Chip label={`Level ${i + 1}`} size="small" color={i === selectedCategory.depth ? 'primary' : 'default'} />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={i === selectedCategory.depth ? 700 : 400}>{part}</Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="b_nic" text={getDynamicLabel('b_nic', 'NIC', 'NIC', 'தேசிய அடையாள அட்டை')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['b_nic'] || ''} onChange={(e) => handleInputChange('b_nic', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="b_photo" text={getDynamicLabel('b_photo', 'Photo of the Business', 'ව්‍යාපාරයේ ඡායාරූපයක්', 'வணிகத்தின் புகைப்படம்')} />
                    <PhotoUploader
                      fieldKey="b_photo"
                      value={formValues['b_photo'] || ''}
                      multiple={false}
                      language={language}
                      onChange={(names) => handleInputChange('b_photo', names)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '100%' }} onClick={() => {
                      if (!formValues['q_owner_name'] && formValues['b_owner_name']) {
                        setFormValues(prev => ({ ...prev, q_owner_name: prev['b_owner_name'] }));
                      }
                      if (!formValues['q_nic'] && formValues['b_nic']) {
                        const { dob, age } = extractNICDetails(formValues['b_nic']);
                        setFormValues(prev => ({
                          ...prev,
                          q_nic: prev['b_nic'],
                          q_dob_age: (dob && age) ? `${dob} / ${age}` : '',
                        }));
                      }
                      setCurrentStep(1);
                    }}>
                      {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்து' : 'Next'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%' }} onClick={handleSaveDraft}>
                      💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                    </Button>
                  </Box>
                </Box>
              )}
              {currentStep === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                    {language === 'si' ? 'ව්‍යාපාර හිමිකරු පිළිබඳ තොරතුරු' : language === 'ta' ? 'வணிக உரிமையாளர் தகவல்' : 'Business Owner Information'}
                  </Typography>

                  <Box>
                    <QuestionLabel fieldKey="q_owner_name" text={getDynamicLabel('q_owner_name', "Owner's Full Name", "හිමිකරුගේ සම්පූර්ණ නම", "உரிமையாளரின் முழுப் பெயர்")} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['q_owner_name'] || ''} onChange={(e) => handleInputChange('q_owner_name', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_gender" text={getDynamicLabel('q_gender', 'Gender', 'ස්ත්‍රී/පුරුෂ භාවය', 'பாலினம்')} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_gender'] || ''} onChange={(e) => handleInputChange('q_gender', e.target.value as string)}>
                        <MenuItem value="1. Male">{language === 'si' ? '1. පිරිමි' : language === 'ta' ? '1. ஆண்' : '1. Male'}</MenuItem>
                        <MenuItem value="2. Female">{language === 'si' ? '2. ගැහැණු' : language === 'ta' ? '2. பெண்' : '2. Female'}</MenuItem>
                        <MenuItem value="3. Other">{language === 'si' ? '3. වෙනත්' : language === 'ta' ? '3. மற்றவை' : '3. Other'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_nic" text={getDynamicLabel('q_nic', 'National Identity Card Number (NIC)', 'ජාතික හැඳුනුම්පත් අංකය', 'தேசிய அடையாள அட்டை எண் (NIC)')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['q_nic'] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange('q_nic', val);
                        const { dob, age } = extractNICDetails(val);
                        handleInputChange('q_dob_age', (dob && age) ? `${dob} / ${age}` : '');
                      }}
                    />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_dob_age" text={getDynamicLabel('q_dob_age', 'Date of Birth / Age', 'උපන් දිනය / වයස', 'பிறந்த தேதி / வயது')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['q_dob_age'] || ''} disabled sx={{ bgcolor: 'grey.100' }} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_whatsapp" text={getDynamicLabel('q_whatsapp', 'WhatsApp Number', 'වට්ස්ඇප් දුරකථන අංකය', 'வாட்ஸ்அப் எண்')} />
                    <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['q_whatsapp'] || ''} onChange={(e) => handleInputChange('q_whatsapp', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_mobile" text={getDynamicLabel('q_mobile', 'Main Phone Number', 'ප්‍රධාන දුරකථන අංකය', 'முக்கிய தொலைபேசி எண்')} />
                    <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['q_mobile'] || ''} onChange={(e) => handleInputChange('q_mobile', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_email" text={getDynamicLabel('q_email', 'Email Address (if any)', 'විද්‍යුත් තැපැල් ලිපිනය (ඇත්නම්)', 'மின்னஞ்சல் முகவரி (ஏதேனும் இருந்தால்)')} />
                    <TextField fullWidth variant="outlined" size="small" type="email" value={formValues['q_email'] || ''} onChange={(e) => handleInputChange('q_email', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_address" text={getDynamicLabel('q_address', 'Residential Address', 'නියාසික ලිපිනය', 'குடியிருப்பு முகவரி')} />
                    <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_address'] || ''} onChange={(e) => handleInputChange('q_address', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_education" text={getDynamicLabel('q_education', 'Highest Educational Qualification', 'උසස්ම අධ්‍යාපන සුදුසුකම', 'மிக உயர்ந்த கல்வித் தகுதி')} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_education'] || ''} onChange={(e) => handleInputChange('q_education', e.target.value as string)}>
                        <MenuItem value="1. Primary">{language === 'si' ? '1. ප්‍රාථමික' : '1. Primary'}</MenuItem>
                        <MenuItem value="2. Secondary">{language === 'si' ? '2. ද්විතීයික' : '2. Secondary'}</MenuItem>
                        <MenuItem value="3. A-Level">{language === 'si' ? '3. උසස් පෙළ' : '3. A-Level'}</MenuItem>
                        <MenuItem value="4. Diploma">{language === 'si' ? '4. ඩිප්ලෝමා' : '4. Diploma'}</MenuItem>
                        <MenuItem value="5. Degree">{language === 'si' ? '5. උපාධිය' : '5. Degree'}</MenuItem>
                        <MenuItem value="6. Postgraduate">{language === 'si' ? '6. උපාධියට වඩා ඉහළ' : '6. Postgraduate'}</MenuItem>
                        <MenuItem value="7. No formal education">{language === 'si' ? '7. විධිමත් අධ්‍යාපනයක් නැත' : '7. No formal education'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_experience" text={getDynamicLabel('q_experience', 'Experience in this Industry (Years)', 'මෙම කර්මාන්තයේ පළපුරුද්ද (වසර)', 'இந்தத் துறையில் அனுபவம் (ஆண்டுகள்)')} />
                    <TextField fullWidth variant="outlined" size="small" type="number" value={formValues['q_experience'] || ''} onChange={(e) => handleInputChange('q_experience', e.target.value)} />
                  </Box>

                  <Box>
                    <QuestionLabel fieldKey="q_prev_occupation" text={getDynamicLabel('q_prev_occupation', 'Occupation before starting the industry', 'කර්මාන්තය ආරම්භ කිරීමට පෙර රැකියාව', 'தொழில் தொடங்கும் முன் வேலைவாய்ப்பு')} />
                    <TextField fullWidth variant="outlined" size="small" value={formValues['q_prev_occupation'] || ''} onChange={(e) => handleInputChange('q_prev_occupation', e.target.value)} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(0)}>
                      {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(2)}>
                      {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                      💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                    </Button>
                  </Box>
                </Box>
              )}


              {[2, 3, 4, 5, 6, 7, 8].includes(currentStep) && renderDynamicStep(currentStep)}
              {currentStep === 9 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>7 වන කොටස: වෙළඳපොළ හා අලෙවිකරණය (Market & Marketing)</Typography>
                  <Box>
                    <QuestionLabel text={language === 'si' ? '7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?' : '7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_customers'] ? formValues['q_customers'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_customers', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. ප්‍රදේශයේ පාරිභෝගිකයින්", "2. ප්‍රදේශයෙන් පිටත පාරිභෝගිකයින්", "3. වෙනත් ව්‍යාපාරිකයින් (B2B)", "4. අතරමැදියන්/තොග වෙළඳුන්", "5. රජයේ ආයතන", "6. අපනයනය සඳහා"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_customers'] ? formValues['q_customers'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '7.1.2 වෙළඳපොළේ පැතිරීම' : '7.1.2 වෙළඳපොළේ පැතිරීම'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_market_extent'] || ''} onChange={(e) => handleInputChange('q_market_extent', e.target.value as string)}>
                        <MenuItem value="1. ගමට පමණයි">1. ගමට පමණයි</MenuItem>
                        <MenuItem value="2. ප්‍රාදේශීය ලේකම් කොට්ඨාසයට">2. ප්‍රාදේශීය ලේකම් කොට්ඨාසයට</MenuItem>
                        <MenuItem value="3. දිස්ත්‍රික්කයට">3. දිස්ත්‍රික්කයට</MenuItem>
                        <MenuItem value="4. පළාතට">4. පළාතට</MenuItem>
                        <MenuItem value="5. රට පුරා">5. රට පුරා</MenuItem>
                        <MenuItem value="6. ජාත්‍යන්තර">6. ජාත්‍යන්තර</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '7.1.3 පාරිභෝගිකයින්ගේ ප්‍රවණතාවය' : '7.1.3 පාරිභෝගිකයින්ගේ ප්‍රවණතාවය'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_customer_trend'] || ''} onChange={(e) => handleInputChange('q_customer_trend', e.target.value as string)}>
                        <MenuItem value="1. වැඩි වෙමින් පවතී">1. වැඩි වෙමින් පවතී</MenuItem>
                        <MenuItem value="2. අඩු වෙමින් පවතී">2. අඩු වෙමින් පවතී</MenuItem>
                        <MenuItem value="3. වෙනසක් නැත">3. වෙනසක් නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '7.2.1 තරඟකරුවන් සිටීද?' : '7.2.1 තරඟකරුවන් සිටීද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_has_competitors'] || ''} onChange={(e) => handleInputChange('q_has_competitors', e.target.value as string)}>
                        <MenuItem value="1. ඔව්, බොහෝ දෙනෙක්">1. ඔව්, බොහෝ දෙනෙක්</MenuItem>
                        <MenuItem value="2. ඔව්, කීප දෙනෙක්">2. ඔව්, කීප දෙනෙක්</MenuItem>
                        <MenuItem value="3. නැත">3. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {formValues['q_has_competitors'] === '1. ඔව්, බොහෝ දෙනෙක්' || formValues['q_has_competitors'] === '2. ඔව්, කීප දෙනෙක්' && (
                    <Box>
                      <QuestionLabel text={language === 'si' ? '7.2.2 තරඟකරුවන්ගෙන් වන බලපෑම' : '7.2.2 තරඟකරුවන්ගෙන් වන බලපෑම'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_competitor_influence'] || ''} onChange={(e) => handleInputChange('q_competitor_influence', e.target.value as string)}>
                          <MenuItem value="1. විශාලයි">1. විශාලයි</MenuItem>
                          <MenuItem value="2. මධ්‍යමයි">2. මධ්‍යමයි</MenuItem>
                          <MenuItem value="3. අඩුයි">3. අඩුයි</MenuItem>
                          <MenuItem value="4. බලපෑමක් නැත">4. බලපෑමක් නැත</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <Box>
                    <QuestionLabel text={language === 'si' ? '7.3.1 අලෙවිකරණ ක්‍රම' : '7.3.1 අලෙවිකරණ ක්‍රම'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_marketing_methods'] ? formValues['q_marketing_methods'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_marketing_methods', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. පෝස්ටර්/බැනර්", "2. සමාජ මාධ්‍ය (Facebook, WhatsApp)", "3. වෙබ් අඩවියක් මගින්", "4. මුද්‍රිත මාධ්‍ය (පුවත්පත්)", "5. රූපවාහිනී/ගුවන් විදුලි", "6. පාරිභෝගිකයින්ගේ දැනුම්දීම (Word of mouth)", "7. ප්‍රදර්ශන/පොළවල්", "8. අලෙවිකරණයක් නොකරයි"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_marketing_methods'] ? formValues['q_marketing_methods'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '7.3.2 භාණ්ඩ සඳහා වෙළඳ නාමයක් (Brand) තිබේද?' : '7.3.2 භාණ්ඩ සඳහා වෙළඳ නාමයක් (Brand) තිබේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_has_brand'] || ''} onChange={(e) => handleInputChange('q_has_brand', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(8)}>
                      {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(10)}>
                      {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                      💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                    </Button>
                  </Box>
                </Box>
              )}
              {currentStep === 10 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>8 වන කොටස: නවෝත්පාදන හා තාක්ෂණය (Innovation & Technology)</Typography>
                  <Box>
                    <QuestionLabel text={language === 'si' ? '8.1.1 පසුගිය වසර 3 තුළ නව නිෂ්පාදන/සේවා හඳුන්වා දුන්නේද?' : '8.1.1 පසුගිය වසර 3 තුළ නව නිෂ්පාදන/සේවා හඳුන්වා දුන්නේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_new_products'] || ''} onChange={(e) => handleInputChange('q_new_products', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '8.1.2 පසුගිය වසර 3 තුළ නව තාක්ෂණයක් භාවිතා කළේද?' : '8.1.2 පසුගිය වසර 3 තුළ නව තාක්ෂණයක් භාවිතා කළේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_new_tech'] || ''} onChange={(e) => handleInputChange('q_new_tech', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '8.2.1 භාවිතා කරන තාක්ෂණික උපකරණ' : '8.2.1 භාවිතා කරන තාක්ෂණික උපකරණ'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_tech_devices'] ? formValues['q_tech_devices'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_tech_devices', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. ස්මාර්ට් දුරකථනය", "2. පරිගණකය/ලැප්ටොප්", "3. අන්තර්ජාල පහසුකම්", "4. කිසිවක් නැත"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_tech_devices'] ? formValues['q_tech_devices'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '8.2.2 අන්තර්ජාලය ව්‍යාපාරික කටයුතු සඳහා භාවිතා කරන්නේද?' : '8.2.2 අන්තර්ජාලය ව්‍යාපාරික කටයුතු සඳහා භාවිතා කරන්නේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_uses_internet_for_business'] || ''} onChange={(e) => handleInputChange('q_uses_internet_for_business', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරන්නේද?' : '8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරන්නේද?'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_digital_payments'] ? formValues['q_digital_payments'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_digital_payments', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. ඔව් (බැංකු හරහා - Online Banking)", "2. ඔව් (LankaQR / Mobile Wallets)", "3. කාඩ්පත් මගින් (POS)", "4. නැත, මුදල් (Cash) පමණයි"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_digital_payments'] ? formValues['q_digital_payments'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(9)}>
                      {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(11)}>
                      {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                      💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                    </Button>
                  </Box>
                </Box>
              )}
              {currentStep === 11 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>9 වන කොටස: ව්‍යාපාරික පරිසරය හා රාජ්‍ය මැදිහත්වීම (Business Environment & Government)</Typography>
                  <Box>
                    <QuestionLabel text={language === 'si' ? '9.1.1 ව්‍යාපාරය සතු ලියාපදිංචි සහතික' : '9.1.1 ව්‍යාපාරය සතු ලියාපදිංචි සහතික'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_reg_certificates'] ? formValues['q_reg_certificates'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_reg_certificates', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. ප්‍රාදේශීය ලේකම් ලියාපදිංචිය (BR)", "2. සමාගම් මැදුරේ ලියාපදිංචිය", "3. පළාත් සභා/ප්‍රාදේශීය සභා අනුමැතිය", "4. පරිසර ආරක්ෂණ බලපත්‍රය (EPL)", "5. සෞඛ්‍ය වෛද්‍ය නිලධාරී (MOH) සහතිකය", "6. ප්‍රමිති ආයතනයේ සහතිකය (SLSI)", "7. අපනයන සංවර්ධන මණ්ඩලයේ (EDB) ලියාපදිංචිය", "8. වෙනත්", "9. කිසිවක් නැත"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_reg_certificates'] ? formValues['q_reg_certificates'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '9.1.2 ගෙවන බදු වර්ග' : '9.1.2 ගෙවන බදු වර්ග'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_taxes_paid'] ? formValues['q_taxes_paid'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_taxes_paid', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. ආදායම් බදු", "2. එකතු කළ අගය මත බදු (VAT)", "3. ප්‍රාදේශීය සභා බදු", "4. කිසිවක් නැත"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_taxes_paid'] ? formValues['q_taxes_paid'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '9.2.1 රජයෙන් ලැබී ඇති සහාය' : '9.2.1 රජයෙන් ලැබී ඇති සහාය'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_gov_support_received'] ? formValues['q_gov_support_received'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_gov_support_received', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. මූල්‍ය ආධාර (ණය/ප්‍රතිපාදන)", "2. පුහුණු වැඩසටහන්", "3. උපදේශන සේවා", "4. අමුද්‍රව්‍ය/උපකරණ", "5. ප්‍රදර්ශන සඳහා අවස්ථා", "6. කිසිදු සහායක් ලැබී නැත"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_gov_support_received'] ? formValues['q_gov_support_received'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1, mt: 2 }}>9.3 ව්‍යාපාරික පරිසරයේ බාධක (1=බාධකයක් නොවේ, 5=ඉතා විශාල බාධකයක්)</Typography>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? 'මූල්‍ය පහසුකම් ලබා ගැනීම' : 'මූල්‍ය පහසුකම් ලබා ගැනීම'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_barrier_finance'] || ''} onChange={(e) => handleInputChange('q_barrier_finance', e.target.value as string)}>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? 'යටිතල පහසුකම් (විදුලිය/ජලය)' : 'යටිතල පහසුකම් (විදුලිය/ජලය)'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_barrier_infrastructure'] || ''} onChange={(e) => handleInputChange('q_barrier_infrastructure', e.target.value as string)}>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? 'බදු අනුපාත' : 'බදු අනුපාත'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_barrier_taxes'] || ''} onChange={(e) => handleInputChange('q_barrier_taxes', e.target.value as string)}>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? 'පුහුණු ශ්‍රමිකයින් සොයා ගැනීම' : 'පුහුණු ශ්‍රමිකයින් සොයා ගැනීම'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_barrier_labor'] || ''} onChange={(e) => handleInputChange('q_barrier_labor', e.target.value as string)}>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? 'නීති හා රෙගුලාසි ක්‍රියා පටිපාටිය' : 'නීති හා රෙගුලාසි ක්‍රියා පටිපාටිය'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_barrier_laws'] || ''} onChange={(e) => handleInputChange('q_barrier_laws', e.target.value as string)}>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4">4</MenuItem>
                        <MenuItem value="5">5</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(10)}>
                      {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(12)}>
                      {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                      💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                    </Button>
                  </Box>
                </Box>
              )}
              {currentStep === 12 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>10 වන කොටස: පාරිසරික හා සමාජීය බලපෑම (Environmental & Social Impact)</Typography>
                  <Box>
                    <QuestionLabel text={language === 'si' ? '10.1.1 පරිසරයට වන බලපෑම තක්සේරු කර තිබේද?' : '10.1.1 පරිසරයට වන බලපෑම තක්සේරු කර තිබේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_env_impact_assessed'] || ''} onChange={(e) => handleInputChange('q_env_impact_assessed', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '10.1.2 බලශක්තිය/ජලය ඉතිරි කිරීමට පියවර ගෙන තිබේද?' : '10.1.2 බලශක්තිය/ජලය ඉතිරි කිරීමට පියවර ගෙන තිබේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_energy_saving'] || ''} onChange={(e) => handleInputChange('q_energy_saving', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '10.2.1 ප්‍රජාව වෙනුවෙන් සමාජ සත්කාර (CSR) සිදු කරන්නේද?' : '10.2.1 ප්‍රජාව වෙනුවෙන් සමාජ සත්කාර (CSR) සිදු කරන්නේද?'} />
                    <FormControl fullWidth size="small">
                      <Select value={formValues['q_social_responsibility'] || ''} onChange={(e) => handleInputChange('q_social_responsibility', e.target.value as string)}>
                        <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
                        <MenuItem value="2. නැත">2. නැත</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(11)}>
                      {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(13)}>
                      {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                      💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                    </Button>
                  </Box>
                </Box>
              )}
              {currentStep === 13 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>11 වන කොටස: අනාගත අවශ්‍යතා සහ ලොජිස්ටික්ස් (Future Needs & Logistics)</Typography>
                  <Box>
                    <QuestionLabel text={language === 'si' ? '11.1.1 ව්‍යාපාරය දියුණු කිරීමට ඇති සැලසුම්' : '11.1.1 ව්‍යාපාරය දියුණු කිරීමට ඇති සැලසුම්'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_business_expansion'] ? formValues['q_business_expansion'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_business_expansion', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. නව නිෂ්පාදන/සේවා හඳුන්වා දීම", "2. නිෂ්පාදන ධාරිතාව වැඩි කිරීම", "3. නව වෙළඳපොළවල් සෙවීම (අපනයනය ඇතුළුව)", "4. නව තාක්ෂණය/යන්ත්‍රෝපකරණ මිලදී ගැනීම", "5. ශාඛා විවෘත කිරීම", "6. සැලසුමක් නැත"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_business_expansion'] ? formValues['q_business_expansion'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? '11.1.2 රජයෙන් හෝ වෙනත් ආයතන වලින් බලාපොරොත්තු වන සහාය' : '11.1.2 රජයෙන් හෝ වෙනත් ආයතන වලින් බලාපොරොත්තු වන සහාය'} />
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={formValues['q_expected_gov_support'] ? formValues['q_expected_gov_support'].split(', ') : []}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange('q_expected_gov_support', (typeof val === 'string' ? val.split(',') : val).join(', '));
                        }}
                        input={<OutlinedInput />}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        {["1. අඩු පොලී ණය", "2. නව තාක්ෂණික උපකරණ/අමුද්‍රව්‍ය", "3. ව්‍යාපාරික පුහුණුව/උපදේශනය", "4. අලෙවි පහසුකම්/වෙළඳපොළ සෙවීම", "5. ඉඩම්/යටිතල පහසුකම්", "6. නීතිමය ගැටළු විසඳීම", "7. වෙනත්"].map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox checked={formValues['q_expected_gov_support'] ? formValues['q_expected_gov_support'].split(', ').indexOf(name) > -1 : false} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <QuestionLabel text={language === 'si' ? 'වෙනත් අදහස්/යෝජනා' : 'වෙනත් අදහස්/යෝජනා'} />
                    <TextField fullWidth variant="outlined" size="small" multiline rows={3} value={formValues['q_additional_comments'] || ''} onChange={(e) => handleInputChange('q_additional_comments', e.target.value)} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(12)}>
                      {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>
                    <Button variant="contained" color="success" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setSubmitDialogOpen(true)}>
                      {language === 'si' ? 'ඉදිරිපත් කරන්න' : language === 'ta' ? 'சமர்ப்பி' : 'Submit Survey'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      )}

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          {language === 'si' ? 'සාර්ථකයි!' : language === 'ta' ? 'வெற்றி!' : 'Success!'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            {language === 'si' ? 'සමීක්ෂණය සාර්ථකව ඉදිරිපත් කරන ලදි.' : language === 'ta' ? 'கணக்கெடுப்பு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.' : 'Survey submitted successfully!'}
          </Typography>
          {submitSuccessData && (
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2 }}>
              <Typography variant="body2" mb={1}>
                <strong>{language === 'si' ? 'ආරම්භක වේලාව:' : language === 'ta' ? 'தொடக்க நேரம்:' : 'Start Time:'}</strong> {submitSuccessData.startTime}
              </Typography>
              <Typography variant="body2">
                <strong>{language === 'si' ? 'අවසන් වේලාව:' : language === 'ta' ? 'முடிவு நேரம்:' : 'End Time:'}</strong> {submitSuccessData.endTime}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="contained" color="success" onClick={() => setSuccessDialogOpen(false)}>
            {language === 'si' ? 'හරි' : language === 'ta' ? 'சரி' : 'OK'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Confirmation Dialog */}
      <Dialog open={!!ccode && !locationConfirmed && !showLocationSelector && !!gnData?.gnByCcode} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {language === 'si' ? 'ස්ථානය තහවුරු කරන්න' : language === 'ta' ? 'இடத்தை உறுதிப்படுத்தவும்' : 'Confirm Location'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            {language === 'si' ? 'මෙය ඔබගේ නිවැරදි ග්‍රාම නිලධාරී වසම දැයි තහවුරු කරන්න:' : language === 'ta' ? 'இது உங்களின் சரியான கிராம உத்தியோகத்தர் பிரிவு என்பதை உறுதிப்படுத்தவும்:' : 'Are you sure this is your correct Village / GN Division?'}
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2 }}>
            <Typography variant="body2"><strong>{language === 'si' ? 'දිස්ත්‍රික්කය:' : language === 'ta' ? 'மாவட்டம்:' : 'District:'}</strong> {gnData?.gnByCcode?.disEn}</Typography>
            <Typography variant="body2"><strong>{language === 'si' ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය:' : language === 'ta' ? 'பிரதேச செயலகம்:' : 'DS Division:'}</strong> {gnData?.gnByCcode?.dsEn}</Typography>
            <Typography variant="body2"><strong>{language === 'si' ? 'ග්‍රාම නිලධාරී වසම:' : language === 'ta' ? 'கிராம உத்தியோகத்தர் பிரிவு:' : 'Village / GN Division:'}</strong> {gnData?.gnByCcode?.nameEn}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowLocationSelector(true)}
          >
            {language === 'si' ? 'නැත, වෙනස් කරන්න' : language === 'ta' ? 'இல்லை, மாற்றவும்' : 'No, Change'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setLocationConfirmed(true);
              const draftStr = localStorage.getItem(`survey_draft_${ccode}`);
              if (draftStr) {
                setShowResumePopup(true);
              } else {
                setShowMetadataPopup(true);
              }
            }}
          >
            {language === 'si' ? 'ඔව්, නිවැරදියි' : language === 'ta' ? 'ஆம், சரியானது' : 'Yes, Proceed'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Survey Metadata Popup */}
      <Dialog open={showMetadataPopup && !surveyStartTime} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {language === 'si' ? 'සමීක්ෂණ තොරතුරු' : language === 'ta' ? 'கணக்கெடுப்பு தகவல்' : 'Survey Information'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body1">
              <strong>{language === 'si' ? 'ග්‍රාම නිලධාරි වසම:' : 'Village / GN Division:'}</strong> {gnData?.gnByCcode?.nameEn}
            </Typography>
            <Typography variant="body1">
              <strong>{language === 'si' ? 'ප්‍රාදේශීය ලේකම් කොට්ඨාශය:' : 'DS Division:'}</strong> {gnData?.gnByCcode?.dsEn}
            </Typography>
            <Typography variant="body1">
              <strong>{language === 'si' ? 'සමීක්ෂණ දිනය:' : 'Survey Date:'}</strong> {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              <strong>{language === 'si' ? 'සමීක්ෂකගේ නම:' : 'Surveyor Name:'}</strong> {userInfo?.name || 'Unknown'}
            </Typography>
            <Typography variant="body1">
              <strong>{language === 'si' ? 'සමීක්ෂණ ආරම්භය:' : 'Start Time:'}</strong> {language === 'si' ? 'ස්වයංක්‍රීයව' : 'Auto'} (____:____)
            </Typography>
            <Typography variant="body1">
              <strong>{language === 'si' ? 'අවසානය:' : 'End Time:'}</strong> {language === 'si' ? 'ස්වයංක්‍රීයව' : 'Auto'} (____:____)
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={2}>
              * {language === 'si' ? 'ඔබ OK බොත්තම ක්ලික් කළ විට ආරම්භක වේලාව සටහන් වේ. අවසන් වේලාව පෝරමය ඉදිරිපත් කිරීමේදී සටහන් වේ.' : 'Start time will be recorded when you click OK. End time will be recorded when you submit the form.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSurveyStartTime(new Date());
              setShowMetadataPopup(false);
              setShowGpsPopup(true);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* GPS Confirmation Popup */}
      <Dialog open={showGpsPopup} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          📍 {language === 'si' ? 'භූගෝලීය ඛණ්ඩාංක (GPS)' : language === 'ta' ? 'புவியியல் ஆயத்தொலைவுகள் (GPS)' : 'GPS Coordinates'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {language === 'si'
              ? 'ඔබ දැනට සිටින්නේ නිවැරදි සමීක්ෂණ ස්ථානයේ ද? (ඔව් නම්, ස්ථානය ස්වයංක්‍රීයව සටහන් වේ)'
              : 'Are you currently at the correct survey location? (If Yes, location will be recorded automatically)'}
          </Typography>
          {gnData?.gnByCcode && (
            <Box sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" color="primary.main" fontWeight={700}>
                {language === 'si' ? 'සමීක්ෂණ ස්ථානය:' : 'Survey Location:'}
              </Typography>
              <Typography variant="body2" fontWeight={600}>{gnData.gnByCcode.nameEn}</Typography>
              <Typography variant="caption" color="text.secondary">{gnData.gnByCcode.dsEn} · {gnData.gnByCcode.disEn}</Typography>
            </Box>
          )}
          {gpsChecking && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {language === 'si' ? 'GPS ස්ථානය ලබා ගනිමින් සිටී...' : 'Getting your GPS location...'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            disabled={gpsChecking}
            onClick={() => {
              setShowGpsPopup(false);
            }}
          >
            {language === 'si' ? 'නැත' : 'No'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={gpsChecking}
            onClick={() => {
              if (!navigator.geolocation) {
                setGpsErrorPopup(language === 'si' ? 'ඔබගේ බ්‍රවුසරය GPS සඳහා සහය නොදක්වයි.' : 'Geolocation is not supported by this browser.');
                return;
              }
              setGpsChecking(true);
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setGpsChecking(false);
                  const userLat = position.coords.latitude;
                  const userLng = position.coords.longitude;
                  const boundary = gnData?.gnByCcode?.boundary;

                  // Check if inside boundary
                  let isInside = false;
                  if (boundary) {
                    // First try polygon point-in-polygon check
                    if (boundary.polygons && boundary.polygons.length > 0) {
                      try {
                        const polygons: number[][][] = typeof boundary.polygons === 'string'
                          ? JSON.parse(boundary.polygons)
                          : boundary.polygons;
                        // Check against each polygon ring
                        for (const ring of polygons) {
                          let inside = false;
                          for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                            const xi = ring[i][1], yi = ring[i][0]; // [lng, lat] format
                            const xj = ring[j][1], yj = ring[j][0];
                            const intersect = ((yi > userLng) !== (yj > userLng)) &&
                              (userLat < (xj - xi) * (userLng - yi) / (yj - yi) + xi);
                            if (intersect) inside = !inside;
                          }
                          if (inside) { isInside = true; break; }
                        }
                      } catch (e) {
                        // Fall back to bounding box
                        isInside = userLat >= boundary.minLat && userLat <= boundary.maxLat &&
                          userLng >= boundary.minLng && userLng <= boundary.maxLng;
                      }
                    } else {
                      // Bounding box check (with 0.02° ~2km buffer)
                      const buffer = 0.02;
                      isInside = userLat >= (boundary.minLat - buffer) && userLat <= (boundary.maxLat + buffer) &&
                        userLng >= (boundary.minLng - buffer) && userLng <= (boundary.maxLng + buffer);
                    }
                  } else {
                    // No boundary data — accept location as-is
                    isInside = true;
                  }

                  if (isInside) {
                    setGpsCoordinates({ lat: userLat, lng: userLng });
                    setShowGpsPopup(false);
                  } else {
                    // Wrong location — show warning popup
                    setGpsWrongLocationPopup({ lat: userLat, lng: userLng });
                    setShowGpsPopup(false);
                  }
                },
                (error) => {
                  setGpsChecking(false);
                  let errorMsg = language === 'si' ? 'ස්ථානය ලබා ගැනීමට නොහැකි විය.' : 'Failed to get location.';
                  if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = language === 'si'
                      ? 'ස්ථානය ලබා ගැනීමට අවසර ලබා දී නොමැත. කරුණාකර බ්‍රවුසරයේ සැකසුම් පරීක්ෂා කරන්න.'
                      : 'Location permission denied. Please check your browser settings.';
                  } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMsg = language === 'si' ? 'ස්ථාන තොරතුරු ලබා ගත නොහැක.' : 'Location information is unavailable.';
                  } else if (error.code === error.TIMEOUT) {
                    errorMsg = language === 'si' ? 'ස්ථානය ලබා ගැනීමේ කාලය ඉකුත් විය.' : 'The request to get your location timed out.';
                  }
                  setGpsErrorPopup(errorMsg);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
              );
            }}
          >
            {gpsChecking ? <CircularProgress size={20} color="inherit" /> : (language === 'si' ? 'ඔව්' : 'Yes')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Wrong Location Warning Popup */}
      <Dialog open={!!gpsWrongLocationPopup} onClose={() => { }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚠️ {language === 'si' ? 'ස්ථානය නිවැරදි නොවේ' : language === 'ta' ? 'தவறான இடம்' : 'Wrong Location'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              {language === 'si'
                ? 'ඔබ දැනට සිටිනු ලබන ස්ථානය තෝරාගත් ග්‍රාම නිලධාරී වසමෙහි අයත් නොවේ. කරුණාකර නිවැරදි ස්ථානයේ සිට සමීක්ෂණය පුරවන්න.'
                : language === 'ta'
                  ? 'நீங்கள் தேர்ந்தெடுத்த கிராம உத்தியோகத்தர் பிரிவில் இல்லை. சரியான இடத்திலிருந்து கணக்கெடுப்பை பூர்த்தி செய்யவும்.'
                  : 'You are not currently in the correct survey location (GN Division). Please fill the survey from the correct location.'}
            </Typography>
            {gpsWrongLocationPopup && (
              <Box sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.300', borderRadius: 2, p: 1.5 }}>
                <Typography variant="caption" color="warning.dark" fontWeight={700} display="block">
                  {language === 'si' ? 'ඔබගේ වර්තමාන ස්ථානය:' : 'Your current location:'}
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {language === 'si' ? 'අක්ෂාංශ' : 'Lat'}: {gpsWrongLocationPopup.lat.toFixed(6)},&nbsp;
                  {language === 'si' ? 'දේශාංශ' : 'Lng'}: {gpsWrongLocationPopup.lng.toFixed(6)}
                </Typography>
                {gnData?.gnByCcode?.boundary && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {language === 'si' ? 'අපේක්ෂිත ප්‍රදේශය:' : 'Expected area:'} {gnData.gnByCcode.nameEn}
                  </Typography>
                )}
              </Box>
            )}
            <Box sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200', borderRadius: 2, p: 1.5 }}>
              <Typography variant="body2" color="info.dark">
                {language === 'si'
                  ? '"දිගටම" ක්ලික් කළ හොත්, ඔබේ ස්ථාන තොරතුරු සුරකිනු නොලැබේ, නමුත් අනෙකුත් සමීක්ෂණ දත්ත සුරකිනු ලැබේ.'
                  : language === 'ta'
                    ? '"தொடரவும்" கிளிக் செய்தால், இடம் சேமிக்கப்படாது, ஆனால் மற்ற தரவு சேமிக்கப்படும்.'
                    : 'If you click "Continue", location will NOT be saved, but all other survey data will be saved normally.'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setGpsWrongLocationPopup(null);
              setShowGpsPopup(true);
            }}
          >
            🔄 {language === 'si' ? 'නැවත උත්සාහ කරන්න' : language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Try Again'}
          </Button>
          <Button
            variant="contained"
            color="warning"
            sx={{ fontWeight: 'bold', color: 'white' }}
            onClick={() => {
              // Continue WITHOUT saving GPS coordinates
              setGpsCoordinates(null);
              setGpsWrongLocationPopup(null);
            }}
          >
            {language === 'si' ? 'දිගටම' : language === 'ta' ? 'தொடரவும்' : 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Draft Success Dialog */}
      <Dialog open={saveDraftDialogOpen} onClose={() => setSaveDraftDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'success.main', pt: 3 }}>
          💾 {language === 'si' ? 'ෆෝරමය සේව් කෙරිණ!' : language === 'ta' ? 'படிவம் சேமிக்கப்பட்டது!' : 'Progress Saved!'}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {language === 'si'
              ? 'ඔබගේ තොරතුරු සාර්ථකව සේව් කෙරිණ. ඔබ ඊළඟ වර ෆෝරමය විවෘත කළ විට, ඔබ නතර කළ තැනින් නැවත ආරම්භ වේ.'
              : language === 'ta'
                ? 'உங்கள் தரவு சேமிக்கப்பட்டது. அடுத்த முறை படிவத்தை திறக்கும்போது, நீங்கள் நிறுத்திய இடத்திலிருந்து தொடரலாம்.'
                : 'Your progress has been saved. When you return to this form, you can continue from where you left off.'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {language === 'si' ? `සුරකින ලද පියවර: ${currentStep + 1}` : language === 'ta' ? `சேமித்த படி: ${currentStep + 1}` : `Saved at step: ${currentStep + 1}`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold' }}
            onClick={() => {
              setSaveDraftDialogOpen(false);
              const lastGnUrl = localStorage.getItem('last_gn_url');
              navigate(lastGnUrl || '/');
            }}
          >
            🏠 {language === 'si' ? 'ප්‍රධාන පිටුවට යන්න' : language === 'ta' ? 'முகப்பு பக்கத்திற்கு செல்லவும்' : 'Go to Home Page'}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold' }}
            onClick={() => setSaveDraftDialogOpen(false)}
          >
            {language === 'si' ? 'ෆෝරමය දිගටම කරන්න' : language === 'ta' ? 'படிவத்தை தொடரவும்' : 'Continue Filling Form'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resume Draft Popup */}
      <Dialog open={showResumePopup} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {language === 'si' ? 'අසම්පූර්ණ සමීක්ෂණයක් සොයා ගන්නා ලදී' : language === 'ta' ? 'முடிக்கப்படாத கணக்கெடுப்பு' : 'Unfinished Survey Found'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {language === 'si'
              ? 'මෙම ග්‍රාම නිලධාරී වසම සඳහා ඔබ මින් පෙර ආරම්භ කළ අසම්පූර්ණ සමීක්ෂණයක් ඇත. ඔබ එය නැවත ආරම්භ කිරීමට හෝ අලුතින් සමීක්ෂණයක් ආරම්භ කිරීමට කැමතිද?'
              : 'There is an unfinished survey for this Village. Do you want to resume where you left off, or start a new survey?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              localStorage.removeItem(`survey_draft_${ccode}`);
              setShowResumePopup(false);
              setShowMetadataPopup(true);
            }}
          >
            {language === 'si' ? 'අලුතින් ආරම්භ කරන්න' : 'Start New'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const draftStr = localStorage.getItem(`survey_draft_${ccode}`);
              if (draftStr) {
                const draft = JSON.parse(draftStr);
                setFormValues(draft.formValues || {});
                setGpsCoordinates(draft.gpsCoordinates || null);
                if (draft.currentStep !== undefined) {
                  setCurrentStep(draft.currentStep);
                }
                if (draft.surveyStartTime) {
                  setSurveyStartTime(new Date(draft.surveyStartTime));
                }
              }
              setShowResumePopup(false);
            }}
          >
            {language === 'si' ? 'නැවත ආරම්භ කරන්න' : 'Resume Survey'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={showLocationSelector}
        onLocationSelected={(gn) => {
          setShowLocationSelector(false);
          const formattedGnName = encodeURIComponent(gn.nameEn.replace(/ /g, '-'));
          navigate(`/industry-survey/${formattedGnName}/${gn.CCODE}`, { state: { fromSelector: true } });
        }}
      />


      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {language === 'si' ? 'තහවුරු කරන්න' : 'Confirm Submission'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography mb={2}>
            {language === 'si'
              ? 'ඔබගේ සියලුම තොරතුරු නිවැරදි දැයි තහවුරු කරගන්න. ඉදිරිපත් කිරීමට පෙර අවශ්‍ය නම් ආපසු ගොස් පරීක්ෂා කළ හැක. ඔබ ඉදිරිපත් කළ පසු මෙම තොරතුරු පද්ධතියට සුරැකෙනු ඇත.'
              : 'Please review all your details. You can scroll back and check before submitting. Once you click Done, the data will be securely saved to the database.'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            * Note: Saving up to {Object.keys(formValues).length} fields!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setSubmitDialogOpen(false)}>
            {language === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
          </Button>
          <Button variant="contained" color="success" sx={{ fontWeight: 'bold', px: 4 }} onClick={() => {
            setSubmitDialogOpen(false);
            handleSubmit(new Event('submit') as any);
          }}>
            {language === 'si' ? 'තහවුරු කර ඉදිරිපත් කරන්න' : 'Done / Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {language === 'si' ? 'OTP අංකය ඇතුළත් කරන්න' : 'Enter 6-Digit OTP'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            {language === 'si'
              ? 'කරුණාකර ඔබගේ ජංගම දුරකථනයට ලැබුණු අංක 6 කින් යුත් කේතය ඇතුළත් කරන්න.'
              : 'Please enter the 6-digit code sent to your mobile.'}
          </Typography>
          <TextField
            fullWidth
            autoFocus
            variant="outlined"
            label="OTP Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleVerifyOtp} disabled={otpVerifying || otpCode.length !== 6}>
            {otpVerifying ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GPS Error Popup */}
      <Dialog open={!!gpsErrorPopup} onClose={() => { }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          {language === 'si' ? 'දෝෂයකි' : language === 'ta' ? 'பிழை' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {gpsErrorPopup}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }} color="textSecondary">
            {language === 'si' ? 'කරුණාකර ඔබගේ බ්‍රවුසරයේ ඉහළ ඇති ලොක් (Lock) අයිකනය ක්ලික් කර "Location" සඳහා අවසර ලබා දී නැවත උත්සාහ කරන්න.' : 'Please click the lock icon in the address bar, allow Location access, and try again.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setGpsErrorPopup(null);
              setShowGpsPopup(false);
            }}
          >
            {language === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setGpsErrorPopup(null);
            }}
          >
            {language === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Try Again'}
          </Button>
        </DialogActions>
      </Dialog>
      <GnPageFooter />
    </Box>
  );
};

export default IndustrySurveyPage;







