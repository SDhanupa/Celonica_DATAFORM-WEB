import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../auth/AuthProvider';

const COMPLETE_ONBOARDING = gql`
  mutation CompleteUserOnboarding(
    $firstName: String!
    $lastName: String!
    $nic: String!
    $mobileNumber: String!
    $address: String!
    $dob: String!
    $gender: String!
  ) {
    completeUserOnboarding(
      firstName: $firstName
      lastName: $lastName
      nic: $nic
      mobileNumber: $mobileNumber
      address: $address
      dob: $dob
      gender: $gender
    )
  }
`;

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { userInfo } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: userInfo?.given_name || '',
    lastName: userInfo?.family_name || '',
    nic: '',
    mobileNumber: '',
    address: '',
    dob: '',
    gender: '',
  });

  const [completeOnboarding, { loading, error }] = useMutation(COMPLETE_ONBOARDING, {
    onCompleted: () => {
      onComplete();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding({ variables: formData });
  };

  return (
    <Dialog disableEscapeKeyDown open={open} maxWidth="sm" fullWidth PaperProps={{
      sx: {
        background: 'rgba(20, 20, 35, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }
    }}>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#4F46E5', mb: 1 }}>
          Welcome to Celonica!
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Please complete your profile to continue. All fields are required.
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.message}
            </Alert>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              required
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              required
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          
          <TextField
            required
            name="nic"
            label="NIC Number"
            value={formData.nic}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <TextField
            required
            name="mobileNumber"
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <TextField
            required
            name="address"
            label="Full Address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              required
              name="dob"
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              select
              name="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            fullWidth
            sx={{ 
              py: 1.5,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
