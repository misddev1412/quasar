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
import SettingsVisibilityPage from '../pages/settings/visibility';
import BrandAssetsPage from '../pages/brand-assets';
import AnalyticsConfigurationPage from '../pages/analytics';
import UserProfilePage from '../pages/profile';
import UserListPage from '../pages/users';
import UserCreatePage from '../pages/users/create';
import UserUpdatePage from '../pages/users/update';
import RoleIndexPage from '../pages/roles';
import RoleCreatePage from '../pages/roles/create';
import RoleUpdatePage from '../pages/roles/update';
import PermissionIndexPage from '../pages/permissions';
import PermissionCreatePage from '../pages/permissions/create';
import PermissionUpdatePage from '../pages/permissions/update';
import MailTemplateIndexPage from '../pages/mail-templates';
import MailTemplateCreatePage from '../pages/mail-templates/create';
import MailTemplateEditPage from '../pages/mail-templates/edit';
import PostsIndexPage from '../pages/posts';
import PostsCreatePage from '../pages/posts/create';
import PostsEditPage from '../pages/posts/edit';
import PostCategoriesPage from '../pages/posts/categories';
import PostTagsPage from '../pages/posts/tags';
import LanguagesIndexPage from '../pages/languages';
import LanguagesCreatePage from '../pages/languages/create';
import LanguagesEditPage from '../pages/languages/edit';
import StorageConfigPage from '../pages/storage';
import FirebaseConfigsPage from '../pages/firebase-configs';
import CreateFirebaseConfigPage from '../pages/firebase-configs/create';
import EditFirebaseConfigPage from '../pages/firebase-configs/[id]';
import NotificationsPage from '../pages/notifications';
import NotificationPreferencesPage from '../pages/notifications/preferences';
// Product Management
import ProductsIndexPage from '../pages/products';
import AttributesPage from '../pages/products/attributes';
import BrandsPage from '../pages/products/brands';
import SuppliersPage from '../pages/products/suppliers';
import PaymentMethodsPage from '../pages/payment-methods';
import DeliveryMethodsPage from '../pages/delivery-methods';
import SupportClientsPage from '../pages/support-clients';
import SectionsPage from '../pages/sections';
// Order Management
import OrdersIndexPage from '../pages/orders';
import OrderCreatePage from '../pages/orders/create';
import OrderEditPage from '../pages/orders/edit';
import OrderDetailPage from '../pages/orders/detail';
// Customer Management
import CustomersIndexPage from '../pages/customers';
import CustomerCreatePage from '../pages/customers/create';
import CustomerEditPage from '../pages/customers/edit';
import CustomerDetailPage from '../pages/customers/detail';
import CategoriesPage from '../pages/products/categories';
import EditCategoryPage from '../pages/products/categories/edit';
import CategoryCreatePage from '../pages/products/categories/create';
import CreateProductPage from '../pages/products/create';
import EditProductPage from '../pages/products/[id]/edit';
import DateInputTest from '../pages/test/DateInputTest';
import { PhoneInputTest } from '../components/test/PhoneInputTest';
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
      <Route path="/brand-assets" element={<ProtectedRoute><BrandAssetsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsConfigurationPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/settings/visibility" element={<ProtectedRoute><SettingsVisibilityPage /></ProtectedRoute>} />
      <Route path="/storage" element={<ProtectedRoute><StorageConfigPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserListPage /></ProtectedRoute>} />
      <Route path="/users/create" element={<ProtectedRoute><UserCreatePage /></ProtectedRoute>} />
      <Route path="/users/:id" element={<ProtectedRoute><UserUpdatePage /></ProtectedRoute>} />
      <Route path="/roles" element={<ProtectedRoute><RoleIndexPage /></ProtectedRoute>} />
      <Route path="/roles/create" element={<ProtectedRoute><RoleCreatePage /></ProtectedRoute>} />
      <Route path="/roles/:id" element={<ProtectedRoute><RoleUpdatePage /></ProtectedRoute>} />
      <Route path="/permissions" element={<ProtectedRoute><PermissionIndexPage /></ProtectedRoute>} />
      <Route path="/permissions/create" element={<ProtectedRoute><PermissionCreatePage /></ProtectedRoute>} />
      <Route path="/permissions/:id" element={<ProtectedRoute><PermissionUpdatePage /></ProtectedRoute>} />
      {/* Mail Templates */}
      <Route path="/mail-templates" element={<ProtectedRoute><MailTemplateIndexPage /></ProtectedRoute>} />
      <Route path="/mail-templates/create" element={<ProtectedRoute><MailTemplateCreatePage /></ProtectedRoute>} />
      <Route path="/mail-templates/:id" element={<ProtectedRoute><MailTemplateEditPage /></ProtectedRoute>} />
      {/* Posts */}
      <Route path="/posts" element={<ProtectedRoute><PostsIndexPage /></ProtectedRoute>} />
      <Route path="/posts/create" element={<ProtectedRoute><PostsCreatePage /></ProtectedRoute>} />
      <Route path="/posts/:id" element={<ProtectedRoute><PostsEditPage /></ProtectedRoute>} />
      <Route path="/posts/categories" element={<ProtectedRoute><PostCategoriesPage /></ProtectedRoute>} />
      <Route path="/posts/tags" element={<ProtectedRoute><PostTagsPage /></ProtectedRoute>} />
      {/* Languages */}
      <Route path="/languages" element={<ProtectedRoute><LanguagesIndexPage /></ProtectedRoute>} />
      <Route path="/languages/create" element={<ProtectedRoute><LanguagesCreatePage /></ProtectedRoute>} />
      <Route path="/languages/:id/edit" element={<ProtectedRoute><LanguagesEditPage /></ProtectedRoute>} />
      {/* Firebase Configurations */}
      <Route path="/firebase-configs" element={<ProtectedRoute><FirebaseConfigsPage /></ProtectedRoute>} />
      <Route path="/firebase-configs/create" element={<ProtectedRoute><CreateFirebaseConfigPage /></ProtectedRoute>} />
      <Route path="/firebase-configs/:id" element={<ProtectedRoute><EditFirebaseConfigPage /></ProtectedRoute>} />
      {/* Notifications */}
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/notifications/preferences" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />
      {/* Product Management */}
      <Route path="/products" element={<ProtectedRoute><ProductsIndexPage /></ProtectedRoute>} />
      <Route path="/products/create" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><EditProductPage /></ProtectedRoute>} />
      <Route path="/products/attributes" element={<ProtectedRoute><AttributesPage /></ProtectedRoute>} />
      <Route path="/products/brands" element={<ProtectedRoute><BrandsPage /></ProtectedRoute>} />
      <Route path="/products/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
      <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />
      <Route path="/delivery-methods" element={<ProtectedRoute><DeliveryMethodsPage /></ProtectedRoute>} />
      <Route path="/support-clients" element={<ProtectedRoute><SupportClientsPage /></ProtectedRoute>} />
      <Route path="/sections" element={<Navigate to="/sections/home" replace />} />
      <Route path="/sections/:page" element={<ProtectedRoute><SectionsPage /></ProtectedRoute>} />
      <Route path="/products/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/products/categories/create" element={<ProtectedRoute><CategoryCreatePage /></ProtectedRoute>} />
      <Route path="/products/categories/:id/edit" element={<ProtectedRoute><EditCategoryPage /></ProtectedRoute>} />
      {/* Order Management */}
      <Route path="/orders" element={<ProtectedRoute><OrdersIndexPage /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><OrderCreatePage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/orders/:id/edit" element={<ProtectedRoute><OrderEditPage /></ProtectedRoute>} />
      {/* Customer Management */}
      <Route path="/customers" element={<ProtectedRoute><CustomersIndexPage /></ProtectedRoute>} />
      <Route path="/customers/create" element={<ProtectedRoute><CustomerCreatePage /></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
      <Route path="/customers/:id/edit" element={<ProtectedRoute><CustomerEditPage /></ProtectedRoute>} />
      <Route path="/test/date-input" element={<ProtectedRoute><DateInputTest /></ProtectedRoute>} />
      <Route path="/test/phone-input" element={<ProtectedRoute><PhoneInputTest /></ProtectedRoute>} />
      {/* 404页面，不需要认证 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 