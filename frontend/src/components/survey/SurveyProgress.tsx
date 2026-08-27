import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { T } from './SurveyKit';

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

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.lineSoft}`,
        px: { xs: 2, sm: 3.5 },
        pt: { xs: 2, sm: 2.5 },
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Header row: icon + section title + counter */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: 42, sm: 48 },
            height: { xs: 42, sm: 48 },
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
            color: '#fff',
            boxShadow: '0 6px 16px rgba(37,99,235,0.30)',
            '& .MuiSvgIcon-root': { fontSize: { xs: '1.35rem', sm: '1.5rem' } },
            animation: 'sk-fade .4s ease both',
          }}
        >
          {active?.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.brand,
              lineHeight: 1,
              mb: 0.4,
            }}
          >
            {`Section ${current + 1} / ${total}`}
          </Typography>
          <Typography
            noWrap
            sx={{ fontSize: { xs: '1.02rem', sm: '1.18rem' }, fontWeight: 800, color: T.ink, lineHeight: 1.25 }}
          >
            {active?.title}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
          <Typography sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' }, fontWeight: 900, color: T.accent, lineHeight: 1 }}>
            {pct}
            <Box component="span" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>%</Box>
          </Typography>
        </Box>
      </Box>

      {/* Progress track */}
      <Box sx={{ position: 'relative', height: 7, borderRadius: 999, bgcolor: T.lineSoft, overflow: 'hidden', mb: 1.5 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${T.accent} 0%, #34d399 100%)`,
            transition: 'width .45s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </Box>

      {/* Step dots — clickable up to the furthest reached section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { height: 0 },
          scrollbarWidth: 'none',
        }}
      >
        {sections.map((s, i) => {
          const done = i < current;
          const isCurrent = i === current;
          const reachable = i <= maxReached;
          return (
            <Tooltip key={i} title={s.short} arrow>
              <Box
                role="button"
                aria-label={s.short}
                onClick={() => reachable && onJump(i)}
                sx={{
                  flexShrink: 0,
                  cursor: reachable ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isCurrent ? 30 : 26,
                  height: isCurrent ? 30 : 26,
                  borderRadius: '9px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  transition: 'all .2s ease',
                  color: isCurrent ? '#fff' : done ? '#fff' : reachable ? T.muted : T.faint,
                  bgcolor: isCurrent ? T.brand : done ? T.accent : reachable ? '#fff' : '#f1f5f9',
                  border: `1.5px solid ${isCurrent ? T.brand : done ? T.accent : T.line}`,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.14)' : 'none',
                  '&:hover': reachable && !isCurrent ? { borderColor: T.brand, color: T.brand } : {},
                }}
              >
                {done ? <CheckRoundedIcon sx={{ fontSize: '0.95rem' }} /> : i + 1}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default SurveyProgress;
