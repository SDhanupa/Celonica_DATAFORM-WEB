import React from 'react';
import { glassTileSx } from './glass';
import { Box, Typography } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useLanguage } from '../context/LanguageContext';

export interface VillageQuickStatsProps {
  populationData?: any;
  gnEconomyData?: any;
  housingOwnershipData?: any;
  roomsData?: any;
  isDarkMode?: boolean;
  /** `compact` trims padding/type scale for use inside the hero band. */
  variant?: 'default' | 'compact';
  /**
   * `row` = 3 tiles side by side (wide containers).
   * `column` = 3 stacked rows, label left / value right — keeps the full
   * labels readable inside a narrow column instead of truncating them.
   */
  orientation?: 'row' | 'column';
}

/**
 * At-a-glance KPI tiles (Population / Households / Employed).
 * Single source of truth for how these three figures are derived, so the hero
 * band and the demographics column can never drift apart.
 */
export const VillageQuickStats: React.FC<VillageQuickStatsProps> = ({
  populationData,
  gnEconomyData,
  housingOwnershipData,
  roomsData,
  isDarkMode = false,
  variant = 'default',
  orientation = 'row',
}) => {
  const { language } = useLanguage();
  const compact = variant === 'compact';

  const totalPopulation = populationData?.both ?? ((populationData?.male ?? 0) + (populationData?.female ?? 0));
  const totalHouseholds = housingOwnershipData?.total_households || roomsData?.total_housing_units || 0;
  const employedCount = gnEconomyData?.employed || 0;

  const stats = [
    {
      label: { en: 'VILLAGE POPULATION', si: 'ග්‍රාමීය ජනගහනය', ta: 'கிராம மக்கள்தொகை' }[language] || 'VILLAGE POPULATION',
      value: totalPopulation,
      icon: <GroupsOutlinedIcon />,
    },
    {
      label: { en: 'Households', si: 'ගෘහ ඒකක', ta: 'குடும்பங்கள்' }[language] || 'Households',
      value: totalHouseholds,
      icon: <HomeOutlinedIcon />,
    },
    {
      label: { en: 'Employed', si: 'රැකියා නියුක්ත', ta: 'வேலைவாய்ப்பு' }[language] || 'Employed',
      value: employedCount,
      icon: <WorkOutlineOutlinedIcon />,
    },
  ];

  const isColumn = orientation === 'column';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: isColumn ? '1fr' : 'repeat(3, 1fr)',
        gap: isColumn ? 1 : (compact ? 1.25 : 1.5),
        width: '100%',
      }}
    >
      {stats.map((stat, idx) => (
        <Box
          key={stat.label}
          sx={{
            borderRadius: '16px',
            px: compact ? 1.5 : 1.8,
            py: isColumn ? 1 : (compact ? 1.5 : 1.8),
            ...glassTileSx(isDarkMode),
            display: 'flex',
            flexDirection: isColumn ? 'row' : 'column',
            alignItems: isColumn ? 'center' : 'stretch',
            justifyContent: isColumn ? 'space-between' : 'flex-start',
            gap: isColumn ? 1.25 : 0.6,
            minWidth: 0,
            animation: `fadeInUp 0.4s ease ${idx * 80}ms both`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDarkMode ? 'none' : '0 8px 20px rgba(15,23,42,0.08)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
              minWidth: 0,
              // One neutral outlined icon style, matching the label: per-stat colours read as decoration.
              color: isDarkMode ? '#94a3b8' : '#64748b',
              '& .MuiSvgIcon-root': { fontSize: compact ? '1.05rem' : '1.15rem', flexShrink: 0 },
            }}
          >
            {stat.icon}
            <Typography
              sx={{
                fontSize: compact ? '0.63rem' : '0.68rem',
                fontWeight: 700,
                color: isDarkMode ? '#94a3b8' : '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {stat.label}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: compact ? '1.35rem' : '1.5rem',
              fontWeight: 800,
              color: isDarkMode ? '#f8fafc' : '#0f172a',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {stat.value.toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VillageQuickStats;
