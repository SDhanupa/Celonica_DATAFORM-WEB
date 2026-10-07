import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../auth/AuthProvider';
import { ink, inkButton, semantic } from './contribute/tokens';
import { EASE, slideInLeft, slideInRight } from './contribute/motion';

const COMPLETE_ONBOARDING = gql`
  mutation CompleteUserOnboarding(
    $firstName: String!
    $lastName: String!
    $nic: String!
    $mobileNumber: String!
    $address: String!
    $dob: String!
    $gender: String!
  ) {
    completeUserOnboarding(
      firstName: $firstName
      lastName: $lastName
      nic: $nic
      mobileNumber: $mobileNumber
      address: $address
      dob: $dob
      gender: $gender
    )
  }
`;

type Field = 'firstName' | 'lastName' | 'dob' | 'gender' | 'nic' | 'mobileNumber' | 'address';
interface Form { firstName: string; lastName: string; dob: string; gender: string; nic: string; mobileNumber: string; address: string }

const NIC_RE = /^(\d{9}[VX]|\d{12})$/i;
const MOBILE_RE = /^(0|\+?94)7\d{8}$/;
const TODAY = new Date().toISOString().split('T')[0];

const STEP_FIELDS: Field[][] = [
  ['firstName', 'lastName', 'dob', 'gender'],
  ['nic', 'mobileNumber', 'address'],
];

const validate = (form: Form, field: Field): string | undefined => {
  const v = form[field].trim();
  if (!v) return 'Required';
  if (field === 'dob' && v >= TODAY) return 'Must be a past date';
  if (field === 'nic' && !NIC_RE.test(form.nic.replace(/[\s-]/g, ''))) return 'Use 123456789V or a 12-digit NIC';
  if (field === 'mobileNumber' && !MOBILE_RE.test(form.mobileNumber.replace(/[\s-]/g, ''))) return 'Use 07XXXXXXXX or +947XXXXXXXX';
  return undefined;
};

const serverFieldError = (message: string): { field?: Field; text: string } => {
  if (/NIC/i.test(message)) return { field: 'nic', text: 'This NIC is already registered' };
  if (/mobile/i.test(message)) return { field: 'mobileNumber', text: 'This mobile number is already registered' };
  return { text: 'Something went wrong. Please try again.' };
};

