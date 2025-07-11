import React, { useState } from 'react';
import { useSettings, SettingData } from '../../hooks/useSettings';

interface CreateSettingFormProps {
  onClose: () => void;
}

export const CreateSettingForm: React.FC<CreateSettingFormProps> = ({ onClose }) => {
  const { createSetting } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SettingData>>({
    key: '',
    value: '',
    type: 'string',
    group: '',
    isPublic: false,
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'isPublic') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key) {
      setError('键名是必填的');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await createSetting(formData);
      onClose();
    } catch (err) {
      setError('创建设置失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-700">
          键名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="key"
          name="key"
          value={formData.key}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">
          值
        </label>
        <input
          type="text"
          id="value"
          name="value"
          value={formData.value || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          类型
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="string">文本 (string)</option>
          <option value="number">数字 (number)</option>
          <option value="boolean">布尔值 (boolean)</option>
          <option value="json">JSON 对象</option>
          <option value="array">数组</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="group" className="block text-sm font-medium text-gray-700">
          分组
        </label>
        <input
          type="text"
          id="group"
          name="group"
          value={formData.group || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
          公开设置（客户端可访问）
        </label>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? '创建中...' : '创建设置'}
        </button>
      </div>
    </form>
  );
}; 