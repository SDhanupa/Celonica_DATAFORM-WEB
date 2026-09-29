import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { useAuth } from '../auth/AuthProvider';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import UserTopBar from '../components/contribute/UserTopBar';
import VillageProgressCard from '../components/contribute/VillageProgressCard';
import { fill, localName, useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, saveVillage, SavedVillage, villageCode, villageName, villagePath } from '../components/contribute/village';
import { useMyContributions, useVillageProgress, VillageCategoryProgress } from '../api/contributions';
import { GET_CATEGORIES } from '../graphql/queries';

interface SearchOption {
  type: 'category' | 'subcategory';
  label: string;
  secondary: string;
  slug: string;
  rootSlug: string;
  parentName: string | null;
}

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
  const { userInfo } = useAuth();
  const { t, language } = useContributeCopy();
  const navigate = useNavigate();
  const topicsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [village, setVillage] = useState<SavedVillage | null>(readSavedVillage);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(() => !readSavedVillage());
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'needs'>('all');

  const ccode = villageCode(village);
  const { data: catData, loading: catLoading, error: catError, refetch } = useQuery(GET_CATEGORIES);
  const progress = useVillageProgress(ccode);
  const mine = useMyContributions();

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

  const categories: any[] = useMemo(
    () => [...(catData?.categories || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [catData],
  );

  const progressBySlug = useMemo(() => {
    const map = new Map<string, VillageCategoryProgress>();
    progress.data?.categories.forEach((c) => map.set(c.slug, c));
    return map;
  }, [progress.data]);

  const visibleCategories = useMemo(
    () => (filter === 'needs' && progress.data ? categories.filter((c) => !(progressBySlug.get(c.slug)?.records)) : categories),
    [filter, categories, progressBySlug, progress.data],
  );

  const searchOptions = useMemo<SearchOption[]>(() => {
    const options: SearchOption[] = [];
    const walk = (children: any[] | undefined, parentPath: string, root: any) => {
      (children || []).forEach((child) => {
        const slug = `${parentPath}/${child.slug}`;
        options.push({ type: 'subcategory', label: child.nameEn || '', secondary: '', slug, rootSlug: root.slug, parentName: localName(root, language) });
        walk(child.children, slug, root);
      });
    };
    categories.forEach((cat) => {
      const label = localName(cat, language);
      options.push({ type: 'category', label, secondary: label !== cat.nameEn ? cat.nameEn : '', slug: cat.slug, rootSlug: cat.slug, parentName: null });
      walk(cat.children, cat.slug, cat);
    });
    return options;
  }, [categories, language]);

  const handleVillageSelected = useCallback((gn: any) => {
    saveVillage(gn);
    setVillage(gn);
    setShowLocationModal(false);
  }, []);

  const scrollToTopics = () => topicsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;
  const firstName = (userInfo?.given_name || userInfo?.name || userInfo?.preferred_username || '').split(' ')[0];
  const vName = villageName(village, language);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <UserTopBar onChangeVillage={() => setShowLocationModal(true)} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.07)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 55%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: (theme) => `radial-gradient(${alpha(theme.palette.success.main, 0.16)} 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 80%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', px: { xs: 2, sm: 3 }, pt: { xs: 3.5, md: 6 }, pb: { xs: 3, md: 4 } }}>
          <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 700, letterSpacing: '0.12em', display: 'block', mb: 0.5, lineHeight: 1.6 }}>
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </Typography>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.9rem' }, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.12, mb: 1.5, maxWidth: 760 }}
          >
            {vName ? fill(t.heroTitle, { village: vName }) : t.heroTitleNoVillage}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, maxWidth: 640, mb: { xs: 3, md: 4 }, lineHeight: 1.6 }}>
            {village ? t.heroBody : t.heroBodyNoVillage}
          </Typography>

          {village ? (
            <VillageProgressCard
              progress={progress.data}
              loading={progress.loading}
              error={Boolean(progress.error)}
              onRetry={progress.refetch}
              actions={
                <>
                  <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={scrollToTopics} sx={{ py: 1.25, px: 2.5 }}>
                    {t.startContributing}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<StorefrontRoundedIcon />}
                    onClick={() => navigate(`/industry-survey/${encodeURIComponent(String(village.nameEn || '').replace(/ /g, '-'))}/${encodeURIComponent(ccode || '')}`)}
                    sx={{ py: 1.25, px: 2.5, boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none' } }}
                  >
                    {t.registerBusiness}
                  </Button>
                  <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
                  <Button color="inherit" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate(villagePath(village))} sx={{ py: 1.25, ...quietButton }}>
                    {t.openVillagePage}
                  </Button>
                </>
              }
            />
          ) : (
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '20px', border: 1, borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' } }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                  <PlaceOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>{t.chooseVillage}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t.chooseVillageHint}
                  </Typography>
                </Box>
                <Button variant="contained" disableElevation onClick={() => setShowLocationModal(true)} sx={{ py: 1.25, px: 2.5, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                  {t.chooseVillage}
                </Button>
              </Stack>
            </Paper>
          )}
        </Container>
      </Box>

      {village && (
        <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 6, md: 10 } }}>
          {/* ── My impact ──────────────────────────────────────────────── */}
          <MyImpact data={mine.data} loading={mine.loading} onViewAll={() => navigate('/user/contributions')} />
          <RapidFirePromo onPlay={() => navigate('/user/rapid-fire')} />

          {/* ── What can you add? ──────────────────────────────────────── */}
          <Box ref={topicsRef} sx={{ scrollMarginTop: 88, pt: { xs: 4, md: 5 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ maxWidth: 620 }}>
                <Typography component="h2" sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {t.whatToAddTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t.whatToAddBody}
                </Typography>
              </Box>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={filter}
                onChange={(_, value) => value && setFilter(value)}
                sx={{ flexShrink: 0, '& .MuiToggleButton-root': { px: 1.75, textTransform: 'none', fontWeight: 600 } }}
              >
                <ToggleButton value="all">{t.filterAll}</ToggleButton>
                <ToggleButton value="needs" disabled={!progress.data}>
                  {t.filterNeeds}
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Autocomplete<SearchOption>
              options={searchOptions}
              inputValue={searchInput}
              onInputChange={(_, value) => setSearchInput(value)}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => a.slug === b.slug}
              filterOptions={(options, state) => {
                const keywords = state.inputValue.toLowerCase().split(/\s+/).filter(Boolean);
                if (!keywords.length) return options.slice(0, 50);
                return options.filter((o) => keywords.every((kw) => `${o.label} ${o.secondary} ${o.parentName || ''}`.toLowerCase().includes(kw))).slice(0, 50);
              }}
              onChange={(_, value) => value && navigate(`/user/categories/${value.slug}`)}
              noOptionsText={t.noResults}
              loading={catLoading}
              renderOption={(props, option) => {
                const { key: _key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                const { Icon, color } = getCategoryVisual({ slug: option.rootSlug });
                return (
                  <Box component="li" key={option.slug} {...rest} sx={{ display: 'flex !important', alignItems: 'center', gap: 1.5, py: '10px !important' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '9px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: alpha(color, 0.1) }}>
                      <Icon sx={{ fontSize: 18, color }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {option.label}
                      </Typography>
                      {option.parentName && (
                        <Typography variant="caption" color="text.secondary">
                          {option.parentName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={searchRef}
                  placeholder={t.searchPlaceholder}
                  inputProps={{ ...params.inputProps, 'aria-label': t.searchPlaceholder }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start" sx={{ pl: 0.5 }}>
                        <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.paper', borderRadius: '14px', py: '7px !important', '& fieldset': { borderColor: 'divider' } },
                  }}
                />
              )}
              sx={{ mb: 2.5 }}
            />

            {catError ? (
              <Alert
                severity="error"
                sx={{ borderRadius: '14px' }}
                action={
                  <Button color="inherit" size="small" onClick={() => refetch()} sx={{ boxShadow: 'none' }}>
                    {t.retry}
                  </Button>
                }
              >
                {t.categoriesError}
              </Alert>
            ) : catLoading ? (
              <TopicGrid>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2.25, borderRadius: '16px' }}>
                    <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px', mb: 2 }} />
                    <Skeleton width="70%" height={22} />
                    <Skeleton width="45%" height={18} />
                  </Paper>
                ))}
              </TopicGrid>
            ) : visibleCategories.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 5, borderRadius: '16px', textAlign: 'center' }}>
                <CategoryOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                <Typography sx={{ fontWeight: 600 }}>{categories.length ? t.noResults : t.noCategories}</Typography>
              </Paper>
            ) : (
              <TopicGrid>
                {visibleCategories.map((cat) => (
                  <TopicCard
                    key={cat.id}
                    category={cat}
                    progress={progressBySlug.get(cat.slug)}
                    progressLoaded={Boolean(progress.data)}
                    onOpen={() => navigate(`/user/categories/${cat.slug}`)}
                  />
                ))}
              </TopicGrid>
            )}
          </Box>
        </Container>
      )}

      <LocationSelectorModal open={showLocationModal} onClose={() => setShowLocationModal(false)} onLocationSelected={handleVillageSelected} />
    </Box>
  );
};

/* ── My impact strip ──────────────────────────────────────────────────────── */

const MyImpact: React.FC<{ data: ReturnType<typeof useMyContributions>['data']; loading: boolean; onViewAll: () => void }> = ({ data, loading, onViewAll }) => {
  const { t } = useContributeCopy();
  const s = data?.summary;

  return (
    <Paper variant="outlined" sx={{ mt: { xs: 1, md: 0 }, p: { xs: 2, sm: 2.5 }, borderRadius: '18px' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: { sm: 'center' } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: { sm: 200 } }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.main', flexShrink: 0 }}>
            <VolunteerActivismRoundedIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 700 }}>{t.myImpactTitle}</Typography>
        </Stack>

        {loading ? (
          <Skeleton width="60%" height={28} />
        ) : !s || s.total === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {t.myImpactEmpty}
          </Typography>
        ) : (
          <Stack direction="row" spacing={{ xs: 2.5, sm: 4 }} sx={{ flex: 1, flexWrap: 'wrap', rowGap: 1 }}>
            <ImpactFigure icon={<AddRoundedIcon sx={{ fontSize: 16 }} />} label={t.myImpactTotal} value={s.total} />
            <ImpactFigure icon={<CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />} label={t.myImpactApproved} value={s.approved} />
            <ImpactFigure icon={<HourglassTopRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />} label={t.myImpactReview} value={s.in_review} />
          </Stack>
        )}

        {s && s.total > 0 && (
          <Button endIcon={<ChevronRightRoundedIcon />} onClick={onViewAll} sx={{ ...quietButton, color: 'primary.main', alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            {t.viewAll}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

const ImpactFigure: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
    <Box sx={{ alignSelf: 'center', display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);

/* ── Rapid fire promo ──────────────────────────────────────────────────────── */

const RapidFirePromo: React.FC<{ onPlay: () => void }> = ({ onPlay }) => {
  const { t } = useContributeCopy();
  return (
    <Box
      component="section"
      aria-label={t.rfPromoTitle}
      sx={{
        mt: 2,
        p: { xs: 2.5, sm: 3 },
        borderRadius: '20px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, #1E3A8A 0%, #1677C8 60%, #0EA5A4 100%)',
        boxShadow: '0 16px 36px rgba(22,119,200,0.25)',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' }, position: 'relative' }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '16px', display: 'grid', placeItems: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', color: '#78350F' }}>
          <BoltRoundedIcon sx={{ fontSize: 30 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: 'inherit', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>{t.rfPromoTitle}</Typography>
          <Typography sx={{ color: 'inherit', opacity: 0.88, mt: 0.25 }}>{t.rfPromoBody}</Typography>
        </Box>
        <Button
          onClick={onPlay}
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{ flexShrink: 0, px: 2.5, py: 1.2, borderRadius: 999, fontWeight: 800, bgcolor: '#fff', color: 'primary.dark', boxShadow: 'none', '&:hover': { bgcolor: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' } }}
        >
          {t.rfPromoCta}
        </Button>
      </Stack>
    </Box>
  );
};

/* ── Topic cards ──────────────────────────────────────────────────────────── */

const TopicGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: { xs: 1.25, sm: 2 } }}>{children}</Box>
);

/**
 * Vertical tile from sm up; a compact row on phones. The status line tells the
 * contributor whether their village already has data here or needs it.
 */
const TopicCard: React.FC<{ category: any; progress?: VillageCategoryProgress; progressLoaded: boolean; onOpen: () => void }> = ({
  category,
  progress,
  progressLoaded,
  onOpen,
}) => {
  const { t, language } = useContributeCopy();
  const { Icon, color } = getCategoryVisual(category);
  const topics = countDescendants(category.children);
  const records = progress?.records ?? 0;
  const needsData = progressLoaded && records === 0;
  const name = localName(category, language);
  const secondary = name !== category.nameEn ? category.nameEn : '';
  const recordsText = records === 1 ? t.recordsInVillageOne : fill(t.recordsInVillage, { n: records.toLocaleString() });
  const statusText = !progressLoaded ? '' : needsData ? t.needsData : recordsText;

  const status = !progressLoaded ? (
    <Skeleton width={90} height={20} />
  ) : needsData ? (
    <Chip
      size="small"
      label={t.needsData}
      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12), color: 'warning.dark' }}
    />
  ) : (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 600, color: 'success.dark' }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
      {recordsText}
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
        borderColor: needsData ? (theme) => alpha(theme.palette.warning.main, 0.35) : 'divider',
        bgcolor: 'background.paper',
        transition: 'border-color 200ms ease, box-shadow 250ms ease, transform 250ms ease',
        '&:hover': {
          borderColor: alpha(color, 0.5),
          boxShadow: `0 14px 32px ${alpha(color, 0.14)}`,
          transform: 'translateY(-3px)',
          '& .topic-icon': { bgcolor: color, color: '#fff' },
          '& .topic-add': { bgcolor: color, color: '#fff' },
        },
        '&:focus-within': { borderColor: color, boxShadow: `0 0 0 3px ${alpha(color, 0.18)}` },
        ...reducedMotion,
      }}
    >
      <CardActionArea
        onClick={onOpen}
        aria-label={statusText ? `${name}. ${statusText}` : name}
        sx={{ height: '100%', '& .MuiCardActionArea-focusHighlight': { bgcolor: color } }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2.25 }, height: '100%', display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: { xs: 'center', sm: 'stretch' }, gap: { xs: 1.5, sm: 0 } }}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: { sm: 2 } }}>
            <Box
              className="topic-icon"
              sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 }, borderRadius: '14px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: alpha(color, 0.1), color, transition: 'background-color 200ms ease, color 200ms ease' }}
            >
              <Icon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            </Box>
            <Box
              className="topic-add"
              aria-hidden
              sx={{ display: { xs: 'none', sm: 'grid' }, placeItems: 'center', width: 30, height: 30, borderRadius: '50%', color: 'text.disabled', border: 1, borderColor: 'divider', transition: 'background-color 200ms ease, color 200ms ease' }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Stack>

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.3, letterSpacing: '-0.01em' }} noWrap>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.25 }} noWrap>
              {secondary || fill(t.topicsCount, { n: topics })}
            </Typography>
            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' }, minHeight: 12 }} />
            <Box sx={{ mt: { xs: 0.75, sm: 1.75 } }}>{status}</Box>
          </Box>

          <ChevronRightRoundedIcon sx={{ display: { xs: 'block', sm: 'none' }, color: 'text.disabled', flexShrink: 0 }} />
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default UserPage;
