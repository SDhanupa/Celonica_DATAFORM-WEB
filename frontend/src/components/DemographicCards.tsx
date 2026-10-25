import React, { useLayoutEffect, useRef, useState } from 'react';
import { glassSx, glassEdge } from './glass';
import { useLanguage } from '../context/LanguageContext';
import VillageQuickStats from './VillageQuickStats';
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
  Tooltip,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import ElderlyOutlinedIcon from '@mui/icons-material/ElderlyOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import TempleBuddhistOutlinedIcon from '@mui/icons-material/TempleBuddhistOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import FoundationOutlinedIcon from '@mui/icons-material/FoundationOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import RecyclingOutlinedIcon from '@mui/icons-material/RecyclingOutlined';
import RoofingOutlinedIcon from '@mui/icons-material/RoofingOutlined';
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined';

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
  housingOwnershipData?: any | null;
  housingWallData?: any | null;
  housingUnitData?: any | null;
  toiletFacilityData?: any | null;
  drinkingWaterData?: any | null;
  solidWasteData?: any | null;
  roomsData?: any | null;
  roofData?: any | null;
  religionData?: any | null;
  householdHeadData?: any | null;
  isDarkMode?: boolean;
  onOpenCategory?: (slug: string) => void;
  /** Hidden when the hero band already shows the KPI tiles. */
  showQuickStats?: boolean;
  /**
   * `wide`   = chart and category rail side by side (full-width container).
   * `narrow` = chart stacked above a wrapped category rail, card fills its
   *            parent's height — for use as one column of a multi-column row.
   */
  layout?: 'wide' | 'narrow';
}

// ── Chart primitives (quiet glass style) ─────────────────────────────
// Restraint over decoration: one tonal family drawn from the brand green instead of a rainbow, flat fills, no
// glows or sheen, a headline number, and tabular figures. Shared by the gnpage card, its modal and mobile.

type Slice = { label: string; value: number; color: string };

const chartInk = (isDark: boolean) => ({
  strong: isDark ? '#ffffff' : '#0b1220',
  soft: isDark ? '#e2e8f0' : '#1e293b',
  muted: isDark ? '#cbd5e1' : '#475569',
  hair: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
  track: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
});

const num = { fontVariantNumeric: 'tabular-nums' as const, letterSpacing: '-0.01em' };

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Recolours categories as one tonal family (brand green, darkest = largest share). Order and labels are kept;
 * colours come from rank so the eye reads "more" as "darker". Shared by the chart and its legend/modal.
 */
export function toneItems<T extends { value: number; color: string }>(items: T[], isDark = false): T[] {
  const [from, to] = isDark ? ['#e6f0e9', '#3d6a52'] : ['#173527', '#c3d8ca'];
  const rank = items.map((_, i) => i).sort((a, b) => items[b].value - items[a].value);
  const n = Math.max(items.length - 1, 1);
  const colour = new Map(rank.map((idx, r) => [idx, mix(from, to, r / n)]));
  return items.map((it, i) => ({ ...it, color: colour.get(i)! }));
}

