import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { ink } from '../contribute/tokens';
import type { RapidFireAnswer, RapidFireCard, RapidFireRules } from './api';
import type { Feedback, Outcome } from './gameReducer';
import { useCardTimer } from './useCardTimer';

/** Taps within this window of a card appearing are ignored: a double tap must not answer the next card. */
const INPUT_LOCK_MS = 250;
const SWIPE_THRESHOLD_PX = 96;
const EXIT_MS = 320;

// Monochrome: on the dark stage, emphasis comes from white opacity and from
// fill-vs-outline on the answer buttons — never from hue.
const W = {
  full: '#fff',
  strong: 'rgba(255,255,255,0.72)',
  mid: 'rgba(255,255,255,0.4)',
  faint: 'rgba(255,255,255,0.22)',
  track: 'rgba(255,255,255,0.14)',
};

const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.4); }
  45% { opacity: 1; transform: scale(1.12); }
  100% { opacity: 0; transform: scale(1); }
`;
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const floatUp = keyframes`
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.9); }
  20% { opacity: 1; transform: translate(-50%, 0) scale(1.05); }
  100% { opacity: 0; transform: translate(-50%, -48px) scale(1); }
`;
// Exit animations are keyframes, not transitions: the leaving card mounts
// fresh, so a transition would have no "from" state and it would just vanish.
const exitRight = keyframes`
  from { opacity: 1; transform: translateX(0) rotate(0); }
  to { opacity: 0; transform: translateX(130%) rotate(18deg); }
`;
const exitLeft = keyframes`
  from { opacity: 1; transform: translateX(0) rotate(0); }
  to { opacity: 0; transform: translateX(-130%) rotate(-18deg); }
