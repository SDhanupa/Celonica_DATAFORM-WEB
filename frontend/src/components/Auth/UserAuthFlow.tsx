import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Divider,
  IconButton
} from '@mui/material';
import { Google, Microsoft, Shield } from '@mui/icons-material';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../../auth/AuthProvider';

const INIT_REGISTRATION = gql`
  mutation InitiateUserRegistration($firstName: String!, $lastName: String!, $nic: String!, $address: String!, $mobileNumber: String!, $dob: String, $gender: String) {
    initiateUserRegistration(firstName: $firstName, lastName: $lastName, nic: $nic, address: $address, mobileNumber: $mobileNumber, dob: $dob, gender: $gender)
  }
`;

const VERIFY_REGISTRATION = gql`
  mutation VerifyRegistrationOtp($nic: String!, $otp: String!) {
    verifyRegistrationOtp(nic: $nic, otp: $otp)
  }
`;

const INIT_LOGIN = gql`
  mutation InitiateUserLogin($nic: String!) {
    initiateUserLogin(nic: $nic)
  }
`;

const VERIFY_LOGIN_MOBILE = gql`
  mutation VerifyLoginMobile($nic: String!, $mobileNumber: String!) {
    verifyLoginMobile(nic: $nic, mobileNumber: $mobileNumber)
  }
`;

const VERIFY_LOGIN_OTP = gql`
  mutation VerifyLoginOtp($nic: String!, $otp: String!) {
    verifyLoginOtp(nic: $nic, otp: $otp)
  }
`;

interface UserAuthFlowProps {
  onSuccess: () => void;
  onAdminLogin?: () => void;
}

