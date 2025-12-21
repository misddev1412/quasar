import React, { useEffect, useMemo, useState } from 'react';
import { withSeo } from '../../components/SEO/withSeo';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FiHome, FiSettings, FiTool, FiShield } from 'react-icons/fi';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { Toggle } from '../../components/common/Toggle';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

const MAINTENANCE_ENABLED_KEY = 'storefront.maintenance_enabled';
const MAINTENANCE_MESSAGE_KEY = 'storefront.maintenance_message';
const MAINTENANCE_PASSWORD_KEY = 'storefront.maintenance_password';

type MaintenanceSettingKey =
  | typeof MAINTENANCE_ENABLED_KEY
  | typeof MAINTENANCE_MESSAGE_KEY
  | typeof MAINTENANCE_PASSWORD_KEY;

const MaintenanceSettingsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const {
    settings,
    isLoading,
    updateSetting,
    createSetting
  } = useSettings({ group: 'storefront' });

  const maintenanceEnabled = settings.find((setting) => setting.key === MAINTENANCE_ENABLED_KEY);
  const maintenanceMessage = settings.find((setting) => setting.key === MAINTENANCE_MESSAGE_KEY);
  const maintenancePassword = settings.find((setting) => setting.key === MAINTENANCE_PASSWORD_KEY);

  const [messageValue, setMessageValue] = useState('');
  const [isMessageDirty, setIsMessageDirty] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [isToggleSaving, setIsToggleSaving] = useState(false);
  const [isMessageSaving, setIsMessageSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const maintenanceEnabledValue = maintenanceEnabled?.value === 'true';
  const passwordConfigured = Boolean(maintenancePassword?.value);

  useEffect(() => {
    setMessageValue(maintenanceMessage?.value || '');
    setIsMessageDirty(false);
  }, [maintenanceMessage?.value]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('navigation.settings', 'Settings'),
      href: '/settings',
      icon: <FiSettings className="w-4 h-4" />,
    },
    {
      label: t('navigation.maintenance_settings', 'Maintenance Mode'),
      icon: <FiTool className="w-4 h-4" />,
    },
  ]), [t]);

  const upsertSetting = async (
    key: MaintenanceSettingKey,
    value: string,
    type: SettingData['type'],
    descriptionFallback: string,
    existingSetting?: SettingData,
  ) => {
    const description = t(`settings.descriptions.${key}`, descriptionFallback);

    if (existingSetting?.id) {
      await updateSetting(existingSetting.id, { value });
      return;
    }

    await createSetting({
      key,
      value,
      type,
      group: 'storefront',
      isPublic: false,
      description,
    });
  };

  const handleToggleMaintenance = async () => {
    const nextValue = maintenanceEnabledValue ? 'false' : 'true';
    setIsToggleSaving(true);

    try {
      await upsertSetting(
        MAINTENANCE_ENABLED_KEY,
        nextValue,
        'boolean',
        t('settings.descriptions.storefront.maintenance_enabled', 'Require visitors to enter a password before they can browse the storefront.'),
        maintenanceEnabled,
      );
      addToast({
        type: 'success',
        title: t('common.saved', 'Saved'),
        description: maintenanceEnabledValue
          ? t('settings.maintenance.toasts.disabled', 'Maintenance page is no longer displayed.')
          : t('settings.maintenance.toasts.enabled', 'Maintenance page is now visible to visitors.'),
      });
    } catch (error) {
      console.error('Failed to toggle maintenance mode', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('settings.maintenance.toasts.toggleFailed', 'Could not update maintenance status.'),
      });
    } finally {
      setIsToggleSaving(false);
    }
  };

  const handleSaveMessage = async () => {
    if (!isMessageDirty) return;

    setIsMessageSaving(true);
    try {
      await upsertSetting(
        MAINTENANCE_MESSAGE_KEY,
        messageValue,
        'string',
        t('settings.descriptions.storefront.maintenance_message', 'Short message shown on the maintenance screen.'),
        maintenanceMessage,
      );
      setIsMessageDirty(false);
      addToast({
        type: 'success',
        title: t('common.saved', 'Saved'),
        description: t('settings.maintenance.toasts.messageSaved', 'Maintenance message updated.'),
      });
    } catch (error) {
      console.error('Failed to save maintenance message', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('settings.maintenance.toasts.messageFailed', 'Could not update maintenance message.'),
      });
    } finally {
      setIsMessageSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordValue.trim()) {
      addToast({
        type: 'warning',
        title: t('common.warning', 'Warning'),
        description: t('settings.maintenance.toasts.passwordRequired', 'Enter a password before saving.'),
      });
      return;
    }

    setIsPasswordSaving(true);
    try {
      await upsertSetting(
        MAINTENANCE_PASSWORD_KEY,
        passwordValue.trim(),
        'string',
        t('settings.descriptions.storefront.maintenance_password', 'Password needed to bypass the maintenance screen.'),
        maintenancePassword,
      );
      setPasswordValue('');
      addToast({
        type: 'success',
        title: t('common.saved', 'Saved'),
        description: t('settings.maintenance.toasts.passwordSaved', 'Maintenance password updated.'),
      });
    } catch (error) {
      console.error('Failed to save maintenance password', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('settings.maintenance.toasts.passwordFailed', 'Could not update maintenance password.'),
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (isLoading && settings.length === 0) {
    return (
      <BaseLayout
        title={t('settings.maintenance.title', 'Maintenance Mode')}
        description={t('settings.maintenance.description', 'Control the storefront maintenance experience.')}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('settings.maintenance.title', 'Maintenance Mode')}
      description={t('settings.maintenance.description', 'Control the storefront maintenance experience.')}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FiShield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('settings.maintenance.status.heading', 'Maintenance status')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.maintenance.status.description', 'When enabled, shoppers must enter the password before accessing storefront pages.')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={maintenanceEnabledValue ? 'warning' : 'secondary'}>
                {maintenanceEnabledValue
                  ? t('settings.maintenance.status.enabled', 'Maintenance mode enabled')
                  : t('settings.maintenance.status.disabled', 'Maintenance mode disabled')}
              </Badge>
              <span className="text-sm text-gray-500">
                {maintenanceEnabledValue
                  ? t('settings.maintenance.status.enabledHint', 'Visitors see the maintenance screen until they enter the password.')
                  : t('settings.maintenance.status.disabledHint', 'Customers browse the storefront normally.')}
              </span>
            </div>
            <Toggle
              checked={maintenanceEnabledValue}
              onChange={handleToggleMaintenance}
              disabled={isToggleSaving}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('settings.maintenance.message.heading', 'Maintenance message')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.maintenance.message.description', 'Displayed below the logo on the maintenance screen. Keep it short and informative.')}
              </p>
            </div>
            <textarea
              value={messageValue}
              onChange={(event) => {
                setMessageValue(event.target.value);
                setIsMessageDirty(true);
              }}
              rows={4}
              className="block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder={t('settings.maintenance.message.placeholder', 'We are temporarily down for maintenance. Please check back soon.')}
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveMessage}
                isLoading={isMessageSaving}
                disabled={!isMessageDirty || isMessageSaving}
              >
                {t('common.save', 'Save')}
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('settings.maintenance.password.heading', 'Maintenance password')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.maintenance.password.description', 'Share this password with teammates or QA to bypass the maintenance wall.')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={passwordConfigured ? 'success' : 'secondary'}>
                {passwordConfigured
                  ? t('settings.maintenance.password.configured', 'Password configured')
                  : t('settings.maintenance.password.notConfigured', 'No password set')}
              </Badge>
            </div>
            <input
              type="password"
              value={passwordValue}
              onChange={(event) => setPasswordValue(event.target.value)}
              className="block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              placeholder={t('settings.maintenance.password.placeholder', 'Enter new maintenance password')}
            />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {t('settings.maintenance.password.hint', 'Leave blank to keep the existing password unchanged.')}
              </span>
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSavePassword}
                isLoading={isPasswordSaving}
                disabled={isPasswordSaving}
              >
                {t('settings.maintenance.password.saveAction', 'Update password')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default withSeo(MaintenanceSettingsPage, {
  title: 'Maintenance Mode | Quasar Admin',
  description: 'Manage the storefront maintenance screen settings.',
  path: '/settings/maintenance',
});
