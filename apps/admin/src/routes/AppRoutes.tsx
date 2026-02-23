import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@admin/hooks/useAuth';
import useAuthVerification from '@admin/hooks/useAuthVerification';
// import OrderSettingsPage from '../pages/settings/orders';
// Mail Providers
// Mail Channel Priority
// Translation Management
// Currency Management
// Product Management
// Warehouse Management
// Order Management
// Customer Management
// Loyalty Management
import AppLayout from '@admin/components/layout/AppLayout';
import { hasPermissionForRoute, isSuperAdminUser } from '@admin/utils/permission-access';

const Home = lazy(() => import(/* webpackChunkName: "admin-core" */ '@admin/pages/Home'));
const LoginPage = lazy(() => import(/* webpackChunkName: "admin-auth" */ '@admin/pages/auth/login'));
const ForgotPasswordPage = lazy(() => import(/* webpackChunkName: "admin-auth" */ '@admin/pages/auth/forgot-password'));
const NotFound = lazy(() => import(/* webpackChunkName: "admin-core" */ '@admin/pages/NotFound'));
const Unauthorized = lazy(() => import(/* webpackChunkName: "admin-core" */ '@admin/pages/Unauthorized'));
const SeoPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/seo'));
const SettingsPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings'));
const SettingsVisibilityPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings/visibility'));
const FloatingIconsSettingsPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings/floating-icons'));
const AdminBrandingPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings/admin-branding'));
const ThemeSettingsPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings/theme'));
const MaintenanceSettingsPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings/maintenance'));
const ThemeManagementPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/themes'));
const BrandAssetsPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/brand-assets'));
const AnalyticsConfigurationPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/analytics'));
const UserProfilePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/profile'));
const UserListPage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/users'));
const UserDashboardPage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/users/dashboard'));
const UserCreatePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/users/create'));
const UserUpdatePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/users/[id]/edit'));
const UserExportsPage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/users/exports'));
const RoleIndexPage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/roles'));
const RoleCreatePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/roles/create'));
const RoleUpdatePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/roles/[id]/edit'));
const PermissionIndexPage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/permissions'));
const PermissionCreatePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/permissions/create'));
const PermissionUpdatePage = lazy(() => import(/* webpackChunkName: "admin-users" */ '@admin/pages/permissions/[id]/edit'));
const MailTemplateIndexPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-templates'));
const MailTemplateCreatePage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-templates/create'));
const MailTemplateEditPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-templates/[id]/edit'));
const MailLogsPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-logs'));
const MailLogDetailPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-logs/[id]'));
const MailProviderIndexPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-providers'));
const CreateMailProviderPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-providers/create'));
const EditMailProviderPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/mail-providers/[id]/edit'));
const EmailFlowIndexPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/email-flows'));
const CreateEmailFlowPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/email-flows/create'));
const EditEmailFlowPage = lazy(() => import(/* webpackChunkName: "admin-mail" */ '@admin/pages/email-flows/[id]/edit'));
const PostsIndexPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/posts'));
const PostsCreatePage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/posts/create'));
const PostsEditPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/posts/[id]/edit'));
const PostDetailPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/posts/[id]'));
const PostCategoriesPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/posts/categories'));
const PostTagsPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/posts/tags'));
const SiteContentIndexPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/site-content'));
const SiteContentCreatePage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/site-content/create'));
const SiteContentEditPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/site-content/edit'));
const LanguagesIndexPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/languages'));
const LanguagesCreatePage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/languages/create'));
const LanguagesEditPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/languages/edit'));
const ServiceListPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/services'));
const ServiceCreatePage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/services/create'));
const ServiceEditPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/services/edit'));
const TranslationsIndexPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/translations'));
const TranslationsCreatePage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/translations/create'));
const TranslationsEditPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/translations/edit'));
const CurrenciesIndexPage = lazy(() => import(/* webpackChunkName: "admin-finance" */ '@admin/pages/currencies'));
const CurrenciesCreatePage = lazy(() => import(/* webpackChunkName: "admin-finance" */ '@admin/pages/currencies/create'));
const EditCurrencyPage = lazy(() => import(/* webpackChunkName: "admin-finance" */ '@admin/pages/currencies/[id]/edit'));
const StorageConfigPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/storage'));
const FirebaseConfigsPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/firebase-configs'));
const CreateFirebaseConfigPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/firebase-configs/create'));
const EditFirebaseConfigPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/firebase-configs/[id]/edit'));
const OpenAiConfigsPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/openai-configs'));
const PageSpeedPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/pagespeed'));
const CreateOpenAiConfigPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/openai-configs/create'));
const EditOpenAiConfigPage = lazy(() => import(/* webpackChunkName: "admin-config" */ '@admin/pages/openai-configs/[id]/edit'));
const NotificationsPage = lazy(() => import(/* webpackChunkName: "admin-notifications" */ '@admin/pages/notifications'));
const NotificationPreferencesPage = lazy(() => import(/* webpackChunkName: "admin-notifications" */ '@admin/pages/notifications/preferences'));
const NotificationEventFlowsPage = lazy(() => import(/* webpackChunkName: "admin-notifications" */ '@admin/pages/notifications/event-flows'));
const TelegramConfigsPage = lazy(() => import(/* webpackChunkName: "admin-notifications" */ '@admin/pages/telegram-configs'));
const ShippingProvidersIndexPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/shipping-providers'));
const CreateShippingProviderPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/shipping-providers/create'));
const EditShippingProviderPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/shipping-providers/[id]/edit'));
const ProductsIndexPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products'));
const ProductExportsPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/exports'));
const AttributesPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/attributes'));
const BrandsPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/brands'));
const BrandExportsPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/brands/exports'));
const SuppliersPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/suppliers'));
const ProductBundleListPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/product-bundles/ProductBundleListPage'));
const ProductBundleCreatePage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/product-bundles/ProductBundleCreatePage'));
const ProductBundleEditPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/product-bundles/ProductBundleEditPage'));
const WarehousesIndexPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/warehouses'));
const WarehouseCreatePage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/warehouses/create'));
const WarehouseEditPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/warehouses/[id]/edit'));
const WarehouseLocationsPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/warehouses/locations'));
const WarehouseLocationCreatePage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/warehouses/locations/create'));
const WarehouseLocationEditPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/warehouses/locations/edit'));
const PaymentMethodsPage = lazy(() => import(/* webpackChunkName: "admin-payments" */ '@admin/pages/payment-methods'));
const DeliveryMethodsPage = lazy(() => import(/* webpackChunkName: "admin-fulfillment" */ '@admin/pages/delivery-methods'));
const TransactionsPage = lazy(() => import(/* webpackChunkName: "admin-transactions" */ '@admin/pages/transactions'));
const TransactionDetailPage = lazy(() => import(/* webpackChunkName: "admin-transactions" */ '@admin/pages/transactions/[id]'));
const SupportClientsPage = lazy(() => import(/* webpackChunkName: "admin-customers" */ '@admin/pages/support-clients'));
const ProductDetailSectionsPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/sections/product_detail'));
const NewsDetailSectionsPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/sections/news_detail'));
const SectionsPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/sections'));
const CreateSectionPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/sections/[page]/create'));
const EditSectionPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/sections/[page]/[sectionId]/edit'));
const MenusPage = lazy(() => import(/* webpackChunkName: "admin-content" */ '@admin/pages/menus'));
const HelpPage = lazy(() => import(/* webpackChunkName: "admin-core" */ '@admin/pages/help'));
const StorefrontFooterPage = lazy(() => import(/* webpackChunkName: "admin-storefront" */ '@admin/pages/storefront/footer'));
const StorefrontCheckoutSettingsPage = lazy(() => import(/* webpackChunkName: "admin-storefront" */ '@admin/pages/storefront/checkout'));
const EcommerceSettingsPage = lazy(() => import(/* webpackChunkName: "admin-settings" */ '@admin/pages/settings/ecommerce'));
const ComponentConfigsPage = lazy(() => import(/* webpackChunkName: "admin-storefront" */ '@admin/pages/component-configs'));
const ComponentConfigCreatePage = lazy(() => import(/* webpackChunkName: "admin-storefront" */ '@admin/pages/component-configs/create'));
const ComponentConfigEditPage = lazy(() => import(/* webpackChunkName: "admin-storefront" */ '@admin/pages/component-configs/[id]/edit'));
const OrdersIndexPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders'));
const OrdersExportsPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/exports'));
const OrderCreatePage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/create'));
const OrderEditPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/[id]/edit'));
const OrderDetailPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/[id]'));
const OrderFulfillmentsPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/fulfillments'));
const OrderFulfillmentCreatePage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/fulfillments/new'));
const OrderFulfillmentDetailPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/fulfillments/[id]'));
const OrderFulfillmentEditPage = lazy(() => import(/* webpackChunkName: "admin-orders" */ '@admin/pages/orders/fulfillments/edit'));
const CustomersIndexPage = lazy(() => import(/* webpackChunkName: "admin-customers" */ '@admin/pages/customers'));
const CustomerCreatePage = lazy(() => import(/* webpackChunkName: "admin-customers" */ '@admin/pages/customers/create'));
const CustomerEditPage = lazy(() => import(/* webpackChunkName: "admin-customers" */ '@admin/pages/customers/[id]/edit'));
const CustomerDetailPage = lazy(() => import(/* webpackChunkName: "admin-customers" */ '@admin/pages/customers/[id]'));
const LoyaltyManagementPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty'));
const LoyaltyStatsPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/stats'));
const LoyaltyRewardsPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/rewards'));
const CreateLoyaltyRewardPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/rewards/create'));
const LoyaltyTiersPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/tiers'));
const CreateLoyaltyTierPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/tiers/create'));
const EditLoyaltyTierPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/tiers/[id]/edit'));
const LoyaltyTransactionsPage = lazy(() => import(/* webpackChunkName: "admin-loyalty" */ '@admin/pages/loyalty/transactions'));
const CategoriesPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/categories'));
const EditCategoryPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/categories/edit'));
const CategoryCreatePage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/categories/create'));
const CreateProductPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/create'));
const ProductDetailPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/[id]'));
const EditProductPage = lazy(() => import(/* webpackChunkName: "admin-catalog" */ '@admin/pages/products/[id]/edit'));
const VisitorAnalyticsPageWrapper = lazy(() => import(/* webpackChunkName: "admin-analytics" */ '@admin/components/visitor-analytics/VisitorAnalyticsPageWrapper'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const RouteFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

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
    <Suspense fallback={<RouteFallback />}>
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
        {/* <Route path="/settings/orders" element={<ProtectedRoute><OrderSettingsPage /></ProtectedRoute>} /> - Moved to Ecommerce */}
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
        <Route path="/users/:id/edit" element={<ProtectedRoute><UserUpdatePage /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><RoleIndexPage /></ProtectedRoute>} />
        <Route path="/roles/create" element={<ProtectedRoute><RoleCreatePage /></ProtectedRoute>} />
        <Route path="/roles/:id/edit" element={<ProtectedRoute><RoleUpdatePage /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute><PermissionIndexPage /></ProtectedRoute>} />
        <Route path="/permissions/create" element={<ProtectedRoute><PermissionCreatePage /></ProtectedRoute>} />
        <Route path="/permissions/:id/edit" element={<ProtectedRoute><PermissionUpdatePage /></ProtectedRoute>} />
        {/* Mail Templates */}
        <Route path="/mail-templates" element={<ProtectedRoute><MailTemplateIndexPage /></ProtectedRoute>} />
        <Route path="/mail-templates/create" element={<ProtectedRoute><MailTemplateCreatePage /></ProtectedRoute>} />
        <Route path="/mail-templates/:id/edit" element={<ProtectedRoute><MailTemplateEditPage /></ProtectedRoute>} />
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
        <Route path="/posts/:id/edit" element={<ProtectedRoute><PostsEditPage /></ProtectedRoute>} />
        <Route path="/posts/:id" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
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
        <Route path="/firebase-configs/:id/edit" element={<ProtectedRoute><EditFirebaseConfigPage /></ProtectedRoute>} />
        <Route path="/openai-configs" element={<ProtectedRoute><OpenAiConfigsPage /></ProtectedRoute>} />
        <Route path="/pagespeed" element={<ProtectedRoute><PageSpeedPage /></ProtectedRoute>} />
        <Route path="/openai-configs/create" element={<ProtectedRoute><CreateOpenAiConfigPage /></ProtectedRoute>} />
        <Route path="/openai-configs/:id/edit" element={<ProtectedRoute><EditOpenAiConfigPage /></ProtectedRoute>} />
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
        <Route path="/products/brands/exports" element={<ProtectedRoute><BrandExportsPage /></ProtectedRoute>} />
        <Route path="/products/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
        {/* Product Bundles */}
        <Route path="/product-bundles" element={<ProtectedRoute><ProductBundleListPage /></ProtectedRoute>} />
        <Route path="/product-bundles/create" element={<ProtectedRoute><ProductBundleCreatePage /></ProtectedRoute>} />
        <Route path="/product-bundles/:id/edit" element={<ProtectedRoute><ProductBundleEditPage /></ProtectedRoute>} />
        {/* Warehouse Management */}
        <Route path="/warehouses" element={<ProtectedRoute><WarehousesIndexPage /></ProtectedRoute>} />
        <Route path="/warehouses/create" element={<ProtectedRoute><WarehouseCreatePage /></ProtectedRoute>} />
        <Route path="/warehouses/:id/edit" element={<ProtectedRoute><WarehouseEditPage /></ProtectedRoute>} />
        <Route path="/warehouses/locations" element={<ProtectedRoute><WarehouseLocationsPage /></ProtectedRoute>} />
        <Route path="/warehouses/locations/create" element={<ProtectedRoute><WarehouseLocationCreatePage /></ProtectedRoute>} />
        <Route path="/warehouses/locations/:id/edit" element={<ProtectedRoute><WarehouseLocationEditPage /></ProtectedRoute>} />
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
        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 
