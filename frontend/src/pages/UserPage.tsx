import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
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
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useAuth } from '../auth/AuthProvider';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import UserTopBar from '../components/contribute/UserTopBar';
import VillageProgressCard from '../components/contribute/VillageProgressCard';
import { fill, localName, useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, saveVillage, SavedVillage, villageCode, villageName, villagePath } from '../components/contribute/village';
import { ghostButton, ink, inkButton, quietButton, reducedMotion } from '../components/contribute/tokens';
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
    if (roles.includes('super_admin')) navigate('/admins', { replace: true });
    else if (roles.includes('admin') || roles.includes('moderator')) navigate('/users', { replace: true });
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

      <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 3, md: 4.5 }, pb: { xs: 6, md: 9 } }}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box sx={{ mb: { xs: 2.5, md: 3.5 }, maxWidth: 720 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: ink[400], letterSpacing: '0.02em', mb: 0.75 }}>
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.4rem' }, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: ink[900], mb: 1 }}>
            {vName ? fill(t.heroTitle, { village: vName }) : t.heroTitleNoVillage}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.92rem', sm: '1rem' }, color: ink[500], lineHeight: 1.55 }}>
            {village ? t.heroBody : t.heroBodyNoVillage}
          </Typography>
        </Box>

        {village ? (
          <VillageProgressCard
            progress={progress.data}
            loading={progress.loading}
            error={Boolean(progress.error)}
            onRetry={progress.refetch}
            actions={
              <>
                <Button disableElevation startIcon={<AddRoundedIcon />} onClick={scrollToTopics} sx={{ py: 1, px: 2.25, ...inkButton }}>
                  {t.startContributing}
                </Button>
                <Button
                  startIcon={<StorefrontOutlinedIcon />}
                  onClick={() => navigate(`/industry-survey/${encodeURIComponent(String(village.nameEn || '').replace(/ /g, '-'))}/${encodeURIComponent(ccode || '')}`)}
                  sx={{ py: 1, px: 2.25, ...ghostButton }}
                >
                  {t.registerBusiness}
                </Button>
                <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
                <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate(villagePath(village))} sx={{ py: 1, ...quietButton }}>
                  {t.openVillagePage}
                </Button>
              </>
            }
          />
        ) : (
          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '14px', border: '1px solid', borderColor: ink[200] }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ width: 46, height: 46, borderRadius: '11px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100], color: ink[700] }}>
                <PlaceOutlinedIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: ink[900], mb: 0.25 }}>{t.chooseVillage}</Typography>
                <Typography variant="body2" sx={{ color: ink[500] }}>{t.chooseVillageHint}</Typography>
              </Box>
              <Button disableElevation onClick={() => setShowLocationModal(true)} sx={{ py: 1, px: 2.25, flexShrink: 0, width: { xs: '100%', sm: 'auto' }, ...inkButton }}>
                {t.chooseVillage}
              </Button>
            </Stack>
          </Paper>
        )}

        {village && (
          <>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <MyImpact data={mine.data} loading={mine.loading} onViewAll={() => navigate('/user/contributions')} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <RapidFirePromo onPlay={() => navigate('/user/rapid-fire')} />
              </Box>
            </Stack>

            {/* ── What can you add? ──────────────────────────────────────── */}
            <Box ref={topicsRef} sx={{ scrollMarginTop: 76, pt: { xs: 4, md: 5 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ maxWidth: 620 }}>
                  <Typography component="h2" sx={{ fontSize: { xs: '1.15rem', sm: '1.3rem' }, fontWeight: 700, letterSpacing: '-0.02em', color: ink[900] }}>
                    {t.whatToAddTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ink[500], mt: 0.25 }}>{t.whatToAddBody}</Typography>
                </Box>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={filter}
                  onChange={(_, value) => value && setFilter(value)}
                  sx={{
                    flexShrink: 0,
                    bgcolor: ink[100],
                    borderRadius: '8px',
                    p: '3px',
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: '6px !important',
                      px: 1.75,
                      py: 0.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      color: ink[500],
                      '&.Mui-selected': { bgcolor: '#fff', color: ink[900], boxShadow: '0 1px 2px rgba(10,12,15,0.08)', '&:hover': { bgcolor: '#fff' } },
                    },
                  }}
                >
                  <ToggleButton value="all">{t.filterAll}</ToggleButton>
                  <ToggleButton value="needs" disabled={!progress.data}>{t.filterNeeds}</ToggleButton>
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
                  const { Icon } = getCategoryVisual({ slug: option.rootSlug });
                  return (
                    <Box component="li" key={option.slug} {...rest} sx={{ display: 'flex !important', alignItems: 'center', gap: 1.5, py: '9px !important' }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100], color: ink[700] }}>
                        <Icon sx={{ fontSize: 17 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: ink[900] }} noWrap>{option.label}</Typography>
                        {option.parentName && <Typography variant="caption" sx={{ color: ink[400] }}>{option.parentName}</Typography>}
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
                          <SearchRoundedIcon sx={{ color: ink[400], fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: '#fff',
                        borderRadius: '10px',
                        py: '6px !important',
                        '& fieldset': { borderColor: ink[200] },
                        '&:hover fieldset': { borderColor: ink[300] },
                        '&.Mui-focused fieldset': { borderColor: `${ink[900]} !important`, borderWidth: '1px !important' },
                      },
                    }}
                  />
                )}
                sx={{ mb: 2.5 }}
              />

              {catError ? (
                <Alert severity="error" sx={{ borderRadius: '12px' }} action={<Button color="inherit" size="small" onClick={() => refetch()} sx={{ textTransform: 'none' }}>{t.retry}</Button>}>
                  {t.categoriesError}
                </Alert>
              ) : catLoading ? (
                <TopicGrid>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: ink[200] }}>
                      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '10px', mb: 2 }} />
                      <Skeleton width="70%" height={20} />
                      <Skeleton width="45%" height={16} />
                    </Paper>
                  ))}
                </TopicGrid>
              ) : visibleCategories.length === 0 ? (
                <Paper elevation={0} sx={{ p: 5, borderRadius: '12px', border: '1px solid', borderColor: ink[200], textAlign: 'center' }}>
                  <CategoryOutlinedIcon sx={{ fontSize: 34, color: ink[300], mb: 1 }} />
                  <Typography sx={{ fontWeight: 600, color: ink[700] }}>{categories.length ? t.noResults : t.noCategories}</Typography>
                </Paper>
              ) : (
                <TopicGrid>
                  {visibleCategories.map((cat) => (
                    <TopicCard key={cat.id} category={cat} progress={progressBySlug.get(cat.slug)} progressLoaded={Boolean(progress.data)} onOpen={() => navigate(`/user/categories/${cat.slug}`)} />
                  ))}
                </TopicGrid>
              )}
            </Box>
          </>
        )}
      </Container>

      <LocationSelectorModal open={showLocationModal} onClose={() => setShowLocationModal(false)} onLocationSelected={handleVillageSelected} />
    </Box>
  );
};

