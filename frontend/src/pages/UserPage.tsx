import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Container,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import ArrowForwardSharpIcon from '@mui/icons-material/ArrowForwardSharp';
import ChevronRightSharpIcon from '@mui/icons-material/ChevronRightSharp';
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import StorefrontSharpIcon from '@mui/icons-material/StorefrontSharp';
import LocationSelectorModal from '../components/LocationSelectorModal';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import VillageProgressCard from '../components/contribute/VillageProgressCard';
import Leaderboard from '../components/contribute/Leaderboard';
import { fill, localName, useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, saveVillage, SavedVillage, surveyPath, villageCode, villageName, villagePath } from '../components/contribute/village';
import { useMyContributions, useVillageProgress, VillageCategoryProgress } from '../api/contributions';
import { GET_CATEGORIES } from '../graphql/queries';
import { FOREST, LINE, pageTitleSx, quietButton, rfFont, rowSx, sectionRule, sectionTitleSx, squareButton, squareOutlineButton, squareSegmented, textLink, TEXT, TEXT_SOFT, WARNING } from '../components/rapidFire/Backdrop';

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
  const { t, language } = useContributeCopy();
  const navigate = useNavigate();
  const location = useLocation();
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

  // "Change village" in the top bar's account menu, from any dashboard page.
  useEffect(() => {
    if (!location.state?.chooseVillage) return;
    setShowLocationModal(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

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
        const label = localName(child, language);
        options.push({ type: 'subcategory', label, secondary: label !== child.nameEn ? child.nameEn || '' : '', slug, rootSlug: root.slug, parentName: localName(root, language) });
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

  const scrollToTopics = () =>
    topicsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

  const vName = villageName(village, language);

  const secondaryActions = village && (
    <>
      <Button
        startIcon={<StorefrontSharpIcon />}
        onClick={() => navigate(surveyPath(village))}
        sx={squareOutlineButton}
      >
        {t.registerBusiness}
      </Button>
      <Button endIcon={<ArrowForwardSharpIcon />} onClick={() => navigate(villagePath(village))} sx={quietButton}>
        {t.openVillagePage}
      </Button>
    </>
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3, md: 5 }, pb: { xs: 3, md: 6 } }}>
        <Typography
          component="h1"
          sx={{ ...pageTitleSx(language), maxWidth: 860 }}
        >
          {vName ? fill(t.heroTitle, { village: vName }) : t.heroTitleNoVillage}
        </Typography>
        {/* Hidden on phones when a village is chosen, so the list of areas starts inside the first screen. */}
        <Typography sx={{ display: { xs: village ? 'none' : 'block', sm: 'block' }, color: TEXT_SOFT, fontSize: '1rem', lineHeight: 1.65, maxWidth: 680, mt: 1.5 }}>
          {village ? t.heroBody : t.heroBodyNoVillage}
        </Typography>
        {village && (
          <ButtonBase onClick={() => setShowLocationModal(true)} sx={{ ...textLink, mt: { xs: 0, sm: 1 } }}>
            {t.navChangeRegion}
          </ButtonBase>
        )}

        <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
          {village ? (
            <VillageProgressCard
              progress={progress.data}
              loading={progress.loading}
              error={Boolean(progress.error)}
              onRetry={progress.refetch}
              actions={
                <>
                  <Button startIcon={<AddSharpIcon />} onClick={scrollToTopics} sx={squareButton}>
                    {t.startContributing}
                  </Button>
                  {/* On phones these follow the list instead, leaving the first screen to the task. */}
                  <Stack direction="row" spacing={1} sx={{ flex: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: 'space-between' }}>
                    {secondaryActions}
                  </Stack>
                </>
              }
            />
          ) : (
            <Box sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${LINE}` }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography component="h2" sx={{ color: TEXT, fontWeight: 600, fontSize: '1.125rem', mb: 0.5 }}>{t.chooseVillage}</Typography>
                  <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', lineHeight: 1.6 }}>{t.chooseVillageHint}</Typography>
                </Box>
                <Button onClick={() => setShowLocationModal(true)} sx={{ ...squareButton, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                  {t.chooseVillage}
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Container>

      {village && (
        <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 6, md: 10 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' }, gap: { xs: 4, md: 4 }, alignItems: 'start' }}>
            {/* ── What can you add? ──────────────────────────────────────── */}
            <Box component="section" aria-labelledby="topics-title" ref={topicsRef} sx={{ scrollMarginTop: { xs: 16, md: 72 }, minWidth: 0 }}>
              <Typography id="topics-title" component="h2" sx={sectionTitleSx(language)}>
                {t.whatToAddTitle}
              </Typography>
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, mt: 0.75, color: TEXT_SOFT, fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: 620 }}>{t.whatToAddBody}</Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: { xs: 1.5, sm: 2.5 }, mb: 2, alignItems: { sm: 'stretch' } }}>
                <Autocomplete<SearchOption>
                  options={searchOptions}
                  forcePopupIcon={false}
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
                  slotProps={{ paper: { sx: { ...rfFont, mt: 0.5, borderRadius: 0, border: `1px solid ${LINE}`, boxShadow: '0 8px 24px rgba(16,24,20,0.12)' } } }}
                  renderOption={(props, option) => {
                    const { key: _key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
                    const { Icon } = getCategoryVisual({ slug: option.rootSlug });
                    return (
                      <Box component="li" key={option.slug} {...rest} sx={{ display: 'flex !important', alignItems: 'center', gap: 1.5, minHeight: 48, py: '8px !important' }}>
                        <Icon sx={{ fontSize: 20, color: TEXT_SOFT, flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: TEXT, fontSize: '0.875rem', fontWeight: 600 }} noWrap>
                            {option.label}
                          </Typography>
                          {option.parentName && <Typography sx={{ color: TEXT_SOFT, fontSize: '0.75rem' }}>{option.parentName}</Typography>}
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
                            <SearchSharpIcon sx={{ color: TEXT_SOFT }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 0,
                          minHeight: 44,
                          py: '2px !important',
                          fontFamily: 'inherit',
                          fontSize: '16px',
                          '& input::placeholder': { color: TEXT_SOFT, opacity: 1 },
                          '& .MuiIconButton-root': { borderRadius: 0 },
                          '& fieldset': { borderColor: LINE },
                          '&:hover fieldset': { borderColor: `${TEXT_SOFT} !important` },
                          '&.Mui-focused fieldset': { borderColor: `${TEXT} !important`, borderWidth: '2px !important' },
                        },
                      }}
                    />
                  )}
                  sx={{ flex: 1, minWidth: 0 }}
                />
                <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)} aria-label={t.whatToAddTitle} sx={{ ...squareSegmented, flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'stretch' } }}>
                  <ToggleButton value="all">{t.filterAll}</ToggleButton>
                  <ToggleButton value="needs" disabled={!progress.data}>
                    {t.filterNeeds}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {catError ? (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 0 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => refetch()} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                      {t.retry}
                    </Button>
                  }
                >
                  {t.categoriesError}
                </Alert>
              ) : catLoading ? (
                <Stack spacing={0.5}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={64} />
                  ))}
                </Stack>
              ) : visibleCategories.length === 0 ? (
                <Box sx={{ py: 5, px: 2, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
                  <Typography sx={{ color: TEXT, fontWeight: 600 }}>{categories.length ? t.noResults : t.noCategories}</Typography>
                </Box>
              ) : (
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderBottom: `1px solid ${LINE}` }}>
                  {visibleCategories.map((cat) => (
                    <Box component="li" key={cat.id}>
                      <TopicRow category={cat} progress={progressBySlug.get(cat.slug)} progressLoaded={Boolean(progress.data)} onOpen={() => navigate(`/user/categories/${cat.slug}`)} />
                    </Box>
                  ))}
                </Box>
              )}

              <Stack spacing={1} sx={{ display: { xs: 'flex', sm: 'none' }, mt: 2 }}>
                {secondaryActions}
              </Stack>
            </Box>

            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 72 }, minWidth: 0 }}>
              <MyImpact data={mine.data} loading={mine.loading} onViewAll={() => navigate('/user/contributions')} />
              <RapidFirePromo onPlay={() => navigate('/user/rapid-fire')} />
            </Stack>
          </Box>

          <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <Leaderboard ccode={ccode} villageName={vName} onContribute={scrollToTopics} />
          </Box>
        </Container>
      )}

      <LocationSelectorModal plain open={showLocationModal} onClose={() => setShowLocationModal(false)} onLocationSelected={handleVillageSelected} />
    </>
  );
};

/* ── My impact ────────────────────────────────────────────────────────────── */

const MyImpact: React.FC<{ data: ReturnType<typeof useMyContributions>['data']; loading: boolean; onViewAll: () => void }> = ({ data, loading, onViewAll }) => {
  const { t } = useContributeCopy();
  const s = data?.summary;
  const total = s?.total ?? 0;
  const part = (n: number) => `${total > 0 ? (n / total) * 100 : 0}%`;
  // The summary has no rejected count; everything else in the total was declined.
  const declined = s ? total - s.approved - s.in_review - s.drafts : 0;

  return (
    <Box component="section" aria-labelledby="impact-title" sx={{ ...sectionRule, pt: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 44, mb: 0.5 }}>
        <Typography id="impact-title" component="h2" sx={{ color: TEXT, fontWeight: 600, fontSize: '1.0625rem' }}>{t.myImpactTitle}</Typography>
        {s && s.total > 0 && (
          <ButtonBase onClick={onViewAll} sx={textLink}>
            {t.viewAll}
          </ButtonBase>
        )}
      </Stack>

      {loading ? (
        <>
          <Skeleton width="100%" height={10} />
          <Skeleton width="70%" height={24} sx={{ mt: 1 }} />
        </>
      ) : !s || s.total === 0 ? (
        <Typography sx={{ color: TEXT_SOFT, fontSize: '0.9375rem', lineHeight: 1.6 }}>{t.myImpactEmpty}</Typography>
      ) : (
        <>
          <Box aria-hidden sx={{ display: 'flex', height: 8, bgcolor: LINE }}>
            <Box sx={{ width: part(s.approved), bgcolor: FOREST }} />
            <Box sx={{ width: part(s.in_review), bgcolor: TEXT_SOFT }} />
          </Box>
          <Box component="dl" sx={{ m: 0, mt: 1 }}>
            <ImpactRow label={t.myImpactTotal} value={s.total} />
            <ImpactRow label={t.myImpactApproved} value={s.approved} shade={FOREST} />
            <ImpactRow label={t.myImpactReview} value={s.in_review} shade={TEXT_SOFT} />
            {s.drafts > 0 && <ImpactRow label={t.myFilterDrafts} value={s.drafts} />}
            {declined > 0 && <ImpactRow label={t.statusRejected} value={declined} />}
          </Box>
        </>
      )}
    </Box>
  );
};

const ImpactRow: React.FC<{ label: string; value: number; shade?: string }> = ({ label, value, shade }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, py: 0.75 }}>
    {shade && <Box sx={{ width: 8, height: 8, bgcolor: shade, flexShrink: 0 }} />}
    <Typography component="dt" sx={{ flex: 1, color: TEXT_SOFT, fontSize: '0.875rem' }}>{label}</Typography>
    <Typography component="dd" sx={{ m: 0, color: TEXT, fontWeight: 600, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString()}</Typography>
  </Stack>
);

/* ── Rapid fire promo ──────────────────────────────────────────────────────── */

const RapidFirePromo: React.FC<{ onPlay: () => void }> = ({ onPlay }) => {
  const { t } = useContributeCopy();
  return (
    <Box component="section" aria-labelledby="rapid-title" sx={sectionRule}>
      <Typography id="rapid-title" component="h2" sx={{ color: TEXT, fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.35 }}>{t.rfPromoTitle}</Typography>
      <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', lineHeight: 1.6, mt: 0.75, mb: 1.5 }}>{t.rfPromoBody}</Typography>
      <Button onClick={onPlay} endIcon={<ArrowForwardSharpIcon />} fullWidth sx={squareOutlineButton}>
        {t.rfPromoCta}
      </Button>
    </Box>
  );
};

/* ── Topic rows ───────────────────────────────────────────────────────────── */

/**
 * One row per area. The status tells the contributor whether their village
 * already has data here or needs it: under the name on phones, its own column above.
 */
const TopicRow: React.FC<{ category: any; progress?: VillageCategoryProgress; progressLoaded: boolean; onOpen: () => void }> = ({ category, progress, progressLoaded, onOpen }) => {
  const { t, language } = useContributeCopy();
  const { Icon } = getCategoryVisual(category);
  const topics = countDescendants(category.children);
  const records = progress?.records ?? 0;
  const needsData = progressLoaded && records === 0;
  const name = localName(category, language);
  const recordsText = records === 1 ? t.recordsInVillageOne : fill(t.recordsInVillage, { n: records.toLocaleString() });
  const statusText = !progressLoaded ? '' : needsData ? t.needsData : recordsText;
  const total = progress?.topics_total ?? 0;
  const covered = progress?.topics_covered ?? 0;
  // Sits on the bar it describes: the bar tracks topics covered, while the status under the name counts records.
  const coverageText = total > 0 ? fill(t.progressTopics, { covered, total }) : topics === 1 ? t.topicsCountOne : fill(t.topicsCount, { n: topics });

  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={statusText ? `${name}. ${statusText}. ${coverageText}` : name}
      sx={{
        ...rowSx,
        display: 'grid',
        gridTemplateColumns: { xs: '24px minmax(0, 1fr) 20px', sm: '24px minmax(0, 1fr) 160px 20px' },
        columnGap: 1.5,
        rowGap: 0.5,
        alignItems: 'center',
      }}
    >
      <Icon sx={{ gridRow: { xs: '1 / 3', sm: 1 }, fontSize: 22, color: TEXT_SOFT }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography component="span" sx={{ display: 'block', color: TEXT, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 }}>{name}</Typography>
        {!progressLoaded ? (
          <Skeleton width={90} height={20} />
        ) : (
          <Typography component="span" sx={{ display: 'block', color: needsData ? WARNING : TEXT_SOFT, fontSize: '0.8125rem', fontWeight: needsData ? 600 : 400, lineHeight: 1.4 }}>{statusText}</Typography>
        )}
      </Box>
      <Box sx={{ gridColumn: { xs: 2, sm: 3 }, gridRow: { xs: 2, sm: 1 }, minWidth: 0 }}>
        <Typography component="span" sx={{ display: 'block', color: TEXT, fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4, mb: 0.5 }}>{coverageText}</Typography>
        {total > 0 && (
          <Box aria-hidden sx={{ height: 4, bgcolor: LINE }}>
            <Box sx={{ height: '100%', width: `${covered > 0 ? Math.max((covered / total) * 100, 4) : 0}%`, bgcolor: FOREST }} />
          </Box>
        )}
      </Box>
      <ChevronRightSharpIcon sx={{ gridColumn: { xs: 3, sm: 4 }, gridRow: { xs: '1 / 3', sm: 1 }, fontSize: 20, color: TEXT_SOFT }} />
    </ButtonBase>
  );
};

export default UserPage;
