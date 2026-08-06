import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem, Divider,
  useTheme, useMediaQuery
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import GnPageFooter from '../components/GnPageFooter';
import BoundariesPage from './BoundariesPage';

// ─── Category Config ─────────────────────────────────────────────────────────

export const CATEGORIES = [
  { name: 'Boundaries',             slug: 'boundaries',            emoji: '🗺️',  color: '#6366f1' },
  { name: 'Geographical location',  slug: 'geographical-location', emoji: '🌍',  color: '#0ea5e9' },
  { name: 'Space',                  slug: 'space',                 emoji: '📐',  color: '#8b5cf6' },
  { name: 'Land',                   slug: 'land',                  emoji: '🌾',  color: '#22c55e' },
  { name: 'Building/Land',          slug: 'building-land',         emoji: '🏠',  color: '#f59e0b' },
  { name: 'Water base spaces',      slug: 'water-base-spaces',     emoji: '💧',  color: '#38bdf8' },
  { name: 'Road',                   slug: 'road',                  emoji: '🛣️',  color: '#94a3b8' },
  { name: 'Natural location',       slug: 'natural-location',      emoji: '🏔️',  color: '#10b981' },
  { name: 'Lines',                  slug: 'lines',                 emoji: '⚡',  color: '#f97316' },
  { name: 'Flora',                  slug: 'flora',                 emoji: '🌿',  color: '#84cc16' },
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

  // Delegate to dedicated pages for specific categories
  if (categorySlug === 'boundaries') return <BoundariesPage />;

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
          {/* Dark mode & Search toggle */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              onClick={() => setIsDarkMode(!isDarkMode)}
              size="small"
              sx={{ color: isDarkMode ? '#ffffff' : '#000000', p: 0.5 }}
            >
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
            <IconButton
              onClick={() => navigate('/gnpage')}
              size="small"
              sx={{ color: isDarkMode ? '#ffffff' : '#000000', p: 0.5 }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
              {/* Home */}
              <Typography onClick={() => navigate(gnPageUrl)} sx={navTypoSx()}>
                Home
              </Typography>
              <Typography sx={sepSx}>|</Typography>

              {/* Dashboard */}
              {isAuthenticated && (
                <>
                  <Typography
                    onClick={() => navigate(isSuperAdmin ? '/admins' : '/user')}
                    sx={navTypoSx()}
                  >
                    Dashboard
                  </Typography>
                  <Typography sx={sepSx}>|</Typography>
                </>
              )}

              {/* Categories dropdown */}
              <>
                <Typography
                  onClick={(e) => setCatMenuAnchor(e.currentTarget as HTMLElement)}
                  sx={{ ...navTypoSx(), display: 'flex', alignItems: 'center', gap: 0.3 }}
                >
                  {catName} ▾
                </Typography>
                <Menu
                  anchorEl={catMenuAnchor}
                  open={Boolean(catMenuAnchor)}
                  onClose={() => setCatMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      bgcolor: isDarkMode ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 3,
                      minWidth: 220,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      mt: 1,
                    },
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem
                      key={cat.slug}
                      selected={cat.slug === categorySlug}
                      onClick={() => {
                        setCatMenuAnchor(null);
                        navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`);
                      }}
                      sx={{
                        fontWeight: cat.slug === categorySlug ? 700 : 500,
                        color: isDarkMode ? '#e2e8f0' : '#1e293b',
                        gap: 1.2,
                        borderRadius: 2,
                        mx: 0.5,
                        my: 0.2,
                      }}
                    >
                      {cat.name}
                    </MenuItem>
                  ))}
                </Menu>
                <Typography sx={sepSx}>|</Typography>
              </>

              {/* Auth / User */}
              {isAuthenticated ? (
                <>
                  <Typography onClick={() => logout()} sx={navTypoSx()}>
                    Logout
                  </Typography>
                  <Typography sx={sepSx}>|</Typography>
                  <Typography sx={{ ...navTypoSx(), fontWeight: 600 }}>
                    {userInfo?.preferred_username || userInfo?.name || 'User'}
                  </Typography>
                  <Typography sx={sepSx}>|</Typography>
                </>
              ) : !isLoading ? (
                <>
                  <Typography onClick={() => login(window.location.href)} sx={navTypoSx()}>
                    Login
                  </Typography>
                  <Typography sx={sepSx}>|</Typography>
                  <Typography onClick={() => register(window.location.href)} sx={navTypoSx()}>
                    Signup
                  </Typography>
                  <Typography sx={sepSx}>|</Typography>
                </>
              ) : null}

              {/* Back to GN page */}
              <Typography onClick={() => navigate(gnPageUrl)} sx={navTypoSx()}>
                <ArrowBackIcon sx={{ fontSize: 14, mr: 0.3, verticalAlign: 'middle' }} />
                {decodeURIComponent(gnName ?? '').replace(/-/g, ' ')}
              </Typography>
            </Box>
          )}

          {/* Mobile nav */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDarkMode ? '#fff' : '#000' }}>
                {catName}
              </Typography>
              <IconButton onClick={(e) => setMobileMenuAnchor(e.currentTarget)} size="small" sx={{ color: isDarkMode ? '#fff' : '#000' }}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={() => setMobileMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    minWidth: 200,
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(gnPageUrl); }}>
                  ← Back to GN page
                </MenuItem>
                <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(gnPageUrl); }}>Home</MenuItem>
                {isAuthenticated && (
                  <>
                    <Divider />
                    <MenuItem disabled sx={{ fontWeight: 'bold' }}>
                      Welcome, {userInfo?.preferred_username || 'User'}
                    </MenuItem>
                    <MenuItem onClick={() => { setMobileMenuAnchor(null); navigate(isSuperAdmin ? '/admins' : '/user'); }}>
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => { setMobileMenuAnchor(null); logout(); }} sx={{ color: '#ef4444' }}>
                      Logout
                    </MenuItem>
                  </>
                )}
                {!isAuthenticated && !isLoading && (
                  <>
                    <Divider />
                    <MenuItem onClick={() => { setMobileMenuAnchor(null); login(window.location.href); }}>Login</MenuItem>
                    <MenuItem onClick={() => { setMobileMenuAnchor(null); register(window.location.href); }}>Signup</MenuItem>
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

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          px: 3,
          gap: 3,
        }}
      >
        {/* GN breadcrumb */}
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: tc.muted,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {decodeURIComponent(gnName ?? '').replace(/-/g, ' ')} / {ccode}
        </Typography>

        {/* Giant emoji */}
        <Typography sx={{ fontSize: { xs: '5rem', sm: '7rem' }, lineHeight: 1 }}>
          {catEmoji}
        </Typography>

        {/* Category name — test data placeholder */}
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' },
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

        {/* Placeholder note */}
        <Box
          sx={{
            mt: 2,
            px: 3,
            py: 1.5,
            borderRadius: 3,
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${tc.border}`,
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: tc.muted, textAlign: 'center' }}>
            📋 This is a placeholder page for the <strong>{catName}</strong> category.
            <br />
            Data for <strong>{decodeURIComponent(ccode ?? '')}</strong> will be shown here once available.
          </Typography>
        </Box>

        {/* Navigate to other categories (super admin only) */}
        {isSuperAdmin && (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: 'center',
              maxWidth: 700,
            }}
          >
            {CATEGORIES.filter((c) => c.slug !== categorySlug).map((cat) => (
              <Box
                key={cat.slug}
                onClick={() => navigate(`/gnpage/${gnName}/${ccode}/${cat.slug}`)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 2,
                  py: 1,
                  borderRadius: 20,
                  border: `1.5px solid ${cat.color}33`,
                  bgcolor: `${cat.color}11`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: `${cat.color}22`, transform: 'translateY(-1px)' },
                }}
              >
                <Typography sx={{ fontSize: '1rem' }}>{cat.emoji}</Typography>
                <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: cat.color }}>
                  {cat.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <GnPageFooter isDarkMode={isDarkMode} />
    </Box>
  );
};

export default CategoryDetailPage;
