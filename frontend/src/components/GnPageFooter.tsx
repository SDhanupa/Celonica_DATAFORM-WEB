import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';

interface GnPageFooterProps {
  isDarkMode?: boolean;
}

const GnPageFooter: React.FC<GnPageFooterProps> = () => {
  return (
    <Box sx={{
      bgcolor: '#0f172a',
      color: '#e2e8f0',
      py: { xs: 6, md: 8 },
      borderTop: '1px solid rgba(255,255,255,0.1)',
      mt: 'auto',
      width: '100%',
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={6} justifyContent="space-between">
          
          {/* Branding */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Playfair Display', serif", color: '#ffffff', mb: 2 }}>
              Ceylonica
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.6, maxWidth: 400, mx: { xs: 'auto', md: 0 } }}>
              A modern data intelligence platform delivering regional demographic insights and advanced analytics for the nation.
            </Typography>
          </Grid>
          
          {/* Links / Info */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={4} sx={{ textAlign: { xs: 'center', md: 'left' }, justifyContent: { xs: 'center', md: 'flex-end' } }}>
              
              {/* Quick Links */}
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 3, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Quick Links
                </Typography>
                {['Boundaries', 'Land', 'Roads', 'Natural location', 'Flora'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#94a3b8', mb: 1.5, cursor: 'default' }}>
                    {item}
                  </Typography>
                ))}
              </Grid>

              {/* Categories */}
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 3, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Categories
                </Typography>
                {['Space', 'Building/Land', 'Water base spaces', 'Lines', 'Geographical location'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#94a3b8', mb: 1.5, cursor: 'default' }}>
                    {item}
                  </Typography>
                ))}
              </Grid>

              {/* Insights */}
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 3, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Insights
                </Typography>
                {['Demographics', 'Housing & Infrastructure', 'Economic Activity'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#94a3b8', mb: 1.5, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#38bdf8' } }}>
                    {item}
                  </Typography>
                ))}
              </Grid>

              {/* Platform */}
              <Grid item xs={6} sm={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 3, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Platform
                </Typography>
                {['About Project', 'Methodology', 'Privacy Policy'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#94a3b8', mb: 1.5, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#38bdf8' } }}>
                    {item}
                  </Typography>
                ))}
              </Grid>
              
            </Grid>
          </Grid>
        </Grid>
        
        {/* Footer Bottom */}
        <Box sx={{ 
          mt: 8, 
          pt: 4, 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            &copy; {new Date().getFullYear()} Ceylonica Data Platform. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            Designed with precision and care
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default GnPageFooter;
