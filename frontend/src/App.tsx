import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import theme from './theme/theme';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import apolloClient from './api/apolloClient';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminsPage from './pages/AdminsPage';
import UserPage from './pages/UserPage';

import { UsersPage, ReportsPage } from './pages/PlaceholderPages';
import RegistrationPage from './pages/RegistrationPage';
import QuestionsPage from './pages/QuestionsPage';
import SurveyPage from './pages/SurveyPage';
import CategoriesPage from './pages/CategoriesPage';
import DynamicCategoryWrapper from './components/DynamicCategoryWrapper';
import GramaNiladharisPage from './pages/GramaNiladharisPage';
import PoliceConnectionsPage from './pages/PoliceConnectionsPage';
import PostOfficeConnectionsPage from './pages/PostOfficeConnectionsPage';
import PhiConnectionsPage from './pages/PhiConnectionsPage';
import TrsConnectionsPage from './pages/TrsConnectionsPage';
import DistrictProvinceConnectionsPage from './pages/DistrictProvinceConnectionsPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import FloatingEditButton from './components/FloatingEditButton';
import ApprovalsPage from './pages/ApprovalsPage';

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <FloatingEditButton />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Public Landing Page */}
              <Route
                path="/"
                element={<LandingPage />}
              />

              {/* Public Home Page (Admin layout handled inside DashboardPage for admins) */}
              <Route
                path="/gnpage"
                element={<DashboardPage />}
              />
              {/* Direct GN Link Route */}
              <Route
                path="/gnpage/:gnName/:ccode"
                element={<DashboardPage />}
              />
              {/* Category detail pages — accessible by super admin */}
              <Route
                path="/gnpage/:gnName/:ccode/:categorySlug"
                element={<CategoryDetailPage />}
              />
              {/* Protected — wrapped in AdminLayout */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/categories/*"
                element={
                  <ProtectedRoute>
                    <DynamicCategoryWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admins"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminLayout>
                      <AdminsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <UsersPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registration"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <RegistrationPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <QuestionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/survey"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <SurveyPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <ReportsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <ApprovalsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <CategoriesPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grama-niladharis"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <GramaNiladharisPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/police-connections"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <PoliceConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-office-connections"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <PostOfficeConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/phi-connections"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <PhiConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trs-connections"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <TrsConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/district-province-connections"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <DistrictProvinceConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/*"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <DynamicCategoryWrapper />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />


              {/* Default redirect */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
