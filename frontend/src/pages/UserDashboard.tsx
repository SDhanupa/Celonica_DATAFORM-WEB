import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia, FormControl, useTheme, useMediaQuery, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField, IconButton, Divider } from '@mui/material';
import { useSwipeable } from 'react-swipeable';
import { useQuery } from '@apollo/client';
import { GET_P_DISTRICTS, GET_P_DISTRICT_WITH_GNS, GET_GN_BY_COORDINATES } from '../graphql/queries';
import PopulationInfographic from '../components/PopulationInfographic';
import Custom3DBarChart from '../components/Custom3DBarChart';
import AgeDemographicsChart from '../components/AgeDemographicsChart';
import HousingOwnershipChart from '../components/HousingOwnershipChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const getThemeColors = (isDark: boolean) => ({
  primary: '#00A8FF',
  secondary: '#FF4E3A',
  darkCharcoal: isDark ? '#121212' : '#1D1F21',
  lightBg: isDark ? '#1D1F21' : '#F5F6F8',
  textLight: isDark ? '#F5F6F8' : '#FFFFFF',
  textDark: isDark ? '#FFFFFF' : '#1A1A1D',
  textMuted: isDark ? '#AAAAAA' : '#666666',
  cardBg: isDark ? '#2A2C30' : '#FFFFFF',
});

interface UserDashboardProps {
  user: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const themeColors = getThemeColors(isDarkMode);

