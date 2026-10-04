import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, ButtonBase, Chip, Container, Paper, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { ink, inkButton, segmented, semantic } from '../components/contribute/tokens';
import { Ambient, CountUp, EASE, enter, lift, spotlight, spotlightMove } from '../components/contribute/motion';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import UserTopBar from '../components/contribute/UserTopBar';
import { ContributeCopy, useContributeCopy } from '../components/contribute/copy';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
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

  const [viewItem, setViewItem] = useState<MyContribution | null>(null);

  const openItem = (item: MyContribution) => {
    setViewItem(item);
  };

  const s = data?.summary;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: ink[50] }}>
      <UserTopBar />
      <Box sx={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', bgcolor: ink[900], color: '#fff' }}>
        <Ambient />
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 } }}>
          <Typography component="h1" sx={{ ...enter(0), fontSize: { xs: '2rem', sm: '2.75rem' }, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05, mb: 1, background: 'linear-gradient(180deg,#fff 35%,rgba(255,255,255,.55))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {t.myTitle}
          </Typography>
          <Typography sx={{ ...enter(1), color: 'rgba(255,255,255,.6)', mb: { xs: 3, md: 4 }, maxWidth: 560 }}>
            {t.mySubtitle}
          </Typography>
          {!error && (
            <Box sx={{ ...enter(2), display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: '1px', borderRadius: '20px', overflow: 'hidden', bgcolor: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' }}>
              <SummaryTile label={t.myImpactTotal} value={s?.total} loading={loading} />
              <SummaryTile label={t.myImpactApproved} value={s?.approved} loading={loading} />
              <SummaryTile label={t.myImpactReview} value={s?.in_review} loading={loading} />
              <SummaryTile label={t.villagesCount} value={s?.villages} loading={loading} />
            </Box>
          )}
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, md: 4 } }}>
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
            {!loading && s && s.total > 0 && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={filter}
                onChange={(_, value) => value && setFilter(value)}
                sx={{ ...segmented, ...enter(3), mb: 2.5, flexWrap: 'wrap', maxWidth: '100%' }}
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
                <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 2, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[600] }}>
                  <VolunteerActivismRoundedIcon />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', mb: 0.75 }}>{t.myEmptyTitle}</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 3 }}>
                  {t.myEmptyBody}
                </Typography>
                <Button startIcon={<AddRoundedIcon />} onClick={() => navigate('/user')} sx={{ py: 1.25, px: 2.5, borderRadius: 999, fontWeight: 700, ...inkButton }}>
                  {t.startContributing}
                </Button>
              </Paper>
            ) : items.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {t.noResults}
              </Typography>
            ) : (
              <Stack component="ul" key={filter} spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {items.map((item, i) => (
                  <ContributionRow key={item.id} index={i} item={item} dateFormat={dateFormat} onOpen={() => openItem(item)} />
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>
      
      {/* Submission Details Dialog */}
      <Dialog open={Boolean(viewItem)} onClose={() => setViewItem(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: { xs: '20px', sm: '24px' }, m: { xs: 1.5, sm: 4 }, width: { xs: 'calc(100% - 24px)', sm: undefined } } }} slotProps={{ backdrop: { sx: { bgcolor: 'rgba(10,12,15,.45)', backdropFilter: 'blur(6px)' } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {viewItem?.title || (viewItem?.kind === 'business_survey' ? t.kindBusiness : t.untitled)}
          </Typography>
          <IconButton onClick={() => setViewItem(null)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: ink[50], borderColor: ink[100], p: { xs: 2, sm: 3 } }}>
          {viewItem?.reg_number && (
            <Box sx={{ mb: 3, p: 2.5, borderRadius: '16px', bgcolor: ink[900], color: '#fff' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Registration number</Typography>
              <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '1.25rem', fontWeight: 700, mt: 0.5, letterSpacing: '0.04em' }}>{viewItem.reg_number}</Typography>
            </Box>
          )}
          
          <Paper variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden', borderColor: ink[100] }}>
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
          <Button onClick={() => setViewItem(null)} sx={{ fontWeight: 700, borderRadius: 999, px: 3, ...inkButton }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SummaryTile: React.FC<{ label: string; value?: number; loading: boolean }> = ({ label, value, loading }) => (
  <Box sx={{ p: { xs: 2, sm: 2.25 }, bgcolor: 'rgba(10,12,15,.55)', backdropFilter: 'blur(8px)', transition: 'background-color 200ms ease', '&:hover': { bgcolor: 'rgba(255,255,255,.06)' } }}>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,.5)' }} noWrap>
      {label}
    </Typography>
    {loading || value === undefined ? (
      <Skeleton width={40} height={38} sx={{ bgcolor: 'rgba(255,255,255,.1)' }} />
    ) : (
      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2rem' }, letterSpacing: '-0.05em', lineHeight: 1.15, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
        <CountUp value={value} />
      </Typography>
    )}
  </Box>
);

const STATUS_SX: Record<ContributionStatus, object> = {
  approved: { bgcolor: ink[900], color: '#fff' },
  pending: { border: `1px solid ${ink[300]}`, color: ink[700] },
  submitted: { border: `1px solid ${ink[300]}`, color: ink[700] },
  draft: { bgcolor: ink[100], color: ink[500] },
  rejected: { bgcolor: semantic.dangerSoft, color: semantic.danger },
};

const ContributionRow: React.FC<{ item: MyContribution; index: number; dateFormat: Intl.DateTimeFormat; onOpen: () => void }> = ({ item, index, dateFormat, onOpen }) => {
  const { t } = useContributeCopy();
  const isBusiness = item.kind === 'business_survey';
  const { Icon } = isBusiness ? { Icon: StorefrontRoundedIcon } : getCategoryVisual({ slug: item.category?.root_slug || undefined, nameEn: item.category?.root_name_en || undefined });
  const status = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
  const title = isBusiness ? t.kindBusiness : item.title || t.untitled;
  const context = isBusiness ? item.reg_number : (item.reg_number ? `${item.reg_number} · ${item.category?.name_en}` : item.category?.name_en);
  const created = item.created_at ? new Date(item.created_at.replace(' ', 'T')) : null;

  return (
    <Box component="li" sx={enter(Math.min(index, 10) + 3, 45)}>
      <ButtonBase
        onClick={onOpen}
        onPointerMove={spotlightMove}
        sx={{
          ...spotlight(),
          ...lift,
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: '18px',
          bgcolor: '#fff',
          border: `1px solid ${ink[100]}`,
          '&:hover': { ...lift['&:hover'], borderColor: ink[200], '& .row-icon': { bgcolor: ink[900], color: '#fff' }, '& .row-chev': { transform: 'translateX(3px)', color: ink[900] } },
          '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
        }}
      >
        <Box className="row-icon" sx={{ width: 44, height: 44, borderRadius: '13px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: ink[100], color: ink[700], transition: 'background-color 250ms ease, color 250ms ease' }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, color: ink[900] }} noWrap>
              {title}
            </Typography>
            {item.is_update && <Chip label={t.updateProposal} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0, borderColor: ink[200], color: ink[600] }} />}
          </Stack>
          <Typography variant="body2" sx={{ color: ink[400] }} noWrap>
            {[context, item.village, created && !isNaN(created.getTime()) ? dateFormat.format(created) : null].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        <Box sx={{ ...STATUS_SX[item.status], px: 1.25, py: 0.4, borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>{t[status.key]}</Box>
        <ChevronRightRoundedIcon className="row-chev" sx={{ color: ink[300], flexShrink: 0, display: { xs: 'none', sm: 'block' }, transition: `transform 300ms ${EASE}, color 200ms ease` }} />
      </ButtonBase>
    </Box>
  );
};

export default MyContributionsPage;
