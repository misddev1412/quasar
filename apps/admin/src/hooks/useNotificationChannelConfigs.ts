import { useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { NotificationChannel } from './useNotificationPreferences';
import { NotificationEventKey } from '../types/notification-events';
export type { NotificationEventKey } from '../types/notification-events';

export interface NotificationChannelConfig {
  id: string;
  eventKey: NotificationEventKey;
  displayName: string;
  description?: string;
  allowedChannels: NotificationChannel[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const useNotificationChannelConfigs = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.adminNotificationChannels.listConfigs.useQuery(undefined, {
    staleTime: 1000 * 60,
  });

  const updateChannelsMutation = trpc.adminNotificationChannels.updateAllowedChannels.useMutation({
    onSuccess: () => refetch(),
  });

  const upsertConfigMutation = trpc.adminNotificationChannels.upsertConfig.useMutation({
    onSuccess: () => refetch(),
  });

  const initializeDefaultsMutation = trpc.adminNotificationChannels.initializeDefaults.useMutation({
    onSuccess: () => refetch(),
  });

  const configs = ((data as { data?: unknown })?.data || []) as NotificationChannelConfig[];

  const updateAllowedChannels = useCallback(async (eventKey: NotificationEventKey, channels: NotificationChannel[]) => {
    await updateChannelsMutation.mutateAsync({
      eventKey,
      channels,
    });
  }, [updateChannelsMutation]);

  const upsertConfig = useCallback(async (config: {
    eventKey: NotificationEventKey;
    displayName: string;
    description?: string;
    allowedChannels: NotificationChannel[];
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) => {
    await upsertConfigMutation.mutateAsync(config);
  }, [upsertConfigMutation]);

  const initializeDefaults = useCallback(async () => {
    await initializeDefaultsMutation.mutateAsync();
  }, [initializeDefaultsMutation]);

  return {
    configs,
    isLoading,
    error,
    refetch,
    updateAllowedChannels,
    upsertConfig,
    initializeDefaults,
    isUpdating: updateChannelsMutation.isPending || upsertConfigMutation.isPending || initializeDefaultsMutation.isPending,
  };
};
