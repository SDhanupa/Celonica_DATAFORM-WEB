import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, IconButton, InputBase, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { ink, focusRing } from '../contribute/tokens';
import { Ambient, EASE, fadeUp, slideInLeft, slideInRight } from '../contribute/motion';
import type { RapidFireCard } from './api';

const MAX = 100000;
const QUICK_PICKS = [1, 2, 3, 5, 10, 20];

interface CountSurveyProps {
  cards: RapidFireCard[];
  villageName: string;
  onSubmit: (counts: { category_id: number; count: number }[]) => Promise<void>;
  onClose: () => void;
}

const CountSurvey: React.FC<CountSurveyProps> = ({ cards, villageName, onSubmit, onClose }) => {
  const { t, language } = useContributeCopy();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'back'>('next');
  const [counts, setCounts] = useState<Record<number, number | null>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const card = cards[index];
  const isLast = index === cards.length - 1;
  const value = card ? counts[card.id] ?? null : null;

  useEffect(() => {
    if (window.matchMedia?.('(pointer: fine)').matches) inputRef.current?.focus();
  }, [index]);

  const setValue = (next: number | null) => {
    if (!card) return;
    const clamped = next === null ? null : Math.max(0, Math.min(MAX, Math.round(next)));
    setCounts((prev) => ({ ...prev, [card.id]: clamped === 0 ? null : clamped }));
  };

  const submit = async (snapshot = counts) => {
    if (saving) return;
    const payload = cards
      .map((c) => ({ category_id: c.id, count: snapshot[c.id] ?? 0 }))
      .filter((row) => row.count > 0);
    if (payload.length === 0) {
      setSavedCount(0);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(payload);
      setSavedCount(payload.length);
    } catch {
      setError(t.rfCountError);
    } finally {
      setSaving(false);
    }
  };

  const go = (step: 1 | -1) => {
    if (step === 1 && isLast) {
      submit();
      return;
    }
    setDirection(step === 1 ? 'next' : 'back');
    setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + step)));
  };

  const skip = () => {
    if (!card || saving) return;
    const nextCounts = { ...counts, [card.id]: null };
    setCounts(nextCounts);
    if (isLast) void submit(nextCounts);
    else go(1);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${ink[800]} 0%, ${ink[900]} 60%)`,
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
        isolation: 'isolate',
      }}
    >
      <Ambient />
      <Box sx={{ maxWidth: 560, mx: 'auto', position: 'relative', zIndex: 1 }}>
        {savedCount !== null ? (
          <Done savedCount={savedCount} villageName={villageName} onClose={onClose} />
        ) : (
          <>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', color: '#fff', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
                {fill(t.rfCountStep, { i: index + 1, n: cards.length })}
              </Typography>
              <IconButton onClick={onClose} aria-label={t.rfCountToResults} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }, ...focusRing }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={((index + 1) / cards.length) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.12)',
                '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 2, transition: `transform 500ms ${EASE}` },
              }}
            />

            {index === 0 && (
              <Box sx={{ color: '#fff', mb: 3, animation: `${fadeUp} 600ms ${EASE} both` }}>
                <Typography component="h1" sx={{ color: 'inherit', fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2rem' }, letterSpacing: '-0.03em', mb: 0.5 }}>
                  {t.rfCountTitle}
                </Typography>
                <Typography sx={{ color: 'inherit', opacity: 0.7 }}>{fill(t.rfCountIntro, { village: villageName })}</Typography>
              </Box>
            )}

            {error && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '14px' }}>
                {error}
              </Alert>
            )}

            {card && (
              <Paper
                key={card.id}
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  p: { xs: 2.5, sm: 3.5 },
                  mb: 2,
                  animation: `${direction === 'next' ? slideInRight : slideInLeft} 450ms ${EASE} both`,
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                <TopicHeader card={card} language={language} />

                <Typography sx={{ fontWeight: 700, color: ink[600], mt: 3, mb: 1.5, textAlign: 'center' }}>
                  {fill(t.rfCountQuestion, { village: villageName })}
                </Typography>

                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <StepButton label={t.rfCountDecrease} disabled={!value} onClick={() => setValue((value ?? 0) - 1)}>
                    <RemoveRoundedIcon />
                  </StepButton>
                  <InputBase
                    inputRef={inputRef}
                    value={value ?? ''}
                    placeholder="0"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setValue(digits === '' ? null : Number(digits));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') go(1);
                      if (e.key === 'ArrowUp') { e.preventDefault(); setValue((value ?? 0) + 1); }
                      if (e.key === 'ArrowDown') { e.preventDefault(); setValue((value ?? 0) - 1); }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': fill(t.rfCountQuestion, { village: villageName }), maxLength: 6 }}
                    sx={{
                      width: 140,
                      '& input': {
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '3rem',
                        lineHeight: 1.1,
                        color: ink[900],
                        fontVariantNumeric: 'tabular-nums',
                        py: 1,
                        borderRadius: '16px',
                        bgcolor: ink[50],
                        border: `1px solid ${ink[100]}`,
                        transition: 'border-color 200ms ease, background-color 200ms ease',
                        '&:focus': { borderColor: ink[900], bgcolor: '#fff' },
                        '&::placeholder': { color: ink[300], opacity: 1 },
                      },
                    }}
                  />
                  <StepButton label={t.rfCountIncrease} disabled={(value ?? 0) >= MAX} onClick={() => setValue((value ?? 0) + 1)}>
                    <AddRoundedIcon />
                  </StepButton>
                </Stack>

                <Stack direction="row" sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2.5 }}>
                  {QUICK_PICKS.map((n) => {
                    const active = value === n;
                    return (
                      <Button
                        key={n}
                        onClick={() => setValue(n)}
                        aria-pressed={active}
                        sx={{
                          minWidth: 48,
                          px: 1.5,
                          py: 0.6,
                          borderRadius: 999,
                          fontWeight: 700,
                          boxShadow: 'none',
                          border: `1px solid ${active ? ink[900] : ink[200]}`,
                          bgcolor: active ? ink[900] : 'transparent',
                          color: active ? '#fff' : ink[700],
                          '&:hover': { boxShadow: 'none', transform: 'none', bgcolor: active ? ink[700] : ink[50] },
                          ...focusRing,
                        }}
                      >
                        {n === 20 ? '20+' : n}
                      </Button>
                    );
                  })}
                </Stack>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button onClick={skip} sx={{ color: ink[500], boxShadow: 'none', '&:hover': { bgcolor: ink[50], boxShadow: 'none', transform: 'none' }, ...focusRing }}>
                    {t.rfCountSkip}
                  </Button>
                </Box>
              </Paper>
            )}

            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => go(-1)}
                disabled={index === 0 || saving}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{
                  flex: '0 0 auto',
                  px: 2.5,
                  py: 1.4,
                  borderRadius: '16px',
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.16)', boxShadow: 'none', transform: 'none' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                {t.rfCountBack}
              </Button>
              <Button
                onClick={() => go(1)}
                disabled={saving}
                fullWidth
                endIcon={isLast ? <CheckRoundedIcon /> : <ArrowForwardRoundedIcon />}
                sx={{
                  py: 1.4,
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '1.02rem',
                  bgcolor: '#fff',
                  color: ink[900],
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: ink[50], boxShadow: '0 12px 28px rgba(0,0,0,0.25)', transform: 'none' },
                  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.6)', color: ink[600] },
                }}
              >
                {saving ? t.rfCountSaving : isLast ? t.rfCountFinish : t.rfCountNext}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
};

const TopicHeader: React.FC<{ card: RapidFireCard; language: 'en' | 'si' | 'ta' }> = ({ card, language }) => {
  const { Icon } = getCategoryVisual({ slug: card.deck_slug, nameEn: card.deck_name_en });
  const context = language === 'si' ? card.context_si : language === 'ta' ? card.context_ta : card.context_en;
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <Box sx={{ width: 56, height: 56, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[700] }}>
        <Icon />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.45rem' }, color: ink[900], letterSpacing: '-0.02em', lineHeight: 1.25 }}>
        {localName(card, language)}
      </Typography>
      {context && (
        <Typography variant="body2" sx={{ color: ink[500], maxWidth: 400 }}>
          {context}
        </Typography>
      )}
    </Stack>
  );
};

const StepButton: React.FC<{ label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }> = ({ label, disabled, onClick, children }) => (
  <IconButton
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    sx={{
      width: 52,
      height: 52,
      border: `1px solid ${ink[200]}`,
      color: ink[900],
      transition: `transform 200ms ${EASE}, background-color 200ms ease`,
      '&:hover': { bgcolor: ink[50] },
      '&:active': { transform: 'scale(0.92)' },
      '&.Mui-disabled': { color: ink[300], borderColor: ink[100] },
      ...focusRing,
    }}
  >
    {children}
  </IconButton>
);

const Done: React.FC<{ savedCount: number; villageName: string; onClose: () => void }> = ({ savedCount, villageName, onClose }) => {
  const { t } = useContributeCopy();
  return (
    <Box sx={{ textAlign: 'center', color: '#fff', pt: { xs: 6, sm: 10 }, animation: `${fadeUp} 600ms ${EASE} both` }}>
      <Box sx={{ width: 76, height: 76, mx: 'auto', mb: 2, borderRadius: '24px', display: 'grid', placeItems: 'center', bgcolor: '#fff', color: ink[900] }}>
        <CheckRoundedIcon sx={{ fontSize: 42 }} />
      </Box>
      <Typography component="h1" sx={{ color: 'inherit', fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.2rem' }, letterSpacing: '-0.03em', mb: 1 }}>
        {t.rfCountDoneTitle}
      </Typography>
      <Typography sx={{ color: 'inherit', opacity: 0.7, mb: 4 }}>
        {savedCount > 0 ? fill(t.rfCountDoneBody, { n: savedCount, village: villageName }) : t.rfCountDoneNone}
      </Typography>
      <Button
        onClick={onClose}
        fullWidth
        sx={{
          py: 1.6,
          borderRadius: '16px',
          fontWeight: 800,
          fontSize: '1.05rem',
          bgcolor: '#fff',
          color: ink[900],
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          '&:hover': { bgcolor: ink[50], boxShadow: '0 12px 28px rgba(0,0,0,0.25)', transform: 'none' },
        }}
      >
        {t.rfCountToResults}
      </Button>
    </Box>
  );
};

export default CountSurvey;
