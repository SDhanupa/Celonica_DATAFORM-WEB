import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, ButtonBase, Container, Skeleton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import ArrowForwardSharpIcon from '@mui/icons-material/ArrowForwardSharp';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthProvider';
import { ContributionStatus, useMyContributions } from '../api/contributions';
import { useContributeCopy } from '../components/contribute/copy';
import { StatGrid, StatusText } from '../components/contribute/ledger';
import { readSavedVillage, surveyPath, villageName, villagePath } from '../components/contribute/village';
import { LINE, pageTitleSx, quietButton, sectionRule, sectionTitleSx, squareButton, squareOutlineButton, textLink, TEXT, TEXT_SOFT } from '../components/rapidFire/Backdrop';

interface Survey {
  id: number;
  status: ContributionStatus;
  gn_name?: string;
  district?: string;
  reg_number?: string;
}

const RECENT = 5;

const MyDashboard: React.FC = () => {
  const { getToken, userInfo } = useAuth();
  const { t: tr } = useTranslation();
  const { t, language } = useContributeCopy();
  const navigate = useNavigate();
  const mine = useMyContributions();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [surveysFailed, setSurveysFailed] = useState(false);
  const [surveysNonce, setSurveysNonce] = useState(0);

  const firstName = (userInfo?.given_name || userInfo?.name || userInfo?.preferred_username || '').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;
  const village = readSavedVillage();
  const vName = villageName(village, language);
  const s = mine.data?.summary;

  useEffect(() => {
    const ctrl = new AbortController();
    setSurveysLoading(true);
    setSurveysFailed(false);
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/my-industry-surveys', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : []);
      } catch {
        // A failed load must not read as "you have no surveys".
        if (!ctrl.signal.aborted) setSurveysFailed(true);
      } finally {
        if (!ctrl.signal.aborted) setSurveysLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [getToken, surveysNonce]);

  return (
    <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3, md: 5 }, pb: { xs: 6, md: 10 } }}>
      <Typography component="h1" sx={pageTitleSx(language)}>
        {firstName ? `${greeting}, ${firstName}` : greeting}
      </Typography>
      <Typography sx={{ color: TEXT_SOFT, fontSize: '1rem', lineHeight: 1.65, maxWidth: 680, mt: 1.5 }}>{tr('hero_subtitle')}</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: { xs: 2, sm: 3 } }}>
        <Button startIcon={<AddSharpIcon />} onClick={() => navigate('/user')} sx={squareButton}>
          {t.startContributing}
        </Button>
        <Button onClick={() => navigate('/user/rapid-fire')} sx={squareOutlineButton}>
          {t.navRapidFire}
        </Button>
      </Stack>

      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        {mine.error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={mine.refetch}>
                {t.retry}
              </Button>
            }
          >
            {t.myError}
          </Alert>
        ) : (
          <StatGrid
            loading={mine.loading}
            stats={[
              { label: t.myImpactTotal, value: s?.total ?? 0 },
              { label: t.myImpactApproved, value: s?.approved ?? 0 },
              { label: t.myImpactReview, value: s?.in_review ?? 0 },
              { label: t.myFilterDrafts, value: s?.drafts ?? 0 },
            ]}
          />
        )}
      </Box>

      <Box sx={{ mt: { xs: 4, md: 6 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' }, gap: 4, alignItems: 'start' }}>
        <Box component="section" aria-labelledby="businesses-title" sx={{ minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
            <Typography id="businesses-title" component="h2" sx={sectionTitleSx(language)}>
              {tr('your_businesses')}
            </Typography>
            <Button endIcon={<ArrowForwardSharpIcon />} onClick={() => navigate(surveyPath(village))} sx={{ ...quietButton, flexShrink: 0 }}>
              {tr('new_survey')}
            </Button>
          </Stack>

          {surveysFailed ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => setSurveysNonce((n) => n + 1)}>
                  {t.retry}
                </Button>
              }
            >
              {t.surveysError}
            </Alert>
          ) : surveysLoading ? (
            <Stack spacing={0.5}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rectangular" height={64} />
              ))}
            </Stack>
          ) : surveys.length === 0 ? (
            <Box sx={{ py: 3, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ color: TEXT, fontWeight: 600 }}>{tr('no_surveys_yet')}</Typography>
              <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', lineHeight: 1.6, mt: 0.5, mb: 2 }}>{tr('register_business_prompt')}</Typography>
              <Button onClick={() => navigate(surveyPath(village))} sx={squareOutlineButton}>
                {t.registerBusiness}
              </Button>
            </Box>
          ) : (
            <>
              <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderBottom: `1px solid ${LINE}` }}>
                {surveys.slice(0, RECENT).map((survey) => (
                  <Box component="li" key={survey.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 64, px: 1, py: 1.5, borderTop: `1px solid ${LINE}` }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.9375rem' }} noWrap>
                        {survey.reg_number || `${t.kindBusiness} #${survey.id}`}
                      </Typography>
                      <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem' }} noWrap>
                        {[survey.gn_name, survey.district].filter(Boolean).join(' · ') || t.kindBusiness}
                      </Typography>
                    </Box>
                    <StatusText status={survey.status} />
                  </Box>
                ))}
              </Box>
              {surveys.length > RECENT && (
                <ButtonBase onClick={() => navigate('/user/contributions')} sx={{ ...textLink, mt: 1 }}>
                  {t.viewAll}
                </ButtonBase>
              )}
            </>
          )}
        </Box>

        <Box component="section" aria-labelledby="village-title" sx={{ ...sectionRule, minWidth: 0 }}>
          <Typography id="village-title" sx={{ color: TEXT_SOFT, fontSize: '0.875rem' }}>
            {tr('your_village')}
          </Typography>
          <Typography component="h2" sx={{ color: TEXT, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35, mt: 0.25, mb: 1.5 }}>
            {vName || tr('choose_your_village')}
          </Typography>
          {village ? (
            <Stack spacing={1}>
              <Button endIcon={<ArrowForwardSharpIcon />} onClick={() => navigate(villagePath(village))} fullWidth sx={squareOutlineButton}>
                {t.openVillagePage}
              </Button>
              <ButtonBase onClick={() => navigate('/user', { state: { chooseVillage: true } })} sx={{ ...textLink, alignSelf: 'flex-start' }}>
                {t.navChangeRegion}
              </ButtonBase>
            </Stack>
          ) : (
            <Button onClick={() => navigate('/user')} fullWidth sx={squareButton}>
              {t.chooseVillage}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default MyDashboard;
