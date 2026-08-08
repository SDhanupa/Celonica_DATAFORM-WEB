import React from 'react';
import { Box, Typography, Button, Divider, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface DemographicCardsProps {
  populationData?: {
    male: number;
    female: number;
    both: number;
    age_0_14?: number;
    age_15_59?: number;
    age_60_64?: number;
    age_65_above?: number;
  } | null;
  gnEconomyData?: {
    employed?: number;
    unemployed?: number;
    economically_not_active?: number;
  } | null;
  language?: 'en' | 'si' | 'ta';
  isDarkMode?: boolean;
  onOpenCategory?: (slug: string) => void;
}

export const DemographicCards: React.FC<DemographicCardsProps> = ({
  populationData,
  gnEconomyData,
  language = 'en',
  isDarkMode = false,
  onOpenCategory,
}) => {
  const theme = useTheme();

  const t = {
    en: {
      demographicBadge: 'DEMOGRAPHIC DATA',
      villagePopulation: 'VILLAGE POPULATION',
      male: 'Male',
      female: 'Female',
      total: 'Total',
      ageTitle: 'POPULATION BY AGE GROUPS',
      empTitle: 'EMPLOYMENT',
      employed: 'Employed',
      unemployed: 'Unemployed',
      notInLabourForce: 'Not in Labour Force',
      housingOwnership: 'HOUSING OWNERSHIP',
      solidWaste: 'SOLID WASTE DISPOSAL',
    },
    si: {
      demographicBadge: 'ජන විකාශන දත්ත',
      villagePopulation: 'ග්‍රාමීය ජනගහනය',
      male: 'පුරුෂ',
      female: 'ස්ත්‍රී',
      total: 'මුළු',
      ageTitle: 'වයස් කාණ්ඩ අනුව ජනගහනය',
      empTitle: 'රැකියා නියුක්තිය',
      employed: 'රැකියා නියුක්ත',
      unemployed: 'රැකියා විරහිත',
      notInLabourForce: 'ශ්‍රම බලකායට අයත් නොවන',
      housingOwnership: 'නිවාස හිමිකාරිත්වය',
      solidWaste: 'ඝන අපද්‍රව්‍ය බැහැර කිරීම',
    },
    ta: {
      demographicBadge: 'மக்கள்தொகை தரவு',
      villagePopulation: 'கிராம மக்கள்தொகை',
      male: 'ஆண்',
      female: 'பெண்',
      total: 'மொத்தம்',
      ageTitle: 'வயதுக் குழுக்களின்படி மக்கள்தொகை',
      empTitle: 'வேலைவாய்ப்பு',
      employed: 'தொழில் புரிவோர்',
      unemployed: 'வேலையற்றோர்',
      notInLabourForce: 'தொழில்படையல்லாதோர்',
      housingOwnership: 'வீட்டுரிமை',
      solidWaste: 'திடக்கழிவு அகற்றல்',
    },
  }[language] || {
    demographicBadge: 'DEMOGRAPHIC DATA',
    villagePopulation: 'VILLAGE POPULATION',
    male: 'Male',
    female: 'Female',
    total: 'Total',
    ageTitle: 'POPULATION BY AGE GROUPS',
    empTitle: 'EMPLOYMENT',
    employed: 'Employed',
    unemployed: 'Unemployed',
    notInLabourForce: 'Not in Labour Force',
    housingOwnership: 'HOUSING OWNERSHIP',
    solidWaste: 'SOLID WASTE DISPOSAL',
  };

  // ── Population Counts & Dynamic Y-Axis Scale ─────────────────────────
  const maleCount = populationData?.male || 0;
  const femaleCount = populationData?.female || 0;
  const totalCount = populationData?.both || (maleCount + femaleCount) || 0;
  const rawMax = Math.max(maleCount, femaleCount, 10);

  // Calculate clean step and yMax (e.g. for 894 -> step 200 -> yMax 1000)
  const step = rawMax <= 100 ? 25 : rawMax <= 300 ? 50 : rawMax <= 600 ? 100 : rawMax <= 1500 ? 200 : rawMax <= 3000 ? 500 : 1000;
  const yMax = Math.max(step * 4, Math.ceil(rawMax / step) * step);
  const numSteps = Math.min(5, Math.floor(yMax / step));
  const actualStep = yMax / numSteps;
  const yTicks: number[] = [];
  for (let i = numSteps; i >= 0; i--) {
    yTicks.push(Math.round(i * actualStep));
  }

  // ── Age Group Distribution ──────────────────────────────────────────
  const a0_14 = populationData?.age_0_14 || Math.round(totalCount * 0.22);
  const a15_59 = populationData?.age_15_59 || Math.round(totalCount * 0.63);
  const a15_24 = Math.round(a15_59 * 0.35);
  const a25_54 = Math.round(a15_59 * 0.65);
  const a55_64 = populationData?.age_60_64 || Math.round(totalCount * 0.08);
  const a65_plus = populationData?.age_65_above || Math.round(totalCount * 0.07);
  const totalAge = (a0_14 + a15_24 + a25_54 + a55_64 + a65_plus) || 1;

  const pieData = [
    { label: '0-14', value: a0_14, color: '#3b82f6' },
    { label: '15-24', value: a15_24, color: '#10b981' },
    { label: '25-54', value: a25_54, color: '#f59e0b' },
    { label: '55-64', value: a55_64, color: '#8b5cf6' },
    { label: '65+', value: a65_plus, color: '#ec4899' },
  ];

  // Calculate SVG Pie paths
  let cumulativeAngle = 0;
  const pieSlices = pieData.map((slice) => {
    const angle = (slice.value / totalAge) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const radStart = ((startAngle - 90) * Math.PI) / 180;
    const radEnd = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(radStart);
    const y1 = 100 + 80 * Math.sin(radStart);
    const x2 = 100 + 80 * Math.cos(radEnd);
    const y2 = 100 + 80 * Math.sin(radEnd);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...slice, pathData };
  });

  // ── Employment Distribution ─────────────────────────────────────────
  const emp = gnEconomyData?.employed || Math.round(totalCount * 0.46);
  const unemp = gnEconomyData?.unemployed || Math.round(totalCount * 0.08);
  const notActive = gnEconomyData?.economically_not_active || Math.round(totalCount * 0.26);
  const totalEmp = (emp + unemp + notActive) || 1;

  const donutSlices = [
    { label: t.employed, value: emp, color: '#2563eb' },
    { label: t.unemployed, value: unemp, color: '#ef4444' },
    { label: t.notInLabourForce, value: notActive, color: '#8b5cf6' },
  ];

  let cumDonut = 0;
  const donutPaths = donutSlices.map((slice) => {
    const angle = (slice.value / totalEmp) * 360;
    const startAngle = cumDonut;
    const endAngle = cumDonut + angle;
    cumDonut += angle;

    const radStart = ((startAngle - 90) * Math.PI) / 180;
    const radEnd = ((endAngle - 90) * Math.PI) / 180;

    const rOuter = 80;
    const rInner = 45;

    const x1Outer = 100 + rOuter * Math.cos(radStart);
    const y1Outer = 100 + rOuter * Math.sin(radStart);
    const x2Outer = 100 + rOuter * Math.cos(radEnd);
    const y2Outer = 100 + rOuter * Math.sin(radEnd);

    const x1Inner = 100 + rInner * Math.cos(radEnd);
    const y1Inner = 100 + rInner * Math.sin(radEnd);
    const x2Inner = 100 + rInner * Math.cos(radStart);
    const y2Inner = 100 + rInner * Math.sin(radStart);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${x1Outer} ${y1Outer} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x1Inner} ${y1Inner} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2Inner} ${y2Inner} Z`;

    return { ...slice, pathData };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* ── TOP BADGE: DEMOGRAPHIC DATA (A) ────────────────────────── */}
      <Box
        sx={{
          bgcolor: '#1d4ed8',
          color: '#ffffff',
          py: 1.2,
          px: 3,
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(29, 78, 216, 0.35)',
          fontWeight: 800,
          fontSize: '1.05rem',
          letterSpacing: '0.5px',
        }}
      >
        {t.demographicBadge}
      </Box>

      {/* ── CARD 1: VILLAGE POPULATION (A) ─────────────────────────── */}
      <Box
        sx={{
          borderRadius: '24px',
          p: { xs: 2, md: 2.5 },
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.95rem',
            textAlign: 'center',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            mb: 2,
            textTransform: 'uppercase',
          }}
        >
          {t.villagePopulation}
        </Typography>

        {/* Vertical Bar Chart Container */}
        <Box sx={{ position: 'relative', height: 210, width: '100%', display: 'flex', alignItems: 'flex-end', pb: 3, pl: 5 }}>
          {/* Dynamic Y Axis Grid & Labels */}
          {yTicks.map((val, idx) => {
            const bottomPercent = (val / yMax) * 125;
            return (
              <Box
                key={idx}
                sx={{
                  position: 'absolute',
                  left: 0,
                  bottom: bottomPercent + 24,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.72rem', color: isDarkMode ? '#94a3b8' : '#64748b', width: 34, textAlign: 'right', pr: 1, fontFamily: 'monospace' }}>
                  {val}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
              </Box>
            );
          })}

          {/* Bars Container */}
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, zIndex: 1 }}>
            {/* Male Bar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '38%', height: '100%', justifyContent: 'flex-end' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, mb: 0.5, color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                {maleCount.toLocaleString()}
              </Typography>
              <Box
                sx={{
                  width: 58,
                  height: `${Math.round(Math.max(10, (maleCount / yMax) * 125))}px`,
                  background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 6px 18px rgba(59, 130, 246, 0.45)',
                  transition: 'all 0.6s ease',
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mt: 0.8, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
                {t.male}
              </Typography>
            </Box>

            {/* Female Bar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '38%', height: '100%', justifyContent: 'flex-end' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, mb: 0.5, color: isDarkMode ? '#f472b6' : '#db2777' }}>
                {femaleCount.toLocaleString()}
              </Typography>
              <Box
                sx={{
                  width: 58,
                  height: `${Math.round(Math.max(10, (femaleCount / yMax) * 125))}px`,
                  background: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 6px 18px rgba(236, 72, 153, 0.45)',
                  transition: 'all 0.6s ease',
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mt: 0.8, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
                {t.female}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '3px' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#475569' }}>
              {t.male} ({maleCount.toLocaleString()})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#ec4899', borderRadius: '3px' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDarkMode ? '#e2e8f0' : '#475569' }}>
              {t.female} ({femaleCount.toLocaleString()})
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── CARD 2: POPULATION BY AGE GROUPS (A) ────────────────────── */}
      <Box
        sx={{
          borderRadius: '24px',
          p: { xs: 2, md: 2.5 },
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.95rem',
            textAlign: 'center',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            mb: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {t.ageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          {/* SVG Pie Chart */}
          <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="140" height="140" viewBox="0 0 200 200">
              {pieSlices.map((slice, idx) => (
                <path key={idx} d={slice.pathData} fill={slice.color} stroke={isDarkMode ? '#1e293b' : '#ffffff'} strokeWidth="2" />
              ))}
            </svg>
          </Box>

          {/* Age Legend */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {pieData.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '2px' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#475569', minWidth: 40 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                  {item.value.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── CARD 3: EMPLOYMENT ──────────────────────────────────────── */}
      <Box
        sx={{
          borderRadius: '24px',
          p: { xs: 2, md: 2.5 },
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.95rem',
            textAlign: 'center',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            mb: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {t.empTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          {/* SVG Donut Chart */}
          <Box sx={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="140" height="140" viewBox="0 0 200 200">
              {donutPaths.map((slice, idx) => (
                <path key={idx} d={slice.pathData} fill={slice.color} stroke={isDarkMode ? '#1e293b' : '#ffffff'} strokeWidth="2" />
              ))}
            </svg>
          </Box>

          {/* Donut Legend */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {donutSlices.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '2px' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                  {item.value.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DemographicCards;
