import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, ButtonBase, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import ChevronRightSharpIcon from '@mui/icons-material/ChevronRightSharp';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import StorefrontSharpIcon from '@mui/icons-material/StorefrontSharp';
import { LINE, pageTitleSx, rowSx, squareButton, squareSegmented, TEXT, TEXT_SOFT } from '../components/rapidFire/Backdrop';
import { useContributeCopy } from '../components/contribute/copy';
import { StatGrid, StatusText } from '../components/contribute/ledger';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import { MyContribution, useMyContributions } from '../api/contributions';

type Filter = 'all' | 'review' | 'approved' | 'drafts';

const matchesFilter = (item: MyContribution, filter: Filter) => {
  if (filter === 'review') return item.status === 'pending' || item.status === 'submitted';
  if (filter === 'approved') return item.status === 'approved';
  if (filter === 'drafts') return item.status === 'draft';
  return true;
};

// Bookkeeping columns: they mean nothing to the contributor, and the reference number and status show elsewhere.
const HIDDEN_FIELDS = new Set(['id', 'contributor_sub', 'user_id', 'created_by', 'category_slug', 'reg_number', 'status', 'image_path', 'is_update_proposal', 'created_at', 'updated_at', 'deleted_at']);

/** Surveys keep their answers in a JSON column; those answers are the details, so lift them up a level. */
const detailRows = (data: unknown): [string, unknown][] => {
  const rows: [string, unknown][] = [];
  const add = (source: object) =>
    Object.entries(source).forEach(([key, value]) => {
      if (HIDDEN_FIELDS.has(key) || value === null || value === '') return;
      if (key === 'form_data') {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (parsed && typeof parsed === 'object') add(parsed);
        } catch {
          /* unreadable answers are left out rather than shown as raw text */
        }
        return;
      }
      rows.push([key, value]);
    });
  if (data && typeof data === 'object') add(data);
  return rows;
};

