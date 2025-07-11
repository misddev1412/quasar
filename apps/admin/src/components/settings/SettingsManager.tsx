import React, { useState } from 'react';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { CreateSettingForm } from './CreateSettingForm';
import cn from 'classnames';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Toggle } from '../common/Toggle';

// 设置项卡片组件
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

  const toggleBooleanValue = () => {
    const newValue = value === 'true' ? 'false' : 'true';
    setValue(newValue);
    // 布尔值设置自动保存
    if (setting.type === 'boolean') {
      onUpdate(setting.id, newValue).catch(console.error);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{setting.key}</h3>
          {setting.description && (
            <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {setting.isPublic && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              {t('common.public', '公开')}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {setting.type}
          </span>
        </div>
      </div>

      <div className="mt-3">
        {isEditing && setting.type !== 'boolean' ? (
          <div className="space-y-3">
            {renderInput()}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setValue(setting.value || '');
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                disabled={isLoading}
              >
                {t('common.cancel', '取消')}
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                disabled={isLoading || value === setting.value}
              >
                {isLoading ? t('common.saving', '保存中...') : t('common.save', '保存')}
              </button>
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
            {setting.type !== 'boolean' && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50"
              >
                {t('common.edit', '编辑')}
              </button>
            )}
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
  onUpdate: (id: string, value: string) => Promise<void>;
}> = ({ title, settings, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6">
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
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
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 h-fit lg:sticky lg:top-20">
      <h2 className="font-medium text-lg mb-4 pb-2 border-b border-gray-100">{t('settings.categories', '设置分类')}</h2>
      <nav className="space-y-2">
        <button
          onClick={() => onSelectGroup(null)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
            selectedGroup === null
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          {t('settings.all_settings', '所有设置')}
        </button>
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => onSelectGroup(group)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
              selectedGroup === group
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            {group}
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
      <button
        onClick={onCreateClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        {t('settings.add_setting', '添加设置')}
      </button>
    </div>
  );
};

interface SettingsManagerProps {
  isModalOpen?: boolean;
  onOpenCreateModal?: () => void;
  onCloseModal?: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  isModalOpen = false, 
  onOpenCreateModal, 
  onCloseModal 
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  // 如果外部没有提供模态框控制，则使用内部状态
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const { groupedSettings, isLoading, updateSetting } = useSettings();
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
    "基本设置": [
      {
        id: "placeholder1",
        key: "site_name",
        value: "Quasar Admin",
        type: "string",
        description: "网站名称",
        group: "基本设置",
        isPublic: true
      },
      {
        id: "placeholder2",
        key: "site_description",
        value: "专业的后台管理系统",
        type: "string",
        description: "网站描述",
        group: "基本设置",
        isPublic: true
      },
      {
        id: "placeholder3",
        key: "maintenance_mode",
        value: "false",
        type: "boolean",
        description: "维护模式",
        group: "基本设置",
        isPublic: false
      }
    ],
    "其他": [
      {
        id: "placeholder4",
        key: "contact_email",
        value: "admin@quasar.com",
        type: "string",
        description: "联系邮箱",
        group: "其他",
        isPublic: true
      },
      {
        id: "placeholder5",
        key: "default_pagination",
        value: "10",
        type: "number",
        description: "默认分页数量",
        group: "其他",
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all animate-scaleIn"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('settings.create_new_setting', '创建新设置')}</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label={t('common.close', '关闭')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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