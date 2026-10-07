import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, ButtonBase, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { useAuth } from '../auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useMyContributions } from '../api/contributions';
import { useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, villageName, villagePath } from '../components/contribute/village';
import { Ambient, CountUp, EASE, enter, floatY, lift, Reveal, sheenOnHover, spotlight, spotlightMove, useMounted } from '../components/contribute/motion';
import { ink } from '../components/contribute/tokens';

type SurveyStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';

interface Survey {
  id: number;
  status: SurveyStatus;
  form_data?: { business_name?: string; [key: string]: unknown };
  village?: string;
  reg_number?: string;
  created_at?: string;
}

const STATUS: Record<SurveyStatus, { label: string; sx: object }> = {
  approved: { label: 'status_approved', sx: { bgcolor: ink[900], color: '#fff' } },
  submitted: { label: 'status_review', sx: { border: `1px solid ${ink[300]}`, color: ink[700] } },
  pending: { label: 'status_review', sx: { border: `1px solid ${ink[300]}`, color: ink[700] } },
  draft: { label: 'status_draft', sx: { bgcolor: ink[100], color: ink[500] } },
  rejected: { label: 'status_rejected', sx: { bgcolor: '#FEF2F2', color: '#B91C1C' } },
};

const greeting = (t: any) => {
  const h = new Date().getHours();
  return h < 12 ? t('greeting_morning') : h < 17 ? t('greeting_afternoon') : t('greeting_evening');
};

const surveyTitle = (s: Survey) => s.form_data?.business_name || `Survey #${s.id}`;

const card = {
  borderRadius: '24px',
  bgcolor: '#fff',
  border: `1px solid ${ink[100]}`,
};

const eyebrow = { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink[400] } as const;

