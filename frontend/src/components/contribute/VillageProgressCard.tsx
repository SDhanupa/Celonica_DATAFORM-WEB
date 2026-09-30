import React from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { VillageProgress } from '../../api/contributions';
import { fill, useContributeCopy } from './copy';
import { ink } from './tokens';

export const formatPercent = (value: number): string => (value > 0 && value < 10 ? value.toFixed(1) : String(Math.round(value)));

interface VillageProgressCardProps {
  progress: VillageProgress | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  actions?: React.ReactNode;
}

/** How complete a village's record is — the reason to contribute. Monochrome. */
const VillageProgressCard: React.FC<VillageProgressCardProps> = ({ progress, loading, error, onRetry, actions }) => {
  const { t } = useContributeCopy();

  if (error) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: '12px' }}
        action={<Button color="inherit" size="small" onClick={onRetry} sx={{ textTransform: 'none' }}>{t.retry}</Button>}
      >
        {t.progressError}
      </Alert>
    );
  }

  const s = progress?.summary;
  const pct = s?.completion ?? 0;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: '14px', border: '1px solid', borderColor: ink[200], bgcolor: '#fff' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ alignItems: { md: 'center' } }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Box sx={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }} role="img" aria-label={fill(t.progressComplete, { pct: formatPercent(pct) })}>
            <CircularProgress variant="determinate" value={100} size={88} thickness={4} sx={{ position: 'absolute', color: ink[100] }} />
            {loading ? (
              <CircularProgress size={88} thickness={4} sx={{ position: 'absolute', color: ink[300] }} />
            ) : (
              <CircularProgress
                variant="determinate"
                value={pct > 0 ? Math.max(pct, 3) : 0}
                size={88}
                thickness={4}
                sx={{ position: 'absolute', color: ink[900], '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
              />
            )}
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              {loading ? (
                <Skeleton width={40} height={26} />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.03em', lineHeight: 1, color: ink[900] }}>
                  {formatPercent(pct)}
                  <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: ink[400] }}>%</Box>
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: ink[400], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.progressTitle}</Typography>
            {loading || !s ? (
              <>
                <Skeleton width={170} height={24} />
                <Skeleton width={140} height={18} />
              </>
            ) : (
              <>
                <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: ink[900], mt: 0.25 }}>
                  {fill(t.progressTopics, { covered: s.topics_covered, total: s.topics_total })}
                </Typography>
                <Typography variant="body2" sx={{ color: ink[500] }}>
                  {fill(t.progressCategories, { covered: s.categories_covered, total: s.categories_total })}
                </Typography>
              </>
            )}
          </Box>
        </Stack>

        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
          <Stat label={t.statRecords} value={s?.records} loading={loading} />
          <Stat label={t.statInReview} value={s?.in_review} loading={loading} />
          <Stat label={t.statContributors} value={s?.contributors} loading={loading} />
          <Stat label={t.statBusinesses} value={s?.businesses_surveyed} loading={loading} />
        </Box>
      </Stack>

      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid', borderColor: ink[100] }}>
          {actions}
        </Stack>
      )}
    </Paper>
  );
};

const Stat: React.FC<{ label: string; value?: number; loading: boolean }> = ({ label, value, loading }) => (
  <Box sx={{ px: 1.5, py: 1.25, borderRadius: '10px', bgcolor: ink[50] }}>
    <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', color: ink[900], lineHeight: 1.2 }}>
      {loading || value === undefined ? <Skeleton width={28} /> : value.toLocaleString()}
    </Typography>
    <Typography variant="caption" sx={{ color: ink[500], fontWeight: 500 }} noWrap>
      {label}
    </Typography>
  </Box>
);

export default VillageProgressCard;
