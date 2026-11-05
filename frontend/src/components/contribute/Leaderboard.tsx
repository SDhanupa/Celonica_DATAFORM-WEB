import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, ButtonBase, LinearProgress, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import { Leaderboard as Board, LeaderboardEntry, LeaderboardLevelKey, LeaderboardPeriod, LeaderboardScope, useLeaderboard } from '../../api/contributions';
import { fill, useContributeCopy } from './copy';
import { FOREST, LINE, SURFACE_HOVER, TEXT, TEXT_SOFT, squareButton, squareSegmented } from '../rapidFire/Backdrop';

// Green is reserved for what matters to the player: their own row and their progress.
const SOFT_ACCENT = 'rgba(45,94,65,0.08)';
const PAGE_SIZE = 10;

type Copy = ReturnType<typeof useContributeCopy>['t'];
const levelName = (t: Copy, key: LeaderboardLevelKey) =>
  ({ seedling: t.lbLevelSeedling, scout: t.lbLevelScout, mapper: t.lbLevelMapper, guardian: t.lbLevelGuardian, legend: t.lbLevelLegend })[key];
const entryName = (t: Copy, name: string | null) => name || t.lbAnonymous;
const initialOf = (name: string | null) => (name ? Array.from(name)[0].toUpperCase() : 'C');

const YouTag: React.FC<{ label: string }> = ({ label }) => (
  <Box component="span" sx={{ flexShrink: 0, px: 0.75, bgcolor: FOREST, color: '#fff', fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.6 }}>
    {label}
  </Box>
);

const Row: React.FC<{ entry: LeaderboardEntry; t: Copy }> = ({ entry: e, t }) => {
  const detail = [levelName(t, e.level), e.approved > 0 ? fill(t.lbApproved, { n: e.approved }) : null, e.answers > 0 ? fill(t.lbChecks, { n: e.answers }) : null].filter(Boolean).join(' · ');
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minHeight: 60,
        px: { xs: 1, sm: 1.5 },
        py: 1,
        borderTop: `1px solid ${LINE}`,
        bgcolor: e.is_me ? SOFT_ACCENT : 'transparent',
      }}
    >
      <Typography sx={{ width: 28, flexShrink: 0, textAlign: 'right', color: e.is_me ? FOREST : TEXT_SOFT, fontWeight: 600, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>{e.rank}</Typography>
      <Box aria-hidden sx={{ width: 36, height: 36, flexShrink: 0, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: '0.9375rem', bgcolor: e.is_me ? FOREST : SURFACE_HOVER, color: e.is_me ? '#fff' : TEXT }}>
        {initialOf(e.name)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Typography noWrap sx={{ color: TEXT, fontWeight: 600, fontSize: '0.9375rem' }}>
            {entryName(t, e.name)}
          </Typography>
          {e.is_me && <YouTag label={t.lbYou} />}
        </Stack>
        <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem', lineHeight: 1.4 }}>
          {detail}
        </Typography>
      </Box>
      <Typography sx={{ flexShrink: 0, color: e.is_me ? FOREST : TEXT, fontWeight: 600, fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
        {e.score.toLocaleString()}
        <Box component="span" sx={{ ml: 0.5, color: TEXT_SOFT, fontSize: '0.75rem', fontWeight: 500 }}>{t.lbPts}</Box>
      </Typography>
    </Box>
  );
};

/** The player's own standing: rank, level and the distance to the next level, whichever board is open. */
const MyCard: React.FC<{ board: Board; t: Copy; onContribute: () => void }> = ({ board, t, onContribute }) => {
  const { me } = board;
  const { level } = me;
  const toNext = level.next_min !== null ? level.next_min - me.all_time_score : 0;
  const pct = level.next_min !== null ? ((me.all_time_score - level.min) / (level.next_min - level.min)) * 100 : 100;
  return (
    <Box sx={{ pt: 2, borderTop: `2px solid ${TEXT}` }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" sx={{ color: TEXT_SOFT, fontSize: '0.875rem', fontWeight: 500 }}>{t.lbRank}</Typography>
          {me.rank ? (
            <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>#{me.rank}</Typography>
          ) : (
            <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.3, mt: 0.5 }}>{t.lbUnranked}</Typography>
          )}
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', fontWeight: 500 }}>{t.lbPts}</Typography>
          <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.5, fontVariantNumeric: 'tabular-nums' }}>{me.score.toLocaleString()}</Typography>
        </Box>
      </Stack>
      <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.9375rem', mt: 2 }}>{levelName(t, level.key)}</Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, pct))}
        aria-label={level.next_key ? fill(t.lbToNext, { n: toNext, level: levelName(t, level.next_key) }) : t.lbMaxLevel}
        sx={{ mt: 1, height: 8, borderRadius: 0, bgcolor: LINE, '& .MuiLinearProgress-bar': { borderRadius: 0, bgcolor: FOREST } }}
      />
      <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem', mt: 0.75 }}>
        {level.next_key ? fill(t.lbToNext, { n: toNext.toLocaleString(), level: levelName(t, level.next_key) }) : t.lbMaxLevel}
      </Typography>
      <Button onClick={onContribute} startIcon={<AddSharpIcon />} fullWidth sx={{ ...squareButton, mt: 2 }}>
        {t.lbJoinCta}
      </Button>
    </Box>
  );
};

