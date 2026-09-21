import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  Chip,
  Container,
  Divider,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useAuth } from '../auth/AuthProvider';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import { GET_CATEGORIES } from '../graphql/queries';

const LOCATION_KEY = 'user_selected_location';

interface SearchOption {
  type: 'category' | 'subcategory';
  label: string;
  labelSi: string;
  slug: string;
  parentName: string | null;
}

/** A corrupted or hand-edited storage entry must not take the whole page down. */
const readSavedLocation = (): any | null => {
  const raw = sessionStorage.getItem(LOCATION_KEY) || localStorage.getItem(LOCATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(LOCATION_KEY);
    localStorage.removeItem(LOCATION_KEY);
    return null;
  }
};

const regionPath = (loc: any) =>
  `/gnpage/${encodeURIComponent(String(loc.nameEn || '').replace(/ /g, '-'))}/${encodeURIComponent(loc.CCODE)}`;

const greetingFor = (date: Date) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** Several categories store the English name in `nameSi`; repeating it adds noise, not information. */
const sinhalaName = (item: { nameEn?: string; nameSi?: string }): string => {
  const si = (item.nameSi || '').trim();
  return si && si !== (item.nameEn || '').trim() ? si : '';
};

const countDescendants = (children: any[] | undefined): number =>
  (children || []).reduce((sum, child) => sum + 1 + countDescendants(child.children), 0);

const reducedMotion = {
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none !important',
    '&:hover': { transform: 'none' },
    '& *': { transition: 'none !important' },
  },
};

const quietButton = {
  boxShadow: 'none',
  color: 'text.secondary',
  '&:hover': { boxShadow: 'none', transform: 'none', bgcolor: 'action.hover' },
};

