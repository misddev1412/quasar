import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { withSeo } from '../components/SEO/withSeo';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LayoutProvider } from '../contexts/LayoutContext';
import Loading from '../components/common/Loading';
import AppLayout from '../components/layout/AppLayout';

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

// 页面加载包装器
const PageLoader: React.FC = () => (
  <Loading message="页面加载中..." fullPage={true} />
);

// 路由保护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // 显示认证加载状态
  if (isLoading) {
    return <Loading message="验证身份..." fullPage={true} />;
  }
  
  if (!isAuthenticated) {
    // 保存尝试访问的URL，以便在登录后重定向
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// 默认布局组件 - 使用Outlet代替直接的children
const DefaultLayout: React.FC = () => {
  return (
    <LayoutProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </LayoutProvider>
  );
};

// 认证布局组件 - 不使用AppLayout
const AuthLayout: React.FC = () => {
  return <Outlet />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<SeoLoginPage />} />
            <Route path="forgot-password" element={<SeoForgotPasswordPage />} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>
          
          {/* Protected routes with default layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SeoHomePage />} />
            {/* 可以在这里添加更多受保护的路由 */}
            {/* <Route path="users" element={<UsersPage />} /> */}
            {/* <Route path="settings" element={<SettingsPage />} /> */}
          </Route>
          
          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<SeoNotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Suspense>
  );
}; 