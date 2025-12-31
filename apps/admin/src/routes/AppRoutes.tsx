import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useAuthVerification from '../hooks/useAuthVerification';
import Home from '../pages/Home';
import LoginPage from '../pages/auth/login';
import ForgotPasswordPage from '../pages/auth/forgot-password';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import SeoPage from '../pages/seo';
import SettingsPage from '../pages/settings';
import OrderSettingsPage from '../pages/settings/orders';
import SettingsVisibilityPage from '../pages/settings/visibility';
import FloatingIconsSettingsPage from '../pages/settings/floating-icons';
import AdminBrandingPage from '../pages/settings/admin-branding';
import ThemeSettingsPage from '../pages/settings/theme';
import MaintenanceSettingsPage from '../pages/settings/maintenance';
import ThemeManagementPage from '../pages/themes';
import BrandAssetsPage from '../pages/brand-assets';
import AnalyticsConfigurationPage from '../pages/analytics';
import UserProfilePage from '../pages/profile';
import UserListPage from '../pages/users';
import UserDashboardPage from '../pages/users/dashboard';
import UserCreatePage from '../pages/users/create';
import UserUpdatePage from '../pages/users/update';
import UserExportsPage from '../pages/users/exports';
import RoleIndexPage from '../pages/roles';
import RoleCreatePage from '../pages/roles/create';
import RoleUpdatePage from '../pages/roles/update';
import PermissionIndexPage from '../pages/permissions';
import PermissionCreatePage from '../pages/permissions/create';
import PermissionUpdatePage from '../pages/permissions/update';
import MailTemplateIndexPage from '../pages/mail-templates';
import MailTemplateCreatePage from '../pages/mail-templates/create';
import MailTemplateEditPage from '../pages/mail-templates/edit';
import MailLogsPage from '../pages/mail-logs';
import MailLogDetailPage from '../pages/mail-logs/[id]';
// Mail Providers
import MailProviderIndexPage from '../pages/mail-providers';
import CreateMailProviderPage from '../pages/mail-providers/create';
import EditMailProviderPage from '../pages/mail-providers/[id]/edit';
// Mail Channel Priority
import EmailFlowIndexPage from '../pages/email-flows';
import CreateEmailFlowPage from '../pages/email-flows/create';
import EditEmailFlowPage from '../pages/email-flows/[id]/edit';
import PostsIndexPage from '../pages/posts';
import PostsCreatePage from '../pages/posts/create';
import PostsEditPage from '../pages/posts/edit';
import PostDetailPage from '../pages/posts/detail';
import PostCategoriesPage from '../pages/posts/categories';
import PostTagsPage from '../pages/posts/tags';
import SiteContentIndexPage from '../pages/site-content';
import SiteContentCreatePage from '../pages/site-content/create';
import SiteContentEditPage from '../pages/site-content/edit';
import LanguagesIndexPage from '../pages/languages';
import LanguagesCreatePage from '../pages/languages/create';
import LanguagesEditPage from '../pages/languages/edit';
import ServiceListPage from '../pages/services';
import ServiceCreatePage from '../pages/services/create';
import ServiceEditPage from '../pages/services/edit';
// Translation Management
import TranslationsIndexPage from '../pages/translations';
import TranslationsCreatePage from '../pages/translations/create';
import TranslationsEditPage from '../pages/translations/edit';
// Currency Management
import CurrenciesIndexPage from '../pages/currencies';
import CurrenciesCreatePage from '../pages/currencies/create';
import EditCurrencyPage from '../pages/currencies/[id]/edit';
import StorageConfigPage from '../pages/storage';
import FirebaseConfigsPage from '../pages/firebase-configs';
import CreateFirebaseConfigPage from '../pages/firebase-configs/create';
import EditFirebaseConfigPage from '../pages/firebase-configs/[id]';
import NotificationsPage from '../pages/notifications';
import NotificationPreferencesPage from '../pages/notifications/preferences';
import NotificationEventFlowsPage from '../pages/notifications/event-flows';
import TelegramConfigsPage from '../pages/telegram-configs';
import ShippingProvidersIndexPage from '../pages/shipping-providers';
import CreateShippingProviderPage from '../pages/shipping-providers/create';
import EditShippingProviderPage from '../pages/shipping-providers/[id]/edit';
// Product Management
import ProductsIndexPage from '../pages/products';
import ProductExportsPage from '../pages/products/exports';
import AttributesPage from '../pages/products/attributes';
import BrandsPage from '../pages/products/brands';
import SuppliersPage from '../pages/products/suppliers';
// Warehouse Management
import WarehousesIndexPage from '../pages/warehouses';
import WarehouseCreatePage from '../pages/warehouses/create';
import WarehouseEditPage from '../pages/warehouses/edit';
import WarehouseLocationsPage from '../pages/warehouses/locations';
import WarehouseLocationCreatePage from '../pages/warehouses/locations/create';
import WarehouseLocationEditPage from '../pages/warehouses/locations/edit';
import PaymentMethodsPage from '../pages/payment-methods';
import DeliveryMethodsPage from '../pages/delivery-methods';
import TransactionsPage from '../pages/transactions';
import TransactionDetailPage from '../pages/transactions/[id]';
import SupportClientsPage from '../pages/support-clients';
import SectionsPage from '../pages/sections';
import CreateSectionPage from '../pages/sections/[page]/create';
import EditSectionPage from '../pages/sections/[page]/[sectionId]/edit';
import MenusPage from '../pages/menus';
import HelpPage from '../pages/help';
import StorefrontFooterPage from '../pages/storefront/footer';
import StorefrontCheckoutSettingsPage from '../pages/storefront/checkout';
import ComponentConfigsPage from '../pages/component-configs';
import ComponentConfigCreatePage from '../pages/component-configs/create';
import ComponentConfigEditPage from '../pages/component-configs/[id]/edit';
// Order Management
import OrdersIndexPage from '../pages/orders';
import OrdersExportsPage from '../pages/orders/exports';
import OrderCreatePage from '../pages/orders/create';
import OrderEditPage from '../pages/orders/edit';
import OrderDetailPage from '../pages/orders/detail';
import OrderFulfillmentsPage from '../pages/orders/fulfillments';
import OrderFulfillmentCreatePage from '../pages/orders/fulfillments/new';
import OrderFulfillmentDetailPage from '../pages/orders/fulfillments/[id]';
import OrderFulfillmentEditPage from '../pages/orders/fulfillments/edit';
// Customer Management
import CustomersIndexPage from '../pages/customers';
import CustomerCreatePage from '../pages/customers/create';
import CustomerEditPage from '../pages/customers/edit';
import CustomerDetailPage from '../pages/customers/detail';
// Loyalty Management
import LoyaltyManagementPage from '../pages/loyalty';
import LoyaltyStatsPage from '../pages/loyalty/stats';
import LoyaltyRewardsPage from '../pages/loyalty/rewards';
import CreateLoyaltyRewardPage from '../pages/loyalty/rewards/create';
import LoyaltyTiersPage from '../pages/loyalty/tiers';
import CreateLoyaltyTierPage from '../pages/loyalty/tiers/create';
import EditLoyaltyTierPage from '../pages/loyalty/tiers/[id]/edit';
import LoyaltyTransactionsPage from '../pages/loyalty/transactions';
import CategoriesPage from '../pages/products/categories';
import EditCategoryPage from '../pages/products/categories/edit';
import CategoryCreatePage from '../pages/products/categories/create';
import CreateProductPage from '../pages/products/create';
import ProductDetailPage from '../pages/products/[id]';
import EditProductPage from '../pages/products/[id]/edit';
import DateInputTest from '../pages/test/DateInputTest';
import { PhoneInputTest } from '../components/test/PhoneInputTest';
import { VisitorAnalyticsPage } from '../components/visitor-analytics';
import VisitorAnalyticsPageWrapper from '../components/visitor-analytics/VisitorAnalyticsPageWrapper';
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

  // Check authentication only - backend will handle permission checks via API
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Let backend API handle permission checks - if API returns 403, error link will redirect to /unauthorized
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Pages */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      {/* Protected Pages */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/seo" element={<ProtectedRoute><SeoPage /></ProtectedRoute>} />
      <Route path="/brand-assets" element={<ProtectedRoute><BrandAssetsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsConfigurationPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/settings/maintenance" element={<ProtectedRoute><MaintenanceSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/orders" element={<ProtectedRoute><OrderSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/floating-icons" element={<ProtectedRoute><FloatingIconsSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/visibility" element={<ProtectedRoute><SettingsVisibilityPage /></ProtectedRoute>} />
      <Route path="/settings/admin-branding" element={<ProtectedRoute><AdminBrandingPage /></ProtectedRoute>} />
      <Route path="/settings/theme" element={<ProtectedRoute><ThemeSettingsPage /></ProtectedRoute>} />
      <Route path="/themes" element={<ProtectedRoute><ThemeManagementPage /></ProtectedRoute>} />
      <Route path="/storage" element={<ProtectedRoute><StorageConfigPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      <Route path="/users/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
      <Route path="/users/exports" element={<ProtectedRoute><UserExportsPage /></ProtectedRoute>} />
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
      <Route path="/mail-logs" element={<ProtectedRoute><MailLogsPage /></ProtectedRoute>} />
      <Route path="/mail-logs/:id" element={<ProtectedRoute><MailLogDetailPage /></ProtectedRoute>} />
      {/* Mail Providers */}
      <Route path="/mail-providers" element={<ProtectedRoute><MailProviderIndexPage /></ProtectedRoute>} />
      <Route path="/mail-providers/create" element={<ProtectedRoute><CreateMailProviderPage /></ProtectedRoute>} />
      <Route path="/mail-providers/:id/edit" element={<ProtectedRoute><EditMailProviderPage /></ProtectedRoute>} />
      {/* Mail Channel Priority */}
      <Route path="/email-flows" element={<ProtectedRoute><EmailFlowIndexPage /></ProtectedRoute>} />
      <Route path="/email-flows/create" element={<ProtectedRoute><CreateEmailFlowPage /></ProtectedRoute>} />
      <Route path="/email-flows/:id/edit" element={<ProtectedRoute><EditEmailFlowPage /></ProtectedRoute>} />
      {/* Posts */}
      <Route path="/posts" element={<ProtectedRoute><PostsIndexPage /></ProtectedRoute>} />
      <Route path="/posts/create" element={<ProtectedRoute><PostsCreatePage /></ProtectedRoute>} />
      <Route path="/posts/:id" element={<ProtectedRoute><PostsEditPage /></ProtectedRoute>} />
      <Route path="/posts/:id/detail" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
      <Route path="/posts/categories" element={<ProtectedRoute><PostCategoriesPage /></ProtectedRoute>} />
      <Route path="/posts/tags" element={<ProtectedRoute><PostTagsPage /></ProtectedRoute>} />
      <Route path="/site-content" element={<ProtectedRoute><SiteContentIndexPage /></ProtectedRoute>} />
      <Route path="/site-content/create" element={<ProtectedRoute><SiteContentCreatePage /></ProtectedRoute>} />
      <Route path="/site-content/:id/edit" element={<ProtectedRoute><SiteContentEditPage /></ProtectedRoute>} />
      {/* Languages */}
      <Route path="/languages" element={<ProtectedRoute><LanguagesIndexPage /></ProtectedRoute>} />
      <Route path="/languages/create" element={<ProtectedRoute><LanguagesCreatePage /></ProtectedRoute>} />
      <Route path="/languages/:id/edit" element={<ProtectedRoute><LanguagesEditPage /></ProtectedRoute>} />
      {/* Services */}
      <Route path="/services" element={<ProtectedRoute><ServiceListPage /></ProtectedRoute>} />
      <Route path="/services/create" element={<ProtectedRoute><ServiceCreatePage /></ProtectedRoute>} />
      <Route path="/services/:id/edit" element={<ProtectedRoute><ServiceEditPage /></ProtectedRoute>} />
      {/* Translations */}
      <Route path="/translations" element={<ProtectedRoute><TranslationsIndexPage /></ProtectedRoute>} />
      <Route path="/translations/create" element={<ProtectedRoute><TranslationsCreatePage /></ProtectedRoute>} />
      <Route path="/translations/:id/edit" element={<ProtectedRoute><TranslationsEditPage /></ProtectedRoute>} />
      {/* Currencies */}
      <Route path="/currencies" element={<ProtectedRoute><CurrenciesIndexPage /></ProtectedRoute>} />
      <Route path="/currencies/create" element={<ProtectedRoute><CurrenciesCreatePage /></ProtectedRoute>} />
      <Route path="/currencies/:id/edit" element={<ProtectedRoute><EditCurrencyPage /></ProtectedRoute>} />
      {/* Shipping Providers */}
      <Route path="/shipping-providers" element={<ProtectedRoute><ShippingProvidersIndexPage /></ProtectedRoute>} />
      <Route path="/shipping-providers/create" element={<ProtectedRoute><CreateShippingProviderPage /></ProtectedRoute>} />
      <Route path="/shipping-providers/:id/edit" element={<ProtectedRoute><EditShippingProviderPage /></ProtectedRoute>} />
      {/* Firebase Configurations */}
      <Route path="/firebase-configs" element={<ProtectedRoute><FirebaseConfigsPage /></ProtectedRoute>} />
      <Route path="/firebase-configs/create" element={<ProtectedRoute><CreateFirebaseConfigPage /></ProtectedRoute>} />
      <Route path="/firebase-configs/:id" element={<ProtectedRoute><EditFirebaseConfigPage /></ProtectedRoute>} />
      {/* Notifications */}
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/notifications/preferences" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />
      <Route path="/notifications/event-flows" element={<ProtectedRoute><NotificationEventFlowsPage /></ProtectedRoute>} />
      {/* Telegram Configs */}
      <Route path="/telegram-configs" element={<ProtectedRoute><TelegramConfigsPage /></ProtectedRoute>} />
      {/* Product Management */}
      <Route path="/products" element={<ProtectedRoute><ProductsIndexPage /></ProtectedRoute>} />
      <Route path="/products/exports" element={<ProtectedRoute><ProductExportsPage /></ProtectedRoute>} />
      <Route path="/products/create" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><EditProductPage /></ProtectedRoute>} />
      <Route path="/products/attributes" element={<ProtectedRoute><AttributesPage /></ProtectedRoute>} />
      <Route path="/products/brands" element={<ProtectedRoute><BrandsPage /></ProtectedRoute>} />
      <Route path="/products/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
      {/* Warehouse Management */}
      <Route path="/warehouses" element={<ProtectedRoute><WarehousesIndexPage /></ProtectedRoute>} />
      <Route path="/warehouses/create" element={<ProtectedRoute><WarehouseCreatePage /></ProtectedRoute>} />
      <Route path="/warehouses/:id" element={<ProtectedRoute><WarehouseEditPage /></ProtectedRoute>} />
      <Route path="/warehouses/locations" element={<ProtectedRoute><WarehouseLocationsPage /></ProtectedRoute>} />
      <Route path="/warehouses/locations/create" element={<ProtectedRoute><WarehouseLocationCreatePage /></ProtectedRoute>} />
      <Route path="/warehouses/locations/:id" element={<ProtectedRoute><WarehouseLocationEditPage /></ProtectedRoute>} />
      <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetailPage /></ProtectedRoute>} />
      <Route path="/delivery-methods" element={<ProtectedRoute><DeliveryMethodsPage /></ProtectedRoute>} />
      <Route path="/support-clients" element={<ProtectedRoute><SupportClientsPage /></ProtectedRoute>} />
      <Route path="/visitor-analytics" element={<ProtectedRoute><VisitorAnalyticsPageWrapper /></ProtectedRoute>} />
      <Route path="/sections" element={<Navigate to="/sections/home" replace />} />
      <Route path="/sections/:page" element={<ProtectedRoute><SectionsPage /></ProtectedRoute>} />
      <Route path="/sections/:page/create" element={<ProtectedRoute><CreateSectionPage /></ProtectedRoute>} />
      <Route path="/sections/:page/:sectionId/edit" element={<ProtectedRoute><EditSectionPage /></ProtectedRoute>} />
      <Route path="/menus" element={<Navigate to="/menus/main" replace />} />
      <Route path="/menus/:group" element={<ProtectedRoute><MenusPage /></ProtectedRoute>} />
      <Route path="/component-configs" element={<ProtectedRoute><ComponentConfigsPage /></ProtectedRoute>} />
      <Route path="/component-configs/create" element={<ProtectedRoute><ComponentConfigCreatePage /></ProtectedRoute>} />
      <Route path="/component-configs/:id/edit" element={<ProtectedRoute><ComponentConfigEditPage /></ProtectedRoute>} />
      <Route path="/storefront/checkout" element={<ProtectedRoute><StorefrontCheckoutSettingsPage /></ProtectedRoute>} />
      <Route path="/storefront/footer" element={<ProtectedRoute><StorefrontFooterPage /></ProtectedRoute>} />
      <Route path="/products/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/products/categories/create" element={<ProtectedRoute><CategoryCreatePage /></ProtectedRoute>} />
      <Route path="/products/categories/:id/edit" element={<ProtectedRoute><EditCategoryPage /></ProtectedRoute>} />
      {/* Order Management */}
      <Route path="/orders" element={<ProtectedRoute><OrdersIndexPage /></ProtectedRoute>} />
      <Route path="/orders/exports" element={<ProtectedRoute><OrdersExportsPage /></ProtectedRoute>} />
      <Route path="/orders/new" element={<ProtectedRoute><OrderCreatePage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/orders/:id/edit" element={<ProtectedRoute><OrderEditPage /></ProtectedRoute>} />
      <Route path="/orders/fulfillments" element={<ProtectedRoute><OrderFulfillmentsPage /></ProtectedRoute>} />
      <Route path="/orders/fulfillments/new" element={<ProtectedRoute><OrderFulfillmentCreatePage /></ProtectedRoute>} />
      <Route path="/orders/fulfillments/:id" element={<ProtectedRoute><OrderFulfillmentDetailPage /></ProtectedRoute>} />
      <Route path="/orders/fulfillments/:id/edit" element={<ProtectedRoute><OrderFulfillmentEditPage /></ProtectedRoute>} />
      {/* Customer Management */}
      <Route path="/customers" element={<ProtectedRoute><CustomersIndexPage /></ProtectedRoute>} />
      <Route path="/customers/create" element={<ProtectedRoute><CustomerCreatePage /></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
      <Route path="/customers/:id/edit" element={<ProtectedRoute><CustomerEditPage /></ProtectedRoute>} />
      {/* Loyalty Management */}
      <Route path="/loyalty" element={<ProtectedRoute><LoyaltyManagementPage /></ProtectedRoute>} />
      <Route path="/loyalty/stats" element={<ProtectedRoute><LoyaltyStatsPage /></ProtectedRoute>} />
      <Route path="/loyalty/rewards" element={<ProtectedRoute><LoyaltyRewardsPage /></ProtectedRoute>} />
      <Route path="/loyalty/rewards/create" element={<ProtectedRoute><CreateLoyaltyRewardPage /></ProtectedRoute>} />
      <Route path="/loyalty/tiers" element={<ProtectedRoute><LoyaltyTiersPage /></ProtectedRoute>} />
      <Route path="/loyalty/tiers/create" element={<ProtectedRoute><CreateLoyaltyTierPage /></ProtectedRoute>} />
      <Route path="/loyalty/tiers/:id/edit" element={<ProtectedRoute><EditLoyaltyTierPage /></ProtectedRoute>} />
      <Route path="/loyalty/transactions" element={<ProtectedRoute><LoyaltyTransactionsPage /></ProtectedRoute>} />
      <Route path="/test/date-input" element={<ProtectedRoute><DateInputTest /></ProtectedRoute>} />
      <Route path="/test/phone-input" element={<ProtectedRoute><PhoneInputTest /></ProtectedRoute>} />
      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 
