import React, { useState, useEffect } from 'react';
import GnTopHeaderBar from '../components/GnTopHeaderBar';
import GnPageFooter from '../components/GnPageFooter';
import { Box, Typography, Button, Container, TextField, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import { useQuery } from '@apollo/client';
import { GET_QUESTIONS, GET_GN_BY_CCODE } from '../graphql/queries';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LocationSelectorModal from '../components/LocationSelectorModal';

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
  const { isAuthenticated, login, isLoading, userInfo } = useAuth();
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
  const [submitSuccessData, setSubmitSuccessData] = useState<{startTime: string, endTime: string} | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showMetadataPopup, setShowMetadataPopup] = useState(false);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showGpsPopup, setShowGpsPopup] = useState(false);
  const [gpsErrorPopup, setGpsErrorPopup] = useState<string | null>(null);
  const [surveyStartTime, setSurveyStartTime] = useState<Date | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Reset state on location change
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
        const draftStr = localStorage.getItem(`survey_draft_${ccode}`);
        if (draftStr) {
          setShowResumePopup(true);
        } else {
          setShowMetadataPopup(true);
        }
      } else {
        setLocationConfirmed(false);
      }
    }
  }, [ccode, gnName, locationState]);

  useEffect(() => {
    if (surveyStartTime && ccode) {
      localStorage.setItem(`survey_draft_${ccode}`, JSON.stringify({
        formValues,
        currentStep,
        surveyStartTime: surveyStartTime.toISOString(),
        gpsCoordinates,
      }));
    }
  }, [formValues, surveyStartTime, gpsCoordinates, currentStep, ccode]);

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

  const handleInputChange = (id: string, val: string) => {
    setFormValues(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const endTime = new Date();
    console.log("Survey Metadata:", {
      gn: gnData?.gnByCcode?.nameEn,
      ds: gnData?.gnByCcode?.dsEn,
      date: new Date().toLocaleDateString(),
      surveyor: userInfo?.name,
      startTime: surveyStartTime?.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      gps: gpsCoordinates,
    });
    console.log("Form Values:", formValues);
    
    alert(`Survey submitted successfully!\nStart Time: ${surveyStartTime?.toLocaleTimeString()}\nEnd Time: ${endTime.toLocaleTimeString()}`);
    if (ccode) {
      localStorage.removeItem(`survey_draft_${ccode}`);
    }
    // TODO: implement actual submission
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
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {currentStep === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                      {language === 'si' ? 'ව්‍යාපාර හිමිකරු පිළිබඳ තොරතුරු' : language === 'ta' ? 'வணிக உரிமையாளர் தகவல்' : 'Business Owner Information'}
                    </Typography>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'හිමිකරුගේ සම්පූර්ණ නම' : language === 'ta' ? 'உரிமையாளரின் முழு பெயர்' : "Owner's Full Name"}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" value={formValues['q_owner_name'] || ''} onChange={(e) => handleInputChange('q_owner_name', e.target.value)} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ස්ත්‍රී/පුරුෂ භාවය' : language === 'ta' ? 'பாலினம்' : 'Gender'}
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_gender'] || ''} onChange={(e) => handleInputChange('q_gender', e.target.value as string)}>
                          <MenuItem value="1. පිරිමි">{language === 'si' ? '1. පිරිමි' : language === 'ta' ? '1. ஆண்' : '1. Male'}</MenuItem>
                          <MenuItem value="2. ගැහැණු">{language === 'si' ? '2. ගැහැණු' : language === 'ta' ? '2. பெண்' : '2. Female'}</MenuItem>
                          <MenuItem value="3. වෙනත්">{language === 'si' ? '3. වෙනත්' : language === 'ta' ? '3. மற்றவை' : '3. Other'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය' : language === 'ta' ? 'தேசிய அடையாள அட்டை எண்' : 'National Identity Card Number (NIC)'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'උපන් දිනය / වයස' : language === 'ta' ? 'பிறந்த தேதி / வயது' : 'Date of Birth / Age'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" value={formValues['q_dob_age'] || ''} disabled sx={{ bgcolor: 'grey.100' }} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'වට්ස්ඇප් දුරකථන අංකය' : language === 'ta' ? 'வாட்ஸ்அப் எண்' : 'WhatsApp Number'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['q_whatsapp'] || ''} onChange={(e) => handleInputChange('q_whatsapp', e.target.value)} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ප්‍රධාන දුරකථන අංකය' : language === 'ta' ? 'முக்கிய தொலைபேசி எண்' : 'Main Phone Number'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" type="tel" value={formValues['q_mobile'] || ''} onChange={(e) => handleInputChange('q_mobile', e.target.value)} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'විද්‍යුත් තැපැල් ලිපිනය (ඇත්නම්)' : language === 'ta' ? 'மின்னஞ்சல் முகவரி (ஏதேனும் இருந்தால்)' : 'Email Address (if any)'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" type="email" value={formValues['q_email'] || ''} onChange={(e) => handleInputChange('q_email', e.target.value)} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'නිවැසි ලිපිනය' : language === 'ta' ? 'குடியிருப்பு முகவரி' : 'Residential Address'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_address'] || ''} onChange={(e) => handleInputChange('q_address', e.target.value)} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'උසස්ම අධ්‍යාපන සුදුසුකම' : language === 'ta' ? 'மிக உயர்ந்த கல்வித் தகுதி' : 'Highest Educational Qualification'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'මෙම කර්මාන්තයේ පළපුරුද්ද (වසර)' : language === 'ta' ? 'இந்தத் துறையில் அனுபவம் (ஆண்டுகள்)' : 'Experience in this Industry (Years)'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" type="number" value={formValues['q_experience'] || ''} onChange={(e) => handleInputChange('q_experience', e.target.value)} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'කර්මාන්තය ආරම්භ කිරීමට පෙර රැකියාව' : language === 'ta' ? 'தொழில் தொடங்கும் முன் வேலைவாய்ப்பு' : 'Occupation before starting the industry'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" value={formValues['q_prev_occupation'] || ''} onChange={(e) => handleInputChange('q_prev_occupation', e.target.value)} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(1)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
                {currentStep === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                      {language === 'si' ? 'ව්‍යාපාරයේ නීතිමය තත්ත්වය' : language === 'ta' ? 'வணிகத்தின் சட்ட நிலை' : 'Legal Status of the Business'}
                    </Typography>

                    {/* Legal Status */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ව්‍යාපාරයේ නීතිමය ස්වරූපය කුමක්ද?' : language === 'ta' ? 'வணிகத்தின் சட்ட வடிவம் என்ன?' : 'What is the legal form of the business?'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ව්‍යාපාරය ලියාපදිංචි කර තිබේද?' : language === 'ta' ? 'வணிகம் பதிவு செய்யப்பட்டுள்ளதா?' : 'Is the business registered?'}
                      </Typography>
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
                        <Typography variant="subtitle1" fontWeight="600" mb={1}>
                          {language === 'si' ? 'ලියාපදිංචි කර ඇත්නම්, කුමන ආයතනයක් සමඟද? (බහුවරණය)' : language === 'ta' ? 'பதிவு செய்திருந்தால், எந்த நிறுவனத்துடன்?' : 'If registered, with which agency? (Multiple Choice)'}
                        </Typography>
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
                        <Typography variant="subtitle1" fontWeight="600" mb={1}>
                          {language === 'si' ? 'ලියාපදිංචි අංක(ය)' : language === 'ta' ? 'பதிவு எண்(கள்)' : 'Registration Number(s)'}
                        </Typography>
                        <TextField fullWidth variant="outlined" size="small" value={formValues['q_registration_number'] || ''} onChange={(e) => handleInputChange('q_registration_number', e.target.value)} />
                      </Box>
                    )}

                    {/* VAT Number */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? '(VAT) Number' : '(VAT) Number'}
                      </Typography>
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
                      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(3)}>
                        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                      </Button>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(2)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
                {currentStep === 2 && (
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ව්‍යාපාරය ක්‍රියාත්මක වන ස්ථානය කුමක්ද?' : language === 'ta' ? 'வணிகம் செயல்படும் இடம் எது?' : 'Where does the business operate?'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ව්‍යාපාරික ස්ථානයේ ලිපිනය' : language === 'ta' ? 'வணிக இடத்தின் முகவரி' : 'Business Location Address'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_business_address'] || ''} onChange={(e) => handleInputChange('q_business_address', e.target.value)} />
                    </Box>

                    {/* Branch Address */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ශාඛා ලිපින(ය) (ඇත්නම්)' : language === 'ta' ? 'கிளை முகவரி(கள்) (ஏதேனும் இருந்தால்)' : 'Branch Address(es) (if any)'}
                      </Typography>
                      <TextField fullWidth variant="outlined" size="small" multiline rows={2} value={formValues['q_branch_address'] || ''} onChange={(e) => handleInputChange('q_branch_address', e.target.value)} />
                    </Box>

                    {/* Location Ownership */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ස්ථානයේ හිමිකාරිත්වය' : language === 'ta' ? 'இடத்தின் உரிமை' : 'Location Ownership'}
                      </Typography>
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
                        <Typography variant="subtitle1" fontWeight="600" mb={1}>
                          {language === 'si' ? 'කුලියට ගෙන ඇත්නම්, මාසික කුලී මුදල' : language === 'ta' ? 'வாடகைக்கு எடுக்கப்பட்டிருந்தால், மாதாந்திர வாடகை' : 'If rented, monthly rent amount'}
                        </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ගොඩනැගිල්ල සඳහා බද්දක් ගෙවන්නේද?' : language === 'ta' ? 'கட்டிடத்திற்கு வரி செலுத்துகிறீர்களா?' : 'Do you pay a tax for the building?'}
                      </Typography>
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
                      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(1)}>
                        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                      </Button>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(3)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
                {currentStep === 3 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>
                      {language === 'si' ? 'යටිතල පහසුකම් හා සේවා' : language === 'ta' ? 'உள்கட்டமைப்பு மற்றும் சேவைகள்' : 'Infrastructure and Services'}
                    </Typography>

                    {/* Uses Electricity */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'විදුලිය භාවිතා කරන්නේද?' : language === 'ta' ? 'மின்சாரம் பயன்படுத்துகிறீர்களா?' : 'Do you use electricity?'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ප්‍රධාන බලශක්ති ප්‍රභවය කුමක්ද?' : language === 'ta' ? 'முக்கிய ஆற்றல் ஆதாரம் என்ன?' : 'What is the main energy source? (Multiple)'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'සතියකට සාමාන්‍යයෙන් විදුලිය ඇනහිටීම් කීයක් සිදුවේද?' : language === 'ta' ? 'வாரத்திற்கு சராசரியாக எத்தனை முறை மின் தடை ஏற்படுகிறது?' : 'How many power outages occur per week on average?'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ජලය ලබා ගන්නේ කෙසේද?' : language === 'ta' ? 'தண்ணீர் எப்படி பெறுவது?' : 'How is water obtained?'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'ජලය ගබඩා කිරීමේ පහසුකමක් තිබේද?' : language === 'ta' ? 'நீர் சேமிப்பு வசதி உள்ளதா?' : 'Is there a water storage facility?'}
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select value={formValues['q_water_storage'] || ''} onChange={(e) => handleInputChange('q_water_storage', e.target.value as string)}>
                          <MenuItem value="1. ඔව්">{language === 'si' ? '1. ඔව්' : '1. Yes'}</MenuItem>
                          <MenuItem value="2. නැත">{language === 'si' ? '2. නැත' : '2. No'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Internet Access */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'අන්තර්ජාල පහසුකම තිබේද?' : language === 'ta' ? 'இணைய வசதி உள்ளதா?' : 'Is there internet access?'}
                      </Typography>
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
                      <Typography variant="subtitle1" fontWeight="600" mb={1}>
                        {language === 'si' ? 'දුරකථන සේවාව තිබේද?' : language === 'ta' ? 'தொலைபேசி சேவை உள்ளதா?' : 'Is there telephone service? (Multiple)'}
                      </Typography>
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
                      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(2)}>
                        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
                      </Button>
                      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(4)}>
                        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                )}

                
{currentStep === 4 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>3 වන කොටස: ප්‍රාග්ධනය සපයාගත් ආකාරය (Capital Sources)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'ආරම්භක ප්‍රාග්ධනය ලබාගත් මූලාශ්‍ර (Multiple Select)' : 'ආරම්භක ප්‍රාග්ධනය ලබාගත් මූලාශ්‍ර (Multiple Select)'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'ව්‍යාපාරයේ පරිමාණය' : 'ව්‍යාපාරයේ පරිමාණය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'ව්‍යාපාරයේ නියැලීමේ ස්වභාවය' : 'ව්‍යාපාරයේ නියැලීමේ ස්වභාවය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'ව්‍යාපාරය සිදුකරන ස්ථානය' : 'ව්‍යාපාරය සිදුකරන ස්ථානය'}</Typography>
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
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(3)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(5)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
    </Box>
  </Box>
)}
{currentStep === 5 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>4 වන කොටස: ශ්‍රම බලකාය හා මානව සම්පත් (Workforce & Human Resources)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.1.1 ව්‍යාපාරයේ සේවය කරන මුළු පුද්ගලයින් සංඛ්‍යාව (ඔබ ඇතුළුව)' : '4.1.1 ව්‍යාපාරයේ සේවය කරන මුළු පුද්ගලයින් සංඛ්‍යාව (ඔබ ඇතුළුව)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_total_workers'] || ''} onChange={(e) => handleInputChange('q_total_workers', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.1.2 ඉන් කාන්තාවන් සංඛ්‍යාව' : '4.1.2 ඉන් කාන්තාවන් සංඛ්‍යාව'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_female_workers'] || ''} onChange={(e) => handleInputChange('q_female_workers', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.1.3 ඉන් පිරිමි සංඛ්‍යාව' : '4.1.3 ඉන් පිරිමි සංඛ්‍යාව'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_male_workers'] || ''} onChange={(e) => handleInputChange('q_male_workers', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.1.4 ගෙවන සේවකයින් සංඛ්‍යාව' : '4.1.4 ගෙවන සේවකයින් සංඛ්‍යාව'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_paid_workers'] || ''} onChange={(e) => handleInputChange('q_paid_workers', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.1.5 වැටුප් නොලබන පවුලේ සාමාජිකයින් සංඛ්‍යාව' : '4.1.5 වැටුප් නොලබන පවුලේ සාමාජිකයින් සංඛ්‍යාව'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_unpaid_family_workers'] || ''} onChange={(e) => handleInputChange('q_unpaid_family_workers', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.1.6 වරින් වර/කොන්ත්‍රාත් සේවය කරන අය සංඛ්‍යාව' : '4.1.6 වරින් වර/කොන්ත්‍රාත් සේවය කරන අය සංඛ්‍යාව'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number"  value={formValues['q_contract_workers'] || ''} onChange={(e) => handleInputChange('q_contract_workers', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.2.1 ශ්‍රම දායකත්වයේ ස්වභාවය' : '4.2.1 ශ්‍රම දායකත්වයේ ස්වභාවය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.2.2 සේවකයින්ට පුහුණුව ලබා දෙනවාද?' : '4.2.2 සේවකයින්ට පුහුණුව ලබා දෙනවාද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_provides_training'] || ''} onChange={(e) => handleInputChange('q_provides_training', e.target.value as string)}>
      <MenuItem value="1. ඔව් (විධිමත්)">1. ඔව් (විධිමත්)</MenuItem>
      <MenuItem value="2. ඔව් (රැකියාවේදී)">2. ඔව් (රැකියාවේදී)</MenuItem>
      <MenuItem value="3. නැත">3. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '4.2.3 සේවකයින් සඳහා EPF ගෙවීම් සිදු කරනවාද?' : '4.2.3 සේවකයින් සඳහා EPF ගෙවීම් සිදු කරනවාද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_pays_epf'] || ''} onChange={(e) => handleInputChange('q_pays_epf', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
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
    </Box>
  </Box>
)}
{currentStep === 6 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>5 වන කොටස: නිෂ්පාදන හා මෙහෙයුම් (Production & Operations)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.1.1 භාවිතා කරන ප්‍රධාන යන්ත්‍රෝපකරණ (උපරිම 5)' : '5.1.1 භාවිතා කරන ප්‍රධාන යන්ත්‍රෝපකරණ (උපරිම 5)'}</Typography>
  <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
    Upload Files
    <input type="file" hidden accept="image/*" multiple onChange={(e) => {
       if(e.target.files) {
          const names = Array.from(e.target.files).map(f => f.name).join(', ');
          handleInputChange('q_main_machinery', names);
       }
    }} />
  </Button>
  {formValues['q_main_machinery'] && <Typography variant="body2" mt={1}>Selected: {formValues['q_main_machinery']}</Typography>}
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.1.2 භාවිතා කරන ප්‍රධාන මෙවලම් (උපරිම 5)' : '5.1.2 භාවිතා කරන ප්‍රධාන මෙවලම් (උපරිම 5)'}</Typography>
  <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
    Upload Files
    <input type="file" hidden accept="image/*" multiple onChange={(e) => {
       if(e.target.files) {
          const names = Array.from(e.target.files).map(f => f.name).join(', ');
          handleInputChange('q_main_tools', names);
       }
    }} />
  </Button>
  {formValues['q_main_tools'] && <Typography variant="body2" mt={1}>Selected: {formValues['q_main_tools']}</Typography>}
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.1.3 යන්ත්‍රෝපකරණවල ආසන්න වටිනාකම' : '5.1.3 යන්ත්‍රෝපකරණවල ආසන්න වටිනාකම'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_machinery_value'] || ''} onChange={(e) => handleInputChange('q_machinery_value', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.1.4 යන්ත්‍රෝපකරණ ලබාගත් ආකාරය' : '5.1.4 යන්ත්‍රෝපකරණ ලබාගත් ආකාරය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.2.1 දිනකට නිෂ්පාදනය කරන ප්‍රමාණය' : '5.2.1 දිනකට නිෂ්පාදනය කරන ප්‍රමාණය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_daily'] || ''} onChange={(e) => handleInputChange('q_production_daily', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.2.2 සතියකට නිෂ්පාදනය කරන ප්‍රමාණය' : '5.2.2 සතියකට නිෂ්පාදනය කරන ප්‍රමාණය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_weekly'] || ''} onChange={(e) => handleInputChange('q_production_weekly', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.2.3 මාසයකට නිෂ්පාදනය කරන ප්‍රමාණය' : '5.2.3 මාසයකට නිෂ්පාදනය කරන ප්‍රමාණය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_monthly'] || ''} onChange={(e) => handleInputChange('q_production_monthly', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.2.4 වාර්ෂික නිෂ්පාදන ප්‍රමාණය (ඇස්තමේන්තුව)' : '5.2.4 වාර්ෂික නිෂ්පාදන ප්‍රමාණය (ඇස්තමේන්තුව)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> ඒකක </Typography> }} value={formValues['q_production_yearly'] || ''} onChange={(e) => handleInputChange('q_production_yearly', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.2.5 නිෂ්පාදන ධාරිතාවයේ භාවිත ප්‍රතිශතය' : '5.2.5 නිෂ්පාදන ධාරිතාවයේ භාවිත ප්‍රතිශතය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> % </Typography> }} value={formValues['q_production_capacity'] || ''} onChange={(e) => handleInputChange('q_production_capacity', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.2.6 දිනකට මෙහෙයුම් පැය ගණන' : '5.2.6 දිනකට මෙහෙයුම් පැය ගණන'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> පැය </Typography> }} value={formValues['q_operating_hours'] || ''} onChange={(e) => handleInputChange('q_operating_hours', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.3.1 භාවිතා කරන ප්‍රධාන අමුද්‍රව්‍ය (උපරිම 5)' : '5.3.1 භාවිතා කරන ප්‍රධාන අමුද්‍රව්‍ය (උපරිම 5)'}</Typography>
  <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
    Upload Files
    <input type="file" hidden accept="image/*" multiple onChange={(e) => {
       if(e.target.files) {
          const names = Array.from(e.target.files).map(f => f.name).join(', ');
          handleInputChange('q_main_materials', names);
       }
    }} />
  </Button>
  {formValues['q_main_materials'] && <Typography variant="body2" mt={1}>Selected: {formValues['q_main_materials']}</Typography>}
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.3.2 අමුද්‍රව්‍ය සපයා ගන්නා ආකාරය' : '5.3.2 අමුද්‍රව්‍ය සපයා ගන්නා ආකාරය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.3.3 අමුද්‍රව්‍ය සඳහා බලපත්‍රයක් අවශ්‍යද?' : '5.3.3 අමුද්‍රව්‍ය සඳහා බලපත්‍රයක් අවශ්‍යද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_material_license_req'] || ''} onChange={(e) => handleInputChange('q_material_license_req', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_material_license_req'] === '1. ඔව්' && (
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.3.4 බලපත්‍රය අවශ්‍ය නම් කුමන ආයතනයෙන්ද?' : '5.3.4 බලපත්‍රය අවශ්‍ය නම් කුමන ආයතනයෙන්ද?'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.3.5 අමුද්‍රව්‍ය සඳහා මාසික වියදම' : '5.3.5 අමුද්‍රව්‍ය සඳහා මාසික වියදම'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_material_cost'] || ''} onChange={(e) => handleInputChange('q_material_cost', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.4.1 අපද්‍රව්‍ය බැහැර කරන ආකාරය' : '5.4.1 අපද්‍රව්‍ය බැහැර කරන ආකාරය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.4.2 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණය කරනවාද?' : '5.4.2 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණය කරනවාද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_waste_recycled'] || ''} onChange={(e) => handleInputChange('q_waste_recycled', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '5.4.3 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණයෙන් ආදායමක් ලැබේද?' : '5.4.3 අපද්‍රව්‍ය ප්‍රතිචක්‍රීකරණයෙන් ආදායමක් ලැබේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_waste_income'] || ''} onChange={(e) => handleInputChange('q_waste_income', e.target.value as string)}>
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
    </Box>
  </Box>
)}
{currentStep === 7 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>6 වන කොටස: මූල්‍ය හා ගිණුම්කරණය (Finance & Accounting)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.1 ලාභය ගණනය කර තිබේද?' : '6.1.1 ලාභය ගණනය කර තිබේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_profit_calculated'] || ''} onChange={(e) => handleInputChange('q_profit_calculated', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_profit_calculated'] === '1. ඔව්' && (
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'ලාභ ප්‍රතිශතය' : 'ලාභ ප්‍රතිශතය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> % </Typography> }} value={formValues['q_profit_percentage'] || ''} onChange={(e) => handleInputChange('q_profit_percentage', e.target.value)} />
</Box>
)}

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.2 ඒකක නිෂ්පාදන පිරිවැය ගණනය කර තිබේද?' : '6.1.2 ඒකක නිෂ්පාදන පිරිවැය ගණනය කර තිබේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_cost_calculated'] || ''} onChange={(e) => handleInputChange('q_cost_calculated', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