`;
const exitDown = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(40%) scale(0.9); }
`;
const flameBeat = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
`;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface PlayStageProps {
  phase: 'countdown' | 'playing' | 'finishing';
  cards: RapidFireCard[];
  index: number;
  rules: RapidFireRules;
  outcomes: Outcome[];
  score: number;
  streak: number;
  feedback: Feedback | null;
  villageName: string;
  saving: boolean;
  onCountdownDone: () => void;
  onAnswer: (answer: RapidFireAnswer, responseMs: number | null) => void;
  onQuit: () => void;
}

const PlayStage: React.FC<PlayStageProps> = ({ phase, cards, index, rules, outcomes, score, streak, feedback, villageName, saving, onCountdownDone, onAnswer, onQuit }) => {
  const { t, language } = useContributeCopy();
  const durationMs = rules.seconds_per_question * 1000;
  const card = phase === 'playing' ? cards[index] ?? null : null;
  const answeredId = useRef<number | null>(null);
  const [leaving, setLeaving] = useState<{ card: RapidFireCard; dir: 'left' | 'right' | 'down' } | null>(null);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ startX: number; pointerId: number } | null>(null);

  const submit = useCallback(
    (answer: RapidFireAnswer, responseMs: number | null) => {
      if (!card || answeredId.current === card.id) return;
      answeredId.current = card.id;
      setDragX(0);
      drag.current = null;
      setLeaving({ card, dir: answer === 'yes' ? 'right' : answer === 'no' ? 'left' : 'down' });
      onAnswer(answer, responseMs);
    },
    [card, onAnswer],
  );

  const { barRef, secondsLeft, getElapsed } = useCardTimer(durationMs, card?.id ?? null, phase === 'playing', () => submit('skip', durationMs));

  const answer = useCallback(
    (value: RapidFireAnswer) => {
      const elapsed = getElapsed();
      if (elapsed < INPUT_LOCK_MS) return;
      // An answer that lands after the limit is a timeout, whatever the clock
      // state was — the card was no longer answerable.
      if (elapsed >= durationMs) {
        submit('skip', durationMs);
        return;
      }
      submit(value, Math.round(elapsed));
    },
    [durationMs, getElapsed, submit],
  );

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), prefersReducedMotion() ? 0 : EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const map: Record<string, RapidFireAnswer> = { arrowright: 'yes', y: 'yes', arrowleft: 'no', n: 'no', arrowdown: 'unsure', u: 'unsure' };
      if (map[key]) {
        e.preventDefault();
        answer(map[key]);
      } else if (key === 'escape') {
        onQuit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, answer, onQuit]);

  /* ── Swipe ─────────────────────────────────────────────────────────────── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { startX: e.clientX, pointerId: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.current && drag.current.pointerId === e.pointerId) setDragX(e.clientX - drag.current.startX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current || drag.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    drag.current = null;
    if (dx > SWIPE_THRESHOLD_PX) answer('yes');
    else if (dx < -SWIPE_THRESHOLD_PX) answer('no');
    setDragX(0);
  };

  const swipeRatio = Math.max(-1, Math.min(1, dragX / SWIPE_THRESHOLD_PX));

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${ink[800]} 0%, ${ink[900]} 60%)`,
        userSelect: 'none',
      }}
    >
      {/* HUD */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, maxWidth: 720, width: '100%', mx: 'auto' }}>
        <Tooltip title={t.rfQuit}>
          <IconButton onClick={onQuit} aria-label={t.rfQuit} sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' } }}>
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
        <Stack direction="row" spacing={0.5} sx={{ flex: 1 }} role="progressbar" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={outcomes.length}>
          {cards.map((c, i) => {
            const o = outcomes[i];
            const color = !o ? W.track : o.hasty || o.answer === 'skip' ? W.faint : o.answer === 'yes' ? W.full : o.answer === 'no' ? W.strong : W.mid;
            return <Box key={c.id} sx={{ flex: 1, height: 6, borderRadius: 999, bgcolor: color, outline: i === index && phase === 'playing' ? '2px solid rgba(255,255,255,0.7)' : 'none', outlineOffset: 1, transition: 'background-color 200ms ease' }} />;
          })}
        </Stack>
        <Box sx={{ textAlign: 'right', minWidth: 64 }} aria-live="polite">
          <Typography sx={{ color: 'inherit', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>{t.rfScore}</Typography>
          <Typography key={score} sx={{ color: 'inherit', fontWeight: 800, fontSize: '1.35rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {score}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1.5 }}>
        {streak >= 2 && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', px: 1.5, py: 0.5, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700 }}
            aria-label={`${t.rfStreak} ${streak}`}
          >
            <LocalFireDepartmentRoundedIcon sx={{ animation: `${flameBeat} 900ms ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }} />
            <span>
              {t.rfStreak} ×{streak}
            </span>
          </Stack>
        )}
      </Box>

      {/* Card area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 560, minHeight: { xs: 300, sm: 330 } }}>
          {phase === 'countdown' && <Countdown onDone={onCountdownDone} goLabel={t.rfGo} />}

          {phase === 'finishing' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <CircularProgress sx={{ color: '#fff' }} />
            </Box>
          )}

          {leaving && <QuestionCard card={leaving.card} villageName={villageName} language={language} question={t.rfQuestion} exit={leaving.dir} />}

          {card && (
            <Box
              key={card.id}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                drag.current = null;
                setDragX(0);
              }}
              sx={{
                position: 'relative',
                touchAction: 'pan-y',
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                animation: `${cardIn} 260ms ease-out both`,
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }}
            >
              <QuestionCard
                card={card}
                villageName={villageName}
                language={language}
                question={t.rfQuestion}
                dragX={dragX}
                swipeRatio={swipeRatio}
                timerBar={<Box ref={barRef} sx={{ height: '100%', bgcolor: ink[900], opacity: secondsLeft <= 3 ? 0.55 : 1, transformOrigin: 'left center', transition: 'opacity 300ms ease' }} />}
                secondsLeft={secondsLeft}
                yesLabel={t.rfYes}
                noLabel={t.rfNo}
              />
            </Box>
          )}

          {feedback && (
            <Box
              key={feedback.seq}
              aria-hidden
              sx={{
                position: 'absolute',
                top: -12,
                left: '50%',
                zIndex: 5,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                fontWeight: 800,
                fontSize: feedback.points > 0 ? '1.9rem' : '1rem',
                color: feedback.points > 0 ? '#fff' : 'rgba(255,255,255,0.6)',
                textShadow: '0 4px 16px rgba(0,0,0,0.35)',
                animation: `${floatUp} 900ms ease-out both`,
                '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
              }}
            >
              {feedback.hasty ? t.rfTooFast : feedback.answer === 'skip' ? t.rfTimeUp : `+${feedback.points}`}
            </Box>
          )}
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 'max(20px, env(safe-area-inset-bottom))', sm: 4 }, maxWidth: 560, width: '100%', mx: 'auto' }}>
        <Stack direction="row" spacing={1.5}>
          <AnswerButton variant="ghost" icon={<CloseRoundedIcon />} label={t.rfNo} hint="←" disabled={!card} onClick={() => answer('no')} />
          <AnswerButton variant="solid" icon={<CheckRoundedIcon />} label={t.rfYes} hint="→" disabled={!card} onClick={() => answer('yes')} />
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', mt: 1.25, minHeight: 40 }}>
          <Button
            onClick={() => answer('unsure')}
            disabled={!card}
            startIcon={<HelpOutlineRoundedIcon />}
            sx={{ color: 'rgba(255,255,255,0.85)', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', boxShadow: 'none', transform: 'none' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.35)' } }}
          >
            {t.rfUnsure}
          </Button>
          {saving && (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', ml: 1.5, opacity: 0.7 }}>
              <CircularProgress size={12} sx={{ color: '#fff' }} />
              <Typography variant="caption" sx={{ color: 'inherit' }}>{t.rfSaving}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

/* ── Pieces ───────────────────────────────────────────────────────────────── */

const QuestionCard: React.FC<{
  card: RapidFireCard;
  villageName: string;
  language: 'en' | 'si' | 'ta';
  question: string;
  exit?: 'left' | 'right' | 'down';
  dragX?: number;
  swipeRatio?: number;
  timerBar?: React.ReactNode;
  secondsLeft?: number;
  yesLabel?: string;
  noLabel?: string;
}> = ({ card, villageName, language, question, exit, dragX = 0, swipeRatio = 0, timerBar, secondsLeft, yesLabel, noLabel }) => {
  const { Icon, color } = getCategoryVisual({ slug: card.deck_slug, nameEn: card.deck_name_en });
  const name = localName(card, language);
  const context = language === 'si' ? card.context_si || card.context_en : language === 'ta' ? card.context_ta || card.context_en : card.context_en;
  const exitAnimation = exit === 'right' ? exitRight : exit === 'left' ? exitLeft : exitDown;

  return (
    <Box
      sx={{
        position: exit ? 'absolute' : 'relative',
        inset: exit ? 0 : undefined,
        zIndex: exit ? 3 : 2,
        borderRadius: '28px',
        bgcolor: '#fff',
        color: '#0f172a',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(2,8,23,0.45)',
        pointerEvents: exit ? 'none' : 'auto',
        ...(exit
          ? { animation: `${exitAnimation} ${EXIT_MS}ms cubic-bezier(.5,0,.75,0) forwards` }
          : { transform: `translateX(${dragX}px) rotate(${dragX / 22}deg)`, transition: dragX === 0 ? 'transform 200ms ease' : 'none' }),
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', animation: 'none', ...(exit ? { opacity: 0 } : {}) },
      }}
    >
      <Box sx={{ height: 6, bgcolor: 'rgba(15,23,42,0.08)' }}>{timerBar}</Box>

      {/* Swipe stamps */}
      {!exit && (
        <>
          <Stamp label={yesLabel || ''} side="left" opacity={Math.max(0, swipeRatio)} />
          <Stamp label={noLabel || ''} side="right" opacity={Math.max(0, -swipeRatio)} />
        </>
      )}

      <Box sx={{ p: { xs: 3, sm: 4 }, minHeight: { xs: 290, sm: 320 }, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 1.25, py: 0.6, borderRadius: 999, bgcolor: alpha(color, 0.1), color, maxWidth: '75%' }}>
            <Icon sx={{ fontSize: 18 }} />
            <Typography sx={{ color: 'inherit', fontSize: '0.78rem', fontWeight: 700 }} noWrap>
              {card.deck_name_en}
            </Typography>
          </Stack>
          {secondsLeft !== undefined && (
            <Typography sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: secondsLeft <= 3 ? ink[900] : ink[400] }} aria-live="off">
              {secondsLeft}s
            </Typography>
          )}
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          {context && (
            <Typography sx={{ color: ink[400], fontWeight: 600, fontSize: '0.9rem', mb: 1 }} noWrap>
              {context}
            </Typography>
          )}
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', sm: '2.3rem' }, letterSpacing: '-0.03em', lineHeight: 1.12, wordBreak: 'break-word', color: ink[900] }}>
            {name}
          </Typography>
          <Typography sx={{ mt: 2.5, fontWeight: 600, fontSize: '1.05rem', color: ink[500] }}>{fill(question, { village: villageName })}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const Stamp: React.FC<{ label: string; side: 'left' | 'right'; opacity: number }> = ({ label, side, opacity }) => (
  <Box
    aria-hidden
    sx={{
      position: 'absolute',
      top: 28,
      [side]: 20,
      zIndex: 4,
      px: 1.5,
      py: 0.5,
      border: `3px solid ${ink[900]}`,
      borderRadius: '10px',
      color: ink[900],
      fontWeight: 900,
      fontSize: '1.4rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      transform: `rotate(${side === 'left' ? -12 : 12}deg)`,
      opacity,
      pointerEvents: 'none',
    }}
  >
    {label}
  </Box>
);

/** Yes = solid white (primary), No = ghost outline. Fill, not hue, sets emphasis. */
const AnswerButton: React.FC<{ variant: 'solid' | 'ghost'; icon: React.ReactNode; label: string; hint: string; disabled: boolean; onClick: () => void }> = ({ variant, icon, label, hint, disabled, onClick }) => {
  const solid = variant === 'solid';
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      startIcon={icon}
      fullWidth
      sx={{
        py: { xs: 1.75, sm: 2 },
        borderRadius: '14px',
        fontSize: '1.15rem',
        fontWeight: 700,
        textTransform: 'none',
        color: solid ? ink[900] : '#fff',
        bgcolor: solid ? '#fff' : 'transparent',
        border: solid ? '1px solid #fff' : '1px solid rgba(255,255,255,0.4)',
        boxShadow: 'none',
        '& .MuiButton-startIcon svg': { fontSize: 24 },
        '&:hover': { bgcolor: solid ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)', borderColor: '#fff', boxShadow: 'none', transform: 'translateY(-1px)' },
        '&:active': { transform: 'scale(0.98)' },
        '&.Mui-disabled': { color: 'rgba(255,255,255,0.35)', bgcolor: solid ? 'rgba(255,255,255,0.3)' : 'transparent', borderColor: 'rgba(255,255,255,0.14)' },
        '&:focus-visible': { outline: '3px solid #fff', outlineOffset: 3 },
        '@media (prefers-reduced-motion: reduce)': { '&:hover, &:active': { transform: 'none' } },
      }}
    >
      {label}
      <Box component="kbd" sx={{ ml: 1, display: { xs: 'none', md: 'inline' }, fontFamily: 'inherit', fontSize: '0.8rem', opacity: 0.6 }}>
        {hint}
      </Box>
    </Button>
  );
};

const Countdown: React.FC<{ onDone: () => void; goLabel: string }> = ({ onDone, goLabel }) => {
  const steps = ['3', '2', '1', goLabel];
  const [step, setStep] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const stepMs = prefersReducedMotion() ? 350 : 650;
    if (step >= steps.length) {
      onDoneRef.current();
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), stepMs);
    return () => clearTimeout(timer);
  }, [step, steps.length]);

  if (step >= steps.length) return null;
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }} role="status" aria-live="assertive">
      <Typography
        key={step}
        sx={{
          fontWeight: 900,
          fontSize: step === steps.length - 1 ? { xs: '4rem', sm: '5rem' } : { xs: '7rem', sm: '9rem' },
          lineHeight: 1,
          color: '#fff',
          opacity: step === steps.length - 1 ? 0.85 : 1,
          textShadow: '0 12px 40px rgba(0,0,0,0.35)',
          animation: `${popIn} 650ms ease-out both`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        {steps[step]}
      </Typography>
    </Box>
  );
};

export default PlayStage;
