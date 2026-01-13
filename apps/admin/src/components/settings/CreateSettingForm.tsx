import React, { useState } from 'react';
import { useSettings, SettingData } from '../../hooks/useSettings';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Toggle } from '../common/Toggle';

interface CreateSettingFormProps {
  onClose: () => void;
}

type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'array';

export const CreateSettingForm: React.FC<CreateSettingFormProps> = ({ onClose }) => {
  const { createSetting } = useSettings();
  const { t } = useTranslationWithBackend();
  
  const [formData, setFormData] = useState<Partial<SettingData>>({
    key: '',
    value: '',
    type: 'string' as SettingType,
    description: '',
    group: '',
    isPublic: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeValue = e.target.value as SettingType;
    setFormData(prev => ({ ...prev, type: typeValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'type') {
      handleTypeChange(e as React.ChangeEvent<HTMLSelectElement>);
    } else {
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const togglePublic = () => {
    setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.key?.trim()) {
      setError(t('settings.error_key_required', '键名是必填的'));
      return;
    }
    
    setIsLoading(true);
    try {
      await createSetting(formData);
      onClose();
    } catch (error: any) {
      setError(error?.message || t('settings.error_create', '创建设置失败'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.form.key', '键名')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="key"
            id="key"
            value={formData.key || ''}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.form.value', '值')}
          </label>
          <input
            type="text"
            name="value"
            id="value"
            value={formData.value || ''}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.form.type', '类型')}
          </label>
          <select
            name="type"
            id="type"
            value={formData.type || 'string'}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="string">{t('settings.form.type_string', '字符串')}</option>
            <option value="number">{t('settings.form.type_number', '数字')}</option>
            <option value="boolean">{t('settings.form.type_boolean', '布尔值')}</option>
            <option value="json">{t('settings.form.type_json', 'JSON')}</option>
            <option value="array">{t('settings.form.type_array', '数组')}</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.form.group', '分组')}
          </label>
          <input
            type="text"
            name="group"
            id="group"
            value={formData.group || ''}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={t('settings.form.group_placeholder', '例如：基本设置, 高级设置')}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.form.description', '描述')}
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>
        
        <div className="flex items-center py-2">
          <Toggle
            checked={!!formData.isPublic}
            onChange={togglePublic}
            disabled={isLoading}
          />
          <span className="ml-3 text-sm font-medium text-gray-700">
            {t('settings.form.is_public', '公开（对所有用户可见）')}
          </span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {t('common.cancel', '取消')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? t('settings.form.creating', '创建中...') : t('settings.form.create', '创建')}
        </button>
      </div>
    </form>
  );
}; 