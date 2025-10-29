import React, { useState, useCallback, useMemo } from 'react';
import { FiBell, FiHome, FiUser, FiSave, FiRotateCcw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layout/BaseLayout';
import NotificationSettings from '../../components/notifications/NotificationSettings';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { withSeo } from '../../components/SEO/withSeo';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription } from '../../components/common/Alert';

const NotificationPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = useCallback(() => {
    setIsLoading(true);

    // Simulate save process
    setTimeout(() => {
      setIsLoading(false);
      setLastSaved(new Date());
      addToast({
        type: 'success',
        title: t('notificationPreferences.saved', 'Preferences Saved'),
        description: t('notificationPreferences.savedDescription', 'Your notification preferences have been updated successfully.'),
      });
    }, 1000);
  }, [addToast, t]);

  const handleReset = useCallback(() => {
    addToast({
      type: 'info',
      title: t('notificationPreferences.reset', 'Preferences Reset'),
      description: t('notificationPreferences.resetDescription', 'Your notification preferences have been reset to defaults.'),
    });
  }, [addToast, t]);

  const actions = [
    {
      label: t('common.reset', 'Reset'),
      onClick: handleReset,
      icon: <FiRotateCcw />,
    },
    {
      label: t('common.save', 'Save Changes'),
      onClick: handleSave,
      primary: true,
      icon: <FiSave />,
    }
  ];

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('navigation.notifications', 'Notifications'),
      href: '/notifications',
      icon: <FiBell className="h-4 w-4" />,
    },
    {
      label: t('notificationPreferences.title', 'Preferences'),
      icon: <FiUser className="h-4 w-4" />,
    },
  ]), [t]);

  const renderContent = () => {
    if (!user?.id) {
      return (
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-4 min-h-[400px] justify-center">
            <FiUser className="w-16 h-16 text-neutral-400" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {t('notificationPreferences.signInRequired', 'Sign In Required')}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
              {t('notificationPreferences.userRequired', 'Please log in to manage your notification preferences')}
            </p>
          </div>
        </Card>
      );
    }

    return (
      <NotificationSettings
        userId={user.id}
        onSave={handleSave}
      />
    );
  };

  return (
    <BaseLayout
      title={t('notificationPreferences.title', 'Notification Preferences')}
      description={t('notificationPreferences.subtitle', 'Manage your notification settings and preferences')}
      actions={user?.id ? actions : undefined}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
          {/* Last Saved Indicator */}
          {lastSaved && (
            <Alert className="border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <AlertDescription className="text-green-800 dark:text-green-200">
                {t('notificationPreferences.lastSaved', 'Last saved at')} {lastSaved.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center z-10 rounded-lg">
                <Loading />
              </div>
            )}
            {renderContent()}
        </div>
      </div>
    </BaseLayout>
  );
};

export default withSeo(NotificationPreferencesPage, {
  title: 'Notification Preferences | Admin Dashboard',
  description: 'Manage your notification settings and preferences',
  path: '/notifications/preferences',
});
