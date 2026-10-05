import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Paper, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import UserTopBar from '../components/contribute/UserTopBar';
import { ContributeCopy, useContributeCopy } from '../components/contribute/copy';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import { ink, inkButton, semantic } from '../components/contribute/tokens';
import { ContributionStatus, MyContribution, useMyContributions } from '../api/contributions';
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type Filter = 'all' | 'review' | 'approved' | 'drafts';

const matchesFilter = (item: MyContribution, filter: Filter) => {
  if (filter === 'review') return item.status === 'pending' || item.status === 'submitted';
  if (filter === 'approved') return item.status === 'approved';
  if (filter === 'drafts') return item.status === 'draft';
  return true;
};

// Monochrome status chips: distinction by fill/weight, not colour. Rejected is
// the one case where colour carries the meaning, so it keeps a muted danger tint.
type ChipVariant = 'solid' | 'outline' | 'muted' | 'danger';
const STATUS_STYLE: Record<ContributionStatus, { key: keyof ContributeCopy; variant: ChipVariant }> = {
  approved: { key: 'statusApproved', variant: 'solid' },
  pending: { key: 'statusPending', variant: 'outline' },
  submitted: { key: 'statusSubmitted', variant: 'outline' },
  rejected: { key: 'statusRejected', variant: 'danger' },
  draft: { key: 'statusDraft', variant: 'muted' },
};

const chipSx = (variant: ChipVariant) => {
  const base = { flexShrink: 0, fontWeight: 600, fontSize: '0.72rem', height: 24, borderRadius: '7px' };
  if (variant === 'solid') return { ...base, bgcolor: ink[900], color: '#fff' };
  if (variant === 'danger') return { ...base, bgcolor: semantic.dangerSoft, color: semantic.danger };
  if (variant === 'muted') return { ...base, bgcolor: ink[100], color: ink[500] };
  return { ...base, bgcolor: 'transparent', color: ink[700], border: '1px solid', borderColor: ink[300] };
};

