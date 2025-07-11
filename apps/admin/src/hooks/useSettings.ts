import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { BaseApiResponse } from '@shared/types/api.types';

export interface SettingData {
  id?: string;
  key: string;
  value: string | null;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  group?: string | null;
  isPublic: boolean;
  description?: string | null;
}

export interface GroupedSettings {
  [group: string]: SettingData[];
}

export interface UseSettingsProps {
  group?: string;
  isPublic?: boolean;
}

export interface UseSettingsReturn {
  settings: SettingData[];
  groupedSettings: GroupedSettings;
  isLoading: boolean;
  error: Error | null;
  updateSetting: (id: string, value: string) => Promise<void>;
  bulkUpdateSettings: (settings: { key: string; value: string }[]) => Promise<void>;
  createSetting: (setting: Partial<SettingData>) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  refetch: () => void;
}

/**
 * 设置管理Hook，用于获取和管理系统设置
 */
export function useSettings({ group }: UseSettingsProps = {}): UseSettingsReturn {
  const [settings, setSettings] = useState<SettingData[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [error, setError] = useState<Error | null>(null);

  // 获取所有设置
  const { 
    data: settingsData, 
    isLoading, 
    refetch 
  } = trpc.adminSettings.getAll.useQuery();
  
  // 突变钩子
  const updateSettingMutation = trpc.adminSettings.update.useMutation();
  const bulkUpdateMutation = trpc.adminSettings.bulkUpdate.useMutation();
  const createSettingMutation = trpc.adminSettings.create.useMutation();
  const deleteSettingMutation = trpc.adminSettings.delete.useMutation();

  useEffect(() => {
    if (settingsData && typeof settingsData === 'object' && 'data' in settingsData) {
      const data = (settingsData as unknown as BaseApiResponse<SettingData[]>).data || [];
      
      // 过滤特定分组的设置
      const filteredData = group 
        ? data.filter(setting => setting.group === group)
        : data;
      
      setSettings(filteredData);
      
      // 对设置进行分组
      const grouped = filteredData.reduce<GroupedSettings>((acc, setting) => {
        const group = setting.group || '其他';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(setting);
        return acc;
      }, {});
      
      setGroupedSettings(grouped);
    }
  }, [settingsData, group]);

  // 更新单个设置
  const updateSetting = async (id: string, value: string): Promise<void> => {
    try {
      await updateSettingMutation.mutateAsync({ id, value });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('更新设置失败'));
      throw err;
    }
  };

  // 批量更新设置
  const bulkUpdateSettings = async (settingsToUpdate: { key: string; value: string }[]): Promise<void> => {
    try {
      await bulkUpdateMutation.mutateAsync({
        settings: settingsToUpdate
      });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('批量更新设置失败'));
      throw err;
    }
  };

  // 创建新设置
  const createSetting = async (settingData: Partial<SettingData>): Promise<void> => {
    try {
      await createSettingMutation.mutateAsync(settingData as any);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('创建设置失败'));
      throw err;
    }
  };

  // 删除设置
  const deleteSetting = async (id: string): Promise<void> => {
    try {
      await deleteSettingMutation.mutateAsync({ id });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('删除设置失败'));
      throw err;
    }
  };

  return {
    settings,
    groupedSettings,
    isLoading,
    error,
    updateSetting,
    bulkUpdateSettings,
    createSetting,
    deleteSetting,
    refetch
  };
} 