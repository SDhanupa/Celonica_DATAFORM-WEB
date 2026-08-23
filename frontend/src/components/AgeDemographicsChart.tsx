import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';

interface Age3DBarChartProps {
  isDarkMode?: boolean;
  data?: {
    age_0_14?: number;
    age_15_59?: number;
    age_60_64?: number;
    age_65_above?: number;
  };
  location_name?: string;
  }

// 4 Colors for the 4 age bars
const palette = [
  { color: '#e74c3c', gradient: 'linear-gradient(to right, #c0392b 0%, #e74c3c 40%, #e74c3c 60%, #c0392b 100%)', topColor: '#ec7063' },
  { color: '#f1c40f', gradient: 'linear-gradient(to right, #f39c12 0%, #f1c40f 40%, #f1c40f 60%, #f39c12 100%)', topColor: '#f4d03f' },
  { color: '#2ecc71', gradient: 'linear-gradient(to right, #27ae60 0%, #2ecc71 40%, #2ecc71 60%, #27ae60 100%)', topColor: '#58d68d' },
  { color: '#3498db', gradient: 'linear-gradient(to right, #2980b9 0%, #3498db 40%, #3498db 60%, #2980b9 100%)', topColor: '#5dade2' },
];

const translations = {
  en: {
    title: 'Population by Age Demographic',
    age_0_14: '0 - 14 Years',
    age_15_59: '15 - 59 Years',
    age_60_64: '60 - 64 Years',
    age_65_above: '65 & Above',
  },
  si: {
    title: 'වයස් කාණ්ඩය අනුව ජනගහනය',
    age_0_14: 'අවුරුදු 0 - 14',
    age_15_59: 'අවුරුදු 15 - 59',
    age_60_64: 'අවුරුදු 60 - 64',
    age_65_above: 'අවුරුදු 65 සහ ඊට වැඩි',
  },
  ta: {
    title: 'வயது அடிப்படையில் மக்கள் தொகை',
    age_0_14: '0 - 14 வருடங்கள்',
    age_15_59: '15 - 59 வருடங்கள்',
    age_60_64: '60 - 64 வருடங்கள்',
    age_65_above: '65 மற்றும் அதற்கு மேல்',
  }
};

const categoryKeys = [
  'age_0_14',
  'age_15_59',
  'age_60_64',
  'age_65_above',
];

