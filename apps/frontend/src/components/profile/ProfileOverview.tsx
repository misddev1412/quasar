'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { MediaManager } from '../common/MediaManager';
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
  Settings,
  Camera
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfileOverviewProps {
  onSectionChange: (section: string) => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ onSectionChange }) => {
  const { user, updateUser } = useAuth();
  const { getSetting } = useSettings();
  const t = useTranslations();

  // Media Manager state
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  // Handle media selection from MediaManager
  const handleMediaSelect = async (media: any | any[]) => {
    const selectedMedia = Array.isArray(media) ? media[0] : media;
    if (selectedMedia && selectedMedia.url && user) {
      await updateUser({
        ...user,
        avatar: selectedMedia.url
      });
    }
    setIsMediaManagerOpen(false);
  };

  const siteName = getSetting('site_name', 'Our Store');
  // Calculate member since date (using current year as fallback since createdAt not available in User interface)
  const getMemberSince = () => {
    if (!user) return null;

    // If we had user.createdAt, we would use:
    // return new Date(user.createdAt).getFullYear();

    // For now, use current year as a reasonable display value
    // In a real app, this would come from the user's registration date
    return new Date().getFullYear().toString();
  };

  const memberSince = getMemberSince();

  const stats = [
    {
      icon: <Package className="w-6 h-6" />,
      label: t('pages.profile.overview.total_orders'),
      value: '24',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      onClick: () => onSectionChange('orders')
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: t('pages.profile.overview.wishlist_items'),
      value: '12',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      onClick: () => onSectionChange('wishlist')
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      label: t('pages.profile.overview.saved_cards'),
      value: '2',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      onClick: () => onSectionChange('payment')
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: t('pages.profile.overview.saved_addresses'),
      value: '3',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      onClick: () => onSectionChange('addresses')
    }
  ];

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card className="border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 shadow-xl">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Avatar with enhanced status */}
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => setIsMediaManagerOpen(true)}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-2xl group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-2xl border-4 border-white group-hover:from-blue-50 group-hover:to-blue-200 transition-all">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              {/* Camera overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>

              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* User Information */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white mb-0">
                {user?.name || t('pages.profile.overview.guest_user')}
              </h1>
              <p className="text-blue-100 text-lg mb-0">{user?.email}</p>

              {/* Enhanced stats row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-blue-100 mt-3">
                {memberSince && (
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                    <Calendar className="w-2.5 h-2.5 mr-1" />
                    <span className="text-blue-100">
                      {t('pages.profile.overview.member_since', { date: memberSince })}
                    </span>
                  </div>
                )}
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-md px-2 py-1">
                  <Shield className="w-2.5 h-2.5 mr-1" />
                  {t('pages.profile.overview.verified_account')}
                </div>
                </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={index}
            isPressable
            onPress={stat.onClick}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-800 overflow-hidden"
          >
            <CardBody className="p-3">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`
                    flex-shrink-0 p-2 rounded-md ${stat.bgColor} group-hover:scale-105 transition-transform duration-300 shadow-sm
                  `}>
                    <div className={`flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors text-left leading-relaxed mb-0">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight mt-1 mb-0">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Information */}
        <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-0">
                  {t('pages.profile.overview.personal_info')}
                </h2>
              </div>
              <button
                onClick={() => onSectionChange('personal')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-semibold px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
              >
                {t('pages.profile.overview.edit')}
              </button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-2">
              <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <User className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0">{t('pages.profile.overview.full_name')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0">{user?.name || t('pages.profile.overview.not_provided')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0">{t('pages.profile.overview.email')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0">{t('pages.profile.overview.phone')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0">{t('pages.profile.overview.not_provided')}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Preferences */}
        <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-md">
                  <Settings className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-0">
                  {t('pages.profile.overview.preferences')}
                </h2>
              </div>
              <button
                onClick={() => onSectionChange('preferences')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-semibold px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
              >
                {t('pages.profile.overview.edit')}
              </button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-start space-x-2">
                  <Bell className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('pages.profile.overview.email_notifications')}</span>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t('pages.profile.overview.enabled')}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('pages.profile.overview.default_language')}</span>
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">English</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-start space-x-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('pages.profile.overview.two_factor_auth')}</span>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                  {t('pages.profile.overview.disabled')}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-md">
              <Activity className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-0">
              {t('pages.profile.overview.recent_activity')}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-2">
            <div className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-4 border-blue-500">
              <div className="flex-shrink-0">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md mt-0.5">
                  <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0">{t('pages.profile.overview.order_placed')}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 mb-0">{t('pages.profile.overview.days_ago_1')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border-l-4 border-red-500">
              <div className="flex-shrink-0">
                <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md mt-0.5">
                  <Heart className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0">{t('pages.profile.overview.item_added_wishlist')}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 mb-0">{t('pages.profile.overview.days_ago_1')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border-l-4 border-green-500">
              <div className="flex-shrink-0">
                <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-md mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0">{t('pages.profile.overview.address_added')}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 mb-0">{t('pages.profile.overview.weeks_ago_1')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        accept="image/*"
        maxSize={5}
        title={t('pages.profile.overview.change_profile_picture')}
      />
    </div>
  );
};