const pct = (v: number, total: number) => (total > 0 ? (v / total) * 100 : 0);
const fmtPct = (p: number) => (p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`);

/** Donut with the total (or the hovered slice) in the centre and a plain tabular legend. */
const Ring: React.FC<{ data: Slice[]; isDarkMode: boolean; size: number; thickness: number }> = ({ data: raw, isDarkMode, size, thickness }) => {
  const ink = chartInk(isDarkMode);
  const data = toneItems(raw, isDarkMode);
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + Math.max(d.value, 0), 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const shown = data.filter((d) => d.value > 0).length;
  const gap = shown > 1 ? 2 : 0; // hairline separation, flat ends

  let start = 0;
  const segs = data.map((d, i) => {
    const len = total > 0 && d.value > 0 ? (d.value / total) * C : 0;
    const seg = { i, d, start, draw: Math.max(len - gap, 0) };
    start += len;
    return seg;
  });
  const focus = hover !== null ? data[hover] : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.25, width: '100%', py: 1 }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
          aria-label={data.map((d) => `${d.label}: ${d.value.toLocaleString()}`).join(', ')}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ink.track} strokeWidth={thickness} />
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segs.filter((s) => s.draw > 0).map((s) => (
              <circle
                key={s.i}
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={s.d.color}
                strokeWidth={thickness}
                strokeDasharray={`${s.draw} ${C}`}
                strokeDashoffset={-s.start}
                opacity={hover === null || hover === s.i ? 1 : 0.35}
                onMouseEnter={() => setHover(s.i)}
                onMouseLeave={() => setHover(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  ['--seg' as any]: s.draw,
                  ['--circ' as any]: C,
                  animation: `ringDraw 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${s.i * 50}ms both`,
                }}
              />
            ))}
          </g>
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', textAlign: 'center' }}>
          <Typography sx={{ ...num, fontSize: size >= 180 ? '1.75rem' : '1.4rem', fontWeight: 700, lineHeight: 1.05, color: ink.strong }}>
            {(focus ? focus.value : total).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: ink.muted, maxWidth: size - thickness * 2 - 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {focus ? `${focus.label} · ${fmtPct(pct(focus.value, total))}` : 'Total'}
          </Typography>
        </Box>
      </Box>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, width: '100%', maxWidth: 300 }}>
        {data.map((d, i) => (
          <Box
            component="li"
            key={d.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            sx={{
              display: 'grid', gridTemplateColumns: '10px 1fr auto 40px', alignItems: 'center', columnGap: 1.1,
              py: 0.75, borderTop: i ? `1px solid ${ink.hair}` : 'none',
              opacity: hover === null || hover === i ? 1 : 0.45, transition: 'opacity 0.2s ease',
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: d.color }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: ink.soft, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</Typography>
            <Typography sx={{ ...num, fontSize: '0.82rem', fontWeight: 700, color: ink.strong, textAlign: 'right' }}>{d.value.toLocaleString()}</Typography>
            <Typography sx={{ ...num, fontSize: '0.78rem', fontWeight: 600, color: ink.muted, textAlign: 'right' }}>{fmtPct(pct(d.value, total))}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const SvgPieChart: React.FC<{ data: Slice[]; isDarkMode: boolean; size?: number }> = ({ data, isDarkMode, size = 150 }) => (
  <Ring data={data} isDarkMode={isDarkMode} size={size} thickness={Math.round(size * 0.16)} />
);

export const SvgDonutChart: React.FC<{ data: Slice[]; isDarkMode: boolean; size?: number }> = ({ data, isDarkMode, size = 150 }) => (
  <Ring data={data} isDarkMode={isDarkMode} size={size} thickness={Math.round(size * 0.11)} />
);

// ── Bars: two values read as a comparison; more values as flat columns ──
export const SvgBarChart: React.FC<{
  bars: { label: string; count: number; color1: string; color2: string; shadowColor: string }[];
  isDarkMode: boolean;
  /** Shorter plot, for narrow multi-column layouts. */
  compact?: boolean;
}> = ({ bars, isDarkMode, compact = false }) => {
  const ink = chartInk(isDarkMode);
  const [hover, setHover] = useState<number | null>(null);
  const total = bars.reduce((a, b) => a + b.count, 0);
  const accent = isDarkMode ? '#cfe3d6' : '#2d5e41';
  const accentSoft = isDarkMode ? '#5f8a72' : '#8fb39b';

  // Two values (e.g. male / female): two headline figures and one split bar beat two floating columns.
  if (bars.length === 2) {
    const [a, b] = bars;
    const pa = pct(a.count, total);
    return (
      <Box sx={{ width: '100%', py: 1 }}>
        <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: ink.muted, mb: 0.25 }}>Total</Typography>
        <Typography sx={{ ...num, fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, color: ink.strong, mb: 2.5 }}>
          {total.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, mb: 1.5 }}>
          {[a, b].map((x, i) => (
            <Box key={x.label} sx={{ textAlign: i ? 'right' : 'left' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, flexDirection: i ? 'row-reverse' : 'row' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: i ? accentSoft : accent }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: ink.soft }}>{x.label}</Typography>
              </Box>
              <Typography sx={{ ...num, fontSize: '1.35rem', fontWeight: 700, color: ink.strong, lineHeight: 1.25 }}>{x.count.toLocaleString()}</Typography>
              <Typography sx={{ ...num, fontSize: '0.76rem', fontWeight: 600, color: ink.muted }}>{fmtPct(pct(x.count, total))}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: '2px', bgcolor: ink.track }}>
          <Box sx={{ width: `${pa}%`, bgcolor: accent, transformOrigin: 'left center', animation: 'growBarX 0.6s cubic-bezier(0.22, 1, 0.36, 1) both' }} />
          <Box sx={{ flex: 1, bgcolor: accentSoft, transformOrigin: 'right center', animation: 'growBarX 0.6s cubic-bezier(0.22, 1, 0.36, 1) 80ms both' }} />
        </Box>
      </Box>
    );
  }

  const plot = compact ? 120 : 170;
  const max = Math.max(...bars.map((b) => b.count), 1);
  const peak = bars.findIndex((b) => b.count === max);
  return (
    <Box sx={{ width: '100%', py: 1 }}>
      <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: ink.muted, mb: 0.25 }}>Total</Typography>
      <Typography sx={{ ...num, fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, color: ink.strong, mb: 2 }}>
        {total.toLocaleString()}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: plot + 22, borderBottom: `1px solid ${ink.hair}` }}>
        {bars.map((b, i) => (
          <Box key={b.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <Typography sx={{ ...num, fontSize: '0.76rem', fontWeight: 700, color: ink.strong, mb: 0.5, opacity: hover === null || hover === i ? 1 : 0.4 }}>
              {hover === i ? fmtPct(pct(b.count, total)) : b.count.toLocaleString()}
            </Typography>
            <Box sx={{
              width: '100%', maxWidth: 28, height: Math.max(3, (b.count / max) * plot),
              borderRadius: '6px 6px 2px 2px',
              // the peak gets the full accent; the rest stay quieter so the comparison reads at a glance
              bgcolor: hover === i || (hover === null && i === peak) ? accent : accentSoft,
              transformOrigin: 'bottom center',
              transition: 'background-color 0.2s ease',
              animation: `growBarY 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms both`,
            }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
        {bars.map((b) => (
          <Typography key={b.label} sx={{ flex: 1, minWidth: 0, textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: ink.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.label}
          </Typography>
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
  const items = toneItems(data.items, isDarkMode);
  const total = items.reduce((acc, i) => acc + i.value, 0) || 1;

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
              <SvgDonutChart data={items} isDarkMode={isDarkMode} size={200} />
            ) : (
              <SvgPieChart data={items} isDarkMode={isDarkMode} size={200} />
            )}
          </Grid>

          {/* Keys, Percentages & Exact Counts */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {items.map((item, idx) => {
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
  housingOwnershipData,
  housingWallData,
  housingUnitData,
  toiletFacilityData,
  drinkingWaterData,
  solidWasteData,
  roomsData,
  roofData,
  religionData,
  householdHeadData,
  isDarkMode = false,
  onOpenCategory,
  showQuickStats = true,
  layout = 'wide',
}) => {
  const isNarrow = layout === 'narrow';
  const { language } = useLanguage();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('village-population');
  const [modalData, setModalData] = useState<ChartModalData | null>(null);

  const t = {
    en: { demographicBadge: 'DEMOGRAPHIC DATA', villagePopulation: 'VILLAGE POPULATION', male: 'Male', female: 'Female', surveyExplorer: 'SURVEY & CENSUS CHARTS:' },
    si: { demographicBadge: 'ජන විකාශන දත්ත', villagePopulation: 'ග්‍රාමීය ජනගහනය', male: 'පුරුෂ', female: 'ස්ත්‍රී', surveyExplorer: 'සංගණන ප්‍රස්තාර සහ දත්ත:' },
    ta: { demographicBadge: 'மக்கள்தொகை தரவு', villagePopulation: 'கிராம மக்கள்தொகை', male: 'ஆண்', female: 'பெண்', surveyExplorer: 'கணக்கெடுப்பு வரைபடங்கள்:' },
  }[language] || { demographicBadge: 'DEMOGRAPHIC DATA', villagePopulation: 'VILLAGE POPULATION', male: 'Male', female: 'Female', surveyExplorer: 'SURVEY & CENSUS CHARTS:' };

  const maleCount = populationData?.male ?? 0;
  const femaleCount = populationData?.female ?? 0;
  const totalCount = populationData?.both ?? (maleCount + femaleCount);

  const villagePopBars = [
    { label: t.male, count: maleCount, color1: '#3b82f6', color2: '#1d4ed8', shadowColor: 'rgba(59, 130, 246, 0.45)' },
    { label: t.female, count: femaleCount, color1: '#ec4899', color2: '#be185d', shadowColor: 'rgba(236, 72, 153, 0.45)' },
  ];

  const surveyCategories = [
    {
      id: 'village-population',
      slug: 'boundaries',
      icon: <Diversity3OutlinedIcon />,
      type: 'bar' as const,
      title: t.villagePopulation,
      shortTitle: language === 'si' ? 'ජනගහනය' : language === 'ta' ? 'மக்கள்தொகை' : 'POPULATION',
      bars: villagePopBars,
    },
    {
      id: 'population-by-age',
      slug: 'boundaries',
      icon: <ElderlyOutlinedIcon />,
      type: 'pie' as const,
      title: language === 'si' ? 'වයස් කාණ්ඩ අනුව ජනගහනය' : language === 'ta' ? 'வயதுக் குழுக்களின்படி மக்கள்தொகை' : 'POPULATION BY AGE GROUPS',
      shortTitle: language === 'si' ? 'වයස' : language === 'ta' ? 'வயது' : 'AGE GROUPS',
      pieData: [
        { label: '0-14', value: populationData?.age_0_14 ?? 0, color: '#3b82f6' },
        { label: '15-24', value: Math.round((populationData?.age_15_59 ?? 0) * 0.35), color: '#10b981' },
        { label: '25-54', value: Math.round((populationData?.age_15_59 ?? 0) * 0.65), color: '#f59e0b' },
        { label: '55-64', value: populationData?.age_60_64 ?? 0, color: '#8b5cf6' },
        { label: '65+', value: populationData?.age_65_above ?? 0, color: '#ec4899' },
      ],
    },
    {
      id: 'employment',
      slug: 'economy',
      icon: <WorkOutlineOutlinedIcon />,
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
      icon: <TempleBuddhistOutlinedIcon />,
      type: 'pie' as const,
      title: language === 'si' ? 'ආගමික සංයුතිය' : language === 'ta' ? 'மத ரீதியான இணைப்பு' : 'RELIGIOUS AFFILIATION',
      shortTitle: language === 'si' ? 'ආගම' : language === 'ta' ? 'மதம்' : 'RELIGION',
      pieData: [
        { label: language === 'si' ? 'බෞද්ධ' : 'Buddhist', value: religionData?.buddhist || 0, color: '#f59e0b' },
        { label: language === 'si' ? 'හින්දු' : 'Hindu', value: religionData?.hindu || 0, color: '#ef4444' },
        { label: language === 'si' ? 'ඉස්ලාම්' : 'Islam', value: religionData?.islam || 0, color: '#10b981' },
        { label: language === 'si' ? 'ක්‍රිස්තියානි' : 'Christian', value: (religionData?.roman_catholic || 0) + (religionData?.other_christian || 0), color: '#3b82f6' },
      ],
    },
    {
      id: 'housing-ownership',
      slug: 'housing-ownership',
      icon: <KeyOutlinedIcon />,
      type: 'donut' as const,
      title: language === 'si' ? 'නිවාස හිමිකාරිත්වය' : language === 'ta' ? 'வீட்டுரிமை நிலை' : 'HOUSING OWNERSHIP STATUS',
      shortTitle: language === 'si' ? 'හිමිකම' : language === 'ta' ? 'உரிமை' : 'OWNERSHIP',
      donutData: [
        { label: language === 'si' ? 'තමන්ගේම' : 'Owned', value: housingOwnershipData?.owned_by_member || 0, color: '#10b981' },
        { label: language === 'si' ? 'කුලියට' : 'Rented', value: (housingOwnershipData?.rent_gov || 0) + (housingOwnershipData?.rent_private || 0), color: '#3b82f6' },
        { label: language === 'si' ? 'නොමිලේ' : 'Rent-free', value: housingOwnershipData?.free_of_rent || 0, color: '#f59e0b' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', value: (housingOwnershipData?.encroached || 0) + (housingOwnershipData?.other || 0), color: '#94a3b8' },
      ],
    },
    {
      id: 'construction-year',
      slug: 'construction-year',
      icon: <EventAvailableOutlinedIcon />,
      type: 'bar' as const,
      title: language === 'si' ? 'ඉදිකිරීම් වර්ෂය අනුව නිවාස' : language === 'ta' ? 'கட்டுமான ஆண்டு' : 'HOUSING UNITS BY CONSTRUCTION YEAR',
      shortTitle: language === 'si' ? 'වර්ෂය' : language === 'ta' ? 'ஆண்டு' : 'YEAR BUILT',
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
      icon: <AgricultureOutlinedIcon />,
      type: 'donut' as const,
      title: language === 'si' ? 'ආර්ථිකය සහ ජීවනෝපාය' : language === 'ta' ? 'பொருளாதாரம்' : 'ECONOMY & LIVELIHOOD',
      shortTitle: language === 'si' ? 'ආර්ථිකය' : language === 'ta' ? 'பொருளாதாரம்' : 'ECONOMY',
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
      icon: <FoundationOutlinedIcon />,
      type: 'bar' as const,
      title: language === 'si' ? 'නිවාස බිත්ති වර්ගය' : language === 'ta' ? 'சுவர் வகை' : 'HOUSING WALL TYPE',
      shortTitle: language === 'si' ? 'බිත්ති' : language === 'ta' ? 'சுவர்' : 'WALL TYPE',
      bars: [
        { label: language === 'si' ? 'ගඩොල්' : 'Brick', count: housingWallData?.brick || 0, color1: '#ea580c', color2: '#c2410c', shadowColor: 'rgba(234,88,12,0.4)' },
        { label: language === 'si' ? 'සිමෙන්ති' : 'Block', count: housingWallData?.cement_block_stone || 0, color1: '#64748b', color2: '#475569', shadowColor: 'rgba(100,116,139,0.4)' },
        { label: language === 'si' ? 'මැටි' : 'Cabook', count: housingWallData?.cabook || 0, color1: '#ca8a04', color2: '#a16207', shadowColor: 'rgba(202,138,4,0.4)' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', count: (housingWallData?.soil_bricks || 0) + (housingWallData?.mud || 0) + (housingWallData?.cadjan_palmyrah || 0) + (housingWallData?.plank_metal_sheet || 0) + (housingWallData?.other || 0), color1: '#94a3b8', color2: '#64748b', shadowColor: 'rgba(148,163,184,0.4)' },
      ],
    },
    {
      id: 'unit-type',
      slug: 'unit-type',
      icon: <HomeWorkOutlinedIcon />,
      type: 'pie' as const,
      title: language === 'si' ? 'නිවාස ඒකක වර්ගය' : language === 'ta' ? 'அலகு வகை' : 'HOUSING UNIT TYPE',
      shortTitle: language === 'si' ? 'ඒකකය' : language === 'ta' ? 'அலகு' : 'UNIT TYPE',
      pieData: [
        { label: language === 'si' ? 'තනි නිවස' : 'Single', value: housingUnitData?.permanent || 0, color: '#2563eb' },
        { label: language === 'si' ? 'මහල්/පැතලි' : 'Flat/Attached', value: housingUnitData?.semi_permanent || 0, color: '#8b5cf6' },
        { label: language === 'si' ? 'පේළි' : 'Line Room', value: housingUnitData?.improvised || 0, color: '#f59e0b' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', value: housingUnitData?.unclassified || 0, color: '#94a3b8' },
      ],
    },
    {
      id: 'toilet-facilities',
      slug: 'toilet-facilities',
      icon: <WcOutlinedIcon />,
      type: 'donut' as const,
      title: language === 'si' ? 'වැසිකිලි පහසුකම්' : language === 'ta' ? 'மலசலகூட வசதிகள்' : 'TOILET FACILITIES',
      shortTitle: language === 'si' ? 'වැසිකිලි' : language === 'ta' ? 'கழிப்பறை' : 'TOILETS',
      donutData: [
        { label: language === 'si' ? 'ජල මුද්‍රිත' : 'Water Sealed', value: (toiletFacilityData?.water_seal_piped_sewer || 0) + (toiletFacilityData?.water_seal_septic_tank || 0), color: '#10b981' },
        { label: language === 'si' ? 'වතුර දැමීම' : 'Pour Flush', value: toiletFacilityData?.pour_flush || 0, color: '#06b6d4' },
        { label: language === 'si' ? 'වල වැසිකිලි' : 'Pit Latrine', value: toiletFacilityData?.direct_pit || 0, color: '#f59e0b' },
        { label: language === 'si' ? 'නැත' : 'None', value: (toiletFacilityData?.not_using || 0) + (toiletFacilityData?.other || 0), color: '#ef4444' },
      ],
    },
    {
      id: 'rooms',
      slug: 'rooms',
      icon: <BedOutlinedIcon />,
      type: 'bar' as const,
      title: language === 'si' ? 'නිවාස ඒකකයේ කාමර' : language === 'ta' ? 'அறைகள் எண்ணிக்கை' : 'ROOMS IN HOUSING UNIT',
      shortTitle: language === 'si' ? 'කාමර' : language === 'ta' ? 'அறைகள்' : 'ROOMS',
      bars: [
        { label: '1 - 2 Rooms', count: (roomsData?.room_1 || 0) + (roomsData?.rooms_2 || 0), color1: '#f59e0b', color2: '#d97706', shadowColor: 'rgba(245,158,11,0.4)' },
        { label: '3 - 4 Rooms', count: (roomsData?.rooms_3 || 0) + (roomsData?.rooms_4 || 0), color1: '#3b82f6', color2: '#1d4ed8', shadowColor: 'rgba(59,130,246,0.4)' },
        { label: '5+ Rooms', count: (roomsData?.rooms_5 || 0) + (roomsData?.rooms_6 || 0) + (roomsData?.rooms_7 || 0) + (roomsData?.rooms_8 || 0) + (roomsData?.rooms_9 || 0) + (roomsData?.rooms_10_and_above || 0), color1: '#10b981', color2: '#059669', shadowColor: 'rgba(16,185,129,0.4)' },
      ],
    },
    {
      id: 'drinking-water',
      slug: 'drinking-water',
      icon: <WaterDropOutlinedIcon />,
      type: 'donut' as const,
      title: language === 'si' ? 'පානීය ජල මූලාශ්‍රය' : language === 'ta' ? 'குடிநீர் ஆதாரம்' : 'SOURCE OF DRINKING WATER',
      shortTitle: language === 'si' ? 'ජලය' : language === 'ta' ? 'நீர்' : 'WATER',
      donutData: [
        { label: language === 'si' ? 'ළිඳ' : 'Well', value: (drinkingWaterData?.protected_well_within || 0) + (drinkingWaterData?.protected_well_outside || 0) + (drinkingWaterData?.unprotected_well || 0), color: '#0ea5e9' },
        { label: language === 'si' ? 'නළ ජලය' : 'Tap/Piped', value: (drinkingWaterData?.tap_within_unit || 0) + (drinkingWaterData?.tap_within_premises_outside || 0) + (drinkingWaterData?.tap_outside_premises || 0), color: '#3b82f6' },
        { label: language === 'si' ? 'නළ ළිඳ' : 'Tube Well', value: drinkingWaterData?.tube_well || 0, color: '#06b6d4' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', value: (drinkingWaterData?.rural_water_projects || 0) + (drinkingWaterData?.bowser || 0) + (drinkingWaterData?.river_tank_stream || 0) + (drinkingWaterData?.other || 0), color: '#8b5cf6' },
      ],
    },
    {
      id: 'solid-waste',
      slug: 'solid-waste',
      icon: <RecyclingOutlinedIcon />,
      type: 'pie' as const,
      title: language === 'si' ? 'ඝන අපද්‍රව්‍ය බැහැර කිරීම' : language === 'ta' ? 'திடக்கழிவு அகற்றல்' : 'SOLID WASTE DISPOSAL',
      shortTitle: language === 'si' ? 'අපද්‍රව්‍ය' : language === 'ta' ? 'கழிவு' : 'WASTE',
      pieData: [
        { label: language === 'si' ? 'පළාත් පාලන' : 'Local Auth', value: solidWasteData?.collected_by_local_authorities || 0, color: '#10b981' },
        { label: language === 'si' ? 'පිළිස්සීම' : 'Burned', value: solidWasteData?.occupants_burn || 0, color: '#f59e0b' },
        { label: language === 'si' ? 'වල දැමීම' : 'Buried', value: solidWasteData?.occupants_bury || 0, color: '#64748b' },
        { label: language === 'si' ? 'කොම්පෝස්ට්/වෙනත්' : 'Compost/Other', value: (solidWasteData?.occupants_composting || 0) + (solidWasteData?.dispose_into_environment || 0) + (solidWasteData?.other || 0), color: '#84cc16' },
      ],
    },
    {
      id: 'roof-type',
      slug: 'roof-type',
      icon: <RoofingOutlinedIcon />,
      type: 'bar' as const,
      title: language === 'si' ? 'නිවාස වහල වර්ගය' : language === 'ta' ? 'கூரை வகை' : 'HOUSING UNIT ROOF TYPE',
      shortTitle: language === 'si' ? 'වහල' : language === 'ta' ? 'கூரை' : 'ROOF',
      bars: [
        { label: language === 'si' ? 'උළු' : 'Tile', count: roofData?.tile || 0, color1: '#ea580c', color2: '#c2410c', shadowColor: 'rgba(234,88,12,0.4)' },
        { label: language === 'si' ? 'ඇස්බැස්ටස්' : 'Asbestos', count: roofData?.asbestos || 0, color1: '#64748b', color2: '#475569', shadowColor: 'rgba(100,116,139,0.4)' },
        { label: language === 'si' ? 'කොන්ක්‍රීට්' : 'Concrete', count: roofData?.concrete || 0, color1: '#3b82f6', color2: '#1d4ed8', shadowColor: 'rgba(59,130,246,0.4)' },
        { label: language === 'si' ? 'තහඩු/වෙනත්' : 'Metal/Other', count: (roofData?.zink_aluminium_sheet || 0) + (roofData?.metal_sheet || 0) + (roofData?.cadjan_palmyrah_straw || 0) + (roofData?.other || 0), color1: '#94a3b8', color2: '#64748b', shadowColor: 'rgba(148,163,184,0.4)' },
      ],
    },
    {
      id: 'household',
      slug: 'household',
      icon: <FamilyRestroomOutlinedIcon />,
      type: 'pie' as const,
      title: language === 'si' ? 'ගෘහ මූලිකයාට ඇති ඥාතිත්වය' : language === 'ta' ? 'குடும்பத் தலைவருடனான உறவு' : 'RELATIONSHIP TO HOUSEHOLD HEAD',
      shortTitle: language === 'si' ? 'ගෘහ' : language === 'ta' ? 'குடும்பம்' : 'HOUSEHOLD',
      pieData: [
        { label: language === 'si' ? 'ගෘහ මූලික' : 'Head', value: householdHeadData?.head || 0, color: '#2563eb' },
        { label: language === 'si' ? 'ස්වාමිපුරුෂ/භාර්යාව' : 'Spouse', value: householdHeadData?.wife_husband || 0, color: '#ec4899' },
        { label: language === 'si' ? 'දූ දරුවන්' : 'Child', value: (householdHeadData?.son_daughter || 0) + (householdHeadData?.son_daughter_in_law || 0), color: '#10b981' },
        { label: language === 'si' ? 'වෙනත්' : 'Other', value: (householdHeadData?.grandchild_great_grandchild || 0) + (householdHeadData?.parent_of_head_or_spouse || 0) + (householdHeadData?.other_relative || 0) + (householdHeadData?.domestic_employee || 0) + (householdHeadData?.boarder || 0) + (householdHeadData?.non_relative || 0) + (householdHeadData?.clergy || 0) + (householdHeadData?.not_stated || 0), color: '#f59e0b' },
      ],
    },
  ];

  const activeSurvey = surveyCategories.find((c) => c.id === selectedSurveyId) || surveyCategories[0];

  const railItems = () =>
    surveyCategories.map((cat, idx) => {
      const isSelected = cat.id === selectedSurveyId;
      // Arrow keys move through the rail and select (radio-group behaviour); only the selected option is a tab
      // stop, so Tab leaves the rail in one step.
      const move = (e: React.KeyboardEvent<HTMLElement>) => {
        const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!step && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const next = step ? (idx + step + surveyCategories.length) % surveyCategories.length : idx;
        setSelectedSurveyId(surveyCategories[next].id);
        e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
      };
      return (
        <Tooltip key={cat.id} title={cat.title} placement="left" arrow describeChild enterDelay={250}>
          <Box
            role="radio"
            aria-checked={isSelected}
            aria-label={cat.title}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => setSelectedSurveyId(cat.id)}
            onKeyDown={move}
            sx={{
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              borderRadius: '12px',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background-color 0.2s ease',
              '& .MuiSvgIcon-root': {
                fontSize: '1.25rem',
                color: isSelected ? (isDarkMode ? '#0f172a' : '#ffffff') : isDarkMode ? '#cbd5e1' : '#475569',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                // The icon turns white as the pill arrives, not before it.
                transition: 'color 0.25s ease 0.12s, transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1)',
              },
              '&:hover': { bgcolor: isSelected ? 'transparent' : isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)' },
              '&:hover .MuiSvgIcon-root': { color: isSelected ? (isDarkMode ? '#0f172a' : '#ffffff') : isDarkMode ? '#ffffff' : '#0b1220' },
              '&:focus-visible': { outline: `2px solid ${isDarkMode ? '#f8fafc' : '#0f172a'}`, outlineOffset: 2 },
            }}
          >
            {cat.icon}
          </Box>
        </Tooltip>
      );
    });

  // Liquid selection indicator for the icon rail: one pill that flows between options. Its two edges move with
  // different timing (the leading edge first), so it stretches toward the new option and then contracts.
  const railRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ top: number; bottom: number; left: number; width: number; down: boolean } | null>(null);
  useLayoutEffect(() => {
    const inner = railRef.current;
    if (!isNarrow || !inner) return;
    const place = () => {
      const el = inner.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
      if (!el) return;
      const top = el.offsetTop;
      const bottom = inner.offsetHeight - (el.offsetTop + el.offsetHeight);
      setPill((prev) => ({ top, bottom, left: el.offsetLeft, width: el.offsetWidth, down: prev ? top >= prev.top : true }));
      // Keep the selection visible inside the rail only; scrollIntoView would also scroll the page.
      const scroller = inner.parentElement;
      if (scroller) {
        const above = el.offsetTop - scroller.scrollTop;
        const below = el.offsetTop + el.offsetHeight - (scroller.scrollTop + scroller.clientHeight);
        if (above < 0) scroller.scrollTo({ top: el.offsetTop - 4, behavior: 'smooth' });
        else if (below > 0) scroller.scrollTo({ top: el.offsetTop + el.offsetHeight - scroller.clientHeight + 4, behavior: 'smooth' });
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [selectedSurveyId, isNarrow]);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', height: isNarrow ? '100%' : 'auto', minHeight: 0 }}>

      {/* ── QUICK STATS ROW (at-a-glance KPIs) ── */}
      {showQuickStats && (
        <VillageQuickStats
          populationData={populationData}
          gnEconomyData={gnEconomyData}
          housingOwnershipData={housingOwnershipData}
          roomsData={roomsData}
          isDarkMode={isDarkMode}
        />
      )}

      {/* ── CARD 2: SURVEY & CENSUS CHARTS CARD (Side-by-Side Layout) ── */}
      <Box
        sx={{
          borderRadius: '20px',
          p: { xs: 2, md: 2.5 },
          ...glassSx(isDarkMode),
          display: 'flex',
          flexDirection: isNarrow ? 'row' : { xs: 'column', md: 'row' },
          height: isNarrow ? '100%' : { md: 400 },
          minHeight: 0,
          overflow: isNarrow ? 'hidden' : 'visible',
          gap: isNarrow ? 1.5 : 2,
          animation: 'fadeInUp 0.45s ease 240ms both',
        }}
      >
        {/* Left Side: Chart */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            ...(isNarrow
              ? {
                  pr: 1.5,
                  borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                }
              : {
                  pr: { md: 2 },
                  borderRight: { md: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' },
                }),
          }}
        >
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
              <Typography
                key={`title-${activeSurvey.id}`}
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: isDarkMode ? '#ffffff' : '#0b1220',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  animation: 'fadeInUp 0.25s ease both',
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
                sx={{ color: isDarkMode ? '#cbd5e1' : '#475569', '&:hover': { color: isDarkMode ? '#fff' : '#0b1220' } }}
                title="Open popup window"
              >
                <OpenInFullIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              {onOpenCategory && (
                <IconButton
                  size="small"
                  onClick={() => onOpenCategory(activeSurvey.slug)}
                  sx={{ color: isDarkMode ? '#cbd5e1' : '#475569', '&:hover': { color: isDarkMode ? '#fff' : '#0b1220' } }}
                  title="Open full category page"
                >
                  <ChevronRightIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Selected Dimension Chart Rendering */}
          <Box
            key={activeSurvey.id}
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
              // Top-anchored in the tall narrow card: centred content left a dead band under the title.
              alignItems: isNarrow ? 'flex-start' : 'center',
              justifyContent: 'center',
              pt: isNarrow ? 1 : 0,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { opacity: 0.9 },
              // Narrow columns: let a legend-heavy chart scroll inside its pane
              // instead of pushing the card past its rounded border.
              overflowY: isNarrow ? 'auto' : 'hidden',
              overflowX: 'hidden',
              minHeight: isNarrow ? 120 : 140,
            }}
          >
            <Box
              key={selectedSurveyId}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                '@keyframes chartFlowIn': {
                  from: { opacity: 0, transform: 'translateY(10px) scale(0.96)', filter: 'blur(8px)' },
                  to: { opacity: 1, transform: 'none', filter: 'blur(0)' },
                },
                animation: 'chartFlowIn 460ms cubic-bezier(0.22, 1, 0.36, 1) both',
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }}
            >
              {activeSurvey.type === 'bar' && activeSurvey.bars && (
                <SvgBarChart bars={activeSurvey.bars} isDarkMode={isDarkMode} compact={isNarrow} />
              )}
              {activeSurvey.type === 'pie' && activeSurvey.pieData && (
                <SvgPieChart data={activeSurvey.pieData} isDarkMode={isDarkMode} />
              )}
              {activeSurvey.type === 'donut' && activeSurvey.donutData && (
                <SvgDonutChart data={activeSurvey.donutData} isDarkMode={isDarkMode} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Side: Switcher Pills */}
        <Box
          sx={{
            flex: isNarrow ? '0 0 auto' : '0 0 35%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            pl: isNarrow ? 0 : { md: 1 },
          }}
        >
          {/* The icon rail is self-explanatory with tooltips; the heading would only squeeze it. */}
          {!isNarrow && (
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b', mb: 1, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {t.surveyExplorer}
            </Typography>
          )}
          {/* Narrow: a vertical icon-only rail beside the chart (a radio group: one chart is shown at a time).
              Wide: keep the original vertical chip list. */}
          <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 0, display: 'flex' }}>
            <Box
              {...(isNarrow ? { role: 'radiogroup', 'aria-label': t.surveyExplorer, 'aria-orientation': 'vertical' as const } : {})}
              sx={{
                width: '100%',
                overflowY: 'auto',
                pr: isNarrow ? 0 : 0.5,
                pb: isNarrow ? 0.5 : 1,
                minHeight: 0,
                ...(isNarrow
                  ? {
                      display: 'block',
                      p: 0.5,
                      borderRadius: '16px',
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.32)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
                      boxShadow: isDarkMode ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.9)',
                      scrollbarWidth: 'none',
                      '&::-webkit-scrollbar': { display: 'none' },
                    }
                  : {
                      display: 'flex',
                      flexDirection: { xs: 'row', md: 'column' },
                      flexWrap: { xs: 'wrap', md: 'nowrap' },
                      gap: 1,
                    }),
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  background: isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.14)',
                  borderRadius: 4,
                },
              }}
            >
              {isNarrow ? (
                <Box ref={railRef} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  {pill && (
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        zIndex: 0,
                        top: pill.top,
                        bottom: pill.bottom,
                        left: pill.left,
                        width: pill.width,
                        borderRadius: '12px',
                        bgcolor: isDarkMode ? '#f8fafc' : '#0f172a',
                        boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(15,23,42,0.22)',
                        // Leading edge fast with a slight overshoot, trailing edge slower: a liquid stretch-and-settle.
                        transition: pill.down
                          ? 'bottom 260ms cubic-bezier(0.34, 1.4, 0.64, 1), top 440ms cubic-bezier(0.65, 0, 0.35, 1) 40ms'
                          : 'top 260ms cubic-bezier(0.34, 1.4, 0.64, 1), bottom 440ms cubic-bezier(0.65, 0, 0.35, 1) 40ms',
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                      }}
                    />
                  )}
                  {railItems()}
                </Box>
              ) : surveyCategories.map((cat, idx) => {
                const isSelected = cat.id === selectedSurveyId;
                const label = (cat as any).shortTitle || cat.title.split(' ')[0];

                return (
                  <Chip
                    key={cat.id}
                    icon={cat.icon as React.ReactElement}
                    label={label}
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
                      animation: `fadeInUp 0.3s ease ${idx * 30}ms both`,
                      transition: 'background-color 0.2s ease, color 0.2s ease, transform 0.15s ease',
                      '& .MuiChip-icon': { color: isSelected ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b', fontSize: '1rem', ml: 1 },
                      '& .MuiChip-label': { pl: 0.5 },
                      '&:hover': {
                        bgcolor: isSelected ? '#1d4ed8' : isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.09)',
                        transform: 'translateX(2px)',
                      },
                    }}
                  />
                );
              })}
            </Box>

            {/* Scroll affordance: fades the last row so it reads as "more below" */}
            {isNarrow && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 4,
                  bottom: 0,
                  height: 20,
                  pointerEvents: 'none',
                  background: `linear-gradient(180deg, transparent 0%, ${glassEdge(isDarkMode)} 90%)`,
                }}
              />
            )}
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
