import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem, Divider,
  useTheme, useMediaQuery, CircularProgress, Paper,
  Table, TableBody, TableRow, TableCell, TableContainer,
  Chip, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../auth/AuthProvider';
import { GET_CATEGORY_BY_SLUG } from '../graphql/queries';
import GnPageFooter from '../components/GnPageFooter';

// ─── Category Config ─────────────────────────────────────────────────────────

export const CATEGORIES = [
  { name: 'Boundaries', slug: 'location-1-1', emoji: '🗺️', color: '#6366f1', dbId: '31720' },
  { name: 'Space', slug: 'location-1-2', emoji: '📐', color: '#8b5cf6', dbId: '31945' },
  { name: 'Land', slug: 'location-1-3', emoji: '🌾', color: '#22c55e', dbId: '32021' },
  { name: 'Building/Land', slug: 'location-1-4', emoji: '🏠', color: '#f59e0b', dbId: '32063' },
  { name: 'Roads', slug: 'location-1-5', emoji: '🛣️', color: '#94a3b8', dbId: '34514' },
  { name: 'Geographical location', slug: 'location-1-6', emoji: '🌍', color: '#0ea5e9', dbId: '34641' },
  { name: 'Natural location', slug: 'location-1-7', emoji: '🏔️', color: '#10b981', dbId: '34655' },
  { name: 'Water base spaces', slug: 'location-1-8', emoji: '💧', color: '#38bdf8', dbId: '34663' },
  { name: 'Lines', slug: 'location-1-9', emoji: '⚡', color: '#f97316', dbId: '34750' },
  { name: 'Flora', slug: 'location-1-10', emoji: '🌿', color: '#84cc16', dbId: '34759' },
];

// ─── Helper ────────────────────────────────────────────────────────────────

const getThemeColors = (dark: boolean) => ({
  primary: dark ? '#7c3aed' : '#4f46e5',
  bg: dark ? '#0f172a' : '#f8fafc',
  card: dark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)',
  text: dark ? '#f1f5f9' : '#1e293b',
  muted: dark ? '#94a3b8' : '#64748b',
  border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
});

// ─── Component ────────────────────────────────────────────────────────────────

