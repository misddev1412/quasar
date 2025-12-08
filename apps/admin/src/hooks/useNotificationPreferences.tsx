import { useState, useCallback } from 'react';
import { trpc } from '../utils/trpc';

export interface NotificationPreference {
  id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  frequency: NotificationFrequency;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  settings?: Record<string, unknown>;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'product' | 'order' | 'user';
export type NotificationChannel = 'push' | 'email' | 'in_app' | 'sms' | 'telegram';
export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';

export interface NotificationPreferenceSettings {
  type: NotificationType;
  channels: {
    [K in NotificationChannel]: {
      enabled: boolean;
      frequency: NotificationFrequency;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      quietHoursTimezone?: string;
      settings?: Record<string, unknown>;
    };
  };
}

export interface UseNotificationPreferencesResult {
  preferences: NotificationPreferenceSettings[];
  rawPreferences: NotificationPreference[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  updatePreference: (
    type: NotificationType,
    channel: NotificationChannel,
    updates: Partial<NotificationPreference>
  ) => Promise<void>;

  bulkUpdatePreferences: (preferences: Array<{
    type: NotificationType;
    channel: NotificationChannel;
    enabled?: boolean;
    frequency?: NotificationFrequency;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    quietHoursTimezone?: string;
    settings?: Record<string, unknown>;
  }>) => Promise<void>;

  toggleNotificationType: (type: NotificationType, enabled: boolean) => Promise<void>;

  setQuietHours: (
    channel: NotificationChannel,
    start: string,
    end: string,
    timezone?: string
  ) => Promise<void>;

  getQuietHours: (channel: NotificationChannel) => Promise<{
    start?: string;
    end?: string;
    timezone?: string;
  } | null>;

  initializePreferences: () => Promise<void>;

  refetch: () => void;
}

export const useNotificationPreferences = (userId: string): UseNotificationPreferencesResult => {
  const [error, setError] = useState<Error | null>(null);

  // Fetch user preferences (grouped format)
  const {
    data: preferencesResponse,
    isLoading: isLoadingGrouped,
    refetch: refetchGrouped,
  } = trpc.adminNotificationPreferences.getUserPreferences.useQuery(
    { userId },
    {
      enabled: !!userId,
    }
  );

  // Fetch raw preferences
  const {
    data: rawPreferencesResponse,
    isLoading: isLoadingRaw,
    refetch: refetchRaw,
  } = trpc.adminNotificationPreferences.getUserPreferencesRaw.useQuery(
    { userId },
    {
      enabled: !!userId,
    }
  );

  // Extract data from API response
  const preferences = ((preferencesResponse as { data?: unknown })?.data || []) as NotificationPreferenceSettings[];
  const rawPreferences = ((rawPreferencesResponse as { data?: unknown })?.data || []) as NotificationPreference[];

  const isLoading = isLoadingGrouped || isLoadingRaw;

  // Mutations
  const updatePreferenceMutation = trpc.adminNotificationPreferences.updateUserPreference.useMutation({
    onSuccess: () => {
      refetchGrouped();
      refetchRaw();
      setError(null);
    },
  });

  const bulkUpdateMutation = trpc.adminNotificationPreferences.bulkUpdateUserPreferences.useMutation({
    onSuccess: () => {
      refetchGrouped();
      refetchRaw();
      setError(null);
    },
  });

  const toggleTypeMutation = trpc.adminNotificationPreferences.toggleNotificationType.useMutation({
    onSuccess: () => {
      refetchGrouped();
      refetchRaw();
      setError(null);
    },
  });

  const setQuietHoursMutation = trpc.adminNotificationPreferences.setQuietHours.useMutation({
    onSuccess: () => {
      refetchGrouped();
      refetchRaw();
      setError(null);
    },
  });

  const initializeMutation = trpc.adminNotificationPreferences.initializeUserPreferences.useMutation({
    onSuccess: () => {
      refetchGrouped();
      refetchRaw();
      setError(null);
    },
  });

  // Action handlers
  const updatePreference = useCallback(async (
    type: NotificationType,
    channel: NotificationChannel,
    updates: Partial<NotificationPreference>
  ) => {
    await updatePreferenceMutation.mutateAsync({
      userId,
      type,
      channel,
      ...updates,
    });
  }, [userId, updatePreferenceMutation]);

  const bulkUpdatePreferences = useCallback(async (preferences: Array<{
    type: NotificationType;
    channel: NotificationChannel;
    enabled?: boolean;
    frequency?: NotificationFrequency;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    quietHoursTimezone?: string;
    settings?: Record<string, unknown>;
  }>) => {
    await bulkUpdateMutation.mutateAsync({
      userId,
      preferences,
    });
  }, [userId, bulkUpdateMutation]);

  const toggleNotificationType = useCallback(async (
    type: NotificationType,
    enabled: boolean
  ) => {
    await toggleTypeMutation.mutateAsync({
      userId,
      type,
      enabled,
    });
  }, [userId, toggleTypeMutation]);

  const setQuietHours = useCallback(async (
    channel: NotificationChannel,
    start: string,
    end: string,
    timezone?: string
  ) => {
    await setQuietHoursMutation.mutateAsync({
      userId,
      channel,
      start,
      end,
      timezone,
    });
  }, [userId, setQuietHoursMutation]);

  const getQuietHours = useCallback(async (channel: NotificationChannel) => {
    try {
      // Use the utils to get query client for direct calls
      const utils = trpc.useUtils();
      const result = await utils.adminNotificationPreferences.getQuietHours.fetch({
        userId,
        channel,
      });
      return (result as { data?: unknown })?.data || null;
    } catch (error) {
      console.error('Failed to get quiet hours:', error);
      return null;
    }
  }, [userId]);

  const initializePreferences = useCallback(async () => {
    await initializeMutation.mutateAsync({ userId });
  }, [userId, initializeMutation]);

  const refetch = useCallback(() => {
    refetchGrouped();
    refetchRaw();
  }, [refetchGrouped, refetchRaw]);

  return {
    preferences,
    rawPreferences,
    isLoading,
    error,
    updatePreference,
    bulkUpdatePreferences,
    toggleNotificationType,
    setQuietHours,
    getQuietHours,
    initializePreferences,
    refetch,
  };
};