const UserPage: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const [selectedLocation, setSelectedLocation] = useState<any>(readSavedLocation);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(() => !readSavedLocation());
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const { data: catData, loading: catLoading, error: catError, refetch } = useQuery(GET_CATEGORIES);

  useEffect(() => {
    if (!userInfo) return;
    const roles = userInfo.realm_roles || [];
    if (roles.includes('super_admin')) {
      navigate('/admins', { replace: true });
    } else if (roles.includes('admin') || roles.includes('moderator')) {
      navigate('/users', { replace: true });
    }
  }, [userInfo, navigate]);

  /** "/" focuses search — the convention users know from GitHub, YouTube and docs sites. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const categories: any[] = useMemo(() => {
    const list = [...(catData?.categories || [])];
    // Categories with content first; within each group keep the curated order.
    return list.sort((a, b) => {
      const aOpen = a.children?.length ? 0 : 1;
      const bOpen = b.children?.length ? 0 : 1;
      return aOpen - bOpen || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [catData]);

  const totalSubcategories = useMemo(() => categories.reduce((sum, c) => sum + countDescendants(c.children), 0), [categories]);

  const searchOptions = useMemo<SearchOption[]>(() => {
    const options: SearchOption[] = [];
    const walk = (children: any[] | undefined, parentPath: string, rootName: string) => {
      (children || []).forEach((child) => {
        const slug = `${parentPath}/${child.slug}`;
        options.push({ type: 'subcategory', label: child.nameEn || '', labelSi: sinhalaName(child), slug, parentName: rootName });
        walk(child.children, slug, rootName);
      });
    };
    categories.forEach((cat) => {
      options.push({ type: 'category', label: cat.nameEn || '', labelSi: sinhalaName(cat), slug: cat.slug, parentName: null });
      walk(cat.children, cat.slug, cat.nameEn || '');
    });
    return options;
  }, [categories]);

  const handleLocationSelected = useCallback((gn: any) => {
    setSelectedLocation(gn);
    const serialised = JSON.stringify(gn);
    sessionStorage.setItem(LOCATION_KEY, serialised);
    localStorage.setItem(LOCATION_KEY, serialised);
    setShowLocationModal(false);
  }, []);

  const displayName = userInfo?.name || userInfo?.preferred_username || 'there';
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (t) => t.zIndex.appBar,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.8),
          backdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ height: { xs: 56, sm: 64 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
          <ButtonBase
            onClick={() => navigate('/gnpage')}
            aria-label="Ceylonica home"
            sx={{ borderRadius: '10px', p: 0.5, gap: 1.25, '&:focus-visible': { outline: 2, outlineColor: 'primary.main' } }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.35)}`,
              }}
            >
              C
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>Ceylonica</Typography>
          </ButtonBase>

          <Box sx={{ flex: 1 }} />

          <Button color="inherit" startIcon={<HomeOutlinedIcon />} onClick={() => navigate('/gnpage')} sx={{ display: { xs: 'none', sm: 'inline-flex' }, ...quietButton }}>
            Home
          </Button>

          <Tooltip title="Account">
            <ButtonBase
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={Boolean(menuAnchor)}
              sx={{
                borderRadius: 999,
                pl: 0.5,
                pr: { xs: 0.5, sm: 1.5 },
                py: 0.5,
                gap: 1,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'background-color 150ms ease, border-color 150ms ease',
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
              }}
            >
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 600 }}>{initial}</Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' }, maxWidth: 160 }} noWrap>
                {displayName}
              </Typography>
            </ButtonBase>
          </Tooltip>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 240, borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: '0 16px 40px rgba(23,43,58,0.12)' } } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {displayName}
              </Typography>
              {userInfo?.email && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {userInfo.email}
                </Typography>
              )}
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                navigate('/gnpage');
              }}
              sx={{ display: { sm: 'none' } }}
            >
              <ListItemIcon>
                <HomeOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Home
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setShowLocationModal(true);
              }}
            >
              <ListItemIcon>
                <EditLocationAltOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Change region
            </MenuItem>
            <MenuItem onClick={() => logout()} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </Container>
      </Box>

      {/* ── Hero band ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          background: (t) => `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.08)} 0%, ${alpha(t.palette.primary.main, 0)} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: (t) => `radial-gradient(${alpha(t.palette.primary.main, 0.16)} 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 85%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', px: { xs: 2, sm: 3 }, pt: { xs: 3.5, md: 6 }, pb: { xs: 3, md: 5 } }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 0.5, lineHeight: 1.6 }}
          >
            {greetingFor(new Date())}
          </Typography>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.9rem' }, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, mb: 1.25 }}
          >
            Welcome back, {firstName}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, maxWidth: 560, mb: 2.5 }}>
            {selectedLocation
              ? 'Explore data and surveys for your region, or search any category.'
              : 'Choose your region to see the data and surveys that apply to you.'}
          </Typography>

          {selectedLocation && !catLoading && !catError && categories.length > 0 && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: { xs: 3, md: 4 } }}>
              <StatPill icon={<GridViewRoundedIcon />} label={`${categories.length} categories`} />
              <StatPill icon={<LayersRoundedIcon />} label={`${totalSubcategories} subcategories`} />
            </Stack>
          )}

          {/* Region */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: '16px', sm: '20px' },
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 1px 2px rgba(23,43,58,0.04), 0 12px 32px rgba(23,43,58,0.06)',
              mb: selectedLocation ? 2 : 0,
            }}
          >
            {selectedLocation ? (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} sx={{ alignItems: { md: 'center' } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', boxShadow: (t) => `0 0 0 4px ${alpha(t.palette.success.main, 0.15)}` }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Your region
                    </Typography>
                  </Stack>

                  {/* Stacked rows on phones, a single breadcrumb line from sm up. */}
                  <Box
                    component="nav"
                    aria-label="Selected region"
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { sm: 'center' },
                      flexWrap: { sm: 'wrap' },
                      gap: { xs: 0, sm: 1 },
                    }}
                  >
                    <RegionCrumb label="District" value={selectedLocation.pDistrict?.admin2NameEn} />
                    <Separator />
                    <RegionCrumb label="DS Division" value={selectedLocation.dsEn} />
                    <Separator />
                    <RegionCrumb label="Grama Niladhari" value={selectedLocation.nameEn} emphasis />
                  </Box>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    disableElevation
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate(regionPath(selectedLocation))}
                    sx={{ py: 1.25, px: 2.5, width: { xs: '100%', sm: 'auto' } }}
                  >
                    Open region dashboard
                  </Button>
                  <Button color="inherit" startIcon={<EditLocationAltOutlinedIcon />} onClick={() => setShowLocationModal(true)} sx={{ py: 1.25, width: { xs: '100%', sm: 'auto' }, ...quietButton }}>
                    Change
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' } }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                    color: 'success.main',
                  }}
                >
                  <PlaceOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>
                    No region selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pick your district, DS division and Grama Niladhari division. You can change it any time.
                  </Typography>
                </Box>
                <Button variant="contained" disableElevation onClick={() => setShowLocationModal(true)} sx={{ py: 1.25, px: 2.5, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                  Choose region
                </Button>
              </Stack>
            )}
          </Paper>

          {selectedLocation && (
            <Autocomplete<SearchOption>
              options={searchOptions}
              inputValue={searchInput}
              onInputChange={(_, value) => setSearchInput(value)}
              getOptionLabel={(o) => (o.labelSi ? `${o.label} (${o.labelSi})` : o.label)}
              isOptionEqualToValue={(a, b) => a.slug === b.slug}
              filterOptions={(options, state) => {
                const keywords = state.inputValue.toLowerCase().split(/\s+/).filter(Boolean);
                if (!keywords.length) return options;
                return options.filter((o) => {
                  const text = `${o.label} ${o.labelSi} ${o.parentName || ''}`.toLowerCase();
                  return keywords.every((kw) => text.includes(kw));
                });
              }}
              onChange={(_, value) => {
                if (value) navigate(`/user/categories/${value.slug}`);
              }}
              noOptionsText="No matching categories"
              loading={catLoading}
              renderOption={(props, option) => {
                const { key: _ignoredKey, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                const root = categories.find((c) => c.nameEn === (option.parentName || option.label));
                const { Icon, color } = getCategoryVisual(root || { nameEn: option.parentName || option.label });
                return (
                  <Box component="li" key={`${option.type}:${option.slug}`} {...rest} sx={{ display: 'flex !important', alignItems: 'center', gap: 1.5, py: '10px !important' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '9px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: alpha(color, 0.1) }}>
                      <Icon sx={{ fontSize: 18, color }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {option.label}
                        {option.labelSi && (
                          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                            {' '}
                            · {option.labelSi}
                          </Box>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.parentName ? `in ${option.parentName}` : 'Category'}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={searchRef}
                  placeholder="Search any category"
                  inputProps={{ ...params.inputProps, 'aria-label': 'Search categories and subcategories' }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ pl: 0.5 }}>
                        <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {!searchInput && (
                          <Box
                            component="kbd"
                            aria-hidden
                            sx={{
                              display: { xs: 'none', sm: 'inline-flex' },
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 22,
                              height: 22,
                              px: 0.75,
                              mr: 1,
                              borderRadius: '6px',
                              border: 1,
                              borderColor: 'divider',
                              bgcolor: 'background.default',
                              color: 'text.secondary',
                              fontFamily: 'inherit',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            /
                          </Box>
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                    sx: {
                      bgcolor: 'background.paper',
                      borderRadius: '14px',
                      py: '7px !important',
                      boxShadow: '0 1px 2px rgba(23,43,58,0.04)',
                      '& fieldset': { borderColor: 'divider' },
                      '&:hover fieldset': { borderColor: 'text.disabled' },
                    },
                  }}
                />
              )}
            />
          )}
        </Container>
      </Box>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {selectedLocation && (
        <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, md: 3 }, pb: { xs: 6, md: 10 } }}>
          <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2.5 }, gap: 2 }}>
            <Box>
              <Typography component="h2" sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Browse categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Choose a category to explore its subcategories and data.
              </Typography>
            </Box>
          </Stack>

          {catError ? (
            <Alert
              severity="error"
              sx={{ borderRadius: '14px' }}
              action={
                <Button color="inherit" size="small" onClick={() => refetch()} sx={{ boxShadow: 'none' }}>
                  Retry
                </Button>
              }
            >
              Categories could not be loaded. Check your connection and try again.
            </Alert>
          ) : catLoading ? (
            <CategoryGrid>
              {Array.from({ length: 10 }).map((_, i) => (
                <Paper key={i} variant="outlined" sx={{ p: { xs: 1.5, sm: 2.25 }, borderRadius: '16px', display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 1.5, alignItems: { xs: 'center', sm: 'stretch' } }}>
                  <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="75%" height={22} />
                    <Skeleton width="45%" height={18} />
                  </Box>
                </Paper>
              ))}
            </CategoryGrid>
          ) : categories.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 5, borderRadius: '16px', textAlign: 'center' }}>
              <CategoryOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
              <Typography sx={{ fontWeight: 600 }}>No categories yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Categories will appear here once they are published.
              </Typography>
            </Paper>
          ) : (
            <CategoryGrid>
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} onOpen={() => navigate(`/user/categories/${cat.slug}`)} />
              ))}
            </CategoryGrid>
          )}
        </Container>
      )}

      <LocationSelectorModal open={showLocationModal} onClose={() => setShowLocationModal(false)} onLocationSelected={handleLocationSelected} />
    </Box>
  );
};