const UserAuthFlow: React.FC<UserAuthFlowProps> = ({ onSuccess, onAdminLogin }) => {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [step, setStep] = useState(1);
  const { setLocalToken } = useAuth();
  const [error, setError] = useState('');

  // Form State
  const [nic, setNic] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [otp, setOtp] = useState('');
  
  // Login specific state
  const [maskedMobile, setMaskedMobile] = useState('');

  // Mutations
  const [initReg, { loading: regLoading }] = useMutation(INIT_REGISTRATION);
  const [verifyReg, { loading: verifyRegLoading }] = useMutation(VERIFY_REGISTRATION);
  
  const [initLogin, { loading: loginLoading }] = useMutation(INIT_LOGIN);
  const [verifyLoginMob, { loading: verifyMobLoading }] = useMutation(VERIFY_LOGIN_MOBILE);
  const [verifyLoginOtpMut, { loading: verifyOtpLoading }] = useMutation(VERIFY_LOGIN_OTP);

  const handleError = (e: any) => {
    setError(e.message || 'An error occurred. Please try again.');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await initReg({ variables: { firstName, lastName, nic, address, mobileNumber: mobile, dob, gender } });
      setStep(2); // Go to OTP step
    } catch (e) { handleError(e); }
  };

  const handleRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await verifyReg({ variables: { nic, otp } });
      setLocalToken(data.verifyRegistrationOtp);
      onSuccess();
    } catch (e) { handleError(e); }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await initLogin({ variables: { nic } });
      setMaskedMobile(data.initiateUserLogin);
      setStep(2); // Go to Mobile Verification
    } catch (e) { handleError(e); }
  };

  const handleLoginMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifyLoginMob({ variables: { nic, mobileNumber: mobile } });
      setStep(3); // Go to OTP
    } catch (e) { handleError(e); }
  };

  const handleLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await verifyLoginOtpMut({ variables: { nic, otp } });
      setLocalToken(data.verifyLoginOtp);
      onSuccess();
    } catch (e) { handleError(e); }
  };

  const resetFlow = (newTab: number) => {
    setTab(newTab);
    setStep(1);
    setError('');
    setOtp('');
    setMobile('');
  };

  const inputStyles = {
    bgcolor: '#eef2f6',
    borderRadius: '50px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: '#d1d5db',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2e493b',
      },
    }
  };

  const buttonStyles = {
    mt: 2,
    bgcolor: '#2e493b',
    color: 'white',
    borderRadius: '50px',
    textTransform: 'none',
    fontWeight: 600,
    py: 1.5,
    boxShadow: 'none',
    '&:hover': {
      bgcolor: '#1a2e24',
      boxShadow: 'none',
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {tab === 0 && (
        <>
          {step === 1 && (
            <form onSubmit={handleLoginSubmit}>
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1 }}>Login, email or phone number</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={nic} onChange={e => setNic(e.target.value)} required sx={inputStyles} placeholder="admin" />
              <Button fullWidth type="submit" variant="contained" sx={buttonStyles} disabled={loginLoading}>
                {loginLoading ? <CircularProgress size={24} sx={{color: 'white'}} /> : 'Log in'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleLoginMobileSubmit}>
              <Typography variant="body2" sx={{ color: '#4b5563', mb: 2, ml: 1 }}>
                Registered mobile ends with <b>{maskedMobile.slice(-4)}</b>.
              </Typography>
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1 }}>Full Mobile Number</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={mobile} onChange={e => setMobile(e.target.value)} required sx={inputStyles} />
              <Button fullWidth type="submit" variant="contained" sx={buttonStyles} disabled={verifyMobLoading}>
                {verifyMobLoading ? <CircularProgress size={24} sx={{color: 'white'}} /> : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleLoginOtp}>
              <Typography variant="body2" sx={{ color: '#4b5563', mb: 2, ml: 1 }}>
                8-digit code sent to {mobile}.
              </Typography>
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1 }}>Enter OTP</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={otp} onChange={e => setOtp(e.target.value)} required inputProps={{ maxLength: 8 }} sx={inputStyles} />
              <Button fullWidth type="submit" variant="contained" sx={buttonStyles} disabled={verifyOtpLoading}>
                {verifyOtpLoading ? <CircularProgress size={24} sx={{color: 'white'}} /> : 'Verify'}
              </Button>
            </form>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#4b5563', ml: 1 }}>First Name</Typography>
                  <TextField fullWidth size="small" variant="outlined" margin="dense" value={firstName} onChange={e => setFirstName(e.target.value)} required sx={inputStyles} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#4b5563', ml: 1 }}>Last Name</Typography>
                  <TextField fullWidth size="small" variant="outlined" margin="dense" value={lastName} onChange={e => setLastName(e.target.value)} required sx={inputStyles} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1, mt: 1, display: 'block' }}>NIC</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={nic} onChange={e => setNic(e.target.value)} required sx={inputStyles} />
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1, mt: 1, display: 'block' }}>Mobile Number</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="07XXXXXXXX" sx={inputStyles} />
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1, mt: 1, display: 'block' }}>Address</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={address} onChange={e => setAddress(e.target.value)} required sx={inputStyles} />
              
              <Button fullWidth type="submit" variant="contained" sx={{...buttonStyles, mt: 3}} disabled={regLoading}>
                {regLoading ? <CircularProgress size={24} sx={{color: 'white'}} /> : 'Register'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegisterOtp}>
              <Typography variant="body2" sx={{ color: '#4b5563', mb: 2, ml: 1 }}>
                8-digit code sent to {mobile}.
              </Typography>
              <Typography variant="caption" sx={{ color: '#4b5563', ml: 1 }}>Enter OTP</Typography>
              <TextField fullWidth size="small" variant="outlined" margin="dense" value={otp} onChange={e => setOtp(e.target.value)} required inputProps={{ maxLength: 8 }} sx={inputStyles} />
              <Button fullWidth type="submit" variant="contained" sx={buttonStyles} disabled={verifyRegLoading}>
                {verifyRegLoading ? <CircularProgress size={24} sx={{color: 'white'}} /> : 'Verify & Register'}
              </Button>
            </form>
          )}
        </>
      )}

      {/* Social and Toggles */}
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ borderColor: '#e5e7eb', mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', px: 1 }}>
            or log in with
          </Typography>
        </Divider>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <IconButton size="small" onClick={onAdminLogin} sx={{ border: '1px solid #e5e7eb', p: 1 }}>
            <Google sx={{ color: '#DB4437', fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" onClick={onAdminLogin} sx={{ border: '1px solid #e5e7eb', p: 1 }}>
            <Shield sx={{ color: '#0f2a1e', fontSize: 20 }} />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem' }}>
          {tab === 0 ? (
            <>
              Forgot login or password? <br/>
              Don't have an account? <span onClick={() => resetFlow(1)} style={{color: '#0f2a1e', fontWeight: 600, cursor: 'pointer'}}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account? <span onClick={() => resetFlow(0)} style={{color: '#0f2a1e', fontWeight: 600, cursor: 'pointer'}}>Log in</span>
            </>
          )}
        </Typography>
      </Box>

    </Box>
  );
};

export default UserAuthFlow;
