import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Paper, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import UserTopBar from '../components/contribute/UserTopBar';
import { ContributeCopy, useContributeCopy } from '../components/contribute/copy';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import { ContributionStatus, MyContribution, useMyContributions } from '../api/contributions';

type Filter = 'all' | 'review' | 'approved' | 'drafts';

const matchesFilter = (item: MyContribution, filter: Filter) => {
  if (filter === 'review') return item.status === 'pending' || item.status === 'submitted';
  if (filter === 'approved') return item.status === 'approved';
  if (filter === 'drafts') return item.status === 'draft';
  return true;
};

const STATUS_STYLE: Record<ContributionStatus, { key: keyof ContributeCopy; tone: 'success' | 'warning' | 'error' | 'info' }> = {
  approved: { key: 'statusApproved', tone: 'success' },
  pending: { key: 'statusPending', tone: 'warning' },
  submitted: { key: 'statusSubmitted', tone: 'warning' },
  rejected: { key: 'statusRejected', tone: 'error' },
  draft: { key: 'statusDraft', tone: 'info' },
};

const MyContributionsPage: React.FC = () => {
  const { t, language } = useContributeCopy();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useMyContributions();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => (data?.items || []).filter((i) => matchesFilter(i, filter)), [data, filter]);
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    [language],
  );

  const openItem = (item: MyContribution) => {
    if (item.kind === 'business_survey') {
      const gn = encodeURIComponent(String(item.village || '').replace(/ /g, '-'));
      navigate(item.ccode ? `/industry-survey/${gn}/${encodeURIComponent(item.ccode)}` : '/industry-survey');
    } else if (item.category) {
      navigate(`/user/categories/${item.category.slug}`);
    }
  };

  const s = data?.summary;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <UserTopBar />
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3.5, md: 6 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.75rem', sm: '2.2rem' }, fontWeight: 700, letterSpacing: '-0.03em', mb: 0.75 }}>
          {t.myTitle}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: { xs: 3, md: 4 } }}>
          {t.mySubtitle}
        </Typography>

        {error ? (
          <Alert
            severity="error"
            sx={{ borderRadius: '14px' }}
            action={
              <Button color="inherit" size="small" onClick={refetch} sx={{ boxShadow: 'none' }}>
                {t.retry}
              </Button>
            }
          >
            {error.status === 401 ? error.message : t.myError}
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.25, mb: 3 }}>
              <SummaryTile label={t.myImpactTotal} value={s?.total} loading={loading} />
              <SummaryTile label={t.myImpactApproved} value={s?.approved} loading={loading} tone="success" />
              <SummaryTile label={t.myImpactReview} value={s?.in_review} loading={loading} tone="warning" />
              <SummaryTile label={t.villagesCount} value={s?.villages} loading={loading} />
            </Box>

            {!loading && s && s.total > 0 && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={filter}
                onChange={(_, value) => value && setFilter(value)}
                sx={{ mb: 2, flexWrap: 'wrap', '& .MuiToggleButton-root': { px: 1.75, textTransform: 'none', fontWeight: 600 } }}
              >
                <ToggleButton value="all">{t.myFilterAll}</ToggleButton>
                <ToggleButton value="review">{t.myFilterReview}</ToggleButton>
                <ToggleButton value="approved">{t.myFilterApproved}</ToggleButton>
                {s.drafts > 0 && <ToggleButton value="drafts">{t.myFilterDrafts}</ToggleButton>}
              </ToggleButtonGroup>
            )}

            {loading ? (
              <Stack spacing={1.25}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: '14px', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="50%" height={22} />
                      <Skeleton width="35%" height={18} />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : !s || s.total === 0 ? (
              <Paper variant="outlined" sx={{ p: { xs: 4, sm: 6 }, borderRadius: '20px', textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 2, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                  <VolunteerActivismRoundedIcon />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', mb: 0.75 }}>{t.myEmptyTitle}</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 3 }}>
                  {t.myEmptyBody}
                </Typography>
                <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => navigate('/user')} sx={{ py: 1.25, px: 2.5 }}>
                  {t.startContributing}
                </Button>
              </Paper>
            ) : items.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {t.noResults}
              </Typography>
            ) : (
              <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {items.map((item) => (
                  <ContributionRow key={item.id} item={item} dateFormat={dateFormat} onOpen={() => openItem(item)} />
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

const SummaryTile: React.FC<{ label: string; value?: number; loading: boolean; tone?: 'success' | 'warning' }> = ({ label, value, loading, tone }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }} noWrap>
      {label}
    </Typography>
    {loading || value === undefined ? (
      <Skeleton width={40} height={34} />
    ) : (
      <Typography sx={{ fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', color: tone && value > 0 ? `${tone}.main` : 'text.primary' }}>{value}</Typography>
    )}
  </Paper>
);

const ContributionRow: React.FC<{ item: MyContribution; dateFormat: Intl.DateTimeFormat; onOpen: () => void }> = ({ item, dateFormat, onOpen }) => {
  const { t } = useContributeCopy();
  const isBusiness = item.kind === 'business_survey';
  const { Icon, color } = isBusiness ? { Icon: StorefrontRoundedIcon, color: '#7C3AED' } : getCategoryVisual({ slug: item.category?.root_slug || undefined, nameEn: item.category?.root_name_en || undefined });
  const status = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
  const title = isBusiness ? t.kindBusiness : item.title || t.untitled;
  const context = isBusiness ? item.reg_number : item.category?.name_en;
  const created = item.created_at ? new Date(item.created_at.replace(' ', 'T')) : null;

  return (
    <Paper component="li" variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden', transition: 'border-color 150ms ease', '&:hover': { borderColor: alpha(color, 0.5) } }}>
      <Box
        component="button"
        type="button"
        onClick={onOpen}
        sx={{
          all: 'unset',
          boxSizing: 'border-box',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: { xs: 1.5, sm: 2 },
          '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2, borderRadius: '14px' },
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: alpha(color, 0.1), color }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {title}
            </Typography>
            {item.is_update && <Chip label={t.updateProposal} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0 }} />}
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {[context, item.village, created && !isNaN(created.getTime()) ? dateFormat.format(created) : null].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        <Chip
          label={t[status.key]}
          size="small"
          sx={{ flexShrink: 0, fontWeight: 600, fontSize: '0.72rem', bgcolor: (theme) => alpha(theme.palette[status.tone].main, 0.12), color: `${status.tone}.dark` }}
        />
        <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      </Box>
    </Paper>
  );
};

export default MyContributionsPage;
