import React from 'react';
import { INavigationService } from '../interfaces/INavigationService';
import { MenuGroup, MenuItem } from '../types/MenuItem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import StorageIcon from '@mui/icons-material/Storage';
import FirebaseIcon from '@mui/icons-material/Whatshot';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ViewListIcon from '@mui/icons-material/ViewList';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import PackageIcon from '@mui/icons-material/Inventory';
import ImageIcon from '@mui/icons-material/Image';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MenuIcon from '@mui/icons-material/Menu';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarehouseIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PolicyIcon from '@mui/icons-material/Policy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LoyaltyIcon from '@mui/icons-material/CardMembership';
import StarsIcon from '@mui/icons-material/Stars';
import RedeemIcon from '@mui/icons-material/Redeem';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BuildIcon from '@mui/icons-material/Build';

export class NavigationService implements INavigationService {
  constructor(private translate: (key: string, fallback?: string) => string) { }

  getMenuGroups(): MenuGroup[] {
    const { t } = { t: this.translate };

    return [
      {
        title: t('navigation.overview'),
        items: [
          {
            icon: React.createElement(DashboardIcon),
            label: t('navigation.dashboard'),
            path: '/'
          },
          {
            icon: React.createElement(AnalyticsIcon),
            label: t('admin.user_dashboard', 'User Dashboard'),
            path: '/users/dashboard'
          }
        ]
      },
      {
        title: t('navigation.people_access', 'Người dùng & Quyền'),
        items: [
          {
            icon: React.createElement(PeopleIcon),
            label: t('admin.user_management'),
            path: '/users-management',
            badge: 2,
            subItems: [
              {
                icon: React.createElement(PermIdentityIcon),
                label: t('admin.user_list'),
                path: '/users',
                badge: 2
              },
              {
                icon: React.createElement(ManageAccountsIcon),
                label: t('admin.manage_roles'),
                path: '/roles'
              },
              {
                icon: React.createElement(SecurityIcon),
                label: t('admin.manage_permissions'),
                path: '/permissions'
              }
            ]
          }
        ]
      },
      {
        title: t('navigation.content_experience', 'Nội dung & Marketing'),
        items: [
          {
            icon: React.createElement(ArticleIcon),
            label: t('admin.posts_management', 'Posts Management'),
            path: '/posts-management',
            subItems: [
              {
                icon: React.createElement(ViewListIcon),
                label: t('admin.posts_list', 'Posts List'),
                path: '/posts'
              },
              {
                icon: React.createElement(CategoryIcon),
                label: t('admin.categories', 'Categories'),
                path: '/posts/categories'
              },
              {
                icon: React.createElement(LocalOfferIcon),
                label: t('admin.tags', 'Tags'),
                path: '/posts/tags'
              }
            ]
          },
          {
            icon: React.createElement(PolicyIcon),
            label: t('siteContent.navigation.title', 'Site Content'),
            path: '/site-content',
            subItems: [
              {
                icon: React.createElement(ViewListIcon),
                label: t('siteContent.navigation.list', 'All Pages'),
                path: '/site-content'
              }
            ]
          },
          {
            icon: React.createElement(ViewQuiltIcon),
            label: t('admin.sections', 'Sections'),
            path: '/sections/home'
          },
          {
            icon: React.createElement(AccountTreeIcon),
            label: t('componentConfigs.navigation', 'Component Library'),
            path: '/component-configs',
          },
          {
            icon: React.createElement(MenuIcon),
            label: t('admin.menus', 'Menu Management'),
            path: '/menus/main'
          },
          {
            icon: React.createElement(ViewQuiltIcon),
            label: t('storefront.checkout.nav', 'Checkout storefront'),
            path: '/storefront/checkout'
          },
          {
            icon: React.createElement(ViewQuiltIcon),
            label: t('storefront.footer.nav', 'Footer Builder'),
            path: '/storefront/footer'
          },
          {
            icon: React.createElement(DescriptionIcon),
            label: t('admin.seo_management', 'Quản lý SEO'),
            path: '/seo'
          },
          {
            icon: React.createElement(LanguageIcon),
            label: t('admin.translations', 'Bản dịch'),
            path: '/translations'
          }
        ]
      },
      {
        title: t('navigation.commerce', 'Sản phẩm & Danh mục'),
        items: [
          {
            icon: React.createElement(ViewListIcon),
            label: t('products.title', 'Sản phẩm'),
            path: '/products'
          },
          {
            icon: React.createElement(BrandingWatermarkIcon),
            label: t('brands.title', 'Thương hiệu'),
            path: '/products/brands'
          },
          {
            icon: React.createElement(CategoryIcon),
            label: t('categories.title', 'Danh mục'),
            path: '/products/categories'
          },
          {
            icon: React.createElement(TuneIcon),
            label: t('attributes.title', 'Thuộc tính'),
            path: '/products/attributes'
          },
          {
            icon: React.createElement(BusinessIcon),
            label: t('suppliers.title', 'Nhà cung cấp'),
            path: '/products/suppliers'
          }
        ]
      },
      {
        title: t('loyalty.navigation.title', 'Chương trình khách hàng thân thiết'),
        items: [
          {
            icon: React.createElement(LoyaltyIcon),
            label: t('loyalty.navigation.overview', 'Tổng quan'),
            path: '/loyalty',
            subItems: [
              {
                icon: React.createElement(TimelineIcon),
                label: t('loyalty.navigation.dashboard', 'Bảng điều khiển'),
                path: '/loyalty/stats'
              }
            ]
          },
          {
            icon: React.createElement(StarsIcon),
            label: t('loyalty.navigation.tiers', 'Hạng thành viên'),
            path: '/loyalty/tiers'
          },
          {
            icon: React.createElement(RedeemIcon),
            label: t('loyalty.navigation.rewards', 'Phần thưởng'),
            path: '/loyalty/rewards'
          },
          {
            icon: React.createElement(TimelineIcon),
            label: t('loyalty.navigation.transactions', 'Giao dịch'),
            path: '/loyalty/transactions'
          }
        ]
      },
      {
        title: t('navigation.sales_operations', 'Bán hàng & Vận hành'),
        items: [
          {
            icon: React.createElement(ShoppingCartIcon),
            label: t('orders.title', 'Đơn hàng'),
            path: '/orders'
          },
          {
            icon: React.createElement(PackageIcon),
            label: t('fulfillments.title', 'Xử lý đơn hàng'),
            path: '/orders/fulfillments'
          },
          {
            icon: React.createElement(PersonIcon),
            label: t('customers.title', 'Khách hàng'),
            path: '/customers'
          },
          {
            icon: React.createElement(WarehouseIcon),
            label: t('warehouses.title', 'Kho hàng'),
            path: '/warehouses',
            subItems: [
              {
                icon: React.createElement(WarehouseIcon),
                label: t('warehouses.title', 'Kho hàng'),
                path: '/warehouses'
              },
              {
                icon: React.createElement(LocationOnIcon),
                label: t('warehouse_locations.title', 'Vị trí kho hàng'),
                path: '/warehouses/locations'
              }
            ]
          },
          {
            icon: React.createElement(PaymentIcon),
            label: t('payment_methods.title', 'Phương thức thanh toán'),
            path: '/payment-methods'
          },
          {
            icon: React.createElement(AccountBalanceWalletIcon),
            label: t('transactions.title', 'Giao dịch'),
            path: '/transactions'
          },
          {
            icon: React.createElement(LocalShippingIcon),
            label: t('delivery_methods.title', 'Phương thức giao hàng'),
            path: '/delivery-methods'
          }
        ]
      },
      {
        title: t('navigation.mail_management', 'Quản lý Email'),
        items: [
          {
            icon: React.createElement(EmailIcon),
            label: t('admin.mail_templates', 'Mẫu Email'),
            path: '/mail-templates'
          },
          {
            icon: React.createElement(CloudQueueIcon),
            label: t('admin.mail_providers', 'Mail Providers'),
            path: '/mail-providers'
          },
          {
            icon: React.createElement(AccountTreeIcon),
            label: t('admin.email_flows', 'Mail Channel Priority'),
            path: '/email-flows'
          },
          {
            icon: React.createElement(MailOutlineIcon),
            label: t('mail_logs.title', 'Mail Logs'),
            path: '/mail-logs'
          }
        ]
      },
      {
        title: t('navigation.communication_support', 'Liên lạc & Hỗ trợ'),
        items: [
          {
            icon: React.createElement(NotificationsIcon),
            label: t('navigation.notifications'),
            path: '/notifications',
            badge: 5
          },
          {
            icon: React.createElement(AccountTreeIcon),
            label: t('navigation.notification_flows', 'Notification Flows'),
            path: '/notifications/event-flows'
          },
          {
            icon: React.createElement(SendIcon),
            label: t('admin.telegram_configs', 'Cấu hình Telegram'),
            path: '/telegram-configs'
          },
          {
            icon: React.createElement(ChatIcon),
            label: t('navigation.messages'),
            path: '/messages',
            badge: 3
          },
          {
            icon: React.createElement(SupportAgentIcon),
            label: t('support_clients.title', 'Hỗ trợ khách hàng'),
            path: '/support-clients'
          },
          {
            icon: React.createElement(AnalyticsIcon),
            label: t('visitor_analytics.title', 'Thống kê người truy cập'),
            path: '/visitor-analytics'
          }
        ]
      },
      {
        title: t('navigation.platform_settings', 'Thiết lập hệ thống'),
        items: [
          {
            icon: React.createElement(PublicIcon),
            label: t('languages.languages'),
            path: '/languages'
          },
          {
            icon: React.createElement(AttachMoneyIcon),
            label: t('currencies.currencies'),
            path: '/currencies'
          },
          {
            icon: React.createElement(LocalShippingIcon),
            label: t('shippingProviders.shippingProviders'),
            path: '/shipping-providers'
          },
          {
            icon: React.createElement(StorageIcon),
            label: t('navigation.storage', 'Cấu hình lưu trữ'),
            path: '/storage'
          },
          {
            icon: React.createElement(FirebaseIcon),
            label: t('navigation.firebase_configs', 'Cấu hình Firebase'),
            path: '/firebase-configs'
          },
          {
            icon: React.createElement(ImageIcon),
            label: t('brand.assets_title', 'Tài sản thương hiệu'),
            path: '/brand-assets'
          },
          {
            icon: React.createElement(AnalyticsIcon),
            label: t('analytics.title', 'Phân tích'),
            path: '/analytics'
          },
          {
            icon: React.createElement(SettingsIcon),
            label: t('navigation.settings', 'Cài đặt'),
            path: '/settings-management',
            subItems: [
              {
                icon: React.createElement(TuneIcon),
                label: t('navigation.general_settings', 'Cài đặt chung'),
                path: '/settings'
              },
              {
                icon: React.createElement(BrandingWatermarkIcon),
                label: t('settings.branding.nav', 'Giao diện Admin'),
                path: '/settings/admin-branding'
              },
              {
                icon: React.createElement(TuneIcon),
                label: t('navigation.theme_settings', 'Cấu hình giao diện'),
                path: '/settings/theme' // Using a distinctive path, but reusing /settings page logic potentially or navigating to preference tab
              },
              {
                icon: React.createElement(BuildIcon),
                label: t('navigation.maintenance_settings', 'Maintenance Mode'),
                path: '/settings/maintenance'
              },
              {
                icon: React.createElement(ShoppingCartIcon),
                label: t('navigation.order_settings', 'Cài đặt đơn hàng'),
                path: '/settings/orders'
              },
              {
                icon: React.createElement(FlashOnIcon),
                label: t('floating_icons.navigation', 'Biểu tượng nổi'),
                path: '/settings/floating-icons'
              },
              {
                icon: React.createElement(PublicIcon),
                label: t('navigation.settings_visibility', 'Hiển thị cài đặt'),
                path: '/settings/visibility'
              }
            ]
          },
          {
            icon: React.createElement(HelpIcon),
            label: t('navigation.help', 'Trợ giúp'),
            path: '/help'
          }
        ]
      }
    ];

  }

