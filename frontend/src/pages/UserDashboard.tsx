// Forced reload for Vite (Fixed pie chart background and translations)
// Forced reload for Vite (Added title glassmorphism panels back)
import MyLocationIcon from '@mui/icons-material/MyLocation';
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Grid, FormControl, useTheme, useMediaQuery, CircularProgress, Alert, Dialog, DialogContent, DialogActions, Autocomplete, TextField, IconButton, Divider, Menu, MenuItem, Fab, Fade, useScrollTrigger } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_P_DISTRICTS, GET_DISTRICT_GN_OPTIONS, GET_GN_BY_COORDINATES, GET_GN_BY_CCODE } from '../graphql/queries';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PinDropRoundedIcon from '@mui/icons-material/PinDropRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import Tooltip from '@mui/material/Tooltip';
import { locationHeaderSx, locationContinueSx, locationBodySx, locationPaperSx } from '../components/locationModalStyles';
import { CATEGORIES } from './CategoryDetailPage';
import GnPageFooter from '../components/GnPageFooter';
import { VillageMap } from '../components/VillageMap';
// Loaded on demand: MapLibre is ~800 KB and only the desktop gnpage needs it.
const VillageMap3D = React.lazy(() => import('../components/VillageMap3D'));
import { useOverlayInsets } from '../components/useOverlayInsets';
import { glassSx, glassTileSx } from '../components/glass';
import { GnTopHeaderBar } from '../components/GnTopHeaderBar';
import { DemographicCards } from '../components/DemographicCards';
import VillageQuickStats from '../components/VillageQuickStats';
import MobileDashboard from '../components/mobile/MobileDashboard';
import ContributeBanner from '../components/contribute/ContributeBanner';
import { useContributeCopy } from '../components/contribute/copy';
import { saveVillage } from '../components/contribute/village';
import { cleanMojibake } from '../utils/mojibake';
import { filterLocationOptions } from '../utils/locationOptions';


