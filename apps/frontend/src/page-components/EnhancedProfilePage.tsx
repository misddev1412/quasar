'use client';

import { useState } from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { Container } from '../components/common/Container';
import { Loading } from '../components/utility/Loading';
import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { PersonalInformation } from '../components/profile/PersonalInformation';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { useTranslations } from 'next-intl';
import {
  Lock,
  Bell,
  CreditCard,
  Package,
  Heart,
  Settings,
  Shield,
  Smartphone,
  Globe,
  Moon,
  Monitor
} from 'lucide-react';

// Placeholder components for other sections
const SecuritySettings: React.FC = () => {
  const t = useTranslations();

  return (
    <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.security.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('profile.security.subtitle')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-center py-12 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30"></div>
            <Shield className="w-20 h-20 text-green-600 dark:text-green-400 mx-auto relative" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('profile.security.coming_soon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t('profile.security.coming_soon_desc')}
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const NotificationPreferences: React.FC = () => {
  const t = useTranslations();

  return (
    <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.notifications.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('profile.notifications.subtitle')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-center py-12 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-30"></div>
            <Bell className="w-20 h-20 text-yellow-600 dark:text-yellow-400 mx-auto relative" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('profile.notifications.coming_soon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t('profile.notifications.coming_soon_desc')}
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const PaymentMethods: React.FC = () => {
  const t = useTranslations();

  return (
    <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.payment.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('profile.payment.subtitle')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-center py-12 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-xl opacity-30"></div>
            <CreditCard className="w-20 h-20 text-purple-600 dark:text-purple-400 mx-auto relative" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('profile.payment.coming_soon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t('profile.payment.coming_soon_desc')}
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Wishlist: React.FC = () => {
  const t = useTranslations();

  return (
    <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.wishlist.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('profile.wishlist.subtitle')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-center py-12 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full blur-xl opacity-30"></div>
            <Heart className="w-20 h-20 text-red-600 dark:text-red-400 mx-auto relative" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('profile.wishlist.coming_soon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t('profile.wishlist.coming_soon_desc')}
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const OrderHistory: React.FC = () => {
  const t = useTranslations();

  return (
    <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.orders.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('profile.orders.subtitle')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-center py-12 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-xl opacity-30"></div>
            <Package className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto relative" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            {t('profile.orders.coming_soon')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t('profile.orders.coming_soon_desc')}
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Coming Soon
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Preferences: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('profile.preferences.title')}
          </h2>
          <p className="text-gray-600">
            {t('profile.preferences.subtitle')}
          </p>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('profile.preferences.coming_soon')}
            </h3>
            <p className="text-gray-600">
              {t('profile.preferences.coming_soon_desc')}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('profile.preferences.language')}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Language</p>
                  <p className="text-sm text-gray-600">English (US)</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Time Zone</p>
                  <p className="text-sm text-gray-600">UTC-8 (Pacific Time)</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('profile.preferences.appearance')}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Theme</p>
                  <p className="text-sm text-gray-600">Light Mode</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Display Density</p>
                  <p className="text-sm text-gray-600">Comfortable</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const EnhancedProfilePage = () => {
  // Protect this route - requires authentication
  const { isLoading: authLoading } = useProtectedRoute({
    requireAuth: true,
  });

  const [activeSection, setActiveSection] = useState('overview');

  if (authLoading) {
    return <Loading fullScreen label="Loading profile..." />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ProfileOverview onSectionChange={setActiveSection} />;
      case 'personal':
        return <PersonalInformation onSectionChange={setActiveSection} />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationPreferences />;
      case 'addresses':
        return <PersonalInformation onSectionChange={setActiveSection} />;
      case 'payment':
        return <PaymentMethods />;
      case 'wishlist':
        return <Wishlist />;
      case 'orders':
        return <OrderHistory />;
      case 'preferences':
        return <Preferences />;
      default:
        return <ProfileOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <>
      <Container className="py-12 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Page Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    My Profile
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                    Manage your account settings, preferences, and personal information
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated recently</span>
            </div>
          </div>
        </div>

        {/* Main Layout with 2-Column Structure */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <ProfileSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default EnhancedProfilePage;