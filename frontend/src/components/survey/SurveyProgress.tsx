import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { T, useEdgeFadeMask } from './SurveyKit';

export type SurveySection = {
  icon: React.ReactNode;
  title: string;
  short: string;
};

const SurveyProgress: React.FC<{
  sections: SurveySection[];
  current: number;
  maxReached: number;
  onJump: (i: number) => void;
}> = ({ sections, current, maxReached, onJump }) => {
  const total = sections.length;
  const pct = Math.round(((current + 1) / total) * 100);
  const active = sections[current];
  const dotsRef = React.useRef<HTMLDivElement | null>(null);
  const dotsMask = useEdgeFadeMask(dotsRef);

  /* With 14 sections the dot rail overflows a phone screen, so bring the
     active step back into view whenever it changes. */
  React.useEffect(() => {
    const rail = dotsRef.current;
    const dot = rail?.querySelector(`[data-step="${current}"]`);
    if (!rail || !dot) return;
    const r = rail.getBoundingClientRect();
    const d = dot.getBoundingClientRect();
    if (d.left < r.left || d.right > r.right) {
      rail.scrollTo({
        left: rail.scrollLeft + (d.left - r.left) - r.width / 2 + d.width / 2,
        behavior: 'smooth',
      });
    }
  }, [current]);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        bgcolor: T.surface,
        borderBottom: `1px solid ${T.lineSoft}`,
        px: { xs: 2, sm: 3.5 },
        pt: { xs: 2, sm: 2.5 },
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Header row: icon + section title + progress % */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: T.brand,
            color: '#fff',
            boxShadow: '0 1px 3px rgba(15,23,42,0.12)',
            '& .MuiSvgIcon-root': { fontSize: { xs: '1.25rem', sm: '1.35rem' } },
            animation: 'sk-fade .4s ease both',
          }}
        >
          {active?.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontSize: { xs: '1.02rem', sm: '1.15rem' }, fontWeight: 800, color: T.ink, lineHeight: 1.3 }}
          >
            {active?.title}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
          <Typography sx={{ fontSize: { xs: '1.05rem', sm: '1.2rem' }, fontWeight: 700, color: T.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {pct}<Box component="span" sx={{ fontSize: '0.7rem', fontWeight: 600, color: T.muted }}>%</Box>
          </Typography>
        </Box>
      </Box>

      {/* Progress track */}
      <Box sx={{ position: 'relative', height: 3, borderRadius: 0, bgcolor: T.lineSoft, overflow: 'hidden', mb: 1.5 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            borderRadius: 0,
            bgcolor: T.accent,
            transition: 'width .45s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </Box>

      {/* Step dots — clickable up to the furthest reached section */}
      <Box
        ref={dotsRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 0.75 },
          overflowX: 'auto',
          /* Stop a sideways flick here from triggering browser back-nav. */
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
          pb: 0.5,
          '&::-webkit-scrollbar': { height: 0 },
          scrollbarWidth: 'none',
          maskImage: dotsMask,
          WebkitMaskImage: dotsMask,
        }}
      >
        {sections.map((s, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const reachable = i <= maxReached;
          return (
            <Tooltip key={i} title={s.short} arrow>
              {/* Padded wrapper carries the tap area (>=44px on touch) while the
                  inner chip keeps its compact visual size. */}
              <Box
                role="button"
                tabIndex={reachable ? 0 : -1}
                aria-label={s.short}
                aria-current={isCurrent ? 'step' : undefined}
                data-step={i}
                onClick={() => reachable && onJump(i)}
                onKeyDown={(e) => { if (reachable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onJump(i); } }}
                sx={{
                  flexShrink: 0,
                  cursor: reachable ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: { xs: 44, sm: 'auto' },
                  minHeight: { xs: 44, sm: 'auto' },
                  px: { xs: 0.25, sm: 0 },
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isCurrent ? { xs: 32, sm: 28 } : { xs: 28, sm: 24 },
                    height: isCurrent ? { xs: 32, sm: 28 } : { xs: 28, sm: 24 },
                    borderRadius: 0,
                    fontSize: { xs: '0.75rem', sm: '0.7rem' },
                    fontWeight: 800,
                    transition: 'all .2s ease',
                    color: isCurrent ? '#fff' : done ? '#fff' : reachable ? T.muted : T.faint,
                    bgcolor: isCurrent ? T.brand : done ? T.accent : reachable ? '#fff' : '#f1f5f9',
                    border: `1.5px solid ${isCurrent ? T.brand : done ? T.accent : T.line}`,
                    '@media (hover: hover)': {
                      '&:hover': reachable && !isCurrent ? { borderColor: T.brand, color: T.brand } : {},
                    },
                  }}
                >
                  {done ? <CheckRoundedIcon sx={{ fontSize: '0.95rem' }} /> : i + 1}
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default SurveyProgress;
