import React from 'react';
import { Box, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import PollRoundedIcon from '@mui/icons-material/PollRounded';
import { useLanguage } from '../../context/LanguageContext';
import { glassSx } from '../glass';

interface MobileBottomNavProps {
  isDarkMode?: boolean;
  onHome: () => void;
  onCategories: () => void;
  onLocation: () => void;
  onSurvey: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isDarkMode = false, onHome, onCategories, onLocation, onSurvey,
}) => {
  const { language } = useLanguage();
  const L = (en: string, si: string, ta: string) => (language === 'si' ? si : language === 'ta' ? ta : en);

  const items = [
    { key: 'home', icon: <HomeRoundedIcon />, label: L('Home', 'මුල් පිටුව', 'முகப்பு'), onClick: onHome },
    { key: 'categories', icon: <GridViewRoundedIcon />, label: L('Categories', 'ප්‍රවර්ග', 'வகைகள்'), onClick: onCategories },
    { key: 'location', icon: <PlaceRoundedIcon />, label: L('Location', 'ස්ථානය', 'இடம்'), onClick: onLocation },
    { key: 'survey', icon: <PollRoundedIcon />, label: L('Survey', 'සමීක්ෂණය', 'ஆய்வு'), onClick: onSurvey },
  ];

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        left: 10, right: 10, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        zoom: 0.8,
        maxWidth: 600, mx: 'auto',
        zIndex: 1200,
        p: 0.5,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        ...glassSx(isDarkMode),
        borderRadius: '26px',
        fontFamily: "'Poppins', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
      }}
    >
      {items.map((item) => (
        <Box
          key={item.key}
          role="button"
          tabIndex={0}
          onClick={item.onClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') item.onClick(); }}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 52,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.2,
            cursor: 'pointer',
            color: isDarkMode ? '#e2e8f0' : '#334155',
            borderRadius: '14px',
            transition: 'color 0.2s ease, background 0.2s ease',
            '& .MuiSvgIcon-root': { fontSize: '1.5rem' },
            '&:active': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)' },
            '&:focus-visible': { outline: '2px solid #2d5e41', outlineOffset: -2 },
          }}
        >
          {item.icon}
          <Typography sx={{ color: 'inherit', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1, letterSpacing: '0.1px' }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default MobileBottomNav;
