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

interface GnTopHeaderBarProps {
  districts: any[];
  selectedDistrict: string;
  onDistrictChange: (d: string) => void;
  dsDivisions: any[];
  selectedCity: string;
  onCityChange: (c: string) => void;
  gramaNiladharis: any[];
  selectedGN: string;
  onGNChange: (g: string) => void;
  language: 'en' | 'si' | 'ta';
  onCycleLanguage: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export const GnTopHeaderBar: React.FC<GnTopHeaderBarProps> = ({
  districts,
  selectedDistrict,
  onDistrictChange,
  dsDivisions,
  selectedCity,
  onCityChange,
  gramaNiladharis,
  selectedGN,
  onGNChange,
  language = 'en',
  onCycleLanguage,
  isDarkMode,
  onToggleDarkMode,
  isAuthenticated,
  onLoginClick,
  activeCategorySlug,
  onSelectCategory,
}) => {
  const navigate = useNavigate();
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

  const categories = [
    { label: t.boundaries, slug: 'boundaries' },
    { label: t.geographicalLocation, slug: 'geographical-location' },
    { label: t.space, slug: 'space' },
    { label: t.land, slug: 'land' },
    { label: t.buildingLand, slug: 'building-land' },
    { label: t.waterBaseSpaces, slug: 'water-base-spaces' },
    { label: t.road, slug: 'road' },
    { label: t.naturalLocation, slug: 'natural-location' },
    { label: t.lines, slug: 'lines' },
    { label: t.flora, slug: 'flora' },
  ];

  const surveyCategories = [
    { name: 'Demographics & Population', slug: 'population' },
    { name: 'Age Distribution', slug: 'age' },
    { name: 'Economy & Employment', slug: 'economy' },
    { name: 'Housing Ownership', slug: 'housing-ownership' },
    { name: 'Wall Types', slug: 'wall-type' },
    { name: 'Housing Unit Types', slug: 'unit-type' },
    { name: 'Toilet Facilities', slug: 'toilet-facilities' },
    { name: 'Drinking Water Sources', slug: 'drinking-water' },
    { name: 'Solid Waste Disposal', slug: 'solid-waste' },
    { name: 'Rooms in Housing', slug: 'rooms' },
    { name: 'Roof Types', slug: 'roof-type' },
    { name: 'Religious Composition', slug: 'religion' },
    { name: 'Household Head Relationship', slug: 'household' },
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

  const activeGnObj = gramaNiladharis?.find((g: any) => g.id === selectedGN || g.CCODE === selectedGN);
  const villageName = language === 'si'
    ? (activeGnObj?.nameSi || activeGnObj?.nameEn)
    : language === 'ta'
    ? (activeGnObj?.nameTa || activeGnObj?.nameEn)
    : (activeGnObj?.nameEn || selectedGN);

  const activeCcode = activeGnObj?.CCODE || selectedGN || '';

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* ── TOP HEADER GLASS BAR ────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, lg: 2 },
          p: { xs: 1.5, md: 1.8 },
          borderRadius: '24px',
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.85)',
          boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left Section: Logo & Home & Categories */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          {/* Logo Capsule */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2.2,
              py: 0.8,
              borderRadius: '50px',
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'scale(1.02)' },
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '3px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 6, height: 6, bgcolor: '#3b82f6', borderRadius: '50%' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
              ceystem.com
            </Typography>
          </Box>