const FastBigCardItem = ({ item, idx, tc, catColor, qMap }: any) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Parse Answers dynamically
  const answers: { question: string, answer: string }[] = [];
  if (item.image_path) answers.push({ question: 'Image', answer: String(item.image_path) });
  
  if (item.reg_number) answers.push({ question: 'Reg Number', answer: String(item.reg_number) });
  if (item.name_en) answers.push({ question: 'Name (EN)', answer: String(item.name_en) });
  if (item.name_si) answers.push({ question: 'Name (SI)', answer: String(item.name_si) });
  if (item.name_ta) answers.push({ question: 'Name (TA)', answer: String(item.name_ta) });
  
  answers.push({ question: 'National', answer: 'Sri Lanka' });
  if (item.province_name) answers.push({ question: 'Province', answer: String(item.province_name) });
  if (item.district_name) answers.push({ question: 'District', answer: String(item.district_name) });
  if (item.ds_name) answers.push({ question: 'DS Division', answer: String(item.ds_name) });
  if (item.gn_name) answers.push({ question: 'GN Name', answer: String(item.gn_name) });
  if (item.address) answers.push({ question: 'Address', answer: String(item.address) });
  if (item.mobile) answers.push({ question: 'Mobile', answer: String(item.mobile) });

  Object.keys(item).forEach(key => {
    if (key.startsWith('q_')) {
      const parts = key.split('_');
      const qId = parts[1];
      const iter = parts[2];
      let label = qMap[qId] || `Question #${qId}`;
      if (iter && iter !== '1') label += ` (Item #${iter})`;
      if (item[key]) answers.push({ question: label, answer: String(item[key]) });
    }
  });

  const title = item.name_en || item.name_si || item.name_ta || `#${idx + 1}`;
  const displayAnswers = answers.filter(a => a.question !== 'Image');
  const visibleAnswers = displayAnswers.slice(0, 3);

  const hasMap = item.latitude && item.longitude;

  return (
    <>
      <Grid item xs={12} md={6} key={item.id}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: tc.card,
            border: `1.5px solid ${tc.border}`,
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'all 0.3s',
            position: 'relative',
            '&::before': { content: '""', position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: catColor },
            '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
          }}
        >
          <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${tc.border}`, bgcolor: `${catColor}06`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: catColor }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: tc.muted }}>
              {item.reg_number || (item.created_at ? new Date(item.created_at).toLocaleDateString() : '')}
            </Typography>
          </Box>

          {answers.find(a => a.question === 'Image') && (
            <Box
              component="img"
              src={`/api/uploads/category_images/${answers.find(a => a.question === 'Image')?.answer}`}
              alt="Submission Image"
              sx={{ width: '100%', height: 160, objectFit: 'cover' }}
            />
          )}

          <TableContainer>
            <Table size="small">
              <TableBody>
                {visibleAnswers.map((a, aIdx) => (
                  <TableRow key={aIdx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: tc.muted, width: '40%', borderBottom: `1px solid ${tc.border}`, py: 1.5 }}>
                      {a.question}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.88rem', color: tc.text, fontWeight: 500, borderBottom: `1px solid ${tc.border}`, py: 1.5, wordBreak: 'break-word' }}>
                      {a.answer}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', bgcolor: 'rgba(0,0,0,0.02)', borderTop: `1px solid ${tc.border}` }}>
            <Button
              size="small"
              onClick={() => setDialogOpen(true)}
              sx={{ color: catColor, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
            >
              📋 View All Details
            </Button>
            {hasMap && (
              <Button
                size="small"
                onClick={() => window.open(`https://maps.google.com/?q=${item.latitude},${item.longitude}`, '_blank')}
                sx={{ color: '#10b981', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
              >
                📍 Show on Map
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Popup Dialog for All Details */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: tc.text, borderBottom: `1px solid ${tc.border}` }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {answers.find(a => a.question === 'Image') && (
            <Box
              component="img"
              src={`/api/uploads/category_images/${answers.find(a => a.question === 'Image')?.answer}`}
              alt="Submission Image"
              sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', bgcolor: '#000' }}
            />
          )}
          <TableContainer>
            <Table size="small">
              <TableBody>
                {displayAnswers.map((a, aIdx) => (
                  <TableRow key={aIdx}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', color: tc.muted, width: '35%', py: 1.5 }}>
                      {a.question}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', color: tc.text, fontWeight: 500, py: 1.5, wordBreak: 'break-word' }}>
                      {a.answer}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${tc.border}`, p: 2 }}>
          {hasMap && (
            <Button
              onClick={() => window.open(`https://maps.google.com/?q=${item.latitude},${item.longitude}`, '_blank')}
              sx={{ color: '#10b981', fontWeight: 700 }}
            >
              📍 Show on Map
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)} sx={{ color: tc.muted, fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const FastBigCardList = ({ slug, categoryName, gnId, catColor, parentQuestions }: { slug: string, categoryName: string, gnId: string, catColor: string, parentQuestions: any[] }) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const tc = getThemeColors(false);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/category-data/${slug}?gn_id=${gnId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setLoading(false);
      });
    return () => controller.abort();
  }, [slug, gnId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: catColor }} /></Box>;
  if (data.length === 0) return null;

  const qMap: Record<string, string> = {};
  parentQuestions.forEach((q: any) => {
    qMap[String(q.id)] = q.questionTextEn || `Question ${q.id}`;
  });

  return (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 4, height: 28, borderRadius: 2, bgcolor: catColor }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: tc.text, fontFamily: "'Inter', sans-serif" }}>
          {categoryName}
        </Typography>
        <Chip label={`${data.length}`} size="small" sx={{ bgcolor: `${catColor}15`, color: catColor, fontWeight: 700, fontSize: '0.75rem' }} />
      </Box>

      <Grid container spacing={3}>
        {data.map((item: any, idx: number) => (
          <FastBigCardItem key={item.id} item={item} idx={idx} tc={tc} catColor={catColor} qMap={qMap} />
        ))}
      </Grid>
    </Box>
  );
};