  // GPS State
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  // Dropdown State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedGN, setSelectedGN] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [showLocationModal, setShowLocationModal] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'si' | 'ta'>('en');
  const [showManualForm, setShowManualForm] = useState(!window.matchMedia('(max-width: 600px)').matches);
  const canContinue = !showManualForm
    ? (location !== null || locationError !== null)
    : (selectedDistrict !== '' && selectedCity !== '' && selectedGN !== '');

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('si');
    else if (language === 'si') setLanguage('ta');
    else setLanguage('en');
  };

  // Mobile UI States
  const [activeMobileChart, setActiveMobileChart] = useState<'pie' | 'bar' | 'economy' | 'age' | 'ownership' | 'wall' | 'unit' | 'toilet' | 'water' | 'waste' | 'rooms' | 'roof' | 'religion' | 'household'>('pie');



  // Search Logic Queries
  const { data: districtsData, loading: districtsLoading, error: districtsError } = useQuery(GET_P_DISTRICTS, {
    skip: !showManualForm,
    fetchPolicy: 'network-only',
  });
  console.log('Districts query:', { districtsData, districtsLoading, districtsError });

  const { data: gnData, loading: gnLoading, error: gnError } = useQuery(GET_P_DISTRICT_WITH_GNS, {
    variables: { id: selectedDistrict },
    skip: !selectedDistrict || !showManualForm,
    fetchPolicy: 'network-only',
  });
  console.log('GN Data query:', { gnData, gnLoading, gnError });

  const uniqueCities = React.useMemo(() => {
    if (!gnData?.pDistrict?.gramaNiladharis) return [];
    const citiesMap = new Map();
    gnData.pDistrict.gramaNiladharis.forEach((gn: any) => {
      if (gn.divisionalSecretariatCode && !citiesMap.has(gn.divisionalSecretariatCode)) {
        citiesMap.set(gn.divisionalSecretariatCode, gn);
      }
    });
    return Array.from(citiesMap.values());
  }, [gnData]);

  const filteredGNs = React.useMemo(() => {
    if (!gnData?.pDistrict?.gramaNiladharis) return [];
    if (!selectedCity) return gnData.pDistrict.gramaNiladharis;
    return gnData.pDistrict.gramaNiladharis.filter((gn: any) => gn.divisionalSecretariatCode === selectedCity);
  }, [gnData, selectedCity]);

  const { data: autoGnData, loading: autoGnLoading } = useQuery(GET_GN_BY_COORDINATES, {
    variables: { lat: location?.lat, lng: location?.lng },
    skip: !location || showManualForm,
    fetchPolicy: 'network-only',
  });

  // Geolocation Effect
  useEffect(() => {
    if (!showManualForm && !location && !locationError) {
      setLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocating(false);
          },
          (error) => {
            setLocationError(error.message || 'Unable to retrieve your location');
            setLocating(false);
          }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser');
        setLocating(false);
      }
    }
  }, [showManualForm, location, locationError]);

  useEffect(() => {
    if (autoGnData?.gnByCoordinates) {
      setSelectedDistrict(autoGnData.gnByCoordinates.pDistrict?.id || '');
      setSelectedCity(autoGnData.gnByCoordinates.divisionalSecretariatCode || '');
      setSelectedGN(autoGnData.gnByCoordinates.id || '');
    }
  }, [autoGnData]);

  // Compute display names for District, City, and GN Division
  let displayDistrict = '';
  let displayCity = '';
  let displayGN = '';
  let displayCCODE = '';
  let populationData: { both: number, male: number, female: number, age_0_14?: number, age_15_59?: number, age_60_64?: number, age_65_above?: number } | null = null;
  let gnEconomyData: any = null;
  let housingOwnershipData: any = null;
  let housingWallData: any = null;
  let housingUnitData: any = null;
  let toiletFacilityData: any = null;
  let drinkingWaterData: any = null;
  let solidWasteData: any = null;
  let roomsData: any = null;
  let roofData: any = null;
  let religionData: any = null;
  let householdHeadData: any = null;

  if (!showManualForm && autoGnData?.gnByCoordinates) {
    const d = autoGnData.gnByCoordinates.pDistrict;
    displayDistrict = language === 'en' ? d?.admin2NameEn : language === 'si' ? d?.admin2NameSi : d?.admin2NameTa;
    const g = autoGnData.gnByCoordinates;
    displayCity = language === 'en' ? g?.dsEn : language === 'si' ? g?.dsSi : g?.dsTa;
    displayGN = language === 'en' ? g?.nameEn : language === 'si' ? g?.nameSi : g?.nameTa;
    displayCCODE = g?.CCODE || '';
    if (g?.pGn) {
      populationData = {
        both: g.pGn.populationBoth || 0,
        male: g.pGn.populationMale || 0,
        female: g.pGn.populationFemale || 0,
        age_0_14: g.pGn.age_0_14 || 0,
        age_15_59: g.pGn.age_15_59 || 0,
        age_60_64: g.pGn.age_60_64 || 0,
        age_65_above: g.pGn.age_65_above || 0
      };
    }
    if (g?.gnEconomy) {
      gnEconomyData = g.gnEconomy;
    }
    if (g?.housingOwnershipStatus) {
      housingOwnershipData = g.housingOwnershipStatus;
    }
    if (g?.housingWallType) {
      housingWallData = g.housingWallType;
    }
    if (g?.housingUnitType) {
      housingUnitData = g.housingUnitType;
    }
    if (g?.toiletFacility) {
      toiletFacilityData = g.toiletFacility;
    }
    if (g?.drinkingWaterSource) {
      drinkingWaterData = g.drinkingWaterSource;
    }
    if (g?.solidWasteDisposal) {
      solidWasteData = g.solidWasteDisposal;
    }
    if (g?.roomsInHousingUnit) {
      roomsData = g.roomsInHousingUnit;
    }
    if (g?.housingRoofType) {
      roofData = g.housingRoofType;
    }
    if (g?.religiousAffiliation) {
      religionData = g.religiousAffiliation;
    }
    if (g?.householdHeadRelationship) {
      householdHeadData = g.householdHeadRelationship;
    }
  } else if (showManualForm && selectedDistrict) {
    const d = districtsData?.pDistricts?.find((x: any) => x.id === selectedDistrict);
    if (d) {
      displayDistrict = language === 'en' ? d.admin2NameEn : language === 'si' ? d.admin2NameSi : d.admin2NameTa;
      // Fallback to District population
      populationData = {
        both: d.populationBoth || 0,
        male: d.populationMale || 0,
        female: d.populationFemale || 0
      };
    }
    
    if (selectedCity) {
      const c = uniqueCities.find((x: any) => x.divisionalSecretariatCode === selectedCity);
      if (c) {
        displayCity = language === 'en' ? c.dsEn : language === 'si' ? c.dsSi : c.dsTa;
        
        // Sum population for all GNs in this DS Division
        if (gnData?.pDistrict?.gramaNiladharis) {
          let cityBoth = 0, cityMale = 0, cityFemale = 0;
          let cityAge14 = 0, cityAge59 = 0, cityAge64 = 0, cityAge65 = 0;
          gnData.pDistrict.gramaNiladharis.forEach((gn: any) => {
            if (gn.divisionalSecretariatCode === selectedCity && gn.pGn) {
              cityBoth += gn.pGn.populationBoth || 0;
              cityMale += gn.pGn.populationMale || 0;
              cityFemale += gn.pGn.populationFemale || 0;
              cityAge14 += gn.pGn.age_0_14 || 0;
              cityAge59 += gn.pGn.age_15_59 || 0;
              cityAge64 += gn.pGn.age_60_64 || 0;
              cityAge65 += gn.pGn.age_65_above || 0;
            }
          });
          if (cityBoth > 0) {
            populationData = { 
              both: cityBoth, male: cityMale, female: cityFemale,
              age_0_14: cityAge14, age_15_59: cityAge59, age_60_64: cityAge64, age_65_above: cityAge65
            };
          }
        }
      }
      
      if (selectedGN) {
        const g = gnData?.pDistrict?.gramaNiladharis?.find((x: any) => x.id === selectedGN);
        if (g) {
          displayGN = language === 'en' ? g.nameEn : language === 'si' ? g.nameSi : g.nameTa;
          displayCCODE = g.CCODE || '';
          if (g.pGn) {
            populationData = {
              both: g.pGn.populationBoth || 0,
              male: g.pGn.populationMale || 0,
              female: g.pGn.populationFemale || 0,
              age_0_14: g.pGn.age_0_14 || 0,
              age_15_59: g.pGn.age_15_59 || 0,
              age_60_64: g.pGn.age_60_64 || 0,
              age_65_above: g.pGn.age_65_above || 0
            };
          }
          if (g.gnEconomy) {
            gnEconomyData = g.gnEconomy;
          }
          if (g.housingOwnershipStatus) {
            housingOwnershipData = g.housingOwnershipStatus;
          }
          if (g.housingWallType) {
            housingWallData = g.housingWallType;
          }
          if (g.housingUnitType) {
            housingUnitData = g.housingUnitType;
          }
          if (g.toiletFacility) {
            toiletFacilityData = g.toiletFacility;
          }
          if (g.drinkingWaterSource) {
            drinkingWaterData = g.drinkingWaterSource;
          }
          if (g.solidWasteDisposal) {
            solidWasteData = g.solidWasteDisposal;
          }
          if (g.roomsInHousingUnit) {
            roomsData = g.roomsInHousingUnit;
          }
          if (g.housingRoofType) {
            roofData = g.housingRoofType;
          }
          if (g.religiousAffiliation) {
            religionData = g.religiousAffiliation;
          }
          if (g.householdHeadRelationship) {
            householdHeadData = g.householdHeadRelationship;
          }
        }
      }
    }
  }

  const hasEconomyData = gnEconomyData && ((gnEconomyData.employed || 0) > 0 || (gnEconomyData.unemployed || 0) > 0 || (gnEconomyData.economically_not_active || 0) > 0);
  const hasOwnershipData = housingOwnershipData && (housingOwnershipData.total_households || 0) > 0;
  const hasWallData = housingWallData && (housingWallData.total_units || 0) > 0;
  const hasUnitData = housingUnitData && (housingUnitData.total_units || 0) > 0;
  const hasToiletData = toiletFacilityData && (toiletFacilityData.total_households || 0) > 0;
  const hasWaterData = drinkingWaterData && (drinkingWaterData.total_households || 0) > 0;
  const hasWasteData = solidWasteData && (solidWasteData.total_households || 0) > 0;
  const hasRoomsData = roomsData && (roomsData.total_housing_units || 0) > 0;
  const hasRoofData = roofData && (roofData.total_housing_units || 0) > 0;
  const hasReligionData = religionData && (religionData.total_population || 0) > 0;
  const hasHouseholdData = householdHeadData && (householdHeadData.total_population || 0) > 0;
  
  const hasAgeData = populationData && (
    (populationData.age_0_14 || 0) > 0 ||
    (populationData.age_15_59 || 0) > 0 ||
    (populationData.age_60_64 || 0) > 0 ||
    (populationData.age_65_above || 0) > 0
  );

  const availableCharts = ['pie', 'bar'];
  if (hasEconomyData) availableCharts.push('economy');
  if (hasAgeData) availableCharts.push('age');
  if (hasOwnershipData) availableCharts.push('ownership');
  if (hasWallData) availableCharts.push('wall');
  if (hasUnitData) availableCharts.push('unit');
  if (hasToiletData) availableCharts.push('toilet');
  if (hasWaterData) availableCharts.push('water');
  if (hasWasteData) availableCharts.push('waste');
  if (hasRoomsData) availableCharts.push('rooms');
  if (hasRoofData) availableCharts.push('roof');
  if (hasReligionData) availableCharts.push('religion');
  if (hasHouseholdData) availableCharts.push('household');

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const idx = availableCharts.indexOf(activeMobileChart);
      if (idx !== -1 && idx < availableCharts.length - 1) {
        setActiveMobileChart(availableCharts[idx + 1] as any);
      }
    },
    onSwipedRight: () => {
      const idx = availableCharts.indexOf(activeMobileChart);
      if (idx > 0) {
        setActiveMobileChart(availableCharts[idx - 1] as any);
      }
    },
    trackMouse: true
  });

  const gnEconomyChartUI = hasEconomyData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Economy
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: [
              { id: 0, value: Number(gnEconomyData?.employed || 0), label: 'Employed', color: '#2ecc71' },
              { id: 1, value: Number(gnEconomyData?.unemployed || 0), label: 'Unemployed', color: '#e74c3c' },
              { id: 2, value: Number(gnEconomyData?.economically_not_active || 0), label: 'Not Active', color: '#f1c40f' },
            ],
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '43%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Economy
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(gnEconomyData?.total || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2, px: isMobileView ? 0 : 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>Employed</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
            <span style={{ color: '#2ecc71', fontSize: '1rem' }}>●</span>
            <Typography variant="body1" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(gnEconomyData?.employed || 0).toLocaleString()}</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>Unemployed</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
            <span style={{ color: '#e74c3c', fontSize: '1rem' }}>●</span>
            <Typography variant="body1" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(gnEconomyData?.unemployed || 0).toLocaleString()}</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>Not Active</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
            <span style={{ color: '#f1c40f', fontSize: '1rem' }}>●</span>
            <Typography variant="body1" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(gnEconomyData?.economically_not_active || 0).toLocaleString()}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
    </>
  ) : null;


  
  const wallPalette = [
    { label: 'Brick', color: '#e74c3c', value: housingWallData?.brick || 0 },
    { label: 'Cement/Stone', color: '#3498db', value: housingWallData?.cement_block_stone || 0 },
    { label: 'Cabook', color: '#f1c40f', value: housingWallData?.cabook || 0 },
    { label: 'Soil Bricks', color: '#e67e22', value: housingWallData?.soil_bricks || 0 },
    { label: 'Mud', color: '#2ecc71', value: housingWallData?.mud || 0 },
    { label: 'Cadjan/Palmyrah', color: '#1abc9c', value: housingWallData?.cadjan_palmyrah || 0 },
    { label: 'Plank/Metal', color: '#9b59b6', value: housingWallData?.plank_metal_sheet || 0 },
    { label: 'Other', color: '#95a5a6', value: housingWallData?.other || 0 },
  ].filter(item => item.value > 0);

  const gnWallChartUI = hasWallData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Housing Wall Type
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: wallPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Units
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(housingWallData?.total_units || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {wallPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;


  
  const unitPalette = [
    { label: 'Permanent', color: '#2ecc71', value: housingUnitData?.permanent || 0 },
    { label: 'Semi-permanent', color: '#f39c12', value: housingUnitData?.semi_permanent || 0 },
    { label: 'Improvised', color: '#e74c3c', value: housingUnitData?.improvised || 0 },
    { label: 'Unclassified', color: '#95a5a6', value: housingUnitData?.unclassified || 0 },
  ].filter(item => item.value > 0);

  const gnUnitChartUI = hasUnitData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Housing Unit Type
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: unitPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Units
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(housingUnitData?.total_units || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {unitPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;


  
  const toiletPalette = [
    { label: 'Piped Sewer', color: '#3498db', value: toiletFacilityData?.water_seal_piped_sewer || 0 },
    { label: 'Septic Tank', color: '#9b59b6', value: toiletFacilityData?.water_seal_septic_tank || 0 },
    { label: 'Pour Flush', color: '#e67e22', value: toiletFacilityData?.pour_flush || 0 },
    { label: 'Direct Pit', color: '#f1c40f', value: toiletFacilityData?.direct_pit || 0 },
    { label: 'Not Using', color: '#c0392b', value: toiletFacilityData?.not_using || 0 },
    { label: 'Other', color: '#95a5a6', value: toiletFacilityData?.other || 0 },
  ].filter(item => item.value > 0);

  const gnToiletChartUI = hasToiletData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Toilet Facilities
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: toiletPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Households
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(toiletFacilityData?.total_households || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {toiletPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;


  
  const waterPalette = [
    { label: 'Well (Within)', color: '#1abc9c', value: drinkingWaterData?.protected_well_within || 0 },
    { label: 'Well (Outside)', color: '#16a085', value: drinkingWaterData?.protected_well_outside || 0 },
    { label: 'Unprotected Well', color: '#f39c12', value: drinkingWaterData?.unprotected_well || 0 },
    { label: 'Tap (Within Unit)', color: '#3498db', value: drinkingWaterData?.tap_within_unit || 0 },
    { label: 'Tap (Within Premises)', color: '#2980b9', value: drinkingWaterData?.tap_within_premises_outside || 0 },
    { label: 'Tap (Outside)', color: '#8e44ad', value: drinkingWaterData?.tap_outside_premises || 0 },
    { label: 'Rural Projects', color: '#27ae60', value: drinkingWaterData?.rural_water_projects || 0 },
    { label: 'Tube Well', color: '#f1c40f', value: drinkingWaterData?.tube_well || 0 },
    { label: 'Bowser', color: '#e67e22', value: drinkingWaterData?.bowser || 0 },
    { label: 'River/Tank', color: '#34495e', value: drinkingWaterData?.river_tank_stream || 0 },
    { label: 'Other', color: '#95a5a6', value: drinkingWaterData?.other || 0 },
  ].filter(item => item.value > 0);

  const gnWaterChartUI = hasWaterData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Source of Drinking Water
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: waterPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Households
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(drinkingWaterData?.total_households || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {waterPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px', maxWidth: '120px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;


  
  const wastePalette = [
    { label: 'Local Auth.', color: '#9b59b6', value: solidWasteData?.collected_by_local_authorities || 0 },
    { label: 'Burn', color: '#e74c3c', value: solidWasteData?.occupants_burn || 0 },
    { label: 'Bury', color: '#d35400', value: solidWasteData?.occupants_bury || 0 },
    { label: 'Compost', color: '#27ae60', value: solidWasteData?.occupants_composting || 0 },
    { label: 'Environment', color: '#7f8c8d', value: solidWasteData?.dispose_into_environment || 0 },
    { label: 'Other', color: '#95a5a6', value: solidWasteData?.other || 0 },
  ].filter(item => item.value > 0);

  const gnWasteChartUI = hasWasteData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Solid Waste Disposal
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: wastePalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Households
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(solidWasteData?.total_households || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {wastePalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px', maxWidth: '120px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;

  const roomsPalette = [
    { label: '1 Room', color: '#1abc9c', value: roomsData?.room_1 || 0 },
    { label: '2 Rooms', color: '#16a085', value: roomsData?.rooms_2 || 0 },
    { label: '3 Rooms', color: '#2ecc71', value: roomsData?.rooms_3 || 0 },
    { label: '4 Rooms', color: '#27ae60', value: roomsData?.rooms_4 || 0 },
    { label: '5 Rooms', color: '#3498db', value: roomsData?.rooms_5 || 0 },
    { label: '6 Rooms', color: '#2980b9', value: roomsData?.rooms_6 || 0 },
    { label: '7 Rooms', color: '#9b59b6', value: roomsData?.rooms_7 || 0 },
    { label: '8 Rooms', color: '#8e44ad', value: roomsData?.rooms_8 || 0 },
    { label: '9 Rooms', color: '#f1c40f', value: roomsData?.rooms_9 || 0 },
    { label: '10+ Rooms', color: '#e67e22', value: roomsData?.rooms_10_and_above || 0 },
  ].filter(item => item.value > 0);

  const gnRoomsChartUI = hasRoomsData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Rooms in Housing Unit
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: roomsPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Units
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(roomsData?.total_housing_units || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {roomsPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px', maxWidth: '120px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;

  const roofPalette = [
    { label: 'Tile', color: '#d35400', value: roofData?.tile || 0 },
    { label: 'Asbestos', color: '#7f8c8d', value: roofData?.asbestos || 0 },
    { label: 'Concrete', color: '#95a5a6', value: roofData?.concrete || 0 },
    { label: 'Zink Aluminium', color: '#3498db', value: roofData?.zink_aluminium_sheet || 0 },
    { label: 'Metal Sheet', color: '#2980b9', value: roofData?.metal_sheet || 0 },
    { label: 'Cadjan/Straw', color: '#f1c40f', value: roofData?.cadjan_palmyrah_straw || 0 },
    { label: 'Other', color: '#e67e22', value: roofData?.other || 0 },
  ].filter(item => item.value > 0);

  const gnRoofChartUI = hasRoofData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Housing Unit Roof Type
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: roofPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Units
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(roofData?.total_housing_units || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {roofPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px', maxWidth: '120px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;

  const religionPalette = [
    { label: 'Buddhist', color: '#f1c40f', value: religionData?.buddhist || 0 },
    { label: 'Hindu', color: '#e67e22', value: religionData?.hindu || 0 },
    { label: 'Islam', color: '#2ecc71', value: religionData?.islam || 0 },
    { label: 'Roman Catholic', color: '#9b59b6', value: religionData?.roman_catholic || 0 },
    { label: 'Other Christian', color: '#3498db', value: religionData?.other_christian || 0 },
    { label: 'Other', color: '#95a5a6', value: religionData?.other || 0 },
  ].filter(item => item.value > 0);

  const gnReligionChartUI = hasReligionData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Religious Affiliation
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}>
      <PieChart
        series={[
          {
            data: religionPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
            innerRadius: 80,
            outerRadius: 130,
            paddingAngle: 2,
            cornerRadius: 4,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlight: 'item' },
            faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
          },
        ]}
        height={320}
        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        slotProps={{
          legend: { hidden: true }
        }}
      />
      {/* Center Text */}
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
          Total<br/>Population
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
          {(religionData?.total_population || 0).toLocaleString()}
        </Typography>
      </Box>

      {/* Custom Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
        {religionPalette.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center', minWidth: '80px', maxWidth: '120px' }}>
            <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
              <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  ) : null;

  const householdPalette = [
    { label: 'Head',               color: '#2c3e50', value: householdHeadData?.head || 0 },
    { label: 'Wife/Husband',       color: '#e74c3c', value: householdHeadData?.wife_husband || 0 },
    { label: 'Son/Daughter',       color: '#3498db', value: householdHeadData?.son_daughter || 0 },
    { label: 'Son/Daughter-in-law',color: '#9b59b6', value: householdHeadData?.son_daughter_in_law || 0 },
    { label: 'Grandchild',         color: '#1abc9c', value: householdHeadData?.grandchild_great_grandchild || 0 },
    { label: 'Parent of Head',     color: '#f39c12', value: householdHeadData?.parent_of_head_or_spouse || 0 },
    { label: 'Other Relative',     color: '#27ae60', value: householdHeadData?.other_relative || 0 },
    { label: 'Domestic Employee',  color: '#e67e22', value: householdHeadData?.domestic_employee || 0 },
    { label: 'Boarder',            color: '#8e44ad', value: householdHeadData?.boarder || 0 },
    { label: 'Non Relative',       color: '#2980b9', value: householdHeadData?.non_relative || 0 },
    { label: 'Clergy',             color: '#c0392b', value: householdHeadData?.clergy || 0 },
    { label: 'Not Stated',         color: '#95a5a6', value: householdHeadData?.not_stated || 0 },
  ].filter(item => item.value > 0);

  const gnHouseholdChartUI = hasHouseholdData ? (
    <>
      {!isMobileView && (
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, mb: 2, color: themeColors.textDark }}>
            Relationship to Household Head
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: 'text.secondary' }}>
            {displayGN || displayCity || displayDistrict || "Selected Location"}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        bgcolor: isMobileView ? 'transparent' : (themeColors.cardBg || '#ffffff'), 
        borderRadius: '24px', 
        p: isMobileView ? 0 : 4, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: isMobileView ? 'none' : '1px solid rgba(0,0,0,0.1)',
        boxShadow: isMobileView ? 'none' : '0 10px 40px rgba(0,0,0,0.05)',
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        mx: 'auto'
      }}>
        <PieChart
          series={[
            {
              data: householdPalette.map((item, idx) => ({ id: idx, value: Number(item.value), label: item.label, color: item.color })),
              innerRadius: 80,
              outerRadius: 130,
              paddingAngle: 2,
              cornerRadius: 4,
              cx: '50%',
              cy: '50%',
              highlightScope: { faded: 'global', highlight: 'item' },
              faded: { innerRadius: 75, additionalRadius: -20, color: 'gray' },
            },
          ]}
          height={320}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          slotProps={{ legend: { hidden: true } }}
        />
        {/* Center Text */}
        <Box sx={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', lineHeight: 1 }}>
            Total<br/>Population
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: isMobileView ? '#ffffff' : themeColors.textDark, mt: 0.5 }}>
            {(householdHeadData?.total_population || 0).toLocaleString()}
          </Typography>
        </Box>
        {/* Custom Legend */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%', mt: 2, px: isMobileView ? 0 : 2, gap: 2 }}>
          {householdPalette.map((item, index) => (
            <Box key={index} sx={{ textAlign: 'center', minWidth: '80px', maxWidth: '130px' }}>
              <Typography variant="caption" sx={{ color: isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark, fontWeight: 'bold', display: 'block' }}>{item.label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                <span style={{ color: item.color, fontSize: '1rem' }}>●</span>
                <Typography variant="body2" sx={{ color: isMobileView ? '#ffffff' : themeColors.textDark, fontWeight: 800 }}>{(item.value).toLocaleString()}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  ) : null;

  return (
    <Box sx={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation Bar */}
      <Box sx={{ position: 'absolute', top: { xs: '30px', sm: 0 }, left: 0, right: 0, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1.5, sm: 3 },
          pointerEvents: 'auto',
          bgcolor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5 },
          borderRadius: 30,
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '90vw'
        }}>

          <IconButton
            onClick={() => setIsDarkMode(!isDarkMode)}
            size="small"
            sx={{ color: '#ffffff', p: 0, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
          >
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
            <Typography
              onClick={() => navigate('/')}
              sx={{
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                color: '#ffffff',
                '&:hover': { opacity: 0.7 }
              }}
            >
              Home
            </Typography>
            <Typography sx={{ opacity: 0.4, fontWeight: 300, color: '#ffffff' }}>|</Typography>
            <Typography
              onClick={login}
              sx={{
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                color: '#ffffff',
                '&:hover': { opacity: 0.7 }
              }}
            >
              Login
            </Typography>
            <Typography sx={{ opacity: 0.4, fontWeight: 300, color: '#ffffff' }}>|</Typography>
            <Typography
              onClick={register}
              sx={{
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                color: '#ffffff',
                '&:hover': { opacity: 0.7 }
              }}
            >
              Signup
            </Typography>
            <Typography sx={{ opacity: 0.4, fontWeight: 300, color: '#ffffff' }}>|</Typography>
            <Typography
              onClick={cycleLanguage}
              sx={{
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'opacity 0.2s',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                color: themeColors.primary,
                '&:hover': { opacity: 0.7 }
              }}
            >
              {language}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Location Modal */}
      <Dialog
        open={showLocationModal}
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 2, minWidth: { xs: '90%', sm: 400 }, position: 'relative' } }}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(10px)', bgcolor: 'rgba(0,0,0,0.8)' } } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', position: 'relative' }}>
          {/* Language Changer inside Modal */}
          <Box
            onClick={cycleLanguage}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 16,
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.05)',
              transition: 'background-color 0.2s',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '0.85rem',
              color: themeColors.primary,
              textTransform: 'uppercase',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
            }}
          >
            {language}
          </Box>
          {!showManualForm
            ? (language === 'en' ? 'Your Location' : language === 'si' ? 'ඔබගේ ස්ථානය' : 'உங்கள் இடம்')
            : (language === 'en' ? 'Select Your Location' : language === 'si' ? 'ස්ථානය තෝරන්න' : 'உங்கள் இடத்தை தேர்வு செய்யவும்')
          }
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {!showManualForm ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {locating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <CircularProgress size={24} sx={{ color: themeColors.primary }} />
                  <Typography>Fetching GPS coordinates...</Typography>
                </Box>
              ) : locationError ? (
                <Alert severity="warning" sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}>
                  {locationError}
                </Alert>
              ) : location ? (
                <Box sx={{ p: 2, bgcolor: 'rgba(0, 168, 255, 0.1)', borderRadius: 2, position: 'relative' }}>
                  <Typography variant="body2" color="text.secondary">Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Typography>

                  {autoGnLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Identifying Location...</Typography>
                    </Box>
                  ) : autoGnData?.gnByCoordinates ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'en' ? 'District' : language === 'si' ? 'දිස්ත්‍රික්කය' : 'மாவட்டம்'}: {
                          language === 'en' ? autoGnData.gnByCoordinates.pDistrict?.admin2NameEn :
                            language === 'si' ? autoGnData.gnByCoordinates.pDistrict?.admin2NameSi :
                              autoGnData.gnByCoordinates.pDistrict?.admin2NameTa
                        }
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'en' ? 'City / DS Division' : language === 'si' ? 'නගරය / ප්‍රාදේශීය ලේකම් කොට්ඨාශය' : 'நகரம் / பிரதேச செயலகம்'}: {
                          language === 'en' ? autoGnData.gnByCoordinates.dsEn :
                            language === 'si' ? autoGnData.gnByCoordinates.dsSi :
                              autoGnData.gnByCoordinates.dsTa
                        }
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'en' ? 'GN Division' : language === 'si' ? 'ග්‍රාම නිලධාරී වසම' : 'கிராம உத்தியோகத்தர் பிரிவு'}: {
                          language === 'en' ? autoGnData.gnByCoordinates.nameEn :
                            language === 'si' ? autoGnData.gnByCoordinates.nameSi :
                              autoGnData.gnByCoordinates.nameTa
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>Location not found in database.</Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Location not available.</Typography>
              )}

              <Button
                variant="outlined"
                onClick={() => setShowManualForm(true)}
                sx={{ mt: 2, color: themeColors.primary, borderColor: themeColors.primary }}
              >
                Select Manually
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <FormControl fullWidth>
                <Autocomplete
                  options={districtsData?.pDistricts || []}
                  getOptionLabel={(option: any) => {
                    if (!option) return '';
                    const name = language === 'en' ? option.admin2NameEn : language === 'si' ? option.admin2NameSi : option.admin2NameTa;
                    return name || option.admin2NameEn || option.id || '';
                  }}
                  value={districtsData?.pDistricts?.find((d: any) => d.id === selectedDistrict) || null}
                  onChange={(event, newValue) => {
                    setSelectedDistrict(newValue ? newValue.id : '');
                    setSelectedCity('');
                    setSelectedGN('');
                  }}
                  loading={districtsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={language === 'en' ? 'District' : language === 'si' ? 'දිස්ත්‍රික්කය' : 'மாவட்டம்'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {districtsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>

              <FormControl fullWidth disabled={!selectedDistrict || gnLoading}>
                <Autocomplete
                  options={uniqueCities}
                  getOptionLabel={(option: any) => {
                    if (!option) return '';
                    const name = language === 'en' ? option.dsEn : language === 'si' ? option.dsSi : option.dsTa;
                    return name || option.dsEn || option.divisionalSecretariatCode || '';
                  }}
                  value={uniqueCities.find((c: any) => c.divisionalSecretariatCode === selectedCity) || null}
                  onChange={(event, newValue) => {
                    setSelectedCity(newValue ? newValue.divisionalSecretariatCode : '');
                    setSelectedGN('');
                  }}
                  loading={gnLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={language === 'en' ? 'City / DS Division' : language === 'si' ? 'නගරය / ප්‍රාදේශීය ලේකම් කොට්ඨාශය' : 'நகரம் / பிரதேச செயலகம்'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {gnLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>

              <FormControl fullWidth disabled={!selectedCity || gnLoading}>
                <Autocomplete
                  options={filteredGNs}
                  getOptionLabel={(option: any) => {
                    if (!option) return '';
                    const name = language === 'en' ? option.nameEn : language === 'si' ? option.nameSi : option.nameTa;
                    return name || option.nameEn || option.gnName || option.code || '';
                  }}
                  value={gnData?.pDistrict?.gramaNiladharis?.find((gn: any) => gn.id === selectedGN) || null}
                  onChange={(event, newValue) => {
                    setSelectedGN(newValue ? newValue.id : '');
                  }}
                  loading={gnLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={language === 'en' ? 'Grama Niladhari (GN)' : language === 'si' ? 'ග්‍රාම නිලධාරී (GN)' : 'கிராம உத்தியோகத்தர் (GN)'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {gnLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>

              <Divider sx={{ my: 1 }}>OR</Divider>

              <Button
                variant="outlined"
                onClick={() => setShowManualForm(false)}
                sx={{ color: themeColors.primary, borderColor: themeColors.primary, alignSelf: 'center' }}
                startIcon={<span style={{ fontSize: '1.2em' }}>📍</span>}
              >
                Use GPS Auto-Location
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setShowLocationModal(false)}
            disabled={!canContinue}
            sx={{
              bgcolor: themeColors.primary,
              color: 'white',
              px: 4,
              py: 1,
              borderRadius: 8,
              '&:hover': { bgcolor: '#0085CC' }
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: themeColors.darkCharcoal,
          color: themeColors.textLight,
          minHeight: '100vh', // Full screen
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/hero-image.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
            zIndex: 0,
          }}
        />


        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 0 } }}>
          <Grid container spacing={4} alignItems="center">
            {/* Words / Text on the right side (order 2 on desktop, order 1 on mobile) */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
              {!showLocationModal && (
                <Box
                  sx={{
                    animation: 'fadeSlideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                    '@keyframes fadeSlideUp': {
                      '0%': { opacity: 0, transform: 'translateY(40px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' },
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'center', md: 'flex-start' },
                    textAlign: { xs: 'center', md: 'left' },
                    bgcolor: { xs: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)', md: 'transparent' },
                    backdropFilter: { xs: 'blur(10px)', md: 'none' },
                    borderRadius: '24px',
                    p: { xs: 3, md: 0 },
                    border: { xs: '1px solid rgba(255, 255, 255, 0.1)', md: 'none' },
                    boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.3)', md: 'none' },
                    mt: { xs: 0, md: -2 }
                  }}
                >
                  {/* CCODE - Above District */}
                  {displayCCODE && (
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: { xs: '1.5rem', sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
                        mb: { xs: 2, md: 3 },
                        textAlign: { xs: 'center', md: 'left' },
                      }}
                    >
                      {displayCCODE}
                    </Typography>
                  )}

                  {/* District - Top Glass Pill */}
                  {displayDistrict && (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: { xs: 2, md: 3 },
                        py: { xs: 0.75, md: 1 },
                        mb: { xs: 1, md: 1.5 },
                        borderRadius: '50px',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{
                          color: '#ffffff',
                          letterSpacing: { xs: '1px', md: '2px' },
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.9rem' },
                          lineHeight: 1,
                          m: 0
                        }}
                      >
                        {displayDistrict}
                      </Typography>
                    </Box>
                  )}

                  {/* GN Division - Main Title (Biggest) */}
                  <Typography
                    variant="h1"
                    sx={{
                      color: '#ffffff',
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem' },
                      lineHeight: 1.1,
                      mb: 1
                    }}
                  >
                    {displayGN || (language === 'en' ? 'Your Location' : language === 'si' ? 'ඔබගේ ස්ථානය' : 'உங்கள் இடம்')}
                  </Typography>

                  {/* City / DS Division - Subtitle (Half size of GN Division) */}
                  {displayCity && (
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: { xs: '1.5rem', sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
                        mb: 1
                      }}
                    >
                      {displayCity}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>

            {/* Charts Section on the left side (order 1 on desktop, order 2 on mobile) */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              {!showLocationModal && (displayGN || displayCity || displayDistrict) && (
                <Box
                  {...swipeHandlers}
                  sx={{
                    animation: 'fadeIn 1.5s ease-out forwards',
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0 },
                      '100%': { opacity: 1 },
                    },
                    bgcolor: { xs: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)', md: 'transparent' },
                    backdropFilter: { xs: 'blur(10px)', md: 'none' },
                    borderRadius: '24px',
                    p: { xs: 3, md: 0 },
                    border: { xs: '1px solid rgba(255, 255, 255, 0.1)', md: 'none' },
                    boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.3)', md: 'none' }
                  }}
                >
                  {/* Mobile Toggle Buttons */}
                  {isMobileView && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1, flexWrap: 'wrap' }}>
                      <Button 
                        variant={activeMobileChart === 'pie' ? 'contained' : 'outlined'} 
                        onClick={() => setActiveMobileChart('pie')}
                        size="small"
                        sx={{ 
                          borderRadius: '20px',
                          color: activeMobileChart === 'pie' ? '#fff' : 'rgba(255,255,255,0.7)',
                          borderColor: 'rgba(255,255,255,0.3)',
                          bgcolor: activeMobileChart === 'pie' ? 'primary.main' : 'transparent',
                          '&:hover': { bgcolor: activeMobileChart === 'pie' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        Population
                      </Button>
                      <Button 
                        variant={activeMobileChart === 'bar' ? 'contained' : 'outlined'} 
                        onClick={() => setActiveMobileChart('bar')}
                        size="small"
                        sx={{ 
                          borderRadius: '20px',
                          color: activeMobileChart === 'bar' ? '#fff' : 'rgba(255,255,255,0.7)',
                          borderColor: 'rgba(255,255,255,0.3)',
                          bgcolor: activeMobileChart === 'bar' ? 'primary.main' : 'transparent',
                          '&:hover': { bgcolor: activeMobileChart === 'bar' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        Housing
                      </Button>
                      {hasEconomyData && (
                        <Button 
                          variant={activeMobileChart === 'economy' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('economy')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'economy' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'economy' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'economy' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Economy
                        </Button>
                      )}
                      {hasAgeData && (
                        <Button 
                          variant={activeMobileChart === 'age' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('age')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'age' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'age' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'age' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Age
                        </Button>
                      )}
                      {hasOwnershipData && (
                        <Button 
                          variant={activeMobileChart === 'ownership' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('ownership')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'ownership' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'ownership' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'ownership' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Ownership
                        </Button>
                      )}
                      {hasWallData && (
                        <Button 
                          variant={activeMobileChart === 'wall' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('wall')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'wall' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'wall' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'wall' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Wall Type
                        </Button>
                      )}
                      {hasUnitData && (
                        <Button 
                          variant={activeMobileChart === 'unit' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('unit')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'unit' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'unit' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'unit' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Unit Type
                        </Button>
                      )}
                      {hasToiletData && (
                        <Button 
                          variant={activeMobileChart === 'toilet' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('toilet')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'toilet' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'toilet' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'toilet' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Toilet
                        </Button>
                      )}
                      {hasWaterData && (
                        <Button 
                          variant={activeMobileChart === 'water' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('water')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'water' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'water' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'water' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Water
                        </Button>
                      )}
                      {hasWasteData && (
                        <Button 
                          variant={activeMobileChart === 'waste' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('waste')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'waste' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'waste' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'waste' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Waste
                        </Button>
                      )}
                      {hasRoomsData && (
                        <Button 
                          variant={activeMobileChart === 'rooms' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('rooms')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'rooms' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'rooms' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'rooms' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Rooms
                        </Button>
                      )}
                      {hasRoofData && (
                        <Button 
                          variant={activeMobileChart === 'roof' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('roof')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'roof' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'roof' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'roof' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Roof Type
                        </Button>
                      )}
                      {hasReligionData && (
                        <Button 
                          variant={activeMobileChart === 'religion' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('religion')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'religion' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'religion' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'religion' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Religion
                        </Button>
                      )}
                      {hasHouseholdData && (
                        <Button 
                          variant={activeMobileChart === 'household' ? 'contained' : 'outlined'} 
                          onClick={() => setActiveMobileChart('household')}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            color: activeMobileChart === 'household' ? '#fff' : 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            bgcolor: activeMobileChart === 'household' ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: activeMobileChart === 'household' ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Household
                        </Button>
                      )}
                    </Box>
                  )}

                  {(!isMobileView || activeMobileChart === 'pie') && (
                    <PopulationInfographic populationData={populationData} language={language} />
                  )}

                  {isMobileView && activeMobileChart === 'bar' && (
                    <Box sx={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Custom3DBarChart 
                        gn_id={selectedGN} 
                        city_code={selectedCity} 
                        district_id={selectedDistrict} 
                        location_name={displayGN || displayCity || displayDistrict}
                      />
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'economy' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnEconomyChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'age' && (
                    <Box sx={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AgeDemographicsChart 
                        data={populationData || undefined}
                        location_name={displayGN || displayCity || displayDistrict}
                      />
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'ownership' && (
                    <Box sx={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HousingOwnershipChart 
                        data={housingOwnershipData || undefined}
                        location_name={displayGN || displayCity || displayDistrict}
                      />
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'wall' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnWallChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'unit' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnUnitChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'toilet' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnToiletChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'water' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnWaterChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'waste' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnWasteChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'rooms' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnRoomsChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'roof' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnRoofChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'religion' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnReligionChartUI}
                    </Box>
                  )}

                  {isMobileView && activeMobileChart === 'household' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {gnHouseholdChartUI}
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Charts Section (Desktop Only) */}
      {!isMobileView && (selectedGN || selectedCity || selectedDistrict) && (
        <>
          <AgeDemographicsChart 
            data={populationData || undefined}
            location_name={displayGN || displayCity || displayDistrict}
          />

          {gnReligionChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnReligionChartUI}
            </Box>
          )}
          
          <Custom3DBarChart 
            gn_id={selectedGN} 
            city_code={selectedCity} 
            district_id={selectedDistrict} 
            location_name={displayGN || displayCity || displayDistrict}
          />
          
          {gnEconomyChartUI && (
            <Box sx={{ pb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnEconomyChartUI}
            </Box>
          )}

          <HousingOwnershipChart 
            data={housingOwnershipData || undefined}
            location_name={displayGN || displayCity || displayDistrict}
          />

          {gnWallChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnWallChartUI}
            </Box>
          )}

          {gnUnitChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnUnitChartUI}
            </Box>
          )}

          {gnToiletChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnToiletChartUI}
            </Box>
          )}

          {gnRoomsChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnRoomsChartUI}
            </Box>
          )}

          {gnWaterChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnWaterChartUI}
            </Box>
          )}

          {gnWasteChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnWasteChartUI}
            </Box>
          )}

          {gnRoofChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnRoofChartUI}
            </Box>
          )}

          {gnHouseholdChartUI && (
            <Box sx={{ pb: 6, pt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {gnHouseholdChartUI}
            </Box>
          )}
        </>
      )}


    </Box>
  );
};

export default UserDashboard;