          {/* Quick Home Icon */}
          <Tooltip title="Home">
            <IconButton
              size="small"
              onClick={() => navigate('/')}
              sx={{
                p: 0.8,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                color: isDarkMode ? '#f8fafc' : '#1e293b',
                borderRadius: '12px',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
              }}
            >
              <HomeIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={(e) => setCategoriesMenuAnchor(e.currentTarget)}
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              color: isDarkMode ? '#cbd5e1' : '#475569',
              textTransform: 'none',
              borderRadius: '12px',
              px: 1.5,
              py: 0.6,
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
            }}
          >
            {t.categories}
          </Button>

          <Menu
            anchorEl={categoriesMenuAnchor}
            open={Boolean(categoriesMenuAnchor)}
            onClose={() => setCategoriesMenuAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                minWidth: 220,
                mt: 1,
                bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 16px 36px rgba(0,0,0,0.2)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
              },
            }}
          >
            {categories.map((item) => (
              <MenuItem
                key={item.slug}
                onClick={() => {
                  setCategoriesMenuAnchor(null);
                  if (onSelectCategory) {
                    onSelectCategory(item.slug);
                  } else {
                    navigate(`/category/${item.slug}`);
                  }
                }}
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 1,
                  px: 2,
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.12)',
                    color: '#3b82f6',
                  },
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Center: Location Selectors (District, DS, Village) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {t.district}
            </Typography>
            <Select
              size="small"
              value={selectedDistrict || ''}
              onChange={(e) => onDistrictChange(e.target.value)}
              displayEmpty
              sx={{
                minWidth: 130,
                height: 32,
                fontSize: '0.82rem',
                fontWeight: 600,
                bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
                borderRadius: '8px',
                '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select</em>
              </MenuItem>
              {districts.map((d: any) => {
                const name = language === 'si' ? (d.admin2NameSi || d.nameSi || d.nameEn) : language === 'ta' ? (d.admin2NameTa || d.nameTa || d.nameEn) : (d.admin2NameEn || d.nameEn);
                return (
                  <MenuItem key={d.id || d.admin2Pcode} value={d.id || d.admin2Pcode}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {t.dsDivision}
            </Typography>
            <Select
              size="small"
              value={selectedCity || ''}
              onChange={(e) => onCityChange(e.target.value)}
              displayEmpty
              disabled={!selectedDistrict || dsDivisions.length === 0}
              sx={{
                minWidth: 130,
                height: 32,
                fontSize: '0.82rem',
                fontWeight: 600,
                bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
                borderRadius: '8px',
                '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select</em>
              </MenuItem>
              {dsDivisions.map((city: any) => {
                const name = language === 'si' ? (city.dsSi || city.dsEn) : language === 'ta' ? (city.dsTa || city.dsEn) : (city.dsEn || city.divisionalSecretariatCode);
                return (
                  <MenuItem key={city.divisionalSecretariatCode} value={city.divisionalSecretariatCode}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {t.village}
            </Typography>
            <Select
              size="small"
              value={selectedGN || ''}
              onChange={(e) => onGNChange(e.target.value)}
              displayEmpty
              disabled={!selectedCity || gramaNiladharis.length === 0}
              sx={{
                minWidth: 130,
                height: 32,
                fontSize: '0.82rem',
                fontWeight: 600,
                bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
                borderRadius: '8px',
                '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select</em>
              </MenuItem>
              {gramaNiladharis.map((gn: any) => {
                const name = language === 'si' ? (gn.nameSi || gn.nameEn) : language === 'ta' ? (gn.nameTa || gn.nameEn) : gn.nameEn;
                return (
                  <MenuItem key={gn.id || gn.CCODE} value={gn.id || gn.CCODE}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        </Box>

        {/* Right Section: Login, Language, Theme */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
          <Button
            onClick={onLoginClick}
            startIcon={<AccountCircleIcon sx={{ fontSize: '1.1rem' }} />}
            sx={{
              borderRadius: '50px',
              px: 2.2,
              py: 0.7,
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
              color: isDarkMode ? '#f8fafc' : '#1e293b',
              fontWeight: 800,
              fontSize: '0.82rem',
              textTransform: 'none',
              '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' },
            }}
          >
            {isAuthenticated ? t.profile : t.login}
          </Button>

          <Tooltip title={`Switch Language (Current: ${language.toUpperCase()})`}>
            <IconButton
              onClick={onCycleLanguage}
              size="small"
              sx={{
                p: 0.7,
                color: isDarkMode ? '#cbd5e1' : '#475569',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderRadius: '10px',
              }}
            >
              <TranslateIcon sx={{ fontSize: '1.15rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle Theme">
            <IconButton
              onClick={onToggleDarkMode}
              size="small"
              sx={{
                p: 0.7,
                color: isDarkMode ? '#f59e0b' : '#475569',
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderRadius: '10px',
              }}
            >
              {isDarkMode ? <LightModeIcon sx={{ fontSize: '1.15rem' }} /> : <DarkModeIcon sx={{ fontSize: '1.15rem' }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── HORIZONTAL CATEGORIES RIBBON BAR ────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0.6, md: 1.2 },
          mt: 2.2,
          px: { xs: 1.5, md: 2.5 },
          py: 1,
          borderRadius: '20px',
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        {categories.map((cat, idx) => {
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
                  color: isActive ? '#3b82f6' : isDarkMode ? '#e2e8f0' : '#1e293b',
                  fontWeight: 700,
                  fontSize: { xs: '0.78rem', md: '0.85rem' },
                  textTransform: 'none',
                  px: { xs: 1.1, md: 1.6 },
                  py: 0.5,
                  borderRadius: '12px',
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    color: '#3b82f6',
                  },
                }}
              >
                {cat.label}
              </Button>
              {idx < categories.length - 1 && (
                <Typography sx={{ color: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontWeight: 300 }}>
                  |
                </Typography>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export default GnTopHeaderBar;
