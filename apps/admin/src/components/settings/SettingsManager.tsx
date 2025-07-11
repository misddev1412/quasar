import React, { useState } from 'react';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { CreateSettingForm } from './CreateSettingForm';
import cn from 'classnames';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface SettingItemProps {
  setting: SettingData;
  onUpdate: (id: string, value: string) => Promise<void>;
}

const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(setting.value || '');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslationWithBackend();

  const handleUpdate = async () => {
    if (value === setting.value) return;
    
    setIsLoading(true);
    try {
      await onUpdate(setting.id, value);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = () => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => setValue(e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        );
      case 'json':
      case 'array':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{setting.key}</h3>
          {setting.description && (
            <p className="text-xs text-gray-500">{setting.description}</p>
          )}
        </div>
        <div className="flex items-center">
          {setting.isPublic && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
              {t('common.public', '公开')}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {setting.type}
          </span>
        </div>
      </div>

      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-2">
            {renderInput()}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setValue(setting.value || '');
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                disabled={isLoading}
              >
                {t('common.cancel', '取消')}
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                disabled={isLoading || value === setting.value}
              >
                {isLoading ? t('common.saving', '保存中...') : t('common.save', '保存')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-800 truncate max-w-md">
              {setting.type === 'boolean' ? (
                <span className={setting.value === 'true' ? 'text-green-600' : 'text-red-600'}>
                  {setting.value === 'true' ? t('common.enabled', '启用') : t('common.disabled', '禁用')}
                </span>
              ) : (
                setting.value || <span className="text-gray-400 italic">{t('common.empty', '空')}</span>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {t('common.edit', '编辑')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SettingsManager: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { groupedSettings, isLoading, updateSetting } = useSettings();
  const { t } = useTranslationWithBackend();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const groups = Object.keys(groupedSettings);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.system_settings', '系统设置')}</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t('settings.add_setting', '添加设置')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边栏：设置分组 */}
        <div className="bg-white rounded-lg shadow p-4 h-fit lg:sticky lg:top-20">
          <h2 className="font-medium text-lg mb-4">{t('settings.categories', '设置分类')}</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedGroup(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm",
                selectedGroup === null
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {t('settings.all_settings', '所有设置')}
            </button>
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm",
                  selectedGroup === group
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {group}
              </button>
            ))}
          </nav>
        </div>

        {/* 主内容区：设置列表 */}
        <div className="lg:col-span-3">
          {selectedGroup === null ? (
            // 所有分组
            Object.entries(groupedSettings).map(([group, settings]) => (
              <div key={group} className="mb-8">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b">{group}</h2>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <SettingItem 
                      key={setting.id} 
                      setting={setting} 
                      onUpdate={updateSetting} 
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // 特定分组
            <div>
              <h2 className="text-lg font-medium mb-4 pb-2 border-b">{selectedGroup}</h2>
              <div className="space-y-4">
                {groupedSettings[selectedGroup]?.map((setting) => (
                  <SettingItem 
                    key={setting.id} 
                    setting={setting} 
                    onUpdate={updateSetting} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 创建设置对话框 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{t('settings.create_new_setting', '创建新设置')}</h2>
            <CreateSettingForm onClose={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}; 