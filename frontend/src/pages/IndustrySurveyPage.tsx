import React, { useState, useEffect } from 'react';
import GnTopHeaderBar from '../components/GnTopHeaderBar';
import GnPageFooter from '../components/GnPageFooter';
import { Box, Typography, Container, CircularProgress } from '@mui/material';
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

import {
  T, QuestionField, SText, SDropdown, Segmented, ChipMultiSelect, RatingScale,
  UploadField, SurveyDialog, InfoRow, SurveyKeyframes, SurveyErrorContext, Opt,
} from '../components/survey/SurveyKit';
import SurveyProgress, { SurveySection } from '../components/survey/SurveyProgress';
import { extractNICDetails, getStepErrors, getFirstInvalidStep, TOTAL_STEPS } from '../components/survey/surveyValidation';

/* Section icons */
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
/* UI icons */
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import LocationCityRoundedIcon from '@mui/icons-material/LocationCityRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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

const IndustrySurveyPage: React.FC = () => {
  const { isAuthenticated, login, isLoading, userInfo, token } = useAuth();
  const { language } = useLanguage();
  const { gnName, ccode } = useParams<{ gnName?: string; ccode?: string }>();
  const navigate = useNavigate();
  const locationState = useLocation().state as { fromSelector?: boolean };

  const { loading, error } = useQuery(GET_QUESTIONS, { fetchPolicy: 'cache-and-network' });
  const { data: gnData } = useQuery(GET_GN_BY_CCODE, { variables: { CCODE: ccode }, skip: !ccode });

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set());
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [submitSuccessData, setSubmitSuccessData] = useState<{ startTime: string; endTime: string } | null>(null);
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
      .catch(() => {}); // silent fail — user can type manually
    return () => { cancelled = true; };
  }, [ccode, selectedCategory?.slug]);

  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [submitSuccessData, setSubmitSuccessData] = useState<{startTime: string, endTime: string} | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showMetadataPopup, setShowMetadataPopup] = useState(false);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [saveDraftDialogOpen, setSaveDraftDialogOpen] = useState(false);
  const [showGpsPopup, setShowGpsPopup] = useState(false);
  const [gpsErrorPopup, setGpsErrorPopup] = useState<string | null>(null);
  const [surveyStartTime, setSurveyStartTime] = useState<Date | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
  const [gpsCoordinates, setGpsCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [gpsChecking, setGpsChecking] = useState(false);
  const [gpsWrongLocationPopup, setGpsWrongLocationPopup] = useState<{lat: number, lng: number} | null>(null);

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
      } catch {}
    }

    // No draft — normal flow
    setFormValues({});
    setCurrentStep(0);
    setMaxReached(0);
    setValidatedSteps(new Set());
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
        const draftStr = localStorage.getItem(`survey_draft_${ccode}`);
        if (draftStr) setShowResumePopup(true);
        else setShowMetadataPopup(true);
        setShowMetadataPopup(true);
      } else {
        setLocationConfirmed(false);
      }
    }
  }, [ccode, gnName, locationState]);

  // Auto-save draft on every change
  useEffect(() => {
    if (surveyStartTime && ccode) {
      localStorage.setItem(`survey_draft_${ccode}`, JSON.stringify({
        formValues, currentStep, surveyStartTime: surveyStartTime.toISOString(), gpsCoordinates,
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

  useEffect(() => { setMaxReached((m) => Math.max(m, currentStep)); }, [currentStep]);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) login(window.location.href);
  }, [isLoading, isAuthenticated, login]);

  // ── i18n helper ─────────────────────────────────────────────────────────
  const L = (en: string, si: string, ta?: string) =>
    language === 'si' ? si : language === 'ta' ? (ta ?? en) : en;

  const title = L(
    'Industry & Business Survey',
    'කර්මාන්ත හා ව්‍යාපාර සමීක්ෂණය',
    'தொழில் மற்றும் வணிக ஆய்வு'
  );
  const subtitle = L(
    'This survey covers all production, service, sales, industry and business establishments within the Grama Niladhari Division. Please answer every question, marking "Not Applicable" where a question does not apply.',
    'මෙම සමීක්ෂණය ග්‍රාම නිලධාරි වසම තුළ ඇති සියලුම නිෂ්පාදන, සේවා, විකුණුම්, කර්මාන්ත හා ව්‍යාපාර ආයතන ආවරණය කරයි. කරුණාකර සියලු ප්‍රශ්නවලට පිළිතුරු සපයන්න. අදාළ නොවන ප්‍රශ්න සඳහා "අදාළ නොවේ" ලෙස සලකුණු කරන්න.',
    'இந்த கணக்கெடுப்பு கிராம உத்தியோகத்தர் பிரிவுக்குள் உள்ள அனைத்து உற்பத்தி, சேவைகள், விற்பனை, தொழில்கள் மற்றும் வணிக நிறுவனங்களை உள்ளடக்கியது. அனைத்து கேள்விகளுக்கும் பதிலளிக்கவும்.'
  );

  const yn = (yesVal = '1. ඔව්', noVal = '2. නැත'): Opt[] => ([
    { value: yesVal, label: L('Yes', 'ඔව්', 'ஆம்') },
    { value: noVal, label: L('No', 'නැත', 'இல்லை') },
  ]);

  const sections: SurveySection[] = [
    { icon: <PersonOutlineRoundedIcon />, title: L('Business Owner', 'ව්‍යාපාර හිමිකරු', 'வணிக உரிமையாளர்'), short: L('Owner', 'හිමිකරු', 'உரிமையாளர்') },
    { icon: <GavelRoundedIcon />, title: L('Legal Status', 'නීතිමය තත්ත්වය', 'சட்ட நிலை'), short: L('Legal', 'නීතිය', 'சட்டம்') },
    { icon: <PlaceOutlinedIcon />, title: L('Location', 'ස්ථානය', 'இடம்'), short: L('Location', 'ස්ථානය', 'இடம்') },
    { icon: <BoltOutlinedIcon />, title: L('Infrastructure & Services', 'යටිතල පහසුකම්', 'உள்கட்டமைப்பு'), short: L('Utilities', 'පහසුකම්', 'சேவைகள்') },
    { icon: <SavingsOutlinedIcon />, title: L('Capital & Scale', 'ප්‍රාග්ධනය හා පරිමාණය', 'மூலதனம்'), short: L('Capital', 'ප්‍රාග්ධනය', 'மூலதனம்') },
    { icon: <GroupsOutlinedIcon />, title: L('Workforce', 'ශ්‍රම බලකාය', 'தொழிலாளர்'), short: L('Workforce', 'ශ්‍රමය', 'தொழிலாளர்') },
    { icon: <PrecisionManufacturingOutlinedIcon />, title: L('Production & Operations', 'නිෂ්පාදන හා මෙහෙයුම්', 'உற்பத்தி'), short: L('Production', 'නිෂ්පාදන', 'உற்பத்தி') },
    { icon: <PaymentsOutlinedIcon />, title: L('Finance & Accounting', 'මූල්‍ය හා ගිණුම්', 'நிதி'), short: L('Finance', 'මූල්‍ය', 'நிதி') },
    { icon: <StorefrontOutlinedIcon />, title: L('Market & Marketing', 'වෙළඳපොළ හා අලෙවිකරණය', 'சந்தை'), short: L('Market', 'වෙළඳපොළ', 'சந்தை') },
    { icon: <LightbulbOutlinedIcon />, title: L('Innovation & Technology', 'නවෝත්පාදන හා තාක්ෂණය', 'புதுமை'), short: L('Innovation', 'නවෝත්පාදන', 'புதுமை') },
    { icon: <PolicyOutlinedIcon />, title: L('Business Environment', 'ව්‍යාපාරික පරිසරය', 'வணிக சூழல்'), short: L('Environment', 'පරිසරය', 'சூழல்') },
    { icon: <ParkOutlinedIcon />, title: L('Environmental & Social', 'පාරිසරික හා සමාජීය', 'சுற்றுச்சூழல்'), short: L('Social', 'සමාජීය', 'சமூகம்') },
    { icon: <RocketLaunchOutlinedIcon />, title: L('Future Needs', 'අනාගත අවශ්‍යතා', 'எதிர்கால தேவைகள்'), short: L('Future', 'අනාගතය', 'எதிர்காலம்') },
  ];

  if (isLoading || !isAuthenticated || loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress sx={{ color: T.brand }} />
        <Typography sx={{ color: T.muted, fontWeight: 600, fontSize: '0.9rem' }}>{L('Loading survey…', 'පූරණය වෙමින්…', 'ஏற்றுகிறது…')}</Typography>
      </Box>
    );
  }
  if (error) return <Typography color="error" sx={{ p: 4 }}>Failed to load survey questions.</Typography>;

  const set = (id: string, val: string) => setFormValues((prev) => ({ ...prev, [id]: val }));
  const v = (id: string) => formValues[id] || '';

  const stepErrors = getStepErrors(currentStep, formValues, L);
  const showErr = validatedSteps.has(currentStep);
  const stepErrorCount = Object.keys(stepErrors).length;

  const scrollToFirstError = () => {
    setTimeout(() => {
      const el = document.querySelector('[data-invalid="true"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const goNext = () => {
    const errs = getStepErrors(currentStep, formValues, L);
    if (Object.keys(errs).length > 0) {
      setValidatedSteps((prev) => new Set(prev).add(currentStep));
      scrollToFirstError();
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleAttemptSubmit = () => {
    const firstBad = getFirstInvalidStep(formValues, L);
    if (firstBad !== -1) {
      setValidatedSteps((prev) => {
        const n = new Set(prev);
        for (let i = 0; i <= Math.max(firstBad, currentStep); i++) n.add(i);
        return n;
      });
      setCurrentStep(firstBad);
      scrollToFirstError();
      return;
    }
    setSubmitDialogOpen(true);
  };

  const handleSubmit = () => {
    const endTime = new Date();
    console.log('Survey Metadata:', {
      gn: gnData?.gnByCcode?.nameEn,
      ds: gnData?.gnByCcode?.dsEn,
      date: new Date().toLocaleDateString(),
      surveyor: userInfo?.name,
      startTime: surveyStartTime?.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      gps: gpsCoordinates,
    });
    console.log('Form Values:', formValues);
    setSubmitSuccessData({
      startTime: surveyStartTime?.toLocaleTimeString() || '—',
      endTime: endTime.toLocaleTimeString(),
    });
    setSuccessDialogOpen(true);
    if (ccode) localStorage.removeItem(`survey_draft_${ccode}`);
    // TODO: implement actual backend submission
  const QuestionLabel = ({ text }: { text: string }) => {
    const q = questions.find((q: any) => q.questionTextEn === text || q.questionTextSi === text || q.questionTextTa === text);
    let explanation = "Explanation will be added soon";
    if (q) {
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
      ccode: gnCcode || 'unknown',
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

  // ── Small presentational helpers ──────────────────────────────────────────
  const GroupLabel: React.FC<{ children: React.ReactNode; hint?: React.ReactNode }> = ({ children, hint }) => (
    <Box sx={{ mt: 1.5, mb: 0.5 }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.brand }}>
        {children}
      </Typography>
      {hint && <Typography sx={{ fontSize: '0.78rem', color: T.muted, mt: 0.4, lineHeight: 1.45 }}>{hint}</Typography>}
      <Box sx={{ height: 2.5, width: 34, borderRadius: 2, bgcolor: T.brand, mt: 0.9 }} />
    </Box>
  );

  const StepNav = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        mt: 1,
        pt: 2.5,
        borderTop: `1px solid ${T.lineSoft}`,
        flexDirection: { xs: 'column-reverse', sm: 'row' },
      }}
    >
      {currentStep > 0 && (
        <Box
          role="button"
          onClick={goPrev}
          sx={{
            flex: { xs: '1 1 auto', sm: '0 0 auto' },
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
            px: 3, py: 1.4, borderRadius: `${T.field}px`,
            border: `1.5px solid ${T.line}`, color: T.body, fontWeight: 700, fontSize: '0.92rem',
            bgcolor: '#fff', transition: 'all .16s ease',
            '&:hover': { borderColor: '#c7d2e2', bgcolor: '#f8fafc' },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: '1.2rem' }} />
          {L('Previous', 'පෙර', 'முந்தைய')}
        </Box>
      )}
      <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
      {currentStep < TOTAL_STEPS - 1 ? (
        <Box
          role="button"
          onClick={goNext}
          sx={{
            flex: { xs: '1 1 auto', sm: '0 0 auto' },
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
            px: 4, py: 1.4, borderRadius: `${T.field}px`,
            color: '#fff', fontWeight: 800, fontSize: '0.92rem',
            background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
            boxShadow: '0 8px 20px rgba(37,99,235,0.30)', transition: 'all .16s ease',
            '&:hover': { boxShadow: '0 10px 26px rgba(37,99,235,0.40)', transform: 'translateY(-1px)' },
          }}
        >
          {L('Next', 'ඊළඟ', 'அடுத்தது')}
          <ArrowForwardRoundedIcon sx={{ fontSize: '1.2rem' }} />
        </Box>
      ) : (
        <Box
          role="button"
          onClick={handleAttemptSubmit}
          sx={{
            flex: { xs: '1 1 auto', sm: '0 0 auto' },
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
            px: 4, py: 1.4, borderRadius: `${T.field}px`,
            color: '#fff', fontWeight: 800, fontSize: '0.92rem',
            background: `linear-gradient(135deg, ${T.accent} 0%, #10b981 100%)`,
            boxShadow: '0 8px 20px rgba(5,150,105,0.32)', transition: 'all .16s ease',
            '&:hover': { boxShadow: '0 10px 26px rgba(5,150,105,0.42)', transform: 'translateY(-1px)' },
          }}
        >
          <TaskAltRoundedIcon sx={{ fontSize: '1.2rem' }} />
          {L('Submit Survey', 'ඉදිරිපත් කරන්න', 'சமர்ப்பி')}
        </Box>
      )}
    </Box>
  );

  const btnPrimary = {
    cursor: 'pointer', flex: 1, textAlign: 'center' as const,
    px: 3, py: 1.35, borderRadius: `${T.field}px`, color: '#fff', fontWeight: 800, fontSize: '0.9rem',
    background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
    boxShadow: '0 8px 20px rgba(37,99,235,0.28)', transition: 'all .16s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 10px 26px rgba(37,99,235,0.38)' },
  };
  const btnAccent = {
    ...btnPrimary,
    background: `linear-gradient(135deg, ${T.accent} 0%, #10b981 100%)`,
    boxShadow: '0 8px 20px rgba(5,150,105,0.28)',
    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 10px 26px rgba(5,150,105,0.4)' },
  };
  const btnGhost = {
    cursor: 'pointer', flex: 1, textAlign: 'center' as const,
    px: 3, py: 1.35, borderRadius: `${T.field}px`, color: T.body, fontWeight: 700, fontSize: '0.9rem',
    border: `1.5px solid ${T.line}`, bgcolor: '#fff', transition: 'all .16s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
    '&:hover': { borderColor: '#c7d2e2', bgcolor: '#f8fafc' },
  };
  const btnDanger = {
    ...btnGhost, color: T.danger, borderColor: '#fecaca',
    '&:hover': { borderColor: T.danger, bgcolor: '#fef2f2' },
  };

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(180deg, ${T.canvasTop} 0%, ${T.canvasBottom} 100%)` }}>
      <SurveyKeyframes />
      <GnTopHeaderBar
        districts={mockDistricts}
        selectedDistrict={mockDistricts.length ? 'mock-dist' : ''}
        dsDivisions={mockDs}
        selectedCity={mockDs.length ? 'mock-ds' : ''}
        gramaNiladharis={mockGns}
        selectedGN={mockGns.length ? ccode : ''}
        {...{ activeCcode: ccode, activeGnObj: gnName ? { nameEn: gnName } : null }}
      />

      {surveyStartTime && !showGpsPopup && (
        <Container maxWidth="md" sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 5, sm: 8 } }}>
          {/* Eyebrow title */}
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 2.5 }, px: 1 }}>
            <Typography
              sx={{
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: T.brand, mb: 0.75,
              }}
            >
              {L('Official Questionnaire', 'නිල ප්‍රශ්නාවලිය', 'அதிகாரப்பூர்வ கேள்வித்தாள்')}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 900, color: T.ink, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              {title}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: T.surface,
              borderRadius: { xs: '18px', sm: `${T.radius + 6}px` },
              border: `1px solid ${T.lineSoft}`,
              boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 22px 50px -20px rgba(15,23,42,0.18)',
              overflow: 'hidden',
            }}
          >
            <SurveyProgress sections={sections} current={currentStep} maxReached={maxReached} onJump={setCurrentStep} />

            <SurveyErrorContext.Provider value={{ show: showErr, errors: stepErrors }}>
              <Box sx={{ px: { xs: 2, sm: 4 }, py: { xs: 2.5, sm: 3.5 } }}>
                {/* Intro note on first step */}
                {currentStep === 0 && (
                  <Box
                    sx={{
                      display: 'flex', gap: 1.25, alignItems: 'flex-start',
                      p: 1.75, mb: 3, borderRadius: `${T.field}px`,
                      bgcolor: T.brandSofter, border: `1px solid ${T.brandSoft}`,
                    }}
                  >
                    <InfoOutlinedIcon sx={{ color: T.brand, fontSize: '1.2rem', mt: 0.1, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.82rem', color: T.body, lineHeight: 1.55 }}>{subtitle}</Typography>
                  </Box>
                )}

                {/* Validation summary banner */}
                {showErr && stepErrorCount > 0 && (
                  <Box
                    role="alert"
                    sx={{
                      display: 'flex', gap: 1.25, alignItems: 'center',
                      p: 1.5, mb: 3, borderRadius: `${T.field}px`,
                      bgcolor: '#fef2f2', border: '1px solid #fecaca',
                    }}
                  >
                    <ErrorOutlineRoundedIcon sx={{ color: T.danger, fontSize: '1.3rem', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c', lineHeight: 1.45 }}>
                      {L(
                        `Please correct ${stepErrorCount} field${stepErrorCount > 1 ? 's' : ''} before continuing.`,
                        `ඉදිරියට යාමට පෙර ක්ෂේත්‍ර ${stepErrorCount}ක් නිවැරදි කරන්න.`,
                        `தொடர்வதற்கு முன் ${stepErrorCount} புலங்களை சரிசெய்யவும்.`
                      )}
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
      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාර ස්ථානයේ නම' : language === 'ta' ? 'வணிகத்தின் பெயர்' : 'Business Location Name'} />
      <TextField fullWidth variant="outlined" size="small" value={formValues['b_name'] || ''} onChange={(e) => handleInputChange('b_name', e.target.value)} />
    </Box>

    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <QuestionLabel text={language === 'si' ? 'ව්‍යාපාර ලියාපදිංචි අංකය' : language === 'ta' ? 'வணிக பதிவு எண்' : 'Business Registration Number'} />

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
      <QuestionLabel text={language === 'si' ? 'ලිපිනය' : language === 'ta' ? 'முகவரி' : 'Address'} />
      <TextField fullWidth variant="outlined" size="small" value={formValues['b_address'] || ''} onChange={(e) => handleInputChange('b_address', e.target.value)} />
    </Box>

    <Box>
      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාර හිමියාගේ නම' : language === 'ta' ? 'உரிமையாளரின் பெயர்' : 'Business Owner Name'} />
      <TextField fullWidth variant="outlined" size="small" value={formValues['b_owner_name'] || ''} onChange={(e) => handleInputChange('b_owner_name', e.target.value)} />
    </Box>

    <Box>
      <QuestionLabel text={language === 'si' ? 'වට්ස්ඇප්/ මොබයිල් අංකය' : language === 'ta' ? 'வாட்ஸ்அப்/ மொபைல் எண்' : 'WhatsApp / Mobile Number'} />
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
      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාර වර්ගය' : language === 'ta' ? 'வணிக வகை' : 'Business Type'} />
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
      <QuestionLabel text={language === 'si' ? 'NIC' : language === 'ta' ? 'தேசிய அடையாள அட்டை' : 'NIC'} />
      <TextField fullWidth variant="outlined" size="small" value={formValues['b_nic'] || ''} onChange={(e) => handleInputChange('b_nic', e.target.value)} />
    </Box>

    <Box>
      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරයේ ඡායාරූපයක්' : language === 'ta' ? 'வணிகத்தின் புகைப்படம்' : 'Photo of the Business'} />
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
                      <QuestionLabel text={language === 'si' ? 'හිමිකරුගේ සම්පූර්ණ නම' : language === 'ta' ? 'உரிமையாளரின் முழு பெயர்' : "Owner's Full Name"} />
                      <TextField fullWidth variant="outlined" size="small" value={formValues['q_owner_name'] || ''} onChange={(e) => handleInputChange('q_owner_name', e.target.value)} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ස්ත්‍රී/පුරුෂ භාවය' : language === 'ta' ? 'பாலினம்' : 'Gender'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_gender'] || ''} onChange={(e) => handleInputChange('q_gender', e.target.value as string)}>
                          <MenuItem value="1. පිරිමි">{language === 'si' ? '1. පිරිමි' : language === 'ta' ? '1. ஆண்' : '1. Male'}</MenuItem>
                          <MenuItem value="2. ගැහැණු">{language === 'si' ? '2. ගැහැණු' : language === 'ta' ? '2. பெண்' : '2. Female'}</MenuItem>
                          <MenuItem value="3. වෙනත්">{language === 'si' ? '3. වෙනත්' : language === 'ta' ? '3. மற்றவை' : '3. Other'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය' : language === 'ta' ? 'தேசிய அடையாள அட்டை எண்' : 'National Identity Card Number (NIC)'} />
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
                      <QuestionLabel text={language === 'si' ? 'උපන් දිනය / වයස' : language === 'ta' ? 'பிறந்த தேதி / வயது' : 'Date of Birth / Age'} />
                      <TextField fullWidth variant="outlined" size="small" value={formValues['q_dob_age'] || ''} disabled sx={{ bgcolor: 'grey.100' }} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'වට්ස්ඇප් දුරකථන අංකය' : language === 'ta' ? 'வாட்ஸ்அப் எண்' : 'WhatsApp Number'} />
                      <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['q_whatsapp'] || ''} onChange={(e) => handleInputChange('q_whatsapp', e.target.value)} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ප්‍රධාන දුරකථන අංකය' : language === 'ta' ? 'முக்கிய தொலைபேசி எண்' : 'Main Phone Number'} />
                      <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['q_mobile'] || ''} onChange={(e) => handleInputChange('q_mobile', e.target.value)} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'විද්‍යුත් තැපැල් ලිපිනය (ඇත්නම්)' : language === 'ta' ? 'மின்னஞ்சல் முகவரி (ஏதேனும் இருந்தால்)' : 'Email Address (if any)'} />
                      <TextField fullWidth variant="outlined" size="small" type="email" value={formValues['q_email'] || ''} onChange={(e) => handleInputChange('q_email', e.target.value)} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'නිවැසි ලිපිනය' : language === 'ta' ? 'குடியிருப்பு முகவரி' : 'Residential Address'} />
                      <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_address'] || ''} onChange={(e) => handleInputChange('q_address', e.target.value)} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'උසස්ම අධ්‍යාපන සුදුසුකම' : language === 'ta' ? 'மிக உயர்ந்த கல்வித் தகுதி' : 'Highest Educational Qualification'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_education'] || ''} onChange={(e) => handleInputChange('q_education', e.target.value as string)}>
                          <MenuItem value="1. ප්‍රාථමික">{language === 'si' ? '1. ප්‍රාථමික' : '1. Primary'}</MenuItem>
                          <MenuItem value="2. ද්විතීයික">{language === 'si' ? '2. ද්විතීයික' : '2. Secondary'}</MenuItem>
                          <MenuItem value="3. උසස් පෙළ">{language === 'si' ? '3. උසස් පෙළ' : '3. A-Level'}</MenuItem>
                          <MenuItem value="4. ඩිප්ලෝමා">{language === 'si' ? '4. ඩිප්ලෝමා' : '4. Diploma'}</MenuItem>
                          <MenuItem value="5. උපාධිය">{language === 'si' ? '5. උපාධිය' : '5. Degree'}</MenuItem>
                          <MenuItem value="6. උපාධියට වඩා ඉහළ">{language === 'si' ? '6. උපාධියට වඩා ඉහළ' : '6. Postgraduate'}</MenuItem>
                          <MenuItem value="7. විධිමත් අධ්‍යාපනයක් නැත">{language === 'si' ? '7. විධිමත් අධ්‍යාපනයක් නැත' : '7. No formal education'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'මෙම කර්මාන්තයේ පළපුරුද්ද (වසර)' : language === 'ta' ? 'இந்தத் துறையில் அனுபவம் (ஆண்டுகள்)' : 'Experience in this Industry (Years)'} />
                      <TextField fullWidth variant="outlined" size="small" type="number" value={formValues['q_experience'] || ''} onChange={(e) => handleInputChange('q_experience', e.target.value)} />
                    </Box>

                    <Box>
                      <QuestionLabel text={language === 'si' ? 'කර්මාන්තය ආරම්භ කිරීමට පෙර රැකියාව' : language === 'ta' ? 'தொழில் தொடங்கும் முன் வேலைவாய்ப்பு' : 'Occupation before starting the industry'} />
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

                
                {currentStep === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                      {language === 'si' ? 'ව්‍යාපාරයේ නීතිමය තත්ත්වය' : language === 'ta' ? 'வணிகத்தின் சட்ட நிலை' : 'Legal Status of the Business'}
                    </Typography>
                  </Box>
                )}

                <Box key={currentStep} sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'sk-fade .3s ease both' }}>

                  {/* ─── STEP 0 · Business Owner ─────────────────────────────── */}
                  {currentStep === 0 && (<>
                    <QuestionField index="1" id="q_owner_name" required label={L("Owner's Full Name", 'හිමිකරුගේ සම්පූර්ණ නම', 'உரிமையாளரின் முழு பெயர்')}>
                      <SText value={v('q_owner_name')} onChange={(x) => set('q_owner_name', x)} />
                    </QuestionField>

                    <QuestionField index="2" id="q_gender" required label={L('Gender', 'ස්ත්‍රී/පුරුෂ භාවය', 'பாலினம்')}>
                      <Segmented value={v('q_gender')} onChange={(x) => set('q_gender', x)} options={[
                        { value: '1. පිරිමි', label: L('Male', 'පිරිමි', 'ஆண்') },
                        { value: '2. ගැහැණු', label: L('Female', 'ගැහැණු', 'பெண்') },
                        { value: '3. වෙනත්', label: L('Other', 'වෙනත්', 'மற்றவை') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="3" id="q_nic" required label={L('National Identity Card Number (NIC)', 'ජාතික හැඳුනුම්පත් අංකය', 'தேசிய அடையாள அட்டை எண்')}
                      hint={L('Date of birth and age fill in automatically.', 'උපන් දිනය හා වයස ස්වයංක්‍රීයව පිරවේ.', 'பிறந்த தேதி மற்றும் வயது தானாக நிரப்பப்படும்.')}>
                      <SText value={v('q_nic')} onChange={(x) => { set('q_nic', x); const { dob, age } = extractNICDetails(x); set('q_dob_age', dob && age ? `${dob} / ${age}` : ''); }} />
                    </QuestionField>

                    <QuestionField index="4" label={L('Date of Birth / Age', 'උපන් දිනය / වයස', 'பிறந்த தேதி / வயது')}>
                      <SText value={v('q_dob_age')} onChange={() => {}} disabled startAdornment={<CalendarTodayRoundedIcon sx={{ fontSize: '1rem', color: T.faint }} />} />
                    </QuestionField>

                    <QuestionField index="5" id="q_whatsapp" label={L('WhatsApp Number', 'වට්ස්ඇප් දුරකථන අංකය', 'வாட்ஸ்அப் எண்')}>
                      <SText value={v('q_whatsapp')} onChange={(x) => set('q_whatsapp', x)} type="tel" inputMode="tel" />
                    </QuestionField>

                    <QuestionField index="6" id="q_mobile" required label={L('Main Phone Number', 'ප්‍රධාන දුරකථන අංකය', 'முக்கிய தொலைபேசி எண்')}>
                      <SText value={v('q_mobile')} onChange={(x) => set('q_mobile', x)} type="tel" inputMode="tel" />
                    </QuestionField>

                    <QuestionField index="7" id="q_email" label={L('Email Address (if any)', 'විද්‍යුත් තැපැල් ලිපිනය (ඇත්නම්)', 'மின்னஞ்சல் முகவரி')}>
                      <SText value={v('q_email')} onChange={(x) => set('q_email', x)} type="email" inputMode="email" />
                    </QuestionField>

                    <QuestionField index="8" label={L('Residential Address', 'නිවැසි ලිපිනය', 'குடியிருப்பு முகவரி')}>
                      <SText value={v('q_address')} onChange={(x) => set('q_address', x)} multiline rows={2} />
                    </QuestionField>

                    <QuestionField index="9" label={L('Highest Educational Qualification', 'උසස්ම අධ්‍යාපන සුදුසුකම', 'மிக உயர்ந்த கல்வித் தகுதி')}>
                      <SDropdown value={v('q_education')} onChange={(x) => set('q_education', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. ප්‍රාථමික', label: L('Primary', 'ප්‍රාථමික') },
                        { value: '2. ද්විතීයික', label: L('Secondary', 'ද්විතීයික') },
                        { value: '3. උසස් පෙළ', label: L('A-Level', 'උසස් පෙළ') },
                        { value: '4. ඩිප්ලෝමා', label: L('Diploma', 'ඩිප්ලෝමා') },
                        { value: '5. උපාධිය', label: L('Degree', 'උපාධිය') },
                        { value: '6. උපාධියට වඩා ඉහළ', label: L('Postgraduate', 'උපාධියට වඩා ඉහළ') },
                        { value: '7. විධිමත් අධ්‍යාපනයක් නැත', label: L('No formal education', 'විධිමත් අධ්‍යාපනයක් නැත') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="10" id="q_experience" label={L('Experience in this Industry (Years)', 'මෙම කර්මාන්තයේ පළපුරුද්ද (වසර)', 'இந்தத் துறையில் அனுபவம் (ஆண்டுகள்)')}>
                      <SText value={v('q_experience')} onChange={(x) => set('q_experience', x)} type="number" inputMode="numeric" />
                    </QuestionField>

                    <QuestionField index="11" label={L('Occupation before starting the industry', 'කර්මාන්තය ආරම්භ කිරීමට පෙර රැකියාව', 'தொழில் தொடங்கும் முன் வேலைவாய்ப்பு')}>
                      <SText value={v('q_prev_occupation')} onChange={(x) => set('q_prev_occupation', x)} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 1 · Legal Status ───────────────────────────────── */}
                  {currentStep === 1 && (<>
                    <QuestionField index="1" id="q_legal_status" required label={L('What is the legal form of the business?', 'ව්‍යාපාරයේ නීතිමය ස්වරූපය කුමක්ද?', 'வணிகத்தின் சட்ட வடிவம் என்ன?')}>
                      <SDropdown value={v('q_legal_status')} onChange={(x) => set('q_legal_status', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. තනි හිමිකාරිත්වය', label: L('Sole Proprietorship', 'තනි හිමිකාරිත්වය') },
                        { value: '2. හවුල් ව්‍යාපාරය', label: L('Partnership', 'හවුල් ව්‍යාපාරය') },
                        { value: '3. පෞද්ගලික සමාගම (Pvt Ltd)', label: L('Private Limited (Pvt Ltd)', 'පෞද්ගලික සමාගම (Pvt Ltd)') },
                        { value: '4. පොදු සමාගම (PLC)', label: L('Public Limited (PLC)', 'පොදු සමාගම (PLC)') },
                        { value: '5. සමුපකාර සමිතිය', label: L('Cooperative Society', 'සමුපකාර සමිතිය') },
                        { value: '6. ලියාපදිංචි නොකළ ගෘහස්ථ ව්‍යාපාරය', label: L('Unregistered Home Business', 'ලියාපදිංචි නොකළ ගෘහස්ථ ව්‍යාපාරය') },
                        { value: '7. වෙනත් (සඳහන් කරන්න)', label: L('Other (Specify)', 'වෙනත් (සඳහන් කරන්න)') },
                      ]} />
                    </QuestionField>
                    {v('q_legal_status') === '7. වෙනත් (සඳහන් කරන්න)' && (
                      <QuestionField id="q_legal_status_other" required label={L('Specify other legal form', 'වෙනත් ස්වරූපය සඳහන් කරන්න', 'மற்ற வடிவத்தைக் குறிப்பிடவும்')}>
                        <SText value={v('q_legal_status_other')} onChange={(x) => set('q_legal_status_other', x)} />
                      </QuestionField>
                    )}

                    <QuestionField index="2" id="q_is_registered" required label={L('Is the business registered?', 'ව්‍යාපාරය ලියාපදිංචි කර තිබේද?', 'வணிகம் பதிவு செய்யப்பட்டுள்ளதா?')}>
                      <SDropdown value={v('q_is_registered')} onChange={(x) => set('q_is_registered', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. ඔව්', label: L('Yes', 'ඔව්', 'ஆம்') },
                        { value: '2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ', label: L('In the registration process', 'ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ') },
                        { value: '3. නැත', label: L('No', 'නැත', 'இல்லை') },
                      ]} />
                    </QuestionField>

                    {(v('q_is_registered') === '1. ඔව්' || v('q_is_registered') === '2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ') && (
                      <QuestionField index="3" id="q_registered_agencies" required label={L('If registered, with which agency?', 'ලියාපදිංචි කර ඇත්නම්, කුමන ආයතනයක් සමඟද?', 'எந்த நிறுவனத்துடன்?')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                        <ChipMultiSelect value={v('q_registered_agencies')} onChange={(x) => set('q_registered_agencies', x)} options={[
                          { value: '1. ප්‍රාදේශීය සභාව', label: L('Local Council', 'ප්‍රාදේශීය සභාව') },
                          { value: '2. ප්‍රාදේශීය ලේකම් කාර්යාලය', label: L('Divisional Secretariat', 'ප්‍රාදේශීය ලේකම් කාර්යාලය') },
                          { value: '3. සමාගම් ලියාපදිංචි කාර්යාලය', label: L('Registrar of Companies', 'සමාගම් ලියාපදිංචි කාර්යාලය') },
                          { value: '4. බදු දෙපාර්තමේන්තුව', label: L('Tax Department', 'බදු දෙපාර්තමේන්තුව') },
                          { value: '5. සමාජ සුරක්ෂිත ආයතනය', label: L('Social Security Board', 'සමාජ සුරක්ෂිත ආයතනය') },
                          { value: '6. වෙනත්', label: L('Other', 'වෙනත්') },
                        ]} />
                      </QuestionField>
                    )}
                    {(v('q_is_registered') === '1. ඔව්' || v('q_is_registered') === '2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ') && v('q_registered_agencies').includes('6. වෙනත්') && (
                      <QuestionField id="q_registered_agencies_other" required label={L('Specify other agency', 'වෙනත් ආයතනය සඳහන් කරන්න', 'மற்ற நிறுவனத்தைக் குறிப்பிடவும்')}>
                        <SText value={v('q_registered_agencies_other')} onChange={(x) => set('q_registered_agencies_other', x)} />
                      </QuestionField>
                    )}

                    {v('q_is_registered') === '1. ඔව්' && (
                      <QuestionField index="4" id="q_registration_number" required label={L('Registration Number(s)', 'ලියාපදිංචි අංක(ය)', 'பதிவு எண்(கள்)')}>
                        <SText value={v('q_registration_number')} onChange={(x) => set('q_registration_number', x)} />
                      </QuestionField>
                    )}

                    <QuestionField index="5" id="q_has_vat" required label={L('VAT Number registered?', '(VAT) අංකයක් තිබේද?', 'VAT எண் உள்ளதா?')}>
                      <Segmented value={v('q_has_vat')} onChange={(x) => set('q_has_vat', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                    {v('q_has_vat') === '1. ඔව්' && (
                      <QuestionField id="q_vat_number" required label={L('VAT Number', 'VAT අංකය', 'VAT எண்')}>
                        <SText value={v('q_vat_number')} onChange={(x) => set('q_vat_number', x)} />
                      </QuestionField>
                    )}
                  </>)}

                  {/* ─── STEP 2 · Location & Infrastructure ──────────────────── */}
                  {currentStep === 2 && (<>
                    <GroupLabel hint={L('Based on World Bank Enterprise Surveys Section C and ILO QHUEM0_1 questions.', 'World Bank Enterprise Surveys හි Section C හා ILO QHUEM0_1 ප්‍රශ්න මත පදනම් වේ.')}>
                      {L('2.1 Business Location', '2.1 ව්‍යාපාරික ස්ථානය', '2.1 வணிக இடம்')}
                    </GroupLabel>

                    <QuestionField index="1" id="q_business_location_type" required label={L('Where does the business operate?', 'ව්‍යාපාරය ක්‍රියාත්මක වන ස්ථානය කුමක්ද?', 'வணிகம் செயல்படும் இடம் எது?')}>
                      <SDropdown value={v('q_business_location_type')} onChange={(x) => set('q_business_location_type', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. නිවස තුළ (වෙනම ඉඩක් නැතිව)', label: L('Inside home (no separate space)', 'නිවස තුළ (වෙනම ඉඩක් නැතිව)') },
                        { value: '2. නිවසේ කාමරයක', label: L('In a room of the house', 'නිවසේ කාමරයක') },
                        { value: '3. නිවසේ වෙනම කොටසක/උඩුමහලේ', label: L('In a separate part/upstairs', 'නිවසේ වෙනම කොටසක/උඩුමහලේ') },
                        { value: '4. නිවසට යාබදව ඉදිකළ වෙනම ගොඩනැගිල්ලක', label: L('In an adjacent separate building', 'නිවසට යාබදව ඉදිකළ වෙනම ගොඩනැගිල්ලක') },
                        { value: '5. වෙනම ස්ථිර ස්ථානයක (කුලියට/තමන්ගේ)', label: L('Separate permanent location (rented/owned)', 'වෙනම ස්ථිර ස්ථානයක (කුලියට/තමන්ගේ)') },
                        { value: '6. වෙනත් තාවකාලික ස්ථානයක (කුටිය, කියෝස්ක්, වීදි කඩය)', label: L('Temporary location (booth, kiosk, street stall)', 'වෙනත් තාවකාලික ස්ථානයක (කුටිය, කියෝස්ක්, වීදි කඩය)') },
                        { value: '7. ගමන් කරන ව්‍යාපාරයක් (හෝකර්, පාරේ විකුණුම්)', label: L('Traveling business (hawker, street sales)', 'ගමන් කරන ව්‍යාපාරයක් (හෝකර්, පාරේ විකුණුම්)') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="2" id="q_business_address" required label={L('Business Location Address', 'ව්‍යාපාරික ස්ථානයේ ලිපිනය', 'வணிக இடத்தின் முகவரி')}>
                      <SText value={v('q_business_address')} onChange={(x) => set('q_business_address', x)} multiline rows={2} />
                    </QuestionField>

                    <QuestionField index="3" label={L('Branch Address(es) (if any)', 'ශාඛා ලිපින(ය) (ඇත්නම්)', 'கிளை முகவரி(கள்)')}>
                      <SText value={v('q_branch_address')} onChange={(x) => set('q_branch_address', x)} multiline rows={2} />
                    </QuestionField>

                    <QuestionField index="4" id="q_location_ownership" required label={L('Location Ownership', 'ස්ථානයේ හිමිකාරිත්වය', 'இடத்தின் உரிமை')}>
                      <SDropdown value={v('q_location_ownership')} onChange={(x) => set('q_location_ownership', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. තමන් සතුය', label: L('Owned', 'තමන් සතුය') },
                        { value: '2. කුලියට ගෙන ඇත', label: L('Rented', 'කුලියට ගෙන ඇත') },
                        { value: '3. නොමිලේ භාවිතා කරයි', label: L('Free to use', 'නොමිලේ භාවිතා කරයි') },
                        { value: '4. වෙනත්', label: L('Other', 'වෙනත්') },
                      ]} />
                    </QuestionField>

                    {v('q_location_ownership') === '2. කුලියට ගෙන ඇත' && (
                      <QuestionField index="5" id="q_rent_amount" required label={L('If rented, monthly rent amount', 'කුලියට ගෙන ඇත්නම්, මාසික කුලී මුදල', 'மாதாந்திர வாடகை')}>
                        <SText value={v('q_rent_amount')} onChange={(x) => set('q_rent_amount', x)} type="number" inputMode="numeric" startAdornment="LKR" />
                      </QuestionField>
                    )}

                    <QuestionField index="6" id="q_pay_building_tax" required label={L('Do you pay a tax for the building?', 'ගොඩනැගිල්ල සඳහා බද්දක් ගෙවන්නේද?', 'கட்டிடத்திற்கு வரி செலுத்துகிறீர்களா?')}>
                      <Segmented value={v('q_pay_building_tax')} onChange={(x) => set('q_pay_building_tax', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                    {v('q_pay_building_tax') === '1. ඔව්' && (
                      <QuestionField id="q_building_tax_amount" required label={L('Monthly building tax payment', 'මාසික ගොඩනැගිලි බදු ගෙවීම', 'மாதாந்திர கட்டிட வரி')}>
                        <SText value={v('q_building_tax_amount')} onChange={(x) => set('q_building_tax_amount', x)} type="number" inputMode="numeric" startAdornment="LKR" />
                      </QuestionField>
                    )}
                  </>)}

                  {/* ─── STEP 3 · Infrastructure & Services ──────────────────── */}
                  {currentStep === 3 && (<>
                    <QuestionField index="1" id="q_uses_electricity" required label={L('Do you use electricity?', 'විදුලිය භාවිතා කරන්නේද?', 'மின்சாரம் பயன்படுத்துகிறீர்களா?')}>
                      <SDropdown value={v('q_uses_electricity')} onChange={(x) => set('q_uses_electricity', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. ඔව් (ජාතික විදුලිබල මණ්ඩලයෙන්)', label: L('Yes (National Grid)', 'ඔව් (ජාතික විදුලිබල මණ්ඩලයෙන්)') },
                        { value: '2. ඔව් (සූර්ය බලයෙන්)', label: L('Yes (Solar Power)', 'ඔව් (සූර්ය බලයෙන්)') },
                        { value: '3. ඔව් (ජනක යන්ත්‍රයකින්)', label: L('Yes (Generator)', 'ඔව් (ජනක යන්ත්‍රයකින්)') },
                        { value: '4. නැත', label: L('No', 'නැත') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="2" id="q_main_energy_source" required label={L('What is the main energy source?', 'ප්‍රධාන බලශක්ති ප්‍රභවය කුමක්ද?', 'முக்கிய ஆற்றல் ஆதாரம் என்ன?')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_main_energy_source')} onChange={(x) => set('q_main_energy_source', x)} options={[
                        { value: '1. විදුලිය', label: L('Electricity', 'විදුලිය') },
                        { value: '2. ඩීසල්', label: L('Diesel', 'ඩීසල්') },
                        { value: '3. භූමිතෙල්', label: L('Kerosene', 'භූමිතෙල්') },
                        { value: '4. සූර්ය බලය', label: L('Solar', 'සූර්ය බලය') },
                        { value: '5. දර', label: L('Firewood', 'දර') },
                        { value: '6. ගෑස්', label: L('Gas', 'ගෑස්') },
                        { value: '7. වෙනත්', label: L('Other', 'වෙනත්') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="3" id="q_power_outages" label={L('Power outages per week (average)', 'සතියකට සාමාන්‍යයෙන් විදුලිය ඇනහිටීම්', 'வாரத்திற்கு மின் தடைகள்')}>
                      <SText value={v('q_power_outages')} onChange={(x) => set('q_power_outages', x)} type="number" inputMode="numeric" endAdornment={L('times', 'වාරයක්', 'முறை')} />
                    </QuestionField>

                    <QuestionField index="4" id="q_water_source" required label={L('How is water obtained?', 'ජලය ලබා ගන්නේ කෙසේද?', 'தண்ணீர் எப்படி பெறுவது?')}>
                      <SDropdown value={v('q_water_source')} onChange={(x) => set('q_water_source', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. නල ජලය', label: L('Pipe Water', 'නල ජලය') },
                        { value: '2. ළිඳකින්', label: L('Well', 'ළිඳකින්') },
                        { value: '3. උල්පතකින්', label: L('Spring', 'උල්පතකින්') },
                        { value: '4. ටැංකි රථයකින්', label: L('Water Bowser', 'ටැංකි රථයකින්') },
                        { value: '5. ගඟක්/ඇළක්', label: L('River/Stream', 'ගඟක්/ඇළක්') },
                        { value: '6. වෙනත්', label: L('Other', 'වෙනත්') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="5" id="q_water_storage" required label={L('Is there a water storage facility?', 'ජලය ගබඩා කිරීමේ පහසුකමක් තිබේද?', 'நீர் சேமிப்பு வசதி உள்ளதா?')}>
                      <Segmented value={v('q_water_storage')} onChange={(x) => set('q_water_storage', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="6" id="q_internet_access" required label={L('Is there internet access?', 'අන්තර්ජාල පහසුකම තිබේද?', 'இணைய வசதி உள்ளதா?')}>
                      <SDropdown value={v('q_internet_access')} onChange={(x) => set('q_internet_access', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={[
                        { value: '1. ඔව් (ජංගම දත්ත)', label: L('Yes (Mobile Data)', 'ඔව් (ජංගම දත්ත)') },
                        { value: '2. ඔව් (බ්‍රෝඩ්බෑන්ඩ්)', label: L('Yes (Broadband)', 'ඔව් (බ්‍රෝඩ්බෑන්ඩ්)') },
                        { value: '3. නැත', label: L('No', 'නැත') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="7" id="q_telephone_service" required label={L('Is there telephone service?', 'දුරකථන සේවාව තිබේද?', 'தொலைபேசி சேவை உள்ளதா?')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_telephone_service')} onChange={(x) => set('q_telephone_service', x)} options={[
                        { value: '1. ඔව් (ස්ථාවර)', label: L('Yes (Fixed)', 'ඔව් (ස්ථාවර)') },
                        { value: '2. ඔව් (ජංගම)', label: L('Yes (Mobile)', 'ඔව් (ජංගම)') },
                        { value: '3. නැත', label: L('No', 'නැත') },
                      ]} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 4 · Capital & Scale ────────────────────────────── */}
                  {currentStep === 4 && (<>
                    <GroupLabel>{L('3. Capital Sources', '3 වන කොටස: ප්‍රාග්ධනය', '3. மூலதன ஆதாரங்கள்')}</GroupLabel>
                    <QuestionField index="1" id="q_capital_sources" required label={L('Sources of initial capital', 'ආරම්භක ප්‍රාග්ධනය ලබාගත් මූලාශ්‍ර', 'ஆரம்ப மூலதன ஆதாரங்கள்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_capital_sources')} onChange={(x) => set('q_capital_sources', x)} options={["1. පුද්ගලික ඉතුරුම්", "2. පවුලේ/ඥාතීන්ගේ ආධාරය", "3. රජයේ ආධාරයක්/ප්‍රතිපාදනයක්", "4. බැංකු ණයක්", "5. මයික්‍රොෆයිනන්ස් ආයතනයක්", "6. රාජ්‍ය නොවන සංවිධානයක ආධාරය", "7. සමුපකාර සමිතියක්", "8. අනියම් ණයක්", "9. වෙනත්"]} />
                    </QuestionField>

                    <GroupLabel>{L('3.3 Scale & Classification', '3.3 ව්‍යාපාරික පරිමාණය හා වර්ගීකරණය', '3.3 அளவு & வகைப்பாடு')}</GroupLabel>
                    <QuestionField index="2" id="q_business_scale" required label={L('Scale of the business', 'ව්‍යාපාරයේ පරිමාණය', 'வணிக அளவு')}>
                      <SDropdown value={v('q_business_scale')} onChange={(x) => set('q_business_scale', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ක්ෂුද්‍ර (මයික්‍රො)", "2. කුඩා (සුළු)", "3. මධ්‍යම", "4. විශාල (මහා)"]} />
                    </QuestionField>

                    <QuestionField index="3" id="q_engagement_nature" required label={L('Nature of business engagement', 'ව්‍යාපාරයේ නියැලීමේ ස්වභාවය', 'வணிக ஈடுபாட்டின் தன்மை')}>
                      <SDropdown value={v('q_engagement_nature')} onChange={(x) => set('q_engagement_nature', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. කලාතුරකින් කරන (වාරික)", "2. මාසයකට දින කිහිපයක්", "3. සතියකට දින කිහිපයක්", "4. දිනපතා", "5. වාරයේ", "6. වාර්ෂික"]} />
                    </QuestionField>

                    <QuestionField index="4" id="q_business_place" required label={L('Place where business is conducted', 'ව්‍යාපාරය සිදුකරන ස්ථානය', 'வணிகம் நடத்தப்படும் இடம்')}>
                      <SDropdown value={v('q_business_place')} onChange={(x) => set('q_business_place', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. නිවසේ", "2. නිවසේ කාමරයක", "3. නිවසේ වෙනම කොටසක", "4. වෙනම තාවකාලික ස්ථානයක", "5. වෙනම ස්ථිර ස්ථානයක"]} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 5 · Workforce ──────────────────────────────────── */}
                  {currentStep === 5 && (<>
                    <GroupLabel>{L('4.1 Workforce Composition', '4.1 ශ්‍රම බලකායේ සංයුතිය', '4.1 தொழிலாளர் அமைப்பு')}</GroupLabel>
                    {([
                      ['q_total_workers', L('Total persons working (including you)', '4.1.1 මුළු පුද්ගලයින් සංඛ්‍යාව (ඔබ ඇතුළුව)', 'மொத்த நபர்கள் (நீங்கள் உட்பட)'), true],
                      ['q_female_workers', L('Number of women', '4.1.2 ඉන් කාන්තාවන් සංඛ්‍යාව', 'பெண்கள் எண்ணிக்கை'), false],
                      ['q_male_workers', L('Number of men', '4.1.3 ඉන් පිරිමි සංඛ්‍යාව', 'ஆண்கள் எண்ணிக்கை'), false],
                      ['q_paid_workers', L('Number of paid employees', '4.1.4 ගෙවන සේවකයින් සංඛ්‍යාව', 'ஊதியம் பெறுவோர்'), false],
                      ['q_unpaid_family_workers', L('Unpaid family members', '4.1.5 වැටුප් නොලබන පවුලේ සාමාජිකයින්', 'ஊதியமற்ற குடும்ப உறுப்பினர்கள்'), false],
                      ['q_contract_workers', L('Occasional / contract workers', '4.1.6 වරින් වර/කොන්ත්‍රාත් සේවකයින්', 'ஒப்பந்த தொழிலாளர்கள்'), false],
                    ] as [string, string, boolean][]).map(([id, label, req], i) => (
                      <QuestionField key={id} index={i + 1} id={id} required={req} label={label}>
                        <SText value={v(id)} onChange={(x) => set(id, x)} type="number" inputMode="numeric" endAdornment={L('persons', 'දෙනා', 'நபர்கள்')} />
                      </QuestionField>
                    ))}

                    <GroupLabel>{L('4.2 Labour & Welfare', '4.2 ශ්‍රමය හා සුබසාධනය', '4.2 தொழிலாளர் நலன்')}</GroupLabel>
                    <QuestionField index="7" id="q_labor_contribution" required label={L('Nature of labour contribution', 'ශ්‍රම දායකත්වයේ ස්වභාවය', 'தொழிலாளர் பங்களிப்பின் தன்மை')}>
                      <SDropdown value={v('q_labor_contribution')} onChange={(x) => set('q_labor_contribution', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. තනියෙන්ම", "2. පවුලේ ශ්‍රමය පමණක්", "3. පවුලේ ශ්‍රමය + වරින් වර කුලියට", "4. ස්ථිර සේවකයින් (1-2)", "5. ස්ථිර සේවකයින් (3-5)", "6. ස්ථිර සේවකයින් (6-10)", "7. ස්ථිර සේවකයින් (11-25)", "8. ස්ථිර සේවකයින් (25 ට වැඩි)"]} />
                    </QuestionField>

                    <QuestionField index="8" id="q_provides_training" required label={L('Is training provided to employees?', 'සේවකයින්ට පුහුණුව ලබා දෙනවාද?', 'பயிற்சி வழங்கப்படுகிறதா?')}>
                      <SDropdown value={v('q_provides_training')} onChange={(x) => set('q_provides_training', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ඔව් (විධිමත්)", "2. ඔව් (රැකියාවේදී)", "3. නැත"]} />
                    </QuestionField>

                    <QuestionField index="9" id="q_pays_epf" required label={L('Are EPF payments made for employees?', 'සේවකයින් සඳහා EPF ගෙවීම් සිදු කරනවාද?', 'EPF செலுத்தப்படுகிறதா?')}>
                      <Segmented value={v('q_pays_epf')} onChange={(x) => set('q_pays_epf', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 6 · Production & Operations ─────────────────────── */}
                  {currentStep === 6 && (<>
                    <GroupLabel>{L('5.1 Machinery & Tools', '5.1 යන්ත්‍ර හා මෙවලම්', '5.1 இயந்திரங்கள்')}</GroupLabel>
                    <QuestionField index="1" label={L('Main machinery used (max 5)', '5.1.1 භාවිතා කරන ප්‍රධාන යන්ත්‍රෝපකරණ (උපරිම 5)', 'முக்கிய இயந்திரங்கள்')}>
                      <UploadField value={v('q_main_machinery')} onFiles={(f) => set('q_main_machinery', Array.from(f).map((x) => x.name).join(', '))} label={L('Upload photos', 'ඡායාරූප උඩුගත කරන්න', 'படங்களைப் பதிவேற்று')} />
                    </QuestionField>

                    <QuestionField index="2" label={L('Main tools used (max 5)', '5.1.2 භාවිතා කරන ප්‍රධාන මෙවලම් (උපරිම 5)', 'முக்கிய கருவிகள்')}>
                      <UploadField value={v('q_main_tools')} onFiles={(f) => set('q_main_tools', Array.from(f).map((x) => x.name).join(', '))} label={L('Upload photos', 'ඡායාරූප උඩුගත කරන්න', 'படங்களைப் பதிவேற்று')} />
                    </QuestionField>

                    <QuestionField index="3" id="q_machinery_value" label={L('Approximate value of machinery', '5.1.3 යන්ත්‍රෝපකරණවල ආසන්න වටිනාකම', 'இயந்திர மதிப்பு')}>
                      <SText value={v('q_machinery_value')} onChange={(x) => set('q_machinery_value', x)} type="number" inputMode="numeric" endAdornment={L('LKR', 'රු.')} />
                    </QuestionField>

                    <QuestionField index="4" label={L('How machinery was acquired', '5.1.4 යන්ත්‍රෝපකරණ ලබාගත් ආකාරය', 'இயந்திரம் பெறப்பட்ட முறை')}>
                      <ChipMultiSelect value={v('q_machinery_source')} onChange={(x) => set('q_machinery_source', x)} options={["1. මිලදී ගත්තා", "2. කුලියට ගත්තා", "3. තනිවම සාදා ගත්තා", "4. තෑග්ගක් ලෙස ලැබුණා", "5. රජයෙන් ලැබුණා", "6. වෙනත්"]} />
                    </QuestionField>

                    <GroupLabel>{L('5.2 Production Volume', '5.2 නිෂ්පාදන පරිමාව', '5.2 உற்பத்தி அளவு')}</GroupLabel>
                    {([
                      ['q_production_daily', L('Produced per day', '5.2.1 දිනකට නිෂ්පාදනය', 'நாள்'), L('units', 'ඒකක', 'அலகுகள்')],
                      ['q_production_weekly', L('Produced per week', '5.2.2 සතියකට නිෂ්පාදනය', 'வாரம்'), L('units', 'ඒකක', 'அலகுகள்')],
                      ['q_production_monthly', L('Produced per month', '5.2.3 මාසයකට නිෂ්පාදනය', 'மாதம்'), L('units', 'ඒකක', 'அலகுகள்')],
                      ['q_production_yearly', L('Annual production (estimate)', '5.2.4 වාර්ෂික නිෂ්පාදනය (ඇස්තමේන්තුව)', 'ஆண்டு'), L('units', 'ඒකක', 'அலகுகள்')],
                      ['q_production_capacity', L('Capacity utilisation', '5.2.5 නිෂ්පාදන ධාරිතාවයේ භාවිත ප්‍රතිශතය', 'திறன் பயன்பாடு'), '%'],
                      ['q_operating_hours', L('Operating hours per day', '5.2.6 දිනකට මෙහෙයුම් පැය', 'செயல்பாட்டு நேரம்'), L('hrs', 'පැය', 'மணி')],
                    ] as [string, string, string][]).map(([id, label, unit], i) => (
                      <QuestionField key={id} index={i + 5} id={id} label={label}>
                        <SText value={v(id)} onChange={(x) => set(id, x)} type="number" inputMode="numeric" endAdornment={unit} />
                      </QuestionField>
                    ))}

                    <GroupLabel>{L('5.3 Raw Materials', '5.3 අමුද්‍රව්‍ය', '5.3 மூலப்பொருட்கள்')}</GroupLabel>
                    <QuestionField index="11" label={L('Main raw materials used (max 5)', '5.3.1 භාවිතා කරන ප්‍රධාන අමුද්‍රව්‍ය (උපරිම 5)', 'முக்கிய மூலப்பொருட்கள்')}>
                      <UploadField value={v('q_main_materials')} onFiles={(f) => set('q_main_materials', Array.from(f).map((x) => x.name).join(', '))} label={L('Upload photos', 'ඡායාරූප උඩුගත කරන්න', 'படங்களைப் பதிவேற்று')} />
                    </QuestionField>

                    <QuestionField index="12" id="q_material_sources" required label={L('How raw materials are sourced', '5.3.2 අමුද්‍රව්‍ය සපයා ගන්නා ආකාරය', 'மூலப்பொருள் ஆதாரம்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_material_sources')} onChange={(x) => set('q_material_sources', x)} options={["1. තම ඉඩමෙන්ම", "2. ප්‍රදේශයෙන් නොමිලේ", "3. ප්‍රදේශයෙන් මුදලට", "4. නගරයෙන් මිලදී ගනී", "5. කොළඹින් මිලදී ගනී", "6. විදෙස් රටකින් ආනයනය", "7. බෙදාහරින්නෙකුගෙන්"]} />
                    </QuestionField>

                    <QuestionField index="13" id="q_material_license_req" required label={L('Is a licence required for raw materials?', '5.3.3 අමුද්‍රව්‍ය සඳහා බලපත්‍රයක් අවශ්‍යද?', 'உரிமம் தேவையா?')}>
                      <Segmented value={v('q_material_license_req')} onChange={(x) => set('q_material_license_req', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    {v('q_material_license_req') === '1. ඔව්' && (
                      <QuestionField index="14" id="q_material_license_agency" required label={L('If required, from which agency?', '5.3.4 බලපත්‍රය අවශ්‍ය නම් කුමන ආයතනයෙන්ද?', 'எந்த நிறுவனத்திடமிருந்து?')}>
                        <SDropdown value={v('q_material_license_agency')} onChange={(x) => set('q_material_license_agency', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. පොලීසියෙන්", "2. ප්‍රාදේශීය ලේකම් කාර්යාලයෙන්", "3. මධ්‍යම රජයෙන්", "4. වෙනත්"]} />
                      </QuestionField>
                    )}

                    <QuestionField index="15" id="q_material_cost" label={L('Monthly cost for raw materials', '5.3.5 අමුද්‍රව්‍ය සඳහා මාසික වියදම', 'மாதாந்திர செலவு')}>
                      <SText value={v('q_material_cost')} onChange={(x) => set('q_material_cost', x)} type="number" inputMode="numeric" endAdornment={L('LKR', 'රු.')} />
                    </QuestionField>

                    <GroupLabel>{L('5.4 Waste Management', '5.4 අපද්‍රව්‍ය කළමනාකරණය', '5.4 கழிவு மேலாண்மை')}</GroupLabel>
                    <QuestionField index="16" id="q_waste_disposal" required label={L('How is waste disposed of?', '5.4.1 අපද්‍රව්‍ය බැහැර කරන ආකාරය', 'கழிவு அகற்றல்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_waste_disposal')} onChange={(x) => set('q_waste_disposal', x)} options={["1. ස්ථානයේම ප්‍රතිචක්‍රීකරණය කරයි", "2. වෙනත් ස්ථානයකට ගෙන ගොස් බැහැර කරයි", "3. පළාත් පාලන ආයතනයට ලබා දෙයි", "4. පුළුස්සා දමයි", "5. වළලමින් බැහැර කරයි", "6. වෙනත්"]} />
                    </QuestionField>

                    <QuestionField index="17" id="q_waste_recycled" required label={L('Is waste recycled?', '5.4.2 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණය කරනවාද?', 'கழிவு மறுசுழற்சி?')}>
                      <Segmented value={v('q_waste_recycled')} onChange={(x) => set('q_waste_recycled', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="18" id="q_waste_income" required label={L('Is income earned from recycling?', '5.4.3 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණයෙන් ආදායමක් ලැබේද?', 'மறுசுழற்சியில் வருமானம்?')}>
                      <Segmented value={v('q_waste_income')} onChange={(x) => set('q_waste_income', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 7 · Finance & Accounting ───────────────────────── */}
                  {currentStep === 7 && (<>
                    <QuestionField index="1" id="q_profit_calculated" required label={L('Has profit been calculated?', '6.1.1 ලාභය ගණනය කර තිබේද?', 'லாபம் கணக்கிடப்பட்டதா?')}>
                      <Segmented value={v('q_profit_calculated')} onChange={(x) => set('q_profit_calculated', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                    {v('q_profit_calculated') === '1. ඔව්' && (
                      <QuestionField id="q_profit_percentage" required label={L('Profit percentage', 'ලාභ ප්‍රතිශතය', 'லாப சதவீதம்')}>
                        <SText value={v('q_profit_percentage')} onChange={(x) => set('q_profit_percentage', x)} type="number" inputMode="numeric" endAdornment="%" />
                      </QuestionField>
                    )}

                    <QuestionField index="2" id="q_cost_calculated" required label={L('Has unit production cost been calculated?', '6.1.2 ඒකක නිෂ්පාදන පිරිවැය ගණනය කර තිබේද?', 'அலகு செலவு கணக்கிடப்பட்டதா?')}>
                      <Segmented value={v('q_cost_calculated')} onChange={(x) => set('q_cost_calculated', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                    {v('q_cost_calculated') === '1. ඔව්' && (
                      <QuestionField id="q_unit_cost" required label={L('Cost per unit', 'එක් ඒකකයක පිරිවැය', 'ஒரு அலகு செலவு')}>
                        <SText value={v('q_unit_cost')} onChange={(x) => set('q_unit_cost', x)} type="number" inputMode="numeric" endAdornment={L('LKR', 'රු.')} />
                      </QuestionField>
                    )}

                    {([
                      ['q_monthly_income', L('Monthly income (approx.)', '6.1.3 මාසික ආදායම (ආසන්න)', 'மாத வருமானம்')],
                      ['q_monthly_expense', L('Monthly expenses (approx.)', '6.1.4 මාසික වියදම (ආසන්න)', 'மாத செலவு')],
                      ['q_monthly_net_profit', L('Monthly net profit (approx.)', '6.1.5 මාසික ශුද්ධ ලාභය (ආසන්න)', 'நிகர லாபம்')],
                    ] as [string, string][]).map(([id, label], i) => (
                      <QuestionField key={id} index={i + 3} id={id} label={label}>
                        <SText value={v(id)} onChange={(x) => set(id, x)} type="number" inputMode="numeric" endAdornment={L('LKR', 'රු.')} />
                      </QuestionField>
                    ))}

                    <QuestionField index="6" id="q_profitable" required label={L('Is the business run profitably?', '6.1.6 ව්‍යාපාරය ලාභ සහිතව කරගෙන යනවාද?', 'லாபகரமாக நடத்தப்படுகிறதா?')}>
                      <Segmented value={v('q_profitable')} onChange={(x) => set('q_profitable', x)} columns={3} options={[
                        { value: '1. ඔව්', label: L('Yes', 'ඔව්', 'ஆம்') },
                        { value: '2. නැත', label: L('No', 'නැත', 'இல்லை') },
                        { value: '3. සමහර විට', label: L('Sometimes', 'සමහර විට', 'சில நேரம்') },
                      ]} />
                    </QuestionField>

                    {([
                      ['q_loan_installment', L('Monthly loan instalment', '6.1.7 ණය ගෙවීමේ වාරික (මාසික)', 'கடன் தவணை')],
                      ['q_total_loan', L('Total business loan payable', '6.1.8 ගෙවිය යුතු මුළු ණය ප්‍රමාණය', 'மொத்த கடன்')],
                      ['q_personal_loan', L('Personal debt (for the business)', '6.1.9 පුද්ගලිකව ණය වී ඇති ප්‍රමාණය', 'தனிப்பட்ட கடன்')],
                    ] as [string, string][]).map(([id, label], i) => (
                      <QuestionField key={id} index={i + 7} id={id} label={label}>
                        <SText value={v(id)} onChange={(x) => set(id, x)} type="number" inputMode="numeric" endAdornment={L('LKR', 'රු.')} />
                      </QuestionField>
                    ))}

                    <GroupLabel>{L('6.2 Financial Management', '6.2 මූල්‍ය කළමනාකරණය', '6.2 நிதி மேலாண்மை')}</GroupLabel>
                    <QuestionField index="10" id="q_bank_account" required label={L('Is there a bank account for the business?', '6.2.1 ව්‍යාපාරය සඳහා බැංකු ගිණුමක් තිබේද?', 'வங்கிக் கணக்கு உள்ளதா?')}>
                      <SDropdown value={v('q_bank_account')} onChange={(x) => set('q_bank_account', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ඔව්", "2. නැත, පුද්ගලික ගිණුම භාවිතා කරයි", "3. ගිණුමක් නැත"]} />
                    </QuestionField>
                    {v('q_bank_account') === '1. ඔව්' && (
                      <QuestionField id="q_bank_name" required label={L('Bank name', 'බැංකුව', 'வங்கி பெயர்')}>
                        <SText value={v('q_bank_name')} onChange={(x) => set('q_bank_name', x)} />
                      </QuestionField>
                    )}

                    <QuestionField index="11" id="q_financial_records" required label={L('Are financial records kept?', '6.2.2 මූල්‍ය වාර්තා තබා ගන්නේද?', 'நிதி பதிவுகள் வைக்கப்படுகிறதா?')}>
                      <SDropdown value={v('q_financial_records')} onChange={(x) => set('q_financial_records', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ඔව්, විධිමත්ව", "2. ඔව්, සරලව (පොතක)", "3. නැත"]} />
                    </QuestionField>

                    <QuestionField index="12" id="q_receives_salary" required label={L('Does the owner draw a salary from the business?', '6.2.3 හිමිකරු ව්‍යාපාරයෙන් වැටුපක් ලබා ගන්නේද?', 'உரிமையாளர் சம்பளம் பெறுகிறாரா?')}>
                      <SDropdown value={v('q_receives_salary')} onChange={(x) => set('q_receives_salary', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ඔව්", "2. නැත, ලාභය පමණයි", "3. නැත, මුදල් අවශ්‍ය විට ලබා ගනී"]} />
                    </QuestionField>

                    <QuestionField index="13" id="q_knows_financial_concepts" required label={L('Do you know the difference between profit, income and expense?', '6.2.4 ලාභය, ආදායම සහ වියදම අතර වෙනස දන්නවාද?', 'லாபம், வருமானம், செலவு வேறுபாடு தெரியுமா?')}>
                      <Segmented value={v('q_knows_financial_concepts')} onChange={(x) => set('q_knows_financial_concepts', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 8 · Market & Marketing ─────────────────────────── */}
                  {currentStep === 8 && (<>
                    <QuestionField index="1" id="q_customers" required label={L('Who are the main buyers?', '7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?', 'முக்கிய வாங்குபவர்கள்?')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_customers')} onChange={(x) => set('q_customers', x)} options={["1. ප්‍රදේශයේ පාරිභෝගිකයින්", "2. ප්‍රදේශයෙන් පිටත පාරිභෝගිකයින්", "3. වෙනත් ව්‍යාපාරිකයින් (B2B)", "4. අතරමැදියන්/තොග වෙළඳුන්", "5. රජයේ ආයතන", "6. අපනයනය සඳහා"]} />
                    </QuestionField>

                    <QuestionField index="2" id="q_market_extent" required label={L('Market reach', '7.1.2 වෙළඳපොළේ පැතිරීම', 'சந்தை வ்யாப்தி')}>
                      <SDropdown value={v('q_market_extent')} onChange={(x) => set('q_market_extent', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ගමට පමණයි", "2. ප්‍රාදේශීය ලේකම් කොට්ඨාසයට", "3. දිස්ත්‍රික්කයට", "4. පළාතට", "5. රට පුරා", "6. ජාත්‍යන්තර"]} />
                    </QuestionField>

                    <QuestionField index="3" id="q_customer_trend" required label={L('Customer trend', '7.1.3 පාරිභෝගිකයින්ගේ ප්‍රවණතාවය', 'வாடிக்கையாளர் போக்கு')}>
                      <Segmented value={v('q_customer_trend')} onChange={(x) => set('q_customer_trend', x)} columns={3} options={[
                        { value: '1. වැඩි වෙමින් පවතී', label: L('Increasing', 'වැඩි වෙමින්', 'அதிகரிக்கிறது') },
                        { value: '2. අඩු වෙමින් පවතී', label: L('Decreasing', 'අඩු වෙමින්', 'குறைகிறது') },
                        { value: '3. වෙනසක් නැත', label: L('No change', 'වෙනසක් නැත', 'மாற்றமில்லை') },
                      ]} />
                    </QuestionField>

                    <QuestionField index="4" id="q_has_competitors" required label={L('Are there competitors?', '7.2.1 තරඟකරුවන් සිටීද?', 'போட்டியாளர்கள் உள்ளனரா?')}>
                      <SDropdown value={v('q_has_competitors')} onChange={(x) => set('q_has_competitors', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. ඔව්, බොහෝ දෙනෙක්", "2. ඔව්, කීප දෙනෙක්", "3. නැත"]} />
                    </QuestionField>

                    {(v('q_has_competitors') === '1. ඔව්, බොහෝ දෙනෙක්' || v('q_has_competitors') === '2. ඔව්, කීප දෙනෙක්') && (
                      <QuestionField index="5" id="q_competitor_influence" required label={L('Influence from competitors', '7.2.2 තරඟකරුවන්ගෙන් වන බලපෑම', 'போட்டி தாக்கம்')}>
                        <SDropdown value={v('q_competitor_influence')} onChange={(x) => set('q_competitor_influence', x)} placeholder={L('Select', 'තෝරන්න', 'தேர்வு')} options={["1. විශාලයි", "2. මධ්‍යමයි", "3. අඩුයි", "4. බලපෑමක් නැත"]} />
                      </QuestionField>
                    )}

                    <QuestionField index="6" id="q_marketing_methods" required label={L('Marketing methods', '7.3.1 අලෙවිකරණ ක්‍රම', 'சந்தைப்படுத்தல் முறைகள்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_marketing_methods')} onChange={(x) => set('q_marketing_methods', x)} options={["1. පෝස්ටර්/බැනර්", "2. සමාජ මාධ්‍ය (Facebook, WhatsApp)", "3. වෙබ් අඩවියක් මගින්", "4. මුද්‍රිත මාධ්‍ය (පුවත්පත්)", "5. රූපවාහිනී/ගුවන් විදුලි", "6. පාරිභෝගිකයින්ගේ දැනුම්දීම (Word of mouth)", "7. ප්‍රදර්ශන/පොළවල්", "8. අලෙවිකරණයක් නොකරයි"]} />
                    </QuestionField>

                    <QuestionField index="7" id="q_has_brand" required label={L('Is there a brand for the products?', '7.3.2 භාණ්ඩ සඳහා වෙළඳ නාමයක් (Brand) තිබේද?', 'தயாரிப்புகளுக்கு பிராண்ட் உள்ளதா?')}>
                      <Segmented value={v('q_has_brand')} onChange={(x) => set('q_has_brand', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 9 · Innovation & Technology ─────────────────────── */}
                  {currentStep === 9 && (<>
                    <QuestionField index="1" id="q_new_products" required label={L('Introduced new products/services in the last 3 years?', '8.1.1 පසුගිය වසර 3 තුළ නව නිෂ්පාදන/සේවා හඳුන්වා දුන්නේද?', 'கடந்த 3 ஆண்டுகளில் புதிய தயாரிப்புகள்?')}>
                      <Segmented value={v('q_new_products')} onChange={(x) => set('q_new_products', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="2" id="q_new_tech" required label={L('Used new technology in the last 3 years?', '8.1.2 පසුගිය වසර 3 තුළ නව තාක්ෂණයක් භාවිතා කළේද?', 'புதிய தொழில்நுட்பம் பயன்படுத்தினீர்களா?')}>
                      <Segmented value={v('q_new_tech')} onChange={(x) => set('q_new_tech', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="3" id="q_tech_devices" required label={L('Technology devices used', '8.2.1 භාවිතා කරන තාක්ෂණික උපකරණ', 'பயன்படுத்தும் தொழில்நுட்ப சாதனங்கள்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_tech_devices')} onChange={(x) => set('q_tech_devices', x)} options={["1. ස්මාර්ට් දුරකථනය", "2. පරිගණකය/ලැප්ටොප්", "3. අන්තර්ජාල පහසුකම්", "4. කිසිවක් නැත"]} />
                    </QuestionField>

                    <QuestionField index="4" id="q_uses_internet_for_business" required label={L('Is the internet used for business activities?', '8.2.2 අන්තර්ජාලය ව්‍යාපාරික කටයුතු සඳහා භාවිතා කරන්නේද?', 'வணிகத்திற்கு இணையம் பயன்படுத்தப்படுகிறதா?')}>
                      <Segmented value={v('q_uses_internet_for_business')} onChange={(x) => set('q_uses_internet_for_business', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="5" id="q_digital_payments" required label={L('Are digital payment methods used?', '8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරන්නේද?', 'டிஜிட்டல் கட்டணங்கள் பயன்படுத்தப்படுகிறதா?')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_digital_payments')} onChange={(x) => set('q_digital_payments', x)} options={["1. ඔව් (බැංකු හරහා - Online Banking)", "2. ඔව් (LankaQR / Mobile Wallets)", "3. කාඩ්පත් මගින් (POS)", "4. නැත, මුදල් (Cash) පමණයි"]} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 10 · Business Environment & Government ──────────── */}
                  {currentStep === 10 && (<>
                    <QuestionField index="1" id="q_reg_certificates" required label={L('Registration certificates held', '9.1.1 ව්‍යාපාරය සතු ලියාපදිංචි සහතික', 'பதிவு சான்றிதழ்கள்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_reg_certificates')} onChange={(x) => set('q_reg_certificates', x)} options={["1. ප්‍රාදේශීය ලේකම් ලියාපදිංචිය (BR)", "2. සමාගම් මැදුරේ ලියාපදිංචිය", "3. පළාත් සභා/ප්‍රාදේශීය සභා අනුමැතිය", "4. පරිසර ආරක්ෂණ බලපත්‍රය (EPL)", "5. සෞඛ්‍ය වෛද්‍ය නිලධාරී (MOH) සහතිකය", "6. ප්‍රමිති ආයතනයේ සහතිකය (SLSI)", "7. අපනයන සංවර්ධන මණ්ඩලයේ (EDB) ලියාපදිංචිය", "8. වෙනත්", "9. කිසිවක් නැත"]} />
                    </QuestionField>

                    <QuestionField index="2" id="q_taxes_paid" required label={L('Types of taxes paid', '9.1.2 ගෙවන බදු වර්ග', 'செலுத்தும் வரி வகைகள்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_taxes_paid')} onChange={(x) => set('q_taxes_paid', x)} options={["1. ආදායම් බදු", "2. එකතු කළ අගය මත බදු (VAT)", "3. ප්‍රාදේශීය සභා බදු", "4. කිසිවක් නැත"]} />
                    </QuestionField>

                    <QuestionField index="3" id="q_gov_support_received" required label={L('Support received from government', '9.2.1 රජයෙන් ලැබී ඇති සහාය', 'அரசு உதவி')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_gov_support_received')} onChange={(x) => set('q_gov_support_received', x)} options={["1. මූල්‍ය ආධාර (ණය/ප්‍රතිපාදන)", "2. පුහුණු වැඩසටහන්", "3. උපදේශන සේවා", "4. අමුද්‍රව්‍ය/උපකරණ", "5. ප්‍රදර්ශන සඳහා අවස්ථා", "6. කිසිදු සහායක් ලැබී නැත"]} />
                    </QuestionField>

                    <GroupLabel hint={L('1 = Not a barrier, 5 = A very large barrier', '1=බාධකයක් නොවේ, 5=ඉතා විශාල බාධකයක්', '1 = தடையில்லை, 5 = பெரிய தடை')}>
                      {L('9.3 Barriers in the Business Environment', '9.3 ව්‍යාපාරික පරිසරයේ බාධක', '9.3 வணிக சூழல் தடைகள்')}
                    </GroupLabel>
                    {([
                      ['q_barrier_finance', L('Access to finance', 'මූල්‍ය පහසුකම් ලබා ගැනීම', 'நிதி அணுகல்')],
                      ['q_barrier_infrastructure', L('Infrastructure (electricity/water)', 'යටිතල පහසුකම් (විදුලිය/ජලය)', 'உள்கட்டமைப்பு')],
                      ['q_barrier_taxes', L('Tax rates', 'බදු අනුපාත', 'வரி விகிதங்கள்')],
                      ['q_barrier_labor', L('Finding skilled workers', 'පුහුණු ශ්‍රමිකයින් සොයා ගැනීම', 'திறமையான தொழிலாளர்')],
                      ['q_barrier_laws', L('Laws & regulatory procedures', 'නීති හා රෙගුලාසි ක්‍රියා පටිපාටිය', 'சட்டங்கள் & ஒழுங்குமுறை')],
                    ] as [string, string][]).map(([id, label], i) => (
                      <QuestionField key={id} index={i + 4} id={id} required label={label}>
                        <RatingScale value={v(id)} onChange={(x) => set(id, x)} lowLabel={L('No barrier', 'බාධකයක් නොවේ', 'தடையில்லை')} highLabel={L('Very large', 'ඉතා විශාල', 'மிகப் பெரிய')} />
                      </QuestionField>
                    ))}
                  </>)}

                  {/* ─── STEP 11 · Environmental & Social ─────────────────────── */}
                  {currentStep === 11 && (<>
                    <QuestionField index="1" id="q_env_impact_assessed" required label={L('Has environmental impact been assessed?', '10.1.1 පරිසරයට වන බලපෑම තක්සේරු කර තිබේද?', 'சுற்றுச்சூழல் தாக்கம் மதிப்பிடப்பட்டதா?')}>
                      <Segmented value={v('q_env_impact_assessed')} onChange={(x) => set('q_env_impact_assessed', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="2" id="q_energy_saving" required label={L('Steps taken to save energy/water?', '10.1.2 බලශක්තිය/ජලය ඉතිරි කිරීමට පියවර ගෙන තිබේද?', 'ஆற்றல்/நீர் சேமிப்பு நடவடிக்கை?')}>
                      <Segmented value={v('q_energy_saving')} onChange={(x) => set('q_energy_saving', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>

                    <QuestionField index="3" id="q_social_responsibility" required label={L('Do you carry out CSR for the community?', '10.2.1 ප්‍රජාව වෙනුවෙන් සමාජ සත්කාර (CSR) සිදු කරන්නේද?', 'சமூகப் பொறுப்பு (CSR) செய்கிறீர்களா?')}>
                      <Segmented value={v('q_social_responsibility')} onChange={(x) => set('q_social_responsibility', x)} options={yn('1. ඔව්', '2. නැත')} />
                    </QuestionField>
                  </>)}

                  {/* ─── STEP 12 · Future Needs & Logistics ───────────────────── */}
                  {currentStep === 12 && (<>
                    <QuestionField index="1" id="q_business_expansion" required label={L('Plans to develop the business', '11.1.1 ව්‍යාපාරය දියුණු කිරීමට ඇති සැලසුම්', 'வணிக வளர்ச்சி திட்டங்கள்')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_business_expansion')} onChange={(x) => set('q_business_expansion', x)} options={["1. නව නිෂ්පාදන/සේවා හඳුන්වා දීම", "2. නිෂ්පාදන ධාරිතාව වැඩි කිරීම", "3. නව වෙළඳපොළවල් සෙවීම (අපනයනය ඇතුළුව)", "4. නව තාක්ෂණය/යන්ත්‍රෝපකරණ මිලදී ගැනීම", "5. ශාඛා විවෘත කිරීම", "6. සැලසුමක් නැත"]} />
                    </QuestionField>

                    <QuestionField index="2" id="q_expected_gov_support" required label={L('Support expected from government or other agencies', '11.1.2 රජයෙන් හෝ වෙනත් ආයතන වලින් බලාපොරොත්තු වන සහාය', 'எதிர்பார்க்கும் உதவி')} hint={L('Select all that apply.', 'අදාළ සියල්ල තෝරන්න.')}>
                      <ChipMultiSelect value={v('q_expected_gov_support')} onChange={(x) => set('q_expected_gov_support', x)} options={["1. අඩු පොලී ණය", "2. නව තාක්ෂණික උපකරණ/අමුද්‍රව්‍ය", "3. ව්‍යාපාරික පුහුණුව/උපදේශනය", "4. අලෙවි පහසුකම්/වෙළඳපොළ සෙවීම", "5. ඉඩම්/යටිතල පහසුකම්", "6. නීතිමය ගැටළු විසඳීම", "7. වෙනත්"]} />
                    </QuestionField>

                    <QuestionField index="3" label={L('Other comments / suggestions', 'වෙනත් අදහස්/යෝජනා', 'பிற கருத்துகள்')}>
                      <SText value={v('q_additional_comments')} onChange={(x) => set('q_additional_comments', x)} multiline rows={3} />
                    </QuestionField>
                  </>)}

                  <StepNav />
                </Box>
                    {/* Legal Status */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරයේ නීතිමය ස්වරූපය කුමක්ද?' : language === 'ta' ? 'வணிகத்தின் சட்ட வடிவம் என்ன?' : 'What is the legal form of the business?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_legal_status'] || ''} onChange={(e) => handleInputChange('q_legal_status', e.target.value as string)}>
                          <MenuItem value="1. තනි හිමිකාරිත්වය">{language === 'si' ? '1. තනි හිමිකාරිත්වය' : '1. Sole Proprietorship'}</MenuItem>
                          <MenuItem value="2. හවුල් ව්‍යාපාරය">{language === 'si' ? '2. හවුල් ව්‍යාපාරය' : '2. Partnership'}</MenuItem>
                          <MenuItem value="3. පෞද්ගලික සමාගම (Pvt Ltd)">{language === 'si' ? '3. පෞද්ගලික සමාගම (Pvt Ltd)' : '3. Private Limited (Pvt Ltd)'}</MenuItem>
                          <MenuItem value="4. පොදු සමාගම (PLC)">{language === 'si' ? '4. පොදු සමාගම (PLC)' : '4. Public Limited (PLC)'}</MenuItem>
                          <MenuItem value="5. සමුපකාර සමිතිය">{language === 'si' ? '5. සමුපකාර සමිතිය' : '5. Cooperative Society'}</MenuItem>
                          <MenuItem value="6. ලියාපදිංචි නොකළ ගෘහස්ථ ව්‍යාපාරය">{language === 'si' ? '6. ලියාපදිංචි නොකළ ගෘහස්ථ ව්‍යාපාරය' : '6. Unregistered Home Business'}</MenuItem>
                          <MenuItem value="7. වෙනත් (සඳහන් කරන්න)">{language === 'si' ? '7. වෙනත් (සඳහන් කරන්න)' : '7. Other (Specify)'}</MenuItem>
                        </Select>
                      </FormControl>
                      {formValues['q_legal_status'] === '7. වෙනත් (සඳහන් කරන්න)' && (
                        <TextField fullWidth variant="outlined" size="small" placeholder={language === 'si' ? 'වෙනත් ස්වරූපය සඳහන් කරන්න' : 'Specify other form'} value={formValues['q_legal_status_other'] || ''} onChange={(e) => handleInputChange('q_legal_status_other', e.target.value)} sx={{ mt: 1 }} />
                      )}
                    </Box>

                    {/* Registration Status */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරය ලියාපදිංචි කර තිබේද?' : language === 'ta' ? 'வணிகம் பதிவு செய்யப்பட்டுள்ளதா?' : 'Is the business registered?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_is_registered'] || ''} onChange={(e) => handleInputChange('q_is_registered', e.target.value as string)}>
                          <MenuItem value="1. ඔව්">{language === 'si' ? '1. ඔව්' : '1. Yes'}</MenuItem>
                          <MenuItem value="2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ">{language === 'si' ? '2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ' : '2. In the registration process'}</MenuItem>
                          <MenuItem value="3. නැත">{language === 'si' ? '3. නැත' : '3. No'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Registered Agencies */}
                    {(formValues['q_is_registered'] === '1. ඔව්' || formValues['q_is_registered'] === '2. ලියාපදිංචි කිරීමේ ක්‍රියාවලියේ') && (
                      <Box>
                        <QuestionLabel text={language === 'si' ? 'ලියාපදිංචි කර ඇත්නම්, කුමන ආයතනයක් සමඟද? (බහුවරණය)' : language === 'ta' ? 'பதிவு செய்திருந்தால், எந்த நிறுவனத்துடன்?' : 'If registered, with which agency? (Multiple Choice)'} />
                        <FormControl fullWidth size="small">
                          <Select 
                            multiple 
                            value={formValues['q_registered_agencies'] ? formValues['q_registered_agencies'].split(', ') : []} 
                            onChange={(e) => {
                              const val = e.target.value;
                              const valArray = typeof val === 'string' ? val.split(',') : val;
                              handleInputChange('q_registered_agencies', valArray.join(', '));
                            }}
                            input={<OutlinedInput />}
                            renderValue={(selected) => (selected as string[]).join(', ')}
                          >
                            {['1. ප්‍රාදේශීය සභාව', '2. ප්‍රාදේශීය ලේකම් කාර්යාලය', '3. සමාගම් ලියාපදිංචි කාර්යාලය', '4. බදු දෙපාර්තමේන්තුව', '5. සමාජ සුරක්ෂිත ආයතනය', '6. වෙනත්'].map((name) => (
                              <MenuItem key={name} value={name}>
                                <Checkbox checked={formValues['q_registered_agencies'] ? formValues['q_registered_agencies'].split(', ').indexOf(name) > -1 : false} />
                                <ListItemText primary={
                                  name === '1. ප්‍රාදේශීය සභාව' ? (language === 'si' ? '1. ප්‍රාදේශීය සභාව' : '1. Local Council') :
                                  name === '2. ප්‍රාදේශීය ලේකම් කාර්යාලය' ? (language === 'si' ? '2. ප්‍රාදේශීය ලේකම් කාර්යාලය' : '2. Divisional Secretariat') :
                                  name === '3. සමාගම් ලියාපදිංචි කාර්යාලය' ? (language === 'si' ? '3. සමාගම් ලියාපදිංචි කාර්යාලය' : '3. Registrar of Companies') :
                                  name === '4. බදු දෙපාර්තමේන්තුව' ? (language === 'si' ? '4. බදු දෙපාර්තමේන්තුව' : '4. Tax Department') :
                                  name === '5. සමාජ සුරක්ෂිත ආයතනය' ? (language === 'si' ? '5. සමාජ සුරක්ෂිත ආයතනය' : '5. Social Security Board') :
                                  (language === 'si' ? '6. වෙනත්' : '6. Other')
                                } />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {formValues['q_registered_agencies'] && formValues['q_registered_agencies'].includes('6. වෙනත්') && (
                          <TextField fullWidth variant="outlined" size="small" placeholder={language === 'si' ? 'වෙනත් ආයතනය සඳහන් කරන්න' : 'Specify other agency'} value={formValues['q_registered_agencies_other'] || ''} onChange={(e) => handleInputChange('q_registered_agencies_other', e.target.value)} sx={{ mt: 1 }} />
                        )}
                      </Box>
                    )}

                    {/* Registration Number */}
                    {formValues['q_is_registered'] === '1. ඔව්' && (
                      <Box>
                        <QuestionLabel text={language === 'si' ? 'ලියාපදිංචි අංක(ය)' : language === 'ta' ? 'பதிவு எண்(கள்)' : 'Registration Number(s)'} />
                        <TextField fullWidth variant="outlined" size="small" value={formValues['q_registration_number'] || ''} onChange={(e) => handleInputChange('q_registration_number', e.target.value)} />
                      </Box>
                    )}

                    {/* VAT Number */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? '(VAT) Number' : '(VAT) Number'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_has_vat'] || ''} onChange={(e) => handleInputChange('q_has_vat', e.target.value as string)}>
                          <MenuItem value="1. ඔව්">{language === 'si' ? '1. ඔව්' : '1. Yes'}</MenuItem>
                          <MenuItem value="2. නැත">{language === 'si' ? '2. නැත' : '2. No'}</MenuItem>
                        </Select>
                      </FormControl>
                      {formValues['q_has_vat'] === '1. ඔව්' && (
                        <TextField fullWidth variant="outlined" size="small" placeholder={language === 'si' ? 'VAT අංකය ඇතුළත් කරන්න' : 'Enter VAT Number'} value={formValues['q_vat_number'] || ''} onChange={(e) => handleInputChange('q_vat_number', e.target.value)} sx={{ mt: 1 }} />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(1)}>
                        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                      </Button>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(3)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
                {currentStep === 3 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                      {language === 'si' ? 'ස්ථානය හා යටිතල පහසුකම්' : language === 'ta' ? 'இடம் மற்றும் உள்கட்டமைப்பு' : 'Location & Infrastructure'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                      {language === 'si' ? 'මෙම කොටස World Bank Enterprise Surveys හි Section C (Infrastructure and Services) හා ILO QHUEM0_1 ප්‍රශ්න මත පදනම් වේ' : 'This section is based on World Bank Enterprise Surveys Section C (Infrastructure and Services) and ILO QHUEM0_1 questions'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="textSecondary" sx={{ mb: 1 }}>
                      {language === 'si' ? '2.1 ව්‍යාපාරික ස්ථානය' : language === 'ta' ? '2.1 வணிக இடம்' : '2.1 Business Location'}
                    </Typography>

                    {/* Business Location Type */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරය ක්‍රියාත්මක වන ස්ථානය කුමක්ද?' : language === 'ta' ? 'வணிகம் செயல்படும் இடம் எது?' : 'Where does the business operate?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_business_location_type'] || ''} onChange={(e) => handleInputChange('q_business_location_type', e.target.value as string)}>
                          <MenuItem value="1. නිවස තුළ (වෙනම ඉඩක් නැතිව)">{language === 'si' ? '1. නිවස තුළ (වෙනම ඉඩක් නැතිව)' : '1. Inside home (no separate space)'}</MenuItem>
                          <MenuItem value="2. නිවසේ කාමරයක">{language === 'si' ? '2. නිවසේ කාමරයක' : '2. In a room of the house'}</MenuItem>
                          <MenuItem value="3. නිවසේ වෙනම කොටසක/උඩුමහලේ">{language === 'si' ? '3. නිවසේ වෙනම කොටසක/උඩුමහලේ' : '3. In a separate part/upstairs of the house'}</MenuItem>
                          <MenuItem value="4. නිවසට යාබදව ඉදිකළ වෙනම ගොඩනැගිල්ලක">{language === 'si' ? '4. නිවසට යාබදව ඉදිකළ වෙනම ගොඩනැගිල්ලක' : '4. In a separate building adjacent to the house'}</MenuItem>
                          <MenuItem value="5. වෙනම ස්ථිර ස්ථානයක (කුලියට/තමන්ගේ)">{language === 'si' ? '5. වෙනම ස්ථිර ස්ථානයක (කුලියට/තමන්ගේ)' : '5. In a separate permanent location (rented/owned)'}</MenuItem>
                          <MenuItem value="6. වෙනත් තාවකාලික ස්ථානයක (කුටිය, කියෝස්ක්, වීදි කඩය)">{language === 'si' ? '6. වෙනත් තාවකාලික ස්ථානයක (කුටිය, කියෝස්ක්, වීදි කඩය)' : '6. In a temporary location (booth, kiosk, street stall)'}</MenuItem>
                          <MenuItem value="7. ගමන් කරන ව්‍යාපාරයක් (හෝකර්, පාරේ විකුණුම්)">{language === 'si' ? '7. ගමන් කරන ව්‍යාපාරයක් (හෝකර්, පාරේ විකුණුම්)' : '7. Traveling business (hawker, street sales)'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Business Address */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරික ස්ථානයේ ලිපිනය' : language === 'ta' ? 'வணிக இடத்தின் முகவரி' : 'Business Location Address'} />
                      <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_business_address'] || ''} onChange={(e) => handleInputChange('q_business_address', e.target.value)} />
                    </Box>

                    {/* Branch Address */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ශාඛා ලිපින(ය) (ඇත්නම්)' : language === 'ta' ? 'கிளை முகவரி(கள்) (ஏதேனும் இருந்தால்)' : 'Branch Address(es) (if any)'} />
                      <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_branch_address'] || ''} onChange={(e) => handleInputChange('q_branch_address', e.target.value)} />
                    </Box>

                    {/* Location Ownership */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ස්ථානයේ හිමිකාරිත්වය' : language === 'ta' ? 'இடத்தின் உரிமை' : 'Location Ownership'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_location_ownership'] || ''} onChange={(e) => handleInputChange('q_location_ownership', e.target.value as string)}>
                          <MenuItem value="1. තමන් සතුය">{language === 'si' ? '1. තමන් සතුය' : '1. Owned'}</MenuItem>
                          <MenuItem value="2. කුලියට ගෙන ඇත">{language === 'si' ? '2. කුලියට ගෙන ඇත' : '2. Rented'}</MenuItem>
                          <MenuItem value="3. නොමිලේ භාවිතා කරයි">{language === 'si' ? '3. නොමිලේ භාවිතා කරයි' : '3. Free to use'}</MenuItem>
                          <MenuItem value="4. වෙනත්">{language === 'si' ? '4. වෙනත්' : '4. Other'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Rent Amount */}
                    {formValues['q_location_ownership'] === '2. කුලියට ගෙන ඇත' && (
                      <Box>
                        <QuestionLabel text={language === 'si' ? 'කුලියට ගෙන ඇත්නම්, මාසික කුලී මුදල' : language === 'ta' ? 'வாடகைக்கு எடுக்கப்பட்டிருந்தால், மாதாந்திர வாடகை' : 'If rented, monthly rent amount'} />
                        <TextField 
                          fullWidth 
                          variant="outlined" 
                          size="small" 
                          type="number"
                          InputProps={{ startAdornment: <Typography sx={{mr: 1, color: 'text.secondary'}}>LKR</Typography> }}
                          value={formValues['q_rent_amount'] || ''} 
                          onChange={(e) => handleInputChange('q_rent_amount', e.target.value)} 
                        />
                      </Box>
                    )}

                    {/* Building Tax */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ගොඩනැගිල්ල සඳහා බද්දක් ගෙවන්නේද?' : language === 'ta' ? 'கட்டிடத்திற்கு வரி செலுத்துகிறீர்களா?' : 'Do you pay a tax for the building?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_pay_building_tax'] || ''} onChange={(e) => handleInputChange('q_pay_building_tax', e.target.value as string)}>
                          <MenuItem value="1. ඔව්">{language === 'si' ? '1. ඔව්' : '1. Yes'}</MenuItem>
                          <MenuItem value="2. නැත">{language === 'si' ? '2. නැත' : '2. No'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Building Tax Amount */}
                    {formValues['q_pay_building_tax'] === '1. ඔව්' && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600" mb={1} mt={1}>
                          {language === 'si' ? 'මාසික ගෙවීම' : language === 'ta' ? 'மாதாந்திர கட்டணம்' : 'Monthly Payment'}
                        </Typography>
                        <TextField 
                          fullWidth 
                          variant="outlined" 
                          size="small" 
                          type="number"
                          InputProps={{ startAdornment: <Typography sx={{mr: 1, color: 'text.secondary'}}>LKR</Typography> }}
                          value={formValues['q_building_tax_amount'] || ''} 
                          onChange={(e) => handleInputChange('q_building_tax_amount', e.target.value)} 
                        />
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(2)}>
                        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                      </Button>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(4)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
                {currentStep === 4 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                      {language === 'si' ? 'යටිතල පහසුකම් හා සේවා' : language === 'ta' ? 'உள்கட்டமைப்பு மற்றும் சேவைகள்' : 'Infrastructure and Services'}
                    </Typography>

                    {/* Uses Electricity */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'විදුලිය භාවිතා කරන්නේද?' : language === 'ta' ? 'மின்சாரம் பயன்படுத்துகிறீர்களா?' : 'Do you use electricity?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_uses_electricity'] || ''} onChange={(e) => handleInputChange('q_uses_electricity', e.target.value as string)}>
                          <MenuItem value="1. ඔව් (ජාතික විදුලිබල මණ්ඩලයෙන්)">{language === 'si' ? '1. ඔව් (ජාතික විදුලිබල මණ්ඩලයෙන්)' : '1. Yes (National Grid)'}</MenuItem>
                          <MenuItem value="2. ඔව් (සූර්ය බලයෙන්)">{language === 'si' ? '2. ඔව් (සූර්ය බලයෙන්)' : '2. Yes (Solar Power)'}</MenuItem>
                          <MenuItem value="3. ඔව් (ජනක යන්ත්‍රයකින්)">{language === 'si' ? '3. ඔව් (ජනක යන්ත්‍රයකින්)' : '3. Yes (Generator)'}</MenuItem>
                          <MenuItem value="4. නැත">{language === 'si' ? '4. නැත' : '4. No'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Main Energy Source (Multi) */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ප්‍රධාන බලශක්ති ප්‍රභවය කුමක්ද?' : language === 'ta' ? 'முக்கிய ஆற்றல் ஆதாரம் என்ன?' : 'What is the main energy source? (Multiple)'} />
                      <FormControl fullWidth size="small">
                        <Select 
                          multiple 
                          value={formValues['q_main_energy_source'] ? formValues['q_main_energy_source'].split(', ') : []} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const valArray = typeof val === 'string' ? val.split(',') : val;
                            handleInputChange('q_main_energy_source', valArray.join(', '));
                          }}
                          input={<OutlinedInput />}
                          renderValue={(selected) => (selected as string[]).join(', ')}
                        >
                          {['1. විදුලිය', '2. ඩීසල්', '3. භූමිතෙල්', '4. සූර්ය බලය', '5. දර', '6. ගෑස්', '7. වෙනත්'].map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox checked={formValues['q_main_energy_source'] ? formValues['q_main_energy_source'].split(', ').indexOf(name) > -1 : false} />
                              <ListItemText primary={
                                name === '1. විදුලිය' ? (language === 'si' ? '1. විදුලිය' : '1. Electricity') :
                                name === '2. ඩීසල්' ? (language === 'si' ? '2. ඩීසල්' : '2. Diesel') :
                                name === '3. භූමිතෙල්' ? (language === 'si' ? '3. භූමිතෙල්' : '3. Kerosene') :
                                name === '4. සූර්ය බලය' ? (language === 'si' ? '4. සූර්ය බලය' : '4. Solar') :
                                name === '5. දර' ? (language === 'si' ? '5. දර' : '5. Firewood') :
                                name === '6. ගෑස්' ? (language === 'si' ? '6. ගෑස්' : '6. Gas') :
                                (language === 'si' ? '7. වෙනත්' : '7. Other')
                              } />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Power Outages */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'සතියකට සාමාන්‍යයෙන් විදුලිය ඇනහිටීම් කීයක් සිදුවේද?' : language === 'ta' ? 'வாரத்திற்கு சராசரியாக எத்தனை முறை மின் தடை ஏற்படுகிறது?' : 'How many power outages occur per week on average?'} />
                      <TextField 
                        fullWidth 
                        variant="outlined" 
                        size="small" 
                        type="number"
                        InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary', whiteSpace: 'nowrap'}}>{language === 'si' ? 'වාරයක්' : 'Times'}</Typography> }}
                        value={formValues['q_power_outages'] || ''} 
                        onChange={(e) => handleInputChange('q_power_outages', e.target.value)} 
                      />
                    </Box>

                    {/* Water Source */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ජලය ලබා ගන්නේ කෙසේද?' : language === 'ta' ? 'தண்ணீர் எப்படி பெறுவது?' : 'How is water obtained?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_water_source'] || ''} onChange={(e) => handleInputChange('q_water_source', e.target.value as string)}>
                          <MenuItem value="1. නල ජලය">{language === 'si' ? '1. නල ජලය' : '1. Pipe Water'}</MenuItem>
                          <MenuItem value="2. ළිඳකින්">{language === 'si' ? '2. ළිඳකින්' : '2. Well'}</MenuItem>
                          <MenuItem value="3. උල්පතකින්">{language === 'si' ? '3. උල්පතකින්' : '3. Spring'}</MenuItem>
                          <MenuItem value="4. ටැංකි රථයකින්">{language === 'si' ? '4. ටැංකි රථයකින්' : '4. Water Bowser'}</MenuItem>
                          <MenuItem value="5. ගඟක්/ඇළක්">{language === 'si' ? '5. ගඟක්/ඇළක්' : '5. River/Stream'}</MenuItem>
                          <MenuItem value="6. වෙනත්">{language === 'si' ? '6. වෙනත්' : '6. Other'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Water Storage */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'ජලය ගබඩා කිරීමේ පහසුකමක් තිබේද?' : language === 'ta' ? 'நீர் சேமிப்பு வசதி உள்ளதா?' : 'Is there a water storage facility?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_water_storage'] || ''} onChange={(e) => handleInputChange('q_water_storage', e.target.value as string)}>
                          <MenuItem value="1. ඔව්">{language === 'si' ? '1. ඔව්' : '1. Yes'}</MenuItem>
                          <MenuItem value="2. නැත">{language === 'si' ? '2. නැත' : '2. No'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Internet Access */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'අන්තර්ජාල පහසුකම තිබේද?' : language === 'ta' ? 'இணைய வசதி உள்ளதா?' : 'Is there internet access?'} />
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_internet_access'] || ''} onChange={(e) => handleInputChange('q_internet_access', e.target.value as string)}>
                          <MenuItem value="1. ඔව් (ජංගම දත්ත)">{language === 'si' ? '1. ඔව් (ජංගම දත්ත)' : '1. Yes (Mobile Data)'}</MenuItem>
                          <MenuItem value="2. ඔව් (බ්‍රෝඩ්බෑන්ඩ්)">{language === 'si' ? '2. ඔව් (බ්‍රෝඩ්බෑන්ඩ්)' : '2. Yes (Broadband)'}</MenuItem>
                          <MenuItem value="3. නැත">{language === 'si' ? '3. නැත' : '3. No'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Telephone Service (Multi) */}
                    <Box>
                      <QuestionLabel text={language === 'si' ? 'දුරකථන සේවාව තිබේද?' : language === 'ta' ? 'தொலைபேசி சேவை உள்ளதா?' : 'Is there telephone service? (Multiple)'} />
                      <FormControl fullWidth size="small">
                        <Select 
                          multiple 
                          value={formValues['q_telephone_service'] ? formValues['q_telephone_service'].split(', ') : []} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const valArray = typeof val === 'string' ? val.split(',') : val;
                            handleInputChange('q_telephone_service', valArray.join(', '));
                          }}
                          input={<OutlinedInput />}
                          renderValue={(selected) => (selected as string[]).join(', ')}
                        >
                          {['1. ඔව් (ස්ථාවර)', '2. ඔව් (ජංගම)', '3. නැත'].map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox checked={formValues['q_telephone_service'] ? formValues['q_telephone_service'].split(', ').indexOf(name) > -1 : false} />
                              <ListItemText primary={
                                name === '1. ඔව් (ස්ථාවර)' ? (language === 'si' ? '1. ඔව් (ස්ථාවර)' : '1. Yes (Fixed)') :
                                name === '2. ඔව් (ජංගම)' ? (language === 'si' ? '2. ඔව් (ජංගම)' : '2. Yes (Mobile)') :
                                (language === 'si' ? '3. නැත' : '3. No')
                              } />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(3)}>
                        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                      </Button>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(5)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
                        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
{currentStep === 5 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>3 වන කොටස: ප්‍රාග්ධනය සපයාගත් ආකාරය (Capital Sources)</Typography>
<Box>
  <QuestionLabel text={language === 'si' ? 'ආරම්භක ප්‍රාග්ධනය ලබාගත් මූලාශ්‍ර (Multiple Select)' : 'ආරම්භක ප්‍රාග්ධනය ලබාගත් මූලාශ්‍ර (Multiple Select)'} />
  <FormControl fullWidth size="small">
    <Select 
      multiple 
      value={formValues['q_capital_sources'] ? formValues['q_capital_sources'].split(', ') : []} 
      onChange={(e) => {
        const val = e.target.value;
        handleInputChange('q_capital_sources', (typeof val === 'string' ? val.split(',') : val).join(', '));
      }}
      input={<OutlinedInput />}
      renderValue={(selected) => (selected as string[]).join(', ')}
    >
      {["1. පුද්ගලික ඉතුරුම්","2. පවුලේ/ඥාතීන්ගේ ආධාරය","3. රජයේ ආධාරයක්/ප්‍රතිපාදනයක්","4. බැංකු ණයක්","5. මයික්‍රොෆයිනන්ස් ආයතනයක්","6. රාජ්‍ය නොවන සංවිධානයක ආධාරය","7. සමුපකාර සමිතියක්","8. අනියම් ණයක්","9. වෙනත්"].map((name) => (
        <MenuItem key={name} value={name}>
          <Checkbox checked={formValues['q_capital_sources'] ? formValues['q_capital_sources'].split(', ').indexOf(name) > -1 : false} />
          <ListItemText primary={name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1, mt: 2 }}>3.3 ව්‍යාපාරික පරිමාණය හා වර්ගීකරණය</Typography>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරයේ පරිමාණය' : 'ව්‍යාපාරයේ පරිමාණය'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_business_scale'] || ''} onChange={(e) => handleInputChange('q_business_scale', e.target.value as string)}>
      <MenuItem value="1. ක්ෂුද්‍ර (මයික්‍රො)">1. ක්ෂුද්‍ර (මයික්‍රො)</MenuItem>
      <MenuItem value="2. කුඩා (සුළු)">2. කුඩා (සුළු)</MenuItem>
      <MenuItem value="3. මධ්‍යම">3. මධ්‍යම</MenuItem>
      <MenuItem value="4. විශාල (මහා)">4. විශාල (මහා)</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරයේ නියැලීමේ ස්වභාවය' : 'ව්‍යාපාරයේ නියැලීමේ ස්වභාවය'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_engagement_nature'] || ''} onChange={(e) => handleInputChange('q_engagement_nature', e.target.value as string)}>
      <MenuItem value="1. කලාතුරකින් කරන (වාරික)">1. කලාතුරකින් කරන (වාරික)</MenuItem>
      <MenuItem value="2. මාසයකට දින කිහිපයක්">2. මාසයකට දින කිහිපයක්</MenuItem>
      <MenuItem value="3. සතියකට දින කිහිපයක්">3. සතියකට දින කිහිපයක්</MenuItem>
      <MenuItem value="4. දිනපතා">4. දිනපතා</MenuItem>
      <MenuItem value="5. වාරයේ">5. වාරයේ</MenuItem>
      <MenuItem value="6. වාර්ෂික">6. වාර්ෂික</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? 'ව්‍යාපාරය සිදුකරන ස්ථානය' : 'ව්‍යාපාරය සිදුකරන ස්ථානය'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_business_place'] || ''} onChange={(e) => handleInputChange('q_business_place', e.target.value as string)}>
      <MenuItem value="1. නිවසේ">1. නිවසේ</MenuItem>
      <MenuItem value="2. නිවසේ කාමරයක">2. නිවසේ කාමරයක</MenuItem>
      <MenuItem value="3. නිවසේ වෙනම කොටසක">3. නිවසේ වෙනම කොටසක</MenuItem>
      <MenuItem value="4. වෙනම තාවකාලික ස්ථානයක">4. වෙනම තාවකාලික ස්ථානයක</MenuItem>
      <MenuItem value="5. වෙනම ස්ථිර ස්ථානයක">5. වෙනම ස්ථිර ස්ථානයක</MenuItem>
    </Select>
  </FormControl>
</Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(4)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(6)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
      </Button>
    </Box>
  </Box>
)}
{currentStep === 6 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>4 වන කොටස: ශ්‍රම බලකාය හා මානව සම්පත් (Workforce & Human Resources)</Typography>
<Box>
  <QuestionLabel text={language === 'si' ? '4.1.1 ව්‍යාපාරයේ සේවය කරන මුළු පුද්ගලයින් සංඛ්‍යාව (ඔබ ඇතුළුව)' : '4.1.1 ව්‍යාපාරයේ සේවය කරන මුළු පුද්ගලයින් සංඛ්‍යාව (ඔබ ඇතුළුව)'} />
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_total_workers'] || ''} onChange={(e) => handleInputChange('q_total_workers', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.1.2 ඉන් කාන්තාවන් සංඛ්‍යාව' : '4.1.2 ඉන් කාන්තාවන් සංඛ්‍යාව'} />
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_female_workers'] || ''} onChange={(e) => handleInputChange('q_female_workers', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.1.3 ඉන් පිරිමි සංඛ්‍යාව' : '4.1.3 ඉන් පිරිමි සංඛ්‍යාව'} />
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_male_workers'] || ''} onChange={(e) => handleInputChange('q_male_workers', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.1.4 ගෙවන සේවකයින් සංඛ්‍යාව' : '4.1.4 ගෙවන සේවකයින් සංඛ්‍යාව'} />
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_paid_workers'] || ''} onChange={(e) => handleInputChange('q_paid_workers', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.1.5 වැටුප් නොලබන පවුලේ සාමාජිකයින් සංඛ්‍යාව' : '4.1.5 වැටුප් නොලබන පවුලේ සාමාජිකයින් සංඛ්‍යාව'} />
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_unpaid_family_workers'] || ''} onChange={(e) => handleInputChange('q_unpaid_family_workers', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.1.6 වරින් වර/කොන්ත්‍රාත් සේවය කරන අය සංඛ්‍යාව' : '4.1.6 වරින් වර/කොන්ත්‍රාත් සේවය කරන අය සංඛ්‍යාව'} />
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_contract_workers'] || ''} onChange={(e) => handleInputChange('q_contract_workers', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.2.1 ශ්‍රම දායකත්වයේ ස්වභාවය' : '4.2.1 ශ්‍රම දායකත්වයේ ස්වභාවය'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_labor_contribution'] || ''} onChange={(e) => handleInputChange('q_labor_contribution', e.target.value as string)}>
      <MenuItem value="1. තනියෙන්ම">1. තනියෙන්ම</MenuItem>
      <MenuItem value="2. පවුලේ ශ්‍රමය පමණක්">2. පවුලේ ශ්‍රමය පමණක්</MenuItem>
      <MenuItem value="3. පවුලේ ශ්‍රමය + වරින් වර කුලියට">3. පවුලේ ශ්‍රමය + වරින් වර කුලියට</MenuItem>
      <MenuItem value="4. ස්ථිර සේවකයින් (1-2)">4. ස්ථිර සේවකයින් (1-2)</MenuItem>
      <MenuItem value="5. ස්ථිර සේවකයින් (3-5)">5. ස්ථිර සේවකයින් (3-5)</MenuItem>
      <MenuItem value="6. ස්ථිර සේවකයින් (6-10)">6. ස්ථිර සේවකයින් (6-10)</MenuItem>
      <MenuItem value="7. ස්ථිර සේවකයින් (11-25)">7. ස්ථිර සේවකයින් (11-25)</MenuItem>
      <MenuItem value="8. ස්ථිර සේවකයින් (25 ට වැඩි)">8. ස්ථිර සේවකයින් (25 ට වැඩි)</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.2.2 සේවකයින්ට පුහුණුව ලබා දෙනවාද?' : '4.2.2 සේවකයින්ට පුහුණුව ලබා දෙනවාද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_provides_training'] || ''} onChange={(e) => handleInputChange('q_provides_training', e.target.value as string)}>
      <MenuItem value="1. ඔව් (විධිමත්)">1. ඔව් (විධිමත්)</MenuItem>
      <MenuItem value="2. ඔව් (රැකියාවේදී)">2. ඔව් (රැකියාවේදී)</MenuItem>
      <MenuItem value="3. නැත">3. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '4.2.3 සේවකයින් සඳහා EPF ගෙවීම් සිදු කරනවාද?' : '4.2.3 සේවකයින් සඳහා EPF ගෙවීම් සිදු කරනවාද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_pays_epf'] || ''} onChange={(e) => handleInputChange('q_pays_epf', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(5)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(7)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
      </Button>
    </Box>
  </Box>
)}
{currentStep === 7 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>5 වන කොටස: නිෂ්පාදන හා මෙහෙයුම් (Production & Operations)</Typography>
<Box>
  <QuestionLabel text={language === 'si' ? '5.1.1 භාවිතා කරන ප්‍රධාන යන්ත්‍රෝපකරණ (උපරිම 5)' : '5.1.1 භාවිතා කරන ප්‍රධාන යන්ත්‍රෝපකරණ (උපරිම 5)'} />
  <PhotoUploader
    fieldKey="q_main_machinery"
    value={formValues['q_main_machinery'] || ''}
    multiple={true}
    language={language}
    onChange={(names) => handleInputChange('q_main_machinery', names)}
  />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.1.2 භාවිතා කරන ප්‍රධාන මෙවලම් (උපරිම 5)' : '5.1.2 භාවිතා කරන ප්‍රධාන මෙවලම් (උපරිම 5)'} />
  <PhotoUploader
    fieldKey="q_main_tools"
    value={formValues['q_main_tools'] || ''}
    multiple={true}
    language={language}
    onChange={(names) => handleInputChange('q_main_tools', names)}
  />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.1.3 යන්ත්‍රෝපකරණවල ආසන්න වටිනාකම' : '5.1.3 යන්ත්‍රෝපකරණවල ආසන්න වටිනාකම'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_machinery_value'] || ''} onChange={(e) => handleInputChange('q_machinery_value', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.1.4 යන්ත්‍රෝපකරණ ලබාගත් ආකාරය' : '5.1.4 යන්ත්‍රෝපකරණ ලබාගත් ආකාරය'} />
  <FormControl fullWidth size="small">
    <Select 
      multiple 
      value={formValues['q_machinery_source'] ? formValues['q_machinery_source'].split(', ') : []} 
      onChange={(e) => {
        const val = e.target.value;
        handleInputChange('q_machinery_source', (typeof val === 'string' ? val.split(',') : val).join(', '));
      }}
      input={<OutlinedInput />}
      renderValue={(selected) => (selected as string[]).join(', ')}
    >
      {["1. මිලදී ගත්තා","2. කුලියට ගත්තා","3. තනිවම සාදා ගත්තා","4. තෑග්ගක් ලෙස ලැබුණා","5. රජයෙන් ලැබුණා","6. වෙනත්"].map((name) => (
        <MenuItem key={name} value={name}>
          <Checkbox checked={formValues['q_machinery_source'] ? formValues['q_machinery_source'].split(', ').indexOf(name) > -1 : false} />
          <ListItemText primary={name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.2.1 දිනකට නිෂ්පාදනය කරන ප්‍රමාණය' : '5.2.1 දිනකට නිෂ්පාදනය කරන ප්‍රමාණය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_daily'] || ''} onChange={(e) => handleInputChange('q_production_daily', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.2.2 සතියකට නිෂ්පාදනය කරන ප්‍රමාණය' : '5.2.2 සතියකට නිෂ්පාදනය කරන ප්‍රමාණය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_weekly'] || ''} onChange={(e) => handleInputChange('q_production_weekly', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.2.3 මාසයකට නිෂ්පාදනය කරන ප්‍රමාණය' : '5.2.3 මාසයකට නිෂ්පාදනය කරන ප්‍රමාණය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_monthly'] || ''} onChange={(e) => handleInputChange('q_production_monthly', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.2.4 වාර්ෂික නිෂ්පාදන ප්‍රමාණය (ඇස්තමේන්තුව)' : '5.2.4 වාර්ෂික නිෂ්පාදන ප්‍රමාණය (ඇස්තමේන්තුව)'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_yearly'] || ''} onChange={(e) => handleInputChange('q_production_yearly', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.2.5 නිෂ්පාදන ධාරිතාවයේ භාවිත ප්‍රතිශතය' : '5.2.5 නිෂ්පාදන ධාරිතාවයේ භාවිත ප්‍රතිශතය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> % </Typography> }} value={formValues['q_production_capacity'] || ''} onChange={(e) => handleInputChange('q_production_capacity', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.2.6 දිනකට මෙහෙයුම් පැය ගණන' : '5.2.6 දිනකට මෙහෙයුම් පැය ගණන'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> පැය </Typography> }} value={formValues['q_operating_hours'] || ''} onChange={(e) => handleInputChange('q_operating_hours', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.3.1 භාවිතා කරන ප්‍රධාන අමුද්‍රව්‍ය (උපරිම 5)' : '5.3.1 භාවිතා කරන ප්‍රධාන අමුද්‍රව්‍ය (උපරිම 5)'} />
  <PhotoUploader
    fieldKey="q_main_materials"
    value={formValues['q_main_materials'] || ''}
    multiple={true}
    language={language}
    onChange={(names) => handleInputChange('q_main_materials', names)}
  />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.3.2 අමුද්‍රව්‍ය සපයා ගන්නා ආකාරය' : '5.3.2 අමුද්‍රව්‍ය සපයා ගන්නා ආකාරය'} />
  <FormControl fullWidth size="small">
    <Select 
      multiple 
      value={formValues['q_material_sources'] ? formValues['q_material_sources'].split(', ') : []} 
      onChange={(e) => {
        const val = e.target.value;
        handleInputChange('q_material_sources', (typeof val === 'string' ? val.split(',') : val).join(', '));
      }}
      input={<OutlinedInput />}
      renderValue={(selected) => (selected as string[]).join(', ')}
    >
      {["1. තම ඉඩමෙන්ම","2. ප්‍රදේශයෙන් නොමිලේ","3. ප්‍රදේශයෙන් මුදලට","4. නගරයෙන් මිලදී ගනී","5. කොළඹින් මිලදී ගනී","6. විදෙස් රටකින් ආනයනය","7. බෙදාහරින්නෙකුගෙන්"].map((name) => (
        <MenuItem key={name} value={name}>
          <Checkbox checked={formValues['q_material_sources'] ? formValues['q_material_sources'].split(', ').indexOf(name) > -1 : false} />
          <ListItemText primary={name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.3.3 අමුද්‍රව්‍ය සඳහා බලපත්‍රයක් අවශ්‍යද?' : '5.3.3 අමුද්‍රව්‍ය සඳහා බලපත්‍රයක් අවශ්‍යද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_material_license_req'] || ''} onChange={(e) => handleInputChange('q_material_license_req', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_material_license_req'] === '1. ඔව්' && (
<Box>
  <QuestionLabel text={language === 'si' ? '5.3.4 බලපත්‍රය අවශ්‍ය නම් කුමන ආයතනයෙන්ද?' : '5.3.4 බලපත්‍රය අවශ්‍ය නම් කුමන ආයතනයෙන්ද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_material_license_agency'] || ''} onChange={(e) => handleInputChange('q_material_license_agency', e.target.value as string)}>
      <MenuItem value="1. පොලීසියෙන්">1. පොලීසියෙන්</MenuItem>
      <MenuItem value="2. ප්‍රාදේශීය ලේකම් කාර්යාලයෙන්">2. ප්‍රාදේශීය ලේකම් කාර්යාලයෙන්</MenuItem>
      <MenuItem value="3. මධ්‍යම රජයෙන්">3. මධ්‍යම රජයෙන්</MenuItem>
      <MenuItem value="4. වෙනත්">4. වෙනත්</MenuItem>
    </Select>
  </FormControl>
</Box>
)}

<Box>
  <QuestionLabel text={language === 'si' ? '5.3.5 අමුද්‍රව්‍ය සඳහා මාසික වියදම' : '5.3.5 අමුද්‍රව්‍ය සඳහා මාසික වියදම'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_material_cost'] || ''} onChange={(e) => handleInputChange('q_material_cost', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.4.1 අපද්‍රව්‍ය බැහැර කරන ආකාරය' : '5.4.1 අපද්‍රව්‍ය බැහැර කරන ආකාරය'} />
  <FormControl fullWidth size="small">
    <Select 
      multiple 
      value={formValues['q_waste_disposal'] ? formValues['q_waste_disposal'].split(', ') : []} 
      onChange={(e) => {
        const val = e.target.value;
        handleInputChange('q_waste_disposal', (typeof val === 'string' ? val.split(',') : val).join(', '));
      }}
      input={<OutlinedInput />}
      renderValue={(selected) => (selected as string[]).join(', ')}
    >
      {["1. ස්ථානයේම ප්‍රතිචක්‍රීකරණය කරයි","2. වෙනත් ස්ථානයකට ගෙන ගොස් බැහැර කරයි","3. පළාත් පාලන ආයතනයට ලබා දෙයි","4. පුළුස්සා දමයි","5. වළලමින් බැහැර කරයි","6. වෙනත්"].map((name) => (
        <MenuItem key={name} value={name}>
          <Checkbox checked={formValues['q_waste_disposal'] ? formValues['q_waste_disposal'].split(', ').indexOf(name) > -1 : false} />
          <ListItemText primary={name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.4.2 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණය කරනවාද?' : '5.4.2 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණය කරනවාද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_waste_recycled'] || ''} onChange={(e) => handleInputChange('q_waste_recycled', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '5.4.3 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණයෙන් ආදායමක් ලැබේද?' : '5.4.3 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණයෙන් ආදායමක් ලැබේද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_waste_income'] || ''} onChange={(e) => handleInputChange('q_waste_income', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(6)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(8)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
      </Button>
    </Box>
  </Box>
)}
{currentStep === 8 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>6 වන කොටස: මූල්‍ය හා ගිණුම්කරණය (Finance & Accounting)</Typography>
<Box>
  <QuestionLabel text={language === 'si' ? '6.1.1 ලාභය ගණනය කර තිබේද?' : '6.1.1 ලාභය ගණනය කර තිබේද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_profit_calculated'] || ''} onChange={(e) => handleInputChange('q_profit_calculated', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_profit_calculated'] === '1. ඔව්' && (
<Box>
  <QuestionLabel text={language === 'si' ? 'ලාභ ප්‍රතිශතය' : 'ලාභ ප්‍රතිශතය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> % </Typography> }} value={formValues['q_profit_percentage'] || ''} onChange={(e) => handleInputChange('q_profit_percentage', e.target.value)} />
</Box>
)}

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.2 ඒකක නිෂ්පාදන පිරිවැය ගණනය කර තිබේද?' : '6.1.2 ඒකක නිෂ්පාදන පිරිවැය ගණනය කර තිබේද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_cost_calculated'] || ''} onChange={(e) => handleInputChange('q_cost_calculated', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_cost_calculated'] === '1. ඔව්' && (
<Box>
  <QuestionLabel text={language === 'si' ? 'එක් ඒකකයක පිරිවැය' : 'එක් ඒකකයක පිරිවැය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_unit_cost'] || ''} onChange={(e) => handleInputChange('q_unit_cost', e.target.value)} />
</Box>
)}

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.3 මාසික ආදායම (ආසන්න)' : '6.1.3 මාසික ආදායම (ආසන්න)'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_monthly_income'] || ''} onChange={(e) => handleInputChange('q_monthly_income', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.4 මාසික වියදම (ආසන්න)' : '6.1.4 මාසික වියදම (ආසන්න)'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_monthly_expense'] || ''} onChange={(e) => handleInputChange('q_monthly_expense', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.5 මාසික ශුද්ධ ලාභය (ආසන්න)' : '6.1.5 මාසික ශුද්ධ ලාභය (ආසන්න)'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_monthly_net_profit'] || ''} onChange={(e) => handleInputChange('q_monthly_net_profit', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.6 ව්‍යාපාරය ලාභ සහිතව කරගෙන යනවාද?' : '6.1.6 ව්‍යාපාරය ලාභ සහිතව කරගෙන යනවාද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_profitable'] || ''} onChange={(e) => handleInputChange('q_profitable', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
      <MenuItem value="3. සමහර විට">3. සමහර විට</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.7 ණය ගෙවීමේ වාරික (මාසික)' : '6.1.7 ණය ගෙවීමේ වාරික (මාසික)'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_loan_installment'] || ''} onChange={(e) => handleInputChange('q_loan_installment', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.8 ව්‍යාපාරයක් ලෙස ගෙවිය යුතු මුළු ණය ප්‍රමාණය' : '6.1.8 ව්‍යාපාරයක් ලෙස ගෙවිය යුතු මුළු ණය ප්‍රමාණය'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_total_loan'] || ''} onChange={(e) => handleInputChange('q_total_loan', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.1.9 පුද්ගලිකව ණය වී ඇති ප්‍රමාණය (ව්‍යාපාරය සඳහා)' : '6.1.9 පුද්ගලිකව ණය වී ඇති ප්‍රමාණය (ව්‍යාපාරය සඳහා)'} />
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_personal_loan'] || ''} onChange={(e) => handleInputChange('q_personal_loan', e.target.value)} />
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.2.1 ව්‍යාපාරය සඳහා බැංකු ගිණුමක් තිබේද?' : '6.2.1 ව්‍යාපාරය සඳහා බැංකු ගිණුමක් තිබේද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_bank_account'] || ''} onChange={(e) => handleInputChange('q_bank_account', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත, පුද්ගලික ගිණුම භාවිතා කරයි">2. නැත, පුද්ගලික ගිණුම භාවිතා කරයි</MenuItem>
      <MenuItem value="3. ගිණුමක් නැත">3. ගිණුමක් නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_bank_account'] === '1. ඔව්' && (
<Box>
  <QuestionLabel text={language === 'si' ? 'බැංකුව' : 'බැංකුව'} />
  <TextField fullWidth variant="outlined" size="small" value={formValues['q_bank_name'] || ''} onChange={(e) => handleInputChange('q_bank_name', e.target.value)} />
</Box>
)}

<Box>
  <QuestionLabel text={language === 'si' ? '6.2.2 මූල්‍ය වාර්තා තබා ගන්නේද?' : '6.2.2 මූල්‍ය වාර්තා තබා ගන්නේද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_financial_records'] || ''} onChange={(e) => handleInputChange('q_financial_records', e.target.value as string)}>
      <MenuItem value="1. ඔව්, විධිමත්ව">1. ඔව්, විධිමත්ව</MenuItem>
      <MenuItem value="2. ඔව්, සරලව (පොතක)">2. ඔව්, සරලව (පොතක)</MenuItem>
      <MenuItem value="3. නැත">3. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.2.3 හිමිකරු ව්‍යාපාරයෙන් වැටුපක් ලබා ගන්නේද?' : '6.2.3 හිමිකරු ව්‍යාපාරයෙන් වැටුපක් ලබා ගන්නේද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_receives_salary'] || ''} onChange={(e) => handleInputChange('q_receives_salary', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත, ලාභය පමණයි">2. නැත, ලාභය පමණයි</MenuItem>
      <MenuItem value="3. නැත, මුදල් අවශ්‍ය විට ලබා ගනී">3. නැත, මුදල් අවශ්‍ය විට ලබා ගනී</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <QuestionLabel text={language === 'si' ? '6.2.4 ලාභය, ආදායම සහ වියදම අතර වෙනස දන්නවාද?' : '6.2.4 ලාභය, ආදායම සහ වියදම අතර වෙනස දන්නවාද?'} />
  <FormControl fullWidth size="small">
    <Select value={formValues['q_knows_financial_concepts'] || ''} onChange={(e) => handleInputChange('q_knows_financial_concepts', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(7)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(9)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
      <Button variant="outlined" color="secondary" size="small" sx={{ borderRadius: '20px', py: 1, fontWeight: 'bold', width: '100%', mt: 1 }} onClick={handleSaveDraft}>
        💾 {language === 'si' ? 'සුරකින්න හා පසුව දිගටම කරන්න' : language === 'ta' ? 'சேமி & பின்னர் தொடரவும்' : 'Save & Continue Later'}
      </Button>
    </Box>
  </Box>
)}
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
      {["1. ප්‍රදේශයේ පාරිභෝගිකයින්","2. ප්‍රදේශයෙන් පිටත පාරිභෝගිකයින්","3. වෙනත් ව්‍යාපාරිකයින් (B2B)","4. අතරමැදියන්/තොග වෙළඳුන්","5. රජයේ ආයතන","6. අපනයනය සඳහා"].map((name) => (
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
      {["1. පෝස්ටර්/බැනර්","2. සමාජ මාධ්‍ය (Facebook, WhatsApp)","3. වෙබ් අඩවියක් මගින්","4. මුද්‍රිත මාධ්‍ය (පුවත්පත්)","5. රූපවාහිනී/ගුවන් විදුලි","6. පාරිභෝගිකයින්ගේ දැනුම්දීම (Word of mouth)","7. ප්‍රදර්ශන/පොළවල්","8. අලෙවිකරණයක් නොකරයි"].map((name) => (
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
      {["1. ස්මාර්ට් දුරකථනය","2. පරිගණකය/ලැප්ටොප්","3. අන්තර්ජාල පහසුකම්","4. කිසිවක් නැත"].map((name) => (
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
      {["1. ඔව් (බැංකු හරහා - Online Banking)","2. ඔව් (LankaQR / Mobile Wallets)","3. කාඩ්පත් මගින් (POS)","4. නැත, මුදල් (Cash) පමණයි"].map((name) => (
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
      {["1. ප්‍රාදේශීය ලේකම් ලියාපදිංචිය (BR)","2. සමාගම් මැදුරේ ලියාපදිංචිය","3. පළාත් සභා/ප්‍රාදේශීය සභා අනුමැතිය","4. පරිසර ආරක්ෂණ බලපත්‍රය (EPL)","5. සෞඛ්‍ය වෛද්‍ය නිලධාරී (MOH) සහතිකය","6. ප්‍රමිති ආයතනයේ සහතිකය (SLSI)","7. අපනයන සංවර්ධන මණ්ඩලයේ (EDB) ලියාපදිංචිය","8. වෙනත්","9. කිසිවක් නැත"].map((name) => (
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
      {["1. ආදායම් බදු","2. එකතු කළ අගය මත බදු (VAT)","3. ප්‍රාදේශීය සභා බදු","4. කිසිවක් නැත"].map((name) => (
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
      {["1. මූල්‍ය ආධාර (ණය/ප්‍රතිපාදන)","2. පුහුණු වැඩසටහන්","3. උපදේශන සේවා","4. අමුද්‍රව්‍ය/උපකරණ","5. ප්‍රදර්ශන සඳහා අවස්ථා","6. කිසිදු සහායක් ලැබී නැත"].map((name) => (
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
      {["1. නව නිෂ්පාදන/සේවා හඳුන්වා දීම","2. නිෂ්පාදන ධාරිතාව වැඩි කිරීම","3. නව වෙළඳපොළවල් සෙවීම (අපනයනය ඇතුළුව)","4. නව තාක්ෂණය/යන්ත්‍රෝපකරණ මිලදී ගැනීම","5. ශාඛා විවෘත කිරීම","6. සැලසුමක් නැත"].map((name) => (
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
      {["1. අඩු පොලී ණය","2. නව තාක්ෂණික උපකරණ/අමුද්‍රව්‍ය","3. ව්‍යාපාරික පුහුණුව/උපදේශනය","4. අලෙවි පහසුකම්/වෙළඳපොළ සෙවීම","5. ඉඩම්/යටිතල පහසුකම්","6. නීතිමය ගැටළු විසඳීම","7. වෙනත්"].map((name) => (
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
            </SurveyErrorContext.Provider>
          </Box>
        </Container>
      )}

      {/* ─── Success Dialog ──────────────────────────────────────────────── */}
      <SurveyDialog
        open={successDialogOpen}
        tone="accent"
        icon={<CheckCircleRoundedIcon />}
        title={L('Survey submitted successfully', 'සමීක්ෂණය සාර්ථකව ඉදිරිපත් කරන ලදි', 'கணக்கெடுப்பு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது')}
        actions={
          <Box role="button" sx={btnAccent} onClick={() => { setSuccessDialogOpen(false); const url = localStorage.getItem('last_gn_url'); navigate(url || '/gnpage'); }}>
            {L('Done', 'හරි', 'சரி')}
          </Box>
        }
      >
        <Typography sx={{ mb: submitSuccessData ? 2 : 0, color: T.body }}>
          {L('Thank you. The responses have been recorded.', 'ස්තූතියි. පිළිතුරු සටහන් කර ඇත.', 'நன்றி. பதில்கள் பதிவு செய்யப்பட்டன.')}
        </Typography>
        {submitSuccessData && (
          <Box sx={{ bgcolor: T.accentSoft, borderRadius: `${T.field}px`, p: 1.5, border: '1px solid #d1fae5' }}>
            <InfoRow icon={<AccessTimeRoundedIcon />} label={L('Start Time', 'ආරම්භක වේලාව', 'தொடக்க நேரம்')} value={submitSuccessData.startTime} />
            <InfoRow icon={<AccessTimeRoundedIcon />} label={L('End Time', 'අවසන් වේලාව', 'முடிவு நேரம்')} value={submitSuccessData.endTime} />
          </Box>
        )}
      </SurveyDialog>

      {/* ─── Location Confirmation Dialog ────────────────────────────────── */}
      <SurveyDialog
        open={!!ccode && !locationConfirmed && !showLocationSelector && !!gnData?.gnByCcode}
        icon={<HowToRegRoundedIcon />}
        title={L('Confirm Location', 'ස්ථානය තහවුරු කරන්න', 'இடத்தை உறுதிப்படுத்தவும்')}
        actions={<>
          <Box role="button" sx={btnDanger} onClick={() => setShowLocationSelector(true)}>{L('No, Change', 'නැත, වෙනස් කරන්න', 'இல்லை, மாற்று')}</Box>
          <Box role="button" sx={btnPrimary} onClick={() => { setLocationConfirmed(true); const d = localStorage.getItem(`survey_draft_${ccode}`); if (d) setShowResumePopup(true); else setShowMetadataPopup(true); }}>{L('Yes, Proceed', 'ඔව්, නිවැරදියි', 'ஆம், தொடரவும்')}</Box>
        </>}
      >
        <Typography sx={{ mb: 2 }}>{L('Please confirm this is your correct Grama Niladhari Division:', 'මෙය ඔබගේ නිවැරදි ග්‍රාම නිලධාරී වසම දැයි තහවුරු කරන්න:', 'இது சரியான கிராம உத்தியோகத்தர் பிரிவு என உறுதிப்படுத்தவும்:')}</Typography>
        <Box sx={{ bgcolor: '#f8fafc', borderRadius: `${T.field}px`, p: 1.5, border: `1px solid ${T.lineSoft}` }}>
          <InfoRow icon={<LocationCityRoundedIcon />} label={L('District', 'දිස්ත්‍රික්කය', 'மாவட்டம்')} value={gnData?.gnByCcode?.disEn} />
          <InfoRow icon={<LocationCityRoundedIcon />} label={L('DS Division', 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය', 'பிரதேச செயலகம்')} value={gnData?.gnByCcode?.dsEn} />
          <InfoRow icon={<PlaceOutlinedIcon />} label={L('Village / GN Division', 'ග්‍රාම නිලධාරී වසම', 'கிராம உத்தியோகத்தர் பிரிவு')} value={gnData?.gnByCcode?.nameEn} />
        </Box>
      </SurveyDialog>

      {/* ─── Survey Metadata Popup ───────────────────────────────────────── */}
      <SurveyDialog
        open={showMetadataPopup && !surveyStartTime}
        icon={<BadgeOutlinedIcon />}
        title={L('Survey Information', 'සමීක්ෂණ තොරතුරු', 'கணக்கெடுப்பு தகவல்')}
        actions={<Box role="button" sx={btnPrimary} onClick={() => { setSurveyStartTime(new Date()); setShowMetadataPopup(false); setShowGpsPopup(true); }}>{L('Begin Survey', 'සමීක්ෂණය අරඹන්න', 'தொடங்கு')}</Box>}
      >
        <Box sx={{ bgcolor: '#f8fafc', borderRadius: `${T.field}px`, p: 1.5, border: `1px solid ${T.lineSoft}`, mb: 1.5 }}>
          <InfoRow icon={<PlaceOutlinedIcon />} label={L('Village / GN Division', 'ග්‍රාම නිලධාරි වසම', 'கிராம பிரிவு')} value={gnData?.gnByCcode?.nameEn} />
          <InfoRow icon={<LocationCityRoundedIcon />} label={L('DS Division', 'ප්‍රාදේශීය ලේකම් කොට්ඨාශය', 'பிரதேச செயலகம்')} value={gnData?.gnByCcode?.dsEn} />
          <InfoRow icon={<CalendarTodayRoundedIcon />} label={L('Survey Date', 'සමීක්ෂණ දිනය', 'தேதி')} value={new Date().toLocaleDateString()} />
          <InfoRow icon={<PersonOutlineRoundedIcon />} label={L('Surveyor Name', 'සමීක්ෂකගේ නම', 'ஆய்வாளர்')} value={userInfo?.name || 'Unknown'} />
        </Box>
        <Typography sx={{ fontSize: '0.8rem', color: T.muted, lineHeight: 1.5 }}>
          {L('The start time is recorded when you begin. The end time is recorded when you submit the form.', 'ඔබ අරඹන විට ආරම්භක වේලාව සටහන් වේ. අවසන් වේලාව පෝරමය ඉදිරිපත් කිරීමේදී සටහන් වේ.', 'தொடங்கும் போது தொடக்க நேரம் பதிவாகும். சமர்ப்பிக்கும் போது முடிவு நேரம் பதிவாகும்.')}
        </Typography>
      </SurveyDialog>

      {/* ─── GPS Confirmation Popup ──────────────────────────────────────── */}
      <SurveyDialog
        open={showGpsPopup}
        icon={<MyLocationRoundedIcon />}
        title={L('GPS Coordinates', 'භූගෝලීය ඛණ්ඩාංක (GPS)', 'GPS ஆயத்தொலைவுகள்')}
        actions={<>
          <Box role="button" sx={btnGhost} onClick={() => setShowGpsPopup(false)}>{L('Skip', 'මඟ හරින්න', 'தவிர்')}</Box>
          <Box role="button" sx={btnPrimary} onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => { setGpsCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude }); setShowGpsPopup(false); },
                (err) => {
                  console.error('Geolocation Error:', err);
                  let msg = L('Failed to get location.', 'ස්ථානය ලබා ගැනීමට නොහැකි විය.');
                  if (err.code === err.PERMISSION_DENIED) msg = L('Location permission denied. Please check your browser settings.', 'ස්ථානය ලබා ගැනීමට අවසර ලබා දී නොමැත. කරුණාකර බ්‍රවුසරයේ සැකසුම් පරීක්ෂා කරන්න.');
                  else if (err.code === err.POSITION_UNAVAILABLE) msg = L('Location information is unavailable.', 'ස්ථාන තොරතුරු ලබා ගත නොහැක.');
                  else if (err.code === err.TIMEOUT) msg = L('The request to get user location timed out.', 'ස්ථානය ලබා ගැනීමේ කාලය ඉකුත් විය.');
                  setGpsErrorPopup(msg);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
              );
            } else {
              setGpsErrorPopup(L('Geolocation is not supported by this browser.', 'ඔබගේ බ්‍රවුසරය GPS සඳහා සහය නොදක්වයි.'));
            }
          }}>{L('Use my location', 'මගේ ස්ථානය භාවිතා කරන්න', 'எனது இடம்')}</Box>
        </>}
      >
        <Typography>{L('Are you currently at the correct survey location? If yes, the location will be recorded automatically.', 'ඔබ දැනට සිටින්නේ නිවැරදි සමීක්ෂණ ස්ථානයේ ද? ඔව් නම්, ස්ථානය ස්වයංක්‍රීයව සටහන් වේ.', 'நீங்கள் சரியான இடத்தில் உள்ளீர்களா? ஆம் எனில் இடம் தானாக பதிவாகும்.')}</Typography>
      </SurveyDialog>

      {/* ─── Resume Draft Popup ──────────────────────────────────────────── */}
      <SurveyDialog
        open={showResumePopup}
        icon={<RestartAltRoundedIcon />}
        title={L('Unfinished Survey Found', 'අසම්පූර්ණ සමීක්ෂණයක් සොයා ගන්නා ලදී', 'முடிக்கப்படாத கணக்கெடுப்பு')}
        actions={<>
          <Box role="button" sx={btnDanger} onClick={() => { localStorage.removeItem(`survey_draft_${ccode}`); setShowResumePopup(false); setShowMetadataPopup(true); }}>{L('Start New', 'අලුතින් ආරම්භ කරන්න', 'புதிதாக')}</Box>
          <Box role="button" sx={btnPrimary} onClick={() => {
            const draftStr = localStorage.getItem(`survey_draft_${ccode}`);
            if (draftStr) {
              const draft = JSON.parse(draftStr);
              setFormValues(draft.formValues || {});
              setGpsCoordinates(draft.gpsCoordinates || null);
              if (draft.currentStep !== undefined) setCurrentStep(draft.currentStep);
              if (draft.surveyStartTime) setSurveyStartTime(new Date(draft.surveyStartTime));
            }
            setShowResumePopup(false);
          }}>{L('Resume', 'නැවත ආරම්භ කරන්න', 'தொடரவும்')}</Box>
        </>}
      >
        <Typography>{L('There is an unfinished survey for this Village. Do you want to resume where you left off, or start a new survey?', 'මෙම ග්‍රාම නිලධාරී වසම සඳහා ඔබ මින් පෙර ආරම්භ කළ අසම්පූර්ණ සමීක්ෂණයක් ඇත. එය නැවත ආරම්භ කිරීමට හෝ අලුතින් ආරම්භ කිරීමට කැමතිද?', 'இந்த கிராமத்திற்கு முடிக்கப்படாத கணக்கெடுப்பு உள்ளது. தொடர விரும்புகிறீர்களா அல்லது புதிதாக தொடங்கவா?')}</Typography>
      </SurveyDialog>

      {/* ─── Submit Confirmation Dialog ──────────────────────────────────── */}
      <SurveyDialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        icon={<TaskAltRoundedIcon />}
        tone="accent"
        title={L('Confirm Submission', 'තහවුරු කරන්න', 'சமர்ப்பிப்பை உறுதிப்படுத்து')}
        actions={<>
          <Box role="button" sx={btnGhost} onClick={() => setSubmitDialogOpen(false)}>{L('Cancel', 'අවලංගු කරන්න', 'ரத்து')}</Box>
          <Box role="button" sx={btnAccent} onClick={() => { setSubmitDialogOpen(false); handleSubmit(); }}>{L('Confirm & Submit', 'තහවුරු කර ඉදිරිපත් කරන්න', 'உறுதிப்படுத்து')}</Box>
        </>}
      >
        <Typography sx={{ mb: 1.5 }}>{L('Please review all your details. You can go back and check before submitting. Once confirmed, the data will be securely saved.', 'ඔබගේ සියලුම තොරතුරු නිවැරදි දැයි තහවුරු කරගන්න. ඉදිරිපත් කිරීමට පෙර ආපසු ගොස් පරීක්ෂා කළ හැක. තහවුරු කළ පසු දත්ත ආරක්ෂිතව සුරැකේ.', 'உங்கள் விவரங்களை சரிபார்க்கவும். உறுதிப்படுத்திய பின் தரவு பாதுகாப்பாக சேமிக்கப்படும்.')}</Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.6, borderRadius: '999px', bgcolor: T.accentSoft, border: '1px solid #d1fae5' }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>{Object.keys(formValues).length}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#047857' }}>{L('fields captured', 'ක්ෂේත්‍ර ඇතුළත් කර ඇත', 'புலங்கள்')}</Typography>
        </Box>
      </SurveyDialog>

      {/* ─── GPS Error Popup ─────────────────────────────────────────────── */}
      <SurveyDialog
        open={!!gpsErrorPopup}
        tone="danger"
        icon={<ErrorOutlineRoundedIcon />}
        title={L('Error', 'දෝෂයකි', 'பிழை')}
        actions={<>
          <Box role="button" sx={btnGhost} onClick={() => { setGpsErrorPopup(null); setShowGpsPopup(false); }}>{L('Cancel', 'අවලංගු කරන්න', 'ரத்து')}</Box>
          <Box role="button" sx={btnPrimary} onClick={() => setGpsErrorPopup(null)}>{L('Try Again', 'නැවත උත්සාහ කරන්න', 'மீண்டும்')}</Box>
        </>}
      >
        <Typography sx={{ mb: 1.5 }}>{gpsErrorPopup}</Typography>
        <Typography sx={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.5 }}>{L('Click the lock icon in the address bar, allow Location access, and try again.', 'කරුණාකර ඔබගේ බ්‍රවුසරයේ ඉහළ ඇති ලොක් (Lock) අයිකනය ක්ලික් කර "Location" සඳහා අවසර ලබා දී නැවත උත්සාහ කරන්න.', 'முகவரிப் பட்டியில் உள்ள பூட்டு ஐகானை கிளிக் செய்து இட அணுகலை அனுமதிக்கவும்.')}</Typography>
      </SurveyDialog>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={showLocationSelector}
        onLocationSelected={(gn) => {
          setShowLocationSelector(false);
          const formattedGnName = encodeURIComponent(gn.nameEn.replace(/ /g, '-'));
          navigate(`/industry-survey/${formattedGnName}/${gn.CCODE}`, { state: { fromSelector: true } });
        }}
      />

      <GnPageFooter />
    </Box>
  );

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
        <Dialog open={!!ccode && !locationConfirmed && !showLocationSelector && !!gnData?.gnByCcode} onClose={() => {}}>
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
        <Dialog open={showMetadataPopup && !surveyStartTime} onClose={() => {}}>
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
        <Dialog open={showGpsPopup} onClose={() => {}}>
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
        <Dialog open={!!gpsWrongLocationPopup} onClose={() => {}} maxWidth="sm" fullWidth>
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
        <Dialog open={showResumePopup} onClose={() => {}}>
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
        <Dialog open={otpDialogOpen} onClose={() => {}}>
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
        <Dialog open={!!gpsErrorPopup} onClose={() => {}}>
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





