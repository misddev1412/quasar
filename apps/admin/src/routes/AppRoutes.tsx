import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <AppLayout>{element}</AppLayout> : <Navigate to="/auth/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 认证路由 */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* 受保护路由 */}
      <Route path="/" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/seo" element={<ProtectedRoute element={<SeoPage />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<UserProfilePage />} />} />
      <Route path="/users" element={<ProtectedRoute element={<UserListPage />} />} />
      <Route path="/roles" element={<ProtectedRoute element={<RolesPage />} />} />

      {/* 404路由 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 