import React from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { VillageProgress } from '../../api/contributions';
import { fill, useContributeCopy } from './copy';

export const formatPercent = (value: number): string => (value > 0 && value < 10 ? value.toFixed(1) : String(Math.round(value)));

interface VillageProgressCardProps {
  progress: VillageProgress | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  actions?: React.ReactNode;
}

/**
 * How complete a village's record is, as the reason to contribute. The ring
 * tracks topics (leaf categories) with at least one approved record.
 */
const VillageProgressCard: React.FC<VillageProgressCardProps> = ({ progress, loading, error, onRetry, actions }) => {
  const { t } = useContributeCopy();

  if (error) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: '16px' }}
        action={
          <Button color="inherit" size="small" onClick={onRetry} sx={{ boxShadow: 'none' }}>
            {t.retry}
          </Button>
        }
      >
        {t.progressError}
      </Alert>
    );
  }

  const s = progress?.summary;
  const pct = s?.completion ?? 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: { xs: '18px', sm: '22px' },
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgba(23,43,58,0.04), 0 16px 40px rgba(23,43,58,0.06)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ alignItems: { md: 'center' } }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Box sx={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }} role="img" aria-label={fill(t.progressComplete, { pct: formatPercent(pct) })}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={104}
              thickness={4.5}
              sx={{ position: 'absolute', color: (theme) => alpha(theme.palette.primary.main, 0.1) }}
            />
            {loading ? (
              <CircularProgress size={104} thickness={4.5} sx={{ position: 'absolute' }} />
            ) : (
              <CircularProgress
                variant="determinate"
                // A sliver keeps the ring legible when a village has barely started.
                value={pct > 0 ? Math.max(pct, 3) : 0}
                size={104}
                thickness={4.5}
                sx={{ position: 'absolute', color: 'success.main', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
              />
            )}
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              {loading ? (
                <Skeleton width={44} height={30} />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {formatPercent(pct)}
                  <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary' }}>
                    %
                  </Box>
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t.progressTitle}
            </Typography>
            {loading || !s ? (
              <>
                <Skeleton width={180} height={26} />
                <Skeleton width={150} height={20} />
              </>
            ) : (
              <>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.25 }}>
                  {fill(t.progressTopics, { covered: s.topics_covered, total: s.topics_total })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fill(t.progressCategories, { covered: s.categories_covered, total: s.categories_total })}
                </Typography>
              </>
            )}
          </Box>
        </Stack>

        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1,
          }}
        >
          <Stat label={t.statRecords} value={s?.records} loading={loading} />
          <Stat label={t.statInReview} value={s?.in_review} loading={loading} />
          <Stat label={t.statContributors} value={s?.contributors} loading={loading} />
          <Stat label={t.statBusinesses} value={s?.businesses_surveyed} loading={loading} />
        </Box>
      </Stack>

      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
          {actions}
        </Stack>
      )}
    </Paper>
  );
};

const Stat: React.FC<{ label: string; value?: number; loading: boolean }> = ({ label, value, loading }) => (
  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'background.default' }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }} noWrap>
      {label}
    </Typography>
    {loading || value === undefined ? (
      <Skeleton width={40} height={28} />
    ) : (
      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{value.toLocaleString()}</Typography>
    )}
  </Box>
);

export default VillageProgressCard;
