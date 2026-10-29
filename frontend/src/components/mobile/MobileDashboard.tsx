import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Menu, MenuItem, Divider, Tooltip,
  Dialog, DialogContent, DialogActions, Button, SwipeableDrawer, useScrollTrigger,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PlaceIcon from '@mui/icons-material/Place';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PinDropRoundedIcon from '@mui/icons-material/PinDropRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import GlobalSearchBar from '../GlobalSearchBar';
import GnPageFooter from '../GnPageFooter';
import DemographicCards from '../DemographicCards';
import { VillageQuickStats } from '../VillageQuickStats';
import { glassSx, glassTileSx } from '../glass';
import MobileLocationSheet from './MobileLocationSheet';
import MobileBottomNav from './MobileBottomNav';
import { MOBILE_CATEGORIES, catLabel } from './mobileCategories';

const VillageMap3D = React.lazy(() => import('../VillageMap3D'));

interface MobileDashboardProps {
  isDarkMode?: boolean;
  onToggleDarkMode: () => void;
  onCycleLanguage: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  login: (redirect?: string) => void;
  register: (redirect?: string) => void;
  logout: () => void;
  userInfo?: any;
  displayGN?: string;
  displayDistrict?: string;
  displayCity?: string;
  displayCCODE?: string;
  activeGn?: any;
  districts: any[];
  selectedDistrict: string;
  onDistrictChange: (d: string) => void;
  dsDivisions: any[];
  selectedCity: string;
  onCityChange: (c: string) => void;
  gramaNiladharis: any[];
  selectedGN: string;
  onGNChange: (g: string) => void;
  onOpenCategory: (slug: string) => void;
  populationData?: any;
  gnEconomyData?: any;
  housingOwnershipData?: any;
  housingWallData?: any;
  housingUnitData?: any;
  toiletFacilityData?: any;
  drinkingWaterData?: any;
  solidWasteData?: any;
  roomsData?: any;
  roofData?: any;
  religionData?: any;
  householdHeadData?: any;
  /** Rendered under the village card. */
  contributeSlot?: React.ReactNode;
}

// Overlay UI renders at 80% via CSS zoom (as on desktop); the map itself is not zoomed (zoom breaks its pointer maths).
const UI_SCALE = 0.8;
const TAP = 40;
// Share of the screen the map gets above the first card at landing; the village is framed inside it.
const MAP_SHARE = 0.46;
const APP_BAR_SPACE = 58;
const LOCATION_PILL_SPACE = 44;

const useViewportHeight = () => {
  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vh;
};

const ABOUT_TEXT = {
  si: 'ප්‍රජා තොරතුරු සම්පාදනය තුළින් ගම සංවර්ධනයේ පදනම සකස් වේ. ඒ සඳහා ලංකාවේ ඕනෑම පුද්ගලයෙකුට සාමාජිකත්වය, ප්‍රතිලාභ, නායකත්වය ලබාගත හැකි වේදිකාවකි. මෙය මුළුමනින්ම ගමේ සාමාජිකයින් එකතු වී ගම සංවිධානය කරගන්නා නව ප්‍රවේශයකි. දශක කිහිපයක පර්යේෂණයකින් ගොඩනැගුණු මහජන මෙවලමකි. ඔබ ඔබේ ගම ගොඩනගන්න, ගමේ වෙබ් අඩවිය නිර්මානය කරගනිමින් එකතු වෙන්න. Login වන්න. පද්ධතිය සඳහා ඔබේ ගමේ පළමු සාමාජිකයා, නියමුවා බවට පත්වන්න.',
  ta: 'சமூக தகவல் தொகுப்பின் மூலம் கிராம வளர்ச்சியின் அடிப்படை அமைக்கப்படுகிறது. இது இலங்கையில் உள்ள எவரும் உறுப்புரிமை, நன்மைகள் மற்றும் தலைமையை பெறக்கூடிய ஒரு தளமாகும். இது கிராம உறுப்பினர்கள் ஒன்றிணைந்து கிராமத்தை ஒழுங்கமைக்கும் ஒரு புதிய அணுகுமுறையாகும். இது பல தசாப்த கால ஆராய்ச்சியின் மூலம் உருவாக்கப்பட்ட ஒரு பொது கருவியாகும். உங்கள் கிராமத்தை உருவாக்குங்கள், கிராம வலைத்தளத்தை உருவாக்குவதன் மூலம் இணையுங்கள். உள்நுழையவும். உங்கள் கிராமத்திற்கான அமைப்பின் முதல் உறுப்பினர் மற்றும் வழிகாட்டியாக மாறுங்கள்.',
  en: 'Community information compilation lays the foundation for village development. It is a platform where any individual in Sri Lanka can obtain membership, benefits, and leadership. This is a completely new approach where village members come together to organize their own village. It is a public tool built on decades of research. Build your village, and join by creating your village website. Login now. Become the first member and the pioneer of your village system.',
};

