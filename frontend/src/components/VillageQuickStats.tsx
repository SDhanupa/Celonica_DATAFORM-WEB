import React from 'react';
import { glassTileSx } from './glass';
import { Box, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import WorkIcon from '@mui/icons-material/Work';
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
      label: { en: 'Population', si: 'ග්‍රාමීය ජනගහනය', ta: 'கிராம மக்கள்தொகை' }[language] || 'Population',
      value: totalPopulation,
      icon: <GroupsIcon />,
      color: '#2563eb',
    },
    {
      label: { en: 'Households', si: 'ගෘහ ඒකක', ta: 'குடும்பங்கள்' }[language] || 'Households',
      value: totalHouseholds,
      icon: <HomeRoundedIcon />,
      color: '#0891b2',
    },
    {
      label: { en: 'Employed', si: 'රැකියා නියුක්ත', ta: 'வேலைவாய்ப்பு' }[language] || 'Employed',
      value: employedCount,
      icon: <WorkIcon />,
      color: '#16a34a',
    },
  ];

  const isColumn = orientation === 'column';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: isColumn ? '1fr' : 'repeat(3, 1fr)',
        gap: isColumn ? 0 : (compact ? 1.25 : 1.5),
        width: '100%',
      }}
    >
      {stats.map((stat) => (
        <Box
          key={stat.label}
          sx={{
            borderRadius: '16px',
            px: compact ? 1.5 : 1.8,
            py: isColumn ? 1 : (compact ? 1.5 : 1.8),
            ...glassTileSx(isDarkMode),
            ...(isColumn ? { background: 'transparent', border: 'none', borderBottom: `1px solid ${isDarkMode ? '#34444d' : '#e1e9e5'}`, borderRadius: 0, px: 0.25, py: 1.8, '&:last-child': { borderBottom: 0 } } : {}),
            display: 'flex',
            flexDirection: isColumn ? 'row' : 'column',
            alignItems: isColumn ? 'center' : 'stretch',
            justifyContent: isColumn ? 'space-between' : 'flex-start',
            gap: isColumn ? 1.25 : 0.6,
            minWidth: 0,

          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
              minWidth: 0,
              color: stat.color,
              '& .MuiSvgIcon-root': { fontSize: compact ? '1rem' : '1.1rem', flexShrink: 0 },
            }}
          >
            {stat.icon}
            <Typography
              sx={{
                fontSize: compact ? '0.84rem' : '0.8rem',
                fontWeight: 700,
                color: isDarkMode ? '#94a3b8' : '#64748b',
                textTransform: 'none',
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
              fontSize: compact ? '1.6rem' : '1.5rem',
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