export default function Age3DBarChart({ isDarkMode = false,  data, location_name}: Age3DBarChartProps) {
  const { language } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!data) return null;
  
  const total = Number(data.age_0_14 || 0) + Number(data.age_15_59 || 0) + Number(data.age_60_64 || 0) + Number(data.age_65_above || 0);
  if (total === 0) return null;
  const displayLocation = location_name || "Selected Location";

  const t = translations[language] || translations.en;

  // Prepare chart data dynamically
  const chartData = categoryKeys.map((key, index) => {
    const value = Number(data[key as keyof typeof data] || 0);
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return {
      id: key,
      title: t[key as keyof typeof t],
      percent,
      value,
      ...palette[index]
    };
  });

  // Calculate scaling
  const maxPercent = Math.max(...chartData.map(d => d.percent), 10); // Minimum 10% for scale
  const containerHeight = isMobile ? 250 : 500;
  const cylinderWidth = isMobile ? 40 : 80; 
  const ellipseHeight = isMobile ? 12 : 25;

  return (
    <Box sx={{ 
      bgcolor: 'transparent', 
      py: isMobile ? 2 : 8, 
      width: '100%', 
      overflowX: 'hidden', 
      overflowY: 'hidden' 
    }}>
      <Container maxWidth={isMobile ? false : "xl"} disableGutters={isMobile}>
        {!isMobile && (
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4, 
            mx: 'auto', 
            width: 'fit-content', 
            bgcolor: isDarkMode ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.5)', 
            backdropFilter: 'blur(10px)', 
            borderRadius: '20px', 
            p: 2, 
            px: 4, 
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)' 
          }}>
            <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
              {t.title}
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary', mb: 0 }}>
              {displayLocation}
            </Typography>
          </Box>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: isMobile ? 'space-around' : 'center', 
          alignItems: 'flex-end', 
          height: containerHeight,
          gap: { xs: 2, sm: 4, md: 8 },
          mt: isMobile ? 4 : 10,
          pb: isMobile ? 4 : 10,
          px: isMobile ? 2 : 4,
          position: 'relative',
          minWidth: '100%' 
        }}>
          
          {chartData.map((item, index) => {
            // Give even 0% a tiny height for the base
            const barHeight = Math.max((item.percent / maxPercent) * (containerHeight * 0.6), 15);
            
            return (
              <Box 
                key={item.id} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  position: 'relative',
                  flex: isMobile ? 1 : '0 1 auto',
                  minWidth: cylinderWidth
                }}
              >
                {/* Floating Information Block */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: barHeight + ellipseHeight + (isMobile ? 50 : 100), 
                    width: cylinderWidth * 2.5,
                    textAlign: 'center',
                    opacity: 0,
                    animation: 'fadeInUp 0.8s ease forwards',
                    animationDelay: `${index * 0.1}s`,
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: isDarkMode ? '#ffffff' : '#111111', 
                      textShadow: isDarkMode ? 'none' : '0px 0px 4px rgba(255,255,255,0.8)',
                      fontWeight: 900, 
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
                      mb: 0.5,
                      lineHeight: 1.1
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#dddddd' : '#333333', 
                      fontSize: { xs: '0.65rem', md: '0.85rem' }, 
                      fontWeight: '900'
                    }}
                  >
                    {item.value.toLocaleString()}
                  </Typography>
                </Box>

                {/* Vertical connecting line */}
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: barHeight + ellipseHeight + (isMobile ? 15 : 25),
                    left: '50%',
                    width: '2px',
                    height: isMobile ? '30px' : '70px',
                    bgcolor: item.topColor,
                    opacity: 0.6,
                    transformOrigin: 'bottom',
                    animation: 'growLine 0.8s ease forwards',
                    animationDelay: `${index * 0.1 + 0.3}s`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-2.5px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      bgcolor: item.topColor
                    },
                    '@keyframes growLine': {
                      from: { transform: 'scaleY(0)' },
                      to: { transform: 'scaleY(1)' }
                    }
                  }}
                />

                {/* The 3D Cylinder */}
                <Box sx={{ position: 'relative', width: cylinderWidth, height: barHeight }}>
                  
                  {/* Text % above the top oval */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: -ellipseHeight - (isMobile ? 20 : 35),
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: isDarkMode ? '#ffffff' : (isMobile ? '#fff' : '#2c3e50'),
                      fontSize: { xs: '0.8rem', md: '1.4rem' },
                      fontWeight: 900,
                      opacity: 0,
                      animation: 'fadeInUp 0.8s ease forwards',
                      animationDelay: `${index * 0.1 + 0.5}s`,
                      fontFamily: "'Oswald', sans-serif",
                      textShadow: '0px 2px 10px rgba(0,0,0,0.2)',
                      zIndex: 3
                    }}
                  >
                    {item.percent}%
                  </Typography>

                  {/* Top Oval */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: -ellipseHeight / 2,
                      left: 0,
                      width: '100%',
                      height: ellipseHeight,
                      bgcolor: item.topColor,
                      borderRadius: '50%',
                      zIndex: 2,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  
                  {/* Cylinder Body */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: item.gradient,
                      zIndex: 1
                    }}
                  />
                  
                  {/* Bottom Oval */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      bottom: -ellipseHeight / 2,
                      left: 0,
                      width: '100%',
                      height: ellipseHeight,
                      background: item.gradient,
                      borderRadius: '50%',
                      zIndex: 1,
                      boxShadow: '0px 10px 10px rgba(0,0,0,0.3)'
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
