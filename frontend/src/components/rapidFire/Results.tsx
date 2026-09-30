import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { ink } from '../contribute/tokens';
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
    <Box sx={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', background: `linear-gradient(180deg, ${ink[800]} 0%, ${ink[900]} 60%)`, px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}>
      {finalScore > 0 && <Confetti />}

      <Box sx={{ maxWidth: 600, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', color: '#fff', mb: 3 }}>
          <Box sx={{ width: 68, height: 68, mx: 'auto', mb: 2, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: '#fff', color: ink[900], boxShadow: '0 16px 36px rgba(0,0,0,0.3)' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{t[rank]}</Typography>
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

        <Paper elevation={0} sx={{ borderRadius: '16px', p: { xs: 2.5, sm: 3 }, mb: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, textAlign: 'center' }}>
            <Stat label={t.rfBestStreak} value={bestStreak} />
            <Stat label={t.rfYes} value={summary?.yes ?? 0} />
            <Stat label={t.rfNo} value={summary?.no ?? 0} />
            <Stat label={t.rfSkipped} value={(summary?.skipped ?? 0) + (summary?.unplayed ?? 0)} muted />
          </Box>

          {summary && summary.yes_topics.length > 0 && (
            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: ink[100] }}>
              <Typography sx={{ fontWeight: 700, color: ink[900] }}>{t.rfYesTitle}</Typography>
              <Typography variant="body2" sx={{ color: ink[500], mb: 1.5 }}>
                {t.rfYesBody}
              </Typography>
              <Stack spacing={1}>
                {summary.yes_topics.map((card) => {
                  const { Icon } = getCategoryVisual({ slug: card.deck_slug, nameEn: card.deck_name_en });
                  return (
                    <Stack key={card.id} direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.25, borderRadius: '10px', bgcolor: ink[50] }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: '9px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[700], flexShrink: 0 }}>
                        <Icon fontSize="small" />
                      </Box>
                      <Typography sx={{ flex: 1, fontWeight: 600, minWidth: 0, color: ink[900] }} noWrap>
                        {localName(card, language)}
                      </Typography>
                      <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onAddDetails(card)} sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 600, color: ink[700], border: '1px solid', borderColor: ink[200], boxShadow: 'none', '&:hover': { boxShadow: 'none', transform: 'none', bgcolor: ink[50], borderColor: ink[300] } }}>
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
            sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1.02rem', textTransform: 'none', color: ink[900], bgcolor: '#fff', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 'none', transform: 'none' } }}
          >
            {t.rfPlayAgain}
          </Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button onClick={onOtherDeck} startIcon={<GridViewRoundedIcon />} fullWidth sx={{ py: 1.15, borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', boxShadow: 'none', transform: 'none' } }}>
              {t.rfOtherDeck}
            </Button>
            <Button onClick={onBack} fullWidth sx={{ py: 1.15, borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: 'rgba(255,255,255,0.8)', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', boxShadow: 'none', transform: 'none' } }}>
              {t.rfBackToContribute}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

const Stat: React.FC<{ label: string; value: number; muted?: boolean }> = ({ label, value, muted }) => (
  <Box sx={{ py: 1.25, borderRadius: '10px', bgcolor: ink[50] }}>
    <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: muted ? ink[400] : ink[900], lineHeight: 1.1 }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: ink[500], fontWeight: 500 }} noWrap>
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

// Monochrome celebration: white and greys, no rainbow.
const CONFETTI_COLORS = ['#FFFFFF', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.35)'];

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
