import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiInfo } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { SupportClientType, WidgetPosition, WidgetTheme, SupportClient } from '@shared/types/support-client';

interface SupportClientFormData extends Omit<SupportClient, 'id' | 'createdAt' | 'updatedAt'> {}

interface EditSupportClientModalProps {
  isOpen: boolean;
  client: SupportClient;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditSupportClientModal: React.FC<EditSupportClientModalProps> = ({
  isOpen,
  client,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<SupportClientFormData>({
    name: '',
    type: SupportClientType.MESSENGER,
    description: '',
    isActive: true,
    isDefault: false,
    configuration: {},
    widgetSettings: {},
    iconUrl: '',
    targetAudience: {},
    scheduleEnabled: false,
    scheduleStart: undefined,
    scheduleEnd: undefined,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { data: types } = trpc.adminSupportClients.getTypes.useQuery();
  const { data: positions } = trpc.adminSupportClients.getWidgetPositions.useQuery();
  const { data: themes } = trpc.adminSupportClients.getWidgetThemes.useQuery();

  const typesData = types as any;
  const positionsData = positions as any;
  const themesData = themes as any;

  const updateMutation = trpc.adminSupportClients.update.useMutation({
    onSuccess: () => {
      addToast({
        title: t('common.success'),
        description: t('support_clients.update_success'),
        type: 'success'
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: t('common.error'),
        description: error.message || t('support_clients.update_error'),
        type: 'error'
      });
    },
  });

  const validateMutation = trpc.adminSupportClients.validateConfiguration.useMutation({
    onSuccess: (result) => {
      if (!(result as any)?.data?.isValid) {
        setValidationErrors((result as any)?.data?.errors || []);
      } else {
        setValidationErrors([]);
      }
    },
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        type: client.type,
        description: client.description || '',
        isActive: client.isActive,
        isDefault: client.isDefault,
        configuration: client.configuration,
        widgetSettings: client.widgetSettings,
        iconUrl: client.iconUrl || '',
        targetAudience: client.targetAudience || {},
        scheduleEnabled: client.scheduleEnabled,
        scheduleStart: client.scheduleStart,
        scheduleEnd: client.scheduleEnd,
        sortOrder: client.sortOrder,
      });
    }
  }, [client]);

  useEffect(() => {
    if (formData.type && formData.configuration) {
      validateMutation.mutate({
        type: formData.type,
        configuration: formData.configuration,
      });
    }
  }, [formData.type, formData.configuration]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('support_clients.form.name_required');
    }

    if (!formData.type) {
      newErrors.type = t('support_clients.form.type_required');
    }

    if (formData.scheduleEnabled && formData.scheduleStart && formData.scheduleEnd) {
      if (formData.scheduleStart >= formData.scheduleEnd) {
        newErrors.scheduleEnd = t('support_clients.form.end_date_after_start');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (validationErrors.length > 0) {
      addToast({
        title: t('common.validation_error'),
        description: t('support_clients.form.configuration_errors'),
        type: 'error'
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: client.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
          configuration: formData.configuration,
          widgetSettings: formData.widgetSettings,
          iconUrl: formData.iconUrl.trim() || undefined,
          targetAudience: formData.targetAudience,
          scheduleEnabled: formData.scheduleEnabled,
          scheduleStart: formData.scheduleStart,
          scheduleEnd: formData.scheduleEnd,
          sortOrder: formData.sortOrder,
        },
      });
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  const handleConfigurationChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value,
      },
    }));
  };

  const handleWidgetSettingsChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      widgetSettings: {
        ...prev.widgetSettings,
        [key]: value,
      },
    }));
  };

  const getConfigurationFields = () => {
    switch (formData.type) {
      case SupportClientType.MESSENGER:
        return (
          <div className="space-y-4">
            <FormInput
              id="appId"
              type="text"
              label={t('support_clients.form.fields.facebook_app_id')}
              value={formData.configuration.appId || ''}
              onChange={(e) => handleConfigurationChange('appId', e.target.value)}
              required
            />
            <FormInput
              id="pageId"
              type="text"
              label={t('support_clients.form.fields.facebook_page_id')}
              value={formData.configuration.pageId || ''}
              onChange={(e) => handleConfigurationChange('pageId', e.target.value)}
              required
            />
          </div>
        );

      case SupportClientType.ZALO:
        return (
          <div className="space-y-4">
            <FormInput
              id="zaloAppId"
              type="text"
              label={t('support_clients.form.fields.zalo_app_id')}
              value={formData.configuration.appId || ''}
              onChange={(e) => handleConfigurationChange('appId', e.target.value)}
              required
            />
            <FormInput
              id="apiKey"
              type="text"
              label={t('support_clients.form.fields.zalo_api_key')}
              value={formData.configuration.apiKey || ''}
              onChange={(e) => handleConfigurationChange('apiKey', e.target.value)}
              required
            />
          </div>
        );

      case SupportClientType.WHATSAPP:
        return (
          <div className="space-y-4">
            <FormInput
              id="phoneNumber"
              type="text"
              label={t('support_clients.form.fields.whatsapp_phone')}
              value={formData.configuration.phoneNumber || ''}
              onChange={(e) => handleConfigurationChange('phoneNumber', e.target.value)}
              placeholder={t('support_clients.form.placeholders.whatsapp_example')}
              required
            />
          </div>
        );

      case SupportClientType.EMAIL:
        return (
          <div className="space-y-4">
            <FormInput
              id="email"
              type="email"
              label={t('support_clients.form.fields.email_address')}
              value={formData.configuration.email || ''}
              onChange={(e) => handleConfigurationChange('email', e.target.value)}
              required
            />
            <FormInput
              id="subject"
              type="text"
              label={t('support_clients.form.fields.default_subject')}
              value={formData.configuration.subject || ''}
              onChange={(e) => handleConfigurationChange('subject', e.target.value)}
            />
          </div>
        );

      case SupportClientType.PHONE:
        return (
          <div className="space-y-4">
            <FormInput
              id="phoneNumber"
              type="text"
              label={t('support_clients.form.fields.phone_number')}
              value={formData.configuration.phoneNumber || ''}
              onChange={(e) => handleConfigurationChange('phoneNumber', e.target.value)}
              required
            />
          </div>
        );

      case SupportClientType.TELEGRAM:
        return (
          <div className="space-y-4">
            <FormInput
              id="botUsername"
              type="text"
              label={t('support_clients.form.fields.telegram_bot_username')}
              value={formData.configuration.botUsername || ''}
              onChange={(e) => handleConfigurationChange('botUsername', e.target.value)}
              placeholder={t('support_clients.form.placeholders.telegram_username')}
              required
            />
          </div>
        );

      case SupportClientType.CUSTOM:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support_clients.form.fields.custom_script')}
              </label>
              <textarea
                value={formData.configuration.customScript || ''}
                onChange={(e) => handleConfigurationChange('customScript', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                placeholder={t('support_clients.form.placeholders.custom_script')}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('support_clients.form.messages.no_configuration_required')}
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('support_clients.edit')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('support_clients.edit_description')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('support_clients.form.basic_info')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="name"
              type="text"
              label={`${t('support_clients.name')} *`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support_clients.type')} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SupportClientType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {typesData?.data?.map?.((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              id="sortOrder"
              type="number"
              label={t('support_clients.form.fields.sort_order')}
              value={formData.sortOrder.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              min="0"
            />

            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.active')}
                </span>
              </label>

              {client.isDefault && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {t('support_clients.default')}
                </span>
              )}
            </div>
          </div>

          <FormInput
            id="description"
            type="textarea"
            label={t('support_clients.description')}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('support_clients.form.configuration')}
          </h3>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <FiInfo className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t('support_clients.form.messages.validation_title')}
                  </h4>
                  <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            {getConfigurationFields()}
          </div>
        </div>

        {/* Widget Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('support_clients.form.widget_settings')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support_clients.form.fields.position')}
              </label>
              <select
                value={formData.widgetSettings.position || WidgetPosition.BOTTOM_RIGHT}
                onChange={(e) => handleWidgetSettingsChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {positionsData?.data?.map?.((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('support_clients.form.fields.theme')}
              </label>
              <select
                value={formData.widgetSettings.theme || WidgetTheme.LIGHT}
                onChange={(e) => handleWidgetSettingsChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {themesData?.data?.map?.((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              id="primaryColor"
              type="color"
              label={t('support_clients.form.fields.primary_color')}
              value={formData.widgetSettings.primaryColor || '#0084ff'}
              onChange={(e) => handleWidgetSettingsChange('primaryColor', e.target.value)}
            />

            <FormInput
              id="title"
              type="text"
              label={t('support_clients.form.fields.widget_title')}
              value={formData.widgetSettings.title || ''}
              onChange={(e) => handleWidgetSettingsChange('title', e.target.value)}
            />

            <FormInput
              id="subtitle"
              type="text"
              label={t('support_clients.form.fields.widget_subtitle')}
              value={formData.widgetSettings.subtitle || ''}
              onChange={(e) => handleWidgetSettingsChange('subtitle', e.target.value)}
            />

            <FormInput
              id="welcomeMessage"
              type="textarea"
              label={t('support_clients.form.fields.welcome_message')}
              value={formData.widgetSettings.welcomeMessage || ''}
              onChange={(e) => handleWidgetSettingsChange('welcomeMessage', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('support_clients.form.scheduling')}
          </h3>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.scheduleEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduleEnabled: e.target.checked }))}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('support_clients.form.messages.enable_scheduling')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('support_clients.form.messages.scheduling_description')}
                </p>
              </div>
            </label>

            {formData.scheduleEnabled && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="scheduleStart"
                  type="datetime-local"
                  label={t('support_clients.form.fields.schedule_start')}
                  value={formData.scheduleStart ? formData.scheduleStart.toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    scheduleStart: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  error={errors.scheduleStart}
                />

                <FormInput
                  id="scheduleEnd"
                  type="datetime-local"
                  label={t('support_clients.form.fields.schedule_end')}
                  value={formData.scheduleEnd ? formData.scheduleEnd.toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    scheduleEnd: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  error={errors.scheduleEnd}
                />
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
          >
            {t('support_clients.update')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
