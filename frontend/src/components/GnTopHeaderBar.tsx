import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GlobalSearchBar from './GlobalSearchBar';
import { useLanguage } from '../context/LanguageContext';
import { MOBILE_CATEGORIES } from './mobile/mobileCategories';

interface GnTopHeaderBarProps {
  districts?: any[];
  selectedDistrict?: string;
  onDistrictChange?: (d: string) => void;
  dsDivisions?: any[];
  selectedCity?: string;
  onCityChange?: (c: string) => void;
  gramaNiladharis?: any[];
  selectedGN?: string;
  onGNChange?: (g: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  onCycleLanguage?: () => void;
}

export const GnTopHeaderBar: React.FC<GnTopHeaderBarProps> = ({
  districts = [],
  selectedDistrict = '',
  onDistrictChange = () => {},
  dsDivisions = [],
  selectedCity = '',
  onCityChange = () => {},
  gramaNiladharis = [],
  selectedGN = '',
  onGNChange = () => {},
  isDarkMode = false,
  activeCategorySlug,
  onSelectCategory = () => {},
}) => {
  const { language } = useLanguage();

  const t = {
    en: { district: 'District', dsDivision: 'DS Division', village: 'Village', home: 'Home' },
    si: { district: 'දිස්ත්‍රික්කය', dsDivision: 'ප්‍රාදේශීය ලේකම්', village: 'ග්‍රාම නිලධාරී', home: 'මුල් පිටුව' },
    ta: { district: 'மாவட்டம்', dsDivision: 'பிரதேச செயலகம்', village: 'கிராம அலுவலர்', home: 'முகப்பு' },
  }[language] || { district: 'District', dsDivision: 'DS Division', village: 'Village', home: 'Home' };

  const categoryLabels: Record<string, string> = {
    'location-1-1': { en: 'Boundaries', si: 'මායිම්', ta: 'எல்லைகள்' }[language] || 'Boundaries',
    'location-1-2': { en: 'Space', si: 'අවකාශය', ta: 'வெளி' }[language] || 'Space',
    'location-1-3': { en: 'Land', si: 'ඉඩම්', ta: 'நிலம்' }[language] || 'Land',
    'location-1-4': { en: 'Building / Land', si: 'ගොඩනැගිලි/ඉඩම්', ta: 'கட்டிடம்/நிலம்' }[language] || 'Building / Land',
    'location-1-5': { en: 'Roads', si: 'මාර්ග', ta: 'சாலைகள்' }[language] || 'Roads',
    'location-1-6': { en: 'Geo Location', si: 'භූගෝලීය පිහිටීම', ta: 'புவியியல் அமைவிடம்' }[language] || 'Geo Location',
    'location-1-7': { en: 'Natural', si: 'ස්වාභාවික', ta: 'இயற்கை' }[language] || 'Natural',
    'location-1-8': { en: 'Water Spaces', si: 'ජල අවකාශ', ta: 'நீர் இடங்கள்' }[language] || 'Water Spaces',
    'location-1-9': { en: 'Lines', si: 'රේඛා', ta: 'கோடுகள்' }[language] || 'Lines',
    'location-1-10': { en: 'Flora', si: 'ශාක', ta: 'தாவரங்கள்' }[language] || 'Flora',
  };

  // ── Derive Current Village Identity Names ──────────────────────────────
  const activeDistrictObj = districts?.find((d: any) => d.id === selectedDistrict || d.admin2Pcode === selectedDistrict);

  const activeCityObj = dsDivisions?.find((c: any) => c.divisionalSecretariatCode === selectedCity);

  const activeGnObj = gramaNiladharis?.find((g: any) => String(g.id) === String(selectedGN) || g.CCODE === selectedGN || g.ccode === selectedGN);

  const activeCcode = activeGnObj?.CCODE || activeGnObj?.ccode || selectedGN || '';

  const surface = isDarkMode ? '#111827' : '#ffffff';
  const border = isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e9f0';
  const textMain = isDarkMode ? '#f1f5f9' : '#0f172a';
  const textMuted = isDarkMode ? '#94a3b8' : '#64748b';
  const fieldBg = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc';

  const selectSx = {
    minWidth: 128, height: 36, fontSize: '0.82rem', fontWeight: 600,
    bgcolor: fieldBg, borderRadius: '9px',
    color: textMain,
    '& .MuiSvgIcon-root': { color: textMuted },
    '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#2563eb !important' },
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Box
        sx={{
          borderRadius: '18px',
          bgcolor: surface,
          border,
          boxShadow: isDarkMode ? 'none' : '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.04)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.4s ease both',
        }}
      >
        {/* ── ROW 1: CCODE badge · Search · Selectors · Home ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.8,
            flexWrap: 'wrap',
          }}
        >
          {/* CCODE badge */}
          <Box
            sx={{
              flexShrink: 0,
              px: 1.4,
              py: 0.6,
              borderRadius: '8px',
              bgcolor: isDarkMode ? 'rgba(59,130,246,0.14)' : 'rgba(37,99,235,0.08)',
              color: '#2563eb',
              fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.6px',
            }}
          >
            {activeCcode || '—'}
          </Box>

          {/* Search */}
          <Box sx={{ flex: '1 1 260px', minWidth: 200 }}>
            <GlobalSearchBar isDarkMode={isDarkMode} activeGn={activeGnObj ? { nameEn: activeGnObj.nameEn, CCODE: activeCcode } : null} language={language} />
          </Box>

          {/* Selectors */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexShrink: 0 }}>
            <Select
              size="small"
              value={selectedDistrict || ''}
              onChange={(e) => onDistrictChange(e.target.value)}
              displayEmpty
              sx={selectSx}
              renderValue={(v) => {
                if (!v) return <Box component="span" sx={{ color: textMuted, fontWeight: 500 }}>{t.district}</Box>;
                const d = activeDistrictObj;
                const name = language === 'si' ? (d?.admin2NameSi || d?.nameSi || d?.nameEn) : language === 'ta' ? (d?.admin2NameTa || d?.nameTa || d?.nameEn) : (d?.admin2NameEn || d?.nameEn);
                return name || v;
              }}
            >
              {districts.map((d: any) => {
                const name = language === 'si' ? (d.admin2NameSi || d.nameSi || d.nameEn) : language === 'ta' ? (d.admin2NameTa || d.nameTa || d.nameEn) : (d.admin2NameEn || d.nameEn);
                return <MenuItem key={d.id || d.admin2Pcode} value={d.id || d.admin2Pcode}>{name}</MenuItem>;
              })}
            </Select>

