import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@admin/hooks/useAuth';
import useAuthVerification from '@admin/hooks/useAuthVerification';
import Home from '@admin/pages/Home';
import LoginPage from '@admin/pages/auth/login';
import ForgotPasswordPage from '@admin/pages/auth/forgot-password';
import NotFound from '@admin/pages/NotFound';
import Unauthorized from '@admin/pages/Unauthorized';
import SeoPage from '@admin/pages/seo';
import SettingsPage from '@admin/pages/settings';
// import OrderSettingsPage from '../pages/settings/orders';
import SettingsVisibilityPage from '@admin/pages/settings/visibility';
import FloatingIconsSettingsPage from '@admin/pages/settings/floating-icons';
import AdminBrandingPage from '@admin/pages/settings/admin-branding';
import ThemeSettingsPage from '@admin/pages/settings/theme';
import MaintenanceSettingsPage from '@admin/pages/settings/maintenance';
import ThemeManagementPage from '@admin/pages/themes';
import BrandAssetsPage from '@admin/pages/brand-assets';
import AnalyticsConfigurationPage from '@admin/pages/analytics';
import UserProfilePage from '@admin/pages/profile';
import UserListPage from '@admin/pages/users';
import UserDashboardPage from '@admin/pages/users/dashboard';
import UserCreatePage from '@admin/pages/users/create';
import UserUpdatePage from '@admin/pages/users/update';
import UserExportsPage from '@admin/pages/users/exports';
import RoleIndexPage from '@admin/pages/roles';
import RoleCreatePage from '@admin/pages/roles/create';
import RoleUpdatePage from '@admin/pages/roles/update';
import PermissionIndexPage from '@admin/pages/permissions';
import PermissionCreatePage from '@admin/pages/permissions/create';
import PermissionUpdatePage from '@admin/pages/permissions/update';
import MailTemplateIndexPage from '@admin/pages/mail-templates';
import MailTemplateCreatePage from '@admin/pages/mail-templates/create';
import MailTemplateEditPage from '@admin/pages/mail-templates/edit';
import MailLogsPage from '@admin/pages/mail-logs';
import MailLogDetailPage from '@admin/pages/mail-logs/[id]';
// Mail Providers
import MailProviderIndexPage from '@admin/pages/mail-providers';
import CreateMailProviderPage from '@admin/pages/mail-providers/create';
import EditMailProviderPage from '@admin/pages/mail-providers/[id]/edit';
// Mail Channel Priority
import EmailFlowIndexPage from '@admin/pages/email-flows';
import CreateEmailFlowPage from '@admin/pages/email-flows/create';
import EditEmailFlowPage from '@admin/pages/email-flows/[id]/edit';
import PostsIndexPage from '@admin/pages/posts';
import PostsCreatePage from '@admin/pages/posts/create';
import PostsEditPage from '@admin/pages/posts/edit';
import PostDetailPage from '@admin/pages/posts/detail';
import PostCategoriesPage from '@admin/pages/posts/categories';
import PostTagsPage from '@admin/pages/posts/tags';
import SiteContentIndexPage from '@admin/pages/site-content';
import SiteContentCreatePage from '@admin/pages/site-content/create';
import SiteContentEditPage from '@admin/pages/site-content/edit';
import LanguagesIndexPage from '@admin/pages/languages';
import LanguagesCreatePage from '@admin/pages/languages/create';
import LanguagesEditPage from '@admin/pages/languages/edit';
import ServiceListPage from '@admin/pages/services';
import ServiceCreatePage from '@admin/pages/services/create';
import ServiceEditPage from '@admin/pages/services/edit';
// Translation Management
import TranslationsIndexPage from '@admin/pages/translations';
import TranslationsCreatePage from '@admin/pages/translations/create';
import TranslationsEditPage from '@admin/pages/translations/edit';
// Currency Management
import CurrenciesIndexPage from '@admin/pages/currencies';
import CurrenciesCreatePage from '@admin/pages/currencies/create';
import EditCurrencyPage from '@admin/pages/currencies/[id]/edit';
import StorageConfigPage from '@admin/pages/storage';
import FirebaseConfigsPage from '@admin/pages/firebase-configs';
import CreateFirebaseConfigPage from '@admin/pages/firebase-configs/create';
import EditFirebaseConfigPage from '@admin/pages/firebase-configs/[id]';
import OpenAiConfigsPage from '@admin/pages/openai-configs';
import CreateOpenAiConfigPage from '@admin/pages/openai-configs/create';
import EditOpenAiConfigPage from '@admin/pages/openai-configs/[id]';
import NotificationsPage from '@admin/pages/notifications';
import NotificationPreferencesPage from '@admin/pages/notifications/preferences';
import NotificationEventFlowsPage from '@admin/pages/notifications/event-flows';
import TelegramConfigsPage from '@admin/pages/telegram-configs';
import ShippingProvidersIndexPage from '@admin/pages/shipping-providers';
import CreateShippingProviderPage from '@admin/pages/shipping-providers/create';
import EditShippingProviderPage from '@admin/pages/shipping-providers/[id]/edit';
// Product Management
import ProductsIndexPage from '@admin/pages/products';
import ProductExportsPage from '@admin/pages/products/exports';
import AttributesPage from '@admin/pages/products/attributes';
import BrandsPage from '@admin/pages/products/brands';
import SuppliersPage from '@admin/pages/products/suppliers';
import ProductBundleListPage from '@admin/pages/product-bundles/ProductBundleListPage';
import ProductBundleCreatePage from '@admin/pages/product-bundles/ProductBundleCreatePage';
import ProductBundleEditPage from '@admin/pages/product-bundles/ProductBundleEditPage';
// Warehouse Management
import WarehousesIndexPage from '@admin/pages/warehouses';
import WarehouseCreatePage from '@admin/pages/warehouses/create';
import WarehouseEditPage from '@admin/pages/warehouses/edit';
import WarehouseLocationsPage from '@admin/pages/warehouses/locations';
import WarehouseLocationCreatePage from '@admin/pages/warehouses/locations/create';
import WarehouseLocationEditPage from '@admin/pages/warehouses/locations/edit';
import PaymentMethodsPage from '@admin/pages/payment-methods';
import DeliveryMethodsPage from '@admin/pages/delivery-methods';
import TransactionsPage from '@admin/pages/transactions';
import TransactionDetailPage from '@admin/pages/transactions/[id]';
import SupportClientsPage from '@admin/pages/support-clients';
import ProductDetailSectionsPage from '@admin/pages/sections/product_detail';
import NewsDetailSectionsPage from '@admin/pages/sections/news_detail';
import SectionsPage from '@admin/pages/sections';
import CreateSectionPage from '@admin/pages/sections/[page]/create';
import EditSectionPage from '@admin/pages/sections/[page]/[sectionId]/edit';
import MenusPage from '@admin/pages/menus';
import HelpPage from '@admin/pages/help';
import StorefrontFooterPage from '@admin/pages/storefront/footer';
import StorefrontCheckoutSettingsPage from '@admin/pages/storefront/checkout';
import EcommerceSettingsPage from '@admin/pages/settings/ecommerce';
import ComponentConfigsPage from '@admin/pages/component-configs';
import ComponentConfigCreatePage from '@admin/pages/component-configs/create';
import ComponentConfigEditPage from '@admin/pages/component-configs/[id]/edit';
// Order Management
import OrdersIndexPage from '@admin/pages/orders';
import OrdersExportsPage from '@admin/pages/orders/exports';
import OrderCreatePage from '@admin/pages/orders/create';
import OrderEditPage from '@admin/pages/orders/edit';
import OrderDetailPage from '@admin/pages/orders/detail';
import OrderFulfillmentsPage from '@admin/pages/orders/fulfillments';
import OrderFulfillmentCreatePage from '@admin/pages/orders/fulfillments/new';
import OrderFulfillmentDetailPage from '@admin/pages/orders/fulfillments/[id]';
import OrderFulfillmentEditPage from '@admin/pages/orders/fulfillments/edit';
// Customer Management
import CustomersIndexPage from '@admin/pages/customers';
import CustomerCreatePage from '@admin/pages/customers/create';
import CustomerEditPage from '@admin/pages/customers/edit';
import CustomerDetailPage from '@admin/pages/customers/detail';
// Loyalty Management
import LoyaltyManagementPage from '@admin/pages/loyalty';
import LoyaltyStatsPage from '@admin/pages/loyalty/stats';
import LoyaltyRewardsPage from '@admin/pages/loyalty/rewards';
import CreateLoyaltyRewardPage from '@admin/pages/loyalty/rewards/create';
import LoyaltyTiersPage from '@admin/pages/loyalty/tiers';
import CreateLoyaltyTierPage from '@admin/pages/loyalty/tiers/create';
import EditLoyaltyTierPage from '@admin/pages/loyalty/tiers/[id]/edit';
import LoyaltyTransactionsPage from '@admin/pages/loyalty/transactions';
import CategoriesPage from '@admin/pages/products/categories';
import EditCategoryPage from '@admin/pages/products/categories/edit';
import CategoryCreatePage from '@admin/pages/products/categories/create';
import CreateProductPage from '@admin/pages/products/create';
import ProductDetailPage from '@admin/pages/products/[id]';
import EditProductPage from '@admin/pages/products/[id]/edit';
import DateInputTest from '@admin/pages/test/DateInputTest';
import { PhoneInputTest } from '@admin/components/test/PhoneInputTest';
import { VisitorAnalyticsPage } from '@admin/components/visitor-analytics';
import VisitorAnalyticsPageWrapper from '@admin/components/visitor-analytics/VisitorAnalyticsPageWrapper';
import AppLayout from '@admin/components/layout/AppLayout';
import { hasPermissionForRoute, isSuperAdminUser } from '@admin/utils/permission-access';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

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

  if (user && !isSuperAdminUser(user) && user.permissions === undefined) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPermissionForRoute(location.pathname, user)) {
    return (
      <AppLayout>
        <Unauthorized />
      </AppLayout>
    );
  }

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
      <Route path="/settings/maintenance" element={<ProtectedRoute><MaintenanceSettingsPage /></ProtectedRoute>} />
      {/* <Route path="/settings/orders" element={<ProtectedRoute><OrderSettingsPage /></ProtectedRoute>} /> - Moved to Ecommerce */}
      <Route path="/settings/floating-icons" element={<ProtectedRoute><FloatingIconsSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/floating-icons" element={<ProtectedRoute><FloatingIconsSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/visibility" element={<ProtectedRoute><SettingsVisibilityPage /></ProtectedRoute>} />
      <Route path="/settings/admin-branding" element={<ProtectedRoute><AdminBrandingPage /></ProtectedRoute>} />
      <Route path="/settings/ecommerce" element={<ProtectedRoute><EcommerceSettingsPage /></ProtectedRoute>} />
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
      <Route path="/openai-configs" element={<ProtectedRoute><OpenAiConfigsPage /></ProtectedRoute>} />
      <Route path="/openai-configs/create" element={<ProtectedRoute><CreateOpenAiConfigPage /></ProtectedRoute>} />
      <Route path="/openai-configs/:id" element={<ProtectedRoute><EditOpenAiConfigPage /></ProtectedRoute>} />
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
      {/* Product Bundles */}
      <Route path="/product-bundles" element={<ProtectedRoute><ProductBundleListPage /></ProtectedRoute>} />
      <Route path="/product-bundles/create" element={<ProtectedRoute><ProductBundleCreatePage /></ProtectedRoute>} />
      <Route path="/product-bundles/:id/edit" element={<ProtectedRoute><ProductBundleEditPage /></ProtectedRoute>} />
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
      <Route path="/sections/product_detail" element={<ProtectedRoute><ProductDetailSectionsPage /></ProtectedRoute>} />
      <Route path="/sections/news_detail" element={<ProtectedRoute><NewsDetailSectionsPage /></ProtectedRoute>} />
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
