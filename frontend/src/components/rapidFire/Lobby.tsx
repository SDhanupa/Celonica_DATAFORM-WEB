import React from 'react';
import { Alert, Box, Button, ButtonBase, Chip, CircularProgress, Container, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { ink, reducedMotion } from '../contribute/tokens';
import { Ambient, EASE, enter, floatY, lift, Reveal, sheenOnHover, spotlight, spotlightMove } from '../contribute/motion';
import type { DecksResponse, RapidFireDeck } from './api';

interface LobbyProps {
  villageName: string;
  decks: DecksResponse | null;
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  onStart: (deck: string) => void;
  startingDeck: string | null;
  notice: string | null;
}

const Lobby: React.FC<LobbyProps> = ({ villageName, decks, loading, loadError, onRetry, onStart, startingDeck, notice }) => {
  const { t } = useContributeCopy();
  const rules = decks?.rules;
  const busy = startingDeck !== null;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3.5, md: 6 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, md: 4 }} sx={{ ...enter(0), alignItems: { md: 'flex-end' }, mb: { xs: 3, md: 4 } }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '15px',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                bgcolor: ink[900],
                boxShadow: '0 12px 28px -10px rgba(10,12,15,.55)',
                animation: `${floatY} 3.2s ease-in-out infinite`,
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }}
            >
              <BoltRoundedIcon />
            </Box>
            <Typography component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: ink[900] }}>
              {t.rfTitle}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: '0.98rem', sm: '1.08rem' }, maxWidth: 600, lineHeight: 1.6, color: ink[500] }}>
            {villageName ? fill(t.rfTagline, { village: villageName }) : t.rfTaglineNoVillage}
          </Typography>
        </Box>

        {rules && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <RuleChip icon={<ShuffleRoundedIcon />} label={fill(t.rfRuleCards, { n: rules.session_size })} />
            <RuleChip icon={<TimerOutlinedIcon />} label={fill(t.rfRuleSeconds, { n: rules.seconds_per_question })} />
            <RuleChip icon={<TrendingUpRoundedIcon />} label={t.rfRuleBonus} />
          </Stack>
        )}
      </Stack>

      {notice && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '14px' }}>
          {notice}
        </Alert>
      )}

      {loadError ? (
        <Alert
          severity="error"
          sx={{ borderRadius: '14px' }}
          action={
            <Button color="inherit" size="small" onClick={onRetry} sx={{ boxShadow: 'none' }}>
              {t.retry}
            </Button>
          }
        >
          {t.rfDecksError}
        </Alert>
      ) : (
        <>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1.5, color: ink[900] }}>
            {t.rfChooseDeck}
          </Typography>

          {/* Featured: quick mix */}
          <ButtonBase
            onClick={() => onStart('mix')}
            disabled={busy || loading || (decks?.remaining ?? 0) === 0}
            aria-label={`${t.rfMix}. ${decks ? fill(t.rfLeft, { n: decks.remaining }) : ''}`}
            sx={{
              width: '100%',
              display: 'block',
              textAlign: 'left',
              borderRadius: '22px',
              mb: 2,
              overflow: 'hidden',
              color: '#fff',
              bgcolor: ink[900],
              position: 'relative',
              isolation: 'isolate',
              ...sheenOnHover,
              ...enter(1),
              transition: `transform 450ms ${EASE}, box-shadow 450ms ${EASE}`,
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 30px 60px -24px rgba(10,12,15,.6)', '& .mix-cta': { gap: 1.25 } },
              '&:focus-visible': { outline: '3px solid', outlineColor: ink[600], outlineOffset: 3 },
              '&.Mui-disabled': { opacity: 0.6 },
              ...reducedMotion,
            }}
          >
            <Ambient />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: { xs: 3, sm: 4 }, alignItems: { sm: 'center' }, position: 'relative', zIndex: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <ShuffleRoundedIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'inherit', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>{t.rfMix}</Typography>
                <Typography sx={{ color: 'inherit', opacity: 0.7 }}>
                  {t.rfMixHint}
                  {decks ? ` · ${fill(t.rfLeft, { n: decks.remaining })}` : ''}
                </Typography>
              </Box>
              <Box
                className="mix-cta"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  transition: `gap 300ms ${EASE}`,
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                  px: 2.25,
                  py: 1.1,
                  borderRadius: 999,
                  bgcolor: '#fff',
                  color: ink[900],
                  fontWeight: 800,
                }}
              >
                {startingDeck === 'mix' ? <CircularProgress size={18} sx={{ color: ink[900] }} /> : <PlayArrowRoundedIcon />}
                {t.rfStart}
              </Box>
            </Stack>
          </ButtonBase>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 1.25, sm: 2 } }}>
            {loading || !decks
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: '18px' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                      </Box>
                    </Stack>
                  </Paper>
                ))
              : decks.decks.map((deck, i) => (
                  <Reveal key={deck.slug} index={i % 9}>
                    <DeckCard deck={deck} onStart={onStart} disabled={busy} starting={startingDeck === deck.slug} />
                  </Reveal>
                ))}
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 3, color: ink[400], display: { xs: 'none', md: 'flex' } }}>
            <KeyboardRoundedIcon fontSize="small" />
            <Typography variant="body2">{t.rfKeysHint}</Typography>
          </Stack>
        </>
      )}
    </Container>
  );
};