const tChart = {
  en: {
    wallTitle: 'Housing Wall Type',
    brick: 'Brick', cement_stone: 'Cement/Stone', cabook: 'Cabook', soil_bricks: 'Soil Bricks', mud: 'Mud', cadjan_palmyrah: 'Cadjan/Palmyrah', plank_metal: 'Plank/Metal', other: 'Other',
    unitTitle: 'Housing Unit Type',
    permanent: 'Permanent', semi_permanent: 'Semi-permanent', improvised: 'Improvised', unclassified: 'Unclassified',
    toiletTitle: 'Toilet Facilities',
    piped_sewer: 'Piped Sewer', septic_tank: 'Septic Tank', pour_flush: 'Pour Flush', direct_pit: 'Direct Pit', not_using: 'Not Using',
    waterTitle: 'Source of Drinking Water',
    well_within: 'Well (Within)', well_outside: 'Well (Outside)', unprotected_well: 'Unprotected Well', tap_within_unit: 'Tap (Within Unit)', tap_within_premises: 'Tap (Within Premises)', tap_outside: 'Tap (Outside)', rural_projects: 'Rural Projects', tube_well: 'Tube Well', bowser: 'Bowser', river_tank: 'River/Tank',
    wasteTitle: 'Solid Waste Disposal',
    local_auth: 'Local Auth.', burn: 'Burn', bury: 'Bury', compost: 'Compost', environment: 'Environment',
    roomsTitle: 'Rooms in Housing Unit',
    room_1: '1 Room', room_2: '2 Rooms', room_3: '3 Rooms', room_4: '4 Rooms', room_5: '5 Rooms', room_6: '6 Rooms', room_7: '7 Rooms', room_8: '8 Rooms', room_9: '9 Rooms', room_10: '10+ Rooms',
    roofTitle: 'Housing Unit Roof Type',
    tile: 'Tile', asbestos: 'Asbestos', concrete: 'Concrete', zink_alu: 'Zink Aluminium', metal_sheet: 'Metal Sheet', cadjan_straw: 'Cadjan/Straw',
    tabHousehold: 'Relationship to the head of the household', total: 'Total', tabPopulation: 'Village population', tabHousing: 'Housing by year built', tabEconomy: 'Employment', tabAge: 'Population by age groups', tabOwnership: 'Housing by ownership', tabWallType: 'Housing by wall type', tabUnitType: 'Housing by permanency (type of dwelling unit)', tabToilet: 'Nature of toilet facilities', tabWater: 'Drinking water source', tabWaste: 'Solid waste disposal', tabRooms: 'Housing by number of rooms', tabRoofType: 'Roof of the housing unit', tabReligion: 'Religious composition in the village',
    economyTitle: 'Economy',
    employed: 'Employed', unemployed: 'Unemployed', not_active: 'Not Active',
    religionTitle: 'Religious Affiliation',
    buddhist: 'Buddhist', hindu: 'Hindu', islam: 'Islam', roman_catholic: 'Roman Catholic', other_christian: 'Other Christian',
    footerDesc: 'A modern data intelligence platform delivering regional demographic insights and advanced analytics for the nation.',
    footerInsights: 'Insights',
    footerPlatform: 'Platform',
    footerDemographics: 'Demographics',
    footerHousing: 'Housing & Infrastructure',
    footerEconomy: 'Economic Activity',
    footerAbout: 'About Project',
    footerMethodology: 'Methodology',
    footerPrivacy: 'Privacy Policy',
    footerRights: 'Ceylonica Data Platform. All rights reserved.',
    footerDesigned: 'Designed with precision and care'
  },
  si: {
    wallTitle: 'නිවාස බිත්ති වර්ගය',
    brick: 'ගඩොල්', cement_stone: 'සිමෙන්ති/ගල්', cabook: 'කබොක්', soil_bricks: 'මැටි ගඩොල්', mud: 'මැටි', cadjan_palmyrah: 'පොල් අතු/තල් අතු', plank_metal: 'ලෑලි/තහඩු', other: 'වෙනත්',
    unitTitle: 'නිවාස ඒකක වර්ගය',
    permanent: 'ස්ථිර', semi_permanent: 'අර්ධ ස්ථිර', improvised: 'තාවකාලික', unclassified: 'වර්ගීකරණය නොකළ',
    toiletTitle: 'වැසිකිළි පහසුකම්',
    piped_sewer: 'නළ මගින්', septic_tank: 'සෙප්ටික් ටැංකි', pour_flush: 'වත්කරන', direct_pit: 'වළ', not_using: 'නැත',
    waterTitle: 'පානීය ජල මූලාශ්‍රය',
    well_within: 'ළිඳ (ඇතුළත)', well_outside: 'ළිඳ (පිටත)', unprotected_well: 'අනාරක්ෂිත ළිඳ', tap_within_unit: 'කරාම (ඒකකය තුළ)', tap_within_premises: 'කරාම (පරිශ්‍රය තුළ)', tap_outside: 'කරාම (පිටත)', rural_projects: 'ග්‍රාමීය ව්‍යාපෘති', tube_well: 'නළ ළිඳ', bowser: 'බවුසර්', river_tank: 'ගඟ/වැව',
    wasteTitle: 'ඝන අපද්‍රව්‍ය බැහැර කිරීම',
    local_auth: 'පළාත් පාලන', burn: 'පිළිස්සීම', bury: 'වළදැමීම', compost: 'කොම්පෝස්ට්', environment: 'පරිසරය',
    roomsTitle: 'නිවාස ඒකකයේ කාමර',
    room_1: 'කාමර 1', room_2: 'කාමර 2', room_3: 'කාමර 3', room_4: 'කාමර 4', room_5: 'කාමර 5', room_6: 'කාමර 6', room_7: 'කාමර 7', room_8: 'කාමර 8', room_9: 'කාමර 9', room_10: 'කාමර 10+',
    roofTitle: 'නිවාස ඒකකයේ වහලය',
    tile: 'උළු', asbestos: 'ඇස්බැස්ටෝස්', concrete: 'කොන්ක්‍රීට්', zink_alu: 'සින්ක් ඇලුමිනියම්', metal_sheet: 'තහඩු', cadjan_straw: 'පොල් අතු/පිදුරු',
    tabHousehold: 'ගෘහ මූලිකයාට අනුව නෑදෑකම්', total: 'මුළු', tabPopulation: 'ගමේ ජනගහනය', tabHousing: 'සාදන ලද වර්ෂය අනුව නිවාස', tabEconomy: 'සේවා නියුක්තිය', tabAge: 'වයස් සීමාවන් අනුව ජනගහනය', tabOwnership: 'අයිතිය අනුව නිවාස', tabWallType: 'බිත්ති වර්ගය අනුව නිවාස', tabUnitType: 'ස්ථිරභාවය අනුව නිවාස', tabToilet: 'වැසිකිලි පහසුකම් ස්වභාවය', tabWater: 'පානීය ජල මූලාශ්රය', tabWaste: 'ඝන අපද්රව්ය බහැර කිරීම', tabRooms: 'කාමර ගණන අනුව නිවාස', tabRoofType: 'නිවාස ඒකකයේ වහල', tabReligion: 'ගමේ ආගමික අනුපාතය',
    economyTitle: 'ආර්ථිකය',
    employed: 'රැකියාවක නියුතු', unemployed: 'රැකියා විරහිත', not_active: 'ක්‍රියාකාරී නොවන',
    religionTitle: 'ආගමික අනුපාතය',
    buddhist: 'බෞද්ධ', hindu: 'හින්දු', islam: 'ඉස්ලාම්', roman_catholic: 'රෝමානු කතෝලික', other_christian: 'වෙනත් ක්‍රිස්තියානි',
    footerDesc: 'ජාතිය සඳහා කලාපීය ජනවිකාස තොරතුරු සහ උසස් විශ්ලේෂණ ලබා දෙන නවීන දත්ත බුද්ධි වේදිකාවක්.',
    footerInsights: 'තොරතුරු',
    footerPlatform: 'වේදිකාව',
    footerDemographics: 'ජනවිකාස',
    footerHousing: 'නිවාස හා යටිතල පහසුකම්',
    footerEconomy: 'ආර්ථික ක්‍රියාකාරකම්',
    footerAbout: 'ව්‍යාපෘතිය ගැන',
    footerMethodology: 'ක්‍රමවේදය',
    footerPrivacy: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
    footerRights: 'සෙලෝනිකා දත්ත වේදිකාව. සියලුම හිමිකම් ඇවිරිණි.',
    footerDesigned: 'නිරවද්‍යතාවයෙන් සහ සැලකිල්ලෙන් නිර්මාණය කර ඇත'
  },
  ta: {
    wallTitle: 'வீட்டின் சுவர் வகை',
    brick: 'செங்கல்', cement_stone: 'சிமெண்ட்/கல்', cabook: 'கபோக்', soil_bricks: 'மண் செங்கல்', mud: 'சேறு', cadjan_palmyrah: 'தென்னை/பனை ஓலை', plank_metal: 'பலகை/தகடு', other: 'மற்றவை',
    unitTitle: 'வீட்டு அலகு வகை',
    permanent: 'நிரந்தர', semi_permanent: 'அரை நிரந்தர', improvised: 'தற்காலிக', unclassified: 'வகைப்படுத்தப்படாத',
    toiletTitle: 'கழிப்பறை வசதிகள்',
    piped_sewer: 'குழாய் மூலம்', septic_tank: 'செப்டிக் டேங்க்', pour_flush: 'ஊற்றும்', direct_pit: 'குழி', not_using: 'இல்லை',
    waterTitle: 'குடிநீர் ஆதாரம்',
    well_within: 'கிணறு (உள்ளே)', well_outside: 'கிணறு (வெளியே)', unprotected_well: 'பாதுகாப்பற்ற கிணறு', tap_within_unit: 'குழாய் (அலகுக்குள்)', tap_within_premises: 'குழாய் (வளாகத்திற்குள்)', tap_outside: 'குழாய் (வெளியே)', rural_projects: 'கிராமிய திட்டங்கள்', tube_well: 'குழாய் கிணறு', bowser: 'பவுசர்', river_tank: 'ஆறு/குளம்',
    wasteTitle: 'திடக்கழிவு அகற்றல்',
    local_auth: 'உள்ளூராட்சி', burn: 'எரித்தல்', bury: 'புதைத்தல்', compost: 'உரம்', environment: 'சுற்றுச்சூழல்',
    roomsTitle: 'வீட்டு அலகில் அறைகள்',
    room_1: '1 அறை', room_2: '2 அறைகள்', room_3: '3 அறைகள்', room_4: '4 அறைகள்', room_5: '5 அறைகள்', room_6: '6 அறைகள்', room_7: '7 அறைகள்', room_8: '8 அறைகள்', room_9: '9 அறைகள்', room_10: '10+ அறைகள்',
    roofTitle: 'வீட்டு அலகின் கூரை வகை',
    tile: 'ஓடு', asbestos: 'அஸ்பெஸ்டாஸ்', concrete: 'கான்கிரீட்', zink_alu: 'துத்தநாக அலுமினியம்', metal_sheet: 'தகடு', cadjan_straw: 'தென்னை/வைக்கோல்',
    tabHousehold: 'குடியிருப்பு', total: 'மொத்த', tabPopulation: 'மக்கள்தொகை', tabHousing: 'வீடமைப்பு', tabEconomy: 'பொருளாதாரம்', tabAge: 'வயது', tabOwnership: 'உரிமை', tabWallType: 'சுவர் வகை', tabUnitType: 'அலகு வகை', tabToilet: 'கழிப்பறை', tabWater: 'நீர்', tabWaste: 'கழிவு', tabRooms: 'அறைகள்', tabRoofType: 'கூரை வகை', tabReligion: 'மதம்',
    economyTitle: 'பொருளாதாரம்',
    employed: 'வேலையில் உள்ளோர்', unemployed: 'வேலையற்றோர்', not_active: 'செயல்படாதோர்',
    religionTitle: 'மதரீதியான இணைப்பு',
    buddhist: 'பௌத்தர்', hindu: 'இந்து', islam: 'இஸ்லாம்', roman_catholic: 'ரோமன் கத்தோலிக்கர்', other_christian: 'பிற கிறிஸ்தவர்',
    footerDesc: 'நாட்டிற்கான பிராந்திய மக்கள்தொகை நுண்ணறிவு மற்றும் மேம்பட்ட பகுப்பாய்வுகளை வழங்கும் நவீன தரவு தளம்.',
    footerInsights: 'நுண்ணறிவு',
    footerPlatform: 'தளம்',
    footerDemographics: 'மக்கள்தொகை',
    footerHousing: 'வீடமைப்பு மற்றும் உள்கட்டமைப்பு',
    footerEconomy: 'பொருளாதார செயல்பாடு',
    footerAbout: 'திட்டம் பற்றி',
    footerMethodology: 'முறைமை',
    footerPrivacy: 'தனியுரிமை கொள்கை',
    footerRights: 'சிலோனிகா தரவு தளம். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    footerDesigned: 'துல்லியத்துடனும் கவனத்துடனும் வடிவமைக்கப்பட்டுள்ளது'
  }
};

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
  // Phone / small-tablet layout. Desktop (md and up) keeps the original web view untouched.
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { login, register, userInfo, isAuthenticated, logout, isLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const themeColors = getThemeColors(isDarkMode);

  const { gnName, ccode } = useParams<{ gnName: string, ccode: string }>();
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 400 });
  const handleScrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // GPS State
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Dropdown State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedGN, setSelectedGN] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [showLocationModal, setShowLocationModal] = useState<boolean>(!ccode);
  const t = tChart[language] || tChart.en;
  const [showManualForm, setShowManualForm] = useState(!ccode && !window.matchMedia('(max-width: 600px)').matches);

  const locationCopy = {
    en: { loading: 'Loading locations…', failed: 'Could not load locations. Please try again.', retry: 'Try again', noMatch: 'No matching locations. Search in English, Sinhala or Tamil.', noDivisions: 'No DS divisions found for this district.', selectDistrict: 'Select a district first.', selectCity: 'Select a DS division first.' },
    si: { loading: 'ස්ථාන පූරණය වෙමින්…', failed: 'ස්ථාන පූරණය කළ නොහැකි විය. නැවත උත්සාහ කරන්න.', retry: 'නැවත උත්සාහ කරන්න', noMatch: 'ගැළපෙන ස්ථාන නැත. සිංහල, දෙමළ හෝ ඉංග්‍රීසියෙන් සොයන්න.', noDivisions: 'මෙම දිස්ත්‍රික්කයට ප්‍රාදේශීය ලේකම් කොට්ඨාශ හමු නොවීය.', selectDistrict: 'පළමුව දිස්ත්‍රික්කයක් තෝරන්න.', selectCity: 'පළමුව ප්‍රාදේශීය ලේකම් කොට්ඨාශයක් තෝරන්න.' },
    ta: { loading: 'இடங்கள் ஏற்றப்படுகின்றன…', failed: 'இடங்களை ஏற்ற முடியவில்லை. மீண்டும் முயலவும்.', retry: 'மீண்டும் முயலவும்', noMatch: 'பொருந்தும் இடங்கள் இல்லை. தமிழ், சிங்களம் அல்லது ஆங்கிலத்தில் தேடவும்.', noDivisions: 'இந்த மாவட்டத்தில் பிரதேச செயலகப் பிரிவுகள் கிடைக்கவில்லை.', selectDistrict: 'முதலில் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.', selectCity: 'முதலில் பிரதேச செயலகப் பிரிவைத் தேர்ந்தெடுக்கவும்.' },
  }[language];

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('si');
    else if (language === 'si') setLanguage('ta');
    else setLanguage('en');
  };

  useEffect(() => {
    if (!ccode) {
      setShowLocationModal(true);
      setShowManualForm(!window.matchMedia('(max-width: 600px)').matches);
      // Reset search fields so the user can do a fresh search
      setSelectedDistrict('');
      setSelectedCity('');
      setSelectedGN('');
      setLocation(null);
      setLocationError(null);
    } else if (gnName && ccode) {
      // Save last visited GN URL so admin sidebar "Home" can navigate back to it
      localStorage.setItem('last_gn_url', `/gnpage/${encodeURIComponent(gnName)}/${encodeURIComponent(ccode)}`);
    }
  }, [ccode, gnName]);

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchor);
  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => { setMobileMenuAnchor(event.currentTarget); };
  const handleMobileMenuClose = () => { setMobileMenuAnchor(null); };

  const [catMenuAnchor, setCatMenuAnchor] = useState<null | HTMLElement>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Search Logic Queries (Always active so dropdowns are always populated)
  const { data: districtsData, loading: districtsLoading, error: districtsError, refetch: retryDistricts } = useQuery(GET_P_DISTRICTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });


  const { data: gnData, loading: gnLoading, error: gnError, refetch: retryGnOptions } = useQuery(GET_DISTRICT_GN_OPTIONS, {
    variables: { id: selectedDistrict },
    notifyOnNetworkStatusChange: true,
    skip: !selectedDistrict,
    fetchPolicy: 'cache-first',
  });


  const uniqueCities = React.useMemo(() => {
    if (!selectedDistrict || String(gnData?.pDistrict?.id) !== String(selectedDistrict)) return [];
    if (!gnData?.pDistrict?.gramaNiladharis) return [];
    const citiesMap = new Map();
    gnData.pDistrict.gramaNiladharis.forEach((gn: any) => {
      const code = gn.divisionalSecretariatCode || gn.dsEn;
      if (code && !citiesMap.has(code)) {
        citiesMap.set(code, {
          divisionalSecretariatCode: code,
          dsEn: gn.dsEn || gn.divisionalSecretariatCode,
          dsSi: gn.dsSi,
          dsTa: gn.dsTa,
        });
      }
    });
    return Array.from(citiesMap.values());
  }, [gnData, selectedDistrict]);

  const filteredGNs = React.useMemo(() => {
    if (!selectedDistrict || String(gnData?.pDistrict?.id) !== String(selectedDistrict)) return [];
    if (!gnData?.pDistrict?.gramaNiladharis) return [];
    if (!selectedCity) return gnData.pDistrict.gramaNiladharis;
    return gnData.pDistrict.gramaNiladharis.filter(
      (gn: any) => gn.divisionalSecretariatCode === selectedCity || gn.dsEn === selectedCity
    );
  }, [gnData, selectedCity, selectedDistrict]);

  const { data: autoGnData, loading: autoGnLoading } = useQuery(GET_GN_BY_COORDINATES, {
    variables: { lat: location?.lat, lng: location?.lng },
    skip: !location || !!ccode,
    fetchPolicy: 'network-only',
  });

  const { data: urlGnData, loading: urlGnLoading } = useQuery(GET_GN_BY_CCODE, {
    variables: { CCODE: ccode },
    skip: !ccode,
    // Census data and boundaries for a village don't change between visits; reuse the cache.
    fetchPolicy: 'cache-first',
  });

  const activeGn = urlGnData?.gnByCcode || autoGnData?.gnByCoordinates;
  const canContinue = !showManualForm
    ? !!activeGn
    : (selectedDistrict !== '' && selectedCity !== '' && selectedGN !== '');
  const { t: contributeCopy } = useContributeCopy();

  /** Contributing from a village page means contributing to *that* village. */
  const rememberActiveVillage = () => {
    if (!activeGn) return;
    const { boundary: _boundary, police: _police, ...village } = activeGn as any;
    saveVillage(village);
  };
  const startContributing = () => {
    rememberActiveVillage();
    navigate('/user');
  };
  const joinToContribute = () => {
    rememberActiveVillage();
    register(`${window.location.origin}/user`);
  };

  // Geolocation Effect
  useEffect(() => {
    if (!ccode && !showManualForm && !location && !locationError) {
      setLocating(true);
      if (navigator.geolocation) {
        let finished = false;
        const timer = window.setTimeout(() => {
          if (!finished) {
            finished = true;
            setLocationError('Location is taking too long. Check location permission or select manually.');
            setLocating(false);
          }
        }, 12000);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (finished) return;
            finished = true;
            window.clearTimeout(timer);
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocating(false);
          },
          (error) => {
            if (finished) return;
            finished = true;
            window.clearTimeout(timer);
            setLocationError(error.message || 'Unable to retrieve your location');
            setLocating(false);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
        return () => { finished = true; window.clearTimeout(timer); };
      } else {
        setLocationError('Geolocation is not supported by your browser');
        setLocating(false);
      }
    }
  }, [ccode, showManualForm, location, locationError]);

  // Sync active GN with District, DS, and Village dropdown selectors
  useEffect(() => {
    if (activeGn) {
      const activeDistName = (activeGn.pDistrict?.admin2NameEn || activeGn.disEn || '').trim();
      const distId = activeGn.pDistrict?.id ||
        districtsData?.pDistricts?.find((d: any) =>
          (d.admin2NameEn || '').trim() === activeDistName ||
          (d.nameEn || '').trim() === activeDistName ||
          d.id === activeGn.pDistrict?.id
        )?.id || '';
      if (distId) setSelectedDistrict(distId);
      if (activeGn.divisionalSecretariatCode || activeGn.dsEn) {
        setSelectedCity(activeGn.divisionalSecretariatCode || activeGn.dsEn);
      }
      if (activeGn.id || activeGn.CCODE) {
        setSelectedGN(String(activeGn.id || activeGn.CCODE));
      }
    }
  }, [activeGn, districtsData]);

  // Sync URL with loaded GN
  useEffect(() => {
    let loadedGn: any = null;
    if (activeGn) {
      loadedGn = activeGn;
    } else if (selectedGN && gnData?.pDistrict?.gramaNiladharis) {
      loadedGn = gnData.pDistrict.gramaNiladharis.find((x: any) => x.id === selectedGN || x.CCODE === selectedGN);
    }

    if (loadedGn && loadedGn.CCODE && loadedGn.nameEn) {
      const currentUrl = window.location.pathname;
      const targetUrl = `/gnpage/${encodeURIComponent(loadedGn.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(loadedGn.CCODE)}`;
      if (currentUrl !== targetUrl) {
        navigate(targetUrl, { replace: true });
      }
    }
  }, [activeGn, selectedGN, gnData, navigate]);

  // Ensure modals close when URL params are present
  useEffect(() => {
    if (ccode) {
      setShowLocationModal(false);
    }
  }, [ccode]);


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

  if (!showManualForm && activeGn) {
    const d = activeGn.pDistrict;
    displayDistrict = cleanMojibake(language === 'en' ? d?.admin2NameEn : language === 'si' ? d?.admin2NameSi : d?.admin2NameTa);
    const g = activeGn;
    displayCity = cleanMojibake(language === 'en' ? g?.dsEn : language === 'si' ? g?.dsSi : g?.dsTa);
    displayGN = cleanMojibake(language === 'en' ? g?.nameEn : language === 'si' ? g?.nameSi : g?.nameTa);
    displayCCODE = g?.CCODE || g?.code || ccode || '';
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
      displayDistrict = cleanMojibake(language === 'en' ? d.admin2NameEn : language === 'si' ? d.admin2NameSi : d.admin2NameTa);
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
        displayCity = cleanMojibake(language === 'en' ? c.dsEn : language === 'si' ? c.dsSi : c.dsTa);

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
        const g = gnData?.pDistrict?.gramaNiladharis?.find((x: any) => String(x.id) === String(selectedGN) || x.CCODE === selectedGN || x.ccode === selectedGN);
        if (g) {
          displayGN = language === 'en' ? g.nameEn : language === 'si' ? g.nameSi : g.nameTa;
          displayCCODE = g.CCODE || g.code || g.ccode || selectedGN || '';
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
  const hasPopulationData = populationData && (populationData.both || 0) > 0;
  const hasHousingData = hasOwnershipData || hasWallData || hasUnitData || hasRoomsData || hasRoofData;

  // Chart UI variables removed - hero-only mode

  // ── Desktop map-background layout ──────────────────────────────────────
  const isLg = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true });
  const sectionRef = useRef<HTMLElement>(null);
  const topStackRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  // Panels mount/unmount with the breakpoint and the mobile switch, so both re-key the measurement.
  const mapInsets = useOverlayInsets(sectionRef, { top: topStackRef, left: leftPanelRef, right: rightPanelRef, bottom: bottomPanelRef }, `${isMobile}-${isLg}`);

  // Desktop panels render at 80% via CSS zoom. The map is not zoomed (zoom breaks Leaflet's pointer maths),
  // so anything that must line up with the map's own controls is converted between the two scales.
  const UI_SCALE = 0.9;
  const LANE_PAD_LEFT = 64 / UI_SCALE;   // clears the map's zoom stack (unscaled px)
  const LANE_PAD_RIGHT = 72 / UI_SCALE;  // clears the map's toolbox
  // Width, in the panels' own (zoomed) CSS px, that the contribute card gets in the open lane.
  const laneCardWidth = Math.min(680, (mapInsets.width - mapInsets.left - mapInsets.right) / UI_SCALE - LANE_PAD_LEFT - LANE_PAD_RIGHT);

  const ink = isDarkMode ? '#f8fafc' : '#0f172a';
  const inkSoft = isDarkMode ? '#cbd5e1' : '#334155';
  const inkMuted = isDarkMode ? '#94a3b8' : '#64748b';
  const navPillSx = {
    textTransform: 'none', fontWeight: 600, fontSize: '0.86rem', borderRadius: '999px', px: 1.8, minHeight: 38,
    fontFamily: 'inherit', boxShadow: 'none', transition: 'background-color 0.2s ease, color 0.2s ease',
    '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)', boxShadow: 'none', transform: 'none' },
    '&:focus-visible': { outline: '2px solid #2d5e41', outlineOffset: 2 },
  } as const;
  const roundBtnSx = {
    width: 40, height: 40, minWidth: 40, borderRadius: '999px', color: inkSoft, fontFamily: 'inherit',
    bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.08)',
    '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.16)' : '#ffffff' },
    '&:focus-visible': { outline: '2px solid #2d5e41', outlineOffset: 2 },
  } as const;

  const openCategory = (slug: string) => {
    const tGn = (displayGN || activeGn?.nameEn || gnName || 'GN-Name').replace(/ /g, '-');
    const tCc = displayCCODE || activeGn?.CCODE || ccode || selectedGN || 'AREA-CODE';
    navigate(`/gnpage/${encodeURIComponent(tGn)}/${encodeURIComponent(tCc)}/${slug}`);
  };

  const copyAreaCode = () => {
    // Clipboard API is missing on insecure origins (plain http on a LAN IP); fail quietly rather than throw.
    navigator.clipboard?.writeText(displayCCODE).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }).catch(() => {});
  };

  const charts = (
    <DemographicCards
      populationData={populationData}
      gnEconomyData={gnEconomyData}
      housingOwnershipData={housingOwnershipData}
      housingWallData={housingWallData}
      housingUnitData={housingUnitData}
      toiletFacilityData={toiletFacilityData}
      drinkingWaterData={drinkingWaterData}
      solidWasteData={solidWasteData}
      roomsData={roomsData}
      roofData={roofData}
      religionData={religionData}
      householdHeadData={householdHeadData}
      isDarkMode={isDarkMode}
      layout="narrow"
      showQuickStats={false}
      onOpenCategory={openCategory}
    />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* Location Modal */}
      <Dialog
        open={showLocationModal}
        scroll="body"
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: '24px',
            minWidth: { xs: '90%', sm: 420 },
            position: 'relative',
            overflow: 'visible',
            background: isDarkMode
              ? 'linear-gradient(160deg, #1a1c2e 0%, #2a2c40 100%)'
              : 'linear-gradient(160deg, #ffffff 0%, #f0f4ff 100%)',
            ...locationPaperSx,
          }
        }}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(14px)', bgcolor: 'rgba(0,0,0,0.6)' } } }}
      >
        {/* Modal Hero Header */}
        <Box
          sx={locationHeaderSx(isDarkMode)}
        >
          {/* Language Toggle */}
          <Box
            onClick={cycleLanguage}
            sx={{
              position: 'absolute',
              top: 22,
              right: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 36,
              borderRadius: '8px',
              zIndex: 3,
              bgcolor: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.45)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#ffffff',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            {language}
          </Box>

          {/* Plain Transparent PNG Logos */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 3, mb: 1 }}>
            <img
              src="/logo.png"
              alt="Ceylonica Logo"
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{ color: '#ffffff', fontWeight: 700, fontFamily: "'Inter', sans-serif", textAlign: 'left', letterSpacing: '-0.01em', lineHeight: 1.25 }}
          >
            {!showManualForm
              ? (language === 'en' ? 'Your Location' : language === 'si' ? 'ඔබගේ ස්ථානය' : 'உங்கள் இடம்')
              : (language === 'en' ? 'Select Your Location' : language === 'si' ? 'ස්ථානය තෝරන්න' : 'உங்கள் இடத்தை தேர்வு செய்யவும்')
            }
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontFamily: "'Inter', sans-serif" }}>
            {language === 'en' ? 'Village Data Explorer · Sri Lanka' : language === 'si' ? 'ජනලේඛන දත්ත · ශ්‍රී ලංකා' : 'மக்கள்தொகை கணக்கெடுப்பு · இலங்கை'}
          </Typography>
        </Box>
        <DialogContent sx={locationBodySx}>
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

                  {autoGnLoading || urlGnLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Identifying Location...</Typography>
                    </Box>
                  ) : activeGn ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'en' ? 'District' : language === 'si' ? 'දිස්ත්‍රික්කය' : 'மாவட்டம்'}: {
                          language === 'en' ? activeGn.pDistrict?.admin2NameEn :
                            language === 'si' ? activeGn.pDistrict?.admin2NameSi :
                              activeGn.pDistrict?.admin2NameTa
                        }
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'en' ? 'City / DS Division' : language === 'si' ? 'නගරය / ප්‍රාදේශීය ලේකම් කොට්ඨාශය' : 'நகரம் / பிரதேச செயலகம்'}: {
                          language === 'en' ? activeGn.dsEn :
                            language === 'si' ? activeGn.dsSi :
                              activeGn.dsTa
                        }
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'en' ? 'GN Division' : language === 'si' ? 'ග්‍රාම නිලධාරී වසම' : 'கிராம உத்தியோகத்தர் பிரிவு'}: {
                          language === 'en' ? activeGn.nameEn :
                            language === 'si' ? activeGn.nameSi :
                              activeGn.nameTa
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
              {(districtsError || (selectedDistrict && gnError)) && (
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => {
                  if (districtsError) void retryDistricts().catch(() => undefined);
                  if (selectedDistrict && gnError) void retryGnOptions().catch(() => undefined);
                }}>{locationCopy.retry}</Button>}>
                  {locationCopy.failed}
                </Alert>
              )}
              {selectedDistrict && gnLoading && <Typography role="status">{locationCopy.loading}</Typography>}
              <FormControl fullWidth>
                <Autocomplete
                  options={districtsData?.pDistricts || []}
                  filterOptions={filterLocationOptions}
                  loadingText={locationCopy.loading}
                  noOptionsText={locationCopy.noMatch}
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
                  key={`ds-${selectedDistrict}`}
                  options={gnLoading ? [] : uniqueCities}
                  disabled={!selectedDistrict || gnLoading || !!gnError}
                  filterOptions={filterLocationOptions}
                  loadingText={locationCopy.loading}
                  noOptionsText={uniqueCities.length ? locationCopy.noMatch : locationCopy.noDivisions}
                  isOptionEqualToValue={(option, value) => option.divisionalSecretariatCode === value.divisionalSecretariatCode}
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
                      helperText={!selectedDistrict ? locationCopy.selectDistrict : undefined}
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
                  key={`gn-${selectedDistrict}-${selectedCity}`}
                  options={gnLoading ? [] : filteredGNs}
                  disabled={!selectedCity || gnLoading || !!gnError}
                  filterOptions={filterLocationOptions}
                  loadingText={locationCopy.loading}
                  noOptionsText={locationCopy.noMatch}
                  isOptionEqualToValue={(option, value) => String(option.id || option.CCODE) === String(value.id || value.CCODE)}
                  getOptionLabel={(option: any) => {
                    if (!option) return '';
                    const name = language === 'en' ? option.nameEn : language === 'si' ? option.nameSi : option.nameTa;
                    return name || option.nameEn || option.gnName || option.code || '';
                  }}
                  value={filteredGNs?.find((gn: any) => String(gn.id) === String(selectedGN) || gn.CCODE === selectedGN || gn.ccode === selectedGN) || null}
                  onChange={(event, newValue) => {
                    setSelectedGN(newValue ? (newValue.CCODE || newValue.ccode || newValue.id) : '');
                  }}
                  loading={gnLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={language === 'en' ? 'Grama Niladhari (GN)' : language === 'si' ? 'ග්‍රාම නිලධාරී (GN)' : 'கிராம உத்தியோகத்தர் (GN)'}
                      helperText={!selectedCity ? locationCopy.selectCity : undefined}
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

              <Divider sx={{ my: 1, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.15)' } }}>
                <Typography variant="caption" sx={{ color: themeColors.textMuted, fontWeight: 600, px: 1 }}>OR</Typography>
              </Divider>

              <Button
                variant="outlined"
                onClick={() => { setLocationError(null); setShowManualForm(false); }}
                sx={{
                  color: themeColors.primary,
                  borderColor: themeColors.primary,
                  alignSelf: 'center',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(0,168,255,0.08)', borderColor: themeColors.primary }
                }}
                startIcon={<MyLocationIcon fontSize="small" />}
              >
                Use GPS Auto-Location
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.1, sm: 2.8 }, pb: { xs: 2.1, sm: 2.8 }, pt: 1 }}>
          <Button
            variant="contained"
            onClick={() => {
              let loadedGn: any = null;
              if (!showManualForm && activeGn) {
                loadedGn = activeGn;
              } else if (showManualForm && selectedGN && gnData?.pDistrict?.gramaNiladharis) {
                loadedGn = gnData.pDistrict.gramaNiladharis.find((x: any) => String(x.id) === String(selectedGN) || x.CCODE === selectedGN);
              }
              setShowLocationModal(false);
              if (loadedGn && loadedGn.CCODE && loadedGn.nameEn) {
                navigate(`/gnpage/${encodeURIComponent(loadedGn.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(loadedGn.CCODE)}`);
              }
            }}
            disabled={!canContinue}
            sx={locationContinueSx(canContinue)}
          >
            {language === 'en' ? 'Continue' : language === 'si' ? 'ඉදිරියට' : 'தொடரவும்'}
          </Button>
        </DialogActions>
      </Dialog>

      {isMobile ? (
        <MobileDashboard
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onCycleLanguage={cycleLanguage}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          login={login}
          register={register}
          logout={logout}
          userInfo={userInfo}
          displayGN={displayGN}
          displayDistrict={displayDistrict}
          displayCity={displayCity}
          displayCCODE={displayCCODE}
          activeGn={activeGn}
          districts={districtsData?.pDistricts || []}
          selectedDistrict={selectedDistrict}
          onDistrictChange={(d) => { setSelectedDistrict(d); setSelectedCity(''); setSelectedGN(''); }}
          dsDivisions={uniqueCities}
          selectedCity={selectedCity}
          onCityChange={(c) => { setSelectedCity(c); setSelectedGN(''); }}
          gramaNiladharis={filteredGNs}
          selectedGN={selectedGN}
          onGNChange={(g) => {
            setSelectedGN(g);
            const chosen = gnData?.pDistrict?.gramaNiladharis?.find((x: any) => x.id === g || x.CCODE === g);
            if (chosen && chosen.CCODE && chosen.nameEn) navigate(`/gnpage/${encodeURIComponent(chosen.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(chosen.CCODE)}`);
          }}
          onOpenCategory={(slug) => {
            const tGn = (displayGN || activeGn?.nameEn || gnName || 'GN-Name').replace(/ /g, '-');
            const tCc = displayCCODE || activeGn?.CCODE || ccode || selectedGN || 'AREA-CODE';
            navigate(`/gnpage/${encodeURIComponent(tGn)}/${encodeURIComponent(tCc)}/${slug}`);
          }}
          populationData={populationData}
          gnEconomyData={gnEconomyData}
          housingOwnershipData={housingOwnershipData}
          housingWallData={housingWallData}
          housingUnitData={housingUnitData}
          toiletFacilityData={toiletFacilityData}
          drinkingWaterData={drinkingWaterData}
          solidWasteData={solidWasteData}
          roomsData={roomsData}
          roofData={roofData}
          religionData={religionData}
          householdHeadData={householdHeadData}
          contributeSlot={
            <ContributeBanner
              compact
              ccode={displayCCODE || activeGn?.CCODE}
              villageName={displayGN || activeGn?.nameEn || ''}
              isAuthenticated={isAuthenticated}
              isDarkMode={isDarkMode}
              onContribute={startContributing}
              onJoin={joinToContribute}
            />
          }
        />
      ) : (
      <>
      {/* ── MAIN DASHBOARD VIEW: live village map full-bleed, glass panels floating over it ── */}
      <Box
        component="main"
        ref={sectionRef}
        sx={{
          position: 'relative',
          height: '100dvh',
          minHeight: 640,
          overflow: 'hidden',
          bgcolor: isDarkMode ? '#0b1120' : '#e8eef4',
          color: themeColors.textLight,
          // Keep the OSM attribution (licence requirement) visible beside the right panel.
          '& .leaflet-bottom.leaflet-right': { right: `${mapInsets.right}px` },
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <React.Suspense fallback={null}>
            <VillageMap3D
              isDarkMode={isDarkMode}
              immersive
              insets={mapInsets}
              gnName={displayGN}
              district={displayDistrict}
              dsDivision={displayCity}
              ccode={displayCCODE}
              boundary={activeGn?.boundary}
              height="100%"
            />
          </React.Suspense>
        </Box>

        {/* Soft edge vignette so glass panels read cleanly over busy map tiles. */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: isDarkMode
              ? 'linear-gradient(90deg, rgba(11,17,32,0.55) 0%, rgba(11,17,32,0) 32%, rgba(11,17,32,0) 68%, rgba(11,17,32,0.55) 100%)'
              : 'linear-gradient(90deg, rgba(232,238,244,0.55) 0%, rgba(232,238,244,0) 32%, rgba(232,238,244,0) 68%, rgba(232,238,244,0.55) 100%)',
          }}
        />

        {/* Overlay: only the panels take pointer events, so the map stays draggable in the open lane. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: { md: 1.5, lg: 2 },
            p: { md: 2, lg: 2.5 },
            zoom: UI_SCALE,
            fontFamily: "'DM Sans', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
          }}
        >
          <Box ref={topStackRef} sx={{ display: 'flex', flexDirection: 'column', gap: { md: 1.5, lg: 2 }, '& > *': { pointerEvents: 'auto' } }}>
            {/* ── FLOATING GLASS NAVBAR ── */}
            <Box
              component="header"
              sx={{
                ...glassSx(isDarkMode),
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: { md: 2, lg: 2.5 },
                py: 1,
                animation: 'fadeInDown 0.4s ease both',
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={() => navigate(gnName && ccode ? `/gnpage/${gnName}/${ccode}` : '/gnpage')}
                aria-label="Ceylonica home"
                sx={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 1.1, cursor: 'pointer', flexShrink: 0, borderRadius: '10px', '&:focus-visible': { outline: '2px solid #2d5e41', outlineOffset: 3 } }}
              >
                <Box component="img" src="/logo.png" alt="" sx={{ height: 34, width: 34, objectFit: 'contain', bgcolor: '#fff', borderRadius: '50%' }} />
                <Typography sx={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '1.1rem', color: ink, letterSpacing: '-0.02em' }}>
                  Ceylonica
                </Typography>
              </Box>

              {/* Segmented nav: the current page is the dark pill. */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: '999px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' }}>
                <Button
                  onClick={() => navigate(gnName && ccode ? `/gnpage/${gnName}/${ccode}` : '/gnpage')}
                  disableRipple
                  aria-current="page"
                  sx={{ ...navPillSx, bgcolor: isDarkMode ? '#f8fafc' : '#0f172a', color: isDarkMode ? '#0f172a' : '#ffffff', '&:hover': { bgcolor: isDarkMode ? '#e2e8f0' : '#1e293b', boxShadow: 'none', transform: 'none' } }}
                >
                  Home
                </Button>
                <Button
                  onClick={(e) => setCatMenuAnchor(e.currentTarget as HTMLElement)}
                  disableRipple
                  aria-haspopup="menu"
                  aria-expanded={Boolean(catMenuAnchor)}
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1.1rem !important' }} />}
                  sx={{ ...navPillSx, color: inkSoft }}
                >
                  Categories
                </Button>
                <Menu anchorEl={catMenuAnchor} open={Boolean(catMenuAnchor)} onClose={() => setCatMenuAnchor(null)}
                  PaperProps={{ sx: { ...glassSx(isDarkMode), borderRadius: '16px', minWidth: 220, mt: 1 } }}>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat.slug} onClick={() => { setCatMenuAnchor(null); openCategory(cat.slug); }} sx={{ fontWeight: 500, fontSize: '0.88rem', color: ink, py: 0.9, px: 2 }}>{cat.name}</MenuItem>
                  ))}
                </Menu>
                <Button
                  onClick={() => navigate(gnName && ccode ? `/industry-survey/${gnName}/${ccode}` : '/industry-survey')}
                  disableRipple
                  sx={{ ...navPillSx, color: inkSoft }}
                >
                  Industry Survey
                </Button>
                {isAuthenticated && !userInfo?.realm_roles?.includes('super_admin') && (
                  <Button onClick={() => navigate('/user')} disableRipple sx={{ ...navPillSx, color: inkSoft }}>
                    Location form
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                <Button onClick={cycleLanguage} aria-label="Change language" disableRipple sx={{ ...roundBtnSx, width: 'auto', px: 1.4, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {language}
                </Button>
                <IconButton onClick={() => setIsDarkMode(!isDarkMode)} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} sx={roundBtnSx}>
                  {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => {
                        if (userInfo?.realm_roles?.includes('super_admin')) navigate('/admins');
                        else navigate('/mydashboard');
                      }}
                      disableRipple
                      sx={{ ...navPillSx, color: inkSoft }}
                    >
                      {userInfo?.realm_roles?.includes('super_admin') ? 'Dashboard' : contributeCopy.navContribute}
                    </Button>
                    <Button onClick={() => logout()} disableRipple sx={{ ...navPillSx, color: '#dc2626', '&:hover': { bgcolor: 'rgba(220,38,38,0.08)', boxShadow: 'none', transform: 'none' } }}>
                      Logout
                    </Button>
                  </>
                ) : !isLoading ? (
                  <>
                    <Button onClick={() => login(window.location.href)} disableRipple sx={{ ...navPillSx, color: inkSoft }}>
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={joinToContribute}
                      sx={{ ...navPillSx, bgcolor: '#2d5e41', color: '#fff', px: 2.2, '&:hover': { bgcolor: '#23503a', boxShadow: 'none', transform: 'none' } }}
                    >
                      {contributeCopy.bannerCtaGuest}
                    </Button>
                  </>
                ) : null}
              </Box>
            </Box>

            {/* ── LOCATION SELECTORS & CATEGORY RIBBON (glass) ── */}
            <Box sx={{ '& > .MuiBox-root': { mb: '0 !important' } }}>
              <GnTopHeaderBar
                districts={districtsData?.pDistricts || []}
                selectedDistrict={selectedDistrict}
                onDistrictChange={(d) => { setSelectedDistrict(d); setSelectedCity(''); setSelectedGN(''); }}
                dsDivisions={uniqueCities}
                selectedCity={selectedCity}
                onCityChange={(c) => { setSelectedCity(c); setSelectedGN(''); }}
                gramaNiladharis={filteredGNs}
                selectedGN={selectedGN}
                onGNChange={(g) => {
                  setSelectedGN(g);
                  const chosen = gnData?.pDistrict?.gramaNiladharis?.find((x: any) => x.id === g || x.CCODE === g);
                  if (chosen && chosen.CCODE && chosen.nameEn) navigate(`/gnpage/${encodeURIComponent(chosen.nameEn.replace(/ /g, '-'))}/${encodeURIComponent(chosen.CCODE)}`);
                }}
                onCycleLanguage={cycleLanguage}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                isAuthenticated={isAuthenticated}
                onLoginClick={() => (isAuthenticated ? navigate('/profile') : login())}
                onSelectCategory={openCategory}
              />
            </Box>
          </Box>

          {/* ── PANELS: identity left · open map lane · charts right (charts join the left column below lg) ── */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: { md: '310px minmax(0, 1fr)', lg: '330px minmax(0, 1fr) 370px' },
              gap: { md: 1.5, lg: 2 },
            }}
          >
            <Box
              ref={leftPanelRef}
              sx={{
                pointerEvents: 'auto',
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                scrollbarWidth: 'thin',
                animation: 'fadeInUp 0.5s ease 120ms both',
              }}
            >
              {/* Village identity card */}
              <Box key={displayGN || 'default'} sx={{ ...glassSx(isDarkMode), borderRadius: '18px', p: { md: 2.2, lg: 2.5 }, borderTop: '4px solid #28715b', display: 'flex', flexDirection: 'column', gap: 1.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                  {(displayDistrict || displayCity) && (
                    <Typography sx={{ fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500, color: inkMuted, letterSpacing: '0', lineHeight: 1.4 }}>
                      {[displayDistrict, displayCity].filter(Boolean).join('  ›  ')}
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="h1"
                  sx={{ fontFamily: 'inherit', fontWeight: 800, fontSize: { md: '1.9rem', lg: '2.2rem' }, color: ink, lineHeight: 1.1, letterSpacing: '-0.02em', wordBreak: 'break-word' }}
                >
                  {displayGN || 'GN Name'}
                </Typography>

                {displayCCODE && (
                  <Box sx={{ ...glassTileSx(isDarkMode), display: 'flex', alignItems: 'center', gap: 1.2, px: 1.4, py: 1, borderRadius: '14px' }}>
                    <Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '10px', bgcolor: '#2d5e41', color: '#fff', flexShrink: 0 }}>
                      <PinDropRoundedIcon sx={{ fontSize: '1.15rem' }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0', color: inkMuted, lineHeight: 1.3 }}>
                        {language === 'si' ? 'ග්‍රාම නිලධාරී වසම් කේතය' : language === 'ta' ? 'கிராம அலுவலர் பிரிவு குறியீடு' : 'GN Division Area Code'}
                      </Typography>
                      <Typography component="div" sx={{ fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace", fontWeight: 800, fontSize: '1.2rem', color: ink, letterSpacing: '0.12em', lineHeight: 1.2 }}>
                        {displayCCODE}
                      </Typography>
                    </Box>
                    <Tooltip title={copiedCode ? (language === 'si' ? 'පිටපත් විය!' : language === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (language === 'si' ? 'කේතය පිටපත් කරන්න' : language === 'ta' ? 'குறியீட்டை நகலெடு' : 'Copy area code')}>
                      <IconButton
                        onClick={copyAreaCode}
                        aria-label="Copy area code"
                        sx={{ width: 40, height: 40, borderRadius: '12px', color: copiedCode ? '#059669' : ink, bgcolor: copiedCode ? 'rgba(5,150,105,0.12)' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)'), transition: 'background-color 0.2s ease', '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.1)' } }}
                      >
                        {copiedCode ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <Button
                  onClick={() => setIsAboutModalOpen(true)}
                  startIcon={<InfoOutlinedIcon sx={{ fontSize: '1.05rem !important' }} />}
                  disableRipple
                  sx={{ ...navPillSx, alignSelf: 'flex-start', color: inkSoft, bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' }}
                >
                  {language === 'si' ? 'ගම පිළිබඳව' : language === 'ta' ? 'கிராமத்தைப் பற்றி' : 'About Village'}
                </Button>

                <VillageQuickStats
                  populationData={populationData}
                  gnEconomyData={gnEconomyData}
                  housingOwnershipData={housingOwnershipData}
                  roomsData={roomsData}
                  isDarkMode={isDarkMode}
                  variant="compact"
                  orientation="column"
                />
              </Box>

              {!isLg && <Box sx={{ minHeight: 420, display: 'flex' }}>{charts}</Box>}
            </Box>

            {/* Open map lane. The contribute card docks at its bottom so it is on screen at landing, at any size. */}
            {/* Side padding keeps the card clear of the map's own control stacks on both edges of the lane. */}
            <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pl: `${LANE_PAD_LEFT}px`, pr: `${LANE_PAD_RIGHT}px` }}>
              <Box ref={bottomPanelRef} sx={{ pointerEvents: 'auto', width: '100%', maxWidth: 680, animation: 'fadeInUp 0.5s ease 280ms both' }}>
                <ContributeBanner
                  glass
                  compact={laneCardWidth < 640}
                  ccode={displayCCODE || activeGn?.CCODE}
                  villageName={displayGN || activeGn?.nameEn || ''}
                  isAuthenticated={isAuthenticated}
                  isDarkMode={isDarkMode}
                  onContribute={startContributing}
                  onJoin={joinToContribute}
                />
              </Box>
            </Box>

            {isLg && (
              <Box ref={rightPanelRef} sx={{ pointerEvents: 'auto', minHeight: 0, display: 'flex', animation: 'fadeInUp 0.5s ease 200ms both' }}>
                {charts}
              </Box>
            )}
          </Box>
        </Box>

        <Dialog
          open={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { ...glassSx(isDarkMode), borderRadius: '22px', color: ink } }}
        >
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
              {language === 'si'
                ? 'ප්‍රජා තොරතුරු සම්පාදනය තුළින් ගම සංවර්ධනයේ පදනම සකස් වේ. ඒ සඳහා ලංකාවේ ඕනෑම පුද්ගලයෙකුට සාමාජිකත්වය, ප්‍රතිලාභ, නායකත්වය ලබාගත හැකි වේදිකාවකි. මෙය මුළුමනින්ම ගමේ සාමාජිකයින් එකතු වී ගම සංවිධානය කරගන්නා නව ප්‍රවේශයකි. දශක කිහිපයක පර්යේෂණයකින් ගොඩනැගුණු මහජන මෙවලමකි. ඔබ ඔබේ ගම ගොඩනගන්න, ගමේ වෙබ් අඩවිය නිර්මානය කරගනිමින් එකතු වෙන්න. Login වන්න. පද්ධතිය සඳහා ඔබේ ගමේ පළමු සාමාජිකයා, නියමුවා බවට පත්වන්න.'
                : language === 'ta'
                ? 'சமூக தகவல் தொகுப்பின் மூலம் கிராம வளர்ச்சியின் அடிப்படை அமைக்கப்படுகிறது. இது இலங்கையில் உள்ள எவரும் உறுப்புரிமை, நன்மைகள் மற்றும் தலைமையை பெறக்கூடிய ஒரு தளமாகும். இது கிராம உறுப்பினர்கள் ஒன்றிணைந்து கிராமத்தை ஒழுங்கமைக்கும் ஒரு புதிய அணுகுமுறையாகும். இது பல தசாப்த கால ஆராய்ச்சியின் மூலம் உருவாக்கப்பட்ட ஒரு பொது கருவியாகும். உங்கள் கிராமத்தை உருவாக்குங்கள், கிராம வலைத்தளத்தை உருவாக்குவதன் மூலம் இணையுங்கள். உள்நுழையவும். உங்கள் கிராமத்திற்கான அமைப்பின் முதல் உறுப்பினர் மற்றும் வழிகாட்டியாக மாறுங்கள்.'
                : 'Community information compilation lays the foundation for village development. It is a platform where any individual in Sri Lanka can obtain membership, benefits, and leadership. This is a completely new approach where village members come together to organize their own village. It is a public tool built on decades of research. Build your village, and join by creating your village website. Login now. Become the first member and the pioneer of your village system.'}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pb: 3, justifyContent: 'center' }}>
            <Button
              onClick={() => setIsAboutModalOpen(false)}
              variant="contained"
              disableElevation
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '999px', px: 3, bgcolor: '#2d5e41', '&:hover': { bgcolor: '#23503a' } }}
            >
              {language === 'si' ? 'වහන්න' : language === 'ta' ? 'மூடு' : 'Close'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <Box sx={{ zoom: 0.8 }}>
        <GnPageFooter isDarkMode={isDarkMode} />
      </Box>

      <Fade in={trigger}>
        <Box
          role="presentation"
          sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
        >
          <Fab onClick={handleScrollToTop} color="primary" size="medium" aria-label="scroll back to top">
            <KeyboardArrowUpIcon />
          </Fab>
        </Box>
      </Fade>
      </>
      )}
    </Box>
  );
};

export default UserDashboard;
