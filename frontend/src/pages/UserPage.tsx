import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  ButtonBase,
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
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { useAuth } from '../auth/AuthProvider';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import UserTopBar from '../components/contribute/UserTopBar';
import VillageProgressCard from '../components/contribute/VillageProgressCard';
import { fill, localName, useContributeCopy } from '../components/contribute/copy';
import { Ambient, CountUp, EASE, enter, floatY, lift, ping, Reveal, sheenOnHover, spotlight, spotlightMove } from '../components/contribute/motion';
import { ghostButton, ink, inkButton, segmented } from '../components/contribute/tokens';
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
    <Box sx={{ minHeight: '100vh', bgcolor: ink[50], overflowX: 'hidden' }}>
      <UserTopBar onChangeVillage={() => setShowLocationModal(true)} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', bgcolor: ink[900], color: '#fff' }}>
        <Ambient />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 4, md: 7 }, pb: { xs: 3, md: 5 } }}>
          <Box
            sx={{
              ...enter(0),
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.25,
              py: 0.5,
              mb: 2,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,.14)',
              bgcolor: 'rgba(255,255,255,.05)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <LiveDot />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,.8)', letterSpacing: '0.02em' }}>
              {greeting}
              {firstName ? `, ${firstName}` : ''}
            </Typography>
          </Box>
          <Typography
            component="h1"
            sx={{
              ...enter(1),
              fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.6rem' },
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 1.04,
              mb: 2,
              maxWidth: 820,
              background: 'linear-gradient(180deg, #fff 30%, rgba(255,255,255,.55) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {vName ? fill(t.heroTitle, { village: vName }) : t.heroTitleNoVillage}
          </Typography>
          <Typography sx={{ ...enter(2), color: 'rgba(255,255,255,.62)', fontSize: { xs: '0.98rem', sm: '1.1rem' }, maxWidth: 620, mb: { xs: 3.5, md: 5 }, lineHeight: 1.65 }}>
            {village ? t.heroBody : t.heroBodyNoVillage}
          </Typography>

          <Box sx={enter(3)}>
            {village ? (
              <VillageProgressCard
                progress={progress.data}
                loading={progress.loading}
                error={Boolean(progress.error)}
                onRetry={progress.refetch}
                actions={
                  <>
                    <Button startIcon={<AddRoundedIcon />} onClick={scrollToTopics} sx={{ py: 1.2, px: 2.5, borderRadius: '12px', fontWeight: 700, ...inkButton }}>
                      {t.startContributing}
                    </Button>
                    <Button
                      startIcon={<StorefrontRoundedIcon />}
                      onClick={() => navigate(`/industry-survey/${encodeURIComponent(String(village.nameEn || '').replace(/ /g, '-'))}/${encodeURIComponent(ccode || '')}`)}
                      sx={{ py: 1.2, px: 2.5, borderRadius: '12px', fontWeight: 600, ...ghostButton }}
                    >
                      {t.registerBusiness}
                    </Button>
                    <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
                    <Button
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={() => navigate(villagePath(village))}
                      sx={{ py: 1.2, borderRadius: '12px', fontWeight: 600, color: ink[600], boxShadow: 'none', '&:hover': { bgcolor: ink[50], color: ink[900], boxShadow: 'none', transform: 'none', '& .MuiButton-endIcon': { transform: 'translateX(3px)' } }, '& .MuiButton-endIcon': { transition: `transform 300ms ${EASE}` } }}
                    >
                      {t.openVillagePage}
                    </Button>
                  </>
                }
              />
            ) : (
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '22px', bgcolor: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(12px)', color: '#fff' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' } }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '16px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'rgba(255,255,255,.1)', animation: `${floatY} 4s ease-in-out infinite` }}>
                    <PlaceOutlinedIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5, color: 'inherit' }}>{t.chooseVillage}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.6)' }}>
                      {t.chooseVillageHint}
                    </Typography>
                  </Box>
                  <Button onClick={() => setShowLocationModal(true)} sx={{ py: 1.25, px: 2.5, flexShrink: 0, borderRadius: '12px', fontWeight: 700, bgcolor: '#fff', color: ink[900], width: { xs: '100%', sm: 'auto' }, '&:hover': { bgcolor: ink[100], transform: 'none' } }}>
                    {t.chooseVillage}
                  </Button>
                </Stack>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>

      {village && (
        <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 3, md: 4 }, pb: { xs: 6, md: 10 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' }, gap: { xs: 1.5, md: 2 } }}>
            <Reveal index={0}>
              <MyImpact data={mine.data} loading={mine.loading} onViewAll={() => navigate('/user/contributions')} />
            </Reveal>
            <Reveal index={1}>
              <RapidFirePromo onPlay={() => navigate('/user/rapid-fire')} />
            </Reveal>
          </Box>

          {/* ── What can you add? ──────────────────────────────────────── */}
          <Box ref={topicsRef} sx={{ scrollMarginTop: 88, pt: { xs: 5, md: 7 } }}>
            <Reveal>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ maxWidth: 620 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink[400], mb: 0.75 }}>
                    {t.navContribute}
                  </Typography>
                  <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.9rem' }, fontWeight: 800, letterSpacing: '-0.035em', color: ink[900], lineHeight: 1.15 }}>
                    {t.whatToAddTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: ink[500], lineHeight: 1.6 }}>
                    {t.whatToAddBody}
                  </Typography>
                </Box>
                <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)} sx={{ ...segmented, flexShrink: 0, alignSelf: { xs: 'flex-start', md: 'auto' } }}>
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
                slotProps={{ paper: { sx: { mt: 1, borderRadius: '16px', border: `1px solid ${ink[100]}`, boxShadow: '0 24px 48px -16px rgba(10,12,15,.25)' } } }}
                renderOption={(props, option) => {
                  const { key: _key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                  const { Icon } = getCategoryVisual({ slug: option.rootSlug });
                  return (
                    <Box component="li" key={option.slug} {...rest} sx={{ display: 'flex !important', alignItems: 'center', gap: 1.5, py: '10px !important' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '9px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100] }}>
                        <Icon sx={{ fontSize: 18, color: ink[700] }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: ink[900] }} noWrap>
                          {option.label}
                        </Typography>
                        {option.parentName && (
                          <Typography variant="caption" sx={{ color: ink[400] }}>
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
                          <SearchRoundedIcon sx={{ color: ink[400] }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          <Box component="kbd" sx={{ display: { xs: 'none', md: 'inline-grid' }, placeItems: 'center', minWidth: 22, height: 22, mr: 1, borderRadius: '6px', border: `1px solid ${ink[200]}`, color: ink[400], fontSize: '0.72rem', fontFamily: 'inherit', fontWeight: 600 }}>
                            /
                          </Box>
                          {params.InputProps.endAdornment}
                        </>
                      ),
                      sx: {
                        bgcolor: '#fff',
                        borderRadius: '16px',
                        py: '8px !important',
                        fontSize: '16px',
                        transition: 'box-shadow 250ms ease',
                        '& fieldset': { borderColor: ink[200], transition: 'border-color 200ms ease' },
                        '&:hover fieldset': { borderColor: `${ink[300]} !important` },
                        '&.Mui-focused': { boxShadow: `0 0 0 5px rgba(10,12,15,.06)` },
                        '&.Mui-focused fieldset': { borderColor: `${ink[900]} !important`, borderWidth: '1px !important' },
                      },
                    }}
                  />
                )}
                sx={{ mb: 3 }}
              />
            </Reveal>

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
                  <Paper key={i} variant="outlined" sx={{ p: 2.25, borderRadius: '20px', borderColor: ink[100] }}>
                    <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px', mb: 2 }} />
                    <Skeleton width="70%" height={22} />
                    <Skeleton width="45%" height={18} />
                  </Paper>
                ))}
              </TopicGrid>
            ) : visibleCategories.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 5, borderRadius: '20px', textAlign: 'center', borderStyle: 'dashed', borderColor: ink[200], bgcolor: 'transparent' }}>
                <CategoryOutlinedIcon sx={{ fontSize: 36, color: ink[300], mb: 1 }} />
                <Typography sx={{ fontWeight: 600, color: ink[700] }}>{categories.length ? t.noResults : t.noCategories}</Typography>
              </Paper>
            ) : (
              <TopicGrid key={filter}>
                {visibleCategories.map((cat, i) => (
                  <Reveal key={cat.id} index={i % 10} sx={{ height: '100%' }}>
                    <TopicCard category={cat} progress={progressBySlug.get(cat.slug)} progressLoaded={Boolean(progress.data)} onOpen={() => navigate(`/user/categories/${cat.slug}`)} />
                  </Reveal>
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

const LiveDot: React.FC = () => (
  <Box sx={{ position: 'relative', width: 8, height: 8 }}>
    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: '#fff', animation: `${ping} 1.8s cubic-bezier(0,0,.2,1) infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }} />
    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: '#fff' }} />
  </Box>
);

/* ── My impact ────────────────────────────────────────────────────────────── */

const MyImpact: React.FC<{ data: ReturnType<typeof useMyContributions>['data']; loading: boolean; onViewAll: () => void }> = ({ data, loading, onViewAll }) => {
  const { t } = useContributeCopy();
  const s = data?.summary;
  const total = s?.total ?? 0;
  const segs = s && total > 0 ? [s.approved, s.in_review, Math.max(0, total - s.approved - s.in_review)] : [0, 0, 0];

  return (
    <Paper
      elevation={0}
      onPointerMove={spotlightMove}
      sx={{ ...spotlight(), height: '100%', p: { xs: 2.5, sm: 3 }, borderRadius: '24px', border: `1px solid ${ink[100]}`, bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink[400] }}>{t.myImpactTitle}</Typography>
        {s && s.total > 0 && (
          <ButtonBase onClick={onViewAll} sx={{ gap: 0.5, px: 1.25, py: 0.5, borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, color: ink[600], transition: 'background-color 200ms ease', '&:hover': { bgcolor: ink[100], color: ink[900], '& svg': { transform: 'translate(2px,-2px)' } }, '& svg': { transition: `transform 300ms ${EASE}` } }}>
            {t.viewAll}
            <ArrowOutwardRoundedIcon sx={{ fontSize: 15 }} />
          </ButtonBase>
        )}
      </Stack>

      {loading ? (
        <>
          <Skeleton width={110} height={56} />
          <Skeleton width="100%" height={10} sx={{ mt: 2 }} />
        </>
      ) : !s || s.total === 0 ? (
        <Typography sx={{ color: ink[500], lineHeight: 1.6, flex: 1 }}>{t.myImpactEmpty}</Typography>
      ) : (
        <>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: { xs: '2.75rem', sm: '3.25rem' }, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: ink[900], fontVariantNumeric: 'tabular-nums' }}>
              <CountUp value={s.total} />
            </Typography>
            <Typography sx={{ color: ink[400], fontWeight: 600 }}>{t.myImpactTotal}</Typography>
          </Stack>
          <SegmentBar values={segs} />
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 0.5 }}>
            <Legend shade={ink[900]} label={t.myImpactApproved} value={s.approved} />
            <Legend shade={ink[400]} label={t.myImpactReview} value={s.in_review} />
          </Stack>
        </>
      )}
    </Paper>
  );
};

const SegmentBar: React.FC<{ values: number[] }> = ({ values }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const shades = [ink[900], ink[400], ink[200]];
  return (
    <Box sx={{ display: 'flex', gap: '3px', height: 8, mt: 2.5, borderRadius: 999, overflow: 'hidden', bgcolor: ink[100] }}>
      {values.map((v, i) => (
        <Box key={i} sx={{ width: ready ? `${(v / total) * 100}%` : 0, bgcolor: shades[i], borderRadius: 999, transition: `width 1200ms ${EASE} ${i * 120}ms`, '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
      ))}
    </Box>
  );
};

const Legend: React.FC<{ shade: string; label: string; value: number }> = ({ shade, label, value }) => (
  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '3px', bgcolor: shade }} />
    <Typography variant="body2" sx={{ color: ink[500] }}>
      <Box component="span" sx={{ fontWeight: 700, color: ink[900] }}>
        {value}
      </Box>{' '}
      {label}
    </Typography>
  </Stack>
);

/* ── Rapid fire promo ──────────────────────────────────────────────────────── */

const RapidFirePromo: React.FC<{ onPlay: () => void }> = ({ onPlay }) => {
  const { t } = useContributeCopy();
  return (
    <ButtonBase
      onClick={onPlay}
      aria-label={t.rfPromoTitle}
      sx={{
        ...sheenOnHover,
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'left',
        width: '100%',
        height: '100%',
        minHeight: 200,
        p: { xs: 2.5, sm: 3 },
        borderRadius: '24px',
        bgcolor: ink[900],
        color: '#fff',
        transition: `transform 450ms ${EASE}, box-shadow 450ms ${EASE}`,
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 30px 60px -24px rgba(10,12,15,.6)', '& .rf-cta': { gap: 1.25 } },
        '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 3 },
        '@media (prefers-reduced-motion: reduce)': { '&:hover': { transform: 'none' } },
      }}
    >
      <Ambient grid={false} />
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 'auto', position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '15px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: '#fff',
            color: ink[900],
            boxShadow: '0 0 0 6px rgba(255,255,255,.06), 0 0 40px rgba(255,255,255,.25)',
            animation: `${floatY} 3.2s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <BoltRoundedIcon sx={{ fontSize: 28 }} />
        </Box>
      </Stack>
      <Box sx={{ position: 'relative', zIndex: 2, mt: 3 }}>
        <Typography sx={{ color: 'inherit', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>{t.rfPromoTitle}</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,.6)', mt: 0.5, mb: 2, lineHeight: 1.55 }}>{t.rfPromoBody}</Typography>
        <Box className="rf-cta" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 2, py: 1, borderRadius: 999, bgcolor: '#fff', color: ink[900], fontWeight: 700, fontSize: '0.9rem', transition: `gap 300ms ${EASE}` }}>
          {t.rfPromoCta}
          <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </ButtonBase>
  );
};

/* ── Topic cards ──────────────────────────────────────────────────────────── */

const TopicGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 1.25, sm: 1.75 } }}>{children}</Box>
);