            <Select
              size="small"
              value={selectedCity || ''}
              onChange={(e) => onCityChange(e.target.value)}
              displayEmpty
              disabled={!selectedDistrict || dsDivisions.length === 0}
              sx={selectSx}
              renderValue={(v) => {
                if (!v) return <Box component="span" sx={{ color: textMuted, fontWeight: 500 }}>{t.dsDivision}</Box>;
                const c = activeCityObj;
                const name = language === 'si' ? (c?.dsSi || c?.dsEn) : language === 'ta' ? (c?.dsTa || c?.dsEn) : (c?.dsEn || v);
                return name || v;
              }}
            >
              {dsDivisions.map((city: any) => {
                const name = language === 'si' ? (city.dsSi || city.dsEn) : language === 'ta' ? (city.dsTa || city.dsEn) : (city.dsEn || city.divisionalSecretariatCode || city.dsCode);
                return <MenuItem key={city.divisionalSecretariatCode || city.dsCode} value={city.divisionalSecretariatCode || city.dsCode}>{name}</MenuItem>;
              })}
            </Select>

            <Select
              size="small"
              value={selectedGN || ''}
              onChange={(e) => onGNChange(e.target.value)}
              displayEmpty
              disabled={!selectedCity || gramaNiladharis.length === 0}
              sx={selectSx}
              renderValue={(v) => {
                if (!v) return <Box component="span" sx={{ color: textMuted, fontWeight: 500 }}>{t.village}</Box>;
                const g = activeGnObj;
                const name = language === 'si' ? (g?.nameSi || g?.nameEn) : language === 'ta' ? (g?.nameTa || g?.nameEn) : g?.nameEn;
                return name || v;
              }}
            >
              {gramaNiladharis.map((gn: any) => {
                const name = language === 'si' ? (gn.nameSi || gn.nameEn) : language === 'ta' ? (gn.nameTa || gn.nameEn) : gn.nameEn;
                return <MenuItem key={gn.id || gn.CCODE || gn.ccode} value={String(gn.id) || gn.CCODE || gn.ccode}>{name}</MenuItem>;
              })}
            </Select>
          </Box>
        </Box>

        <Box sx={{ height: '1px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' }} />

        {/* ── ROW 2: Flat category rail ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2.25,
            py: 1.4,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)', borderRadius: '4px' },
          }}
        >
          {MOBILE_CATEGORIES.map((cat, idx) => {
            const isActive = activeCategorySlug === cat.slug;
            return (
              <Box
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                role="button"
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.7, flexShrink: 0, cursor: 'pointer',
                  px: 1.3, py: 0.7, borderRadius: '9px',
                  color: isActive ? '#2563eb' : textMuted,
                  bgcolor: isActive ? (isDarkMode ? 'rgba(59,130,246,0.16)' : 'rgba(37,99,235,0.08)') : 'transparent',
                  transition: 'background-color 150ms ease, color 150ms ease, transform 150ms ease',
                  animation: `fadeInUp 0.35s ease ${idx * 30}ms both`,
                  '& .MuiSvgIcon-root': { fontSize: '1.05rem', transition: 'transform 150ms ease' },
                  '&:hover': {
                    bgcolor: isActive ? (isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)') : (isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.045)'),
                    color: isActive ? '#2563eb' : textMain,
                    '& .MuiSvgIcon-root': { transform: 'scale(1.1)' },
                  },
                }}
              >
                {cat.icon}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap' }}>
                  {categoryLabels[cat.slug]}
                </Typography>
              </Box>
            );
          })}

          <Box sx={{ flexGrow: 1, minWidth: 8 }} />

          <Tooltip title={t.home}>
            <IconButton
              onClick={() => {
                if (activeGnObj?.nameEn && activeCcode) {
                  window.location.href = `/gnpage/${activeGnObj.nameEn.replace(/ /g, '-')}/${activeCcode}`;
                } else {
                  window.location.href = '/gnpage';
                }
              }}
              size="small"
              sx={{ width: 32, height: 32, color: textMuted, flexShrink: 0 }}
            >
              <HomeRoundedIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default GnTopHeaderBar;
