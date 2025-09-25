import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { Card, CardBody, CardHeader } from '@heroui/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Package,
  Heart,
  Bell,
  Activity,
  Clock,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfileOverviewProps {
  onSectionChange: (section: string) => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ onSectionChange }) => {
  const { user } = useAuth();
  const { getSetting } = useSettings();
  const t = useTranslations();

  const siteName = getSetting('site_name', 'Our Store');
  const memberSince = 'Unknown'; // createdAt property not available in User interface

  const stats = [
    {
      icon: <Package className="w-6 h-6" />,
      label: t('profile.overview.total_orders'),
      value: '24',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      onClick: () => onSectionChange('orders')
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: t('profile.overview.wishlist_items'),
      value: '12',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      onClick: () => onSectionChange('wishlist')
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      label: t('profile.overview.saved_cards'),
      value: '2',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      onClick: () => onSectionChange('payment')
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: t('profile.overview.saved_addresses'),
      value: '3',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      onClick: () => onSectionChange('addresses')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 shadow-xl">
        <CardBody className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
            {/* Avatar with enhanced status */}
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-2xl border-4 border-white">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {/* Enhanced status indicator */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              {/* Online status badge */}
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Online
              </div>
            </div>

            {/* User Information */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.name || t('profile.overview.guest_user')}
              </h1>
              <p className="text-blue-100 text-lg mb-4">{user?.email}</p>

              {/* Enhanced stats row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-blue-100">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('profile.overview.member_since', { date: memberSince })}
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('profile.overview.verified_account')}
                </div>
                <div className="flex items-center bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-100">Active</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            isPressable
            onPress={stat.onClick}
            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-800 overflow-hidden transform hover:-translate-y-1"
          >
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm
                  `}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('profile.overview.personal_info')}
                </h2>
              </div>
              <button
                onClick={() => onSectionChange('personal')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
              >
                {t('profile.overview.edit')}
              </button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.overview.full_name')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.name || t('profile.overview.not_provided')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.overview.email')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.overview.phone')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{t('profile.overview.not_provided')}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Preferences */}
        <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('profile.overview.preferences')}
                </h2>
              </div>
              <button
                onClick={() => onSectionChange('preferences')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
              >
                {t('profile.overview.edit')}
              </button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.overview.email_notifications')}</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t('profile.overview.enabled')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.overview.default_language')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">English</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.overview.two_factor_auth')}</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                  {t('profile.overview.disabled')}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.overview.recent_activity')}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('profile.overview.order_placed')}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-l-4 border-red-500">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('profile.overview.item_added_wishlist')}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500">5 days ago</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-l-4 border-green-500">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('profile.overview.address_added')}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};