const fieldSx = {
  '& .MuiInputBase-input': { fontSize: '16px' },
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#fff',
    minHeight: 52,
    '& fieldset': { borderColor: ink[200] },
    '&:hover fieldset': { borderColor: ink[300] },
    '&.Mui-focused fieldset': { borderColor: ink[900], borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '16px' },
  '& .MuiFormHelperText-root': { fontSize: '0.78rem', mx: 0, mt: 0.5 },
};

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { userInfo, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    nic: '',
    mobileNumber: '',
    address: '',
  });
  const [touched, setTouched] = useState<Partial<Record<Field, true>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(f => ({
      ...f,
      firstName: f.firstName || userInfo?.given_name || '',
      lastName: f.lastName || userInfo?.family_name || '',
    }));
  }, [open, userInfo]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [completeOnboarding, { loading }] = useMutation(COMPLETE_ONBOARDING, {
    onCompleted: () => onComplete(),
    onError: (err) => {
      const parsed = serverFieldError(err.message);
      if (parsed.field) {
        setFieldErrors(prev => ({ ...prev, [parsed.field!]: parsed.text }));
        const fieldStep = STEP_FIELDS.findIndex(fields => fields.includes(parsed.field!));
        if (fieldStep >= 0 && fieldStep !== step) setStep(fieldStep);
      } else {
        setServerError(parsed.text);
      }
    },
  });

  const setField = (field: Field, value: string) => {
    setForm(f => ({ ...f, [field]: field === 'nic' ? value.toUpperCase() : value }));
    if (touched[field]) {
      const err = validate({ ...form, [field]: value }, field);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError(null);
  };

  const blur = (field: Field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validate(form, field);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const errorFor = (field: Field): string | undefined =>
    touched[field] || fieldErrors[field] ? fieldErrors[field] : undefined;

  const checkStep = (): boolean => {
    const fields = STEP_FIELDS[step];
    const newTouched = { ...touched };
    const newErrors = { ...fieldErrors };
    fields.forEach(f => {
      newTouched[f] = true;
      const err = validate(form, f);
      if (err) newErrors[f] = err;
    });
    setTouched(newTouched);
    setFieldErrors(newErrors);
    const firstBad = fields.find(f => newErrors[f]);
    if (firstBad) {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-field="${firstBad}"]`);
      el?.focus();
      return false;
    }
    return true;
  };

  const handleNext = () => { if (checkStep()) setStep(1); };

  const handleSubmit = () => {
    if (!checkStep()) return;
    const clean = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      nic: form.nic.replace(/[\s-]/g, '').toUpperCase(),
      mobileNumber: form.mobileNumber.replace(/[\s-]/g, ''),
      address: form.address.trim(),
    };
    completeOnboarding({ variables: clean });
  };

  const GENDERS = ['Male', 'Female', 'Other'] as const;

  return (
    <Dialog
      disableEscapeKeyDown
      open={open}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(10,12,15,.55)', backdropFilter: 'blur(8px)' } } }}
      PaperProps={{
        ref: containerRef,
        sx: {
          bgcolor: ink[50],
          borderRadius: isMobile ? 0 : '20px',
          ...(isMobile ? { height: '100dvh', maxHeight: '100dvh' } : {}),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 2, bgcolor: '#fff', borderBottom: `1px solid ${ink[100]}` }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {step === 1 && (
              <IconButton size="small" onClick={() => setStep(0)} sx={{ color: ink[600], p: 0.5 }}>
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            )}
            <Box>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.15rem', color: ink[900], lineHeight: 1.2 }}>
                Welcome to Ceylonica
              </Typography>
              <Typography variant="body2" sx={{ color: ink[500] }}>
                {step === 0 ? 'Tell us about yourself' : 'Contact details'}
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            startIcon={<LogoutRoundedIcon fontSize="small" />}
            onClick={logout}
            sx={{ color: ink[400], fontSize: '0.8rem', '&:hover': { color: ink[600], bgcolor: ink[100] } }}
          >
            Sign out
          </Button>
        </Stack>

        {/* Progress bar */}
        <Box sx={{ display: 'flex', gap: 0.75, height: 4 }}>
          {[0, 1].map(i => (
            <Box
              key={i}
              sx={{ flex: 1, borderRadius: 999, bgcolor: ink[200], overflow: 'hidden' }}
            >
              <Box sx={{ height: '100%', width: i <= step ? '100%' : 0, bgcolor: ink[900], borderRadius: 999, transition: `width 600ms ${EASE}` }} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Body */}
      <DialogContent sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 3, overscrollBehavior: 'contain' }}>
        <Box
          key={step}
          sx={{ animation: `${step === 1 ? slideInRight : slideInLeft} 420ms ${EASE} both`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
        >
        {step === 0 ? (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                value={form.firstName}
                onChange={e => setField('firstName', e.target.value)}
                onBlur={() => blur('firstName')}
                error={Boolean(errorFor('firstName'))}
                helperText={errorFor('firstName')}
                fullWidth
                inputProps={{ 'data-field': 'firstName', autoComplete: 'given-name', autoCapitalize: 'words', enterKeyHint: 'next' }}
                sx={fieldSx}
              />
              <TextField
                label="Last name"
                value={form.lastName}
                onChange={e => setField('lastName', e.target.value)}
                onBlur={() => blur('lastName')}
                error={Boolean(errorFor('lastName'))}
                helperText={errorFor('lastName')}
                fullWidth
                inputProps={{ 'data-field': 'lastName', autoComplete: 'family-name', autoCapitalize: 'words', enterKeyHint: 'next' }}
                sx={fieldSx}
              />
            </Stack>

            <TextField
              label="Date of birth"
              type="date"
              value={form.dob}
              onChange={e => setField('dob', e.target.value)}
              onBlur={() => blur('dob')}
              error={Boolean(errorFor('dob'))}
              helperText={errorFor('dob')}
              fullWidth
              inputProps={{ 'data-field': 'dob', autoComplete: 'bday', max: TODAY }}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: ink[600], mb: 1 }}>Gender</Typography>
              <Stack direction="row" spacing={1}>
                {GENDERS.map(g => (
                  <ButtonBase
                    key={g}
                    data-field={g === GENDERS[0] ? 'gender' : undefined}
                    onClick={() => setField('gender', g)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      px: 1,
                      borderRadius: '12px',
                      border: `1.5px solid ${form.gender === g ? ink[900] : ink[200]}`,
                      bgcolor: form.gender === g ? ink[900] : '#fff',
                      color: form.gender === g ? '#fff' : ink[600],
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: `background-color 220ms ease, color 220ms ease, border-color 220ms ease, transform 300ms ${EASE}`,
                      '&:active': { transform: 'scale(.97)' },
                      '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
                    }}
                  >
                    {g}
                  </ButtonBase>
                ))}
              </Stack>
              {touched['gender'] && errorFor('gender') && (
                <Typography variant="caption" sx={{ color: semantic.danger, mt: 0.5, display: 'block' }}>
                  {errorFor('gender')}
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <TextField
              label="NIC number"
              value={form.nic}
              onChange={e => setField('nic', e.target.value)}
              onBlur={() => blur('nic')}
              error={Boolean(errorFor('nic'))}
              helperText={errorFor('nic') || '123456789V · 123456789012'}
              fullWidth
              inputProps={{ 'data-field': 'nic', autoComplete: 'off', autoCapitalize: 'characters', inputMode: 'text', enterKeyHint: 'next' }}
              sx={fieldSx}
            />

            <TextField
              label="Mobile number"
              value={form.mobileNumber}
              onChange={e => setField('mobileNumber', e.target.value)}
              onBlur={() => blur('mobileNumber')}
              error={Boolean(errorFor('mobileNumber'))}
              helperText={errorFor('mobileNumber') || '07XXXXXXXX or +947XXXXXXXX'}
              fullWidth
              inputProps={{ 'data-field': 'mobileNumber', autoComplete: 'tel', inputMode: 'tel', enterKeyHint: 'next' }}
              sx={fieldSx}
            />

            <TextField
              label="Full address"
              value={form.address}
              onChange={e => setField('address', e.target.value)}
              onBlur={() => blur('address')}
              error={Boolean(errorFor('address'))}
              helperText={errorFor('address')}
              fullWidth
              multiline
              rows={3}
              inputProps={{ 'data-field': 'address', autoComplete: 'street-address', autoCapitalize: 'sentences', enterKeyHint: 'done' }}
              sx={fieldSx}
            />

            {serverError && (
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: semantic.dangerSoft, border: `1px solid ${semantic.dangerBorder}` }}>
                <Typography variant="body2" sx={{ color: semantic.danger }}>
                  {serverError}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          pb: `max(16px, env(safe-area-inset-bottom))`,
          bgcolor: '#fff',
          borderTop: `1px solid ${ink[100]}`,
        }}
      >
        {step === 0 ? (
          <Button fullWidth onClick={handleNext} sx={{ py: 1.6, borderRadius: '14px', fontWeight: 700, fontSize: '1rem', ...inkButton }}>
            Continue
          </Button>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              onClick={() => setStep(0)}
              sx={{ py: 1.4, borderRadius: '14px', fontWeight: 600, color: ink[600], border: `1px solid ${ink[200]}`, display: { xs: 'none', sm: 'flex' } }}
            >
              Back
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              sx={{ py: 1.6, borderRadius: '14px', fontWeight: 700, fontSize: '1rem', ...inkButton }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Complete setup'}
            </Button>
          </Stack>
        )}
      </Box>
    </Dialog>
  );
}
