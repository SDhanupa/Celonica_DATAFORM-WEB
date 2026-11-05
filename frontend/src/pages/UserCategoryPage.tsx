import React from 'react';
import { Alert, Box, Breadcrumbs, Button, ButtonBase, CircularProgress, Container, Link as MuiLink, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApolloClient, useQuery } from '@apollo/client';
import ChevronRightSharpIcon from '@mui/icons-material/ChevronRightSharp';
import CategoryDataList from '../components/CategoryDataList';
import { getCategoryVisual } from '../components/categories/categoryVisuals';
import { localName, useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, villageCode } from '../components/contribute/village';
import { LINE, pageTitleSx, rowSx, sectionRule, sectionTitleSx, TEXT, TEXT_SOFT } from '../components/rapidFire/Backdrop';
import { GET_APPROVED_SUBMISSIONS, GET_CATEGORY_BY_SLUG } from '../graphql/queries';
import SurveyPage from './SurveyPage';

const BASE = '/user/categories';

const localDescription = (c: any, language: string): string | undefined =>
  language === 'si' ? c.descriptionSi || c.descriptionEn : language === 'ta' ? c.descriptionTa || c.descriptionEn : c.descriptionEn || c.descriptionSi;

const parseAnswers = (raw: unknown): Record<string, unknown> => {
  try {
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown> || {};
  } catch {
    return {};
  }
};

