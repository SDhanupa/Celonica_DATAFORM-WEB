import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Menu,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GlobalSearchBar from './GlobalSearchBar';
import { useLanguage } from '../context/LanguageContext';


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
  onToggleDarkMode = () => {},
  isAuthenticated = false,
  onLoginClick = () => {},
  activeCategorySlug,
  onSelectCategory = () => {},
}) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [categoriesMenuAnchor, setCategoriesMenuAnchor] = useState<null | HTMLElement>(null);

  const t = {
    en: {
      myVillage: 'MY Village',
      district: 'District',
      dsDivision: 'DS Division',
      village: 'Village',
      login: 'Login',
      profile: 'Profile',
      categories: 'Categories',
      boundaries: 'Boundaries',
      geographicalLocation: 'Geographical location',
      space: 'Space',
      land: 'Land',
      buildingLand: 'Building/Land',
      waterBaseSpaces: 'Water base spaces',
      road: 'Road',
      naturalLocation: 'Natural location',
      lines: 'Lines',
      flora: 'Flora',
    },
    si: {
      myVillage: 'මගේ ගම',
      district: 'දිස්ත්‍රික්කය',
      dsDivision: 'ප්‍රාදේශීය ලේකම්',
      village: 'ග්‍රාම නිලධාරී',
      login: 'පිවිසෙන්න',
      profile: 'පැතිකඩ',
      categories: 'ප්‍රවර්ග',
      boundaries: 'මායිම්',
      geographicalLocation: 'භූගෝලීය පිහිටීම',
      space: 'අවකාශය',
      land: 'ඉඩම්',
      buildingLand: 'ගොඩනැගිලි/ඉඩම්',
      waterBaseSpaces: 'ජල මූලාශ්‍ර අවකාශ',
      road: 'මාර්ග',
      naturalLocation: 'ස්වාභාවික පිහිටීම',
      lines: 'රේඛා',
      flora: 'ශාක',
    },
    ta: {
      myVillage: 'எனது கிராமம்',
      district: 'மாவட்டம்',
      dsDivision: 'பிரதேச செயலகம்',
      village: 'கிராம அலுவலர்',
      login: 'உள்நுழைய',
      profile: 'சுயவிவரம்',
      categories: 'வகைகள்',
      boundaries: 'எல்லைகள்',
      geographicalLocation: 'புவியியல் அமைவிடம்',
      space: 'வெளி',
      land: 'நிலம்',
      buildingLand: 'கட்டிடம்/நிலம்',
      waterBaseSpaces: 'நீர் சார்ந்த இடங்கள்',
      road: 'சாலை',
      naturalLocation: 'இயற்கை அமைவிடம்',
      lines: 'கோடுகள்',
      flora: 'தாவரங்கள்',
    },
  }[language] || {
    myVillage: 'MY Village',
    district: 'District',
    dsDivision: 'DS Division',
    village: 'Village',
    login: 'Login',
    profile: 'Profile',
    categories: 'Categories',
    boundaries: 'Boundaries',
    geographicalLocation: 'Geographical location',
    space: 'Space',
    land: 'Land',
    buildingLand: 'Building/Land',
    waterBaseSpaces: 'Water base spaces',
    road: 'Road',
    naturalLocation: 'Natural location',
    lines: 'Lines',
    flora: 'Flora',
  };

  const handleCycleLanguage = () => {
    if (language === 'en') setLanguage('si');
    else if (language === 'si') setLanguage('ta');
    else setLanguage('en');
  };

  const categories = [
    { label: t.boundaries, slug: 'location-1-1' },
    { label: t.space, slug: 'location-1-2' },
    { label: t.land, slug: 'location-1-3' },
    { label: t.buildingLand, slug: 'location-1-4' },
    { label: t.road, slug: 'location-1-5' },
    { label: t.geographicalLocation, slug: 'location-1-6' },
    { label: t.naturalLocation, slug: 'location-1-7' },
    { label: t.waterBaseSpaces, slug: 'location-1-8' },
    { label: t.lines, slug: 'location-1-9' },
    { label: t.flora, slug: 'location-1-10' },
  ];

  // ── Derive Current Village Identity Names ──────────────────────────────
  const activeDistrictObj = districts?.find((d: any) => d.id === selectedDistrict || d.admin2Pcode === selectedDistrict);
  const districtName = language === 'si'
    ? (activeDistrictObj?.admin2NameSi || activeDistrictObj?.nameSi || activeDistrictObj?.admin2NameEn || activeDistrictObj?.nameEn)
    : language === 'ta'
      ? (activeDistrictObj?.admin2NameTa || activeDistrictObj?.nameTa || activeDistrictObj?.admin2NameEn || activeDistrictObj?.nameEn)
      : (activeDistrictObj?.admin2NameEn || activeDistrictObj?.nameEn || selectedDistrict);

  const activeCityObj = dsDivisions?.find((c: any) => c.divisionalSecretariatCode === selectedCity);
  const cityName = language === 'si'
    ? (activeCityObj?.dsSi || activeCityObj?.dsEn)
    : language === 'ta'
      ? (activeCityObj?.dsTa || activeCityObj?.dsEn)
      : (activeCityObj?.dsEn || selectedCity);

  const activeGnObj = gramaNiladharis?.find((g: any) => String(g.id) === String(selectedGN) || g.CCODE === selectedGN || g.ccode === selectedGN);
  const villageName = language === 'si'
    ? (activeGnObj?.nameSi || activeGnObj?.nameEn)
    : language === 'ta'
      ? (activeGnObj?.nameTa || activeGnObj?.nameEn)
      : (activeGnObj?.nameEn || selectedGN);

  const activeCcode = activeGnObj?.CCODE || activeGnObj?.ccode || selectedGN || '';

  return (
    <Box sx={{ width: '100%', mb: 4, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1000 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 2, md: 4 },
          p: { xs: 2, md: 2.5 },
          borderRadius: '30px',
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.6)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* ── LEFT LOGO SECTION (Dynamic Location Info) ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 4 }, borderRight: { md: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }, minWidth: '220px' }}>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '2px' }}>
            {activeCcode || 'WCDOR'}
          </Typography>
        </Box>

        {/* ── MIDDLE SEARCH SECTION ── */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 0, md: 2 } }}>
          <GlobalSearchBar isDarkMode={isDarkMode} activeGn={activeGnObj ? { nameEn: activeGnObj.nameEn, CCODE: activeCcode } : null} language={language} />
        </Box>

        {/* ── RIGHT SECTION (Categories + Selectors) ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, xl: 2.5 }, flex: 1.5, minWidth: 0, py: { xs: 0, xl: 1 }, px: { xs: 0, xl: 1 } }}>

          {/* Top Row: Categories */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 1,
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-start' },
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { height: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '4px' }
          }}>
            {categories.slice(0, 8).map((cat, idx) => {
              const isActive = activeCategorySlug === cat.slug;
              return (
                <React.Fragment key={cat.slug}>
                  <Button
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat.slug);
                      } else {
                        navigate(`/category/${cat.slug}`);
                      }
                    }}
                    sx={{
                      color: isActive ? '#3b82f6' : isDarkMode ? '#e2e8f0' : '#475569',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      textTransform: 'none',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '20px',
                      bgcolor: isActive ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        color: '#3b82f6',
                      },
                    }}
                  >
                    {cat.label}
                  </Button>
                  <Typography sx={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', fontWeight: 300, mx: { xs: 0.2, xl: 0.5 } }}>
                    |
                  </Typography>
                </React.Fragment>
              );
            })}

            {/* More Button */}
            <Button
              onClick={(e) => setCategoriesMenuAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                color: isDarkMode ? '#e2e8f0' : '#475569',
                fontWeight: 600,
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                textTransform: 'none',
                px: 1.2,
                py: 0.4,
                borderRadius: '20px',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                  color: '#3b82f6',
                },
              }}
            >
              More
            </Button>
            <Menu
              anchorEl={categoriesMenuAnchor}
              open={Boolean(categoriesMenuAnchor)}
              onClose={() => setCategoriesMenuAnchor(null)}
              PaperProps={{
                sx: {
                  bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  mt: 1
                }
              }}
            >
              {categories.slice(8).map((cat) => (
                <MenuItem
                  key={cat.slug}
                  onClick={() => {
                    setCategoriesMenuAnchor(null);
                    if (onSelectCategory) {
                      onSelectCategory(cat.slug);
                    } else {
                      navigate(`/category/${cat.slug}`);
                    }
                  }}
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: activeCategorySlug === cat.slug ? '#3b82f6' : (isDarkMode ? '#e2e8f0' : '#1e293b'),
                    bgcolor: activeCategorySlug === cat.slug ? (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)') : 'transparent',
                  }}
                >
                  {cat.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ height: '1px', width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />

          {/* Bottom Row: Location Selectors */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 2, xl: 4 }, justifyContent: { xs: 'center', md: 'flex-start' } }}>
            {/* District */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {t.district}
              </Typography>
              <Select
                size="small"
                value={selectedDistrict || ''}
                onChange={(e) => onDistrictChange(e.target.value)}
                displayEmpty
                sx={{
                  minWidth: 140, height: 32, fontSize: '0.85rem', fontWeight: 600,
                  bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', borderRadius: '8px',
                  color: isDarkMode ? '#e2e8f0' : '#0f172a',
                  '& .MuiSvgIcon-root': { color: isDarkMode ? '#94a3b8' : 'inherit' },
                  '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)' },
                }}
              >
                <MenuItem value="" disabled><em>Select</em></MenuItem>
                {districts.map((d: any) => {
                  const name = language === 'si' ? (d.admin2NameSi || d.nameSi || d.nameEn) : language === 'ta' ? (d.admin2NameTa || d.nameTa || d.nameEn) : (d.admin2NameEn || d.nameEn);
                  return <MenuItem key={d.id || d.admin2Pcode} value={d.id || d.admin2Pcode}>{name}</MenuItem>;
                })}
              </Select>
            </Box>

            <Typography sx={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>|</Typography>

            {/* DS Division */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {t.dsDivision}
              </Typography>
              <Select
                size="small"
                value={selectedCity || ''}
                onChange={(e) => onCityChange(e.target.value)}
                displayEmpty
                disabled={!selectedDistrict || dsDivisions.length === 0}
                sx={{
                  minWidth: 140, height: 32, fontSize: '0.85rem', fontWeight: 600,
                  bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', borderRadius: '8px',
                  color: isDarkMode ? '#e2e8f0' : '#0f172a',
                  '& .MuiSvgIcon-root': { color: isDarkMode ? '#94a3b8' : 'inherit' },
                  '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)' },
                }}
              >
                <MenuItem value="" disabled><em>Select</em></MenuItem>
                  {dsDivisions.map((city: any) => {
                    const name = language === 'si' ? (city.dsSi || city.dsEn) : language === 'ta' ? (city.dsTa || city.dsEn) : (city.dsEn || city.divisionalSecretariatCode || city.dsCode);
                    return <MenuItem key={city.divisionalSecretariatCode || city.dsCode} value={city.divisionalSecretariatCode || city.dsCode}>{name}</MenuItem>;
                  })}
              </Select>
            </Box>

            <Typography sx={{ color: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>|</Typography>

            {/* GN Division */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {t.village}
              </Typography>
              <Select
                size="small"
                value={selectedGN || ''}
                onChange={(e) => onGNChange(e.target.value)}
                displayEmpty
                disabled={!selectedCity || gramaNiladharis.length === 0}
                sx={{
                  minWidth: 140, height: 32, fontSize: '0.85rem', fontWeight: 600,
                  bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', borderRadius: '8px',
                  color: isDarkMode ? '#e2e8f0' : '#0f172a',
                  '& .MuiSvgIcon-root': { color: isDarkMode ? '#94a3b8' : 'inherit' },
                  '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)' },
                }}
              >
                <MenuItem value="" disabled><em>Select</em></MenuItem>
                {gramaNiladharis.map((gn: any) => {
                  const name = language === 'si' ? (gn.nameSi || gn.nameEn) : language === 'ta' ? (gn.nameTa || gn.nameEn) : gn.nameEn;
                  return <MenuItem key={gn.id || gn.CCODE || gn.ccode} value={String(gn.id) || gn.CCODE || gn.ccode}>{name}</MenuItem>;
                })}
              </Select>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: { md: 'auto' } }}>
              <Tooltip title="Home">
                <IconButton onClick={() => {
                  if (activeGnObj?.nameEn && activeCcode) {
                    navigate(`/gnpage/${activeGnObj.nameEn.replace(/ /g, '-')}/${activeCcode}`);
                  } else {
                    navigate('/gnpage');
                  }
                }} sx={{ color: isDarkMode ? '#e2e8f0' : '#475569' }}>
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Translate (EN/SI/TA)">
                <IconButton onClick={handleCycleLanguage} sx={{ color: isDarkMode ? '#e2e8f0' : '#475569' }}>
                  <TranslateIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GnTopHeaderBar;
