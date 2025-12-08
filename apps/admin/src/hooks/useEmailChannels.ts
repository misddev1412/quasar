import { useMemo } from 'react';
import { trpc } from '../utils/trpc';

interface EmailChannelData {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  providerName?: string;
  usageType?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface EmailChannelOption {
  value: string;
  label: string;
  isDefault?: boolean;
  isActive?: boolean;
  providerName?: string;
  usageType?: string;
}

/**
 * Hook to fetch and manage email channels for form selections
 */
export const useEmailChannels = () => {
  // Fetch active email channels
  const {
    data: channelsResponse,
    isLoading,
    error,
    refetch,
  } = trpc.adminEmailChannel.getActiveChannels.useQuery() as {
    data?: ApiResponse<EmailChannelData[]>;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  // Transform channels into select options
  const channelOptions: EmailChannelOption[] = useMemo(() => {
    if (!channelsResponse?.success || !channelsResponse?.data) {
      return [];
    }

    const channels = Array.isArray(channelsResponse.data) ? channelsResponse.data : [];
    
    return channels.map((channel) => ({
      value: channel.id,
      label: `${channel.name}${channel.isDefault ? ' (Default)' : ''}${channel.providerName ? ` - ${channel.providerName}` : ''}`,
      isDefault: channel.isDefault,
      isActive: channel.isActive,
      providerName: channel.providerName,
      usageType: channel.usageType,
    }));
  }, [channelsResponse]);

  // Get default channel
  const defaultChannel = useMemo(() => {
    return channelOptions.find(channel => channel.isDefault);
  }, [channelOptions]);

  // Get channels by usage type
  const getChannelsByUsageType = (usageType: string) => {
    return channelOptions.filter(channel => channel.usageType === usageType);
  };

  return {
    channels: channelOptions,
    defaultChannel,
    isLoading,
    error,
    refetch,
    getChannelsByUsageType,
  };
};

/**
 * Hook to fetch specific email channel details
 */
export const useEmailChannel = (channelId?: string) => {
  const {
    data: channelResponse,
    isLoading,
    error,
    refetch,
  } = trpc.adminEmailChannel.getChannelById.useQuery(
    { id: channelId! },
    { enabled: !!channelId }
  ) as {
    data?: ApiResponse<EmailChannelData>;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };

  const channel = channelResponse?.success ? channelResponse.data : null;

  return {
    channel,
    isLoading,
    error,
    refetch,
  };
};