import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import theme from './theme/theme';
import { AuthProvider } from './auth/AuthProvider';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import UserShell from './components/contribute/UserShell';
import apolloClient from './api/apolloClient';

import DynamicCategoryWrapper from './components/DynamicCategoryWrapper';

// Each page is its own chunk: visitors download only the page they open (the public gnpage no longer carries
// every admin screen in its first download).
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AdminsPage = React.lazy(() => import('./pages/AdminsPage'));
const UserPage = React.lazy(() => import('./pages/UserPage'));
const MyContributionsPage = React.lazy(() => import('./pages/MyContributionsPage'));
const RapidFirePage = React.lazy(() => import('./pages/RapidFirePage'));
const MyDashboard = React.lazy(() => import('./pages/MyDashboard'));
const UsersPage = React.lazy(() => import('./pages/PlaceholderPages').then((m) => ({ default: m.UsersPage })));
const ReportsPage = React.lazy(() => import('./pages/PlaceholderPages').then((m) => ({ default: m.ReportsPage })));
const RegistrationPage = React.lazy(() => import('./pages/RegistrationPage'));
const QuestionsPage = React.lazy(() => import('./pages/QuestionsPage'));
const BulkDataPage = React.lazy(() => import('./pages/BulkDataPage'));
const SurveyPage = React.lazy(() => import('./pages/SurveyPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const UserSubmissionsPage = React.lazy(() => import('./pages/UserSubmissionsPage'));
const GramaNiladharisPage = React.lazy(() => import('./pages/GramaNiladharisPage'));
const PoliceConnectionsPage = React.lazy(() => import('./pages/PoliceConnectionsPage'));
const PostOfficeConnectionsPage = React.lazy(() => import('./pages/PostOfficeConnectionsPage'));
const PhiConnectionsPage = React.lazy(() => import('./pages/PhiConnectionsPage'));
const TrsConnectionsPage = React.lazy(() => import('./pages/TrsConnectionsPage'));
const DistrictProvinceConnectionsPage = React.lazy(() => import('./pages/DistrictProvinceConnectionsPage'));
const CategoryDetailPage = React.lazy(() => import('./pages/CategoryDetailPage'));
const ApprovalsPage = React.lazy(() => import('./pages/ApprovalsPage'));
const IndustrySurveyPage = React.lazy(() => import('./pages/IndustrySurveyPage'));
const AdminIndustrySurveys = React.lazy(() => import('./pages/AdminIndustrySurveys'));
const AdminIndustrySurveysQuestions = React.lazy(() => import('./pages/AdminIndustrySurveysQuestions'));
const AdminRapidFireApprovals = React.lazy(() => import('./pages/AdminRapidFireApprovals'));

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <React.Suspense fallback={null}>
              <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Home → redirect to GN page */}
              <Route
                path="/"
                element={<Navigate to="/gnpage" replace />}
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
              <Route
                path="/industry-survey"
                element={<IndustrySurveyPage />}
              />
              <Route
                path="/industry-survey/:gnName/:ccode"
                element={<IndustrySurveyPage />}
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
                path="/user/rapid-fire"
                element={
                  <ProtectedRoute>
                    <RapidFirePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mydashboard"
                element={
                  <ProtectedRoute>
                    <UserShell>
                      <MyDashboard />
                    </UserShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/contributions"
                element={
                  <ProtectedRoute>
                    <MyContributionsPage />
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
                path="/admin/industry-survey-questions"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                    <AdminLayout>
                      <AdminIndustrySurveysQuestions />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bulk-data"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminLayout>
                      <BulkDataPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/survey/:slug"
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
                path="/user-submissions"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator', 'user']}>
                    <AdminLayout>
                      <UserSubmissionsPage />
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


              {/* Default redirects */}
              <Route path="/dashboard" element={<Navigate to="/gnpage" replace />} />
              
              <Route
                path="/admin/rapid-fire-approvals"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'moderator']}>
                    <AdminLayout>
                      <AdminRapidFireApprovals />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/industry-surveys"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminLayout>
                      <AdminIndustrySurveys />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/gnpage" replace />} />
            </Routes>
              </React.Suspense>
          </AuthProvider>
        </Router>
      </ThemeProvider>
      </LanguageProvider>
    </ApolloProvider>
  );
};

export default App;