/* ── My impact ────────────────────────────────────────────────────────────── */

const MyImpact: React.FC<{ data: ReturnType<typeof useMyContributions>['data']; loading: boolean; onViewAll: () => void }> = ({ data, loading, onViewAll }) => {
  const { t } = useContributeCopy();
  const s = data?.summary;
  const empty = !loading && (!s || s.total === 0);

  return (
    <Paper elevation={0} sx={{ height: '100%', p: { xs: 2, sm: 2.25 }, borderRadius: '14px', border: '1px solid', borderColor: ink[200], display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: ink[900] }}>{t.myImpactTitle}</Typography>
        {s && s.total > 0 && (
          <Button endIcon={<ChevronRightRoundedIcon sx={{ fontSize: '18px !important' }} />} onClick={onViewAll} size="small" sx={{ ...quietButton, color: ink[600], fontSize: '0.8rem', px: 1 }}>
            {t.viewAll}
          </Button>
        )}
      </Stack>
      {loading ? (
        <Skeleton width="70%" height={40} />
      ) : empty ? (
        <Typography variant="body2" sx={{ color: ink[500], flex: 1 }}>{t.myImpactEmpty}</Typography>
      ) : (
        <Stack direction="row" spacing={3} sx={{ flex: 1, alignItems: 'center' }}>
          <Figure value={s!.total} label={t.myImpactTotal} />
          <Divider />
          <Figure value={s!.approved} label={t.myImpactApproved} />
          <Divider />
          <Figure value={s!.in_review} label={t.myImpactReview} />
        </Stack>
      )}
    </Paper>
  );
};

const Divider: React.FC = () => <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: ink[100], my: 0.5 }} />;

const Figure: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <Box>
    <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: ink[900], lineHeight: 1.1 }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: ink[500], fontWeight: 500 }}>{label}</Typography>
  </Box>
);

