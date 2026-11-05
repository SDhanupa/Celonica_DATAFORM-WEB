import React, { useEffect } from 'react';
import { Alert, Box, Button, ButtonBase, CircularProgress, Container, Skeleton, Stack, Typography } from '@mui/material';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';
import PlayArrowSharpIcon from '@mui/icons-material/PlayArrowSharp';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import type { DecksResponse, RapidFireDeck } from './api';
import { FOREST, LINE, pageTitleSx, rowSx, sectionTitleSx, squareButton, TEXT, TEXT_SOFT } from './Backdrop';

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
  const { t, language } = useContributeCopy();
  const rules = decks?.rules;
  const busy = startingDeck !== null;
  const canMix = !busy && !loading && (decks?.remaining ?? 0) > 0;

  // Enter starts Quick Mix, unless focus is on a control that handles Enter itself.
  useEffect(() => {
    if (!canMix) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && el !== document.body && el.closest('button, a, input, select, textarea, [role="button"], [role="menuitem"]')) return;
      e.preventDefault();
      onStart('mix');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canMix, onStart]);

  // Cleared decks go last so the next playable one is always first.
  const ordered = decks ? [...decks.decks].sort((a, b) => Number(a.remaining === 0) - Number(b.remaining === 0)) : [];
  const cleared = decks ? decks.decks.filter((d) => d.remaining === 0).length : 0;
  const pct = decks && decks.total > 0 ? (decks.answered / decks.total) * 100 : 0;

  return (
    <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3, md: 5 }, pb: { xs: 6, md: 10 } }}>
      <Typography component="h1" sx={pageTitleSx(language)}>
        {t.rfTitle}
      </Typography>
      <Typography sx={{ color: TEXT_SOFT, fontSize: '1rem', lineHeight: 1.65, maxWidth: 620, mt: 1.5 }}>
        {villageName ? fill(t.rfTagline, { village: villageName }) : t.rfTaglineNoVillage}
      </Typography>
      {rules && (
        <Typography sx={{ color: TEXT, fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.6, mt: 1 }}>
          {[fill(t.rfRuleCards, { n: rules.session_size }), fill(t.rfRuleSeconds, { n: rules.seconds_per_question }), t.rfRuleBonus].join(' · ')}
        </Typography>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 2 }} sx={{ alignItems: { sm: 'center' }, mt: { xs: 2, sm: 3 } }}>
        <Button
          onClick={() => onStart('mix')}
          disabled={!canMix}
          startIcon={startingDeck === 'mix' ? <CircularProgress size={18} color="inherit" /> : <PlayArrowSharpIcon />}
          sx={{ ...squareButton, alignSelf: { sm: 'flex-start' } }}
        >
          {t.rfStart} · {t.rfMix}
        </Button>
        <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem' }}>
          {t.rfMixHint}
          {decks ? ` · ${fill(t.rfLeft, { n: decks.remaining })}` : ''}
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>{canMix ? ` · ${t.rfPressStart}` : ''}</Box>
        </Typography>
      </Stack>

      {/* How much of the village has been checked: the reason to play another round. */}
      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        {decks ? (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'baseline' }, justifyContent: 'space-between', columnGap: 2 }}>
              <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: { xs: '1.375rem', sm: '1.5rem' }, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' }}>
                {t.rfMapped}: {Math.round(pct)}%
              </Typography>
              <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                {decks.answered.toLocaleString()} / {decks.total.toLocaleString()} · {fill(t.rfDecksCleared, { n: cleared, total: decks.decks.length })}
              </Typography>
            </Stack>
            <Box role="progressbar" aria-label={t.rfMapped} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} sx={{ height: 8, mt: 1, bgcolor: LINE }}>
              <Box sx={{ height: '100%', width: `${pct > 0 ? Math.max(pct, 2) : 0}%`, bgcolor: FOREST }} />
            </Box>
          </>
        ) : (
          !loadError && (
            <>
              <Skeleton width={220} height={36} />
              <Skeleton variant="rectangular" height={8} sx={{ mt: 1 }} />
            </>
          )
        )}
      </Box>

      {notice && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {notice}
        </Alert>
      )}

      {loadError ? (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              {t.retry}
            </Button>
          }
        >
          {t.rfDecksError}
        </Alert>
      ) : (
        <Box component="section" aria-labelledby="decks-title" sx={{ mt: { xs: 4, md: 6 } }}>
          <Typography id="decks-title" component="h2" sx={sectionTitleSx(language)}>
            {t.rfChooseDeck}
          </Typography>
          <Typography sx={{ display: { xs: 'none', md: 'block' }, color: TEXT_SOFT, fontSize: '0.875rem', mt: 0.5 }}>{t.rfKeysHint}</Typography>

          {loading || !decks ? (
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={64} />
              ))}
            </Stack>
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 2, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, columnGap: 4, borderBottom: `1px solid ${LINE}` }}>
              {ordered.map((deck) => (
                <Box component="li" key={deck.slug}>
                  <DeckRow deck={deck} onStart={onStart} disabled={busy} starting={startingDeck === deck.slug} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

const DeckRow: React.FC<{ deck: RapidFireDeck; onStart: (deck: string) => void; disabled: boolean; starting: boolean }> = ({ deck, onStart, disabled, starting }) => {
  const { t, language } = useContributeCopy();
  const { Icon } = getCategoryVisual({ slug: deck.slug, nameEn: deck.name_en });
  const done = deck.remaining === 0;
  const pct = deck.total > 0 ? (deck.answered / deck.total) * 100 : 0;
  const name = localName(deck, language);
  const status = done ? t.rfDone : fill(t.rfLeft, { n: deck.remaining });

  return (
    <ButtonBase
      onClick={() => onStart(deck.slug)}
      disabled={disabled || done}
      aria-label={`${name}. ${status}`}
      sx={{ ...rowSx, display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 24px', columnGap: 1.5, alignItems: 'center' }}
    >
      <Icon sx={{ fontSize: 22, color: TEXT_SOFT }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography component="span" sx={{ display: 'block', color: TEXT, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 }}>{name}</Typography>
        <Typography component="span" sx={{ display: 'block', color: done ? FOREST : TEXT_SOFT, fontSize: '0.8125rem', fontWeight: done ? 600 : 400, lineHeight: 1.4, mb: 0.5 }}>{status}</Typography>
        <Box aria-hidden sx={{ height: 4, bgcolor: LINE }}>
          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: FOREST }} />
        </Box>
      </Box>
      {starting ? <CircularProgress size={18} /> : done ? <CheckSharpIcon sx={{ fontSize: 20, color: FOREST }} /> : <PlayArrowSharpIcon sx={{ fontSize: 22, color: TEXT }} />}
    </ButtonBase>
  );
};

export default Lobby;
