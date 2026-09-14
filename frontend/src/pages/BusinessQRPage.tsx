import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, CircularProgress, Button, TextField, IconButton, Alert,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';


const SERIF_FONT = "'Playfair Display', 'Merriweather', 'Georgia', serif";
const SANS_FONT = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";

const C = {
  bg: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  faint: '#9ca3af',
  gold: '#d4af37',
  goldSoft: 'rgba(212, 175, 55, 0.1)',
  border: '#e5e7eb',
  green: '#10b981',
};

type Stage = 'preview' | 'otp-sent' | 'verified';

const BusinessQRPage: React.FC = () => {
  const { regNumber } = useParams<{ regNumber: string }>();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>('preview');
  const [loading, setLoading] = useState(true);
  const [bName, setBName] = useState('');
  const [error, setError] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [downloadToken, setDownloadToken] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load business name
  useEffect(() => {
    if (!regNumber) return;
    fetch(`/api/public/business/${encodeURIComponent(regNumber)}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(d => {
        setBName(d.form_values?.b_name || 'Unnamed Business');
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [regNumber]);

  const handleSendOtp = async () => {
    setOtpSending(true);
    setError('');
    try {
      const res = await fetch('/api/public/qr-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_number: regNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setMaskedMobile(data.masked_mobile || '');
      setStage('otp-sent');
    } catch (e: any) {
      setError(e.message);
    }
    setOtpSending(false);
  };

  const handleVerifyOtp = async () => {
    setOtpVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/public/qr-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_number: regNumber, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setDownloadToken(data.download_token);
      setStage('verified');
    } catch (e: any) {
      setError(e.message);
    }
    setOtpVerifying(false);
  };

  const handleDownload = () => {
    if (!downloadToken || !regNumber) return;
    setDownloading(true);
    const url = `/api/public/business/${encodeURIComponent(regNumber)}/qr-image?token=${downloadToken}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${regNumber}_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 2000);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: C.text }} />
      </Box>
    );
  }

  if (notFound) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: C.text, fontFamily: SANS_FONT }}>404</Typography>
        <Typography sx={{ color: C.muted, fontFamily: SANS_FONT }}>Business not found</Typography>
        <Button variant="outlined" onClick={() => navigate('/gnpage')} sx={{ color: C.text, borderColor: C.text, mt: 2, fontFamily: SANS_FONT }}>
          Go Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: C.bg,
      fontFamily: SANS_FONT,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── Top Nav ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 50,
        bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        px: { xs: 2, sm: 3 }, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton onClick={() => navigate(`/business/${encodeURIComponent(regNumber || '')}`)} sx={{ color: C.text, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/')} sx={{ color: C.text, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
            <HomeOutlinedIcon />
          </IconButton>
        </Box>
        <Typography sx={{ fontFamily: SANS_FONT, fontWeight: 600, fontSize: '0.9rem', color: C.text, textTransform: 'uppercase', letterSpacing: '1px' }}>
          QR Download
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: { xs: 6, sm: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: C.muted, mb: 1 }}>
            Secure Download
          </Typography>
          <Typography sx={{ fontFamily: SERIF_FONT, fontSize: { xs: '2rem', sm: '2.5rem' }, color: C.text, lineHeight: 1.2 }}>
            {bName}
          </Typography>
          <Box sx={{ width: '40px', height: '2px', bgcolor: C.gold, mx: 'auto', mt: 3 }} />
        </Box>

        <Box sx={{
          bgcolor: '#fff', borderRadius: 4, border: `1px solid ${C.border}`,
          p: { xs: 3, sm: 5 }, textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
        }}>

          <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', color: C.muted, mb: 4 }}>
            Registration: <strong style={{ color: C.text }}>{regNumber}</strong>
          </Typography>

          {/* ── QR Preview (Blurred before verification) ── */}
          <Box sx={{
            bgcolor: '#fafafa', borderRadius: 3, p: 2, display: 'inline-flex',
            mb: 4, border: `1px solid ${C.border}`,
            transition: 'all 0.5s ease',
            filter: stage === 'verified' ? 'none' : 'blur(12px)',
            pointerEvents: stage === 'verified' ? 'auto' : 'none',
          }}>
            <Box
              component="img"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/business/' + encodeURIComponent(regNumber || ''))}`}
              alt="QR Code"
              sx={{ width: 200, height: 200 }}
            />
          </Box>

          {/* ── Stage: Preview → Send OTP ── */}
          {stage === 'preview' && (
            <Box>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center',
                bgcolor: '#f8f9fa', borderRadius: 2, px: 2, py: 1.5, mb: 3,
                border: `1px solid ${C.border}`
              }}>
                <LockOutlinedIcon sx={{ fontSize: '1rem', color: C.gold }} />
                <Typography sx={{ fontSize: '0.85rem', color: C.text, fontFamily: SANS_FONT }}>
                  Verify your identity via OTP to unlock the QR code
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={otpSending ? <CircularProgress size={18} color="inherit" /> : <SmsOutlinedIcon />}
                onClick={handleSendOtp}
                disabled={otpSending}
                fullWidth
                sx={{
                  bgcolor: C.text, borderRadius: 1, textTransform: 'uppercase',
                  letterSpacing: '1px', fontFamily: SANS_FONT, fontWeight: 600, py: 1.8,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#000', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
                }}
              >
                {otpSending ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </Box>
          )}

          {/* ── Stage: OTP Sent → Enter Code ── */}
          {stage === 'otp-sent' && (
            <Box>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 1, textAlign: 'left', fontFamily: SANS_FONT }}>
                Verification code sent to <strong>{maskedMobile}</strong>
              </Alert>
              <TextField
                fullWidth
                placeholder="Enter 8-digit code"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                inputProps={{ maxLength: 8, inputMode: 'numeric', style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 600, fontFamily: SANS_FONT } }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1, bgcolor: '#f8f9fa',
                    '& fieldset': { borderColor: C.border },
                    '&.Mui-focused fieldset': { borderColor: C.gold, borderWidth: '2px' },
                  },
                  '& input': { color: C.text },
                }}
              />
              <Button
                variant="contained"
                startIcon={otpVerifying ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRoundedIcon />}
                onClick={handleVerifyOtp}
                disabled={otpVerifying || otp.length < 8}
                fullWidth
                sx={{
                  bgcolor: C.text, borderRadius: 1, textTransform: 'uppercase',
                  letterSpacing: '1px', fontFamily: SANS_FONT, fontWeight: 600, py: 1.8,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#000', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
                }}
              >
                {otpVerifying ? 'Verifying...' : 'Verify & Unlock'}
              </Button>
            </Box>
          )}

          {/* ── Stage: Verified → Download ── */}
          {stage === 'verified' && (
            <Box>
              <Alert severity="success" icon={<CheckCircleRoundedIcon />} sx={{ mb: 3, borderRadius: 1, textAlign: 'left', fontFamily: SANS_FONT }}>
                Verified successfully! You can now download your QR code.
              </Alert>
              <Button
                variant="contained"
                startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadRoundedIcon />}
                onClick={handleDownload}
                disabled={downloading}
                fullWidth
                sx={{
                  bgcolor: C.gold, borderRadius: 1, textTransform: 'uppercase',
                  letterSpacing: '1px', fontFamily: SANS_FONT, fontWeight: 600, py: 1.8, color: '#fff',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#c29f30', boxShadow: '0 8px 20px rgba(212,175,55,0.3)' },
                }}
              >
                {downloading ? 'Downloading...' : 'Download QR Code'}
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 1, textAlign: 'left', fontFamily: SANS_FONT }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* ── Footer ── */}
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: '0.75rem', color: C.faint, fontFamily: SANS_FONT }}>
            © {new Date().getFullYear()} Ceylonica Data Platform.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default BusinessQRPage;
