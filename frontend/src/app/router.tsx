import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleName } from '../types';

// Layouts
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from '../features/public/LandingPage';
import { HowItWorksPage } from '../features/public/HowItWorksPage';
import { SupportedLanguagesPage } from '../features/public/SupportedLanguagesPage';
import { AboutPage } from '../features/public/AboutPage';
import { HelpFaqPage } from '../features/public/HelpFaqPage';
import { TrackPublicComplaintPage } from '../features/public/TrackPublicComplaintPage';
import { PrivacyPolicyPage } from '../features/public/PrivacyPolicyPage';
import { TermsPage } from '../features/public/TermsPage';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';

// Citizen Pages
import { CitizenDashboard } from '../features/citizen/CitizenDashboard';
import { SubmitGrievance } from '../features/citizen/SubmitGrievance';
import { MyComplaints } from '../features/citizen/MyComplaints';
import { ComplaintDetail } from '../features/citizen/ComplaintDetail';
import { CitizenProfile } from '../features/citizen/CitizenProfile';

// Department Pages
import { DepartmentDashboard } from '../features/department/DepartmentDashboard';
import { DepartmentComplaints } from '../features/department/DepartmentComplaints';
import { DepartmentComplaintWorkspace } from '../features/department/DepartmentComplaintWorkspace';
import { DepartmentAnalytics } from '../features/department/DepartmentAnalytics';

// Admin Pages
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { UserRoleManagement } from '../features/admin/UserRoleManagement';
import { DepartmentManagement } from '../features/admin/DepartmentManagement';
import { CategoryManagement } from '../features/admin/CategoryManagement';
import { AuditLogsView } from '../features/admin/AuditLogsView';

// Protected Route Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-mutedtext">Verifying credentials...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If citizen tries to access admin, or officer tries to access admin, redirect to their home
    if (role === 'system_admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'department_officer' || role === 'department_head') return <Navigate to="/department/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Public Route Shell
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
      <Route path="/languages" element={<PublicLayout><SupportedLanguagesPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/help" element={<PublicLayout><HelpFaqPage /></PublicLayout>} />
      <Route path="/track" element={<PublicLayout><TrackPublicComplaintPage /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

      {/* Auth Pages */}
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

      {/* Citizen Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'system_admin']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/new"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'system_admin']}>
            <SubmitGrievance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'system_admin']}>
            <MyComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'system_admin']}>
            <ComplaintDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute allowedRoles={['citizen', 'system_admin']}>
            <CitizenProfile />
          </ProtectedRoute>
        }
      />

      {/* Department Routes */}
      <Route
        path="/department/dashboard"
        element={
          <ProtectedRoute allowedRoles={['department_officer', 'department_head', 'system_admin']}>
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/complaints"
        element={
          <ProtectedRoute allowedRoles={['department_officer', 'department_head', 'system_admin']}>
            <DepartmentComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['department_officer', 'department_head', 'system_admin']}>
            <DepartmentComplaintWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/analytics"
        element={
          <ProtectedRoute allowedRoles={['department_officer', 'department_head', 'system_admin']}>
            <DepartmentAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['system_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['system_admin']}>
            <UserRoleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['system_admin']}>
            <DepartmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['system_admin']}>
            <CategoryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['system_admin']}>
            <AuditLogsView />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