const MyContributionsPage: React.FC = () => {
  const { t, language } = useContributeCopy();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useMyContributions();
  const [filter, setFilter] = useState<Filter>('all');
  const [viewItem, setViewItem] = useState<MyContribution | null>(null);
  const isPhone = useMediaQuery('(max-width: 599.95px)');

  const items = useMemo(() => (data?.items || []).filter((i) => matchesFilter(i, filter)), [data, filter]);
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    [language],
  );

  const s = data?.summary;
  const viewTitle = viewItem?.title || (viewItem?.kind === 'business_survey' ? t.kindBusiness : t.untitled);

  return (
    <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3, md: 5 }, pb: { xs: 6, md: 10 } }}>
      <Typography component="h1" sx={pageTitleSx(language)}>
        {t.myTitle}
      </Typography>
      <Typography sx={{ color: TEXT_SOFT, fontSize: '1rem', lineHeight: 1.65, maxWidth: 560, mt: 1.5, mb: { xs: 2, sm: 3 } }}>{t.mySubtitle}</Typography>

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              {t.retry}
            </Button>
          }
        >
          {error.status === 401 ? error.message : t.myError}
        </Alert>
      ) : (
        <>
          <StatGrid
            loading={loading}
            stats={[
              { label: t.myImpactTotal, value: s?.total ?? 0 },
              { label: t.myImpactApproved, value: s?.approved ?? 0 },
              { label: t.myImpactReview, value: s?.in_review ?? 0 },
              { label: t.villagesCount, value: s?.villages ?? 0 },
            ]}
          />

          {!loading && s && s.total > 0 && (
            <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)} aria-label={t.myTitle} sx={{ ...squareSegmented, mt: { xs: 2, sm: 3 }, mb: 2, flexWrap: 'wrap', maxWidth: '100%' }}>
              <ToggleButton value="all">{t.myFilterAll}</ToggleButton>
              <ToggleButton value="review">{t.myFilterReview}</ToggleButton>
              <ToggleButton value="approved">{t.myFilterApproved}</ToggleButton>
              {s.drafts > 0 && <ToggleButton value="drafts">{t.myFilterDrafts}</ToggleButton>}
            </ToggleButtonGroup>
          )}

          {loading ? (
            <Stack spacing={0.5} sx={{ mt: 3 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={64} />
              ))}
            </Stack>
          ) : !s || s.total === 0 ? (
            <Box sx={{ mt: 3 }}>
              <Typography component="h2" sx={{ color: TEXT, fontWeight: 600, fontSize: '1.125rem' }}>{t.myEmptyTitle}</Typography>
              <Typography sx={{ color: TEXT_SOFT, fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: 420, mt: 0.5, mb: 2 }}>{t.myEmptyBody}</Typography>
              <Button startIcon={<AddSharpIcon />} onClick={() => navigate('/user')} sx={squareButton}>
                {t.startContributing}
              </Button>
            </Box>
          ) : items.length === 0 ? (
            <Typography sx={{ py: 4, color: TEXT_SOFT }}>{t.noResults}</Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderBottom: `1px solid ${LINE}` }}>
              {items.map((item) => (
                <ContributionRow key={item.id} item={item} dateFormat={dateFormat} onOpen={() => setViewItem(item)} />
              ))}
            </Box>
          )}
        </>
      )}

      <Dialog open={Boolean(viewItem)} onClose={() => setViewItem(null)} fullScreen={isPhone} maxWidth="md" fullWidth aria-labelledby="contribution-title" slotProps={{ backdrop: { sx: { bgcolor: 'rgba(16,24,20,0.5)' } } }}>
        <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pb: 1 }}>
          <Typography id="contribution-title" component="h2" sx={{ color: TEXT, fontWeight: 700, fontSize: '1.125rem', minWidth: 0 }}>{viewTitle}</Typography>
          <IconButton onClick={() => setViewItem(null)} aria-label={t.close} sx={{ width: 44, height: 44, flexShrink: 0, color: TEXT_SOFT }}>
            <CloseSharpIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: '0 !important' }}>
          {viewItem?.reg_number && (
            <Box sx={{ mb: 2, pb: 2, borderBottom: `2px solid ${TEXT}` }}>
              <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem' }}>{t.thanksReg}</Typography>
              <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word' }}>{viewItem.reg_number}</Typography>
            </Box>
          )}
          <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 3 }}>
            {detailRows(viewItem?.full_data).map(([key, val]) => (
              <Box key={key} sx={{ py: 1.25, borderBottom: `1px solid ${LINE}`, minWidth: 0 }}>
                <Typography component="dt" sx={{ color: TEXT_SOFT, fontSize: '0.8125rem' }}>{key.replace(/_/g, ' ')}</Typography>
                <Typography component="dd" sx={{ m: 0, color: TEXT, fontSize: '0.9375rem', mt: 0.25, wordBreak: 'break-word' }}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewItem(null)} sx={squareButton}>
            {t.close}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const ContributionRow: React.FC<{ item: MyContribution; dateFormat: Intl.DateTimeFormat; onOpen: () => void }> = ({ item, dateFormat, onOpen }) => {
  const { t } = useContributeCopy();
  const isBusiness = item.kind === 'business_survey';
  const { Icon } = isBusiness ? { Icon: StorefrontSharpIcon } : getCategoryVisual({ slug: item.category?.root_slug || undefined, nameEn: item.category?.root_name_en || undefined });
  const title = isBusiness ? t.kindBusiness : item.title || t.untitled;
  const context = isBusiness ? item.reg_number : item.reg_number ? `${item.reg_number} · ${item.category?.name_en}` : item.category?.name_en;
  const created = item.created_at ? new Date(item.created_at.replace(' ', 'T')) : null;

  return (
    <Box component="li">
      <ButtonBase onClick={onOpen} sx={{ ...rowSx, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-start' }}>
        <Icon sx={{ fontSize: 22, color: TEXT_SOFT, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="span" sx={{ display: 'block', color: TEXT, fontWeight: 600, fontSize: '0.9375rem' }} noWrap>
            {title}
            {item.is_update && (
              <Box component="span" sx={{ color: TEXT_SOFT, fontWeight: 400, fontSize: '0.8125rem' }}> · {t.updateProposal}</Box>
            )}
          </Typography>
          <Typography component="span" sx={{ display: 'block', color: TEXT_SOFT, fontSize: '0.8125rem' }} noWrap>
            {[context, item.village, created && !isNaN(created.getTime()) ? dateFormat.format(created) : null].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        <StatusText status={item.status} />
        <ChevronRightSharpIcon sx={{ color: TEXT_SOFT, fontSize: 20, flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      </ButtonBase>
    </Box>
  );
};

export default MyContributionsPage;
