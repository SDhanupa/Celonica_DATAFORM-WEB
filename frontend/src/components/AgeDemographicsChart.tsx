import React from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';

interface Age3DBarChartProps {
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

const categoryLabels = [
  { key: 'age_0_14', label: '0 - 14 Years' },
  { key: 'age_15_59', label: '15 - 59 Years' },
  { key: 'age_60_64', label: '60 - 64 Years' },
  { key: 'age_65_above', label: '65 & Above' },
];

export default function Age3DBarChart({ data, location_name }: Age3DBarChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!data) return null;
  
  const total = Number(data.age_0_14 || 0) + Number(data.age_15_59 || 0) + Number(data.age_60_64 || 0) + Number(data.age_65_above || 0);
  if (total === 0) return null;
  const displayLocation = location_name || "Selected Location";

  // Prepare chart data dynamically
  const chartData = categoryLabels.map((cat, index) => {
    const value = Number(data[cat.key as keyof typeof data] || 0);
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return {
      id: cat.key,
      title: cat.label,
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
              Population by Age Demographic
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary', mb: 8 }}>
              {displayLocation}
            </Typography>
          </>
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
                      color: item.topColor, 
                      fontWeight: 800, 
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
                      color: isMobile ? 'rgba(255,255,255,0.8)' : '#7f8c8d', 
                      fontSize: { xs: '0.65rem', md: '0.85rem' }, 
                      fontWeight: 'bold'
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
                      color: isMobile ? '#fff' : '#2c3e50',
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
