import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/Home';
import SeoPage from '../pages/seo';
import NotFound from '../pages/NotFound';
import LoginPage from '../pages/auth/login';
import { useAuth, withAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

// Protected routes with authentication and layout
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Render the children inside the app layout
  return <AppLayout>{children}</AppLayout>;
};

/**
 * AppRoutes - Central routing configuration for the admin application
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      
      <Route path="/seo" element={
        <ProtectedRoute>
          <SeoPage />
        </ProtectedRoute>
      } />
      
      {/* Add more protected routes here */}
      
      {/* 404 route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 