const MobileDashboard: React.FC<MobileDashboardProps> = (props) => {
  const {
    isDarkMode = false, onToggleDarkMode, onCycleLanguage,
    isAuthenticated, isLoading, login, register, logout, userInfo,
    displayGN, displayDistrict, displayCity, displayCCODE, activeGn,
    districts, selectedDistrict, onDistrictChange,
    dsDivisions, selectedCity, onCityChange,
    gramaNiladharis, selectedGN, onGNChange,
    onOpenCategory, contributeSlot,
  } = props;

  const navigate = useNavigate();
  const { gnName, ccode } = useParams<{ gnName: string; ccode: string }>();
  const { language } = useLanguage();
  const L = (en: string, si: string, ta: string) => (language === 'si' ? si : language === 'ta' ? ta : en);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const vh = useViewportHeight();
  // Once the cards start sliding over the map, its floating controls get out of the way.
  const mapCovered = useScrollTrigger({ disableHysteresis: true, threshold: 24 });
  // Short screens (landscape phones) still get a usable map strip: at least ~300px when the screen allows.
  const mapWindow = Math.round(Math.max(vh * MAP_SHARE, Math.min(vh * 0.75, 300)));
  // Static insets: the village is framed in the window above the first card and is not re-framed while scrolling.
  // The bottom inset also covers the location pill at the foot of the map window.
  const insets = { top: APP_BAR_SPACE, right: 0, bottom: Math.max(vh - mapWindow + LOCATION_PILL_SPACE, 0), left: 0 };

  const ink = isDarkMode ? '#f8fafc' : '#0f172a';
  const inkSoft = isDarkMode ? '#cbd5e1' : '#334155';
  const inkMuted = isDarkMode ? '#94a3b8' : '#64748b';
  const font = "'Poppins', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif";
  const card = { ...glassSx(isDarkMode), borderRadius: '24px', p: 2 } as const;
  const focusRing = { '&:focus-visible': { outline: '2px solid #2d5e41', outlineOffset: 2 } } as const;
  const roundBtnSx = {
    width: TAP, height: TAP, minWidth: TAP, borderRadius: '999px', color: inkSoft, fontFamily: 'inherit',
    bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.08)',
    '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.16)' : '#ffffff' },
    ...focusRing,
  } as const;
  const pillSx = {
    textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', borderRadius: '999px', px: 1.8, minHeight: 38,
    fontFamily: 'inherit', color: inkSoft, bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
    '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)' },
    ...focusRing,
  } as const;

  const goHome = () => navigate(gnName && ccode ? `/gnpage/${gnName}/${ccode}` : '/gnpage');
  const goSurvey = () => navigate(gnName && ccode ? `/industry-survey/${gnName}/${ccode}` : '/industry-survey');
  const isSuperAdmin = userInfo?.realm_roles?.includes('super_admin');
  const closeMenuThen = (fn: () => void) => () => { setMenuAnchor(null); fn(); };

  const copyAreaCode = () => {
    // Clipboard API is missing on insecure origins (plain http on a LAN IP); fail quietly rather than throw.
    navigator.clipboard?.writeText(displayCCODE || '').then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }).catch(() => {});
  };

  const breadcrumb = [displayDistrict, displayCity].filter(Boolean).join('  ›  ');

  // `row`: icon beside label (categories sheet grid). Otherwise a narrow tile for the horizontal rail.
  const categoryTile = (cat: (typeof MOBILE_CATEGORIES)[number], row: boolean) => (
    <Box
      key={cat.slug}
      component="button"
      type="button"
      onClick={() => { setCategoriesOpen(false); onOpenCategory(cat.slug); }}
      sx={{
        all: 'unset', boxSizing: 'border-box', cursor: 'pointer', fontFamily: 'inherit',
        ...glassTileSx(isDarkMode), borderRadius: '16px',
        display: 'flex', flexDirection: row ? 'row' : 'column', alignItems: 'center', gap: row ? 1.2 : 0.8,
        p: row ? 1.3 : 1.2, ...(row ? { minHeight: TAP } : { flexShrink: 0, width: 84, scrollSnapAlign: 'start' }),
        transition: 'transform 0.15s ease', '&:active': { transform: 'scale(0.96)' },
        ...focusRing,
      }}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', color: ink, bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)', '& .MuiSvgIcon-root': { fontSize: '1.3rem' } }}>
        {cat.icon}
      </Box>
      <Typography sx={{ fontFamily: 'inherit', fontSize: row ? '0.8rem' : '0.68rem', fontWeight: 600, color: ink, textAlign: row ? 'left' : 'center', lineHeight: 1.2 }}>
        {catLabel(cat, language)}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '100dvh', bgcolor: isDarkMode ? '#0b1120' : '#e8eef4', overflowX: 'hidden', fontFamily: font, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>

      {/* ── LIVE 3D MAP, fixed behind everything ── */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <React.Suspense fallback={null}>
          <VillageMap3D
            immersive
            insets={insets}
            controlsScale={UI_SCALE}
            landingZoomIn={0.5}
            controlsHidden={mapCovered}
            height="100%"
            gnName={displayGN || ''}
            district={displayDistrict}
            dsDivision={displayCity}
            ccode={displayCCODE}
            boundary={activeGn?.boundary}
          />
        </React.Suspense>
      </Box>

      {/* ── FLOATING GLASS APP BAR ── */}
      <Box
        component="header"
        sx={{
          position: 'fixed', zIndex: 1100, left: 10, right: 10, top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          zoom: UI_SCALE,
          ...glassSx(isDarkMode), borderRadius: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pl: 1.5, pr: 0.75, py: 0.75,
          animation: 'fadeInDown 0.4s ease both',
        }}
      >
        <Box component="button" type="button" onClick={goHome} aria-label="Ceylonica home"
          sx={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', minWidth: 0, minHeight: TAP, borderRadius: '12px', ...focusRing }}>
          <Box component="img" src="/logo.png" alt="" sx={{ height: 32, width: 32, objectFit: 'contain' }} />
          <Typography sx={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '1.05rem', color: ink, letterSpacing: '-0.02em' }}>Ceylonica</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Button onClick={onCycleLanguage} aria-label="Change language" disableRipple
            sx={{ ...roundBtnSx, width: 'auto', px: 1.3, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {language}
          </Button>
          <IconButton onClick={onToggleDarkMode} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} sx={roundBtnSx}>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Menu" aria-haspopup="menu" aria-expanded={Boolean(menuAnchor)} sx={roundBtnSx}>
            <MenuRoundedIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { ...glassSx(isDarkMode), mt: 1, minWidth: 200, borderRadius: '16px', color: ink } }}
            MenuListProps={{ sx: { '& .MuiMenuItem-root': { fontFamily: font, fontSize: '0.88rem', fontWeight: 500, py: 1.1 } } }}
          >
            <MenuItem onClick={closeMenuThen(goHome)}>{L('Home', 'මුල් පිටුව', 'முகப்பு')}</MenuItem>
            <MenuItem onClick={closeMenuThen(() => setCategoriesOpen(true))}>{L('Categories', 'ප්‍රවර්ග', 'வகைகள்')}</MenuItem>
            <MenuItem onClick={closeMenuThen(goSurvey)}>{L('Industry Survey', 'දත්ත රැස් කිරීම', 'தரவு சேகரிப்பு')}</MenuItem>
            <Divider />
            {isAuthenticated ? (
              [
                <MenuItem key="dash" onClick={closeMenuThen(() => navigate(isSuperAdmin ? '/admins' : '/mydashboard'))}>{L('Dashboard', 'උපකරණ පුවරුව', 'கட்டுப்பாடு')}</MenuItem>,
                !isSuperAdmin && <MenuItem key="forms" onClick={closeMenuThen(() => navigate('/user'))}>{L('Location form', 'ස්ථාන පෝරමය', 'இடப் படிவம்')}</MenuItem>,
                <MenuItem key="logout" onClick={closeMenuThen(logout)} sx={{ color: '#dc2626' }}>{L('Logout', 'ඉවත් වන්න', 'வெளியேறு')}</MenuItem>,
              ]
            ) : !isLoading ? (
              [
                <MenuItem key="login" onClick={closeMenuThen(() => login(window.location.href))}>{L('Login', 'පිවිසෙන්න', 'உள்நுழைய')}</MenuItem>,
                <MenuItem key="join" onClick={closeMenuThen(() => register(window.location.href))} sx={{ color: isDarkMode ? '#86efac' : '#2d5e41', fontWeight: '700 !important' }}>{L('Join with us', 'අප හා එක්වන්න', 'எங்களுடன் இணையுங்கள்')}</MenuItem>,
              ]
            ) : null}
          </Menu>
        </Box>
      </Box>

      {/* ── CARDS OVER THE MAP ──
          The column is pointer-events:none so the open map window above the first card stays draggable and its
          controls tappable; each card opts back in. */}
      <Box sx={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
        <Box sx={{ height: mapWindow, position: 'relative' }}>
          {/* Centred by flex, not left:50%: zoom also scales offsets, which would push a positioned pill off-centre. */}
          <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 12, display: 'flex', justifyContent: 'center', px: 2 }}>
            <Box
              component="button"
              type="button"
              onClick={() => setLocationOpen(true)}
              aria-label={L('Change location', 'ස්ථානය වෙනස් කරන්න', 'இடத்தை மாற்று')}
              sx={{
                all: 'unset', boxSizing: 'border-box', pointerEvents: 'auto', cursor: 'pointer', fontFamily: 'inherit',
                zoom: UI_SCALE, py: 0.6, maxWidth: '100%',
                display: 'inline-flex', alignItems: 'center', gap: 1.2,
                ...glassSx(isDarkMode), borderRadius: '999px', pl: 0.9, pr: 1.6,
                transition: 'transform 0.15s ease', '&:active': { transform: 'scale(0.97)' },
                ...focusRing,
              }}
            >
              <Box sx={{ width: 28, height: 28, borderRadius: '999px', flexShrink: 0, display: 'grid', placeItems: 'center', color: '#fff', bgcolor: '#2d5e41' }}>
                <PlaceIcon sx={{ fontSize: '1rem' }} />
              </Box>
              <Typography sx={{ fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {breadcrumb || L('Choose a village', 'ගමක් තෝරන්න', 'கிராமத்தைத் தேர்வுசெய்க')}
              </Typography>
              <KeyboardArrowRightIcon sx={{ color: inkMuted, fontSize: '1.1rem', flexShrink: 0 }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          zoom: UI_SCALE,
          px: 2, maxWidth: 680, mx: 'auto',
          display: 'flex', flexDirection: 'column', gap: 1.5,
          // Clears the floating bottom nav (~74px on screen) plus the home-indicator area.
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 112px)',
          '& > *': { pointerEvents: 'auto' },
        }}>
          {/* Village identity: no card background on mobile, so its text is white over the map. The location pill above shows district › division */}
          <Box key={displayGN || 'default'} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, animation: 'fadeInUp 0.5s ease 120ms both' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="h1" sx={{ fontFamily: 'inherit', fontWeight: 800, fontSize: 'clamp(1.6rem, 7.5vw, 2.1rem)', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.45)', lineHeight: 1.1, letterSpacing: '-0.02em', wordBreak: 'break-word', minWidth: 0, pt: 0.5 }}>
                {displayGN || L('Select a Village', 'ගමක් තෝරන්න', 'கிராமத்தைத் தேர்வுசெய்க')}
              </Typography>
              <IconButton onClick={() => setAboutOpen(true)} aria-label={L('About Village', 'ගම පිළිබඳව', 'கிராமத்தைப் பற்றி')} sx={{ ...roundBtnSx, flexShrink: 0 }}>
                <InfoOutlinedIcon />
              </IconButton>
            </Box>

            {displayCCODE && (
              <Box sx={{ ...glassTileSx(true), display: 'flex', alignItems: 'center', gap: 1.2, px: 1.3, py: 0.9, borderRadius: '14px' }}>
                <Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '10px', bgcolor: '#2d5e41', color: '#fff', flexShrink: 0 }}>
                  <PinDropRoundedIcon sx={{ fontSize: '1.15rem' }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontFamily: 'inherit', fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>
                    {L('GN Division Area Code', 'ග්‍රාම නිලධාරී වසම් කේතය', 'கிராம அலுவலர் பிரிவு குறியீடு')}
                  </Typography>
                  <Typography component="div" sx={{ fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace", fontWeight: 800, fontSize: '1.15rem', color: '#fff', letterSpacing: '0.12em', lineHeight: 1.2 }}>
                    {displayCCODE}
                  </Typography>
                </Box>
                <Tooltip title={copiedCode ? L('Copied!', 'පිටපත් විය!', 'நகலெடுக்கப்பட்டது!') : L('Copy area code', 'කේතය පිටපත් කරන්න', 'குறியீட்டை நகலெடு')}>
                  <IconButton onClick={copyAreaCode} aria-label="Copy area code"
                    sx={{ width: 40, height: 40, borderRadius: '12px', color: copiedCode ? '#6ee7b7' : '#fff', bgcolor: copiedCode ? 'rgba(5,150,105,0.25)' : 'rgba(255,255,255,0.12)', transition: 'background-color 0.2s ease' }}>
                    {copiedCode ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            <VillageQuickStats
              populationData={props.populationData}
              gnEconomyData={props.gnEconomyData}
              housingOwnershipData={props.housingOwnershipData}
              roomsData={props.roomsData}
              isDarkMode // always the white-text style here: this card has no background over the map
              variant="compact"
              orientation="row"
            />
          </Box>

          {contributeSlot}

          {/* Survey & Census: the desktop card, chart beside the icon rail */}
          <Box sx={{ height: 460, display: 'flex' }}>
            <DemographicCards
              populationData={props.populationData}
              gnEconomyData={props.gnEconomyData}
              housingOwnershipData={props.housingOwnershipData}
              housingWallData={props.housingWallData}
              housingUnitData={props.housingUnitData}
              toiletFacilityData={props.toiletFacilityData}
              drinkingWaterData={props.drinkingWaterData}
              solidWasteData={props.solidWasteData}
              roomsData={props.roomsData}
              roofData={props.roofData}
              religionData={props.religionData}
              householdHeadData={props.householdHeadData}
              isDarkMode={isDarkMode}
              layout="narrow"
              showQuickStats={false}
              onOpenCategory={onOpenCategory}
            />
          </Box>

          {/* Search + categories */}
          <Box sx={{ ...card, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <GlobalSearchBar isDarkMode={isDarkMode} activeGn={activeGn ? { nameEn: activeGn.nameEn, CCODE: displayCCODE || activeGn.CCODE } : null} language={language} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', color: ink, letterSpacing: '-0.01em' }}>
                {L('Explore Categories', 'ප්‍රවර්ග ගවේෂණය', 'வகைகளை ஆராயுங்கள்')}
              </Typography>
              <Button onClick={() => setCategoriesOpen(true)} disableRipple sx={{ ...pillSx, minHeight: 32, px: 1.4, fontSize: '0.78rem' }}>
                {L('See all', 'සියල්ල', 'அனைத்தும்')}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mx: -2, px: 2, pb: 0.5, scrollSnapType: 'x proximity', scrollPaddingLeft: 16, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              {MOBILE_CATEGORIES.map((cat) => categoryTile(cat, false))}
            </Box>
          </Box>

          <Box sx={{ borderRadius: '22px', overflow: 'hidden' }}>
            <GnPageFooter isDarkMode={isDarkMode} />
          </Box>
        </Box>
      </Box>

      <MobileBottomNav
        isDarkMode={isDarkMode}
        onHome={goHome}
        onCategories={() => setCategoriesOpen(true)}
        onLocation={() => setLocationOpen(true)}
        onSurvey={goSurvey}
      />

      <MobileLocationSheet
        open={locationOpen}
        onOpen={() => setLocationOpen(true)}
        onClose={() => setLocationOpen(false)}
        isDarkMode={isDarkMode}
        districts={districts}
        selectedDistrict={selectedDistrict}
        onDistrictChange={onDistrictChange}
        dsDivisions={dsDivisions}
        selectedCity={selectedCity}
        onCityChange={onCityChange}
        gramaNiladharis={gramaNiladharis}
        selectedGN={selectedGN}
        onGNChange={(g) => { onGNChange(g); setLocationOpen(false); }}
      />

      <SwipeableDrawer
        anchor="bottom"
        open={categoriesOpen}
        onOpen={() => setCategoriesOpen(true)}
        onClose={() => setCategoriesOpen(false)}
        disableSwipeToOpen
        PaperProps={{ sx: { ...glassSx(isDarkMode), borderBottom: 'none', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', fontFamily: font, pb: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 5, borderRadius: 3, bgcolor: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.18)' }} />
        </Box>
        <Box sx={{ px: 2.5, pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1.1rem', color: ink }}>
              {L('Categories', 'ප්‍රවර්ග', 'வகைகள்')}
            </Typography>
            <IconButton onClick={() => setCategoriesOpen(false)} aria-label="Close" sx={roundBtnSx}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1, pb: 1 }}>
            {MOBILE_CATEGORIES.map((cat) => categoryTile(cat, true))}
          </Box>
        </Box>
      </SwipeableDrawer>

      <Dialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        fullWidth
        PaperProps={{ sx: { ...glassSx(isDarkMode), borderRadius: '22px', color: ink, mx: 2, fontFamily: font } }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '0.98rem', lineHeight: 1.7, color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
            {ABOUT_TEXT[language as 'si' | 'ta'] ?? ABOUT_TEXT.en}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pb: 3, justifyContent: 'center' }}>
          <Button onClick={() => setAboutOpen(false)} variant="contained" disableElevation
            sx={{ fontFamily: 'inherit', fontWeight: 600, textTransform: 'none', borderRadius: '999px', px: 3, bgcolor: '#2d5e41', '&:hover': { bgcolor: '#23503a' } }}>
            {L('Close', 'වහන්න', 'மூடு')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MobileDashboard;