const RuleChip: React.FC<{ icon: React.ReactElement; label: string }> = ({ icon, label }) => (
  <Chip
    icon={icon}
    label={label}
    sx={{
      fontWeight: 600,
      bgcolor: '#fff',
      border: 1,
      borderColor: ink[200],
      color: ink[700],
      '& .MuiChip-icon': { color: ink[500], fontSize: 18 },
    }}
  />
);

const DeckCard: React.FC<{ deck: RapidFireDeck; onStart: (deck: string) => void; disabled: boolean; starting: boolean }> = ({ deck, onStart, disabled, starting }) => {
  const { t, language } = useContributeCopy();
  const { Icon } = getCategoryVisual({ slug: deck.slug, nameEn: deck.name_en });
  const done = deck.remaining === 0;
  const pct = deck.total > 0 ? (deck.answered / deck.total) * 100 : 0;
  const name = localName(deck, language);

  return (
    <ButtonBase
      onClick={() => onStart(deck.slug)}
      onPointerMove={spotlightMove}
      disabled={disabled || done}
      aria-label={`${name}. ${done ? t.rfDone : fill(t.rfLeft, { n: deck.remaining })}`}
      sx={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        ...spotlight(),
        ...lift,
        borderRadius: '20px',
        border: `1px solid ${ink[100]}`,
        bgcolor: '#fff',
        p: 2.25,
        '&:hover': { ...lift['&:hover'], borderColor: ink[200], '& .deck-play': { bgcolor: ink[900], color: '#fff', transform: 'scale(1.08)' }, '& .deck-icon': { bgcolor: ink[900], color: '#fff' } },
        '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
        '&.Mui-disabled': { opacity: done ? 0.75 : 0.5 },
        ...reducedMotion,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box className="deck-icon" sx={{ width: 44, height: 44, borderRadius: '13px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[600], flexShrink: 0, transition: 'background-color 250ms ease, color 250ms ease' }}>
          <Icon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: ink[900] }} noWrap>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: done ? ink[400] : ink[500], fontWeight: done ? 600 : 400 }}>
            {done ? t.rfDone : fill(t.rfLeft, { n: deck.remaining })}
          </Typography>
        </Box>
        <Box
          className="deck-play"
          sx={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[600], transition: `background-color 200ms ease, color 200ms ease, transform 350ms ${EASE}`, flexShrink: 0 }}
        >
          {starting ? <CircularProgress size={18} sx={{ color: ink[600] }} /> : done ? <CheckCircleRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
        </Box>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        aria-hidden
        sx={{ height: 6, borderRadius: 999, bgcolor: ink[100], '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: ink[900], transition: `transform 1200ms ${EASE}` } }}
      />
    </ButtonBase>
  );
};

export default Lobby;
