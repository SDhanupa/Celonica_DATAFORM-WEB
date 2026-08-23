import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Box, Typography, Button, FormControl, CircularProgress, Alert, Dialog, DialogContent, DialogActions, Autocomplete, TextField, Divider, useTheme } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ALL_LOCATIONS, GET_GN_BY_COORDINATES } from '../graphql/queries';

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

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedGN, setSelectedGN] = useState<string>('');

  // Fetch ALL locations at once so everything is 0ms instantaneous when navigating dropdowns.
  const { data: allLocationsData, loading: allLocationsLoading, error: allLocationsError } = useQuery(GET_ALL_LOCATIONS, {
    fetchPolicy: 'cache-first',
  });
  if (allLocationsError) console.error('Locations query error:', allLocationsError);

  const { data: autoGnData, loading: autoGnLoading } = useQuery(GET_GN_BY_COORDINATES, {
    variables: { lat: location?.lat, lng: location?.lng },
    skip: !location || showManualForm,
    fetchPolicy: 'network-only',
  });

  const activeGn = autoGnData?.gnByCoordinates;
  
  // Extract the GN data for the selected district instantly from memory
  const districtGNs = React.useMemo(() => {
    if (!selectedDistrict || !allLocationsData?.pDistricts) return [];
    const district = allLocationsData.pDistricts.find((d: any) => d.id === selectedDistrict);
    return district?.gramaNiladharis || [];
  }, [allLocationsData, selectedDistrict]);

  const uniqueCities = React.useMemo(() => {
    if (!districtGNs.length) return [];
    const citiesMap = new Map();
    districtGNs.forEach((gn: any) => {
      if (gn.divisionalSecretariatCode && !citiesMap.has(gn.divisionalSecretariatCode)) {
        citiesMap.set(gn.divisionalSecretariatCode, gn);
      }
    });
    return Array.from(citiesMap.values());
  }, [districtGNs]);

  const filteredGNs = React.useMemo(() => {
    if (!districtGNs.length) return [];
    if (!selectedCity) return districtGNs;
    return districtGNs.filter((gn: any) => gn.divisionalSecretariatCode === selectedCity);
  }, [districtGNs, selectedCity]);

  const canContinue = !showManualForm
    ? (location !== null || locationError !== null) && !!activeGn
    : (selectedDistrict !== '' && selectedCity !== '' && selectedGN !== '');

  useEffect(() => {
    if (open && !showManualForm && !location && !locationError) {
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
  }, [open, showManualForm, location, locationError]);

  const handleContinue = () => {
    let loadedGn: any = null;
    if (!showManualForm && activeGn) {
      loadedGn = activeGn;
    } else if (showManualForm && selectedGN && allLocationsData?.pDistricts) {
      const currentDistrict = allLocationsData.pDistricts.find((d: any) => d.id === selectedDistrict);
      if (currentDistrict && currentDistrict.gramaNiladharis) {
        const found = currentDistrict.gramaNiladharis.find((x: any) => x.id === selectedGN);
        if (found) {
          loadedGn = {
            ...found,
            pDistrict: {
              id: currentDistrict.id,
              admin2NameEn: currentDistrict.admin2NameEn,
              pProvince: currentDistrict.pProvince
            }
          };
        }
      }
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
          overflow: 'hidden',
          background: isDarkMode
            ? 'linear-gradient(160deg, #1a1c2e 0%, #2a2c40 100%)'
            : 'linear-gradient(160deg, #ffffff 0%, #f0f4ff 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }
      }}
      slotProps={{ backdrop: { sx: { backdropFilter: 'blur(14px)', bgcolor: 'rgba(0,0,0,0.6)' } } }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00A8FF 0%, #0070CC 100%)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          position: 'relative',
        }}
      >
        {/* Plain Transparent PNG Logos (No border, No box) */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, my: 0.5 }}>
          <img
            src="/logo.png"
            alt="Ceylonica Logo"
            style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
          />
          <img
            src="/praja.png"
            alt="Praja Logo"
            style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{ color: '#ffffff', fontWeight: 700, fontFamily: "'Inter', sans-serif", textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
        >
          {!showManualForm
            ? (language === 'en' ? 'Your Location' : language === 'si' ? 'ඔබගේ ස්ථානය' : 'உங்கள் இடம்')
            : (language === 'en' ? 'Select Your Location' : language === 'si' ? 'ස්ථානය තෝරන්න' : 'உங்கள் இடத்தை தேர்வு செய்யவும்')
          }
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontFamily: "'Inter', sans-serif" }}>
          {language === 'en' ? 'Census Data Explorer · Sri Lanka' : language === 'si' ? 'ජනලේඛන දත්ත · ශ්‍රී ලංකා' : 'மக்கள்தொகை கணக்கெடுப்பு · இலங்கை'}
        </Typography>
      </Box>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3, px: 3 }}>
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
                options={allLocationsData?.pDistricts || []}
                getOptionLabel={(option: any) => {
                  if (!option) return '';
                  const name = language === 'en' ? option.admin2NameEn : language === 'si' ? option.admin2NameSi : option.admin2NameTa;
                  return name || option.admin2NameEn || option.id || '';
                }}
                value={allLocationsData?.pDistricts?.find((d: any) => d.id === selectedDistrict) || null}
                onChange={(event, newValue) => {
                  setSelectedDistrict(newValue ? newValue.id : '');
                  setSelectedCity('');
                  setSelectedGN('');
                }}
                loading={allLocationsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={language === 'en' ? 'District' : language === 'si' ? 'දිස්ත්‍රික්කය' : 'மாவட்டம்'}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {allLocationsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth disabled={!selectedDistrict}>
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
                loading={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={language === 'en' ? 'City / DS Division' : language === 'si' ? 'නගරය / ප්‍රාදේශීය ලේකම් කොට්ඨාශය' : 'நகரம் / பிரதேச செயலகம்'}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth disabled={!selectedCity}>
              <Autocomplete
                options={filteredGNs}
                getOptionLabel={(option: any) => {
                  if (!option) return '';
                  const name = language === 'en' ? option.nameEn : language === 'si' ? option.nameSi : option.nameTa;
                  return name || option.nameEn || option.gnName || option.code || '';
                }}
                value={districtGNs?.find((gn: any) => gn.id === selectedGN) || null}
                onChange={(event, newValue) => {
                  setSelectedGN(newValue ? newValue.id : '');
                }}
                loading={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={language === 'en' ? 'Grama Niladhari (GN)' : language === 'si' ? 'ග්‍රාම නිලධාරී (GN)' : 'கிராம உத்தியோகத்தர் (GN)'}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
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
              startIcon={<span style={{ fontSize: '1.1em' }}>📍</span>}
            >
              Use GPS Auto-Location
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!canContinue}
          sx={{
            background: canContinue ? 'linear-gradient(135deg, #00A8FF 0%, #0070CC 100%)' : undefined,
            color: 'white',
            px: 5,
            py: 1.2,
            borderRadius: '12px',
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            boxShadow: canContinue ? '0 4px 20px rgba(0,168,255,0.4)' : undefined,
            '&:hover': { background: 'linear-gradient(135deg, #0090E0 0%, #005AB0 100%)', boxShadow: '0 6px 24px rgba(0,168,255,0.5)' },
            transition: 'all 0.25s',
          }}
        >
          {language === 'en' ? 'Continue' : language === 'si' ? 'ඉදිරියට' : 'தொடரவும்'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationSelectorModal;
