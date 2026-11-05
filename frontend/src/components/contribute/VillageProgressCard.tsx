import React from 'react';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import type { VillageProgress } from '../../api/contributions';
import { fill, useContributeCopy } from './copy';
import { StatGrid } from './ledger';
import { EASE, useMounted } from './motion';
import { FOREST, LINE, TEXT, TEXT_SOFT } from '../rapidFire/Backdrop';

export const formatPercent = (value: number): string => (value > 0 && value < 10 ? value.toFixed(1) : String(Math.round(value)));

interface VillageProgressCardProps {
  progress: VillageProgress | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  actions?: React.ReactNode;
}

/**
 * How complete a village's record is, as the reason to contribute. The bar
 * tracks topics (leaf categories) with at least one approved record.
 */
const VillageProgressCard: React.FC<VillageProgressCardProps> = ({ progress, loading, error, onRetry, actions }) => {
  const { t } = useContributeCopy();
  const mounted = useMounted();

  if (error) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: 0 }}
        action={
          <Button color="inherit" size="small" onClick={onRetry} sx={{ boxShadow: 'none', borderRadius: 0 }}>
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
  const label = fill(t.progressComplete, { pct: formatPercent(pct) });

  return (
    <Box>
      {loading || !s ? (
        <>
          <Skeleton width={220} height={36} />
          <Skeleton width={260} height={22} />
        </>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'baseline' }, justifyContent: 'space-between', columnGap: 2, rowGap: 0.25 }}>
          <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: { xs: '1.375rem', sm: '1.5rem' }, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' }}>{label}</Typography>
          <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', lineHeight: 1.5 }}>
            {fill(t.progressTopics, { covered: s.topics_covered, total: s.topics_total })}
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}> · {fill(t.progressCategories, { covered: s.categories_covered, total: s.categories_total })}</Box>
          </Typography>
        </Stack>
      )}

      <Box role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} sx={{ height: 8, mt: 1.5, bgcolor: LINE }}>
        {/* A sliver keeps the bar legible when a village has barely started. */}
        <Box sx={{ height: '100%', width: !loading && mounted ? `${pct > 0 ? Math.max(pct, 2) : 0}%` : 0, bgcolor: FOREST, transition: `width 900ms ${EASE}`, '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
      </Box>

      <StatGrid
        loading={loading}
        sx={{ mt: { xs: 2, sm: 3 } }}
        stats={[
          { label: t.statRecords, value: s?.records },
          { label: t.statInReview, value: s?.in_review },
          { label: t.statContributors, value: s?.contributors },
          { label: t.statBusinesses, value: s?.businesses_surveyed },
        ]}
      />

      {actions && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: { xs: 2, sm: 3 } }}>
          {actions}
        </Stack>
      )}
    </Box>
  );
};

export default VillageProgressCard;
