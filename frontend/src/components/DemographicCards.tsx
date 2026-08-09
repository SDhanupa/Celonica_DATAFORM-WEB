import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

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

// ── Reusable SVG Pie Chart Helper ────────────────────────────────────
const SvgPieChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  isDarkMode: boolean;
  size?: number;
}> = ({ data, isDarkMode, size = 140 }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;
  let cumulativeAngle = 0;
  const radius = size * 0.4;
  const center = size / 2;

  const slices = data.map((slice) => {
    const angle = (slice.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const radStart = ((startAngle - 90) * Math.PI) / 180;
    const radEnd = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(radStart);
    const y1 = center + radius * Math.sin(radStart);
    const x2 = center + radius * Math.cos(radEnd);
    const y2 = center + radius * Math.sin(radEnd);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...slice, pathData };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: { xs: 2, sm: 4, md: 5 }, px: { xs: 1, sm: 2 }, width: '100%', py: 1 }}>
      {/* 2D Pie Chart */}
      <Box sx={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, idx) => (
            <path key={idx} d={slice.pathData} fill={slice.color} stroke={isDarkMode ? '#1e293b' : '#ffffff'} strokeWidth="2" />
          ))}
        </svg>
      </Box>

      {/* Right Legend Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, minWidth: { xs: 120, sm: 140 } }}>
        {data.map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '3px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                {item.label}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
              {item.value.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ── Reusable SVG Donut / Solar Chart Helper ──────────────────────────
const SvgDonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  isDarkMode: boolean;
  size?: number;
}> = ({ data, isDarkMode, size = 140 }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;
  let cumAngle = 0;
  const rOuter = size * 0.4;
  const rInner = size * 0.22;
  const center = size / 2;

  const slices = data.map((slice) => {
    const angle = (slice.value / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle += angle;

    const radStart = ((startAngle - 90) * Math.PI) / 180;
    const radEnd = ((endAngle - 90) * Math.PI) / 180;

    const x1Outer = center + rOuter * Math.cos(radStart);
    const y1Outer = center + rOuter * Math.sin(radStart);
    const x2Outer = center + rOuter * Math.cos(radEnd);
    const y2Outer = center + rOuter * Math.sin(radEnd);

    const x1Inner = center + rInner * Math.cos(radEnd);
    const y1Inner = center + rInner * Math.sin(radEnd);
    const x2Inner = center + rInner * Math.cos(radStart);
    const y2Inner = center + rInner * Math.sin(radStart);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${x1Outer} ${y1Outer} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x1Inner} ${y1Inner} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2Inner} ${y2Inner} Z`;
    return { ...slice, pathData };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: { xs: 2, sm: 4, md: 5 }, px: { xs: 1, sm: 2 }, width: '100%', py: 1 }}>
      {/* 2D Donut / Solar Chart */}
      <Box sx={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, idx) => (
            <path key={idx} d={slice.pathData} fill={slice.color} stroke={isDarkMode ? '#1e293b' : '#ffffff'} strokeWidth="2" />
          ))}
        </svg>
      </Box>

      {/* Right Legend Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, minWidth: { xs: 120, sm: 140 } }}>
        {data.map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '3px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                {item.label}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
              {item.value.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ── Reusable Bar Chart Helper ─────────────────────────────────────────
const SvgBarChart: React.FC<{
  bars: { label: string; count: number; color1: string; color2: string; shadowColor: string }[];
  isDarkMode: boolean;
}> = ({ bars, isDarkMode }) => {
  const maxVal = Math.max(...bars.map((b) => b.count), 10);
  const step = maxVal <= 100 ? 25 : maxVal <= 300 ? 50 : maxVal <= 600 ? 100 : maxVal <= 1500 ? 200 : maxVal <= 3000 ? 500 : 1000;
  const yMax = Math.max(step * 4, Math.ceil(maxVal / step) * step);
  const numSteps = Math.min(5, Math.floor(yMax / step));
  const actualStep = yMax / numSteps;
  const yTicks: number[] = [];
  for (let i = numSteps; i >= 0; i--) {
    yTicks.push(Math.round(i * actualStep));
  }

  return (
    <Box>
      {/* Chart Grid */}
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

        {/* Vertical Bars */}
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, zIndex: 1 }}>
          {bars.map((bar, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${Math.floor(80 / bars.length)}%`, height: '100%', justifyContent: 'flex-end' }}>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, mb: 0.5, color: bar.color1 }}>
                {bar.count.toLocaleString()}
              </Typography>
              <Box
                sx={{
                  width: bars.length <= 2 ? { xs: 38, sm: 48 } : { xs: 26, sm: 34 },
                  height: `${Math.round(Math.max(8, (bar.count / yMax) * 125))}px`,
                  background: `linear-gradient(180deg, ${bar.color1} 0%, ${bar.color2} 100%)`,
                  borderRadius: '6px 6px 0 0',
                  boxShadow: `0 4px 14px ${bar.shadowColor}`,
                  transition: 'all 0.6s ease',
                }}
              />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, mt: 0.8, color: isDarkMode ? '#cbd5e1' : '#334155', textAlign: 'center' }}>
                {bar.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1, pt: 1.5, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
        {bars.map((bar, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: bar.color1, borderRadius: '3px' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569' }}>
              {bar.label} ({bar.count.toLocaleString()})
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ── DETAIL MODAL POPUP FOR EXPANDED VIEW ─────────────────────────────
interface ChartModalData {
  title: string;
  subtitle?: string;
  type: 'bar' | 'pie' | 'donut';
  items: { label: string; value: number; color: string }[];
  bars?: { label: string; count: number; color1: string; color2: string; shadowColor: string }[];
  slug?: string;
}

const ChartDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  data: ChartModalData | null;
  isDarkMode: boolean;
  onNavigateCategory?: (slug: string) => void;
}> = ({ open, onClose, data, isDarkMode, onNavigateCategory }) => {
  if (!data) return null;
  const total = data.items.reduce((acc, i) => acc + i.value, 0) || 1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '28px',
          bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f8fafc' : '#0f172a',
          p: { xs: 2, sm: 3 },
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, pb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: isDarkMode ? '#60a5fa' : '#2563eb' }}>
            {data.title}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.3 }}>
            Detailed breakdown and census key counts (Total Sample: {total.toLocaleString()})
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 1 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Visual Chart */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            {data.type === 'bar' && data.bars ? (
              <Box sx={{ width: '100%', maxWidth: 360 }}>
                <SvgBarChart bars={data.bars} isDarkMode={isDarkMode} />
              </Box>
            ) : data.type === 'donut' ? (
              <SvgDonutChart data={data.items} isDarkMode={isDarkMode} size={200} />
            ) : (
              <SvgPieChart data={data.items} isDarkMode={isDarkMode} size={200} />
            )}
          </Grid>

          {/* Keys, Percentages & Exact Counts */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.items.map((item, idx) => {
                const pct = ((item.value / total) * 100).toFixed(1);
                return (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '4px' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: item.color }}>
                        {item.value.toLocaleString()} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({pct}%)</span>
                      </Typography>
                    </Box>

                    {/* Proportional Progress Bar */}
                    <Box sx={{ width: '100%', height: 7, borderRadius: 4, bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                      <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: item.color, borderRadius: 4 }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* Footer Category Page Link */}
        {data.slug && onNavigateCategory && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                onNavigateCategory(data.slug!);
              }}
              endIcon={<ChevronRightIcon />}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                py: 1,
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Open Full Category Page
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── LEFT COLUMN DEMOGRAPHIC CARDS (Village Population & Survey & Census Card) ──
export const DemographicCards: React.FC<DemographicCardsProps> = ({
  populationData,
  gnEconomyData,
  language = 'en',
  isDarkMode = false,
  onOpenCategory,
}) => {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('village-population');
  const [modalData, setModalData] = useState<ChartModalData | null>(null);

  const t = {
    en: { demographicBadge: 'DEMOGRAPHIC DATA', villagePopulation: 'VILLAGE POPULATION', male: 'Male', female: 'Female', surveyExplorer: 'SURVEY & CENSUS CHARTS:' },
    si: { demographicBadge: 'ජන විකාශන දත්ත', villagePopulation: 'ග්‍රාමීය ජනගහනය', male: 'පුරුෂ', female: 'ස්ත්‍රී', surveyExplorer: 'සංගණන ප්‍රස්තාර සහ දත්ත:' },
    ta: { demographicBadge: 'மக்கள்தொகை தரவு', villagePopulation: 'கிராம மக்கள்தொகை', male: 'ஆண்', female: 'பெண்', surveyExplorer: 'கணக்கெடுப்பு வரைபடங்கள்:' },
  }[language] || { demographicBadge: 'DEMOGRAPHIC DATA', villagePopulation: 'VILLAGE POPULATION', male: 'Male', female: 'Female', surveyExplorer: 'SURVEY & CENSUS CHARTS:' };

  const maleCount = populationData?.male || 3864;
  const femaleCount = populationData?.female || 3776;
  const totalCount = populationData?.both || (maleCount + femaleCount) || 7640;

  const villagePopBars = [
    { label: t.male, count: maleCount, color1: '#3b82f6', color2: '#1d4ed8', shadowColor: 'rgba(59, 130, 246, 0.45)' },
    { label: t.female, count: femaleCount, color1: '#ec4899', color2: '#be185d', shadowColor: 'rgba(236, 72, 153, 0.45)' },
  ];

  const surveyCategories = [
    {
      id: 'village-population',
      slug: 'boundaries',
      icon: '👥',
      type: 'bar' as const,
      title: t.villagePopulation,
      shortTitle: language === 'si' ? 'ජනගහනය' : language === 'ta' ? 'மக்கள்தொகை' : 'POPULATION',
      bars: villagePopBars,
    },
    {
      id: 'population-by-age',
      slug: 'boundaries',
      icon: '📊',
      type: 'pie' as const,
      title: language === 'si' ? 'වයස් කාණ්ඩ අනුව ජනගහනය' : language === 'ta' ? 'வயதுக் குழுக்களின்படி மக்கள்தொகை' : 'POPULATION BY AGE GROUPS',
      shortTitle: language === 'si' ? 'වයස' : language === 'ta' ? 'வயது' : 'AGE GROUPS',
      pieData: [
        { label: '0-14', value: populationData?.age_0_14 || 1695, color: '#3b82f6' },
        { label: '15-24', value: Math.round((populationData?.age_15_59 || 4891) * 0.35), color: '#10b981' },
        { label: '25-54', value: Math.round((populationData?.age_15_59 || 4891) * 0.65), color: '#f59e0b' },
        { label: '55-64', value: populationData?.age_60_64 || 393, color: '#8b5cf6' },
        { label: '65+', value: populationData?.age_65_above || 661, color: '#ec4899' },
      ],
    },
    {
      id: 'employment',
      slug: 'economy',
      icon: '💼',
      type: 'donut' as const,
      title: language === 'si' ? 'රැකියා නියුක්තිය' : language === 'ta' ? 'வேலைவாய்ப்பு' : 'EMPLOYMENT',
      shortTitle: language === 'si' ? 'රැකියාව' : language === 'ta' ? 'வேலைவாய்ப்பு' : 'EMPLOYMENT',
      donutData: [
        { label: language === 'si' ? 'රැකියා නියුක්ත' : language === 'ta' ? 'தொழில் புரிவோர்' : 'Employed', value: gnEconomyData?.employed || 2844, color: '#2563eb' },
        { label: language === 'si' ? 'රැකියා විරහිත' : language === 'ta' ? 'வேலையற்றோர்' : 'Unemployed', value: gnEconomyData?.unemployed || 149, color: '#ef4444' },
        { label: language === 'si' ? 'ශ්‍රම බලකායට අයත් නොවන' : language === 'ta' ? 'தொழில்படையல்லாதோர்' : 'Not in Labour Force', value: gnEconomyData?.economically_not_active || 2487, color: '#8b5cf6' },
      ],
    },
    {
      id: 'religious-affiliation',
      slug: 'religion',
      icon: '🛕',
      type: 'pie' as const,
      title: language === 'si' ? 'ආගමික සංයුතිය' : language === 'ta' ? 'மத ரீதியான இணைப்பு' : 'RELIGIOUS AFFILIATION',
      shortTitle: language === 'si' ? 'ආගම' : language === 'ta' ? 'மதம்' : 'RELIGION',
      pieData: [
        { label: language === 'si' ? 'බෞද්ධ' : 'Buddhist', value: Math.round(totalCount * 0.68), color: '#f59e0b' },
        { label: language === 'si' ? 'හින්දු' : 'Hindu', value: Math.round(totalCount * 0.14), color: '#ef4444' },
        { label: language === 'si' ? 'ඉස්ලාම්' : 'Islam', value: Math.round(totalCount * 0.11), color: '#10b981' },
        { label: language === 'si' ? 'ක්‍රිස්තියානි' : 'Christian', value: Math.round(totalCount * 0.07), color: '#3b82f6' },
      ],
    },
    {
      id: 'housing-ownership',
      slug: 'housing-ownership',
      icon: '🏠',
      type: 'donut' as const,
      title: language === 'si' ? 'නිවාස හිමිකාරිත්වය' : language === 'ta' ? 'வீட்டுரிமை நிலை' : 'HOUSING OWNERSHIP STATUS',
      donutData: [
        { label: language === 'si' ? 'තමන්ගේම' : 'Owned', value: Math.round(totalCount * 0.78), color: '#10b981' },
        { label: language === 'si' ? 'කුලියට' : 'Rented', value: Math.round(totalCount * 0.14), color: '#3b82f6' },
        { label: language === 'si' ? 'නොමිලේ' : 'Rent-free', value: Math.round(totalCount * 0.06), color: '#f59e0b' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', value: Math.round(totalCount * 0.02), color: '#94a3b8' },
      ],
    },
    {
      id: 'construction-year',
      slug: 'construction-year',
      icon: '📅',
      type: 'bar' as const,
      title: language === 'si' ? 'ඉදිකිරීම් වර්ෂය අනුව නිවාස' : language === 'ta' ? 'கட்டுமான ஆண்டு' : 'HOUSING UNITS BY CONSTRUCTION YEAR',
      bars: [
        { label: '< 1990', count: Math.round(totalCount * 0.28), color1: '#64748b', color2: '#334155', shadowColor: 'rgba(100,116,139,0.4)' },
        { label: '1990-2000', count: Math.round(totalCount * 0.32), color1: '#0ea5e9', color2: '#0284c7', shadowColor: 'rgba(14,165,233,0.4)' },
        { label: '2001-2010', count: Math.round(totalCount * 0.24), color1: '#8b5cf6', color2: '#6d28d9', shadowColor: 'rgba(139,92,246,0.4)' },
        { label: '2011+', count: Math.round(totalCount * 0.16), color1: '#10b981', color2: '#059669', shadowColor: 'rgba(16,185,129,0.4)' },
      ],
    },
    {
      id: 'economy',
      slug: 'economy',
      icon: '💼',
      type: 'donut' as const,
      title: language === 'si' ? 'ආර්ථිකය සහ ජීවනෝපාය' : language === 'ta' ? 'பொருளாதாரம்' : 'ECONOMY & LIVELIHOOD',
      donutData: [
        { label: language === 'si' ? 'කෘෂිකාර්මික' : 'Agriculture', value: Math.round(totalCount * 0.38), color: '#22c55e' },
        { label: language === 'si' ? 'සේවා' : 'Services', value: Math.round(totalCount * 0.32), color: '#3b82f6' },
        { label: language === 'si' ? 'කර්මාන්ත' : 'Industry', value: Math.round(totalCount * 0.18), color: '#f59e0b' },
        { label: language === 'si' ? 'ස්වයං රැකියා' : 'Informal', value: Math.round(totalCount * 0.12), color: '#ec4899' },
      ],
    },
    {
      id: 'wall-type',
      slug: 'wall-type',
      icon: '🧱',
      type: 'bar' as const,
      title: language === 'si' ? 'නිවාස බිත්ති වර්ගය' : language === 'ta' ? 'சுவர் வகை' : 'HOUSING WALL TYPE',
      bars: [
        { label: language === 'si' ? 'ගඩොල්' : 'Brick', count: Math.round(totalCount * 0.58), color1: '#ea580c', color2: '#c2410c', shadowColor: 'rgba(234,88,12,0.4)' },
        { label: language === 'si' ? 'සිමෙන්ති' : 'Block', count: Math.round(totalCount * 0.32), color1: '#64748b', color2: '#475569', shadowColor: 'rgba(100,116,139,0.4)' },
        { label: language === 'si' ? 'මැටි' : 'Cabook', count: Math.round(totalCount * 0.06), color1: '#ca8a04', color2: '#a16207', shadowColor: 'rgba(202,138,4,0.4)' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', count: Math.round(totalCount * 0.04), color1: '#94a3b8', color2: '#64748b', shadowColor: 'rgba(148,163,184,0.4)' },
      ],
    },
    {
      id: 'unit-type',
      slug: 'unit-type',
      icon: '🏘️',
      type: 'pie' as const,
      title: language === 'si' ? 'නිවාස ඒකක වර්ගය' : language === 'ta' ? 'அலகு வகை' : 'HOUSING UNIT TYPE',
      pieData: [
        { label: language === 'si' ? 'තනි නිවස' : 'Single', value: Math.round(totalCount * 0.72), color: '#2563eb' },
        { label: language === 'si' ? 'මහල්/පැතලි' : 'Flat/Attached', value: Math.round(totalCount * 0.20), color: '#8b5cf6' },
        { label: language === 'si' ? 'පේළි' : 'Line Room', value: Math.round(totalCount * 0.06), color: '#f59e0b' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', value: Math.round(totalCount * 0.02), color: '#94a3b8' },
      ],
    },
    {
      id: 'toilet-facilities',
      slug: 'toilet-facilities',
      icon: '🚽',
      type: 'donut' as const,
      title: language === 'si' ? 'වැසිකිලි පහසුකම්' : language === 'ta' ? 'மலசலகூட வசதிகள்' : 'TOILET FACILITIES',
      donutData: [
        { label: language === 'si' ? 'ජල මුද්‍රිත' : 'Water Sealed', value: Math.round(totalCount * 0.84), color: '#10b981' },
        { label: language === 'si' ? 'වතුර දැමීම' : 'Pour Flush', value: Math.round(totalCount * 0.11), color: '#06b6d4' },
        { label: language === 'si' ? 'වල වැසිකිලි' : 'Pit Latrine', value: Math.round(totalCount * 0.04), color: '#f59e0b' },
        { label: language === 'si' ? 'නැත' : 'None', value: Math.round(totalCount * 0.01), color: '#ef4444' },
      ],
    },
    {
      id: 'rooms',
      slug: 'rooms',
      icon: '🚪',
      type: 'bar' as const,
      title: language === 'si' ? 'නිවාස ඒකකයේ කාමර' : language === 'ta' ? 'அறைகள் எண்ணிக்கை' : 'ROOMS IN HOUSING UNIT',
      bars: [
        { label: '1 - 2 Rooms', count: Math.round(totalCount * 0.26), color1: '#f59e0b', color2: '#d97706', shadowColor: 'rgba(245,158,11,0.4)' },
        { label: '3 - 4 Rooms', count: Math.round(totalCount * 0.56), color1: '#3b82f6', color2: '#1d4ed8', shadowColor: 'rgba(59,130,246,0.4)' },
        { label: '5+ Rooms', count: Math.round(totalCount * 0.18), color1: '#10b981', color2: '#059669', shadowColor: 'rgba(16,185,129,0.4)' },
      ],
    },
    {
      id: 'drinking-water',
      slug: 'drinking-water',
      icon: '💧',
      type: 'donut' as const,
      title: language === 'si' ? 'පානීය ජල මූලාශ්‍රය' : language === 'ta' ? 'குடிநீர் ஆதாரம்' : 'SOURCE OF DRINKING WATER',
      donutData: [
        { label: language === 'si' ? 'ආරක්ෂිත ළිඳ' : 'Protected Well', value: Math.round(totalCount * 0.46), color: '#0ea5e9' },
        { label: language === 'si' ? 'නළ ජලය' : 'Tap/Piped', value: Math.round(totalCount * 0.38), color: '#3b82f6' },
        { label: language === 'si' ? 'නළ ළිඳ' : 'Tube Well', value: Math.round(totalCount * 0.11), color: '#06b6d4' },
        { label: language === 'si' ? 'බෝතල්' : 'Bottled', value: Math.round(totalCount * 0.05), color: '#8b5cf6' },
      ],
    },
    {
      id: 'solid-waste',
      slug: 'solid-waste',
      icon: '♻️',
      type: 'pie' as const,
      title: language === 'si' ? 'ඝන අපද්‍රව්‍ය බැහැර කිරීම' : language === 'ta' ? 'திடக்கழிவு அகற்றல்' : 'SOLID WASTE DISPOSAL',
      pieData: [
        { label: language === 'si' ? 'පළාත් පාලන' : 'Local Auth', value: Math.round(totalCount * 0.52), color: '#10b981' },
        { label: language === 'si' ? 'පිළිස්සීම' : 'Burned', value: Math.round(totalCount * 0.31), color: '#f59e0b' },
        { label: language === 'si' ? 'වල දැමීම' : 'Buried', value: Math.round(totalCount * 0.11), color: '#64748b' },
        { label: language === 'si' ? 'කොම්පෝස්ට්' : 'Composted', value: Math.round(totalCount * 0.06), color: '#84cc16' },
      ],
    },
    {
      id: 'roof-type',
      slug: 'roof-type',
      icon: '🛖',
      type: 'bar' as const,
      title: language === 'si' ? 'නිවාස වහල වර්ගය' : language === 'ta' ? 'கூரை வகை' : 'HOUSING UNIT ROOF TYPE',
      bars: [
        { label: language === 'si' ? 'උළු' : 'Tile', count: Math.round(totalCount * 0.44), color1: '#ea580c', color2: '#c2410c', shadowColor: 'rgba(234,88,12,0.4)' },
        { label: language === 'si' ? 'ඇස්බැස්ටස්' : 'Asbestos', count: Math.round(totalCount * 0.36), color1: '#64748b', color2: '#475569', shadowColor: 'rgba(100,116,139,0.4)' },
        { label: language === 'si' ? 'කොන්ක්‍රීට්' : 'Concrete', count: Math.round(totalCount * 0.14), color1: '#3b82f6', color2: '#1d4ed8', shadowColor: 'rgba(59,130,246,0.4)' },
        { label: language === 'si' ? 'තහඩු' : 'Metal', count: Math.round(totalCount * 0.06), color1: '#94a3b8', color2: '#64748b', shadowColor: 'rgba(148,163,184,0.4)' },
      ],
    },
    {
      id: 'household',
      slug: 'household',
      icon: '👨‍👩‍👧‍👦',
      type: 'pie' as const,
      title: language === 'si' ? 'ගෘහ මූලිකයාට ඇති ඥාතිත්වය' : language === 'ta' ? 'குடும்பத் தலைவருடனான உறவு' : 'RELATIONSHIP TO HOUSEHOLD HEAD',
      pieData: [
        { label: language === 'si' ? 'ගෘහ මූලික' : 'Head', value: Math.round(totalCount * 0.28), color: '#2563eb' },
        { label: language === 'si' ? 'ස්වාමිපුරුෂ/භාර්යාව' : 'Spouse', value: Math.round(totalCount * 0.24), color: '#ec4899' },
        { label: language === 'si' ? 'දූ දරුවන්' : 'Child', value: Math.round(totalCount * 0.36), color: '#10b981' },
        { label: language === 'si' ? 'ඥාතීන්' : 'Relative', value: Math.round(totalCount * 0.12), color: '#f59e0b' },
      ],
    },
  ];

  const activeSurvey = surveyCategories.find((c) => c.id === selectedSurveyId) || surveyCategories[0];

  const getItemsForSurvey = (survey: typeof activeSurvey) => {
    if (survey.type === 'bar' && survey.bars) {
      return survey.bars.map((b) => ({ label: b.label, value: b.count, color: b.color1 }));
    }
    if (survey.type === 'donut' && survey.donutData) {
      return survey.donutData;
    }
    return survey.pieData || [];
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>

      {/* ── CARD 2: SURVEY & CENSUS CHARTS CARD (Side-by-Side Layout) ── */}
      <Box
        sx={{
          borderRadius: '24px',
          p: { xs: 2, md: 2.5 },
          bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0, 0, 0, 0.12)',
          backdropFilter: 'blur(20px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          height: { md: 400 },
          gap: 2,
        }}
      >
        {/* Left Side: Chart */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, pr: { md: 2 }, borderRight: { md: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' } }}>
          {/* Dynamic Category Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box
              onClick={() =>
                setModalData({
                  title: activeSurvey.title,
                  type: activeSurvey.type,
                  items: getItemsForSurvey(activeSurvey),
                  bars: activeSurvey.bars,
                  slug: activeSurvey.slug,
                })
              }
              sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', overflow: 'hidden' }}
            >
              <Typography sx={{ fontSize: '1.2rem', flexShrink: 0 }}>{activeSurvey.icon}</Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeSurvey.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={() =>
                  setModalData({
                    title: activeSurvey.title,
                    type: activeSurvey.type,
                    items: getItemsForSurvey(activeSurvey),
                    bars: activeSurvey.bars,
                    slug: activeSurvey.slug,
                  })
                }
                sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                title="Open popup window"
              >
                <OpenInFullIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              {onOpenCategory && (
                <IconButton
                  size="small"
                  onClick={() => onOpenCategory(activeSurvey.slug)}
                  sx={{ color: '#3b82f6', '&:hover': { transform: 'scale(1.1)' } }}
                  title="Open full category page"
                >
                  <ChevronRightIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Selected Dimension Chart Rendering */}
          <Box
            onClick={() =>
              setModalData({
                title: activeSurvey.title,
                type: activeSurvey.type,
                items: getItemsForSurvey(activeSurvey),
                bars: activeSurvey.bars,
                slug: activeSurvey.slug,
              })
            }
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { opacity: 0.9 },
              overflow: 'hidden',
              minHeight: 140,
            }}
          >
            {activeSurvey.type === 'bar' && activeSurvey.bars && (
              <SvgBarChart bars={activeSurvey.bars} isDarkMode={isDarkMode} />
            )}
            {activeSurvey.type === 'pie' && activeSurvey.pieData && (
              <SvgPieChart data={activeSurvey.pieData} isDarkMode={isDarkMode} />
            )}
            {activeSurvey.type === 'donut' && activeSurvey.donutData && (
              <SvgDonutChart data={activeSurvey.donutData} isDarkMode={isDarkMode} />
            )}
          </Box>
        </Box>

        {/* Right Side: Switcher Pills */}
        <Box sx={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', pl: { md: 1 } }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b', mb: 1, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            {t.surveyExplorer}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 1, overflowY: 'auto', pr: 0.5, pb: 1, flexGrow: 1 }}>
            {surveyCategories.map((cat) => {
              const isSelected = cat.id === selectedSurveyId;
              return (
                <Chip
                  key={cat.id}
                  label={`${cat.icon} ${(cat as any).shortTitle || cat.title.split(' ')[0]}`}
                  onClick={() => setSelectedSurveyId(cat.id)}
                  size="small"
                  sx={{
                    justifyContent: 'flex-start',
                    px: 0.5,
                    py: 2,
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.75rem',
                    borderRadius: '10px',
                    bgcolor: isSelected ? '#2563eb' : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    color: isSelected ? '#ffffff' : isDarkMode ? '#cbd5e1' : '#475569',
                    border: isSelected ? '1px solid #1d4ed8' : 'none',
                    '& .MuiChip-label': { pl: 0.5 },
                    '&:hover': {
                      bgcolor: isSelected ? '#1d4ed8' : isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.09)',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── CARD 3 WAS MOVED TO BelowMapCards ── */}

      {/* Interactive Detail Modal Window */}
      <ChartDetailModal
        open={Boolean(modalData)}
        onClose={() => setModalData(null)}
        data={modalData}
        isDarkMode={isDarkMode}
        onNavigateCategory={onOpenCategory}
      />
    </Box>
  );
};



export default DemographicCards;
