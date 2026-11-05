import React from 'react';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import AddSharpIcon from '@mui/icons-material/AddSharp';
import ReplaySharpIcon from '@mui/icons-material/ReplaySharp';
import { getCategoryVisual } from '../categories/categoryVisuals';
import { fill, localName, useContributeCopy } from '../contribute/copy';
import { StatGrid } from '../contribute/ledger';
import { FOREST, LINE, pageTitleSx, quietButton, sectionRule, squareButton, squareOutlineButton, TEXT, TEXT_SOFT } from './Backdrop';
import type { CompleteResponse, RapidFireCard, RapidFireRules } from './api';
import { rankFor } from './scoring';

interface ResultsProps {
  summary: CompleteResponse | null;
  score: number;
  bestStreak: number;
  cardsCount: number;
  rules: RapidFireRules;
  villageName: string;
  error: string | null;
  onPlayAgain: () => void;
  onOtherDeck: () => void;
  onBack: () => void;
  onAddDetails: (card: RapidFireCard) => void;
}

const Results: React.FC<ResultsProps> = ({ summary, score, bestStreak, cardsCount, rules, villageName, error, onPlayAgain, onOtherDeck, onBack, onAddDetails }) => {
  const { t, language } = useContributeCopy();
  const finalScore = summary?.score ?? score;
  const rank = rankFor(finalScore, cardsCount, rules);
  const checked = summary ? summary.yes + summary.no - summary.hasty : 0;

  return (
    <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3, md: 5 }, pb: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 680 }}>
      <Typography sx={{ color: FOREST, fontWeight: 600, fontSize: '0.9375rem' }}>{t[rank]}</Typography>
      <Typography component="h1" sx={{ ...pageTitleSx(language), fontSize: { xs: '1.875rem', sm: '2.5rem' } }}>
        {t.rfResultsTitle}
      </Typography>
      <Typography aria-label={`${t.rfScore} ${finalScore}`} sx={{ color: TEXT, fontWeight: 700, fontSize: { xs: '3.5rem', sm: '4.5rem' }, lineHeight: 1.1, mt: 1, fontVariantNumeric: 'tabular-nums' }}>
        {finalScore}
      </Typography>
      {summary && villageName && <Typography sx={{ color: TEXT_SOFT, fontSize: '1rem', lineHeight: 1.6 }}>{fill(t.rfResultsBody, { n: checked, village: villageName })}</Typography>}

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Without a summary from the server these would all read 0, which is not what happened. */}
      {summary && (
        <StatGrid
          sx={{ mt: 3 }}
          stats={[
            { label: t.rfBestStreak, value: bestStreak },
            { label: t.rfYes, value: summary.yes },
            { label: t.rfNo, value: summary.no },
            { label: t.rfSkipped, value: summary.skipped + summary.unplayed },
          ]}
        />
      )}

      {summary && summary.yes_topics.length > 0 && (
        <Box component="section" aria-labelledby="yes-title" sx={{ ...sectionRule, mt: 4 }}>
          <Typography id="yes-title" component="h2" sx={{ color: TEXT, fontWeight: 600, fontSize: '1.0625rem' }}>{t.rfYesTitle}</Typography>
          <Typography sx={{ color: TEXT_SOFT, fontSize: '0.875rem', lineHeight: 1.6, mt: 0.5, mb: 1.5 }}>{t.rfYesBody}</Typography>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderBottom: `1px solid ${LINE}` }}>
            {summary.yes_topics.map((card) => {
              const { Icon } = getCategoryVisual({ slug: card.deck_slug, nameEn: card.deck_name_en });
              const name = localName(card, language);
              return (
                <Stack component="li" key={card.id} direction="row" spacing={1.5} sx={{ alignItems: 'center', minHeight: 64, py: 1, borderTop: `1px solid ${LINE}` }}>
                  <Icon sx={{ fontSize: 22, color: TEXT_SOFT, flexShrink: 0 }} />
                  <Typography sx={{ flex: 1, minWidth: 0, color: TEXT, fontWeight: 600, fontSize: '0.9375rem' }}>{name}</Typography>
                  {/* Icon only on phones, so the topic name keeps the row's width. */}
                  <Button onClick={() => onAddDetails(card)} aria-label={`${t.rfAddDetails}: ${name}`} startIcon={<AddSharpIcon />} sx={{ ...squareOutlineButton, minHeight: 44, minWidth: 44, px: { xs: 0, sm: 1.5 }, flexShrink: 0, '& .MuiButton-startIcon': { mx: { xs: 0, sm: undefined } } }}>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t.rfAddDetails}</Box>
                  </Button>
                </Stack>
              );
            })}
          </Box>
        </Box>
      )}

      <Stack spacing={1} sx={{ mt: 4 }}>
        <Button onClick={onPlayAgain} startIcon={<ReplaySharpIcon />} fullWidth sx={squareButton}>
          {t.rfPlayAgain}
        </Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button onClick={onOtherDeck} fullWidth sx={squareOutlineButton}>
            {t.rfOtherDeck}
          </Button>
          <Button onClick={onBack} fullWidth sx={quietButton}>
            {t.rfBackToContribute}
          </Button>
        </Stack>
      </Stack>
      </Box>
    </Container>
  );
};

export default Results;
