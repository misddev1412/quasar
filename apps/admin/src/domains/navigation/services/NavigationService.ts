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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PackageIcon from '@mui/icons-material/Inventory';
import ImageIcon from '@mui/icons-material/Image';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MenuIcon from '@mui/icons-material/Menu';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarehouseIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PolicyIcon from '@mui/icons-material/Policy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export class NavigationService implements INavigationService {
  constructor(private translate: (key: string, fallback?: string) => string) {}

  getMenuGroups(): MenuGroup[] {
    const { t } = { t: this.translate };

    return [
      {
        title: t('navigation.overview', '概览'),
        items: [
          {
            icon: React.createElement(DashboardIcon),
            label: t('navigation.dashboard', '仪表盘'),
            path: '/'
          }
        ]
      },
      {
        title: t('navigation.people_access', 'Người dùng & Quyền'),
        items: [
          {
            icon: React.createElement(PeopleIcon),
            label: t('admin.user_management', '用户管理'),
            path: '/users-management',
            badge: 2,
            subItems: [
              {
                icon: React.createElement(PermIdentityIcon),
                label: t('admin.user_list', '用户列表'),
                path: '/users',
                badge: 2
              },
              {
                icon: React.createElement(ManageAccountsIcon),
                label: t('admin.manage_roles', '角色管理'),
                path: '/roles'
              },
              {
                icon: React.createElement(SecurityIcon),
                label: t('admin.manage_permissions', '权限设置'),
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
            icon: React.createElement(MenuIcon),
            label: t('admin.menus', 'Menu Management'),
            path: '/menus/main'
          },
          {
            icon: React.createElement(DescriptionIcon),
            label: t('admin.seo_management', 'SEO管理'),
            path: '/seo'
          },
          {
            icon: React.createElement(EmailIcon),
            label: t('admin.mail_templates', 'Mail Templates'),
            path: '/mail-templates'
          },
          {
            icon: React.createElement(LanguageIcon),
            label: t('admin.translations', '翻译'),
            path: '/translations'
          }
        ]
      },
      {
        title: t('navigation.commerce', 'Sản phẩm & Danh mục'),
        items: [
          {
            icon: React.createElement(ViewListIcon),
            label: t('products.title', 'Products'),
            path: '/products'
          },
          {
            icon: React.createElement(BrandingWatermarkIcon),
            label: t('brands.title', 'Brands'),
            path: '/products/brands'
          },
          {
            icon: React.createElement(CategoryIcon),
            label: t('categories.title', 'Categories'),
            path: '/products/categories'
          },
          {
            icon: React.createElement(TuneIcon),
            label: t('attributes.title', 'Attributes'),
            path: '/products/attributes'
          },
          {
            icon: React.createElement(BusinessIcon),
            label: t('suppliers.title', 'Suppliers'),
            path: '/products/suppliers'
          }
        ]
      },
      {
        title: t('navigation.sales_operations', 'Bán hàng & Vận hành'),
        items: [
          {
            icon: React.createElement(ShoppingCartIcon),
            label: t('orders.title', 'Orders'),
            path: '/orders'
          },
          {
            icon: React.createElement(PackageIcon),
            label: t('fulfillments.title', 'Order Fulfillments'),
            path: '/orders/fulfillments'
          },
          {
            icon: React.createElement(PersonIcon),
            label: t('customers.title', 'Customers'),
            path: '/customers'
          },
          {
            icon: React.createElement(WarehouseIcon),
            label: t('warehouses.title', 'Warehouses'),
            path: '/warehouses',
            subItems: [
              {
                icon: React.createElement(WarehouseIcon),
                label: t('warehouses.title', 'Warehouses'),
                path: '/warehouses'
              },
              {
                icon: React.createElement(LocationOnIcon),
                label: t('warehouse_locations.title', 'Warehouse Locations'),
                path: '/warehouses/locations'
              }
            ]
          },
          {
            icon: React.createElement(PaymentIcon),
            label: t('payment_methods.title', 'Payment Methods'),
            path: '/payment-methods'
          },
          {
            icon: React.createElement(LocalShippingIcon),
            label: t('delivery_methods.title', 'Delivery Methods'),
            path: '/delivery-methods'
          }
        ]
      },
      {
        title: t('navigation.communication_support', 'Liên lạc & Hỗ trợ'),
        items: [
          {
            icon: React.createElement(NotificationsIcon),
            label: t('navigation.notifications', '通知'),
            path: '/notifications',
            badge: 5
          },
          {
            icon: React.createElement(ChatIcon),
            label: t('navigation.messages', '消息'),
            path: '/messages',
            badge: 3
          },
          {
            icon: React.createElement(SupportAgentIcon),
            label: t('support_clients.title', 'Support Clients'),
            path: '/support-clients'
          }
        ]
      },
      {
        title: t('navigation.platform_settings', 'Thiết lập hệ thống'),
        items: [
          {
            icon: React.createElement(PublicIcon),
            label: t('languages.languages', '语言管理'),
            path: '/languages'
          },
          {
            icon: React.createElement(AttachMoneyIcon),
            label: t('currencies.currencies', '货币管理'),
            path: '/currencies'
          },
          {
            icon: React.createElement(StorageIcon),
            label: t('navigation.storage', 'Storage Configuration'),
            path: '/storage'
          },
          {
            icon: React.createElement(FirebaseIcon),
            label: t('navigation.firebase_configs', 'Firebase Configurations'),
            path: '/firebase-configs'
          },
          {
            icon: React.createElement(ImageIcon),
            label: t('brand.assets_title', 'Brand Assets'),
            path: '/brand-assets'
          },
          {
            icon: React.createElement(AnalyticsIcon),
            label: t('analytics.title', 'Analytics'),
            path: '/analytics'
          },
          {
            icon: React.createElement(SettingsIcon),
            label: t('navigation.settings', 'Settings'),
            path: '/settings-management',
            subItems: [
              {
                icon: React.createElement(TuneIcon),
                label: t('navigation.general_settings', 'General Settings'),
                path: '/settings'
              },
              {
                icon: React.createElement(FlashOnIcon),
                label: t('floating_icons.navigation', 'Floating Icons'),
                path: '/settings/floating-icons'
              },
              {
                icon: React.createElement(PublicIcon),
                label: t('navigation.settings_visibility', 'Settings Visibility'),
                path: '/settings/visibility'
              }
            ]
          },
          {
            icon: React.createElement(HelpIcon),
            label: t('navigation.help', '帮助'),
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

    // Products sub-pages should only match exactly or their own sub-paths
    if (path.startsWith('/products/') && path !== '/products') {
      return currentPath === path || currentPath.startsWith(path + '/');
    }

    const exactMatchPaths = ['/users', '/roles', '/permissions', '/posts', '/settings', '/settings/floating-icons', '/settings/visibility', '/seo', '/languages', '/currencies', '/orders', '/orders/fulfillments', '/customers', '/payment-methods', '/delivery-methods', '/support-clients', '/brand-assets', '/analytics', '/warehouses', '/warehouses/locations'];
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