/* ── Presentational pieces ────────────────────────────────────────────────── */

const StatPill: React.FC<{ icon: React.ReactElement; label: string }> = ({ icon, label }) => (
  <Chip
    icon={icon}
    label={label}
    size="small"
    sx={{
      height: 28,
      px: 0.5,
      fontWeight: 600,
      fontSize: '0.78rem',
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      color: 'text.secondary',
      '& .MuiChip-icon': { fontSize: 16, color: 'primary.main' },
    }}
  />
);

const Separator: React.FC = () => (
  <>
    <ChevronRightRoundedIcon aria-hidden sx={{ color: 'text.disabled', fontSize: 20, display: { xs: 'none', sm: 'block' } }} />
    <Divider sx={{ display: { xs: 'block', sm: 'none' }, borderStyle: 'dashed', my: 1 }} />
  </>
);

const RegionCrumb: React.FC<{ label: string; value?: string; emphasis?: boolean }> = ({ label, value, emphasis }) => (
  <Box
    sx={{
      minWidth: 0,
      display: 'flex',
      flexDirection: { xs: 'row', sm: 'column' },
      justifyContent: { xs: 'space-between', sm: 'flex-start' },
      alignItems: { xs: 'center', sm: 'flex-start' },
      gap: { xs: 2, sm: 0 },
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontWeight: emphasis ? 700 : 600,
        fontSize: emphasis ? { xs: '0.95rem', sm: '1.05rem' } : '0.95rem',
        color: emphasis ? 'primary.main' : 'text.primary',
        textAlign: { xs: 'right', sm: 'left' },
      }}
      noWrap
    >
      {value || '—'}
    </Typography>
  </Box>
);

const CategoryGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
      gap: { xs: 1.25, sm: 2 },
    }}
  >
    {children}
  </Box>
);

/**
 * Vertical tile from sm up; a compact list row on phones, where a column of
 * tall cards would make users scroll past ten screens to find one category.
 */
const CategoryCard: React.FC<{ category: any; onOpen: () => void }> = ({ category, onOpen }) => {
  const available = Boolean(category.children?.length);
  const subCount = countDescendants(category.children);
  const { Icon, color } = getCategoryVisual(category);
  const preview: string[] = (category.children || []).slice(0, 2).map((c: any) => c.nameEn).filter(Boolean);
  const remaining = (category.children?.length || 0) - preview.length;
  const secondary = sinhalaName(category);

  const body = (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.25 },
        height: '100%',
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'stretch' },
        gap: { xs: 1.5, sm: 0 },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: { sm: 2 } }}>
        <Box
          className="cat-icon"
          sx={{
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            bgcolor: alpha(color, available ? 0.1 : 0.06),
            color: available ? color : 'text.disabled',
            transition: 'background-color 200ms ease, color 200ms ease, transform 200ms ease',
          }}
        >
          <Icon sx={{ fontSize: { xs: 22, sm: 24 } }} />
        </Box>
        {available && (
          <Box
            className="cat-arrow"
            sx={{
              display: { xs: 'none', sm: 'grid' },
              placeItems: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              color: 'text.disabled',
              transition: 'background-color 200ms ease, color 200ms ease, transform 200ms ease',
            }}
          >
            <ArrowOutwardRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
        )}
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.3, letterSpacing: '-0.01em', color: available ? 'text.primary' : 'text.secondary' }} noWrap>
          {category.nameEn}
        </Typography>
        {secondary && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.25 }} noWrap>
            {secondary}
          </Typography>
        )}

        {available && preview.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: { xs: 'none', sm: '-webkit-box' },
              mt: 1.25,
              lineHeight: 1.5,
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              opacity: 0.85,
            }}
          >
            {preview.join(' · ')}
            {remaining > 0 ? ` · +${remaining} more` : ''}
          </Typography>
        )}

        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' }, minHeight: 12 }} />

        <Box sx={{ mt: { xs: 0.5, sm: 1.75 } }}>
          {available ? (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: { sm: 1 },
                py: { sm: 0.25 },
                borderRadius: 999,
                bgcolor: { sm: alpha(color, 0.08) },
                color: { xs: 'text.secondary', sm: color },
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <LayersRoundedIcon sx={{ fontSize: 13 }} />
              {subCount} {subCount === 1 ? 'subcategory' : 'subcategories'}
            </Box>
          ) : (
            <Chip label="No data yet" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 500, bgcolor: 'action.hover', color: 'text.secondary' }} />
          )}
        </Box>
      </Box>

      {available && <ChevronRightRoundedIcon sx={{ display: { xs: 'block', sm: 'none' }, color: 'text.disabled', flexShrink: 0 }} />}
    </Box>
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(23,43,58,0.04)',
        border: 1,
        borderColor: 'divider',
        bgcolor: available ? 'background.paper' : 'transparent',
        transition: 'border-color 200ms ease, box-shadow 250ms ease, transform 250ms ease',
        ...(available && {
          '&:hover': {
            borderColor: alpha(color, 0.45),
            boxShadow: `0 14px 32px ${alpha(color, 0.14)}`,
            transform: 'translateY(-3px)',
            '& .cat-icon': { bgcolor: color, color: '#fff', transform: 'scale(1.04)' },
            '& .cat-arrow': { bgcolor: alpha(color, 0.1), color, transform: 'translate(2px, -2px)' },
          },
          '&:focus-within': { borderColor: color, boxShadow: `0 0 0 3px ${alpha(color, 0.18)}` },
        }),
        ...reducedMotion,
      }}
    >
      {available ? (
        <CardActionArea onClick={onOpen} aria-label={`Open ${category.nameEn}, ${subCount} subcategories`} sx={{ height: '100%', '& .MuiCardActionArea-focusHighlight': { bgcolor: color } }}>
          {body}
        </CardActionArea>
      ) : (
        <Box aria-disabled="true" aria-label={`${category.nameEn}, no data yet`}>
          {body}
        </Box>
      )}
    </Card>
  );
};

export default UserPage;
