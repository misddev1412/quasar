import React, { useState, useMemo } from 'react';
import { useSettings, SettingData } from '../hooks/useSettings';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { useToast } from '../context/ToastContext';
import { Toggle } from '../components/common/Toggle';
import { Button } from '../components/common/Button';
import { FiSettings, FiGlobe, FiBarChart2, FiInfo, FiCheck, FiX, FiHome } from 'react-icons/fi';
import BaseLayout from '../components/layout/BaseLayout';

interface AnalyticsConfig {
  googleAnalyticsEnabled: boolean;
  googleAnalyticsId: string;
  mixpanelEnabled: boolean;
  mixpanelToken: string;
  mixpanelApiHost: string;
  trackAdminActions: boolean;
  anonymizeIp: boolean;
}

const AnalyticsConfiguration: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const { groupedSettings, updateSetting, createSetting, isLoading } = useSettings();

  const [config, setConfig] = useState<AnalyticsConfig>({
    googleAnalyticsEnabled: false,
    googleAnalyticsId: '',
    mixpanelEnabled: false,
    mixpanelToken: '',
    mixpanelApiHost: 'api.mixpanel.com',
    trackAdminActions: false,
    anonymizeIp: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState<{
    googleAnalytics?: { success: boolean; message: string };
    mixpanel?: { success: boolean; message: string };
  }>({});

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('analytics.title', 'Analytics'),
      icon: <FiBarChart2 className="w-4 h-4" />,
    },
  ]), [t]);

  // Load settings when they become available
  React.useEffect(() => {
    if (groupedSettings && groupedSettings.analytics) {
      const analyticsSettings = groupedSettings.analytics;
      const newConfig: AnalyticsConfig = {
        googleAnalyticsEnabled: analyticsSettings.find(s => s.key === 'analytics.google_analytics_enabled')?.value === 'true',
        googleAnalyticsId: analyticsSettings.find(s => s.key === 'analytics.google_analytics_id')?.value || '',
        mixpanelEnabled: analyticsSettings.find(s => s.key === 'analytics.mixpanel_enabled')?.value === 'true',
        mixpanelToken: analyticsSettings.find(s => s.key === 'analytics.mixpanel_token')?.value || '',
        mixpanelApiHost: analyticsSettings.find(s => s.key === 'analytics.mixpanel_api_host')?.value || 'api.mixpanel.com',
        trackAdminActions: analyticsSettings.find(s => s.key === 'analytics.track_admin_actions')?.value === 'true',
        anonymizeIp: analyticsSettings.find(s => s.key === 'analytics.anonymize_ip')?.value === 'true',
      };
      setConfig(newConfig);
    }
  }, [groupedSettings]);

  const updateConfigValue = (key: keyof AnalyticsConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToUpdate = [
        { key: 'analytics.google_analytics_enabled', value: config.googleAnalyticsEnabled.toString() },
        { key: 'analytics.google_analytics_id', value: config.googleAnalyticsId },
        { key: 'analytics.mixpanel_enabled', value: config.mixpanelEnabled.toString() },
        { key: 'analytics.mixpanel_token', value: config.mixpanelToken },
        { key: 'analytics.mixpanel_api_host', value: config.mixpanelApiHost },
        { key: 'analytics.track_admin_actions', value: config.trackAdminActions.toString() },
        { key: 'analytics.anonymize_ip', value: config.anonymizeIp.toString() },
      ];

      for (const setting of settingsToUpdate) {
        const existingSetting = groupedSettings?.analytics?.find(s => s.key === setting.key);

        if (existingSetting) {
          await updateSetting(existingSetting.id, { value: setting.value });
        } else {
          await createSetting({
            ...setting,
            type: typeof setting.value === 'boolean' ? 'boolean' : 'string',
            group: 'analytics',
            isPublic: false,
            description: `Analytics setting: ${setting.key}`,
          });
        }
      }

      addToast({
        type: 'success',
        title: t('analytics.save_success', 'Settings saved successfully'),
        description: t('analytics.save_success_description', 'Analytics configuration has been updated.'),
      });
    } catch (error) {
      console.error('Failed to save analytics settings:', error);
      addToast({
        type: 'error',
        title: t('analytics.save_failed', 'Failed to save settings'),
        description: t('analytics.save_failed_description', 'Could not update analytics configuration.'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testGoogleAnalytics = async () => {
    if (!config.googleAnalyticsId) {
      setTestResults(prev => ({
        ...prev,
        googleAnalytics: {
          success: false,
          message: t('analytics.ga_id_required', 'Google Analytics ID is required'),
        },
      }));
      return;
    }

    // Simple validation check for GA4 ID format
    const ga4Regex = /^G-[A-Z0-9]+$/;
    const isValid = ga4Regex.test(config.googleAnalyticsId);

    setTestResults(prev => ({
      ...prev,
      googleAnalytics: {
        success: isValid,
        message: isValid
          ? t('analytics.ga_valid_format', 'Valid Google Analytics 4 ID format')
          : t('analytics.ga_invalid_format', 'Invalid Google Analytics 4 ID format. Should be G-XXXXXXXXXX'),
      },
    }));
  };

  const testMixpanel = async () => {
    if (!config.mixpanelToken) {
      setTestResults(prev => ({
        ...prev,
        mixpanel: {
          success: false,
          message: t('analytics.mixpanel_token_required', 'Mixpanel token is required'),
        },
      }));
      return;
    }

    // Simple validation check for Mixpanel token format
    const tokenRegex = /^[a-f0-9]{32}$/;
    const isValid = tokenRegex.test(config.mixpanelToken);

    setTestResults(prev => ({
      ...prev,
      mixpanel: {
        success: isValid,
        message: isValid
          ? t('analytics.mixpanel_valid_format', 'Valid Mixpanel token format')
          : t('analytics.mixpanel_invalid_format', 'Invalid Mixpanel token format. Should be 32-character hex string'),
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BaseLayout
      title={t('analytics.title', 'Analytics Configuration')}
      description={t('analytics.description', 'Configure Google Analytics and Mixpanel for tracking user behavior and analytics')}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="w-6 h-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics.title', 'Analytics Configuration')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('analytics.description', 'Configure Google Analytics and Mixpanel for tracking user behavior and analytics. These settings help you understand user engagement and improve your application.')}
          </p>
        </div>

        {/* Google Analytics Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <FiGlobe className="w-5 h-5 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('analytics.google_analytics', 'Google Analytics')}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Toggle
                  checked={config.googleAnalyticsEnabled}
                  onChange={(checked) => updateConfigValue('googleAnalyticsEnabled', checked)}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('analytics.enable_google_analytics', 'Enable Google Analytics')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('analytics.enable_google_analytics_desc', 'Track user interactions with Google Analytics 4')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testGoogleAnalytics}
                disabled={!config.googleAnalyticsEnabled}
              >
                {t('analytics.test_connection', 'Test')}
              </Button>
            </div>

            {testResults.googleAnalytics && (
              <div className={`flex items-center p-3 rounded-lg ${
                testResults.googleAnalytics.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}>
                {testResults.googleAnalytics.success ? (
                  <FiCheck className="w-4 h-4 mr-2" />
                ) : (
                  <FiX className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm">{testResults.googleAnalytics.message}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('analytics.ga_measurement_id', 'Measurement ID')}
              </label>
              <input
                type="text"
                value={config.googleAnalyticsId}
                onChange={(e) => updateConfigValue('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={!config.googleAnalyticsEnabled}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('analytics.ga_measurement_id_desc', 'Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX)')}
              </p>
            </div>
          </div>
        </div>

        {/* Mixpanel Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="w-5 h-5 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('analytics.mixpanel', 'Mixpanel')}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Toggle
                  checked={config.mixpanelEnabled}
                  onChange={(checked) => updateConfigValue('mixpanelEnabled', checked)}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('analytics.enable_mixpanel', 'Enable Mixpanel')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('analytics.enable_mixpanel_desc', 'Track events and user behavior with Mixpanel')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testMixpanel}
                disabled={!config.mixpanelEnabled}
              >
                {t('analytics.test_connection', 'Test')}
              </Button>
            </div>

            {testResults.mixpanel && (
              <div className={`flex items-center p-3 rounded-lg ${
                testResults.mixpanel.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}>
                {testResults.mixpanel.success ? (
                  <FiCheck className="w-4 h-4 mr-2" />
                ) : (
                  <FiX className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm">{testResults.mixpanel.message}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('analytics.mixpanel_token', 'Project Token')}
              </label>
              <input
                type="text"
                value={config.mixpanelToken}
                onChange={(e) => updateConfigValue('mixpanelToken', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={!config.mixpanelEnabled}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('analytics.mixpanel_token_desc', 'Your Mixpanel project token (32-character hex string)')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('analytics.mixpanel_api_host', 'API Host')}
              </label>
              <input
                type="text"
                value={config.mixpanelApiHost}
                onChange={(e) => updateConfigValue('mixpanelApiHost', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={!config.mixpanelEnabled}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('analytics.mixpanel_api_host_desc', 'Custom API host for Mixpanel (default: api.mixpanel.com)')}
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <FiSettings className="w-5 h-5 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('analytics.advanced_settings', 'Advanced Settings')}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Toggle
                  checked={config.trackAdminActions}
                  onChange={(checked) => updateConfigValue('trackAdminActions', checked)}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('analytics.track_admin_actions', 'Track Admin Actions')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('analytics.track_admin_actions_desc', 'Include admin panel interactions in analytics tracking')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Toggle
                  checked={config.anonymizeIp}
                  onChange={(checked) => updateConfigValue('anonymizeIp', checked)}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('analytics.anonymize_ip', 'Anonymize IP Addresses')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('analytics.anonymize_ip_desc', 'Remove last octet from IP addresses before sending to analytics services')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                {t('analytics.privacy_notice', 'Privacy Notice')}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('analytics.privacy_notice_desc', 'Ensure you comply with privacy regulations like GDPR and CCPA. Inform users about data collection in your privacy policy and provide opt-out options where required.')}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
          >
            {t('common.save', 'Save Settings')}
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AnalyticsConfiguration;
