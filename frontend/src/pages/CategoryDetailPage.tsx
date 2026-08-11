import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem, Divider,
  useTheme, useMediaQuery, CircularProgress, Alert, Paper,
  Table, TableBody, TableRow, TableCell, TableContainer,
  Chip, Grid
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../auth/AuthProvider';
import { GET_APPROVED_SUBMISSIONS } from '../graphql/queries';
import GnPageFooter from '../components/GnPageFooter';
import CategoryDataList from '../components/CategoryDataList';
import CategoryDataAdminTable from '../components/CategoryDataAdminTable';

// ─── Category Config ─────────────────────────────────────────────────────────

export const CATEGORIES = [
  { name: 'Boundaries',             slug: 'boundaries',            emoji: '🗺️',  color: '#6366f1', dbId: '2' },
  { name: 'Geographical location',  slug: 'geographical-location', emoji: '🌍',  color: '#0ea5e9', dbId: '2004' },
  { name: 'Space',                  slug: 'space',                 emoji: '📐',  color: '#8b5cf6', dbId: '230' },
  { name: 'Land',                   slug: 'land',                  emoji: '🌾',  color: '#22c55e', dbId: '306' },
  { name: 'Building/Land',          slug: 'building-land',         emoji: '🏠',  color: '#f59e0b', dbId: '1353' },
  { name: 'Water base spaces',      slug: 'water-base-spaces',     emoji: '💧',  color: '#38bdf8', dbId: '2026' },
  { name: 'Road',                   slug: 'road',                  emoji: '🛣️',  color: '#94a3b8', dbId: '1877' },
  { name: 'Natural location',       slug: 'natural-location',      emoji: '🏔️',  color: '#10b981', dbId: '2018' },
  { name: 'Lines',                  slug: 'lines',                 emoji: '⚡',  color: '#f97316', dbId: '2113' },
  { name: 'Flora',                  slug: 'flora',                 emoji: '🌿',  color: '#84cc16', dbId: '2122' },
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
  const catDbId = category?.dbId ?? '0';

  const gnPageUrl = `/gnpage/${gnName}/${ccode}`;

  const [subCatTables, setSubCatTables] = useState<any[]>([]);

  React.useEffect(() => {
    if (!catDbId || catDbId === '0') return;
    
    fetch(`/api/category-tables/${catDbId}`)
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
  }, [catDbId]);

  // Fetch approved submissions for this category + GN
  const { data: approvedData, loading: approvedLoading, error: approvedError } = useQuery(GET_APPROVED_SUBMISSIONS, {
    variables: { categoryId: catDbId, gnCode: ccode },
    skip: !ccode || !catDbId || catDbId === '0',
    fetchPolicy: 'cache-and-network',
  });

  const submissions = approvedData?.approvedSubmissions || [];

  // Parse answers and map question IDs to labels
  const parseAnswers = (submission: any) => {
    try {
      const answersRaw = typeof submission.answers_data === 'string'
        ? JSON.parse(submission.answers_data)
        : submission.answers_data;
      const questions = submission.category?.questions || [];

      // Build a map of questionId -> question text
      const qMap: Record<string, string> = {};
      questions.forEach((q: any) => {
        qMap[String(q.id)] = q.questionTextEn || `Question ${q.id}`;
      });

      // Parse answer keys like "5401_1" -> questionId=5401, index=1
      Object.entries(answersRaw).forEach(([key, value]) => {
        const parts = key.split('_');
        const qId = parts[0];
        const iter = parts[1];
        let questionLabel = qMap[qId] || `Question #${qId}`;
        if (iter && iter !== '1') {
          questionLabel += ` (Item #${iter})`;
        }
        parsed.push({ question: questionLabel, answer: String(value) });
      });

      return parsed;
    } catch {
      return [];
    }
  };

  // Group submissions by sub-category name
  const groupedSubmissions: Record<string, any[]> = {};
  submissions.forEach((sub: any) => {
    const subCatName = sub.category?.nameEn || 'General';
    if (!groupedSubmissions[subCatName]) groupedSubmissions[subCatName] = [];
    groupedSubmissions[subCatName].push(sub);
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

        <Chip
          label={`${submissions.length} record${submissions.length !== 1 ? 's' : ''}`}
          sx={{
            bgcolor: `${catColor}20`,
            color: catColor,
            fontWeight: 700,
            fontSize: '0.85rem',
            border: `1px solid ${catColor}30`,
          }}
        />
      </Box>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, px: { xs: 2, sm: 4, md: 6 }, pb: 6, maxWidth: 1200, mx: 'auto', width: '100%' }}>

        {approvedLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: catColor }} />
          </Box>
        )}

        {approvedError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load data. Please try again later.
          </Alert>
        )}

        {!approvedLoading && submissions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>📭</Typography>
            <Typography sx={{ fontSize: '1.1rem', color: tc.muted, fontWeight: 500 }}>
              No approved data yet for <strong>{catName}</strong> in this GN division.
            </Typography>
          </Box>
        )}

        {/* Render grouped submissions */}
        {Object.entries(groupedSubmissions).map(([subCatName, subs]) => (
          <Box key={subCatName} sx={{ mb: 5 }}>
            {/* Sub-category header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 4, height: 28, borderRadius: 2, bgcolor: catColor }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: tc.text, fontFamily: "'Inter', sans-serif" }}>
                {subCatName}
              </Typography>
              <Chip label={`${subs.length}`} size="small" sx={{ bgcolor: `${catColor}15`, color: catColor, fontWeight: 700, fontSize: '0.75rem' }} />
            </Box>

            {/* Each submission as a card */}
            <Grid container spacing={3}>
              {subs.map((sub: any, idx: number) => {
                const answers = parseAnswers(sub);
                return (
                  <Grid item xs={12} md={6} key={sub.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: tc.card,
                        border: `1.5px solid ${tc.border}`,
                        borderRadius: 4,
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0, left: 0, width: 4, height: '100%',
                          bgcolor: catColor,
                        },
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {/* Card header */}
                      <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${tc.border}`, bgcolor: `${catColor}06`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: catColor }}>
                          #{idx + 1}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: tc.muted }}>
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : ''}
                        </Typography>
                      </Box>

                      {/* Answers table */}
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {answers.map((a, aIdx) => (
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
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        {/* Bulk Uploaded Data Section (Dynamic Subcategories) */}
        {subCatTables.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {subCatTables.map((subCat: any) => (
              <Box key={subCat.slug} sx={{ mb: 2 }}>
                {isSuperAdmin ? (
                  <CategoryDataAdminTable 
                    slug={subCat.slug}
                    categoryName={subCat.nameEn}
                    hideIfEmpty={true}
                  />
                ) : (
                  <CategoryDataList 
                    slug={subCat.slug}
                    categoryName={subCat.nameEn}
                    gnId={ccode}
                    hideIfEmpty={true}
                  />
                )}
              </Box>
            ))}
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
