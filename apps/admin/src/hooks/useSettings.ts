import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { BaseApiResponse } from '@shared/types/api.types';
import { TRPCClientErrorLike } from '@trpc/client';

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
  pagination?: {
    page: number;
    limit: number;
    search?: string;
  };
}

export interface UseSettingsReturn {
  settings: SettingData[];
  groupedSettings: GroupedSettings;
  isLoading: boolean;
  error: Error | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  updateSetting: (id: string, data: Partial<Omit<SettingData, 'id'>>) => Promise<void>;
  bulkUpdateSettings: (settings: { key: string; value: string }[]) => Promise<void>;
  createSetting: (setting: Partial<SettingData>) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  refetch: () => void;
}

/**
 * Settings management Hook for fetching and managing system settings
 */
export function useSettings({ group, pagination }: UseSettingsProps = {}): UseSettingsReturn {
  const [settings, setSettings] = useState<SettingData[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [error, setError] = useState<Error | null>(null);
  const utils = trpc.useContext();

  const usePaginatedQuery = pagination && (pagination.page > 1 || pagination.search);

  const {
    data: allSettingsData,
    isLoading: isLoadingAll,
    refetch: refetchAll
  } = trpc.adminSettings.getAll.useQuery(undefined, {
    enabled: !usePaginatedQuery
  });

  const {
    data: paginatedSettingsData,
    isLoading: isLoadingPaginated,
    refetch: refetchPaginated
  } = trpc.adminSettings.list.useQuery(
    {
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      search: pagination?.search,
      group
    },
    {
      enabled: !!usePaginatedQuery
    }
  );

  const isLoading = usePaginatedQuery ? isLoadingPaginated : isLoadingAll;
  const refetch = usePaginatedQuery ? refetchPaginated : refetchAll;

  const updateSettingMutation = trpc.adminSettings.update.useMutation({
    onMutate: async (newData: { id: string } & Partial<Omit<SettingData, 'id'>>) => {
      await utils.adminSettings.getAll.cancel();
      const previousSettings = utils.adminSettings.getAll.getData();

      utils.adminSettings.getAll.setData(undefined, (oldQueryData: any) => {
        if (!oldQueryData?.data) return oldQueryData;

        const updatedData = oldQueryData.data.map((setting: SettingData) =>
          setting.id === newData.id ? { ...setting, ...newData } : setting
        );

        return { ...oldQueryData, data: updatedData };
      });

      return { previousSettings };
    },
    onError: (err: TRPCClientErrorLike<any>, newData, context) => {
      if (context?.previousSettings) {
        utils.adminSettings.getAll.setData(undefined, context.previousSettings);
      }
      setError(new Error(err.message));
    },
    onSettled: () => {
      utils.adminSettings.getAll.invalidate();
    },
  });

    const bulkUpdateMutation = trpc.adminSettings.bulkUpdate.useMutation();
  const createSettingMutation = trpc.adminSettings.create.useMutation();
  const deleteSettingMutation = trpc.adminSettings.delete.useMutation();

  useEffect(() => {
    const currentData = usePaginatedQuery ? paginatedSettingsData : allSettingsData;

    if (currentData && typeof currentData === 'object' && 'data' in currentData) {
      let data: SettingData[] = [];

      if (usePaginatedQuery) {
        const paginatedResponse = currentData as unknown as BaseApiResponse<{
          data: SettingData[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>;
        data = paginatedResponse.data?.data || [];
      } else {
        const allResponse = currentData as unknown as BaseApiResponse<SettingData[]>;
        data = allResponse.data || [];
      }

      const filteredData = !usePaginatedQuery && group
        ? data.filter(setting => setting.group === group)
        : data;

      setSettings(filteredData);

      const grouped = filteredData.reduce<GroupedSettings>((acc, setting) => {
        const group = setting.group || 'Other';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(setting);
        return acc;
      }, {});

      setGroupedSettings(grouped);
    }
  }, [allSettingsData, paginatedSettingsData, group, usePaginatedQuery]);

  const updateSetting = async (id: string, data: Partial<Omit<SettingData, 'id'>>): Promise<void> => {
    try {
      await updateSettingMutation.mutateAsync({ id, ...data });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update setting'));
      throw err;
    }
  };

  const bulkUpdateSettings = async (settingsToUpdate: { key: string; value: string }[]): Promise<void> => {
    try {
      await bulkUpdateMutation.mutateAsync({
        settings: settingsToUpdate
      });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to bulk update settings'));
      throw err;
    }
  };

  const createSetting = async (settingData: Partial<SettingData>): Promise<void> => {
    try {
      await createSettingMutation.mutateAsync(settingData as any);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create setting'));
      throw err;
    }
  };

  const deleteSetting = async (id: string): Promise<void> => {
    try {
      await deleteSettingMutation.mutateAsync({ id });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete setting'));
      throw err;
    }
  };

  const paginationInfo = usePaginatedQuery && paginatedSettingsData ?
    (() => {
      const response = paginatedSettingsData as unknown as BaseApiResponse<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>;
      return response.data;
    })() : undefined;

  return {
    settings,
    groupedSettings,
    isLoading,
    error,
    pagination: paginationInfo,
    updateSetting,
    bulkUpdateSettings,
    createSetting,
    deleteSetting,
    refetch
  };
} 