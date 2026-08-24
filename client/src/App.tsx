import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/Guards/ProtectedRoute';
import RoleGuard from './components/Guards/RoleGuard';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import ComplaintList from './pages/complaints/ComplaintList';
import ComplaintDetail from './pages/complaints/ComplaintDetail';
import CreateComplaint from './pages/complaints/CreateComplaint';
import NoticeBoard from './pages/notices/NoticeBoard';
import EmailLogs from './pages/admin/EmailLogs';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'ADMIN' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin Only Routes */}
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/emails" element={<EmailLogs />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
              </Route>
              <Route
                path="/dashboard"
                element={
                  <RoleGuard allowedRoles={['RESIDENT']}>
                    <ResidentDashboard />
                  </RoleGuard>
                }
              />
              
              {/* Complaints — Resident Only (must come before :id) */}
              <Route 
                path="/complaints/new" 
                element={
                  <RoleGuard allowedRoles={['RESIDENT']}>
                    <CreateComplaint />
                  </RoleGuard>
                } 
              />

              {/* Complaints — Shared */}
              <Route path="/complaints" element={<ComplaintList />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />
              
              {/* Notice Board */}
              <Route path="/notices" element={<NoticeBoard />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
