import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { withSeo } from '../components/SEO/withSeo';
import { AuthProvider } from '../context/AuthContext';

// Lazy loaded components
const LoginPage = lazy(() => import('../pages/auth/login'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password'));
const HomePage = lazy(() => import('../pages/Home'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

// SEO enhanced components
const SeoLoginPage = withSeo(LoginPage, { title: 'Admin Login', description: 'Login to Quasar Admin Panel', path: '/auth/login' });
const SeoForgotPasswordPage = withSeo(ForgotPasswordPage, { title: 'Forgot Password', description: 'Reset your password for Quasar Admin Panel', path: '/auth/forgot-password' });
const SeoHomePage = withSeo(HomePage, { title: 'Admin Dashboard', description: 'Quasar Admin Dashboard', path: '/' });
const SeoNotFoundPage = withSeo(NotFoundPage, { title: '404 - Not Found', description: 'Page not found', path: '/404' });

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/login" element={<SeoLoginPage />} />
          <Route path="/auth/forgot-password" element={<SeoForgotPasswordPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<SeoHomePage />} />
          
          {/* Redirects */}
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<SeoNotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Suspense>
  );
}; 