import React from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_HOUSING_DATA } from '../graphql/queries';

interface Custom3DBarChartProps {
  district_id?: string;
  city_code?: string;
  gn_id?: string | number;
  location_name?: string;
  language?: 'en' | 'si' | 'ta';
}

// 12 Colors for the 12 bars (generated from a palette)
const palette = [
  { color: '#e74c3c', gradient: 'linear-gradient(to right, #c0392b 0%, #e74c3c 40%, #e74c3c 60%, #c0392b 100%)', topColor: '#ec7063' },
  { color: '#e67e22', gradient: 'linear-gradient(to right, #d35400 0%, #e67e22 40%, #e67e22 60%, #d35400 100%)', topColor: '#eb984e' },
  { color: '#f1c40f', gradient: 'linear-gradient(to right, #f39c12 0%, #f1c40f 40%, #f1c40f 60%, #f39c12 100%)', topColor: '#f4d03f' },
  { color: '#aadd00', gradient: 'linear-gradient(to right, #88b300 0%, #aadd00 40%, #aadd00 60%, #88b300 100%)', topColor: '#c5e84f' },
  { color: '#2ecc71', gradient: 'linear-gradient(to right, #27ae60 0%, #2ecc71 40%, #2ecc71 60%, #27ae60 100%)', topColor: '#58d68d' },
  { color: '#1abc9c', gradient: 'linear-gradient(to right, #16a085 0%, #1abc9c 40%, #1abc9c 60%, #16a085 100%)', topColor: '#48c9b0' },
  { color: '#3498db', gradient: 'linear-gradient(to right, #2980b9 0%, #3498db 40%, #3498db 60%, #2980b9 100%)', topColor: '#5dade2' },
  { color: '#9b59b6', gradient: 'linear-gradient(to right, #8e44ad 0%, #9b59b6 40%, #9b59b6 60%, #8e44ad 100%)', topColor: '#af7ac5' },
  { color: '#34495e', gradient: 'linear-gradient(to right, #2c3e50 0%, #34495e 40%, #34495e 60%, #2c3e50 100%)', topColor: '#5d6d7e' },
  { color: '#e84393', gradient: 'linear-gradient(to right, #d63031 0%, #e84393 40%, #e84393 60%, #d63031 100%)', topColor: '#fd79a8' },
  { color: '#6c5ce7', gradient: 'linear-gradient(to right, #4834d4 0%, #6c5ce7 40%, #6c5ce7 60%, #4834d4 100%)', topColor: '#a29bfe' },
  { color: '#00cec9', gradient: 'linear-gradient(to right, #00b894 0%, #00cec9 40%, #00cec9 60%, #00b894 100%)', topColor: '#81ecec' },
];

const desktopCategoryLabels = [
  { key: 'before_80', label: 'Before 1980' },
  { key: 'y_1980_1989', label: '1980 - 1989' },
  { key: 'y_1990_1994', label: '1990 - 1994' },
  { key: 'y_1995_1999', label: '1995 - 1999' },
  { key: 'y_2000_2004', label: '2000 - 2004' },
  { key: 'y_2005', label: '2005' },
  { key: 'y_2006', label: '2006' },
  { key: 'y_2007', label: '2007' },
  { key: 'y_2008', label: '2008' },
  { key: 'y_2009', label: '2009' },
  { key: 'y_2010', label: '2010' },
  { key: 'y_2011', label: '2011' },
];

const mobileCategoryLabels = [
  { key: 'group_before_90', label: 'Before 1990', sumKeys: ['before_80', 'y_1980_1989'] },
  { key: 'group_90s', label: '1990 - 1999', sumKeys: ['y_1990_1994', 'y_1995_1999'] },
  { key: 'group_early_00s', label: '2000 - 2006', sumKeys: ['y_2000_2004', 'y_2005', 'y_2006'] },
  { key: 'group_late_00s', label: '2007 - 2009', sumKeys: ['y_2007', 'y_2008', 'y_2009'] },
  { key: 'group_2010s', label: '2010 & Newer', sumKeys: ['y_2010', 'y_2011'] },
];

