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

              {/* Protected — wrapped in AdminLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <DashboardPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