/**
 * Vertical tile from sm up; a compact row on phones. The status line tells the
 * contributor whether their village already has data here or needs it.
 */
const TopicCard: React.FC<{ category: any; progress?: VillageCategoryProgress; progressLoaded: boolean; onOpen: () => void }> = ({ category, progress, progressLoaded, onOpen }) => {
  const { t, language } = useContributeCopy();
  const { Icon } = getCategoryVisual(category);
  const topics = countDescendants(category.children);
  const records = progress?.records ?? 0;
  const needsData = progressLoaded && records === 0;
  const name = localName(category, language);
  const secondary = name !== category.nameEn ? category.nameEn : '';
  const recordsText = records === 1 ? t.recordsInVillageOne : fill(t.recordsInVillage, { n: records.toLocaleString() });
  const statusText = !progressLoaded ? '' : needsData ? t.needsData : recordsText;
  const coverage = progress && progress.topics_total > 0 ? (progress.topics_covered / progress.topics_total) * 100 : 0;

  return (
    <ButtonBase
      onClick={onOpen}
      onPointerMove={spotlightMove}
      aria-label={statusText ? `${name}. ${statusText}` : name}
      sx={{
        ...spotlight(),
        ...lift,
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'stretch' },
        gap: { xs: 1.5, sm: 0 },
        textAlign: 'left',
        width: '100%',
        height: '100%',
        p: { xs: 1.75, sm: 2.25 },
        borderRadius: '20px',
        bgcolor: '#fff',
        border: `1px solid ${ink[100]}`,
        '&:hover': { ...lift['&:hover'], borderColor: ink[200], '& .topic-icon': { bgcolor: ink[900], color: '#fff', transform: 'rotate(-6deg) scale(1.05)' }, '& .topic-add': { bgcolor: ink[900], color: '#fff', borderColor: ink[900], transform: 'rotate(90deg)' } },
        '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: { sm: 2.5 } }}>
        <Box
          className="topic-icon"
          sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 }, borderRadius: '14px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100], color: ink[700], transition: `background-color 300ms ease, color 300ms ease, transform 450ms ${EASE}` }}
        >
          <Icon sx={{ fontSize: { xs: 22, sm: 24 } }} />
        </Box>
        <Box
          className="topic-add"
          aria-hidden
          sx={{ display: { xs: 'none', sm: 'grid' }, placeItems: 'center', width: 30, height: 30, borderRadius: '50%', color: ink[400], border: `1px solid ${ink[200]}`, transition: `background-color 250ms ease, color 250ms ease, border-color 250ms ease, transform 450ms ${EASE}` }}
        >
          <AddRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.02rem' }, lineHeight: 1.3, letterSpacing: '-0.015em', color: ink[900] }} noWrap>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.25, color: ink[400] }} noWrap>
          {secondary || fill(t.topicsCount, { n: topics })}
        </Typography>
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' }, minHeight: 16 }} />
        <Box sx={{ mt: { xs: 0.75, sm: 2 } }}>
          {!progressLoaded ? (
            <Skeleton width={90} height={20} />
          ) : needsData ? (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: '0.74rem', fontWeight: 700, color: ink[700], px: 1, py: 0.35, borderRadius: 999, border: `1px dashed ${ink[300]}` }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ink[900] }} />
              {t.needsData}
            </Box>
          ) : (
            <>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: ink[500], mb: 0.75 }}>{recordsText}</Typography>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, height: 4, borderRadius: 999, bgcolor: ink[100], overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${Math.max(coverage, 4)}%`, bgcolor: ink[900], borderRadius: 999 }} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ButtonBase>
  );
};

export default UserPage;
