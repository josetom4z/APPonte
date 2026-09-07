import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { LandingPage } from '../pages/public/LandingPage';
import { FeedPage } from '../pages/public/FeedPage';
import { MapPage } from '../pages/public/MapPage';
import { RequestDetailsPage } from '../pages/public/RequestDetailsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { NewRequestPage } from '../pages/citizen/NewRequestPage';
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { OperatorDashboard } from '../pages/operator/OperatorDashboard';
import { SecretaryDashboard } from '../pages/secretary/SecretaryDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { useAuth } from '../context/AuthContext';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen / Authenticated Pages */}
          <Route
            path="/new-request"
            element={
              <ProtectedRoute>
                <NewRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/citizen"
            element={
              <ProtectedRoute>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          {/* Operator / Atuante Page */}
          <Route
            path="/dashboard/operator"
            element={
              <ProtectedRoute allowedRoles={['OPERATOR', 'SECRETARY', 'ADMIN', 'SUPER_ADMIN']}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Secretary Page */}
          <Route
            path="/dashboard/secretary"
            element={
              <ProtectedRoute allowedRoles={['SECRETARY', 'ADMIN', 'SUPER_ADMIN']}>
                <SecretaryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Page */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
      <OnboardingModal />
    </div>
  );
};