const CategoryDetailPage: React.FC = () => {
  const { gnName, ccode, categorySlug } = useParams<{
    gnName: string;
    ccode: string;
    categorySlug: string;
  }>();

  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userInfo, logout, login, register } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [catMenuAnchor, setCatMenuAnchor] = useState<null | HTMLElement>(null);

  const tc = getThemeColors(isDarkMode);
  const isSuperAdmin = userInfo?.realm_roles?.includes('super_admin');

  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const catName = category?.name ?? categorySlug ?? 'Category';
  const catEmoji = category?.emoji ?? '📋';
  const catColor = category?.color ?? '#4f46e5';

  const gnPageUrl = `/gnpage/${gnName}/${ccode}`;

  const [subCatTables, setSubCatTables] = useState<any[]>([]);

  // 1. Fetch tables by SLUG instead of dbId
  React.useEffect(() => {
    if (!categorySlug) return;

    fetch(`/api/category-tables/${categorySlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tables) {
          setSubCatTables(data.tables);
        } else {
          setSubCatTables([]);
        }
      })
      .catch(err => {
        console.error('Error fetching category tables:', err);
        setSubCatTables([]);
      });
  }, [categorySlug]);

  // 2. Fetch the dynamic category ID for the GraphQL query
  const { data: catData } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug: categorySlug },
    skip: !categorySlug,
  });



  const navTypoSx = (color?: string) => ({
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    color: color ?? (isDarkMode ? '#ffffff' : '#000000'),
    '&:hover': { opacity: 0.7 },
  });

  const sepSx = { opacity: 0.4, fontWeight: 300, color: isDarkMode ? '#ffffff' : '#000000' };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        bgcolor: tc.bg,
        transition: 'background 0.3s',
      }}
    >
      {/* Navigation Navbar (Pill shape) */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <Box
          sx={{
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
          }}
        >
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
              <Typography onClick={() => navigate(gnPageUrl)} sx={navTypoSx()}>Home</Typography>
              <Typography sx={sepSx}>|</Typography>

              {isAuthenticated && (
                <>
                  <Typography onClick={() => isSuperAdmin ? navigate('/admins') : navigate('/user')} sx={navTypoSx()}>
                    {isSuperAdmin ? 'Dashboard' : 'My Account'}
                  </Typography>
                  <Typography sx={sepSx}>|</Typography>
                  <Typography onClick={() => { logout(); navigate('/gnpage'); }} sx={navTypoSx()}>Logout</Typography>
                  <Typography sx={sepSx}>|</Typography>
                </>
              )}

              {/* Categories Dropdown */}
              <Typography onClick={(e) => setCatMenuAnchor(e.currentTarget)} sx={{ ...navTypoSx(), display: 'flex', alignItems: 'center', gap: 0.3 }}>
                Categories ▾
              </Typography>
              <Menu anchorEl={catMenuAnchor} open={Boolean(catMenuAnchor)} onClose={() => setCatMenuAnchor(null)} PaperProps={{ sx: { borderRadius: 3, mt: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.slug} selected={cat.slug === categorySlug} onClick={() => { setCatMenuAnchor(null); navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`); }}>
                    {cat.emoji} {cat.name}
                  </MenuItem>
                ))}
              </Menu>

              {/* Back arrow + GN Name */}
              <Typography sx={sepSx}>|</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton onClick={() => navigate(gnPageUrl)} size="small" sx={{ color: catColor, p: 0.3 }}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ ...navTypoSx(catColor), fontSize: '0.9rem' }}>
                  {decodeURIComponent(gnName ?? '').replace(/-/g, ' ')}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <IconButton onClick={(e) => setMobileMenuAnchor(e.currentTarget)} size="small" sx={{ color: isDarkMode ? '#fff' : '#000', p: 0.5 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
              <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={() => setMobileMenuAnchor(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 200 } }}>
                <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(gnPageUrl); }}>Home</MenuItem>
                {isAuthenticated && (
                  <>
                    <MenuItem onClick={() => { setMobileMenuAnchor(null); isSuperAdmin ? navigate('/admins') : navigate('/user'); }}>
                      {isSuperAdmin ? 'Dashboard' : 'My Account'}
                    </MenuItem>
                    <MenuItem onClick={() => { setMobileMenuAnchor(null); logout(); navigate('/gnpage'); }}>Logout</MenuItem>
                  </>
                )}
                <>
                  <Divider />
                  <MenuItem disabled sx={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.6 }}>Categories</MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem
                      key={cat.slug}
                      selected={cat.slug === categorySlug}
                      onClick={() => { setMobileMenuAnchor(null); navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`); }}
                    >
                      {cat.name}
                    </MenuItem>
                  ))}
                </>
              </Menu>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          pt: 12,
          pb: 5,
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          background: `linear-gradient(180deg, ${catColor}15 0%, transparent 100%)`,
        }}
      >
        <Typography sx={{ fontSize: '0.85rem', color: tc.muted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {decodeURIComponent(gnName ?? '').replace(/-/g, ' ')} / {ccode}
        </Typography>

        <Typography sx={{ fontSize: { xs: '3rem', sm: '4rem' }, lineHeight: 1 }}>
          {catEmoji}
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '3rem' },
            background: `linear-gradient(135deg, ${catColor}, ${catColor}99)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: '-1px',
            lineHeight: 1.1,
          }}
        >
          {catName}
        </Typography>

      </Box>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, px: { xs: 2, sm: 4, md: 6 }, pb: 6, maxWidth: 1200, mx: 'auto', width: '100%' }}>

        {/* Bulk Uploaded Data Section (Dynamic Subcategories) */}
        {subCatTables.length > 0 ? (
          <Box sx={{ mt: 4 }}>
            {subCatTables.map((subCat: any) => (
              <Box key={subCat.slug} sx={{ mb: 2 }}>
                <FastBigCardList 
                  slug={subCat.slug} 
                  categoryName={subCat.nameEn} 
                  gnId={ccode} 
                  catColor={catColor}
                  parentQuestions={catData?.categoryBySlug?.questions || []}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>📭</Typography>
            <Typography sx={{ fontSize: '1.1rem', color: tc.muted, fontWeight: 500 }}>
              No approved data yet for <strong>{catName}</strong> in this GN division.
            </Typography>
          </Box>
        )}

        {/* Navigate to other categories */}
        <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 700, mx: 'auto' }}>
          {CATEGORIES.filter((c) => c.slug !== categorySlug).map((cat) => (
            <Box
              key={cat.slug}
              onClick={() => navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.8,
                px: 2, py: 1, borderRadius: 20,
                border: `1.5px solid ${cat.color}33`,
                bgcolor: `${cat.color}11`,
                cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': { bgcolor: `${cat.color}22`, transform: 'translateY(-1px)' },
              }}
            >
              <Typography sx={{ fontSize: '1rem' }}>{cat.emoji}</Typography>
              <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: cat.color }}>{cat.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────────── */} 
      <GnPageFooter isDarkMode={isDarkMode} />
    </Box>
  );
};

export default CategoryDetailPage;
