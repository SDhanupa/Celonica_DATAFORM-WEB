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

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminsPage from './pages/AdminsPage';

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

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Public Home Page (Admin layout handled inside DashboardPage for admins) */}
              <Route
                path="/"
                element={<DashboardPage />}
              />
              {/* Protected — wrapped in AdminLayout */}
              <Route
                path="/admins"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <UsersPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registration"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <RegistrationPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <QuestionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/survey"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <SurveyPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ReportsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <CategoriesPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gm-divisions"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <GramaNiladharisPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/police-database-map"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <PoliceConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/postoffice-database-map"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <PostOfficeConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health-database-map"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <PhiConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trs-database-map"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <TrsConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/district-province-map"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <DistrictProvinceConnectionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/*"
                element={
                  <ProtectedRoute>
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
