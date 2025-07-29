import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useAuthVerification from '../hooks/useAuthVerification';
import Home from '../pages/Home';
import LoginPage from '../pages/auth/login';
import ForgotPasswordPage from '../pages/auth/forgot-password';
import NotFound from '../pages/NotFound';
import SeoPage from '../pages/seo';
import SettingsPage from '../pages/settings';
import UserProfilePage from '../pages/profile';
import UserListPage from '../pages/users';
import RolesPage from '../pages/roles';
import AppLayout from '../components/layout/AppLayout';

// 优化 ProtectedRoute 支持 children 形式，避免不必要的 profile 拉取
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Use the auth verification hook to automatically verify authentication on protected pages
  useAuthVerification();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/auth/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 非认证页面 */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      {/* 受保护页面 */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/seo" element={<ProtectedRoute><SeoPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserListPage /></ProtectedRoute>} />
      <Route path="/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
      {/* 404页面，不需要认证 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 