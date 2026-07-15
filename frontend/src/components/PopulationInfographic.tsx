import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, useMediaQuery, useTheme } from '@mui/material';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ElderlyIcon from '@mui/icons-material/Elderly';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';

const data = [
  { percent: 25, color: '#3A7BD5', label: 'Adult Males', description: 'Working Age', icon: <MaleIcon /> },
  { percent: 15, color: '#00D2FF', label: 'Adult Females', description: 'Working Age', icon: <FemaleIcon /> },
  { percent: 10, color: '#E55D87', label: 'Youth', description: '15-24 Years', icon: <SchoolIcon /> },
  { percent: 10, color: '#FF9966', label: 'Children', description: '0-14 Years', icon: <ChildCareIcon /> },
  { percent: 15, color: '#5C258D', label: 'Seniors', description: '65+ Years', icon: <ElderlyIcon /> },
  { percent: 5,  color: '#4389A2', label: 'Infants', description: '0-2 Years', icon: <HomeIcon /> },
  { percent: 20, color: '#F37335', label: 'Employed', description: 'Full-time', icon: <WorkIcon /> },
];

interface PopulationInfographicProps {
  populationData?: { male: number; female: number; both: number } | null;
  language?: 'en' | 'si' | 'ta';
}

const translations = {
  en: { male: 'Male', female: 'Female', total: 'Total', population: 'Population' },
  si: { male: 'පිරිමි', female: 'කාන්තා', total: 'මුළු', population: 'ජනගහනය' },
  ta: { male: 'ஆண்', female: 'பெண்', total: 'மொத்த', population: 'மக்கள் தொகை' }
};

