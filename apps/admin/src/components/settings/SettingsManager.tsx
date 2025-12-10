import React, { useState } from 'react';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { CreateSettingForm } from './CreateSettingForm';
import cn from 'classnames';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';

// 设置项卡片组件
interface SettingItemProps {
  setting: SettingData;
  onUpdate: (id: string, data: Partial<Omit<SettingData, 'id'>>) => Promise<void>;
}

const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(setting.value || '');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const handleUpdate = async () => {
    if (value === setting.value) return;
    
    setIsLoading(true);
    try {
      await onUpdate(setting.id, { value });
      addToast({ type: 'success', title: t('settings.update_success_title', '更新成功'), description: t('settings.update_success_desc', '设置项已成功更新。') });
      setIsEditing(false);
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
    // 布尔值设置自动保存
    if (setting.type === 'boolean') {
      onUpdate(setting.id, { value: newValue })
        .then(() => {
          addToast({ type: 'success', title: t('settings.update_success_title', '更新成功'), description: t('settings.boolean_toggle_success_desc', '设置已切换。') });
        })
        .catch((error) => {
          console.error(error)
          addToast({ type: 'error', title: t('settings.update_failed_title', '更新失败'), description: t('settings.boolean_toggle_failed_desc', '无法切换设置。') });
          // Revert state on failure
          setValue(value);
        });
    }
  };

  const togglePublic = async () => {
    try {
      await onUpdate(setting.id, { isPublic: !setting.isPublic });
      addToast({ type: 'success', title: t('settings.update_success_title', '更新成功'), description: t('settings.public_toggle_success_desc', '可见性已更新。') });
    } catch (error) {
      console.error('Failed to update isPublic status:', error);
      addToast({ type: 'error', title: t('settings.update_failed_title', '更新失败'), description: t('settings.public_toggle_failed_desc', '无法更新可见性。') });
      // Note: we don't revert state here as we don't have the old state readily available without a small refactor.
      // The UI will be out of sync with the backend state if the call fails.
    }
  };

  const renderInput = () => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <Toggle 
              checked={value === 'true'} 
              onChange={toggleBooleanValue} 
              disabled={isLoading} 
            />
            <span className="ml-2 text-sm text-gray-600">
              {value === 'true' ? t('common.enabled', '启用') : t('common.disabled', '禁用')}
            </span>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        );
      case 'json':
      case 'array':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow duration-300 align-middle">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{t(`settings.keys.${setting.key}`, setting.key)}</h3>
          {setting.description && (
            <p className="text-xs text-gray-500 mt-1">{t(`settings.descriptions.${setting.key}`, setting.description)}</p>
          )}
        </div>
      </div>

      <div className="mt-3">
        {isEditing && setting.type !== 'boolean' ? (
          <div className="space-y-3">
            {renderInput()}
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setValue(setting.value || '');
                  setIsEditing(false);
                }}
                disabled={isLoading}
              >
                {t('common.cancel', '取消')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdate}
                isLoading={isLoading}
                disabled={value === setting.value}
              >
                {t('common.save', '保存')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-800 flex items-center">
              {setting.type === 'boolean' ? (
                <>
                  <Toggle
                    checked={value === 'true'} 
                    onChange={toggleBooleanValue}
                    disabled={isLoading}
                    size="sm"
                  />
                  <span className={`ml-2 ${value === 'true' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                    {value === 'true' ? t('common.enabled', '启用') : t('common.disabled', '禁用')}
                  </span>
                </>
              ) : (
                <span className="truncate max-w-md inline-block">
                  {setting.value || <span className="text-gray-400 italic">{t('common.empty', '空')}</span>}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Toggle
                checked={setting.isPublic}
                onChange={togglePublic}
                size="sm"
              />
              {setting.type !== 'boolean' && (
              <Button
                variant="ghost"
                size="sm"
                className="!p-1"
                onClick={() => setIsEditing(true)}
                aria-label={t('common.edit', '编辑')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 设置组卡片组件
const SettingGroupCard: React.FC<{
  title: string;
  settings: any[];
  onUpdate: (id: string, data: Partial<Omit<SettingData, 'id'>>) => Promise<void>;
}> = ({ title, settings, onUpdate }) => {
  const { t } = useTranslationWithBackend();
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6">
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{t(`settings.groups.${title}`, title)}</h2>
        <div className="ml-3 h-px bg-gray-200 flex-grow"></div>
      </div>
      <div className="space-y-4">
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

// 侧边栏分类组件
const CategorySidebar: React.FC<{
  groups: string[];
  selectedGroup: string | null;
  onSelectGroup: (group: string | null) => void;
}> = ({ groups, selectedGroup, onSelectGroup }) => {
  const { t } = useTranslationWithBackend();
  
  const ICONS: { [key: string]: React.ReactNode } = {
    all: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    general: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    appearance: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    pagination: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    other: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  };

  const getIcon = (groupKey: string | null) => {
    const key = groupKey === null ? 'all' : groupKey;
    return ICONS[key] || ICONS['general'];
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 h-fit lg:sticky lg:top-4">
      <h2 className="font-medium text-lg mb-4 pb-2 border-b border-gray-100">{t('settings.categories', '设置分类')}</h2>
      <nav className="space-y-2">
        <button
          onClick={() => onSelectGroup(null)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
            selectedGroup === null
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-blue-600 hover:text-white"
          )}
        >
          {getIcon(null)}
          <span>{t('settings.all_settings', '所有设置')}</span>
        </button>
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => onSelectGroup(group)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
              selectedGroup === group
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-blue-600 hover:text-white"
            )}
          >
            {getIcon(group)}
            <span>{t(`settings.groups.${group}`, group)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// 空状态提示组件
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
  // 如果外部没有提供模态框控制，则使用内部状态
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
    'analytics.anonymize_ip'
  ];

  const groupedSettings = React.useMemo(() => {
    if (!rawGroupedSettings) return rawGroupedSettings;

    const filteredSettings: typeof rawGroupedSettings = {};

    Object.keys(rawGroupedSettings).forEach(group => {
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

  // 确定是否显示模态框
  const isCreateModalOpen = onOpenCreateModal ? isModalOpen : internalModalOpen;
  
  // 处理模态框关闭
  const handleCloseModal = () => {
    if (onCloseModal) {
      onCloseModal();
    } else {
      setInternalModalOpen(false);
    }
  };

  // 处理打开模态框
  const handleOpenModal = () => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setInternalModalOpen(true);
    }
  };

  // 模拟数据 - 当真实数据为空时使用
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

  // 检查是否真的为空（而不只是加载中）
  const isEmpty = !isLoading && (!groupedSettings || Object.keys(groupedSettings).length === 0);
  
  // 决定显示真实数据还是占位数据
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边栏：设置分组 */}
        <div className="lg:col-span-1">
          <CategorySidebar 
            groups={groups} 
            selectedGroup={selectedGroup} 
            onSelectGroup={setSelectedGroup} 
          />
        </div>

        {/* 主内容区：设置列表 */}
        <div className="lg:col-span-3">
          {isEmpty && !selectedGroup ? (
            <EmptyState onCreateClick={handleOpenModal} />
          ) : (
            <>

              {selectedGroup === null ? (
                // 所有分组
                Object.entries(settingsToDisplay).map(([group, settings]) => (
                  <SettingGroupCard
                    key={group}
                    title={group}
                    settings={settings}
                    onUpdate={updateSetting}
                  />
                ))
              ) : (
                // 特定分组
                <SettingGroupCard
                  title={selectedGroup}
                  settings={settingsToDisplay[selectedGroup] || []}
                  onUpdate={updateSetting}
                />
              )}
            </>
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

      {/* 创建设置对话框 */}
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

// 添加必要的全局CSS动画
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerHTML = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
`;
document.head.appendChild(styleSheet); 
