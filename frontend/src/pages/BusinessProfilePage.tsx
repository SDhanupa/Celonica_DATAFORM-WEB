import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, IconButton, Button, Grid, Chip
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const SERIF_FONT = "'Playfair Display', 'Merriweather', 'Georgia', serif";
const SANS_FONT = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";

const BusinessProfilePage: React.FC = () => {
  const { regNumber } = useParams<{ regNumber: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!regNumber) return;
    setLoading(true);
    fetch(`/api/public/business/${encodeURIComponent(regNumber)}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Business not found'); setLoading(false); });
  }, [regNumber]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#333' }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', fontFamily: SANS_FONT }}>404</Typography>
        <Typography sx={{ color: '#666', fontFamily: SANS_FONT }}>{error || 'Business not found'}</Typography>
        <Button variant="outlined" onClick={() => navigate('/gnpage')} sx={{ color: '#333', borderColor: '#333', mt: 2, fontFamily: SANS_FONT }}>
          Go Home
        </Button>
      </Box>
    );
  }

  const fv = data.form_values || {};
  const bName = fv.b_name || 'Unnamed Business';
  const bType = fv.b_type || fv.b_type_name || '';
  const bAddress = fv.b_address || fv.q_business_address || '';
  const bOwner = fv.b_owner_name || '';
  const bMobile = fv.b_mobile || fv.q_mobile || '';
  const bWhatsApp = fv.q_whatsapp || '';
  const bPhoto = fv.b_photo || '';
  const bRegNo = fv.b_reg_no || data.reg_number || '';
  
  // Promotional Fields
  const mainProducts = fv.q_main_products || '';
  const salesMethod = fv.q_sales_method || '';
  const marketReach = fv.q_market_reach || '';
  const digitalPayment = fv.q_use_digital_payment || '';
  const exportDetails = fv.q_export_details || '';

  // Default premium background if no photo uploaded
  const heroImage = bPhoto 
    ? `/api/uploads/${bPhoto}` 
    : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── Hero Section (Fixed Background) ── */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '75vh',
        minHeight: '500px',
        backgroundImage: `url('${heroImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Parallax effect
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1,
        }
      }}>
        {/* Header Nav inside Hero */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          p: { xs: 2, md: 4 },
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <IconButton onClick={() => navigate('/')} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <HomeOutlinedIcon />
            </IconButton>
          </Box>

          <Button
            onClick={() => navigate(`/business/${encodeURIComponent(bRegNo)}/qr`)}
            startIcon={<QrCode2RoundedIcon />}
            sx={{
              color: '#fff', borderColor: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
            variant="outlined"
          >
            Get QR
          </Button>
        </Box>

        {/* Hero Content */}
        <Box sx={{ position: 'relative', zIndex: 10, textAlign: 'center', px: 3, maxWidth: '900px' }}>
          {bType && (
            <Typography sx={{
              fontFamily: SANS_FONT,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#d4af37',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              mb: 2,
            }}>
              {bType}
            </Typography>
          )}
          <Typography sx={{
            fontFamily: SERIF_FONT,
            fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' },
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            textTransform: 'uppercase',
            mb: 2,
          }}>
            {bName}
          </Typography>
          <Typography sx={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.05em',
          }}>
            {data.gn_name ? `${data.gn_name}, ${data.district}` : 'Ceylonica Verified Business'}
          </Typography>
        </Box>

        {/* Ripped Paper / Brush edge at bottom */}
        <Box sx={{
          position: 'absolute', bottom: -1, left: 0, right: 0, zIndex: 5,
          width: '100%', overflow: 'hidden', lineHeight: 0,
          transform: 'rotate(180deg)'
        }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: 'block', width: 'calc(100% + 1.3px)', height: '70px' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.15,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#FAFAFA" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-23.94V0Z" fill="#FAFAFA" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#FAFAFA"></path>
          </svg>
        </Box>
      </Box>

      {/* ── Content Section ── */}
      <Box sx={{ maxWidth: '1000px', mx: 'auto', py: { xs: 6, md: 8 }, px: 3 }}>
        
        {/* Verification Badge */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', mb: 1 }}>
            Verified Registration
          </Typography>
          <Typography sx={{ fontFamily: SERIF_FONT, fontSize: '1.5rem', color: '#222' }}>
            {bRegNo}
          </Typography>
          <Box sx={{ width: '40px', height: '2px', bgcolor: '#d4af37', mx: 'auto', mt: 3 }} />
        </Box>

        {/* Primary Info Highlights */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
          {bOwner && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 4, bgcolor: '#FFFFFF', borderRadius: 4, textAlign: 'center', height: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <PersonOutlineRoundedIcon sx={{ fontSize: 40, color: '#d4af37', mb: 2 }} />
                <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', mb: 1 }}>
                  Owner
                </Typography>
                <Typography sx={{ fontFamily: SERIF_FONT, fontSize: '1.3rem', color: '#111' }}>
                  {bOwner}
                </Typography>
              </Box>
            </Grid>
          )}

          {bAddress && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 4, bgcolor: '#FFFFFF', borderRadius: 4, textAlign: 'center', height: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <PlaceOutlinedIcon sx={{ fontSize: 40, color: '#d4af37', mb: 2 }} />
                <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', mb: 1 }}>
                  Location
                </Typography>
                <Typography sx={{ fontFamily: SERIF_FONT, fontSize: '1.1rem', color: '#111', lineHeight: 1.4 }}>
                  {bAddress}
                </Typography>
              </Box>
            </Grid>
          )}

          {(bMobile || bWhatsApp) && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 4, bgcolor: '#FFFFFF', borderRadius: 4, textAlign: 'center', height: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <PhoneOutlinedIcon sx={{ fontSize: 40, color: '#d4af37', mb: 2 }} />
                <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', mb: 1 }}>
                  Contact
                </Typography>
                {bMobile && (
                  <Typography sx={{ fontFamily: SERIF_FONT, fontSize: '1.2rem', color: '#111', mb: 0.5 }}>
                    {bMobile}
                  </Typography>
                )}
                {bWhatsApp && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                    <WhatsAppIcon sx={{ color: '#25D366', fontSize: 18 }} />
                    <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.9rem', color: '#444' }}>
                      {bWhatsApp}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Secondary Promotional Details */}
        {(mainProducts || salesMethod || digitalPayment === 'Yes' || exportDetails) && (
          <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 4, p: { xs: 4, md: 6 }, boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <Typography sx={{ fontFamily: SERIF_FONT, fontSize: '2rem', color: '#111', mb: 4, textAlign: 'center' }}>
              Business Profile
            </Typography>

            <Grid container spacing={4}>
              {mainProducts && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}><Inventory2OutlinedIcon sx={{ color: '#d4af37' }} /></Box>
                    <Box>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', mb: 0.5 }}>
                        Main Products / Services
                      </Typography>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '1.1rem', color: '#333', lineHeight: 1.6 }}>
                        {mainProducts}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {salesMethod && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}><StorefrontOutlinedIcon sx={{ color: '#d4af37' }} /></Box>
                    <Box>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', mb: 0.5 }}>
                        Sales Method
                      </Typography>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '1.1rem', color: '#333', lineHeight: 1.6 }}>
                        {salesMethod}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {marketReach && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}><LocalShippingOutlinedIcon sx={{ color: '#d4af37' }} /></Box>
                    <Box>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', mb: 0.5 }}>
                        Market Reach
                      </Typography>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '1.1rem', color: '#333', lineHeight: 1.6 }}>
                        {marketReach}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {exportDetails && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}><PublicOutlinedIcon sx={{ color: '#d4af37' }} /></Box>
                    <Box>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', mb: 0.5 }}>
                        Export Operations
                      </Typography>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '1.1rem', color: '#333', lineHeight: 1.6 }}>
                        {exportDetails}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {digitalPayment === 'Yes' && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3, bgcolor: '#FAFAFA', borderRadius: 3, border: '1px dashed #d4af37' }}>
                    <CreditCardOutlinedIcon sx={{ color: '#d4af37', fontSize: 32 }} />
                    <Box>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '1rem', color: '#222', fontWeight: 600 }}>
                        Digital Payments Accepted
                      </Typography>
                      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '0.85rem', color: '#666' }}>
                        This business accepts card and digital transactions.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default BusinessProfilePage;
