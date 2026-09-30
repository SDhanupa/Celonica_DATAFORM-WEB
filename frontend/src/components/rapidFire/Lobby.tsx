import React from 'react';
import { Alert, Box, Button, ButtonBase, Chip, CircularProgress, Container, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { ink } from '../contribute/tokens';
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

const reducedMotion = { '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } } };

const Lobby: React.FC<LobbyProps> = ({ villageName, decks, loading, loadError, onRetry, onStart, startingDeck, notice }) => {
  const { t } = useContributeCopy();
  const rules = decks?.rules;
  const busy = startingDeck !== null;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3.5, md: 5 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }} sx={{ alignItems: { md: 'flex-end' }, mb: { xs: 3, md: 3.5 } }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.25 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '11px', display: 'grid', placeItems: 'center', color: '#fff', bgcolor: ink[900] }}>
              <BoltRoundedIcon />
            </Box>
            <Typography component="h1" sx={{ fontSize: { xs: '1.7rem', sm: '2.1rem' }, fontWeight: 700, letterSpacing: '-0.035em', color: ink[900] }}>
              {t.rfTitle}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1.02rem' }, color: ink[500], maxWidth: 560, lineHeight: 1.55 }}>
            {villageName ? fill(t.rfTagline, { village: villageName }) : t.rfTaglineNoVillage}
          </Typography>
        </Box>

        {rules && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <RuleChip icon={<ShuffleRoundedIcon />} label={fill(t.rfRuleCards, { n: rules.session_size })} />
            <RuleChip icon={<TimerOutlinedIcon />} label={fill(t.rfRuleSeconds, { n: rules.seconds_per_question })} />
            <RuleChip icon={<TrendingUpRoundedIcon />} label={t.rfRuleBonus} />
          </Stack>
        )}
      </Stack>

      {notice && <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>{notice}</Alert>}

      {loadError ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }} action={<Button color="inherit" size="small" onClick={onRetry} sx={{ textTransform: 'none' }}>{t.retry}</Button>}>
          {t.rfDecksError}
        </Alert>
      ) : (
        <>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: '1.05rem', color: ink[900], mb: 1.5 }}>{t.rfChooseDeck}</Typography>

          {/* Featured: quick mix — single dark card */}
          <ButtonBase
            onClick={() => onStart('mix')}
            disabled={busy || loading || (decks?.remaining ?? 0) === 0}
            aria-label={`${t.rfMix}. ${decks ? fill(t.rfLeft, { n: decks.remaining }) : ''}`}
            sx={{
              width: '100%',
              display: 'block',
              textAlign: 'left',
              borderRadius: '16px',
              mb: 2,
              bgcolor: ink[900],
              color: '#fff',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 16px 36px rgba(10,12,15,0.25)' },
              '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 3 },
              '&.Mui-disabled': { opacity: 0.55 },
              ...reducedMotion,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: { xs: 2.5, sm: 3 }, alignItems: { sm: 'center' } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '13px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <ShuffleRoundedIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'inherit', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{t.rfMix}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t.rfMixHint}
                  {decks ? ` · ${fill(t.rfLeft, { n: decks.remaining })}` : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, alignSelf: { xs: 'flex-start', sm: 'center' }, px: 2.25, py: 1, borderRadius: '999px', bgcolor: '#fff', color: ink[900], fontWeight: 700 }}>
                {startingDeck === 'mix' ? <CircularProgress size={18} /> : <PlayArrowRoundedIcon />}
                {t.rfStart}
              </Box>
            </Stack>
          </ButtonBase>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 1, sm: 1.5 } }}>
            {loading || !decks
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: ink[200] }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '10px' }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" />
                        <Skeleton width="40%" />
                      </Box>
                    </Stack>
                  </Box>
                ))
              : decks.decks.map((deck) => <DeckCard key={deck.slug} deck={deck} onStart={onStart} disabled={busy} starting={startingDeck === deck.slug} />)}
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
  <Chip icon={icon} label={label} sx={{ fontWeight: 600, bgcolor: '#fff', border: '1px solid', borderColor: ink[200], color: ink[700], '& .MuiChip-icon': { color: ink[500], fontSize: 17 } }} />
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
      disabled={disabled || done}
      aria-label={`${name}. ${done ? t.rfDone : fill(t.rfLeft, { n: deck.remaining })}`}
      sx={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: ink[200],
        bgcolor: '#fff',
        p: 2,
        transition: 'border-color 160ms ease, box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { borderColor: ink[300], boxShadow: '0 8px 22px rgba(10,12,15,0.08)', transform: 'translateY(-2px)', '& .deck-play': { bgcolor: ink[900], color: '#fff' } },
        '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
        '&.Mui-disabled': { opacity: done ? 0.7 : 0.5 },
        ...reducedMotion,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '11px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[700], flexShrink: 0 }}>
          <Icon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: ink[900] }} noWrap>{name}</Typography>
          <Typography variant="body2" sx={{ color: done ? ink[700] : ink[500], fontWeight: done ? 600 : 400 }}>
            {done ? t.rfDone : fill(t.rfLeft, { n: deck.remaining })}
          </Typography>
        </Box>
        <Box className="deck-play" sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[700], transition: 'background-color 160ms ease, color 160ms ease', flexShrink: 0 }}>
          {starting ? <CircularProgress size={17} color="inherit" /> : done ? <CheckRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
        </Box>
      </Stack>
      <LinearProgress variant="determinate" value={pct} aria-hidden sx={{ height: 5, borderRadius: 999, bgcolor: ink[100], '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: ink[900] } }} />
    </ButtonBase>
  );
};

export default Lobby;
