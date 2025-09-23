import React from 'react';
import { INavigationService } from '../interfaces/INavigationService';
import { MenuGroup, MenuItem, SubMenuItem } from '../types/MenuItem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import StorageIcon from '@mui/icons-material/Storage';
import FirebaseIcon from '@mui/icons-material/Whatshot';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import SecurityIcon from '@mui/icons-material/Security';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ViewListIcon from '@mui/icons-material/ViewList';
import CreateIcon from '@mui/icons-material/Create';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

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
        title: t('navigation.content_management', '内容管理'),
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
          },
          {
            icon: React.createElement(DescriptionIcon),
            label: t('admin.seo_management', 'SEO管理'),
            path: '/seo',
          },
          {
            icon: React.createElement(EmailIcon),
            label: t('admin.mail_templates', 'Mail Templates'),
            path: '/mail-templates',
          },
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
                icon: React.createElement(CreateIcon),
                label: t('admin.create_post', 'Create Post'),
                path: '/posts/create'
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
          }
        ]
      },
      {
        title: t('products.management', 'Product Management'),
        items: [
          {
            icon: React.createElement(ViewListIcon),
            label: t('products.title', 'Products'),
            path: '/products'
          },
          {
            icon: React.createElement(ShoppingCartIcon),
            label: t('orders.title', 'Orders'),
            path: '/orders'
          },
          {
            icon: React.createElement(PersonIcon),
            label: t('customers.title', 'Customers'),
            path: '/customers'
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
          },
        ]
      },
      {
        title: t('navigation.communication', '通信'),
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
            icon: React.createElement(LanguageIcon),
            label: t('admin.translations', '翻译'),
            path: '/translations'
          }
        ]
      },
      {
        title: t('navigation.system', '系统'),
        items: [
          {
            icon: React.createElement(PublicIcon),
            label: t('languages.languages', '语言管理'),
            path: '/languages'
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
            icon: React.createElement(PaymentIcon),
            label: t('payment_methods.title', 'Payment Methods'),
            path: '/payment-methods'
          },
          {
            icon: React.createElement(LocalShippingIcon),
            label: t('delivery_methods.title', 'Delivery Methods'),
            path: '/delivery-methods'
          },
          {
            icon: React.createElement(SettingsIcon),
            label: t('navigation.settings', '设置'),
            path: '/settings'
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
      return currentPath === '/orders' ||
             currentPath.startsWith('/orders/create') ||
             !!currentPath.match(/^\/orders\/[^\/]+$/);
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

    const exactMatchPaths = ['/users', '/roles', '/permissions', '/posts', '/settings', '/seo', '/languages', '/orders', '/customers', '/payment-methods', '/delivery-methods'];
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

  getSubItemsTotalBadge(subItems?: SubMenuItem[]): number {
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