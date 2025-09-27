'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Lock,
  Bell,
  Settings,
  CreditCard,
  MapPin,
  Heart,
  Package,
  Shield,
  Smartphone,
  Monitor,
  Grid3X3,
  LifeBuoy,
  Star
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfileSidebarProps {
  activeSection?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
  route: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeSection
}) => {
  const t = useTranslations();
  const pathname = usePathname();

  // Check if current path is a profile page
  const isProfilePage = pathname.startsWith('/profile');

  // Determine the actual active section - if no specific section is passed,
  // but we're on a profile page, default to 'overview'
  const effectiveActiveSection = activeSection || (isProfilePage ? 'overview' : '');

  const sidebarSections: SidebarSection[] = [
    {
      title: t('pages.profile.sidebar.main_section'),
      items: [
        {
          id: 'overview',
          label: t('pages.profile.sidebar.overview'),
          icon: <Grid3X3 className="w-5 h-5" />,
          description: t('pages.profile.sidebar.overview_desc'),
          route: '/profile'
        }
      ]
    },
    {
      title: t('pages.profile.sidebar.account_section'),
      items: [
        {
          id: 'personal',
          label: t('pages.profile.sidebar.personal_info'),
          icon: <User className="w-5 h-5" />,
          description: t('pages.profile.sidebar.personal_info_desc'),
          route: '/profile/edit'
        },
        {
          id: 'security',
          label: t('pages.profile.sidebar.security'),
          icon: <Shield className="w-5 h-5" />,
          description: t('pages.profile.sidebar.security_desc'),
          route: '/profile/security'
        }
      ]
    },
    {
      title: t('pages.profile.sidebar.shopping_section'),
      items: [
        {
          id: 'orders',
          label: t('pages.profile.sidebar.orders'),
          icon: <Package className="w-5 h-5" />,
          description: t('pages.profile.sidebar.orders_desc'),
          route: '/profile/orders'
        },
        {
          id: 'wishlist',
          label: t('pages.profile.sidebar.wishlist'),
          icon: <Heart className="w-5 h-5" />,
          badge: '12',
          description: t('pages.profile.sidebar.wishlist_desc'),
          route: '/profile/wishlist'
        },
        {
          id: 'loyalty',
          label: t('pages.profile.sidebar.loyalty'),
          icon: <Star className="w-5 h-5" />,
          description: t('pages.profile.sidebar.loyalty_desc'),
          route: '/profile/loyalty'
        }
      ]
    },
    {
      title: t('pages.profile.sidebar.preferences_section'),
      items: [
        {
          id: 'addresses',
          label: t('pages.profile.sidebar.addresses'),
          icon: <MapPin className="w-5 h-5" />,
          description: t('pages.profile.sidebar.addresses_desc'),
          route: '/profile/addresses'
        },
        {
          id: 'payment',
          label: t('pages.profile.sidebar.payment'),
          icon: <CreditCard className="w-5 h-5" />,
          description: t('pages.profile.sidebar.payment_desc'),
          route: '/profile/payment'
        },
        {
          id: 'notifications',
          label: t('pages.profile.sidebar.notifications'),
          icon: <Bell className="w-5 h-5" />,
          description: t('pages.profile.sidebar.notifications_desc'),
          route: '/profile/notifications'
        },
        {
          id: 'preferences',
          label: t('pages.profile.sidebar.preferences'),
          icon: <Settings className="w-5 h-5" />,
          description: t('pages.profile.sidebar.preferences_desc'),
          route: '/profile/preferences'
        }
      ]
    }
  ];

  const renderSidebarItem = (item: SidebarItem) => (
    <Link
      key={item.id}
      href={item.route}
      className={`
        w-full group relative flex items-center justify-between p-2 rounded-md transition-all duration-200
        ${effectiveActiveSection === item.id
          ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white border border-blue-700 shadow-lg'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
        }
      `}
    >
      <div className="flex items-center flex-1">
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
          ${effectiveActiveSection === item.id
            ? 'bg-blue-700 text-white shadow-md'
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600 group-hover:shadow-sm'
          }
        `}>
          {item.icon}
        </div>
        <div className="ml-2 text-left flex-1">
          <div className="flex items-center">
            <span className="text-sm font-semibold">
              {item.label}
            </span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <p className={`text-xs mt-1 hidden sm:block mb-0 ${
              activeSection === item.id
                ? 'text-blue-100'
                : 'text-gray-500'
            }`}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {effectiveActiveSection === item.id && (
        <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
      )}
    </Link>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-3 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-0">
          {t('pages.profile.sidebar.title')}
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-0">
          {t('pages.profile.sidebar.subtitle')}
        </p>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-4">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <nav className="space-y-0.5">
              {section.items.map(renderSidebarItem)}
            </nav>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 px-2">
          {t('pages.profile.sidebar.quick_actions')}
        </h3>
        <div className="space-y-0.5">
          <button className="w-full text-left p-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all duration-200 group">
            <div className="flex items-start">
              <div className="flex justify-center w-5 h-5 rounded-sm bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors mt-0.5 items-center">
                <Smartphone className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="ml-2 font-medium text-xs mt-1">{t('pages.profile.sidebar.download_app')}</span>
            </div>
          </button>
          <button className="w-full text-left p-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all duration-200 group">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-5 h-5 rounded-sm bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors mt-0.5">
                <LifeBuoy className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="ml-2 font-medium text-xs mt-1">{t('pages.profile.sidebar.help_center')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};