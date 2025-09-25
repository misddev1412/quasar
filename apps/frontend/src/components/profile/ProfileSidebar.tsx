import React from 'react';
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
  LifeBuoy
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeSection,
  onSectionChange
}) => {
  const t = useTranslations();

  const sidebarSections: SidebarSection[] = [
    {
      title: t('profile.sidebar.main_section'),
      items: [
        {
          id: 'overview',
          label: t('profile.sidebar.overview'),
          icon: <Grid3X3 className="w-5 h-5" />,
          description: t('profile.sidebar.overview_desc')
        }
      ]
    },
    {
      title: t('profile.sidebar.account_section'),
      items: [
        {
          id: 'personal',
          label: t('profile.sidebar.personal_info'),
          icon: <User className="w-5 h-5" />,
          description: t('profile.sidebar.personal_info_desc')
        },
        {
          id: 'security',
          label: t('profile.sidebar.security'),
          icon: <Shield className="w-5 h-5" />,
          description: t('profile.sidebar.security_desc')
        }
      ]
    },
    {
      title: t('profile.sidebar.shopping_section'),
      items: [
        {
          id: 'orders',
          label: t('profile.sidebar.orders'),
          icon: <Package className="w-5 h-5" />,
          description: t('profile.sidebar.orders_desc')
        },
        {
          id: 'wishlist',
          label: t('profile.sidebar.wishlist'),
          icon: <Heart className="w-5 h-5" />,
          badge: '12',
          description: t('profile.sidebar.wishlist_desc')
        }
      ]
    },
    {
      title: t('profile.sidebar.preferences_section'),
      items: [
        {
          id: 'addresses',
          label: t('profile.sidebar.addresses'),
          icon: <MapPin className="w-5 h-5" />,
          description: t('profile.sidebar.addresses_desc')
        },
        {
          id: 'payment',
          label: t('profile.sidebar.payment'),
          icon: <CreditCard className="w-5 h-5" />,
          description: t('profile.sidebar.payment_desc')
        },
        {
          id: 'notifications',
          label: t('profile.sidebar.notifications'),
          icon: <Bell className="w-5 h-5" />,
          description: t('profile.sidebar.notifications_desc')
        },
        {
          id: 'preferences',
          label: t('profile.sidebar.preferences'),
          icon: <Settings className="w-5 h-5" />,
          description: t('profile.sidebar.preferences_desc')
        }
      ]
    }
  ];

  const renderSidebarItem = (item: SidebarItem) => (
    <button
      key={item.id}
      onClick={() => onSectionChange(item.id)}
      className={`
        w-full group relative flex items-center justify-between p-4 rounded-xl transition-all duration-200
        ${activeSection === item.id
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
        }
      `}
    >
      <div className="flex items-center flex-1">
        <div className={`
          flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200
          ${activeSection === item.id
            ? 'bg-blue-100 text-blue-600 shadow-sm'
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600 group-hover:shadow-sm'
          }
        `}>
          {item.icon}
        </div>
        <div className="ml-4 text-left flex-1">
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
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {activeSection === item.id && (
        <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div>
      )}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('profile.sidebar.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('profile.sidebar.subtitle')}
        </p>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-8">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <nav className="space-y-2">
              {section.items.map(renderSidebarItem)}
            </nav>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
          {t('profile.sidebar.quick_actions')}
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <Smartphone className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="ml-3 font-medium">{t('profile.sidebar.download_app')}</span>
            </div>
          </button>
          <button className="w-full text-left p-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <LifeBuoy className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="ml-3 font-medium">{t('profile.sidebar.help_center')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};