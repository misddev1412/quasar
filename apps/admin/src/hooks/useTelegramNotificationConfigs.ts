import { useCallback, useMemo } from 'react';
import { trpc } from '../utils/trpc';

export interface TelegramNotificationConfig {
  id: string;
  name: string;
  botUsername: string;
  botToken: string;
  chatId: string;
  threadId?: number | null;
  description?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramNotificationConfigInput {
  name: string;
  botUsername: string;
  botToken: string;
  chatId: string;
  threadId?: number | null;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export const useTelegramNotificationConfigs = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.adminNotificationTelegramConfigs.list.useQuery(undefined, {
    staleTime: 1000 * 30,
  });

  const createMutation = trpc.adminNotificationTelegramConfigs.create.useMutation({
    onSuccess: () => refetch(),
  });

  const updateMutation = trpc.adminNotificationTelegramConfigs.update.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = trpc.adminNotificationTelegramConfigs.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const configs = useMemo(() => {
    const raw = (data as { data?: unknown })?.data;
    if (!raw || !Array.isArray(raw)) {
      return [] as TelegramNotificationConfig[];
    }
    return raw as TelegramNotificationConfig[];
  }, [data]);

  const createConfig = useCallback(async (payload: TelegramNotificationConfigInput) => {
    await createMutation.mutateAsync(payload);
  }, [createMutation]);

  const updateConfig = useCallback(async (payload: TelegramNotificationConfigInput & { id: string }) => {
    await updateMutation.mutateAsync(payload);
  }, [updateMutation]);

  const deleteConfig = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  }, [deleteMutation]);

  return {
    configs,
    isLoading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    refetch,
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
