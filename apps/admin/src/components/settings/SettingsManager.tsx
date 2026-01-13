import React, { useEffect, useState, useMemo } from 'react';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { CreateSettingForm } from './CreateSettingForm';
import cn from 'classnames';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../common/Button';

interface SettingItemProps {
  setting: SettingData;
  onUpdate: (id: string, data: Partial<Omit<SettingData, 'id'>>) => Promise<void>;
}

const SECRET_SETTING_KEYS = ['storefront.maintenance_password'];

// Define which groups are allowed to be displayed in the general settings page
// This prevents specialized settings (like storage, upload, etc.) from cluttering this page
// since they are managed in dedicated configuration sections.
const ALLOWED_GROUPS = ['general', 'appearance', 'other', 'system', 'notifications'];

const ICONS: { [key: string]: React.ReactNode } = {
  all: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  general: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  appearance: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  pagination: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  other: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
};

const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
  const isSecret = SECRET_SETTING_KEYS.includes(setting.key);
  const [value, setValue] = useState(() => (isSecret ? '' : (setting.value || '')));
  const [secretTouched, setSecretTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  useEffect(() => {
    if (isSecret) {
      setValue('');
      setSecretTouched(false);
    } else {
      setValue(setting.value || '');
    }
  }, [setting.value, isSecret]);

  // Check if dirty
  const isDirty = useMemo(() => {
    if (isSecret) return secretTouched && value.length > 0;
    const currentValue = value;
    const originalValue = setting.value || '';
    return currentValue !== originalValue;
  }, [value, setting.value, isSecret, secretTouched]);

  const handleUpdate = async () => {
    if (!isDirty) return;

    setIsLoading(true);
    try {
      await onUpdate(setting.id, { value });
      addToast({ type: 'success', title: t('settings.update_success_title', '更新成功'), description: t('settings.update_success_desc', '设置项已成功更新。') });
      if (isSecret) {
        setValue('');
        setSecretTouched(false);
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      addToast({ type: 'error', title: t('settings.update_failed_title', '更新失败'), description: t('settings.update_failed_desc', '无法更新设置项，请稍后重试。') });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBooleanValue = () => {
    const newValue = value === 'true' ? 'false' : 'true';
    setValue(newValue);
    // For boolean, we might want to auto-save or just update state for manual save.
    // Based on user request for "input forms", manual save is usually preferred for consistency,
    // but toggles often imply immediate action. 
    // However, to keep "save" button logic consistent, let's treat it as an input that needs saving?
    // Actually, widespread pattern for toggles is immediate save. 
    // BUT the request says "displayed as input forms".
    // Let's stick to immediate save for toggles as it's better UX, but update the local state correctly.
    // Wait, if I change it to manual save, the toggle will just change state.
    // Let's keep immediate save for bools as it was before, it's friendlier.

    // Actually, for consistency with the "form" feel, maybe manual save is better?
    // Let's stick to immediate save for boolean for now as it was explicitly coded that way, 
    // unless "form" implies everything needs a save button.
    // Let's keep immediate save for toggles to avoid confusion unless user complaints.

    if (setting.type === 'boolean') {
      onUpdate(setting.id, { value: newValue })
        .then(() => {
          addToast({ type: 'success', title: t('settings.update_success_title', '更新成功'), description: t('settings.boolean_toggle_success_desc', '设置已切换。') });
        })
        .catch((error) => {
          console.error(error)
          addToast({ type: 'error', title: t('settings.update_failed_title', '更新失败'), description: t('settings.boolean_toggle_failed_desc', '无法切换设置。') });
          setValue(setting.value || 'false');
        });
    }
  };

  const handleCancel = () => {
    if (isSecret) {
      setValue('');
      setSecretTouched(false);
    } else {
      setValue(setting.value || '');
    }
  };

  const togglePublic = async () => {
    try {
      await onUpdate(setting.id, { isPublic: !setting.isPublic });
      addToast({ type: 'success', title: t('settings.update_success_title', '更新成功'), description: t('settings.public_toggle_success_desc', '可见性已更新。') });
    } catch (error) {
      console.error('Failed to update isPublic status:', error);
      addToast({ type: 'error', title: t('settings.update_failed_title', '更新失败'), description: t('settings.public_toggle_failed_desc', '无法更新可见性。') });
    }
  };

  const renderInput = () => {
    if (isSecret) {
      return (
        <input
          type="password"
          value={value}
          placeholder={t('settings.maintenance_password_placeholder', 'Enter new maintenance password')}
          onChange={(e) => {
            setSecretTouched(true);
            setValue(e.target.value);
          }}
          className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700">{value === 'true' ? t('common.enabled', '启用') : t('common.disabled', '禁用')}</span>
            <Toggle
              checked={value === 'true'}
              onChange={toggleBooleanValue}
              disabled={isLoading}
            />
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'json':
      case 'array':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow pr-4">
          <label className="block text-sm font-medium text-gray-900 mb-0.5 pointer-events-none">
            {t(`settings.keys.${setting.key}`, setting.key)}
          </label>
          {setting.description && (
            <p className="text-xs text-gray-500">{t(`settings.descriptions.${setting.key}`, setting.description)}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Toggle
            checked={setting.isPublic}
            onChange={togglePublic}
            size="sm"
          />
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {renderInput()}

        {isDirty && setting.type !== 'boolean' && (
          <div className="flex justify-end space-x-2 animate-fadeIn">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700"
            >
              {t('common.cancel', '取消')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              isLoading={isLoading}
            >
              {t('common.save', '保存')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingGroupCard: React.FC<{
  title: string;
  settings: any[];
  onUpdate: (id: string, data: Partial<Omit<SettingData, 'id'>>) => Promise<void>;
  icon?: React.ReactNode;
}> = ({ title, settings, onUpdate, icon }) => {
  const { t } = useTranslationWithBackend();
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 h-full flex flex-col">
      <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
        {icon && <div className="mr-3 p-2 bg-gray-50 rounded-lg">{icon}</div>}
        <h2 className="text-lg font-medium text-gray-900 capitalize">{t(`settings.groups.${title}`, title)}</h2>
      </div>
      <div className="space-y-4 flex-grow overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
        {settings.map((setting) => (
          <SettingItem
            key={setting.id}
            setting={setting}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};



const EmptyState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => {
  const { t } = useTranslationWithBackend();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{t('settings.no_settings', '暂无设置')}</h3>
      <p className="text-gray-500 mb-6">{t('settings.empty_state_message', '您尚未创建任何系统设置，点击下方按钮添加第一个设置。')}</p>
      <Button
        variant="primary"
        onClick={onCreateClick}
        startIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        }
      >
        {t('settings.add_setting', '添加设置')}
      </Button>
    </div>
  );
};

interface SettingsManagerProps {
  isModalOpen?: boolean;
  onOpenCreateModal?: () => void;
  onCloseModal?: () => void;
  group?: string | null;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  isModalOpen = false,
  onOpenCreateModal,
  onCloseModal,
  group = null
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(group);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const { groupedSettings: rawGroupedSettings, isLoading, updateSetting } = useSettings({ group: group || undefined });

  React.useEffect(() => {
    setSelectedGroup(group);
  }, [group]);

  // Filter out settings that have dedicated management pages
  const excludedKeys = [
    // Brand assets - managed in Brand Assets page
    'site.logo',
    'site.favicon',
    'site.footer_logo',
    'site.og_image',
    'site.login_background',
    // Storage settings - managed in Storage page
    'storage.provider',
    'storage.local.upload_path',
    'storage.local.base_url',
    'storage.s3.access_key',
    'storage.s3.secret_key',
    'storage.s3.region',
    'storage.s3.bucket',
    'storage.s3.endpoint',
    'storage.s3.force_path_style',
    'storage.max_file_size',
    'storage.allowed_file_types',
    // Analytics settings - managed in Analytics page
    'analytics.google_analytics_enabled',
    'analytics.google_analytics_id',
    'analytics.mixpanel_enabled',
    'analytics.mixpanel_token',
    'analytics.mixpanel_api_host',
    'analytics.track_admin_actions',
    'analytics.anonymize_ip',
    // Admin branding - managed in dedicated page
    'admin.branding.login',
    'admin.branding.sidebar'
  ];

  const groupedSettings = React.useMemo(() => {
    if (!rawGroupedSettings) return rawGroupedSettings;

    const filteredSettings: typeof rawGroupedSettings = {};

    Object.keys(rawGroupedSettings).forEach(group => {
      // Filter out groups that are not in the allowed list
      if (!ALLOWED_GROUPS.includes(group)) {
        return;
      }

      const settings = rawGroupedSettings[group];
      const filteredGroupSettings = settings.filter(setting =>
        !excludedKeys.includes(setting.key)
      );

      if (filteredGroupSettings.length > 0) {
        filteredSettings[group] = filteredGroupSettings;
      }
    });

    return filteredSettings;
  }, [rawGroupedSettings]);
  const { t } = useTranslationWithBackend();

  const isCreateModalOpen = onOpenCreateModal ? isModalOpen : internalModalOpen;

  const handleCloseModal = () => {
    if (onCloseModal) {
      onCloseModal();
    } else {
      setInternalModalOpen(false);
    }
  };

  const handleOpenModal = () => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setInternalModalOpen(true);
    }
  };

  const placeholderSettings = {
    "general": [
      {
        id: "placeholder1",
        key: "site_name",
        value: "Quasar Admin",
        type: "string",
        description: "The name of the website",
        group: "general",
        isPublic: true
      },
      {
        id: "placeholder2",
        key: "site_description",
        value: "A professional admin management system",
        type: "string",
        description: "The description of the website",
        group: "general",
        isPublic: true
      },
      {
        id: "placeholder3",
        key: "maintenance_mode",
        value: "false",
        type: "boolean",
        description: "Enable or disable maintenance mode",
        group: "general",
        isPublic: false
      }
    ],
    "appearance": [
      {
        id: "placeholder7",
        key: "theme_mode",
        value: "light",
        type: "string",
        description: "Default theme mode (light/dark)",
        group: "appearance",
        isPublic: true
      }
    ],
    "other": [
      {
        id: "placeholder4",
        key: "contact_email",
        value: "admin@quasar.com",
        type: "string",
        description: "The contact email for the admin",
        group: "other",
        isPublic: true
      },
      {
        id: "placeholder5",
        key: "default_pagination",
        value: "10",
        type: "number",
        description: "The default number of items per page for pagination",
        group: "other",
        isPublic: false
      }
    ]
  };

  const isEmpty = !isLoading && (!groupedSettings || Object.keys(groupedSettings).length === 0);

  const settingsToDisplay = isEmpty ? placeholderSettings : (groupedSettings || {});
  const groups = Object.keys(settingsToDisplay);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Banner/Header can go here if needed */}

        {/* Main Grid Content */}
        <div className="">
          {isEmpty ? (
            <EmptyState onCreateClick={handleOpenModal} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(settingsToDisplay).map(([group, settings]) => (
                <SettingGroupCard
                  key={group}
                  title={group}
                  settings={settings}
                  onUpdate={updateSetting}
                  icon={ICONS[group] || ICONS['general']}
                />
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-lg mt-4">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {t('settings.no_real_data', '当前显示的是示例数据。您可以点击"添加设置"按钮创建真实的系统设置。')}
              </p>
            </div>
          )}
        </div>
      </div>

      {}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all animate-scaleIn"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('settings.create_new_setting', '创建新设置')}</h2>
              <Button
                variant="ghost"
                onClick={handleCloseModal}
                className="!p-1.5 text-gray-400 hover:text-gray-600"
                aria-label={t('common.close', '关闭')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <CreateSettingForm onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </>
  );
};

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerHTML = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
`;
document.head.appendChild(styleSheet); 