const HowItWorks: React.FC<{ board: Board; t: Copy }> = ({ board, t }) => {
  const s = board.scoring;
  const rows: [string, string][] = [
    [t.lbHowBusiness, `+${s.approved_business}`],
    [t.lbHowPlace, `+${s.approved_place}`],
    [t.lbHowUpdate, `+${s.approved_update}`],
    [t.lbHowReview, `+${s.review_place}`],
    [t.lbHowGame, fill(t.lbHowGameValue, { n: s.game_points_per_point })],
  ];
  return (
    <Box sx={{ pt: 2, borderTop: `2px solid ${TEXT}` }}>
      <Typography component="h3" sx={{ color: TEXT, fontWeight: 600, fontSize: '0.9375rem', mb: 1 }}>{t.lbHowTitle}</Typography>
      <Box component="dl" sx={{ m: 0 }}>
        {rows.map(([label, value], i) => (
          <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1.5, py: 1, borderTop: i ? `1px solid ${LINE}` : 'none' }}>
            <Typography component="dt" sx={{ color: TEXT_SOFT, fontSize: '0.875rem' }}>{label}</Typography>
            <Typography component="dd" sx={{ m: 0, color: TEXT, fontWeight: 600, fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{value}</Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

interface LeaderboardProps {
  ccode: string | null;
  villageName: string;
  onContribute: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ ccode, villageName, onContribute }) => {
  const { t, language } = useContributeCopy();
  const [scope, setScope] = useState<LeaderboardScope>('all');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const activeScope: LeaderboardScope = ccode ? scope : 'all';
  const { data, loading, error, refetch } = useLeaderboard(activeScope, period, ccode);

  useEffect(() => setVisible(PAGE_SIZE), [activeScope, period, ccode]);

  const entries = data?.entries ?? [];
  const shown = entries.slice(0, visible);
  const meShown = shown.some((e) => e.is_me);
  const pinned: LeaderboardEntry | null =
    data && data.me.rank && !meShown
      ? { rank: data.me.rank, name: data.me.name, score: data.me.score, approved: data.me.approved, in_review: data.me.in_review, answers: data.me.answers, level: data.me.level.key, is_me: true }
      : null;

  return (
    <Box component="section" aria-labelledby="leaderboard-title">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ maxWidth: 640 }}>
          <Typography id="leaderboard-title" component="h2" sx={{ color: TEXT, fontWeight: 700, fontSize: { xs: '1.5rem', md: '1.75rem' }, lineHeight: language === 'en' ? 1.25 : 1.35, letterSpacing: language === 'en' ? '-0.02em' : 0 }}>
            {t.lbTitle}
          </Typography>
          <Typography sx={{ mt: 0.75, color: TEXT_SOFT, fontSize: '0.9375rem', lineHeight: 1.6 }}>{t.lbBody}</Typography>
        </Box>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
          {ccode && (
            <ToggleButtonGroup size="small" exclusive value={activeScope} onChange={(_, v) => v && setScope(v)} aria-label={t.lbEyebrow} sx={squareSegmented}>
              <ToggleButton value="all">{t.lbEveryone}</ToggleButton>
              <ToggleButton value="village" sx={{ maxWidth: 150, '&&': { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>{villageName || ccode}</ToggleButton>
            </ToggleButtonGroup>
          )}
          <ToggleButtonGroup size="small" exclusive value={period} onChange={(_, v) => v && setPeriod(v)} aria-label={t.lbMonth} sx={squareSegmented}>
            <ToggleButton value="all">{t.lbAllTime}</ToggleButton>
            <ToggleButton value="month">{t.lbMonth}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="warning" sx={{ borderRadius: 0 }} action={<Button color="inherit" size="small" onClick={refetch} sx={{ boxShadow: 'none', borderRadius: 0 }}>{t.retry}</Button>}>
          {t.lbError}
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
          {/* Your standing first on phones: it is the reason to look. */}
          <Stack spacing={3} sx={{ order: { md: 2 }, minWidth: 0 }}>
            {data ? (
              <>
                <MyCard board={data} t={t} onContribute={onContribute} />
                <Box sx={{ display: { xs: 'none', md: 'block' } }}><HowItWorks board={data} t={t} /></Box>
              </>
            ) : (
              <Skeleton variant="rectangular" height={240} />
            )}
          </Stack>

          {/* Previous board stays visible, dimmed, while another loads: nothing jumps when switching. */}
          <Box aria-busy={loading} sx={{ order: { md: 1 }, minWidth: 0, borderBottom: `1px solid ${LINE}`, opacity: loading && data ? 0.6 : 1, transition: 'opacity 120ms ease' }}>
            {!data ? (
              <Stack spacing={0.5}>
                {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" height={60} />)}
              </Stack>
            ) : entries.length === 0 ? (
              <Box sx={{ py: { xs: 4, sm: 6 }, px: 2, borderTop: `1px solid ${LINE}` }}>
                <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '1.125rem' }}>{t.lbEmptyTitle}</Typography>
                <Typography sx={{ color: TEXT_SOFT, mt: 0.5 }}>{t.lbEmptyBody}</Typography>
              </Box>
            ) : (
              <>
                <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {shown.map((e) => <Row key={`${e.rank}-${e.score}-${String(e.name)}`} entry={e} t={t} />)}
                </Box>
                {entries.length > visible && (
                  <ButtonBase onClick={() => setVisible((v) => v + PAGE_SIZE)} sx={{ width: '100%', minHeight: 44, gap: 0.5, borderTop: `1px solid ${LINE}`, color: TEXT, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', '&:hover': { bgcolor: SURFACE_HOVER }, '&:focus-visible': { outline: `2px solid ${TEXT}`, outlineOffset: -2 } }}>
                    {t.lbShowMore}
                    <ExpandMoreSharpIcon fontSize="small" />
                  </ButtonBase>
                )}
                {/* Keeps your own position in view when you are outside the rows shown. */}
                {pinned && (
                  <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                    <Row entry={pinned} t={t} />
                  </Box>
                )}
              </>
            )}
          </Box>

          {data && <Box sx={{ display: { md: 'none' }, order: 3 }}><HowItWorks board={data} t={t} /></Box>}
        </Box>
      )}
    </Box>
  );
};

export default Leaderboard;
