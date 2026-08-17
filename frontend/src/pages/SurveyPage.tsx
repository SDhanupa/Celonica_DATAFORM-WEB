import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, TextField, CircularProgress,
  Autocomplete, Snackbar, Alert as MuiAlert, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_GN_BY_COORDINATES, GET_P_DISTRICTS, GET_P_DISTRICT_WITH_GNS } from '../graphql/queries';
import { useAuth } from '../auth/AuthProvider';

interface FormData {
  reg_number: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  name_singlish: string;
  raw_province: string;
  raw_district: string;
  raw_ds: string;
  raw_gn: string;
  gn_code: string;
  mobile: string;
  contact_person_name: string;
  address: string;
  longitude: string;
  latitude: string;
  image_path: string;
  coordinate_mismatch: boolean;
}

interface SurveyPageProps {
  slug: string;
}

const SurveyPage: React.FC<SurveyPageProps> = ({ slug }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    reg_number: '', name_en: '', name_si: '', name_ta: '', name_singlish: '',
    raw_province: '', raw_district: '', raw_ds: '', raw_gn: '', gn_code: '',
    mobile: '', contact_person_name: '', address: '', longitude: '', latitude: '',
    image_path: '', coordinate_mismatch: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [nameOptions, setNameOptions] = useState<any[]>([]);
  const [nameSearch, setNameSearch] = useState('');
  
  // Location States
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedGN, setSelectedGN] = useState<any>(null);

  // Queries
  const { data: districtsData, loading: districtsLoading } = useQuery(GET_P_DISTRICTS, { fetchPolicy: 'cache-first' });
  const { data: gnData, loading: gnLoading } = useQuery(GET_P_DISTRICT_WITH_GNS, {
    variables: { id: selectedDistrict?.id },
    skip: !selectedDistrict,
    fetchPolicy: 'cache-first',
  });
  const [getGnByCoords] = useLazyQuery(GET_GN_BY_COORDINATES);

  // Name Autocomplete Search
  useEffect(() => {
    const hasLocationFilter = formData.raw_province || formData.raw_district || formData.raw_ds || formData.raw_gn;
    
    if (nameSearch.length > 0 || hasLocationFilter) {
      const delay = setTimeout(async () => {
        try {
          const params = new URLSearchParams();
          if (nameSearch) params.append('query', nameSearch);
          if (formData.raw_province) params.append('province', formData.raw_province);
          if (formData.raw_district) params.append('district', formData.raw_district);
          if (formData.raw_ds) params.append('ds', formData.raw_ds);
          if (formData.raw_gn) params.append('gn', formData.raw_gn);

          const res = await fetch(`/api/search-category-data/${slug}?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success) setNameOptions(json.data);
        } catch (e) {
          console.error(e);
        }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setNameOptions([]);
    }
  }, [nameSearch, slug, formData.raw_province, formData.raw_district, formData.raw_ds, formData.raw_gn]);

  const handleNameSelect = (option: any) => {
    if (option) {
      setFormData(prev => ({
        ...prev,
        reg_number: option.reg_number || '',
        name_en: option.name_en || '',
        name_si: option.name_si || '',
        name_ta: option.name_ta || '',
        name_singlish: option.name_singlish || '',
        mobile: option.mobile || '',
        contact_person_name: option.contact_person_name || '',
        address: option.address || ''
      }));
    }
  };

  // Cascading Location Logic
  const uniqueProvinces = useMemo(() => {
    if (!districtsData?.pDistricts) return [];
    const map = new Map();
    districtsData.pDistricts.forEach((d: any) => {
      if (d.pProvince) map.set(d.pProvince.id, d.pProvince);
    });
    return Array.from(map.values());
  }, [districtsData]);

  const filteredDistricts = useMemo(() => {
    if (!selectedProvince || !districtsData?.pDistricts) return [];
    return districtsData.pDistricts.filter((d: any) => d.pProvince?.id === selectedProvince.id);
  }, [selectedProvince, districtsData]);

  const uniqueCities = useMemo(() => {
    if (!gnData?.pDistrict?.gramaNiladharis) return [];
    const map = new Map();
    gnData.pDistrict.gramaNiladharis.forEach((gn: any) => {
      if (gn.divisionalSecretariatCode) map.set(gn.divisionalSecretariatCode, gn);
    });
    return Array.from(map.values());
  }, [gnData]);

  const filteredGNs = useMemo(() => {
    if (!selectedCity || !gnData?.pDistrict?.gramaNiladharis) return [];
    return gnData.pDistrict.gramaNiladharis.filter((gn: any) => gn.divisionalSecretariatCode === selectedCity.divisionalSecretariatCode);
  }, [selectedCity, gnData]);

  // Sync state to formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      raw_province: selectedProvince?.nameEn || selectedProvince?.admin1NameEn || '',
      raw_district: selectedDistrict?.admin2NameEn || '',
      raw_ds: selectedCity?.dsEn || '',
      raw_gn: selectedGN?.nameEn || selectedGN?.gnName || '',
      gn_code: selectedGN?.CCODE || selectedGN?.code || ''
    }));
  }, [selectedProvince, selectedDistrict, selectedCity, selectedGN]);

  // Auto-Select Logic
  useEffect(() => {
    try {
      const locStr = localStorage.getItem('user_selected_location') || sessionStorage.getItem('user_selected_location');
      if (locStr && districtsData?.pDistricts) {
        const loc = JSON.parse(locStr);
        
        // Auto-select Province and District
        let foundDistrict = null;
        if (loc.pDistrict?.id) {
           foundDistrict = districtsData.pDistricts.find((d: any) => d.id === loc.pDistrict.id);
        } else if (loc.divisionalSecretariatCode) {
           const dsPrefix = loc.divisionalSecretariatCode.substring(0, 2);
           foundDistrict = districtsData.pDistricts.find((d: any) => String(d.admin2Pcode) === dsPrefix);
        }

        if (foundDistrict && !selectedDistrict) {
           setSelectedDistrict(foundDistrict);
           if (foundDistrict.pProvince) setSelectedProvince(foundDistrict.pProvince);
        }
      }
    } catch(e) {}
  }, [districtsData, selectedDistrict]);

  useEffect(() => {
    try {
      const locStr = localStorage.getItem('user_selected_location') || sessionStorage.getItem('user_selected_location');
      if (locStr && gnData?.pDistrict?.gramaNiladharis) {
        const loc = JSON.parse(locStr);
        
        let foundGN = gnData.pDistrict.gramaNiladharis.find((g: any) => g.id === loc.id || g.CCODE === loc.CCODE || g.code === loc.code);
        if (foundGN) {
           if (!selectedGN) setSelectedGN(foundGN);
           
           if (!selectedCity && foundGN.divisionalSecretariatCode) {
               const foundCity = gnData.pDistrict.gramaNiladharis.find((g: any) => g.divisionalSecretariatCode === foundGN.divisionalSecretariatCode);
               if (foundCity) setSelectedCity(foundCity);
           }
        }
      }
    } catch(e) {}
  }, [gnData, selectedGN, selectedCity]);

  // Geolocation
  const [geoPrompt, setGeoPrompt] = useState(false);
  const handleGeoConfirm = () => {
    setGeoPrompt(false);
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }));
        
        // Validate coordinates
        if (formData.raw_gn) {
          try {
            const { data } = await getGnByCoords({ variables: { lat, lng } });
            if (data?.gnByCoordinates && data.gnByCoordinates.code !== formData.raw_gn && data.gnByCoordinates.CCODE !== formData.raw_gn) {
              setFormData(prev => ({ ...prev, coordinate_mismatch: true }));
              alert("Warning: Your current GPS location does not match the selected Grama Niladhari boundary. Data will still be saved, but marked for review.");
            } else {
              setFormData(prev => ({ ...prev, coordinate_mismatch: false }));
            }
          } catch (e) {
            console.error('Failed to validate coords', e);
          }
        }
        setLoading(false);
      }, (err) => {
        setLoading(false);
        setError("Failed to get location: " + err.message);
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload-survey-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image_path: data.image_path }));
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.raw_province || !formData.raw_district || !formData.raw_ds || !formData.raw_gn) {
      setError("Location fields (Province, District, DS, GN) are mandatory.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/submit-survey-data/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Submit Category Data</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* 1. Location */}
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>1. Location (Mandatory)</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete fullWidth options={uniqueProvinces} getOptionLabel={(o) => o.nameEn || o.admin1NameEn || ''} value={selectedProvince} onChange={(e, v) => { setSelectedProvince(v); setSelectedDistrict(null); setSelectedCity(null); setSelectedGN(null); }} renderInput={(p) => <TextField {...p} label="Province" required />} />
            <Autocomplete fullWidth options={filteredDistricts} getOptionLabel={(o) => o.admin2NameEn || ''} value={selectedDistrict} onChange={(e, v) => { setSelectedDistrict(v); setSelectedCity(null); setSelectedGN(null); }} disabled={!selectedProvince} renderInput={(p) => <TextField {...p} label="District" required />} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete fullWidth options={uniqueCities} getOptionLabel={(o) => o.dsEn || ''} value={selectedCity} onChange={(e, v) => { setSelectedCity(v); setSelectedGN(null); }} disabled={!selectedDistrict || gnLoading} renderInput={(p) => <TextField {...p} label="DS Division" required />} />
            <Autocomplete fullWidth options={filteredGNs} getOptionLabel={(o) => o.nameEn || o.gnName || o.code || ''} value={selectedGN} onChange={(e, v) => setSelectedGN(v)} disabled={!selectedCity || gnLoading} renderInput={(p) => <TextField {...p} label="GN Division" required />} />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 2. Basic Details */}
          <Typography variant="h6" color="primary">2. Basic Details</Typography>
          <Autocomplete
            freeSolo
            options={nameOptions}
            getOptionLabel={(o: any) => o.name_en ? `${o.name_en}${o.name_si ? ` / ${o.name_si}` : ''}${o.name_ta ? ` / ${o.name_ta}` : ''}` : (typeof o === 'string' ? o : '')}
            onInputChange={(e, val) => setNameSearch(val)}
            onChange={(e, val) => handleNameSelect(val)}
            renderInput={(params) => <TextField {...params} label="Search or Enter Name (EN/SI/TA)" fullWidth />}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Name (SI)"
              fullWidth
              value={formData.name_si}
              onChange={(e) => setFormData(f => ({...f, name_si: e.target.value}))}
              helperText={formData.name_si ? "Auto-filled — edit if incorrect" : ""}
              FormHelperTextProps={{ sx: { color: 'info.main', fontSize: '0.72rem' } }}
            />
            <TextField
              label="Name (TA)"
              fullWidth
              value={formData.name_ta}
              onChange={(e) => setFormData(f => ({...f, name_ta: e.target.value}))}
              helperText={formData.name_ta ? "Auto-filled — edit if incorrect" : ""}
              FormHelperTextProps={{ sx: { color: 'info.main', fontSize: '0.72rem' } }}
            />
          </Box>

          <TextField label="Mobile" fullWidth value={formData.mobile} onChange={(e) => setFormData(f => ({...f, mobile: e.target.value}))} />
          <TextField label="Contact Person Name" fullWidth value={formData.contact_person_name} onChange={(e) => setFormData(f => ({...f, contact_person_name: e.target.value}))} />
          <TextField label="Address" fullWidth multiline rows={2} value={formData.address} onChange={(e) => setFormData(f => ({...f, address: e.target.value}))} />

          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>3. Geolocation & Media</Typography>
          <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={() => setGeoPrompt(true)} disabled={loading}>
            Get Current Location
          </Button>
          {(formData.latitude && formData.longitude) && (
            <Typography variant="body2" color="success.main">Coordinates Captured: {formData.latitude}, {formData.longitude}</Typography>
          )}

          <Button component="label" variant="outlined" startIcon={imageUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />} disabled={imageUploading} sx={{ height: 60, borderStyle: 'dashed' }}>
            {imageUploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </Button>
          {formData.image_path && (
            <img src={`/api/uploads/survey_images/${formData.image_path}`} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
          )}

          <Button variant="contained" color="primary" size="large" onClick={handleSubmit} disabled={loading} sx={{ mt: 4 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Data'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={geoPrompt} onClose={() => setGeoPrompt(false)}>
        <DialogTitle>Confirm Location</DialogTitle>
        <DialogContent>Are you currently located exactly at this facility/property?</DialogContent>
        <DialogActions>
          <Button onClick={() => setGeoPrompt(false)}>No, Skip</Button>
          <Button variant="contained" onClick={handleGeoConfirm} autoFocus>Yes, Capture Location</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <MuiAlert severity="error" onClose={() => setError(null)}>{error}</MuiAlert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000}>
        <MuiAlert severity="success">Data submitted successfully!</MuiAlert>
      </Snackbar>
    </Box>
  );
};
export default SurveyPage;