/** A topic in the contributor dashboard: its sub-topics to pick from, or the form to add to it, then what is already recorded. */
const UserCategoryPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { t, language } = useContributeCopy();
  const slugs = pathname.slice(BASE.length).split('/').filter(Boolean);
  const slug = slugs[slugs.length - 1] ?? '';

  const { data, loading, error, refetch } = useQuery(GET_CATEGORY_BY_SLUG, { variables: { slug }, skip: !slug, errorPolicy: 'all', notifyOnNetworkStatusChange: true });
  const category = data?.categoryBySlug;
  const village: any = readSavedVillage();
  const gnCode = villageCode(village);

  const { data: approvedData } = useQuery(GET_APPROVED_SUBMISSIONS, {
    variables: { categoryId: category?.id, gnCode: gnCode || '' },
    skip: !category?.id || !gnCode,
    fetchPolicy: 'cache-and-network',
  });

  if (!slug) return <Navigate to="/user" replace />;

  if (loading && !category) {
    return (
      <Box role="status" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error || !category) {
    return (
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t.retry}
            </Button>
          }
        >
          {t.categoriesError}
        </Alert>
      </Container>
    );
  }

  const name = localName(category, language);
  const description = localDescription(category, language);
  const children: any[] = category.children || [];
  const questions: any[] = category.questions || [];
  const approved: any[] = approvedData?.approvedSubmissions || [];

  // Built from the server's ancestors, not the URL: a topic can be opened directly by its own slug.
  let crumbPath = BASE;
  const crumbs = [...(category.ancestors || [])].reverse().map((anc: any) => {
    crumbPath += `/${anc.slug}`;
    return { id: anc.id, label: localName(anc, language), to: crumbPath };
  });
  const selfPath = `${crumbPath}/${category.slug}`;
  const crumbLink = { color: TEXT_SOFT, display: 'inline-block', py: 1.25 };

  return (
    <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 2, md: 3 }, pb: { xs: 6, md: 10 } }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem', mb: 1 }}>
        <MuiLink component={RouterLink} underline="always" to="/user" sx={crumbLink}>
          {t.navContribute}
        </MuiLink>
        {crumbs.map((crumb) => (
          <MuiLink key={crumb.id} component={RouterLink} underline="always" to={crumb.to} sx={crumbLink}>
            {crumb.label}
          </MuiLink>
        ))}
        <Typography component="span" aria-current="page" sx={{ color: TEXT, fontSize: '0.875rem', fontWeight: 600 }}>
          {name}
        </Typography>
      </Breadcrumbs>

      <Typography component="h1" sx={{ ...pageTitleSx(language), fontSize: { xs: '1.875rem', sm: '2.25rem', md: '2.75rem' } }}>
        {name}
      </Typography>
      {description && <Typography sx={{ color: TEXT_SOFT, fontSize: '1rem', lineHeight: 1.65, maxWidth: 680, mt: 1 }}>{description}</Typography>}

      {children.length > 0 ? (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 3, p: 0, borderBottom: `1px solid ${LINE}` }}>
          {children.map((child) => (
            <Box component="li" key={child.id}>
              <TopicRow
                category={child}
                language={language}
                onOpen={() => navigate(`${selfPath}/${child.slug}`)}
                onPrefetch={() => {
                  client.query({ query: GET_CATEGORY_BY_SLUG, variables: { slug: child.slug }, fetchPolicy: 'cache-first' }).catch(() => {});
                }}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <SurveyPage key={slug} slug={slug} categoryName={name} onBackToTopics={() => navigate(crumbs.length ? crumbs[crumbs.length - 1].to : '/user')} />
        </Box>
      )}

      {approved.length > 0 && (
        <Box component="section" aria-labelledby="approved-title" sx={{ ...sectionRule, mt: 6 }}>
          <Typography id="approved-title" component="h2" sx={{ ...sectionTitleSx(language), mb: 1 }}>
            {t.approvedData}
          </Typography>
          {approved.map((sub, index) => (
            <Box key={sub.id} sx={{ py: 2, borderTop: index ? `1px solid ${LINE}` : 0 }}>
              <Typography sx={{ color: TEXT_SOFT, fontSize: '0.8125rem', mb: 1 }}>
                #{index + 1}
                {sub.created_at ? ` · ${new Date(sub.created_at).toLocaleDateString()}` : ''}
              </Typography>
              <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                {Object.entries(parseAnswers(sub.answers_data)).map(([key, value]) => {
                  const [questionId, iteration] = key.split('_');
                  const question = questions.find((q) => String(q.id) === questionId);
                  const label = question ? (language === 'si' ? question.questionTextSi || question.questionTextEn : language === 'ta' ? question.questionTextTa || question.questionTextEn : question.questionTextEn) : `#${questionId}`;
                  return (
                    <Box key={key} sx={{ minWidth: 0 }}>
                      <Typography component="dt" sx={{ color: TEXT_SOFT, fontSize: '0.8125rem' }}>
                        {label}
                        {iteration && iteration !== '1' ? ` (${iteration})` : ''}
                      </Typography>
                      <Typography component="dd" sx={{ m: 0, color: TEXT, fontSize: '0.9375rem', fontWeight: 600, wordBreak: 'break-word' }}>{String(value ?? '-')}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <CategoryDataList hideIfEmpty slug={slug} categoryName={category.nameEn || category.nameSi || category.nameTa || name} districtId={village?.district_id} dsDivisionCode={village?.ds_division_code} gnId={gnCode || undefined} />
      </Box>
    </Container>
  );
};

const TopicRow: React.FC<{ category: any; language: 'en' | 'si' | 'ta'; onOpen: () => void; onPrefetch: () => void }> = ({ category, language, onOpen, onPrefetch }) => {
  const { Icon } = getCategoryVisual(category);
  const description = localDescription(category, language);
  return (
    <ButtonBase onClick={onOpen} onMouseEnter={onPrefetch} sx={{ ...rowSx, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-start' }}>
      {category.imagePath ? (
        <Box component="img" src={category.imagePath} alt="" sx={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
      ) : (
        <Icon sx={{ fontSize: 22, color: TEXT_SOFT, flexShrink: 0 }} />
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="span" sx={{ display: 'block', color: TEXT, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 }}>{localName(category, language)}</Typography>
        {description && <Typography component="span" sx={{ display: 'block', color: TEXT_SOFT, fontSize: '0.8125rem', lineHeight: 1.4 }}>{description}</Typography>}
      </Box>
      <ChevronRightSharpIcon sx={{ fontSize: 20, color: TEXT_SOFT, flexShrink: 0 }} />
    </ButtonBase>
  );
};

export default UserCategoryPage;
