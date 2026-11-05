import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import HelpOutlineSharpIcon from '@mui/icons-material/HelpOutlineSharp';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { DANGER, FOREST, FOREST_DEEP, LINE, SURFACE_HOVER, TEXT, TEXT_SOFT, UI_SCALE, WARNING } from './Backdrop';
import type { RapidFireAnswer, RapidFireCard, RapidFireRules } from './api';
import type { Feedback, Outcome } from './gameReducer';
import { useCardTimer } from './useCardTimer';

/** Taps within this window of a card appearing are ignored: a double tap must not answer the next card. */
const INPUT_LOCK_MS = 250;
const SWIPE_THRESHOLD_PX = 96;
const EXIT_MS = 200;

const YES = FOREST;
const NO = 'rgba(16,24,20,0.45)';
const UNSURE = 'rgba(16,24,20,0.25)';

const cardIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
`;
const floatUp = keyframes`
  0% { opacity: 0; transform: translate(-50%, 8px); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -32px); }
`;
// Exit animations are keyframes, not transitions: the leaving card mounts
// fresh, so a transition would have no "from" state and it would just vanish.
const exitRight = keyframes`
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateX(110%); }
`;
const exitLeft = keyframes`
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateX(-110%); }
`;
const exitDown = keyframes`
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateY(24px); }
`;
/** Countdown colour: calm green, amber in the last 5 seconds, red in the last 3. */
const urgency = (secondsLeft: number) => (secondsLeft <= 3 ? DANGER : secondsLeft <= 5 ? WARNING : FOREST);

/** Small phones and landscape: the answer buttons must stay on screen without scrolling during a timed card. */
const shortScreen = (styles: object) => ({ '@media (max-height: 640px)': styles });

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
    <Box component="main" sx={{ minHeight: { xs: '100dvh', md: `calc(100dvh / ${UI_SCALE})` }, display: 'flex', flexDirection: 'column', color: TEXT, overflow: 'hidden', userSelect: 'none' }}>
      {/* HUD */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, maxWidth: 720, width: '100%', mx: 'auto' }}>
        <Tooltip title={t.rfQuit}>
          <IconButton onClick={onQuit} aria-label={t.rfQuit} sx={{ width: 44, height: 44, color: TEXT, border: `1px solid ${TEXT_SOFT}`, '&:hover': { bgcolor: SURFACE_HOVER } }}>
            <CloseSharpIcon />
          </IconButton>
        </Tooltip>
        <Stack direction="row" spacing={0.5} sx={{ flex: 1 }} role="progressbar" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={outcomes.length}>
          {cards.map((c, i) => {
            const o = outcomes[i];
            const color = !o ? 'rgba(16,24,20,0.1)' : o.hasty || o.answer === 'skip' ? UNSURE : o.answer === 'yes' ? YES : o.answer === 'no' ? NO : UNSURE;
            return <Box key={c.id} sx={{ flex: 1, height: 6, bgcolor: color, outline: i === index && phase === 'playing' ? `2px solid ${TEXT}` : 'none', outlineOffset: 1 }} />;
          })}
        </Stack>
        <Box sx={{ textAlign: 'right', minWidth: 64 }} aria-live="polite">
          <Typography sx={{ color: TEXT_SOFT, fontSize: '0.75rem', lineHeight: 1.3 }}>{t.rfScore}</Typography>
          <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score}</Typography>
        </Box>
      </Stack>

      <Box sx={{ height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1.5, ...shortScreen({ height: 24, mt: 0.5 }) }}>
        {streak >= 2 && (
          <Typography sx={{ color: FOREST, fontWeight: 700, fontSize: '0.9375rem' }}>
            {t.rfStreak} ×{streak}
          </Typography>
        )}
      </Box>

      {/* Card area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 560, minHeight: { xs: 300, sm: 330 }, ...shortScreen({ minHeight: 210 }) }}>
          {phase === 'countdown' && <Countdown onDone={onCountdownDone} goLabel={t.rfGo} />}

          {phase === 'finishing' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={32} />
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
                animation: `${cardIn} 160ms ease-out both`,
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
                timerBar={<Box ref={barRef} sx={{ height: '100%', bgcolor: urgency(secondsLeft), transformOrigin: 'left center' }} />}
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
                // The "too fast" sentence is long, and longer in Sinhala and Tamil: it wraps rather than running off a phone.
                width: 'max-content',
                maxWidth: '90vw',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: feedback.points > 0 ? '1.75rem' : '1rem',
                color: feedback.points > 0 && !feedback.hasty ? FOREST : TEXT_SOFT,
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
        <Stack direction="row" spacing={1}>
          <AnswerButton solid={false} icon={<CloseSharpIcon />} label={t.rfNo} hint="←" disabled={!card} onClick={() => answer('no')} />
          <AnswerButton solid icon={<CheckSharpIcon />} label={t.rfYes} hint="→" disabled={!card} onClick={() => answer('yes')} />
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', mt: 1, minHeight: 44 }}>
          <Button
            onClick={() => answer('unsure')}
            disabled={!card}
            startIcon={<HelpOutlineSharpIcon />}
            sx={{ minHeight: 44, color: TEXT_SOFT, '&:hover': { bgcolor: SURFACE_HOVER }, '&.Mui-disabled': { color: 'rgba(16,24,20,0.3)' } }}
          >
            {t.rfUnsure}
          </Button>
          {saving && (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', ml: 1.5 }}>
              <CircularProgress size={12} />
              <Typography sx={{ color: TEXT_SOFT, fontSize: '0.75rem' }}>{t.rfSaving}</Typography>
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
  const name = localName(card, language);
  const context = language === 'si' ? card.context_si || card.context_en : language === 'ta' ? card.context_ta || card.context_en : card.context_en;
  const exitAnimation = exit === 'right' ? exitRight : exit === 'left' ? exitLeft : exitDown;
  const { Icon } = getCategoryVisual({ slug: card.deck_slug, nameEn: card.deck_name_en });

  return (
    <Box
      sx={{
        position: exit ? 'absolute' : 'relative',
        inset: exit ? 0 : undefined,
        zIndex: exit ? 3 : 2,
        bgcolor: '#fff',
        border: `1px solid ${TEXT}`,
        color: TEXT,
        overflow: 'hidden',
        pointerEvents: exit ? 'none' : 'auto',
        ...(exit
          ? { animation: `${exitAnimation} ${EXIT_MS}ms ease-in forwards` }
          : { transform: `translateX(${dragX}px)`, transition: dragX === 0 ? 'transform 160ms ease' : 'none' }),
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', animation: 'none', ...(exit ? { opacity: 0 } : {}) },
      }}
    >
      <Box sx={{ height: 6, bgcolor: LINE }}>{timerBar}</Box>

      {/* Swipe stamps */}
      {!exit && (
        <>
          <Stamp label={yesLabel || ''} side="left" opacity={Math.max(0, swipeRatio)} />
          <Stamp label={noLabel || ''} side="right" opacity={Math.max(0, -swipeRatio)} />
        </>
      )}

      <Box sx={{ p: { xs: 2.5, sm: 4 }, minHeight: { xs: 290, sm: 320 }, display: 'flex', flexDirection: 'column', ...shortScreen({ minHeight: 200, p: 2 }) }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, color: TEXT_SOFT }}>
            <Icon sx={{ fontSize: 18 }} />
            <Typography sx={{ color: 'inherit', fontSize: '0.8125rem', fontWeight: 600 }} noWrap>
              {card.deck_name_en}
            </Typography>
          </Stack>
          {secondsLeft !== undefined && (
            <Typography aria-hidden sx={{ flexShrink: 0, fontWeight: 700, fontSize: '1.25rem', lineHeight: 1, color: secondsLeft <= 5 ? urgency(secondsLeft) : TEXT, fontVariantNumeric: 'tabular-nums' }}>
              {secondsLeft}
            </Typography>
          )}
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {context && (
            <Typography sx={{ color: TEXT_SOFT, fontWeight: 500, fontSize: '0.875rem', mb: 1 }} noWrap>
              {context}
            </Typography>
          )}
          <Typography component="h2" sx={{ color: TEXT, fontWeight: 700, fontSize: { xs: '1.875rem', sm: '2.25rem' }, letterSpacing: language === 'en' ? '-0.02em' : 0, lineHeight: language === 'en' ? 1.15 : 1.3, wordBreak: 'break-word' }}>
            {name}
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 500, fontSize: '1rem', color: TEXT_SOFT }}>{fill(question, { village: villageName })}</Typography>
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
      top: 24,
      [side]: 20,
      zIndex: 4,
      px: 1.5,
      py: 0.5,
      border: `2px solid ${side === 'left' ? FOREST : TEXT}`,
      bgcolor: '#fff',
      color: side === 'left' ? FOREST : TEXT,
      fontWeight: 700,
      fontSize: '1.25rem',
      opacity,
      pointerEvents: 'none',
    }}
  >
    {label}
  </Box>
);

const AnswerButton: React.FC<{ solid: boolean; icon: React.ReactNode; label: string; hint: string; disabled: boolean; onClick: () => void }> = ({ solid, icon, label, hint, disabled, onClick }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    startIcon={icon}
    fullWidth
    sx={{
      minHeight: 64,
      fontSize: '1.125rem',
      fontWeight: 700,
      color: solid ? '#fff' : TEXT,
      bgcolor: solid ? FOREST : '#fff',
      border: `1px solid ${solid ? FOREST : TEXT}`,
      '& .MuiButton-startIcon svg': { fontSize: 24 },
      '&:hover': { bgcolor: solid ? FOREST_DEEP : '#fff', borderColor: solid ? FOREST_DEEP : TEXT },
      '&.Mui-disabled': { bgcolor: 'rgba(16,24,20,0.06)', color: 'rgba(16,24,20,0.45)', border: `1px solid ${LINE}` },
      '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: 2 },
    }}
  >
    {label}
    <Box component="kbd" sx={{ ml: 1, display: { xs: 'none', md: 'inline' }, fontFamily: 'inherit', fontSize: '0.8125rem', fontWeight: 400 }}>
      {hint}
    </Box>
  </Button>
);

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
      <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: step === steps.length - 1 ? { xs: '3.5rem', sm: '4.5rem' } : { xs: '6rem', sm: '8rem' }, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {steps[step]}
      </Typography>
    </Box>
  );
};

export default PlayStage;