  isActiveRoute(path: string, currentPath: string): boolean {
    if (path === '/') {
      return currentPath === '/';
    }

    if (path.endsWith('-management')) {
      return currentPath === path;
    }

    // Special handling for products - main /products should match edit/create but not sub-categories
    if (path === '/products') {
      return currentPath === '/products' ||
        currentPath.startsWith('/products/create') ||
        !!currentPath.match(/^\/products\/[^\/]+\/edit$/);
    }

    // Special handling for orders - main /orders should match detail/edit/create
    if (path === '/orders') {
      if (currentPath.startsWith('/orders/fulfillments')) {
        return false;
      }

      return currentPath === '/orders' ||
        currentPath.startsWith('/orders/create') ||
        !!currentPath.match(/^\/orders\/[^\/]+$/);
    }

    if (path === '/orders/fulfillments') {
      return currentPath === '/orders/fulfillments' ||
        currentPath.startsWith('/orders/fulfillments/new') ||
        !!currentPath.match(/^\/orders\/fulfillments\/[^\/]+/);
    }

    // Special handling for warehouses - main /warehouses should match detail/edit/create
    if (path === '/warehouses') {
      if (currentPath.startsWith('/warehouses/locations')) {
        return false;
      }

      return currentPath === '/warehouses' ||
        currentPath.startsWith('/warehouses/create') ||
        !!currentPath.match(/^\/warehouses\/[^\/]+$/);
    }

    if (path === '/warehouses/locations') {
      return currentPath === '/warehouses/locations' ||
        currentPath.startsWith('/warehouses/locations/create') ||
        !!currentPath.match(/^\/warehouses\/locations\/[^\/]+/);
    }

    // Special handling for customers - main /customers should match detail/edit/create
    if (path === '/customers') {
      return currentPath === '/customers' ||
        currentPath.startsWith('/customers/create') ||
        !!currentPath.match(/^\/customers\/[^\/]+$/);
    }

    // Special handling for shipping providers - main /shipping-providers should match detail/edit/create
    if (path === '/shipping-providers') {
      return currentPath === '/shipping-providers' ||
        currentPath.startsWith('/shipping-providers/create') ||
        !!currentPath.match(/^\/shipping-providers\/[^\/]+$/);
    }

    // Products sub-pages should only match exactly or their own sub-paths
    if (path.startsWith('/products/') && path !== '/products') {
      return currentPath === path || currentPath.startsWith(path + '/');
    }

    // Special handling for mail-templates - main /mail-templates should match detail/edit/create and sub-items
    if (path === '/mail-templates') {
      return currentPath === '/mail-templates' ||
        currentPath.startsWith('/mail-templates/create') ||
        !!currentPath.match(/^\/mail-templates\/[^\/]+\/edit$/);
    }

    // Special handling for mail-providers - main /mail-providers should match detail/edit/create
    if (path === '/mail-providers') {
      return currentPath === '/mail-providers' ||
        currentPath.startsWith('/mail-providers/create') ||
        !!currentPath.match(/^\/mail-providers\/[^\/]+\/edit$/);
    }

    // Special handling for email-flows - main /email-flows should match detail/edit/create
    if (path === '/email-flows') {
      return currentPath === '/email-flows' ||
        currentPath.startsWith('/email-flows/create') ||
        !!currentPath.match(/^\/email-flows\/[^\/]+\/edit$/);
    }

    // Special handling for notifications - main /notifications should not match /notifications/event-flows
    if (path === '/notifications') {
      if (currentPath.startsWith('/notifications/event-flows')) {
        return false;
      }
      return currentPath === '/notifications' ||
        currentPath.startsWith('/notifications/preferences');
    }

    if (path === '/notifications/event-flows') {
      return currentPath === '/notifications/event-flows' ||
        currentPath.startsWith('/notifications/event-flows/');
    }

    const exactMatchPaths = ['/users', '/roles', '/permissions', '/posts', '/settings', '/settings/maintenance', '/settings/orders', '/settings/theme', '/settings/floating-icons', '/settings/visibility', '/seo', '/languages', '/currencies', '/shipping-providers', '/orders', '/orders/fulfillments', '/customers', '/payment-methods', '/transactions', '/delivery-methods', '/support-clients', '/brand-assets', '/analytics', '/visitor-analytics', '/warehouses', '/warehouses/locations', '/loyalty', '/loyalty/tiers', '/loyalty/rewards', '/loyalty/transactions', '/loyalty/stats'];
    if (exactMatchPaths.includes(path)) {
      return currentPath === path;
    }

    if (path.includes('/') && path !== '/') {
      return currentPath === path || currentPath.startsWith(path + '/');
    }

    return currentPath.startsWith(path);
  }

  isSubmenuExpanded(item: MenuItem, collapseState: Record<string, boolean>, currentPath: string): boolean {
    if (!item.subItems) return false;

    const manualState = collapseState[item.path];
    if (manualState !== undefined) {
      return manualState;
    }

    return item.subItems.some(subItem => this.isActiveRoute(subItem.path, currentPath));
  }

  getSubItemsTotalBadge(subItems?: MenuItem[]): number {
    if (!subItems) return 0;
    return subItems.reduce((total, subItem) => total + (subItem.badge || 0), 0);
  }

  toggleSubMenu(item: MenuItem, currentState: Record<string, boolean>): Record<string, boolean> {
    const isExpanded = this.isSubmenuExpanded(item, currentState, '');
    return {
      ...currentState,
      [item.path]: !isExpanded
    };
  }
}
