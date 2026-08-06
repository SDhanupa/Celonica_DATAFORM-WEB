import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem, Divider,
  useTheme, useMediaQuery, CircularProgress, Chip, Alert,
  Paper, Grid, Table, TableBody, TableRow, TableCell, TableHead, TableContainer
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../auth/AuthProvider';
import { GET_GN_BY_CCODE, GET_POLICE_BY_GN_CCODE, GET_POST_OFFICES_BY_DS_CODE, GET_APPROVED_SUBMISSIONS } from '../graphql/queries';
import GnPageFooter from '../components/GnPageFooter';
import { CATEGORIES } from './CategoryDetailPage';

// ─── Theme helper ────────────────────────────────────────────────────────────
const getTC = (dark: boolean) => ({
  bg: dark ? '#0f172a' : '#f1f5f9',
  card: dark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
  text: dark ? '#f1f5f9' : '#0f172a',
  muted: dark ? '#94a3b8' : '#64748b',
  border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  navBg: dark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.80)',
  label: dark ? '#7c3aed' : '#4f46e5',
});

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value?: string | null; muted: string; text: string }> = ({ label, value, muted, text }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 0.8, borderBottom: '1px solid rgba(0,0,0,0.05)', '&:last-child': { borderBottom: 0 } }}>
      <Typography sx={{ fontSize: '0.8rem', color: muted, minWidth: 140, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.88rem', color: text, fontWeight: 500, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor: string;
  children: React.ReactNode;
  card: string;
  border: string;
}> = ({ icon, title, subtitle, accentColor, children, card, border }) => (
  <Paper
    elevation={0}
    sx={{
      bgcolor: card,
      border: `1.5px solid ${border}`,
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0, width: '4px', height: '100%',
        bgcolor: accentColor,
      },
      '&:hover': { 
        boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
        transform: 'translateY(-4px)',
        borderColor: `${accentColor}40`
      },
    }}
  >
    {/* Card Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, borderBottom: `1.5px solid ${border}`, bgcolor: `${accentColor}08` }}>
      <Box sx={{ color: accentColor, display: 'flex', alignItems: 'center', p: 1, borderRadius: 2, bgcolor: `${accentColor}15` }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: accentColor }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: '0.8rem', color: accentColor, opacity: 0.75, mt: 0.2 }}>{subtitle}</Typography>}
      </Box>
    </Box>
    {/* Card Body */}
    <Box sx={{ px: 3, py: 3 }}>{children}</Box>
  </Paper>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const BoundariesPage: React.FC = () => {
  const { gnName, ccode } = useParams<{ gnName: string; ccode: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, userInfo, logout, login, register } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [catMenuAnchor, setCatMenuAnchor] = useState<null | HTMLElement>(null);

  const tc = getTC(isDarkMode);
  const isSuperAdmin = userInfo?.realm_roles?.includes('super_admin');
  const gnPageUrl = `/gnpage/${gnName}/${ccode}`;
  const decodedGnName = decodeURIComponent(gnName ?? '').replace(/-/g, ' ');

  // ─── Fetch GN data ────────────────────────────────────────────────────────
  const { data, loading, error } = useQuery(GET_GN_BY_CCODE, {
    variables: { CCODE: ccode },
    skip: !ccode,
    fetchPolicy: 'cache-first',
  });

  const gn = data?.gnByCcode;
  const district = gn?.pDistrict;
  const districtName = gn?.pDistrict?.admin2NameEn;
  const dsCode = gn?.divisionalSecretariatCode;

  // ─── Fetch Police directly by CCODE (police table has direct ccode column) ──
  const { data: policeData, loading: policeLoading } = useQuery(GET_POLICE_BY_GN_CCODE, {
    variables: { ccode },
    skip: !ccode,
    fetchPolicy: 'cache-first',
  });
  const police = policeData?.policeByGnCcode;

  // ─── Fetch Post Offices by GN name, DS name, district (top 3 relevant) ──────
  const gnNameDecoded = decodeURIComponent(gnName ?? '').replace(/-/g, ' ');
  const dsNameStr = gn?.dsEn ?? null;

  const { data: postData, loading: postLoading } = useQuery(GET_POST_OFFICES_BY_DS_CODE, {
    variables: {
      gnName: gnNameDecoded || null,
      dsName: dsNameStr,
      dsCode: dsCode || null,
      district: districtName || null,
    },
    skip: !gn,  // wait for GN data first
    fetchPolicy: 'cache-first',
  });
  const postOffices: any[] = postData?.postOfficesByDsCode ?? [];


  // ─── Fetch Approved Submissions for Boundaries (root category ID 2) ──────
  const boundariesDbId = CATEGORIES.find(c => c.slug === 'boundaries')?.dbId || '2';
  const { data: approvedData, loading: approvedLoading } = useQuery(GET_APPROVED_SUBMISSIONS, {
    variables: { categoryId: boundariesDbId, gnCode: ccode },
    skip: !ccode,
    fetchPolicy: 'cache-and-network',
  });
  const approvedSubmissions = approvedData?.approvedSubmissions || [];

  // Parse answers and map question IDs to labels
  const parseAnswers = (submission: any) => {
    try {
      const answersRaw = typeof submission.answers_data === 'string'
        ? JSON.parse(submission.answers_data)
        : submission.answers_data;
      const questions = submission.category?.questions || [];
      const qMap: Record<string, string> = {};
      questions.forEach((q: any) => {
        qMap[String(q.id)] = q.questionTextEn || `Question ${q.id}`;
      });
      const parsed: { question: string; answer: string }[] = [];
      Object.entries(answersRaw).forEach(([key, value]) => {
        const parts = key.split('_');
        const qId = parts[0];
        const iter = parts[1];
        let label = qMap[qId] || `Question #${qId}`;
        if (iter && iter !== '1') label += ` (Item #${iter})`;
        parsed.push({ question: label, answer: String(value) });
      });
      return parsed;
    } catch { return []; }
  };

  // Group submissions by sub-category
  const groupedSubs: Record<string, any[]> = {};
  approvedSubmissions.forEach((sub: any) => {
    const subCatName = sub.category?.nameEn || 'General';
    if (!groupedSubs[subCatName]) groupedSubs[subCatName] = [];
    groupedSubs[subCatName].push(sub);
  });

  // ─── Nav helpers ──────────────────────────────────────────────────────────
  const navTypo = (color?: string) => ({
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    color: color ?? (isDarkMode ? '#fff' : '#000'),
    '&:hover': { opacity: 0.7 },
  });
  const sep = { opacity: 0.35, fontWeight: 300, color: isDarkMode ? '#fff' : '#000' };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: tc.bg, fontFamily: "'Inter', sans-serif", transition: 'background 0.3s' }}>

      {/* ── Navbar (Pill shape) ─────────────────────────────────────────────────────────── */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 3 },
          pointerEvents: 'auto',
          bgcolor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5 },
          borderRadius: 30,
          color: isDarkMode ? '#ffffff' : '#000000',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: 'max-content'
        }}>
          {/* Dark mode & Search */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton onClick={() => setIsDarkMode(d => !d)} size="small" sx={{ color: isDarkMode ? '#fff' : '#000', p: 0.5 }}>
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
            <IconButton onClick={() => navigate('/gnpage')} size="small" sx={{ color: isDarkMode ? '#fff' : '#000', p: 0.5 }}>
              <SearchIcon fontSize="small" />
            </IconButton>
          </Box>

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
              
              {/* Home */}
              <Typography onClick={() => navigate(gnPageUrl)} sx={navTypo()}>Home</Typography>
              <Typography sx={sep}>|</Typography>

              {/* Dashboard */}
              {isAuthenticated && (
                <>
                  <Typography onClick={() => navigate(isSuperAdmin ? '/admins' : '/user')} sx={navTypo()}>Dashboard</Typography>
                  <Typography sx={sep}>|</Typography>
                </>
              )}

              {/* Categories dropdown */}
              <>
                <Typography onClick={(e) => setCatMenuAnchor(e.currentTarget as HTMLElement)}
                  sx={{ ...navTypo(), display: 'flex', alignItems: 'center', gap: 0.3, color: isDarkMode ? '#ffffff' : '#000000' }}>
                  Categories ▾
                </Typography>
                <Menu anchorEl={catMenuAnchor} open={Boolean(catMenuAnchor)} onClose={() => setCatMenuAnchor(null)}
                  PaperProps={{ sx: { bgcolor: isDarkMode ? 'rgba(15,23,42,0.97)' : '#fff', backdropFilter: 'blur(12px)', borderRadius: 3, minWidth: 230, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', mt: 1 } }}>
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat.slug}
                      selected={cat.slug === 'boundaries'}
                      onClick={() => { setCatMenuAnchor(null); navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`); }}
                      sx={{ fontWeight: cat.slug === 'boundaries' ? 700 : 500, color: isDarkMode ? '#e2e8f0' : '#1e293b', gap: 1.2, borderRadius: 2, mx: 0.5, my: 0.2 }}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Menu>
                <Typography sx={sep}>|</Typography>
              </>

              {/* Auth / User */}
              {isAuthenticated ? (
                <>
                  <Typography onClick={() => logout()} sx={navTypo()}>Logout</Typography>
                  <Typography sx={sep}>|</Typography>
                  <Typography sx={{ ...navTypo(), fontWeight: 600 }}>{userInfo?.preferred_username || 'User'}</Typography>
                  <Typography sx={sep}>|</Typography>
                </>
              ) : !authLoading ? (
                <>
                  <Typography onClick={() => login(window.location.href)} sx={navTypo()}>Login</Typography>
                  <Typography sx={sep}>|</Typography>
                  <Typography onClick={() => register(window.location.href)} sx={navTypo()}>Signup</Typography>
                  <Typography sx={sep}>|</Typography>
                </>
              ) : null}

              {/* Back to GN */}
              <Typography onClick={() => navigate(gnPageUrl)} sx={navTypo()}>
                <ArrowBackIcon sx={{ fontSize: 14, mr: 0.3, verticalAlign: 'middle' }} />
                {decodedGnName}
              </Typography>
            </Box>
          ) : (
            /* Mobile */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDarkMode ? '#fff' : '#000' }}>Categories</Typography>
              <IconButton onClick={(e) => setMobileMenuAnchor(e.currentTarget)} size="small" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={() => setMobileMenuAnchor(null)}
                PaperProps={{ sx: { bgcolor: isDarkMode ? 'rgba(15,23,42,0.95)' : '#fff', backdropFilter: 'blur(10px)', minWidth: 200, borderRadius: 2 } }}>
                <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(gnPageUrl); }}>← Back to GN page</MenuItem>
                <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(gnPageUrl); }}>Home</MenuItem>
                {isAuthenticated && (<>
                  <Divider />
                  <MenuItem disabled sx={{ fontWeight: 'bold' }}>Welcome, {userInfo?.preferred_username || 'User'}</MenuItem>
                  <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(isSuperAdmin ? '/admins' : '/user'); }}>Dashboard</MenuItem>
                  <MenuItem onClick={() => { setMobileMenuAnchor(null); logout(); }} sx={{ color: '#ef4444' }}>Logout</MenuItem>
                </>)}
                {!isAuthenticated && !authLoading && (<>
                  <Divider />
                  <MenuItem onClick={() => { setMobileMenuAnchor(null); login(window.location.href); }}>Login</MenuItem>
                  <MenuItem onClick={() => { setMobileMenuAnchor(null); register(window.location.href); }}>Signup</MenuItem>
                </>)}
                <>
                  <Divider />
                  <MenuItem disabled sx={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.6 }}>Categories</MenuItem>
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat.slug} onClick={() => { setMobileMenuAnchor(null); navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`); }}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </>
              </Menu>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Page Hero ──────────────────────────────────────────────────────── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 6, sm: 8 }, px: 3, textAlign: 'center',
        boxShadow: 'inset 0 -10px 30px -10px rgba(0,0,0,0.3)',
      }}>
        {/* Subtle decorative elements */}
        <Box sx={{ position: 'absolute', top: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(50px)' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: '3.5rem', sm: '4.5rem' }, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>🗺️</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.2rem', sm: '3.5rem' }, color: '#fff', mt: 1.5, letterSpacing: '-1.2px', textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            Boundaries Information
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', mt: 1, fontWeight: 500 }}>
            {decodedGnName} &nbsp;<span style={{opacity: 0.6}}>•</span>&nbsp; <span style={{fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: '6px'}}>{ccode}</span>
          </Typography>

          {/* Breadcrumb chips */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mt: 4 }}>
            {district && (
              <Chip
                icon={<AccountBalanceIcon sx={{ fontSize: '1.1rem !important', color: '#fff' }} />}
                label={`District: ${district.admin2NameEn}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: '0.88rem', py: 2.2, px: 0.5, borderRadius: 3, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
            )}
            {gn?.dsEn && (
              <Chip
                icon={<BusinessIcon sx={{ fontSize: '1.1rem !important', color: '#fff' }} />}
                label={`DS Division: ${gn.dsEn}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: '0.88rem', py: 2.2, px: 0.5, borderRadius: 3, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
            )}
            {gn?.nameEn && (
              <Chip
                icon={<LocationOnIcon sx={{ fontSize: '1.1rem !important', color: '#fff' }} />}
                label={`GN: ${gn.nameEn}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: '0.88rem', py: 2.2, px: 0.5, borderRadius: 3, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
            )}
          </Box>
        </Box>
      </Box>


      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, sm: 4 }, py: { xs: 4, sm: 6 } }}>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            Failed to load data: {error.message}
          </Alert>
        )}

        {!loading && !error && gn && (
          <Grid container spacing={3}>

            {/* ── Location Hierarchy ─────────────────────────────────────── */}
            <Grid item xs={12}>
              <SectionCard
                icon={<LocationOnIcon />}
                title="Administrative Boundaries"
                subtitle="Hierarchical location information"
                accentColor={isDarkMode ? '#ffffff' : '#000000'}
                card={tc.card}
                border={tc.border}
              >
                <Grid container spacing={2} alignItems="stretch">
                  {/* District */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2.5, borderRadius: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', textAlign: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                      <AccountBalanceIcon sx={{ color: isDarkMode ? '#ffffff' : '#000000', mb: 1, fontSize: '2rem' }} />
                      <Typography sx={{ fontSize: '0.75rem', color: tc.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>District</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: tc.text, mt: 0.5 }}>{district?.admin2NameEn || '—'}</Typography>
                      {district?.admin2NameSi && <Typography sx={{ fontSize: '0.82rem', color: tc.muted, mt: 0.2 }}>{district.admin2NameSi}</Typography>}
                    </Box>
                  </Grid>
                  {/* DS Division */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2.5, borderRadius: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', textAlign: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                      <BusinessIcon sx={{ color: isDarkMode ? '#ffffff' : '#000000', mb: 1, fontSize: '2rem' }} />
                      <Typography sx={{ fontSize: '0.75rem', color: tc.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>DS Division / City</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: tc.text, mt: 0.5 }}>{gn?.dsEn || '—'}</Typography>
                      {gn?.dsSi && <Typography sx={{ fontSize: '0.82rem', color: tc.muted, mt: 0.2 }}>{gn.dsSi}</Typography>}
                    </Box>
                  </Grid>
                  {/* GN */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2.5, borderRadius: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', textAlign: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                      <LocationOnIcon sx={{ color: isDarkMode ? '#ffffff' : '#000000', mb: 1, fontSize: '2rem' }} />
                      <Typography sx={{ fontSize: '0.75rem', color: tc.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Grama Niladhari</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: tc.text, mt: 0.5 }}>{gn?.nameEn || '—'}</Typography>
                      {gn?.nameSi && <Typography sx={{ fontSize: '0.82rem', color: tc.muted, mt: 0.2 }}>{gn.nameSi}</Typography>}
                      {gn?.CCODE && (
                        <Box sx={{ mt: 'auto', pt: 1.5 }}>
                          <Chip label={`CCODE: ${gn.CCODE}`} size="small"
                            sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: tc.text, fontWeight: 800, fontSize: '0.75rem', fontFamily: 'monospace' }} />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* ── Police Station ─────────────────────────────────────────── */}
            <Grid item xs={12} md={6} sx={{ mx: 'auto' }}>
              <SectionCard
                icon={<LocalPoliceIcon />}
                title="Police Station"
                subtitle="Nearest police station details"
                accentColor={isDarkMode ? '#ffffff' : '#000000'}
                card={tc.card}
                border={tc.border}
              >
                {police ? (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, borderRadius: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', textAlign: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
                    <LocalPoliceIcon sx={{ color: isDarkMode ? '#ffffff' : '#000000', mb: 1.5, fontSize: '2.5rem' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: tc.text }}>
                      {police.psName || '—'}
                    </Typography>
                    {police.psNameSi && (
                      <Typography sx={{ fontSize: '0.9rem', color: tc.muted, mt: 0.3 }}>{police.psNameSi}</Typography>
                    )}
                    {police.psNameTa && (
                      <Typography sx={{ fontSize: '0.9rem', color: tc.muted }}>{police.psNameTa}</Typography>
                    )}

                    <Box sx={{ mt: 2.5, width: '100%', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      {police.psId && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '0.8rem', color: tc.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station ID:</Typography>
                          <Typography sx={{ fontSize: '0.9rem', color: tc.text, fontWeight: 800, fontFamily: 'monospace' }}>{police.psId}</Typography>
                        </Box>
                      )}
                      {police.distanceToThePoliceStation && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '0.8rem', color: tc.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance:</Typography>
                          <Typography sx={{ fontSize: '0.9rem', color: tc.text, fontWeight: 800 }}>{police.distanceToThePoliceStation} km</Typography>
                        </Box>
                      )}
                    </Box>

                    {police.lat && police.lng && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          component="a"
                          href={`https://www.google.com/maps?q=${police.lat},${police.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            fontSize: '0.85rem', color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 700,
                            textDecoration: 'none', '&:hover': { textDecoration: 'underline' },
                            bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', px: 2, py: 1, borderRadius: 2
                          }}
                        >
                          <DirectionsIcon sx={{ fontSize: '1.1rem' }} /> View on Maps
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography sx={{ color: tc.muted, fontSize: '0.88rem', fontStyle: 'italic', py: 2 }}>
                    No police station data available for this GN division.
                  </Typography>
                )}
              </SectionCard>
            </Grid>

            {/* ── Post Offices in District ────────────────────────────────── */}
            <Grid item xs={12}>
              <SectionCard
                icon={<LocalPostOfficeIcon />}
                title="Post Offices"
                subtitle={`Nearest post offices: GN (${gnNameDecoded}) → DS Division (${gn?.dsEn ?? ''}) → District (${districtName ?? ''})`}
                accentColor={isDarkMode ? '#ffffff' : '#000000'}
                card={tc.card}
                border={tc.border}
              >
                {postLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} sx={{ color: isDarkMode ? '#ffffff' : '#000000' }} />
                  </Box>
                ) : postOffices.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 380 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {['Level', 'Post Office', 'Sinhala / Tamil', 'Postal Code', 'Map'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.4px', color: tc.text, bgcolor: tc.card, borderBottom: isDarkMode ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.2)' }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {postOffices.map((po: any, idx: number) => {
                          const levelLabels = [
                            { label: 'GN Division',   color: '#6366f1' },
                            { label: 'DS Division',   color: '#0ea5e9' },
                            { label: 'District',      color: '#10b981' },
                          ];
                          const lvl = levelLabels[idx] ?? { label: `Level ${idx + 1}`, color: '#94a3b8' };
                          return (
                            <TableRow key={po.id} hover sx={{ '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }}>
                              <TableCell>
                                <Chip label={lvl.label} size="small"
                                  sx={{ bgcolor: `${lvl.color}18`, color: lvl.color, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${lvl.color}33` }} />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: tc.text, fontSize: '0.85rem' }}>
                                {po.placeNameEnglish}
                              </TableCell>
                              <TableCell sx={{ color: tc.muted, fontSize: '0.8rem', lineHeight: 1.4 }}>
                                {po.sinhala && <div>{po.sinhala}</div>}
                                {po.tamil && <div>{po.tamil}</div>}
                              </TableCell>
                              <TableCell>
                                <Chip label={po.postalCode || '—'} size="small"
                                  sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: tc.text, fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace' }} />
                              </TableCell>
                              <TableCell>
                                {po.latitude && po.longitude ? (
                                  <Typography
                                    component="a"
                                    href={`https://www.google.com/maps?q=${po.latitude},${po.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, fontSize: '0.8rem', color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                  >
                                    <DirectionsIcon sx={{ fontSize: '0.95rem' }} /> Maps
                                  </Typography>
                                ) : '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography sx={{ color: tc.muted, fontSize: '0.88rem', fontStyle: 'italic', py: 2 }}>
                    No post office data found for the {districtName} district.
                  </Typography>
                )}
              </SectionCard>
              {/* ── Approved User Submissions ─────────────────────────────── */}
            {approvedLoading && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} sx={{ color: isDarkMode ? '#ffffff' : '#000000' }} />
                </Box>
              </Grid>
            )}

            {Object.entries(groupedSubs).map(([subCatName, subs]) => (
              <Grid item xs={12} key={subCatName}>
                <SectionCard
                  icon={<AccountBalanceIcon />}
                  title={subCatName}
                  subtitle={`${subs.length} approved record${subs.length !== 1 ? 's' : ''}`}
                  accentColor={isDarkMode ? '#ffffff' : '#000000'}
                  card={tc.card}
                  border={tc.border}
                >
                  <Grid container spacing={2}>
                    {subs.map((sub: any, idx: number) => {
                      const answers = parseAnswers(sub);
                      return (
                        <Grid item xs={12} sm={6} key={sub.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                              border: `1px solid ${tc.border}`,
                              borderRadius: 3,
                              overflow: 'hidden',
                              transition: 'all 0.2s',
                              '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' },
                            }}
                          >
                            <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${tc.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDarkMode ? '#a78bfa' : '#6366f1' }}>#{idx + 1}</Typography>
                              <Typography sx={{ fontSize: '0.72rem', color: tc.muted }}>{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : ''}</Typography>
                            </Box>
                            <TableContainer>
                              <Table size="small">
                                <TableBody>
                                  {answers.map((a, aIdx) => (
                                    <TableRow key={aIdx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: tc.muted, width: '40%', borderBottom: `1px solid ${tc.border}`, py: 1.2 }}>
                                        {a.question}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: '0.85rem', color: tc.text, fontWeight: 500, borderBottom: `1px solid ${tc.border}`, py: 1.2, wordBreak: 'break-word' }}>
                                        {a.answer}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </SectionCard>
              </Grid>
            ))}

          </Grid>



          </Grid>
        )}

        {!loading && !error && !gn && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ fontSize: '3rem' }}>🔍</Typography>
            <Typography sx={{ color: tc.muted, mt: 1 }}>No data found for GN code: {ccode}</Typography>
          </Box>
        )}
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <GnPageFooter isDarkMode={isDarkMode} />
    </Box>
  );
};

export default BoundariesPage;