export default function PopulationInfographic({ populationData, language = 'en' }: PopulationInfographicProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const t = translations[language];

  // Use dynamic data if available, otherwise fallback to 0
  const totalCount = populationData?.both || 0;
  const maleCount = populationData?.male || 0;
  const femaleCount = populationData?.female || 0;
  
  const hasData = totalCount > 0;
  
  // Calculate percentages for the pie chart slices
  const malePercent = hasData ? (maleCount / totalCount) * 100 : 50;
  const femalePercent = hasData ? (femaleCount / totalCount) * 100 : 50;

  const activeData = [
    { percent: malePercent, color: hasData ? '#3A7BD5' : '#888', label: t.male, description: hasData ? maleCount.toLocaleString() : '0', icon: <MaleIcon />, count: maleCount },
    { percent: femalePercent, color: hasData ? '#E55D87' : '#999', label: t.female, description: hasData ? femaleCount.toLocaleString() : '0', icon: <FemaleIcon />, count: femaleCount },
  ];

  useEffect(() => {
    // Stagger animation
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getCoordinatesForPercent = (percent: number, radius: number) => {
    // Start at top (rotate -90 deg)
    const x = Math.cos(2 * Math.PI * percent - Math.PI / 2) * radius;
    const y = Math.sin(2 * Math.PI * percent - Math.PI / 2) * radius;
    return { x, y };
  };

  let cumulativePercent = 0;
  const radius = 100;
  
  const slices = activeData.map((slice, index) => {
    const startX = getCoordinatesForPercent(cumulativePercent, radius).x;
    const startY = getCoordinatesForPercent(cumulativePercent, radius).y;
    
    const midPercent = cumulativePercent + (slice.percent / 100) / 2;
    const midPoint = getCoordinatesForPercent(midPercent, radius);
    
    // Label endpoints
    const lineStart = getCoordinatesForPercent(midPercent, radius - 5);
    const lineEnd = getCoordinatesForPercent(midPercent, radius + 30);
    const textPos = getCoordinatesForPercent(midPercent, radius + 75);
    
    cumulativePercent += slice.percent / 100;
    
    const endX = getCoordinatesForPercent(cumulativePercent, radius).x;
    const endY = getCoordinatesForPercent(cumulativePercent, radius).y;
    
    const largeArcFlag = slice.percent > 50 ? 1 : 0;
    
    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`,
    ].join(' ');

    // Explode effect logic
    const explodeOffset = [0, 2, 4].includes(index) ? 10 : 0; // explode specific slices to match image style
    const transformX = (midPoint.x / radius) * explodeOffset;
    const transformY = (midPoint.y / radius) * explodeOffset;

    return { ...slice, pathData, midPoint, lineStart, lineEnd, textPos, transformX, transformY, midPercent, index };
  });

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: isMobile ? '280px' : '350px' }}>
      


      <svg viewBox="-220 -220 440 440" width="100%" height="100%" style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))', transform: isMobile ? 'scale(1.35)' : 'none' }}>
        {slices.map((slice) => (
          <g 
            key={slice.label} 
            style={{ 
              transform: mounted ? `translate(${slice.transformX}px, ${slice.transformY}px)` : 'translate(0,0) scale(0)',
              transition: `all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${slice.index * 0.1}s`,
              transformOrigin: '0 0'
            }}
          >
            {/* Pie Slice */}
            <path
              d={slice.pathData}
              fill={slice.color}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            
            {/* Label Text on Slice (Mobile Only) */}
            {isMobile && (
              <text
                x={slice.midPoint.x * 0.70}
                y={slice.midPoint.y * 0.70 - 10}
                fill="rgba(255,255,255,0.9)"
                fontSize="14"
                fontWeight="normal"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {slice.label}
              </text>
            )}

            {/* Count Text on Slice (Always Visible) */}
            <text
              x={slice.midPoint.x * 0.70}
              y={slice.midPoint.y * 0.70 + (isMobile ? 12 : 0)}
              fill="#fff"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {slice.count > 0 ? slice.count.toLocaleString() : ''}
            </text>

            {/* Connecting lines and dots (Desktop Only) */}
            {!isMobile && (
              <>
                {/* Dot at start of line */}
                <circle cx={slice.lineStart.x} cy={slice.lineStart.y} r="4" fill="#fff" />
                {/* Line connecting slice to text */}
                <path
                  d={`M ${slice.lineStart.x} ${slice.lineStart.y} L ${slice.lineEnd.x} ${slice.lineEnd.y} L ${slice.lineEnd.x > 0 ? slice.lineEnd.x + 20 : slice.lineEnd.x - 20} ${slice.lineEnd.y}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                />
                <circle cx={slice.lineEnd.x > 0 ? slice.lineEnd.x + 20 : slice.lineEnd.x - 20} cy={slice.lineEnd.y} r="3" fill={slice.color} />
              </>
            )}
          </g>
        ))}
        
        {/* Center Donut Hole for Total Population */}
        <circle cx="0" cy="0" r="42" fill="rgba(30, 30, 30, 0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x="0" y="-12" fill="#fff" fontSize="9" textAnchor="middle" opacity="0.8">{t.total}</text>
        <text x="0" y="-2" fill="#fff" fontSize="9" textAnchor="middle" opacity="0.8">{t.population}</text>
        <text x="0" y="15" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">{totalCount.toLocaleString()}</text>
      </svg>

      {/* HTML overlay for Icons and Text (Desktop Only) */}
      {!isMobile && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {slices.map((slice) => {
            const isRight = slice.midPercent < 0.5;
            return (
              <Fade in={mounted} style={{ transitionDelay: `${0.5 + slice.index * 0.1}s` }} key={slice.label}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${slice.textPos.x * 1.6}px), calc(-50% + ${slice.textPos.y * 1.6}px))`,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: isRight ? 'row' : 'row-reverse',
                    gap: 1,
                    color: '#fff',
                    width: '140px'
                  }}
                >
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    p: 0.5, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    backdropFilter: 'blur(5px)',
                    color: slice.color,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    {slice.icon}
                  </Box>
                  <Box sx={{ textAlign: isRight ? 'left' : 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.5px' }}>
                      {slice.label}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </Box>
      )}

    </Box>
  );
}
