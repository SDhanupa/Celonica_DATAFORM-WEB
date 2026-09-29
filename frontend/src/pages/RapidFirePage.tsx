import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useAuth } from '../auth/AuthProvider';
import { ApiError } from '../api/contributions';
import UserTopBar from '../components/contribute/UserTopBar';
import { useContributeCopy } from '../components/contribute/copy';
import { readSavedVillage, villageCode, villageName } from '../components/contribute/village';
import { DecksResponse, RapidFireAnswer, RapidFireCard, rapidFireApi } from '../components/rapidFire/api';
import { displayScore, gameReducer, initialGameState } from '../components/rapidFire/gameReducer';
import Lobby from '../components/rapidFire/Lobby';
import PlayStage from '../components/rapidFire/PlayStage';
import Results from '../components/rapidFire/Results';
import { useAnswerQueue } from '../components/rapidFire/useAnswerQueue';

const RapidFirePage: React.FC = () => {
  const { getToken } = useAuth();
  const { t, language } = useContributeCopy();
  const navigate = useNavigate();
  const api = useMemo(() => rapidFireApi(getToken), [getToken]);

  const village = useMemo(readSavedVillage, []);
  const ccode = villageCode(village);
  const vName = villageName(village, language);

  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [decks, setDecks] = useState<DecksResponse | null>(null);
  const [decksLoading, setDecksLoading] = useState(Boolean(ccode));
  const [decksError, setDecksError] = useState(false);
  const [decksNonce, setDecksNonce] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const finishing = useRef(false);

  /* ── Decks ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!ccode) return;
    const controller = new AbortController();
    setDecksLoading(true);
    setDecksError(false);
    api
      .decks(ccode, controller.signal)
      .then((data) => !controller.signal.aborted && setDecks(data))
      .catch(() => !controller.signal.aborted && setDecksError(true))
      .finally(() => !controller.signal.aborted && setDecksLoading(false));
    return () => controller.abort();
  }, [api, ccode, decksNonce]);

  const reloadDecks = useCallback(() => setDecksNonce((n) => n + 1), []);

  /* ── Answer delivery ───────────────────────────────────────────────────── */
  const { enqueue, flush, reset: resetQueue, pending, failed } = useAnswerQueue({
    send: (item) => api.answer(item.sessionId, item.cardId, item.answer, item.responseMs),
    onConfirmed: (item, response) => dispatch({ type: 'CONFIRMED', cardId: item.cardId, response }),
    onExpired: () => {
      dispatch({ type: 'EXPIRED' });
      setNotice(t.rfExpired);
      reloadDecks();
    },
    onUnauthorized: () => {
      dispatch({ type: 'EXPIRED' });
      setNotice(t.errSession);
    },
  });

  /* ── Game actions ──────────────────────────────────────────────────────── */
  const start = useCallback(
    async (deck: string) => {
      if (!ccode) return;
      setNotice(null);
      resetQueue();
      finishing.current = false;
      dispatch({ type: 'START_REQUEST', deck });
      try {
        dispatch({ type: 'START_SUCCESS', response: await api.start(ccode, deck) });
        window.scrollTo({ top: 0 });
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t.rfDecksError;
        dispatch({ type: 'START_FAILURE', error: message });
        setNotice(message);
        reloadDecks();
      }
    },
    [api, ccode, resetQueue, reloadDecks, t],
  );

  const handleAnswer = useCallback(
    (answer: RapidFireAnswer, responseMs: number | null) => {
      const card = state.cards[state.index];
      if (!card || !state.sessionId) return;
      dispatch({ type: 'ANSWER', answer, responseMs });
      enqueue({ sessionId: state.sessionId, cardId: card.id, answer, responseMs });
    },
    [enqueue, state.cards, state.index, state.sessionId],
  );

  const quit = useCallback(() => dispatch({ type: 'FINISH_REQUEST' }), []);

  // Close the round only after every answer has reached the server, so the
  // summary it returns reflects all of them.
  useEffect(() => {
    if (state.phase !== 'finishing' || !state.sessionId || finishing.current) return;
    finishing.current = true;
    const sessionId = state.sessionId;
    (async () => {
      await flush();
      try {
        dispatch({ type: 'FINISH_SUCCESS', summary: await api.complete(sessionId) });
      } catch (err) {
        dispatch({ type: 'FINISH_FAILURE', error: err instanceof ApiError ? err.message : t.rfSaveError });
      }
      reloadDecks();
      window.scrollTo({ top: 0 });
    })();
  }, [api, flush, reloadDecks, state.phase, state.sessionId, t]);

  const addDetails = (card: RapidFireCard) => navigate(`/user/categories/${card.path}`);

  /* ── Render ────────────────────────────────────────────────────────────── */
  if (!ccode) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <UserTopBar />
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
            <PlaceOutlinedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>{t.chooseVillage}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t.rfTaglineNoVillage}
            </Typography>
            <Button variant="contained" disableElevation onClick={() => navigate('/user')}>
              {t.chooseVillage}
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  if ((state.phase === 'countdown' || state.phase === 'playing' || state.phase === 'finishing') && state.rules) {
    return (
      <PlayStage
        phase={state.phase}
        cards={state.cards}
        index={state.index}
        rules={state.rules}
        outcomes={state.outcomes}
        score={displayScore(state)}
        streak={state.streak}
        feedback={state.feedback}
        villageName={vName}
        saving={pending > 1}
        onCountdownDone={() => dispatch({ type: 'COUNTDOWN_DONE' })}
        onAnswer={handleAnswer}
        onQuit={quit}
      />
    );
  }

  if (state.phase === 'results' && state.rules) {
    return (
      <Results
        summary={state.summary}
        score={displayScore(state)}
        bestStreak={state.bestStreak}
        cardsCount={state.cards.length}
        rules={state.rules}
        villageName={vName}
        error={state.error || (failed > 0 ? t.rfSaveError : null)}
        onPlayAgain={() => state.deck && start(state.deck)}
        onOtherDeck={() => dispatch({ type: 'RESET' })}
        onBack={() => navigate('/user')}
        onAddDetails={addDetails}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <UserTopBar />
      <Lobby
        villageName={vName}
        decks={decks}
        loading={decksLoading}
        loadError={decksError}
        onRetry={reloadDecks}
        onStart={start}
        startingDeck={state.phase === 'starting' ? state.deck : null}
        notice={notice}
      />
    </Box>
  );
};

export default RapidFirePage;
