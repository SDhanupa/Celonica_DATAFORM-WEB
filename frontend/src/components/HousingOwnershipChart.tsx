import React from 'react';
import { Box, Typography, Container, useTheme, useMediaQuery } from '@mui/material';

interface HousingOwnershipChartProps {
  data?: {
    owned_by_member?: number;
    rent_gov?: number;
    rent_private?: number;
    free_of_rent?: number;
    encroached?: number;
    other?: number;
  };
  location_name?: string;
  language?: 'en' | 'si' | 'ta';
}

// Colors for the 6 categories
const palette = [
  { color: '#e74c3c', gradient: 'linear-gradient(to right, #c0392b 0%, #e74c3c 40%, #e74c3c 60%, #c0392b 100%)', topColor: '#ec7063' }, // Red - Owned
  { color: '#f1c40f', gradient: 'linear-gradient(to right, #f39c12 0%, #f1c40f 40%, #f1c40f 60%, #f39c12 100%)', topColor: '#f4d03f' }, // Yellow - Rent Gov
  { color: '#2ecc71', gradient: 'linear-gradient(to right, #27ae60 0%, #2ecc71 40%, #2ecc71 60%, #27ae60 100%)', topColor: '#58d68d' }, // Green - Rent Private
  { color: '#3498db', gradient: 'linear-gradient(to right, #2980b9 0%, #3498db 40%, #3498db 60%, #2980b9 100%)', topColor: '#5dade2' }, // Blue - Free
  { color: '#9b59b6', gradient: 'linear-gradient(to right, #8e44ad 0%, #9b59b6 40%, #9b59b6 60%, #8e44ad 100%)', topColor: '#af7ac5' }, // Purple - Encroached
  { color: '#95a5a6', gradient: 'linear-gradient(to right, #7f8c8d 0%, #95a5a6 40%, #95a5a6 60%, #7f8c8d 100%)', topColor: '#aab7b8' }, // Gray - Other
];

const categoryLabels = [
  { key: 'owned_by_member', label: 'Owned' },
  { key: 'rent_gov', label: 'Rent (Gov)' },
  { key: 'rent_private', label: 'Rent (Private)' },
  { key: 'free_of_rent', label: 'Rent Free' },
  { key: 'encroached', label: 'Encroached' },
  { key: 'other', label: 'Other' },
];

export default function HousingOwnershipChart({ data, location_name, language = 'en' }: HousingOwnershipChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!data || Object.values(data).reduce((a, b) => a + (b || 0), 0) === 0) {
    return null;
  }
  
  const total = Number(data.owned_by_member || 0) + 
                Number(data.rent_gov || 0) + 
                Number(data.rent_private || 0) + 
                Number(data.free_of_rent || 0) + 
                Number(data.encroached || 0) + 
                Number(data.other || 0);
  
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
  const containerHeight = isMobile ? 220 : 500;
  const cylinderWidth = isMobile ? 30 : 60; 
  const ellipseHeight = isMobile ? 10 : 20;

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
              Housing Ownership Status
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary', mb: 8 }}>
              {displayLocation}
            </Typography>
          </>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: isMobile ? 'space-between' : 'center', 
          alignItems: 'flex-end', 
          height: containerHeight,
          gap: { xs: 1, sm: 2, md: 4 },
          mt: isMobile ? 4 : 10,
          pb: isMobile ? 4 : 10,
          px: isMobile ? 1 : 4,
          position: 'relative',
          minWidth: '100%' 
        }}>
          
          {chartData.map((item, index) => {
            const barHeight = Math.max((item.percent / maxPercent) * (containerHeight * 0.6), 10);
            
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
                    bottom: barHeight + ellipseHeight + (isMobile ? 30 : 100), 
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
                      fontSize: { xs: '0.65rem', sm: '1rem', md: '1.25rem' },
                      mb: 0.5,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isMobile ? 'rgba(255,255,255,0.8)' : '#7f8c8d', 
                      fontSize: { xs: '0.6rem', md: '0.85rem' }, 
                      fontWeight: 'bold'
                    }}
                  >
                    {item.value.toLocaleString()}
                  </Typography>
                </Box>

                {/* Vertical connecting line */}
                <Box 
                  sx={{
                    width: '1px',
                    height: isMobile ? 25 : 80,
                    bgcolor: item.topColor,
                    position: 'absolute',
                    bottom: barHeight + ellipseHeight + 2,
                    opacity: 0.5,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: -2,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: item.topColor,
                    }
                  }}
                />

                {/* Percentage label above cylinder */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    position: 'absolute',
                    bottom: barHeight + ellipseHeight + 5,
                    fontWeight: 900,
                    color: isMobile ? '#fff' : '#2c3e50',
                    textShadow: isMobile ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                    zIndex: 2,
                    fontSize: { xs: '0.7rem', md: '1.1rem' }
                  }}
                >
                  {item.percent}%
                </Typography>

                {/* 3D Cylinder representation */}
                <Box sx={{ position: 'relative', width: cylinderWidth, height: barHeight, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Top Ellipse (Lid) */}
                  <Box 
                    sx={{
                      width: '100%',
                      height: ellipseHeight * 2,
                      bgcolor: item.topColor,
                      borderRadius: '50%',
                      position: 'absolute',
                      top: -ellipseHeight,
                      zIndex: 2,
                      boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.5)'
                    }}
                  />
                  
                  {/* Cylinder Body */}
                  <Box 
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: item.gradient,
                      position: 'absolute',
                      top: 0,
                      zIndex: 1,
                      boxShadow: '-3px 0 10px rgba(0,0,0,0.1)'
                    }}
                  />

                  {/* Bottom Ellipse (Base) */}
                  <Box 
                    sx={{
                      width: '100%',
                      height: ellipseHeight * 2,
                      background: item.gradient,
                      borderRadius: '50%',
                      position: 'absolute',
                      bottom: -ellipseHeight,
                      zIndex: 0,
                      boxShadow: '0 10px 15px rgba(0,0,0,0.3)'
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
