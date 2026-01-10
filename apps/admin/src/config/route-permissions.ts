import { PermissionAction, PermissionScope } from '@shared';

export interface RoutePermission {
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
}

/**
 * Mapping of routes to required permissions
 * Each route path maps to the permission required to access it
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // Home/Dashboard
  '/': { resource: 'dashboard', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // User Management
  '/users': { resource: 'user', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/users/dashboard': { resource: 'user', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/users/exports': { resource: 'user', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/users/create': { resource: 'user', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/users/:id': { resource: 'user', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Role Management
  '/roles': { resource: 'role', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/roles/create': { resource: 'role', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/roles/:id': { resource: 'role', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Permission Management
  '/permissions': { resource: 'permission', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/permissions/create': { resource: 'permission', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/permissions/:id': { resource: 'permission', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Settings
  '/settings': { resource: 'setting', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/settings/admin-branding': { resource: 'setting', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/settings/maintenance': { resource: 'setting', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/settings/orders': { resource: 'setting', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/settings/theme': { resource: 'setting', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/settings/floating-icons': { resource: 'setting', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/settings/visibility': { resource: 'setting', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // SEO
  '/seo': { resource: 'seo', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Brand Assets
  '/brand-assets': { resource: 'brand', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Analytics
  '/analytics': { resource: 'analytics', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/visitor-analytics': { resource: 'analytics', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Storage
  '/storage': { resource: 'storage', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Profile (own profile)
  '/profile': { resource: 'profile', action: PermissionAction.READ, scope: PermissionScope.OWN },
  
  // Mail Templates
  '/mail-templates': { resource: 'mail_template', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/mail-templates/create': { resource: 'mail_template', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/mail-templates/:id': { resource: 'mail_template', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Mail Providers
  '/mail-providers': { resource: 'mail_provider', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/mail-providers/create': { resource: 'mail_provider', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/mail-providers/:id/edit': { resource: 'mail_provider', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Mail Channel Priority
  '/email-flows': { resource: 'email_flow', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/email-flows/create': { resource: 'email_flow', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/email-flows/:id/edit': { resource: 'email_flow', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },

  // Mail Logs
  '/mail-logs': { resource: 'mail_log', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/mail-logs/:id': { resource: 'mail_log', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Posts
  '/posts': { resource: 'post', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/posts/create': { resource: 'post', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/posts/:id': { resource: 'post', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/posts/:id/detail': { resource: 'post', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/posts/categories': { resource: 'post_category', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/posts/tags': { resource: 'post_tag', action: PermissionAction.READ, scope: PermissionScope.ANY },

  // Services
  '/services': { resource: 'service', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/services/create': { resource: 'service', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/services/:id/edit': { resource: 'service', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Site Content
  '/site-content': { resource: 'site_content', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/site-content/create': { resource: 'site_content', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/site-content/:id/edit': { resource: 'site_content', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Languages
  '/languages': { resource: 'language', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/languages/create': { resource: 'language', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/languages/:id/edit': { resource: 'language', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },

  // Translations
  '/translations': { resource: 'translation', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/translations/create': { resource: 'translation', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/translations/:id/edit': { resource: 'translation', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Currencies
  '/currencies': { resource: 'currency', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/currencies/create': { resource: 'currency', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/currencies/:id/edit': { resource: 'currency', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Shipping Providers
  '/shipping-providers': { resource: 'shipping_provider', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/shipping-providers/create': { resource: 'shipping_provider', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/shipping-providers/:id/edit': { resource: 'shipping_provider', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Firebase Configs
  '/firebase-configs': { resource: 'firebase_config', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/firebase-configs/create': { resource: 'firebase_config', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/firebase-configs/:id': { resource: 'firebase_config', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Notifications
  '/notifications': { resource: 'notification', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/notifications/preferences': { resource: 'notification', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/notifications/event-flows': { resource: 'notification', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Telegram Configs
  '/telegram-configs': { resource: 'telegram_config', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Products
  '/products': { resource: 'product', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/exports': { resource: 'product', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/create': { resource: 'product', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/products/:id': { resource: 'product', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/:id/edit': { resource: 'product', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/products/attributes': { resource: 'product_attribute', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/brands': { resource: 'product_brand', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/suppliers': { resource: 'product_supplier', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/categories': { resource: 'product_category', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/products/categories/create': { resource: 'product_category', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/products/categories/:id/edit': { resource: 'product_category', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Warehouses
  '/warehouses': { resource: 'warehouse', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/warehouses/create': { resource: 'warehouse', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/warehouses/:id': { resource: 'warehouse', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/warehouses/locations': { resource: 'warehouse_location', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/warehouses/locations/create': { resource: 'warehouse_location', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/warehouses/locations/:id': { resource: 'warehouse_location', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Payment Methods
  '/payment-methods': { resource: 'payment_method', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Delivery Methods
  '/delivery-methods': { resource: 'delivery_method', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Transactions
  '/transactions': { resource: 'transaction', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/transactions/:id': { resource: 'transaction', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Support Clients
  '/support-clients': { resource: 'support_client', action: PermissionAction.READ, scope: PermissionScope.ANY },

  // Messages
  '/messages': { resource: 'message', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Sections
  '/sections/:page': { resource: 'section', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/sections/:page/create': { resource: 'section', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/sections/:page/:sectionId/edit': { resource: 'section', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Menus
  '/menus/:group': { resource: 'menu', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Storefront Footer
  '/storefront/checkout': { resource: 'storefront', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/storefront/footer': { resource: 'storefront', action: PermissionAction.READ, scope: PermissionScope.ANY },
  // Component Configs
  '/component-configs': { resource: 'component_config', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/component-configs/create': { resource: 'component_config', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/component-configs/:id/edit': { resource: 'component_config', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Orders
  '/orders': { resource: 'order', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/orders/exports': { resource: 'order', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/orders/new': { resource: 'order', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/orders/:id': { resource: 'order', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/orders/:id/edit': { resource: 'order', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/orders/fulfillments': { resource: 'order_fulfillment', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/orders/fulfillments/new': { resource: 'order_fulfillment', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/orders/fulfillments/:id': { resource: 'order_fulfillment', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/orders/fulfillments/:id/edit': { resource: 'order_fulfillment', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Customers
  '/customers': { resource: 'customer', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/customers/create': { resource: 'customer', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/customers/:id': { resource: 'customer', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/customers/:id/edit': { resource: 'customer', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  
  // Loyalty
  '/loyalty': { resource: 'loyalty', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/loyalty/stats': { resource: 'loyalty', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/loyalty/rewards': { resource: 'loyalty_reward', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/loyalty/rewards/create': { resource: 'loyalty_reward', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/loyalty/tiers': { resource: 'loyalty_tier', action: PermissionAction.READ, scope: PermissionScope.ANY },
  '/loyalty/tiers/create': { resource: 'loyalty_tier', action: PermissionAction.CREATE, scope: PermissionScope.ANY },
  '/loyalty/tiers/:id/edit': { resource: 'loyalty_tier', action: PermissionAction.UPDATE, scope: PermissionScope.ANY },
  '/loyalty/transactions': { resource: 'loyalty_transaction', action: PermissionAction.READ, scope: PermissionScope.ANY },
  
  // Help
  '/help': { resource: 'help', action: PermissionAction.READ, scope: PermissionScope.ANY },

  // Themes
  '/themes': { resource: 'theme', action: PermissionAction.READ, scope: PermissionScope.ANY },
};

/**
 * Get permission for a route path
 * Handles dynamic routes by matching patterns
 */
export function getRoutePermission(path: string): RoutePermission | null {
  // Try exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    // Convert pattern to regex
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    
    if (regex.test(path)) {
      return permission;
    }
  }

  // Default: require admin read permission for unknown routes
  return {
    resource: 'admin',
    action: PermissionAction.READ,
    scope: PermissionScope.ANY,
  };
}