const filterToggleSx = {
  mb: 2,
  flexWrap: 'wrap',
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

  const [viewItem, setViewItem] = useState<MyContribution | null>(null);

  const openItem = (item: MyContribution) => {
    setViewItem(item);
  };

  const s = data?.summary;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: ink[50] }}>
      <UserTopBar />
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3.5, md: 5 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, letterSpacing: '-0.03em', color: ink[900], mb: 0.5 }}>
          {t.myTitle}
        </Typography>
        <Typography sx={{ color: ink[500], mb: { xs: 3, md: 3.5 } }}>{t.mySubtitle}</Typography>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: '12px' }} action={<Button color="inherit" size="small" onClick={refetch} sx={{ textTransform: 'none' }}>{t.retry}</Button>}>
            {error.status === 401 ? error.message : t.myError}
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1, mb: 3, border: '1px solid', borderColor: ink[200], borderRadius: '12px', overflow: 'hidden', bgcolor: '#fff' }}>
              <SummaryTile label={t.myImpactTotal} value={s?.total} loading={loading} first />
              <SummaryTile label={t.myImpactApproved} value={s?.approved} loading={loading} />
              <SummaryTile label={t.myImpactReview} value={s?.in_review} loading={loading} />
              <SummaryTile label={t.villagesCount} value={s?.villages} loading={loading} />
            </Box>

            {!loading && s && s.total > 0 && (
              <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)} sx={filterToggleSx}>
                <ToggleButton value="all">{t.myFilterAll}</ToggleButton>
                <ToggleButton value="review">{t.myFilterReview}</ToggleButton>
                <ToggleButton value="approved">{t.myFilterApproved}</ToggleButton>
                {s.drafts > 0 && <ToggleButton value="drafts">{t.myFilterDrafts}</ToggleButton>}
              </ToggleButtonGroup>
            )}

            {loading ? (
              <Stack spacing={1}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: ink[200], display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '10px' }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="50%" height={20} />
                      <Skeleton width="35%" height={16} />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : !s || s.total === 0 ? (
              <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: '16px', border: '1px solid', borderColor: ink[200], textAlign: 'center' }}>
                <Box sx={{ width: 56, height: 56, mx: 'auto', mb: 2, borderRadius: '15px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[700] }}>
                  <VolunteerActivismOutlinedIcon />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: ink[900], mb: 0.5 }}>{t.myEmptyTitle}</Typography>
                <Typography sx={{ color: ink[500], maxWidth: 420, mx: 'auto', mb: 3 }}>{t.myEmptyBody}</Typography>
                <Button disableElevation startIcon={<AddRoundedIcon />} onClick={() => navigate('/user')} sx={{ py: 1, px: 2.25, ...inkButton }}>
                  {t.startContributing}
                </Button>
              </Paper>
            ) : items.length === 0 ? (
              <Typography sx={{ color: ink[500], py: 4, textAlign: 'center' }}>{t.noResults}</Typography>
            ) : (
              <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {items.map((item) => (
                  <ContributionRow key={item.id} item={item} dateFormat={dateFormat} onOpen={() => openItem(item)} />
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>
      
      {/* Submission Details Dialog */}
      <Dialog open={Boolean(viewItem)} onClose={() => setViewItem(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {viewItem?.title || (viewItem?.kind === 'business_survey' ? t.kindBusiness : t.untitled)}
          </Typography>
          <IconButton onClick={() => setViewItem(null)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'background.default', p: { xs: 2, sm: 3 } }}>
          {viewItem?.reg_number && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="subtitle2">{t.myGeneratedCode || 'Registration Number'}</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{viewItem.reg_number}</Typography>
            </Alert>
          )}
          
          <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Grid container>
              {viewItem?.full_data && Object.entries(viewItem.full_data)
                .filter(([key, val]) => val !== null && val !== '' && key !== 'id' && key !== 'contributor_sub' && key !== 'user_id' && key !== 'category_slug')
                .map(([key, val]) => (
                <Grid item xs={12} sm={6} key={key} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', '&:nth-of-type(even)': { borderLeft: { sm: '1px solid' }, borderLeftColor: { sm: 'divider' } } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {key.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1.5 }}>
          <Button onClick={() => setViewItem(null)} sx={{ fontWeight: 600 }}>
            {t.myFilterAll || 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SummaryTile: React.FC<{ label: string; value?: number; loading: boolean; first?: boolean }> = ({ label, value, loading, first }) => (
  <Box sx={{ px: 2, py: 1.75, borderLeft: first ? 'none' : '1px solid', borderColor: ink[200] }}>
    <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: ink[900], lineHeight: 1.2 }}>
      {loading || value === undefined ? <Skeleton width={32} /> : value}
    </Typography>
    <Typography variant="caption" sx={{ color: ink[500], fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }} noWrap>
      {label}
    </Typography>
  </Box>
);

const ContributionRow: React.FC<{ item: MyContribution; dateFormat: Intl.DateTimeFormat; onOpen: () => void }> = ({ item, dateFormat, onOpen }) => {
  const { t } = useContributeCopy();
  const isBusiness = item.kind === 'business_survey';
  const Icon = isBusiness ? StorefrontOutlinedIcon : getCategoryVisual({ slug: item.category?.root_slug || undefined, nameEn: item.category?.root_name_en || undefined }).Icon;
  const status = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
  const title = isBusiness ? t.kindBusiness : item.title || t.untitled;
  const context = isBusiness ? item.reg_number : (item.reg_number ? `${item.reg_number} · ${item.category?.name_en}` : item.category?.name_en);
  const created = item.created_at ? new Date(item.created_at.replace(' ', 'T')) : null;

  return (
    <Paper component="li" elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: ink[200], overflow: 'hidden', transition: 'border-color 150ms ease', '&:hover': { borderColor: ink[300] } }}>
      <Box
        component="button"
        type="button"
        onClick={onOpen}
        sx={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.75, p: { xs: 1.5, sm: 1.75 }, '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: -2, borderRadius: '12px' } }}
      >
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100], color: ink[700] }}>
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, color: ink[900] }} noWrap>{title}</Typography>
            {item.is_update && <Chip label={t.updateProposal} size="small" sx={{ height: 19, fontSize: '0.62rem', flexShrink: 0, bgcolor: ink[100], color: ink[500] }} />}
          </Stack>
          <Typography variant="body2" sx={{ color: ink[400] }} noWrap>
            {[context, item.village, created && !isNaN(created.getTime()) ? dateFormat.format(created) : null].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        <Chip label={t[status.key]} size="small" sx={chipSx(status.variant)} />
        <ChevronRightRoundedIcon sx={{ color: ink[300], flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      </Box>
    </Paper>
  );
};

export default MyContributionsPage;
