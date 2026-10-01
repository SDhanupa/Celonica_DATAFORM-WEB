import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/client';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { GET_GN_BY_COORDINATES, GET_P_DISTRICTS, GET_P_DISTRICT_WITH_GNS } from '../graphql/queries';
import { useAuth } from '../auth/AuthProvider';
import { ApiError, submitContribution, SubmitResult } from '../api/contributions';
import { fill, useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, villageName } from '../components/contribute/village';

interface ContributionForm {
  reg_number: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  name_singlish: string;
  raw_province: string;
  raw_district: string;
  raw_ds: string;
  raw_gn: string;
  gn_code: string;
  mobile: string;
  contact_person_name: string;
  address: string;
  longitude: string;
  latitude: string;
  image_path: string;
  coordinate_mismatch: boolean;
}

const EMPTY_DETAILS = {
  reg_number: '',
  name_en: '',
  name_si: '',
  name_ta: '',
  name_singlish: '',
  mobile: '',
  contact_person_name: '',
  address: '',
  longitude: '',
  latitude: '',
  image_path: '',
  coordinate_mismatch: false,
};

interface SurveyPageProps {
  slug?: string;
  /** Shown in the heading and thank-you message. */
  categoryName?: string;
  onBackToTopics?: () => void;
}

const SurveyPage: React.FC<SurveyPageProps> = ({ slug: slugProp, categoryName, onBackToTopics }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug ?? '';
  const navigate = useNavigate();
  const { getToken, isAuthenticated, login } = useAuth();
  const { t, language } = useContributeCopy();

  const [form, setForm] = useState<ContributionForm>({ ...EMPTY_DETAILS, raw_province: '', raw_district: '', raw_ds: '', raw_gn: '', gn_code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ location?: boolean; name?: boolean }>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [geoPrompt, setGeoPrompt] = useState(false);
  const [existingName, setExistingName] = useState<string | null>(null);

  const [nameOptions, setNameOptions] = useState<any[]>([]);
  const [nameInput, setNameInput] = useState('');

  const [selectedGN, setSelectedGN] = useState<any>(null);
  const [gnSearchInput, setGnSearchInput] = useState('');
  const [gnOptions, setGnOptions] = useState<any[]>([]);
  const [gnSearching, setGnSearching] = useState(false);
  const autoSelected = useRef(false);

  const village = readSavedVillage();
  const vName = villageName(village, language);
  const catName = categoryName || slug;


  const [getGnByCoords] = useLazyQuery(GET_GN_BY_COORDINATES);

  const patch = (values: Partial<ContributionForm>) => setForm((prev) => ({ ...prev, ...values }));

  /* ── Existing-entry search (to propose updates rather than duplicates) ── */
  useEffect(() => {
    if (!nameInput.trim() || existingName) {
      setNameOptions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ query: nameInput.trim() });
        if (form.raw_district) query.append('district', form.raw_district);
        if (form.raw_ds) query.append('ds', form.raw_ds);
        if (form.raw_gn) query.append('gn', form.raw_gn);
        const res = await fetch(`/api/search-category-data/${encodeURIComponent(slug)}?${query}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (json.success) setNameOptions(json.data || []);
      } catch {
        /* suggestions are a convenience; failure leaves the field usable */
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [nameInput, slug, form.raw_district, form.raw_ds, form.raw_gn, existingName]);

  /* ── Cascading location pickers replaced by unified GN Search ────────── */
  useEffect(() => {
    patch({
      raw_province: selectedGN?.proEn || selectedGN?.pDistrict?.pProvince?.admin1NameEn || '',
      raw_district: selectedGN?.disEn || selectedGN?.pDistrict?.admin2NameEn || '',
      raw_ds: selectedGN?.dsEn || '',
      raw_gn: selectedGN?.nameEn || selectedGN?.gnName || '',
      gn_code: selectedGN?.ccode || selectedGN?.CCODE || selectedGN?.code || '',
    });
  }, [selectedGN]);

  // Pre-fill from the contributor's chosen village, once.
  useEffect(() => {
    if (autoSelected.current || !village) return;
    autoSelected.current = true;
    
    // Construct a compatible option object from the village
    const proEn = (village as any).pDistrict?.pProvince?.admin1NameEn || '';
    const proSi = (village as any).pDistrict?.pProvince?.admin1NameSi || proEn;
    const proTa = (village as any).pDistrict?.pProvince?.admin1NameTa || proEn;
    
    const disEn = (village as any).pDistrict?.admin2NameEn || '';
    const disSi = (village as any).pDistrict?.admin2NameSi || disEn;
    const disTa = (village as any).pDistrict?.admin2NameTa || disEn;
    
    const dsEn = (village as any).dsEn || '';
    const dsSi = (village as any).dsSi || dsEn;
    const dsTa = (village as any).dsTa || dsEn;
    
    const nameEn = (village as any).nameEn || '';
    const nameSi = (village as any).nameSi || nameEn;
    const nameTa = (village as any).nameTa || nameEn;
    const ccode = (village as any).CCODE || (village as any).code || '';

    const displayEn = [nameEn ? `${nameEn} (${ccode})` : '', dsEn, disEn, proEn].filter(Boolean).join(', ');
    const displaySi = [nameSi ? `${nameSi} (${ccode})` : '', dsSi, disSi, proSi].filter(Boolean).join(', ');
    const displayTa = [nameTa ? `${nameTa} (${ccode})` : '', dsTa, disTa, proTa].filter(Boolean).join(', ');

    setSelectedGN({
      ...village,
      proEn, proSi, proTa,
      disEn, disSi, disTa,
      dsEn, dsSi, dsTa,
      nameEn, nameSi, nameTa,
      ccode,
      display: displayEn,
      displaySi: displaySi,
      displayTa: displayTa
    });
  }, [village]);

  // Unified GN Search Autocomplete
  useEffect(() => {
    if (!gnSearchInput.trim()) {
      setGnOptions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setGnSearching(true);
      try {
        const query = new URLSearchParams({ q: gnSearchInput.trim() });
        const res = await fetch(`/api/search-gns?${query}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (json.success) setGnOptions(json.data || []);
      } catch {
        // ignore
      } finally {
        setGnSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [gnSearchInput]);

  /* ── Evidence ─────────────────────────────────────────────────────────── */
  const captureLocation = () => {
    setGeoPrompt(false);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        let mismatch = false;
        if (form.gn_code) {
          try {
            const { data } = await getGnByCoords({ variables: { lat, lng } });
            const found = data?.gnByCoordinates;
            // Compare codes to codes: the old check compared a code with the GN
            // *name*, so it flagged almost every capture as a mismatch.
            mismatch = Boolean(found && found.CCODE !== form.gn_code && found.code !== form.gn_code);
          } catch {
            /* unverifiable is not the same as mismatched */
          }
        }
        patch({ latitude: lat.toFixed(6), longitude: lng.toFixed(6), coordinate_mismatch: mismatch });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload-survey-image', { method: 'POST', body, headers: { Accept: 'application/json' } });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Upload failed');
      patch({ image_path: json.image_path });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const locationMissing = !form.raw_province || !form.raw_district || !form.raw_ds || !form.raw_gn;
    const nameMissing = !form.name_en.trim() && !form.name_si.trim() && !form.name_ta.trim();
    setFieldErrors({ location: locationMissing, name: nameMissing });
    if (locationMissing || nameMissing) {
      setError(locationMissing ? t.errLocation : t.errName);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = isAuthenticated ? await getToken() : undefined;
      if (isAuthenticated && !token) throw new ApiError(t.errSession, 401);
      setResult(await submitContribution(slug, { ...form, name_en: form.name_en.trim() }, token));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? t.errSession : (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const addAnother = () => {
    setForm((prev) => ({ ...prev, ...EMPTY_DETAILS }));
    setExistingName(null);
    setNameInput('');
    setFieldErrors({});
    setResult(null);
  };

  const backToTopics = () => (onBackToTopics ? onBackToTopics() : navigate('/user'));

  /* ── Thank-you ────────────────────────────────────────────────────────── */
  if (result) {
    return (
      <Paper elevation={0} sx={{ maxWidth: 640, mx: 'auto', p: { xs: 3, sm: 5 }, borderRadius: '24px', border: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'success.main',
            color: '#fff',
            boxShadow: (theme) => `0 0 0 10px ${alpha(theme.palette.success.main, 0.12)}`,
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 38 }} />
        </Box>
        <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 700, letterSpacing: '-0.03em', mb: 1 }}>
          {t.thanksTitle}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
          {vName ? fill(t.thanksBody, { category: catName, village: vName }) : fill(t.thanksBodyNoVillage, { category: catName })}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1, mb: 4 }}>
          {result.reg_number && <Chip label={`${t.thanksReg}: ${result.reg_number}`} sx={{ fontFamily: 'monospace', fontWeight: 600 }} />}
          <Chip
            label={result.credited ? t.thanksCredited : t.thanksAnonymous}
            color={result.credited ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'center' }}>
          <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={addAnother} sx={{ py: 1.25, px: 2.5 }}>
            {t.addAnother}
          </Button>
          {isAuthenticated && (
            <Button variant="outlined" startIcon={<HistoryRoundedIcon />} onClick={() => navigate('/user/contributions')} sx={{ py: 1.25, boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none' } }}>
              {t.navMyContributions}
            </Button>
          )}
          <Button color="inherit" onClick={backToTopics} sx={{ py: 1.25, boxShadow: 'none', color: 'text.secondary', '&:hover': { boxShadow: 'none', transform: 'none' } }}>
            {t.backToTopics}
          </Button>
        </Stack>
      </Paper>
    );
  }

  /* ── Form ─────────────────────────────────────────────────────────────── */
  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ maxWidth: 760, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography component="h2" sx={{ fontSize: { xs: '1.45rem', sm: '1.75rem' }, fontWeight: 700, letterSpacing: '-0.03em' }}>
          {fill(t.formTitle, { category: catName })}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {vName ? fill(t.formSubtitle, { village: vName }) : t.formSubtitleNoVillage}
        </Typography>
      </Box>

      {!isAuthenticated && (
        <Alert
          severity="info"
          sx={{ mb: 2, borderRadius: '14px' }}
          action={
            <Button color="inherit" size="small" onClick={() => login(window.location.href)} sx={{ boxShadow: 'none' }}>
              {t.signIn}
            </Button>
          }
        >
          {t.signInToBeCredited}
        </Alert>
      )}

      <Stack spacing={2}>
        <FormSection index={1} title={t.stepLocation} error={fieldErrors.location}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 2 }}>
            <Autocomplete
              options={gnOptions}
              getOptionLabel={(o: any) => {
                if (language === 'si') return o.displaySi || o.nameSi || o.nameEn || '';
                if (language === 'ta') return o.displayTa || o.nameTa || o.nameEn || '';
                return o.display || o.nameEn || '';
              }}
              value={selectedGN}
              loading={gnSearching}
              onInputChange={(_, v) => setGnSearchInput(v)}
              filterOptions={(x) => x} // Backend filtering
              onChange={(_, v) => setSelectedGN(v)}
              renderInput={(p) => (
                <TextField 
                  {...p} 
                  label={t.stepLocation} 
                  placeholder={language === 'en' ? 'Type GN name, District, or Province...' : language === 'si' ? 'ග්‍රාම නිලධාරී වසම, දිස්ත්‍රික්කය, හෝ පළාත සොයන්න...' : 'கிராம உத்தியோகத்தர் பிரிவு, மாவட்டம் அல்லது மாகாணத்தைத் தேடுக...'} 
                  required 
                  error={fieldErrors.location && !form.raw_gn}
                  InputProps={{
                    ...p.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {gnSearching ? <CircularProgress color="inherit" size={20} /> : null}
                        {p.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props as any;
                const parts = [
                  language === 'si' ? option.nameSi : language === 'ta' ? option.nameTa : option.nameEn,
                  language === 'si' ? option.dsSi : language === 'ta' ? option.dsTa : option.dsEn,
                  language === 'si' ? option.disSi : language === 'ta' ? option.disTa : option.disEn,
                  language === 'si' ? option.proSi : language === 'ta' ? option.proTa : option.proEn
                ].filter(Boolean);
                
                return (
                  <li key={key} {...optionProps}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {parts[0]} {option.ccode ? `(${option.ccode})` : ''}
                      </Typography>
                      {parts.length > 1 && (
                        <Typography variant="caption" color="text.secondary">
                          {parts.slice(1).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
            />
          </Box>
        </FormSection>

        <FormSection index={2} title={t.stepDetails} error={fieldErrors.name}>
          <Stack spacing={2}>
            {existingName ? (
              <Alert
                icon={<EditNoteRoundedIcon />}
                severity="info"
                sx={{ borderRadius: '12px' }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setExistingName(null);
                      patch({ reg_number: '' });
                    }}
                    sx={{ boxShadow: 'none' }}
                  >
                    {t.newEntryInstead}
                  </Button>
                }
              >
                {fill(t.updatingExisting, { name: existingName })}
              </Alert>
            ) : null}
            <Autocomplete
              freeSolo
              options={nameOptions}
              filterOptions={(o) => o}
              inputValue={nameInput}
              onInputChange={(_, value, reason) => {
                setNameInput(value);
                // Typing a name *is* the English name — previously it was only
                // saved when an existing entry was picked from the list.
                if (reason === 'input' && !existingName) patch({ name_en: value });
              }}
              onChange={(_, option: any) => {
                if (!option || typeof option === 'string') return;
                setExistingName(option.name_en || option.name_si || option.name_ta || option.reg_number);
                patch({
                  reg_number: option.reg_number || '',
                  name_en: option.name_en || '',
                  name_si: option.name_si || '',
                  name_ta: option.name_ta || '',
                  name_singlish: option.name_singlish || '',
                  mobile: option.mobile || '',
                  contact_person_name: option.contact_person_name || '',
                  address: option.address || '',
                });
              }}
              getOptionLabel={(o: any) => (typeof o === 'string' ? o : o.name_en || o.name_si || o.name_ta || '')}
              renderOption={(props, o: any) => {
                const { key: _key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                return (
                  <Box component="li" key={o.reg_number || o.id} {...rest} sx={{ display: 'block !important' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {[o.name_en, o.name_si, o.name_ta].filter(Boolean).join(' · ')}
                    </Typography>
                    {o.reg_number && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {o.reg_number}
                      </Typography>
                    )}
                  </Box>
                );
              }}
              renderInput={(p) => (
                <TextField {...p} label={t.nameLabel} helperText={t.nameHelper} required error={fieldErrors.name} inputProps={{ ...p.inputProps, maxLength: 255 }} />
              )}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label={t.nameSi} value={form.name_si} onChange={(e) => patch({ name_si: e.target.value })} inputProps={{ maxLength: 255 }} />
              <TextField label={t.nameTa} value={form.name_ta} onChange={(e) => patch({ name_ta: e.target.value })} inputProps={{ maxLength: 255 }} />
              <TextField
                label={t.mobile}
                value={form.mobile}
                onChange={(e) => patch({ mobile: e.target.value.replace(/[^\d+\s-]/g, '') })}
                inputProps={{ inputMode: 'tel', maxLength: 32 }}
              />
              <TextField label={t.contactPerson} value={form.contact_person_name} onChange={(e) => patch({ contact_person_name: e.target.value })} inputProps={{ maxLength: 255 }} />
            </Box>
            <TextField label={t.address} value={form.address} onChange={(e) => patch({ address: e.target.value })} multiline minRows={2} inputProps={{ maxLength: 1000 }} />
          </Stack>
        </FormSection>

        <FormSection index={3} title={t.stepEvidence} optional={t.optional}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Button
                variant="outlined"
                startIcon={locating ? <CircularProgress size={18} /> : <MyLocationRoundedIcon />}
                onClick={() => setGeoPrompt(true)}
                disabled={locating}
                sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none' } }}
              >
                {t.captureLocation}
              </Button>
              {form.latitude && form.longitude && (
                <Chip icon={<CheckRoundedIcon />} color="success" variant="outlined" label={`${t.locationCaptured} · ${form.latitude}, ${form.longitude}`} sx={{ maxWidth: '100%' }} />
              )}
            </Stack>
            {form.coordinate_mismatch && (
              <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                {t.locationMismatch}
              </Alert>
            )}

            {form.image_path ? (
              <Box sx={{ position: 'relative', alignSelf: 'flex-start' }}>
                <Box
                  component="img"
                  src={`/api/uploads/survey_images/${form.image_path}`}
                  alt=""
                  sx={{ display: 'block', maxWidth: '100%', maxHeight: 220, borderRadius: '12px', border: 1, borderColor: 'divider', objectFit: 'contain' }}
                />
                <IconButton
                  size="small"
                  aria-label="Remove photo"
                  onClick={() => patch({ image_path: '' })}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'background.paper' } }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : null}
            <Button
              component="label"
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={18} /> : <AddAPhotoOutlinedIcon />}
              disabled={uploading}
              sx={{ height: 64, borderStyle: 'dashed', boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none', borderStyle: 'dashed' } }}
            >
              {uploading ? t.uploading : form.image_path ? t.replacePhoto : t.uploadPhoto}
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                  e.target.value = '';
                }}
              />
            </Button>
          </Stack>
        </FormSection>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          mt: 3,
          py: 2,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.92),
          backdropFilter: 'blur(8px)',
          zIndex: 2,
        }}
      >
        <Button
          type="submit"
          variant="contained"
          disableElevation
          size="large"
          fullWidth
          disabled={submitting || uploading || locating}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckRoundedIcon />}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          {submitting ? t.submitting : t.submit}
        </Button>
      </Box>

      <Dialog open={geoPrompt} onClose={() => setGeoPrompt(false)} PaperProps={{ sx: { borderRadius: '18px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t.geoConfirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t.geoConfirmBody}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGeoPrompt(false)} sx={{ boxShadow: 'none' }}>
            {t.geoConfirmNo}
          </Button>
          <Button variant="contained" disableElevation onClick={captureLocation} autoFocus>
            {t.geoConfirmYes}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const FormSection: React.FC<{ index: number; title: string; optional?: string; error?: boolean; children: React.ReactNode }> = ({ index, title, optional, error, children }) => (
  <Paper
    component="fieldset"
    elevation={0}
    sx={{ m: 0, p: { xs: 2, sm: 3 }, borderRadius: '18px', border: 1, borderColor: error ? 'error.main' : 'divider', minWidth: 0 }}
  >
    <Stack component="legend" direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2.5, p: 0, float: 'left', width: '100%' }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {index}
      </Box>
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      {optional && (
        <Typography variant="caption" color="text.secondary">
          · {optional}
        </Typography>
      )}
    </Stack>
    <Box sx={{ clear: 'both' }}>{children}</Box>
  </Paper>
);

export default SurveyPage;