{formValues['q_cost_calculated'] === '1. ඔව්' && (
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'එක් ඒකකයක පිරිවැය' : 'එක් ඒකකයක පිරිවැය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_unit_cost'] || ''} onChange={(e) => handleInputChange('q_unit_cost', e.target.value)} />
</Box>
)}

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.3 මාසික ආදායම (ආසන්න)' : '6.1.3 මාසික ආදායම (ආසන්න)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_monthly_income'] || ''} onChange={(e) => handleInputChange('q_monthly_income', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.4 මාසික වියදම (ආසන්න)' : '6.1.4 මාසික වියදම (ආසන්න)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_monthly_expense'] || ''} onChange={(e) => handleInputChange('q_monthly_expense', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.5 මාසික ශුද්ධ ලාභය (ආසන්න)' : '6.1.5 මාසික ශුද්ධ ලාභය (ආසන්න)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_monthly_net_profit'] || ''} onChange={(e) => handleInputChange('q_monthly_net_profit', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.6 ව්‍යාපාරය ලාභ සහිතව කරගෙන යනවාද?' : '6.1.6 ව්‍යාපාරය ලාභ සහිතව කරගෙන යනවාද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_profitable'] || ''} onChange={(e) => handleInputChange('q_profitable', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
      <MenuItem value="3. සමහර විට">3. සමහර විට</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.7 ණය ගෙවීමේ වාරික (මාසික)' : '6.1.7 ණය ගෙවීමේ වාරික (මාසික)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_loan_installment'] || ''} onChange={(e) => handleInputChange('q_loan_installment', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.8 ව්‍යාපාරයක් ලෙස ගෙවිය යුතු මුළු ණය ප්‍රමාණය' : '6.1.8 ව්‍යාපාරයක් ලෙස ගෙවිය යුතු මුළු ණය ප්‍රමාණය'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_total_loan'] || ''} onChange={(e) => handleInputChange('q_total_loan', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.1.9 පුද්ගලිකව ණය වී ඇති ප්‍රමාණය (ව්‍යාපාරය සඳහා)' : '6.1.9 පුද්ගලිකව ණය වී ඇති ප්‍රමාණය (ව්‍යාපාරය සඳහා)'}</Typography>
  <TextField fullWidth variant="outlined" size="small" type="number" InputProps={{ endAdornment: <Typography sx={{ml: 1, color: 'text.secondary'}}> රු. </Typography> }} value={formValues['q_personal_loan'] || ''} onChange={(e) => handleInputChange('q_personal_loan', e.target.value)} />
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.2.1 ව්‍යාපාරය සඳහා බැංකු ගිණුමක් තිබේද?' : '6.2.1 ව්‍යාපාරය සඳහා බැංකු ගිණුමක් තිබේද?'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'බැංකුව' : 'බැංකුව'}</Typography>
  <TextField fullWidth variant="outlined" size="small" value={formValues['q_bank_name'] || ''} onChange={(e) => handleInputChange('q_bank_name', e.target.value)} />
</Box>
)}

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.2.2 මූල්‍ය වාර්තා තබා ගන්නේද?' : '6.2.2 මූල්‍ය වාර්තා තබා ගන්නේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_financial_records'] || ''} onChange={(e) => handleInputChange('q_financial_records', e.target.value as string)}>
      <MenuItem value="1. ඔව්, විධිමත්ව">1. ඔව්, විධිමත්ව</MenuItem>
      <MenuItem value="2. ඔව්, සරලව (පොතක)">2. ඔව්, සරලව (පොතක)</MenuItem>
      <MenuItem value="3. නැත">3. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.2.3 හිමිකරු ව්‍යාපාරයෙන් වැටුපක් ලබා ගන්නේද?' : '6.2.3 හිමිකරු ව්‍යාපාරයෙන් වැටුපක් ලබා ගන්නේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_receives_salary'] || ''} onChange={(e) => handleInputChange('q_receives_salary', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත, ලාභය පමණයි">2. නැත, ලාභය පමණයි</MenuItem>
      <MenuItem value="3. නැත, මුදල් අවශ්‍ය විට ලබා ගනී">3. නැත, මුදල් අවශ්‍ය විට ලබා ගනී</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '6.2.4 ලාභය, ආදායම සහ වියදම අතර වෙනස දන්නවාද?' : '6.2.4 ලාභය, ආදායම සහ වියදම අතර වෙනස දන්නවාද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_knows_financial_concepts'] || ''} onChange={(e) => handleInputChange('q_knows_financial_concepts', e.target.value as string)}>
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
    </Box>
  </Box>
)}
{currentStep === 8 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>7 වන කොටස: වෙළඳපොළ හා අලෙවිකරණය (Market & Marketing)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?' : '7.1.1 ප්‍රධාන ගැනුම්කරුවන් කවුද?'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.1.2 වෙළඳපොළේ පැතිරීම' : '7.1.2 වෙළඳපොළේ පැතිරීම'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.1.3 පාරිභෝගිකයින්ගේ ප්‍රවණතාවය' : '7.1.3 පාරිභෝගිකයින්ගේ ප්‍රවණතාවය'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_customer_trend'] || ''} onChange={(e) => handleInputChange('q_customer_trend', e.target.value as string)}>
      <MenuItem value="1. වැඩි වෙමින් පවතී">1. වැඩි වෙමින් පවතී</MenuItem>
      <MenuItem value="2. අඩු වෙමින් පවතී">2. අඩු වෙමින් පවතී</MenuItem>
      <MenuItem value="3. වෙනසක් නැත">3. වෙනසක් නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.2.1 තරඟකරුවන් සිටීද?' : '7.2.1 තරඟකරුවන් සිටීද?'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.2.2 තරඟකරුවන්ගෙන් වන බලපෑම' : '7.2.2 තරඟකරුවන්ගෙන් වන බලපෑම'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.3.1 අලෙවිකරණ ක්‍රම' : '7.3.1 අලෙවිකරණ ක්‍රම'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '7.3.2 භාණ්ඩ සඳහා වෙළඳ නාමයක් (Brand) තිබේද?' : '7.3.2 භාණ්ඩ සඳහා වෙළඳ නාමයක් (Brand) තිබේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_has_brand'] || ''} onChange={(e) => handleInputChange('q_has_brand', e.target.value as string)}>
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
    </Box>
  </Box>
)}
{currentStep === 9 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>8 වන කොටස: නවෝත්පාදන හා තාක්ෂණය (Innovation & Technology)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '8.1.1 පසුගිය වසර 3 තුළ නව නිෂ්පාදන/සේවා හඳුන්වා දුන්නේද?' : '8.1.1 පසුගිය වසර 3 තුළ නව නිෂ්පාදන/සේවා හඳුන්වා දුන්නේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_new_products'] || ''} onChange={(e) => handleInputChange('q_new_products', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '8.1.2 පසුගිය වසර 3 තුළ නව තාක්ෂණයක් භාවිතා කළේද?' : '8.1.2 පසුගිය වසර 3 තුළ නව තාක්ෂණයක් භාවිතා කළේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_new_tech'] || ''} onChange={(e) => handleInputChange('q_new_tech', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '8.2.1 භාවිතා කරන තාක්ෂණික උපකරණ' : '8.2.1 භාවිතා කරන තාක්ෂණික උපකරණ'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '8.2.2 අන්තර්ජාලය ව්‍යාපාරික කටයුතු සඳහා භාවිතා කරන්නේද?' : '8.2.2 අන්තර්ජාලය ව්‍යාපාරික කටයුතු සඳහා භාවිතා කරන්නේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_uses_internet_for_business'] || ''} onChange={(e) => handleInputChange('q_uses_internet_for_business', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරන්නේද?' : '8.2.3 ඩිජිටල් ගෙවීම් ක්‍රම භාවිතා කරන්නේද?'}</Typography>
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
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(8)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(10)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
    </Box>
  </Box>
)}
{currentStep === 10 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>9 වන කොටස: ව්‍යාපාරික පරිසරය හා රාජ්‍ය මැදිහත්වීම (Business Environment & Government)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '9.1.1 ව්‍යාපාරය සතු ලියාපදිංචි සහතික' : '9.1.1 ව්‍යාපාරය සතු ලියාපදිංචි සහතික'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '9.1.2 ගෙවන බදු වර්ග' : '9.1.2 ගෙවන බදු වර්ග'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '9.2.1 රජයෙන් ලැබී ඇති සහාය' : '9.2.1 රජයෙන් ලැබී ඇති සහාය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'මූල්‍ය පහසුකම් ලබා ගැනීම' : 'මූල්‍ය පහසුකම් ලබා ගැනීම'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'යටිතල පහසුකම් (විදුලිය/ජලය)' : 'යටිතල පහසුකම් (විදුලිය/ජලය)'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'බදු අනුපාත' : 'බදු අනුපාත'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'පුහුණු ශ්‍රමිකයින් සොයා ගැනීම' : 'පුහුණු ශ්‍රමිකයින් සොයා ගැනීම'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'නීති හා රෙගුලාසි ක්‍රියා පටිපාටිය' : 'නීති හා රෙගුලාසි ක්‍රියා පටිපාටිය'}</Typography>
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
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(9)}>
        {language === 'si' ? 'පෙර' : language === 'ta' ? 'முந்தைய' : 'Previous'}
      </Button>
      <Button variant="contained" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(11)}>
        {language === 'si' ? 'ඊළඟ' : language === 'ta' ? 'அடுத்தது' : 'Next'}
      </Button>
    </Box>
  </Box>
)}
{currentStep === 11 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>10 වන කොටස: පාරිසරික හා සමාජීය බලපෑම (Environmental & Social Impact)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '10.1.1 පරිසරයට වන බලපෑම තක්සේරු කර තිබේද?' : '10.1.1 පරිසරයට වන බලපෑම තක්සේරු කර තිබේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_env_impact_assessed'] || ''} onChange={(e) => handleInputChange('q_env_impact_assessed', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '10.1.2 බලශක්තිය/ජලය ඉතිරි කිරීමට පියවර ගෙන තිබේද?' : '10.1.2 බලශක්තිය/ජලය ඉතිරි කිරීමට පියවර ගෙන තිබේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_energy_saving'] || ''} onChange={(e) => handleInputChange('q_energy_saving', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
    </Select>
  </FormControl>
</Box>

<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '10.2.1 ප්‍රජාව වෙනුවෙන් සමාජ සත්කාර (CSR) සිදු කරන්නේද?' : '10.2.1 ප්‍රජාව වෙනුවෙන් සමාජ සත්කාර (CSR) සිදු කරන්නේද?'}</Typography>
  <FormControl fullWidth size="small">
    <Select value={formValues['q_social_responsibility'] || ''} onChange={(e) => handleInputChange('q_social_responsibility', e.target.value as string)}>
      <MenuItem value="1. ඔව්">1. ඔව්</MenuItem>
      <MenuItem value="2. නැත">2. නැත</MenuItem>
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
    </Box>
  </Box>
)}
{currentStep === 12 && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 1 }}>11 වන කොටස: අනාගත අවශ්‍යතා සහ ලොජිස්ටික්ස් (Future Needs & Logistics)</Typography>
<Box>
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '11.1.1 ව්‍යාපාරය දියුණු කිරීමට ඇති සැලසුම්' : '11.1.1 ව්‍යාපාරය දියුණු කිරීමට ඇති සැලසුම්'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? '11.1.2 රජයෙන් හෝ වෙනත් ආයතන වලින් බලාපොරොත්තු වන සහාය' : '11.1.2 රජයෙන් හෝ වෙනත් ආයතන වලින් බලාපොරොත්තු වන සහාය'}</Typography>
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
  <Typography variant="subtitle1" fontWeight="600" mb={1}>{language === 'si' ? 'වෙනත් අදහස්/යෝජනා' : 'වෙනත් අදහස්/යෝජනා'}</Typography>
  <TextField fullWidth variant="outlined" size="small" multiline rows={3} value={formValues['q_additional_comments'] || ''} onChange={(e) => handleInputChange('q_additional_comments', e.target.value)} />
</Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button variant="outlined" color="primary" size="large" sx={{ borderRadius: '20px', py: 1.5, fontWeight: 'bold', width: '48%' }} onClick={() => setCurrentStep(11)}>
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
          <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {language === 'si' ? 'භූගෝලීය ඛණ්ඩාංක (GPS)' : language === 'ta' ? 'புவியியல் ஆயத்தொலைவுகள் (GPS)' : 'GPS Coordinates'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              {language === 'si' 
                ? 'ඔබ දැනට සිටින්නේ නිවැරදි සමීක්ෂණ ස්ථානයේ ද? (ඔව් නම්, ස්ථානය ස්වයංක්‍රීයව සටහන් වේ)' 
                : 'Are you currently at the correct survey location? (If Yes, location will be recorded automatically)'}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => {
                setShowGpsPopup(false);
              }}
            >
              {language === 'si' ? 'නැත' : 'No'}
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setGpsCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      });
                      setShowGpsPopup(false);
                    },
                    (error) => {
                      console.error("Geolocation Error:", error);
                      let errorMsg = language === 'si' ? 'ස්ථානය ලබා ගැනීමට නොහැකි විය.' : 'Failed to get location.';
                      
                      if (error.code === error.PERMISSION_DENIED) {
                        errorMsg = language === 'si' ? 'ස්ථානය ලබා ගැනීමට අවසර ලබා දී නොමැත. කරුණාකර බ්‍රවුසරයේ සැකසුම් පරීක්ෂා කරන්න (Location permission denied).' : 'Location permission denied. Please check your browser settings.';
                      } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMsg = language === 'si' ? 'ස්ථාන තොරතුරු ලබා ගත නොහැක (Location unavailable).' : 'Location information is unavailable.';
                      } else if (error.code === error.TIMEOUT) {
                        errorMsg = language === 'si' ? 'ස්ථානය ලබා ගැනීමේ කාලය ඉකුත් විය (Timeout).' : 'The request to get user location timed out.';
                      }

                      setGpsErrorPopup(errorMsg);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                  );
                } else {
                  setGpsErrorPopup(language === 'si' ? 'ඔබගේ බ්‍රවුසරය GPS සඳහා සහය නොදක්වයි.' : 'Geolocation is not supported by this browser.');
                }
              }}
            >
              {language === 'si' ? 'ඔව්' : 'Yes'}
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
