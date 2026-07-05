import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '../graphql/mutations';
import { CircularProgress } from '@mui/material';
import { PersonAdd as UserPlus, Security as Shield, ErrorOutline as AlertCircle, CheckCircleOutline as CheckCircle } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

export default function RegistrationPage() {
  const { userInfo } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    nic: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });

  const [registerUser, { loading }] = useMutation(REGISTER_USER);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Protect route
  if (!userInfo?.realm_roles?.includes('super_admin')) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-sm">
          <Shield className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-slate-400">Only Super Admins can access user registration.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      await registerUser({
        variables: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          nic: formData.role === 'USER' ? formData.nic : null,
          mobileNumber: formData.role === 'USER' ? formData.mobileNumber : null,
          password: formData.password,
          role: formData.role,
        },
      });
      setSuccessMsg('User registered successfully in Keycloak and Database!');
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        nic: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register user');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Register User</h1>
          <p className="text-slate-400">Create new users and admins in Keycloak</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl md:p-8">
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>{errorMsg}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">First Name</label>
              <input
                required
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="John"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Last Name</label>
              <input
                required
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {formData.role === 'USER' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">NIC Number</label>
                <input
                  required
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="123456789V"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Mobile Number</label>
                <input
                  required
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="0771234567"
                />
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirm Password</label>
              <input
                required
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Registering User...
                </>
              ) : (
                'Register User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
