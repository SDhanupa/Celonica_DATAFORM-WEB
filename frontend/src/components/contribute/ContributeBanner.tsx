import React from 'react';
import { Box, Button, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import { useVillageProgress } from '../../api/contributions';
import { fill, useContributeCopy } from './copy';
import { formatPercent } from './VillageProgressCard';

interface ContributeBannerProps {
  ccode: string | null | undefined;
  villageName: string;
  isAuthenticated: boolean;
  isDarkMode?: boolean;
  onContribute: () => void;
  onJoin: () => void;
  compact?: boolean;
}

/**
 * The invitation to contribute, shown on the public village page. It states
 * how complete the village's record is and offers one clear next step.
 */
const ContributeBanner: React.FC<ContributeBannerProps> = ({ ccode, villageName, isAuthenticated, isDarkMode = false, onContribute, onJoin, compact = false }) => {
  const { t } = useContributeCopy();
  const { data, loading } = useVillageProgress(ccode);

  if (!ccode) return null;

  const pct = data?.summary.completion ?? 0;
  const hasData = (data?.summary.records ?? 0) > 0;
  const body = hasData
    ? fill(t.bannerBody, { village: villageName, pct: formatPercent(pct) })
    : fill(t.bannerBodyNoData, { village: villageName });

  const green = '#16A34A';
  const fg = isDarkMode ? '#f8fafc' : '#0f172a';
  const muted = isDarkMode ? '#94a3b8' : '#475569';

  return (
    <Box
      component="section"
      aria-label={t.bannerTitle}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: compact ? '18px' : '22px',
        border: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : alpha(green, 0.25),
        bgcolor: isDarkMode ? 'rgba(22,163,74,0.08)' : alpha(green, 0.05),
        p: compact ? 2.25 : { xs: 2.5, md: 3.5 },
      }}
    >
      <Stack direction={{ xs: 'column', md: compact ? 'column' : 'row' }} spacing={compact ? 2 : { xs: 2.5, md: 4 }} sx={{ alignItems: { md: compact ? 'stretch' : 'center' } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '13px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: green, color: '#fff' }}>
            <VolunteerActivismRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: compact ? '1rem' : '1.15rem', color: fg, letterSpacing: '-0.01em', mb: 0.5 }}>{t.bannerTitle}</Typography>
            {loading ? (
              <Skeleton width="80%" height={20} />
            ) : (
              <Typography sx={{ color: muted, fontSize: '0.92rem', lineHeight: 1.55 }}>{body}</Typography>
            )}
          </Box>
        </Stack>

        <Stack spacing={1.25} sx={{ width: { xs: '100%', md: compact ? '100%' : 300 }, flexShrink: 0 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.progressTitle}</Typography>
            <Typography sx={{ fontWeight: 700, color: fg }}>{loading ? '…' : `${formatPercent(pct)}%`}</Typography>
          </Stack>
          <LinearProgress
            variant={loading ? 'indeterminate' : 'determinate'}
            value={pct > 0 ? Math.max(pct, 2) : 0}
            aria-label={t.progressTitle}
            sx={{ height: 8, borderRadius: 999, bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : alpha(green, 0.14), '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: green } }}
          />
          <Button
            variant="contained"
            disableElevation
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={isAuthenticated ? onContribute : onJoin}
            sx={{
              mt: 0.5,
              py: 1.1,
              borderRadius: '11px',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: green,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#15803D', boxShadow: 'none', transform: 'none' },
            }}
          >
            {isAuthenticated ? t.bannerCta : t.bannerCtaGuest}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ContributeBanner;