/* ── Rapid fire promo — a single dark ink card, not a rainbow gradient ──────── */

const RapidFirePromo: React.FC<{ onPlay: () => void }> = ({ onPlay }) => {
  const { t } = useContributeCopy();
  return (
    <ButtonBaseCard onClick={onPlay} ariaLabel={t.rfPromoTitle}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
        <Box sx={{ width: 42, height: 42, borderRadius: '11px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
          <BoltRoundedIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: '#fff' }}>{t.rfPromoTitle}</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {t.rfPromoBody}
          </Typography>
        </Box>
        <Box className="promo-cta" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0, px: 1.75, py: 0.85, borderRadius: '999px', bgcolor: '#fff', color: ink[900], fontWeight: 700, fontSize: '0.82rem', transition: 'transform 150ms ease' }}>
          {t.rfPromoCta}
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
      </Stack>
    </ButtonBaseCard>
  );
};

const ButtonBaseCard: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode }> = ({ onClick, ariaLabel, children }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    sx={{
      all: 'unset',
      boxSizing: 'border-box',
      cursor: 'pointer',
      display: 'block',
      width: '100%',
      height: '100%',
      p: { xs: 2, sm: 2.25 },
      borderRadius: '14px',
      bgcolor: ink[900],
      transition: 'transform 180ms ease, box-shadow 180ms ease',
      '&:hover': { boxShadow: '0 14px 30px rgba(10,12,15,0.22)', '& .promo-cta': { transform: 'translateX(2px)' } },
      '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
      ...reducedMotion,
    }}
  >
    {children}
  </Box>
);

/* ── Topic cards ──────────────────────────────────────────────────────────── */

const TopicGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: { xs: 1, sm: 1.5 } }}>{children}</Box>
);

/**
 * Vertical tile from sm up; a compact row on phones. Monochrome: "needs data"
 * vs "has data" is shown by weight and a dot, not colour.
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

  const status = !progressLoaded ? (
    <Skeleton width={84} height={16} />
  ) : needsData ? (
    <Typography component="span" sx={{ fontSize: '0.72rem', fontWeight: 600, color: ink[400] }}>{t.needsData}</Typography>
  ) : (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.72rem', fontWeight: 600, color: ink[700] }}>
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ink[900] }} />
      {recordsText}
    </Box>
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: ink[200],
        bgcolor: '#fff',
        transition: 'border-color 160ms ease, box-shadow 200ms ease, transform 200ms ease',
        '&:hover': {
          borderColor: ink[300],
          boxShadow: '0 8px 24px rgba(10,12,15,0.08)',
          transform: 'translateY(-2px)',
          '& .topic-icon': { bgcolor: ink[900], color: '#fff' },
          '& .topic-add': { color: ink[900] },
        },
        '&:focus-within': { borderColor: ink[900] },
        ...reducedMotion,
      }}
    >
      <CardActionArea onClick={onOpen} aria-label={statusText ? `${name}. ${statusText}` : name} sx={{ height: '100%', '& .MuiCardActionArea-focusHighlight': { bgcolor: ink[900] } }}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: { xs: 'center', sm: 'stretch' }, gap: { xs: 1.5, sm: 0 } }}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: { sm: 1.75 } }}>
            <Box className="topic-icon" sx={{ width: { xs: 40, sm: 42 }, height: { xs: 40, sm: 42 }, borderRadius: '11px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100], color: ink[700], transition: 'background-color 160ms ease, color 160ms ease' }}>
              <Icon sx={{ fontSize: { xs: 20, sm: 22 } }} />
            </Box>
            <ArrowForwardRoundedIcon className="topic-add" aria-hidden sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 18, color: ink[300], transition: 'color 160ms ease' }} />
          </Stack>

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.92rem', sm: '0.95rem' }, lineHeight: 1.3, letterSpacing: '-0.01em', color: ink[900] }} noWrap>
              {name}
            </Typography>
            <Typography variant="body2" sx={{ color: ink[400], fontSize: '0.78rem', mt: 0.25 }} noWrap>
              {secondary || fill(t.topicsCount, { n: topics })}
            </Typography>
            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' }, minHeight: 10 }} />
            <Box sx={{ mt: { xs: 0.5, sm: 1.5 } }}>{status}</Box>
          </Box>

          <ChevronRightRoundedIcon sx={{ display: { xs: 'block', sm: 'none' }, color: ink[300], flexShrink: 0 }} />
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default UserPage;
