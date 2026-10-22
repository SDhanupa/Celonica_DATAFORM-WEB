import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Box, Typography, Button, FormControl, CircularProgress, Alert, Dialog, DialogContent, DialogActions, Autocomplete, TextField, Divider, useTheme } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_GN_BY_COORDINATES } from '../graphql/queries';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { locationHeaderSx, locationContinueSx, locationBodySx, locationPaperSx } from './locationModalStyles';

interface LocationSelectorModalProps {
  open: boolean;
  onClose?: () => void;
  onLocationSelected?: (gn: any) => void;
  isDarkMode?: boolean;
  language?: string;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ open, onClose, onLocationSelected, isDarkMode = false }) => {
  const { language } = useLanguage();
  const themeColors = {
    primary: '#00A8FF',
    textMuted: isDarkMode ? '#AAAAAA' : '#666666',
  };

  const [showManualForm, setShowManualForm] = useState(!window.matchMedia('(max-width: 600px)').matches);
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const [selectedGN, setSelectedGN] = useState<any>(null);
  const [gnSearchInput, setGnSearchInput] = useState('');
  const [gnOptions, setGnOptions] = useState<any[]>([]);
  const [gnSearching, setGnSearching] = useState(false);

  useEffect(() => {
    if (!gnSearchInput.trim()) {
      setGnOptions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setGnSearching(true);
      try {
        const query = new URLSearchParams({ q: gnSearchInput.trim() });
        const res = await fetch(`/api/search-gns?${query}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (json.success) setGnOptions(json.data || []);
      } catch {
        // ignore
      } finally {
        setGnSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [gnSearchInput]);

  const { data: autoGnData, loading: autoGnLoading } = useQuery(GET_GN_BY_COORDINATES, {
    variables: { lat: location?.lat, lng: location?.lng },
    skip: !location || showManualForm,
    fetchPolicy: 'network-only',
  });

  const activeGn = autoGnData?.gnByCoordinates;

  const canContinue = !showManualForm
    ? (location !== null || locationError !== null) && !!activeGn
    : !!selectedGN;

  const handleContinue = () => {
    let loadedGn: any = null;
    if (!showManualForm && activeGn) {
      loadedGn = activeGn;
    } else if (showManualForm && selectedGN) {
      loadedGn = {
        ...selectedGN,
        pDistrict: {
          admin2NameEn: selectedGN.disEn,
          admin2NameSi: selectedGN.disSi,
          admin2NameTa: selectedGN.disTa,
          pProvince: {
            admin1NameEn: selectedGN.proEn,
            admin1NameSi: selectedGN.proSi,
            admin1NameTa: selectedGN.proTa,
          }
        }
      };
    }

    if (loadedGn && loadedGn.CCODE && loadedGn.nameEn) {
      if (onLocationSelected) {
        onLocationSelected(loadedGn);
      } else {
        // Fallback or do nothing
      }
      if (onClose) onClose();
    }
  };

  return (
    <Dialog
      open={open}
      scroll="body"
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        if (onClose) onClose();
      }}
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
      <Box
        sx={locationHeaderSx(isDarkMode)}
      >
        {/* Plain Transparent PNG Logos (No border, No box) */}
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

                {autoGnLoading ? (
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
            <FormControl fullWidth>
              <Autocomplete
                options={gnOptions}
                getOptionLabel={(o: any) => {
                  const name = language === 'si' ? o.nameSi : language === 'ta' ? o.nameTa : o.nameEn;
                  const ds = language === 'si' ? o.dsSi : language === 'ta' ? o.dsTa : o.dsEn;
                  let dis = language === 'si' ? o.disSi : language === 'ta' ? o.disTa : o.disEn;
                  let pro = language === 'si' ? o.proSi : language === 'ta' ? o.proTa : o.proEn;
                  
                  if (language === 'si') {
                    if (dis && !dis.includes('දිස්ත්‍රික්කය')) dis += ' දිස්ත්‍රික්කය';
                    if (pro && !pro.includes('පළාත')) pro += ' පළාත';
                  } else if (language === 'en') {
                    if (dis && !dis.includes('District')) dis += ' District';
                    if (pro && !pro.includes('Province')) pro += ' Province';
                  } else if (language === 'ta') {
                    if (dis && !dis.includes('மாவட்டம்')) dis += ' மாவட்டம்';
                    if (pro && !pro.includes('மாகாணம்')) pro += ' மாகாணம்';
                  }

                  const ccode = o.ccode || o.CCODE || o.code || '';
                  const parts = [
                    name ? `${name}${ccode ? ` (${ccode})` : ''}` : (o.nameEn || ''),
                    ds, dis, pro
                  ].filter(Boolean);

                  return parts.join(', ');
                }}
                value={selectedGN}
                loading={gnSearching}
                onInputChange={(_, v) => setGnSearchInput(v)}
                filterOptions={(x) => x} // Backend filtering
                onChange={(_, v) => setSelectedGN(v)}
                renderInput={(p) => (
                  <TextField 
                    {...p} 
                    label={language === 'en' ? 'Location' : language === 'si' ? 'ස්ථානය' : 'இடம்'} 
                    placeholder={language === 'en' ? 'Type GN name, District, or Province...' : language === 'si' ? 'ග්‍රාම නිලධාරී වසම, දිස්ත්‍රික්කය, හෝ පළාත සොයන්න...' : 'கிராம உத்தியோகத்தர் பிரிவு, மாவட்டம் அல்லது மாகாணத்தைத் தேடுக...'} 
                    InputProps={{
                      ...p.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {gnSearching ? <CircularProgress color="inherit" size={20} /> : null}
                          {p.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props as any;
                  const name = language === 'si' ? option.nameSi : language === 'ta' ? option.nameTa : option.nameEn;
                  const ds = language === 'si' ? option.dsSi : language === 'ta' ? option.dsTa : option.dsEn;
                  let dis = language === 'si' ? option.disSi : language === 'ta' ? option.disTa : option.disEn;
                  let pro = language === 'si' ? option.proSi : language === 'ta' ? option.proTa : option.proEn;
                  
                  if (language === 'si') {
                    if (dis && !dis.includes('දිස්ත්‍රික්කය')) dis += ' දිස්ත්‍රික්කය';
                    if (pro && !pro.includes('පළාත')) pro += ' පළාත';
                  } else if (language === 'en') {
                    if (dis && !dis.includes('District')) dis += ' District';
                    if (pro && !pro.includes('Province')) pro += ' Province';
                  } else if (language === 'ta') {
                    if (dis && !dis.includes('மாவட்டம்')) dis += ' மாவட்டம்';
                    if (pro && !pro.includes('மாகாணம்')) pro += ' மாகாணம்';
                  }

                  const ccode = option.ccode || option.CCODE || option.code || '';
                  const parts = [
                    name ? `${name}${ccode ? ` (${ccode})` : ''}` : (option.nameEn || ''),
                    ds, dis, pro
                  ].filter(Boolean);
                  
                  return (
                    <li key={key} {...optionProps}>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {parts[0]}
                        </Typography>
                        {parts.length > 1 && (
                          <Typography variant="caption" color="text.secondary">
                            {parts.slice(1).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  );
                }}
              />
            </FormControl>

            <Divider sx={{ my: 1, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.15)' } }}>
              <Typography variant="caption" sx={{ color: themeColors.textMuted, fontWeight: 600, px: 1 }}>OR</Typography>
            </Divider>

            <Button
              variant="outlined"
              onClick={() => setShowManualForm(false)}
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
          onClick={handleContinue}
          disabled={!canContinue}
          sx={locationContinueSx(canContinue)}
        >
          {language === 'en' ? 'Continue' : language === 'si' ? 'ඉදිරියට' : 'தொடரவும்'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationSelectorModal;
