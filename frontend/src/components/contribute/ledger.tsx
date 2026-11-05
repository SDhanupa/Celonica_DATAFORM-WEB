import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import type { ContributionStatus } from '../../api/contributions';
import { ContributeCopy, useContributeCopy } from './copy';
import { DANGER, FOREST, LINE, TEXT, TEXT_SOFT } from '../rapidFire/Backdrop';

/** Ruled, not boxed: no outer left or right edge. Two columns on phones, four above. */
export const StatGrid: React.FC<{ stats: { label: string; value?: number }[]; loading?: boolean; sx?: object }> = ({ stats, loading = false, sx }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
      borderTop: `1px solid ${LINE}`,
      '& > div:first-of-type': { pl: 0 },
      '& > div:last-of-type': { borderRight: 0 },
      '@media (max-width: 599.95px)': { '& > div:nth-of-type(2n)': { borderRight: 0 }, '& > div:nth-of-type(2n+1)': { pl: 0 } },
      ...sx,
    }}
  >
    {stats.map(({ label, value }) => (
      <Box key={label} sx={{ px: 2, py: { xs: 1, sm: 2 }, minWidth: 0, borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        {loading || value === undefined ? (
          <Skeleton width={40} height={32} />
        ) : (
          <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString()}</Typography>
        )}
        <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem', lineHeight: 1.4 }}>{label}</Typography>
      </Box>
    ))}
  </Box>
);

const STATUS: Record<ContributionStatus, { key: keyof ContributeCopy; color: string }> = {
  approved: { key: 'statusApproved', color: FOREST },
  pending: { key: 'statusPending', color: TEXT_SOFT },
  submitted: { key: 'statusSubmitted', color: TEXT_SOFT },
  rejected: { key: 'statusRejected', color: DANGER },
  draft: { key: 'statusDraft', color: TEXT_SOFT },
};

export const StatusText: React.FC<{ status: ContributionStatus }> = ({ status }) => {
  const { t } = useContributeCopy();
  const { key, color } = STATUS[status] || STATUS.pending;
  return <Typography component="span" sx={{ flexShrink: 0, color, fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{t[key]}</Typography>;
};
