import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import type { CompleteResponse, RapidFireCard, RapidFireRules } from './api';
import { rankFor } from './scoring';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface ResultsProps {
  summary: CompleteResponse | null;
  score: number;
  bestStreak: number;
  cardsCount: number;
  rules: RapidFireRules;
  villageName: string;
  error: string | null;
  onPlayAgain: () => void;
  onOtherDeck: () => void;
  onBack: () => void;
  onAddDetails: (card: RapidFireCard) => void;
}

const Results: React.FC<ResultsProps> = ({ summary, score, bestStreak, cardsCount, rules, villageName, error, onPlayAgain, onOtherDeck, onBack, onAddDetails }) => {
  const { t, language } = useContributeCopy();
  const finalScore = summary?.score ?? score;
  const shown = useCountUp(finalScore);
  const rank = rankFor(finalScore, cardsCount, rules);
  const checked = summary ? summary.yes + summary.no - summary.hasty : 0;

  return (
    <Box sx={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', background: 'radial-gradient(120% 80% at 50% 0%, #1F4FA8 0%, #0F2B63 45%, #0A1A3D 100%)', px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}>
      {finalScore > 0 && <Confetti />}

      <Box sx={{ maxWidth: 620, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', color: '#fff', mb: 3 }}>
          <Box sx={{ width: 76, height: 76, mx: 'auto', mb: 2, borderRadius: '24px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', color: '#78350F', boxShadow: '0 16px 36px rgba(245,158,11,0.45)' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 42 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.8rem', color: '#FCD34D' }}>{t[rank]}</Typography>
          <Typography component="h1" sx={{ color: 'inherit', fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.2rem' }, letterSpacing: '-0.03em' }}>
            {t.rfResultsTitle}
          </Typography>
          <Typography sx={{ color: 'inherit', fontWeight: 900, fontSize: { xs: '4rem', sm: '5rem' }, lineHeight: 1, my: 1, fontVariantNumeric: 'tabular-nums' }} aria-label={`${t.rfScore} ${finalScore}`}>
            {shown}
          </Typography>
          {summary && villageName && <Typography sx={{ color: 'inherit', opacity: 0.85 }}>{fill(t.rfResultsBody, { n: checked, village: villageName })}</Typography>}
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '14px' }}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ borderRadius: '24px', p: { xs: 2.5, sm: 3 }, mb: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, textAlign: 'center' }}>
            <Stat label={t.rfBestStreak} value={bestStreak} color="#F59E0B" />
            <Stat label={t.rfYes} value={summary?.yes ?? 0} color="#16A34A" />
            <Stat label={t.rfNo} value={summary?.no ?? 0} color="#E11D48" />
            <Stat label={t.rfSkipped} value={(summary?.skipped ?? 0) + (summary?.unplayed ?? 0)} color="#64748B" />
          </Box>

          {summary && summary.yes_topics.length > 0 && (
            <Box sx={{ mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 800 }}>{t.rfYesTitle}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t.rfYesBody}
              </Typography>
              <Stack spacing={1}>
                {summary.yes_topics.map((card) => {
                  const { Icon, color } = getCategoryVisual({ slug: card.deck_slug, nameEn: card.deck_name_en });
                  return (
                    <Stack key={card.id} direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.25, borderRadius: '14px', bgcolor: 'background.default' }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: alpha(color, 0.12), color, flexShrink: 0 }}>
                        <Icon fontSize="small" />
                      </Box>
                      <Typography sx={{ flex: 1, fontWeight: 600, minWidth: 0 }} noWrap>
                        {localName(card, language)}
                      </Typography>
                      <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => onAddDetails(card)} sx={{ flexShrink: 0, boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none' } }}>
                        {t.rfAddDetails}
                      </Button>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Paper>

        <Stack spacing={1}>
          <Button
            onClick={onPlayAgain}
            startIcon={<ReplayRoundedIcon />}
            fullWidth
            sx={{ py: 1.6, borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', color: '#78350F', background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', boxShadow: '0 12px 28px rgba(245,158,11,0.4)', '&:hover': { filter: 'brightness(1.05)', boxShadow: '0 16px 32px rgba(245,158,11,0.5)' } }}
          >
            {t.rfPlayAgain}
          </Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button onClick={onOtherDeck} startIcon={<GridViewRoundedIcon />} fullWidth sx={{ py: 1.25, borderRadius: '14px', color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', boxShadow: 'none', transform: 'none' } }}>
              {t.rfOtherDeck}
            </Button>
            <Button onClick={onBack} fullWidth sx={{ py: 1.25, borderRadius: '14px', color: 'rgba(255,255,255,0.85)', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', boxShadow: 'none', transform: 'none' } }}>
              {t.rfBackToContribute}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

const Stat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <Box sx={{ py: 1.25, borderRadius: '14px', bgcolor: alpha(color, 0.08) }}>
    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color, lineHeight: 1.1 }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
      {label}
    </Typography>
  </Box>
);

function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Frames stop when the window is not being drawn; always land on the real score.
    const settle = setTimeout(() => setValue(target), durationMs + 100);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [target, durationMs]);
  return value;
}

const fall = keyframes`
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate3d(var(--drift), 105vh, 0) rotate(var(--spin)); opacity: 0.9; }
`;

const CONFETTI_COLORS = ['#FCD34D', '#16A34A', '#38BDF8', '#F472B6', '#FB923C', '#A78BFA'];

const Confetti: React.FC = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        drift: `${(Math.random() - 0.5) * 30}vw`,
        spin: `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540)}deg`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        round: Math.random() > 0.6,
      })),
    [],
  );
  if (prefersReducedMotion()) return null;
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <Box
          key={i}
          style={{ ['--drift' as string]: p.drift, ['--spin' as string]: p.spin } as React.CSSProperties}
          sx={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            borderRadius: p.round ? '50%' : '2px',
            bgcolor: p.color,
            animation: `${fall} ${p.duration}s cubic-bezier(.25,.46,.45,.94) ${p.delay}s both`,
          }}
        />
      ))}
    </Box>
  );
};

export default Results;
