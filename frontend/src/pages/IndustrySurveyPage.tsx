import React, { useState } from 'react';
import GnTopHeaderBar from '../components/GnTopHeaderBar';
import { Box, Typography, Button, Container, TextField, CircularProgress, Paper } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import { useQuery } from '@apollo/client';
import { GET_QUESTIONS } from '../graphql/queries';
import { useParams } from 'react-router-dom';

const IndustrySurveyPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const { language } = useLanguage();
  const { gnName, ccode } = useParams<{ gnName?: string, ccode?: string }>();
  const { data, loading, error } = useQuery(GET_QUESTIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const title = {
    en: 'Industry and Business Survey Questionnaire',
    si: 'කර්මාන්ත හා ව්‍යාපාර සමීක්ෂණ ප්‍රශ්නාවලිය',
    ta: 'தொழில் மற்றும் வணிக ஆய்வு கேள்வித்தாள்',
  }[language] || 'Industry and Business Survey Questionnaire';

  if (!isAuthenticated) {
    return (
      <Box>
        <GnTopHeaderBar activeCcode={ccode} activeGnObj={gnName ? { nameEn: gnName } : null} />
        <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center', minHeight: '80vh' }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">{title}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {language === 'en' ? 'You must be logged in to fill out this survey.' : language === 'si' ? 'මෙම සමීක්ෂණය පිරවීමට ඔබ පුරනය වී සිටිය යුතුය.' : 'இந்தக் கணக்கெடுப்பை நிரப்ப நீங்கள் உள்நுழைந்திருக்க வேண்டும்.'}
          </Typography>
          <Button variant="contained" size="large" color="primary" onClick={() => login(window.location.href)} sx={{ px: 4, py: 1.5, borderRadius: '30px' }}>
            {language === 'en' ? 'Login to Fill Survey' : language === 'si' ? 'සමීක්ෂණය පිරවීමට පිවිසෙන්න' : 'உள்நுழைக'}
          </Button>
        </Container>
      </Box>
    );
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Failed to load survey questions.</Typography>;

  const questions = (data?.questions || []).filter((q: any) => q.section === 'INDUSTRY_SURVEY').sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const handleInputChange = (id: string, val: string) => {
    setFormValues(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Survey submitted successfully!');
    // TODO: implement actual submission
  };

  return (
      <Box>
        <GnTopHeaderBar activeCcode={ccode} activeGnObj={gnName ? { nameEn: gnName } : null} />
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: '20px', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" color="primary">{title}</Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {questions.map((q: any) => {
                const qText = language === 'si' ? (q.questionTextSi || q.questionTextEn) : language === 'ta' ? (q.questionTextTa || q.questionTextEn) : q.questionTextEn;
                return (
                  <TextField
                    key={q.id}
                    label={qText}
                    variant="outlined"
                    fullWidth
                    multiline={qText.length > 50}
                    rows={qText.length > 50 ? 3 : 1}
                    value={formValues[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                  />
                );
              })}
              
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, borderRadius: '30px', py: 1.5 }}>
                {language === 'en' ? 'Submit Survey' : language === 'si' ? 'සමීක්ෂණය ඉදිරිපත් කරන්න' : 'கணக்கெடுப்பை சமர்ப்பிக்கவும்'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
  );
};

export default IndustrySurveyPage;