export default function Custom3DBarChart({ district_id, city_code, gn_id, location_name, language = 'en' }: Custom3DBarChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, loading, error } = useQuery(GET_HOUSING_DATA, {
    variables: { district_id, city_code, gn_id },
    skip: !district_id && !city_code && !gn_id,
  });

  console.log('Custom3DBarChart Query Result:', { district_id, city_code, gn_id, data, loading, error });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ color: 'red', textAlign: 'center', py: 5 }}>Error loading 3D Chart: {error.message}</Box>;
  if (!data || !data.housingData) return null;

  const housingData = data.housingData;
  if (!Number(housingData.total_housing_units) || Number(housingData.total_housing_units) === 0) {
    return null;
  }
  
  const total = Number(housingData.total_housing_units);
  const displayLocation = housingData.location_name || location_name || "Selected Location";

  // Prepare chart data dynamically based on the categories
  const categories = isMobile ? mobileCategoryLabels : desktopCategoryLabels;
  
  const chartData = categories.map((cat, index) => {
    let value = 0;
    if (isMobile && cat.sumKeys) {
      value = cat.sumKeys.reduce((sum, key) => sum + Number(housingData[key] || 0), 0);
    } else {
      value = Number(housingData[cat.key] || 0);
    }
    const percent = Math.round((value / total) * 100);
    return {
      id: cat.key,
      title: cat.label,
      percent,
      value,
      // If mobile, we have 5 bars, so we spread the palette index (e.g. 0, 2, 5, 8, 11) to get distinct colors
      ...palette[isMobile ? Math.floor((index * palette.length) / categories.length) : index]
    };
  });

  // Calculate scaling
  const maxPercent = Math.max(...chartData.map(d => d.percent), 10); // Minimum 10% for scale
  const containerHeight = isMobile ? 200 : 500;
  const cylinderWidth = isMobile ? 25 : 60; // Thinner cylinders for 12 bars
  const ellipseHeight = isMobile ? 8 : 20;

  return (
    <Box sx={{ 
      bgcolor: isMobile ? 'transparent' : '#eef2f3', 
      py: isMobile ? 2 : 8, 
      width: '100%', 
      overflowX: 'hidden', 
      overflowY: 'hidden' 
    }}>
      <Container maxWidth={isMobile ? false : "xl"} disableGutters={isMobile}>
        {!isMobile && (
          <>
            <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
              {language === 'en' ? 'Housing Units by Construction Year' : language === 'si' ? 'ඉදිකළ වර්ෂය අනුව නිවාස ඒකක' : 'கட்டப்பட்ட ஆண்டு வாரியாக வீட்டு அலகுகள்'}
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary', mb: 8 }}>
              {displayLocation}
            </Typography>
          </>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: isMobile ? 'space-between' : 'flex-start', 
          alignItems: 'flex-end', 
          height: containerHeight,
          gap: { xs: 1, sm: 3, md: 5 },
          mt: isMobile ? 4 : 10,
          pb: isMobile ? 4 : 10,
          px: isMobile ? 1 : 2,
          position: 'relative',
          minWidth: '100%' // Fit to the box on mobile and desktop
        }}>
          
          {chartData.map((item, index) => {
            // Give even 0% a tiny height for the base
            const barHeight = Math.max((item.percent / maxPercent) * (containerHeight * 0.6), 10);
            
            return (
              <Box 
                key={item.id} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  position: 'relative',
                  flex: 1
                }}
              >
                {/* Floating Information Block */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: barHeight + ellipseHeight + (isMobile ? 45 : 90), 
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
                      color: item.topColor, 
                      fontWeight: 800, 
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: { xs: '0.65rem', sm: '0.75rem', md: '1rem' },
                      mb: 0.5,
                      lineHeight: 1.1
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isMobile ? 'rgba(255,255,255,0.8)' : '#7f8c8d', 
                      fontSize: { xs: '0.6rem', md: '0.75rem' }, 
                      fontWeight: 'bold'
                    }}
                  >
                    {item.value} units
                  </Typography>
                </Box>

                {/* Vertical connecting line */}
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: barHeight + ellipseHeight + (isMobile ? 10 : 20),
                    left: '50%',
                    width: '1px',
                    height: isMobile ? '25px' : '60px',
                    bgcolor: item.topColor,
                    opacity: 0.6,
                    transformOrigin: 'bottom',
                    animation: 'growLine 0.8s ease forwards',
                    animationDelay: `${index * 0.1 + 0.3}s`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-2px',
                      width: '5px',
                      height: '5px',
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
                      top: -ellipseHeight - (isMobile ? 15 : 30),
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: isMobile ? '#fff' : '#2c3e50',
                      fontSize: { xs: '0.7rem', md: '1.2rem' },
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