const MyDashboard: React.FC = () => {
  const { token, userInfo } = useAuth();
  const { t } = useTranslation();
  const { language } = useContributeCopy();
  const navigate = useNavigate();
  const mounted = useMounted();

  const { data: contribData, loading: contribLoading } = useMyContributions();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(true);

  const firstName = (userInfo?.given_name || userInfo?.name || userInfo?.preferred_username || '').split(' ')[0];
  const displayName = userInfo?.name || userInfo?.preferred_username || 'User';
  const initial = (displayName || '?').charAt(0).toUpperCase();
  const village = readSavedVillage();
  const vName = villageName(village, language);

  useEffect(() => {
    if (!token) return;
    const ctrl = new AbortController();
    setSurveysLoading(true);
    fetch('/api/my-industry-surveys', { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSurveys(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setSurveysLoading(false));
    return () => ctrl.abort();
  }, [token]);

  const s = contribData?.summary;
  const total = s?.total ?? 0;
  const approvedPct = total > 0 ? ((s?.approved ?? 0) / total) * 100 : 0;

  const shortcuts = [
    { label: t('my_contributions_label'), desc: t('my_contributions_desc'), icon: VolunteerActivismOutlinedIcon, path: '/user/contributions' },
    { label: t('register_business'), desc: t('register_business_desc'), icon: StorefrontOutlinedIcon, path: '/user' },
    { label: t('explore_data_label'), desc: t('explore_data_desc'), icon: ExploreOutlinedIcon, path: '/gnpage' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: { xs: 1.5, md: 2 } }}>
      {/* Hero */}
      <Box
        sx={{
          ...enter(0),
          gridColumn: { md: 'span 8' },
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          borderRadius: '28px',
          bgcolor: ink[900],
          color: '#fff',
          p: { xs: 3, sm: 4, md: 5 },
          minHeight: { md: 300 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Ambient />
        <Typography sx={{ ...eyebrow, color: 'rgba(255,255,255,.5)', mb: 1.5 }}>{greeting(t)}</Typography>
        <Typography
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(180deg, #fff 35%, rgba(255,255,255,.5))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            pb: 0.5,
          }}
        >
          {firstName || t('welcome_back')}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,.6)', mt: 1.5, maxWidth: 440, lineHeight: 1.6 }}>
          {t('hero_subtitle')}
        </Typography>
        <Box sx={{ flex: 1, minHeight: 24 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/user')}
            sx={{
              px: 2.75,
              py: 1.3,
              borderRadius: 999,
              fontWeight: 700,
              bgcolor: '#fff',
              color: ink[900],
              boxShadow: '0 10px 30px -10px rgba(255,255,255,.45)',
              '& .MuiButton-endIcon': { transition: `transform 300ms ${EASE}` },
              '&:hover': { bgcolor: ink[100], transform: 'none', '& .MuiButton-endIcon': { transform: 'translateX(3px)' } },
            }}
          >
            {t('contribute')}
          </Button>
          <Button
            startIcon={<BoltRoundedIcon />}
            onClick={() => navigate('/user/rapid-fire')}
            sx={{ px: 2.5, py: 1.3, borderRadius: 999, fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,.2)', bgcolor: 'rgba(255,255,255,.04)', backdropFilter: 'blur(6px)', '&:hover': { bgcolor: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.4)', transform: 'none' } }}
          >
            {t('rapid_fire')}
          </Button>
        </Stack>
      </Box>

      {/* Impact */}
      <Paper
        elevation={0}
        onPointerMove={spotlightMove}
        sx={{ ...card, ...spotlight(), ...enter(1), gridColumn: { md: 'span 4' }, p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column' }}
      >
        <Typography sx={eyebrow}>{t('your_contributions')}</Typography>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
          {contribLoading ? (
            <Skeleton width={120} height={80} />
          ) : (
            <Typography sx={{ fontSize: { xs: '3.5rem', sm: '4.5rem' }, fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 1, color: ink[900], fontVariantNumeric: 'tabular-nums' }}>
              <CountUp value={total} />
            </Typography>
          )}
          <Typography sx={{ color: ink[500], mt: 1 }}>{t('records_added_across')} {s?.villages ?? 0} {s?.villages === 1 ? t('village_singular') : t('village_plural')}</Typography>
        </Box>
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: ink[500], fontWeight: 600 }}>
              {t('approval_rate')}
            </Typography>
            <Typography variant="caption" sx={{ color: ink[900], fontWeight: 700 }}>
              {Math.round(approvedPct)}%
            </Typography>
          </Stack>
          <Box sx={{ height: 6, borderRadius: 999, bgcolor: ink[100], overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: mounted && !contribLoading ? `${approvedPct}%` : 0, bgcolor: ink[900], borderRadius: 999, transition: `width 1400ms ${EASE} 300ms` }} />
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Box sx={{ gridColumn: { md: 'span 12' }, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 } }}>
        <StatTile i={2} label={t('approved')} value={s?.approved} loading={contribLoading} />
        <StatTile i={3} label={t('pending_approval')} value={s?.in_review} loading={contribLoading} />
        <StatTile i={4} label={t('drafts')} value={s?.drafts} loading={contribLoading} />
        <StatTile i={5} label={t('surveys')} value={surveysLoading ? undefined : surveys.length} loading={surveysLoading} />
      </Box>

      {/* Surveys */}
      <Paper elevation={0} sx={{ ...card, ...enter(6), gridColumn: { md: 'span 8' }, p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography sx={eyebrow}>{t('industry_surveys')}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: ink[900], letterSpacing: '-0.02em' }}>{t('your_businesses')}</Typography>
          </Box>
          <PillLink label={t('new_survey')} onClick={() => navigate('/user')} />
        </Stack>

        {surveysLoading ? (
          <Stack spacing={1}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: '16px' }} />
            ))}
          </Stack>
        ) : surveys.length === 0 ? (
          <Box sx={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', py: { xs: 4, sm: 5 }, px: 3, borderRadius: '20px', textAlign: 'center', bgcolor: ink[50], border: `1px dashed ${ink[200]}` }}>
            <Ambient tone="light" />
            <Box sx={{ width: 56, height: 56, mx: 'auto', mb: 2, borderRadius: '18px', display: 'grid', placeItems: 'center', bgcolor: '#fff', border: `1px solid ${ink[100]}`, boxShadow: '0 12px 24px -12px rgba(10,12,15,.25)', animation: `${floatY} 3.6s ease-in-out infinite` }}>
              <StorefrontOutlinedIcon sx={{ color: ink[700] }} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: ink[900], mb: 0.5 }}>{t('no_surveys_yet')}</Typography>
            <Typography variant="body2" sx={{ color: ink[500], mb: 2.5 }}>
              {t('register_business_prompt')}
            </Typography>
            <Button onClick={() => navigate('/user')} sx={{ borderRadius: 999, px: 2.5, py: 1, fontWeight: 700, bgcolor: ink[900], color: '#fff', '&:hover': { bgcolor: ink[700], transform: 'none' } }}>
              {t('register_business')}
            </Button>
          </Box>
        ) : (
          <Stack spacing={0.75}>
            {surveys.slice(0, 5).map((survey, i) => {
              const st = STATUS[survey.status] || STATUS.pending;
              return (
                <Reveal key={survey.id} index={i}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: '16px',
                      transition: `background-color 200ms ease, transform 350ms ${EASE}`,
                      '&:hover': { bgcolor: ink[50], transform: 'translateX(4px)' },
                    }}
                  >
                    <Box sx={{ width: 42, height: 42, borderRadius: '13px', display: 'grid', placeItems: 'center', bgcolor: ink[100], flexShrink: 0 }}>
                      <AssignmentOutlinedIcon sx={{ fontSize: 20, color: ink[700] }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: ink[900] }} noWrap>
                        {surveyTitle(survey)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ink[400] }} noWrap component="div">
                        {[survey.village, survey.reg_number].filter(Boolean).join(' · ') || '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ ...st.sx, px: 1.25, py: 0.4, borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{t(st.label)}</Box>
                  </Box>
                </Reveal>
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Side column */}
      <Stack spacing={{ xs: 1.5, md: 2 }} sx={{ ...enter(7), gridColumn: { md: 'span 4' } }}>
        <Paper elevation={0} sx={{ ...card, p: 2.5 }}>
          <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar sx={{ width: 52, height: 52, bgcolor: ink[900], fontWeight: 700, fontSize: '1.25rem' }}>{initial}</Avatar>
              <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ink[900] }} />
              </Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: ink[900] }} noWrap>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: ink[400], display: 'block' }} noWrap>
                {userInfo?.email || t('contributor')}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <ButtonBase
          onClick={() => (village ? navigate(villagePath(village)) : navigate('/user'))}
          sx={{
            ...sheenOnHover,
            position: 'relative',
            isolation: 'isolate',
            overflow: 'hidden',
            display: 'block',
            textAlign: 'left',
            width: '100%',
            borderRadius: '24px',
            bgcolor: ink[900],
            color: '#fff',
            p: 2.5,
            minHeight: 150,
            transition: `transform 450ms ${EASE}, box-shadow 450ms ${EASE}`,
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 24px 48px -20px rgba(10,12,15,.55)', '& .v-arrow': { transform: 'translate(3px,-3px)', bgcolor: '#fff', color: ink[900] } },
            '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 3 },
          }}
        >
          <Ambient grid={false} />
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,.1)' }}>
              <PlaceOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box className="v-arrow" sx={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,.25)', transition: `transform 350ms ${EASE}, background-color 250ms ease, color 250ms ease` }}>
              <ArrowOutwardRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Stack>
          <Box sx={{ position: 'relative', zIndex: 2, mt: 3 }}>
            <Typography sx={{ ...eyebrow, color: 'rgba(255,255,255,.45)' }}>{t('your_village')}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', mt: 0.25, color: '#fff' }}>{vName || t('choose_your_village')}</Typography>
          </Box>
        </ButtonBase>
      </Stack>

      {/* Shortcuts */}
      <Box sx={{ gridColumn: { md: 'span 12' }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 1.5, md: 2 } }}>
        {shortcuts.map(({ label, desc, icon: Icon, path }, i) => (
          <Reveal key={label} index={i}>
            <ButtonBase
              onClick={() => navigate(path)}
              onPointerMove={spotlightMove}
              sx={{
                ...card,
                ...spotlight(),
                ...lift,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textAlign: 'left',
                width: '100%',
                p: 2.25,
                '&:hover': { ...lift['&:hover'], borderColor: ink[200], '& .sc-icon': { bgcolor: ink[900], color: '#fff' }, '& .sc-arrow': { opacity: 1, transform: 'none' } },
                '&:focus-visible': { outline: `2px solid ${ink[900]}`, outlineOffset: 2 },
              }}
            >
              <Box className="sc-icon" sx={{ width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: ink[100], color: ink[700], flexShrink: 0, transition: 'background-color 250ms ease, color 250ms ease' }}>
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: ink[900] }}>{label}</Typography>
                <Typography variant="caption" sx={{ color: ink[400], display: 'block', lineHeight: 1.4 }}>
                  {desc}
                </Typography>
              </Box>
              <ArrowForwardRoundedIcon className="sc-arrow" sx={{ fontSize: 18, color: ink[900], opacity: 0, transform: 'translateX(-6px)', transition: `opacity 250ms ease, transform 350ms ${EASE}` }} />
            </ButtonBase>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
};

const PillLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{ gap: 0.5, px: 1.5, py: 0.75, borderRadius: 999, fontSize: '0.82rem', fontWeight: 600, color: ink[700], border: `1px solid ${ink[200]}`, transition: 'all 200ms ease', '&:hover': { bgcolor: ink[900], borderColor: ink[900], color: '#fff' } }}
  >
    {label}
    <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
  </ButtonBase>
);

const StatTile: React.FC<{ i: number; label: string; value?: number; loading: boolean }> = ({ i, label, value, loading }) => (
  <Paper
    elevation={0}
    onPointerMove={spotlightMove}
    sx={{ ...card, ...spotlight(), ...lift, ...enter(i), p: { xs: 2, sm: 2.5 }, borderRadius: '20px' }}
  >
    <Typography sx={{ ...eyebrow, fontSize: '0.68rem', mb: 1 }} noWrap>
      {label}
    </Typography>
    {loading || value === undefined ? (
      <Skeleton width={48} height={40} />
    ) : (
      <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', sm: '2.25rem' }, lineHeight: 1, letterSpacing: '-0.05em', color: ink[900], fontVariantNumeric: 'tabular-nums' }}>
        <CountUp value={value} />
      </Typography>
    )}
  </Paper>
);

export default MyDashboard;
