import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AlertTitle,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../auth/AuthProvider';
import { useQuery } from '@apollo/client';
import { GET_P_DISTRICTS, GET_P_DISTRICT_WITH_GNS } from '../graphql/queries';

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: any;
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({ open, onClose, onSuccess, category }) => {
  const { token } = useAuth();
  
  
  // Location Mapping
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGN, setSelectedGN] = useState('');
  
  // File & State
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [duplicateResults, setDuplicateResults] = useState<any>(null);

  // Queries for Location Dropdowns
  const { data: districtsData, loading: districtsLoading } = useQuery(GET_P_DISTRICTS, {
    fetchPolicy: 'cache-first',
  });

  const { data: gnData, loading: gnLoading } = useQuery(GET_P_DISTRICT_WITH_GNS, {
    variables: { id: selectedDistrict },
    skip: !selectedDistrict,
    fetchPolicy: 'cache-first',
  });

  const districts = districtsData?.pDistricts || [];

  const dsDivisions = useMemo(() => {
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
  }, [gnData]);

  const gramaNiladharis = useMemo(() => {
    if (!gnData?.pDistrict?.gramaNiladharis) return [];
    if (!selectedCity) return gnData.pDistrict.gramaNiladharis;
    return gnData.pDistrict.gramaNiladharis.filter(
      (gn: any) => gn.divisionalSecretariatCode === selectedCity || gn.dsEn === selectedCity
    );
  }, [gnData, selectedCity]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!category || !category.nameEn) {
      setError('Category information is missing.');
      return;
    }
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('slug', category.slug);
    formData.append('name_en', category.nameEn);
    if (category.nameSi) formData.append('name_si', category.nameSi);
    if (category.nameTa) formData.append('name_ta', category.nameTa);
    if (selectedDistrict) formData.append('district_id', selectedDistrict);
    if (selectedCity) formData.append('ds_division_code', selectedCity);
    if (selectedGN) formData.append('gn_id', selectedGN);
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-category-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      if (data.duplicate_count && data.duplicate_count > 0) {
        setDuplicateResults(data);
      } else {
        setSuccessMsg(data.message || 'Data uploaded successfully!');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDistrict('');
    setSelectedCity('');
    setSelectedGN('');
    setFile(null);
    setError(null);
    setSuccessMsg(null);
    setDuplicateResults(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Upload Data for "{category?.nameEn || 'Category'}"</DialogTitle>
      <DialogContent>
        {duplicateResults ? (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Duplicate Entries Found</AlertTitle>
              Saved <strong>{duplicateResults.saved_count}</strong> rows successfully. <br/>
              Skipped <strong>{duplicateResults.duplicate_count}</strong> rows because they already exist in this location. 
              Please fix these issues and upload them separately.
            </Alert>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Skipped Duplicates:</Typography>
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1, bgcolor: '#fff3cd', borderColor: '#ffeeba' }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {duplicateResults.duplicates.map((dup: any, idx: number) => (
                  <li key={idx}>
                    <Typography variant="body2" sx={{ color: '#856404' }}>
                      {dup.name_en || dup.name_si || dup.name_ta || 'Unknown Name'}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => { onSuccess(); handleClose(); }} variant="contained" color="primary">
                Acknowledge & Close
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{successMsg}</Alert>}
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, mt: 1 }}>
              Select the location below to map this new data to a specific GN division. 
              The data will be stored in a dynamically generated database table for the category.
            </Typography>

        {/* Location Dropdowns */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600 }}>Location Mapping (Optional but recommended)</Typography>
          
          <FormControl fullWidth size="small">
            <InputLabel>District</InputLabel>
            <Select
              value={selectedDistrict}
              label="District"
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedCity('');
                setSelectedGN('');
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {districts.map((d: any) => (
                <MenuItem key={d.id || d.admin2Pcode} value={d.id || d.admin2Pcode}>
                  {d.admin2NameEn || d.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!selectedDistrict || dsDivisions.length === 0}>
            <InputLabel>City / DS Division</InputLabel>
            <Select
              value={selectedCity}
              label="City / DS Division"
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedGN('');
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {dsDivisions.map((city: any) => (
                <MenuItem key={city.divisionalSecretariatCode} value={city.divisionalSecretariatCode}>
                  {city.dsEn || city.divisionalSecretariatCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!selectedCity || gramaNiladharis.length === 0}>
            <InputLabel>Grama Niladhari (GN)</InputLabel>
            <Select
              value={selectedGN}
              label="Grama Niladhari (GN)"
              onChange={(e) => setSelectedGN(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {gramaNiladharis.map((gn: any) => (
                <MenuItem key={gn.id || gn.CCODE} value={gn.id || gn.CCODE}>
                  {gn.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '2px dashed #ccc', borderRadius: 2, p: 3, justifyContent: 'center' }}>
          <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} disabled={loading}>
            Select CSV File
            <input type="file" hidden accept=".csv" onChange={handleFileChange} />
          </Button>
          <Typography variant="body2">{file ? file.name : 'No file selected'}</Typography>
        </Box>
        </>
        )}
      </DialogContent>
      
      {!duplicateResults && (
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            color="primary" 
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BulkUploadDialog;
