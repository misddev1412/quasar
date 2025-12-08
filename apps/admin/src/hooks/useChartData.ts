import { useQuery } from '@tanstack/react-query';
import { trpc } from '@admin/utils/trpc';
import { ChartDataRequest, ChartData, ChartDataResponse } from '@admin/types/chart.types';

interface UseChartDataOptions extends ChartDataRequest {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useChartData = ({
  statisticId,
  chartType,
  period,
  startDate,
  endDate,
  enabled = true,
  refetchInterval,
}: UseChartDataOptions) => {
  const queryKey = [
    'chartData',
    statisticId,
    chartType,
    period,
    startDate,
    endDate,
  ];

  const {
    data,
    isLoading,
    error,
    refetch,
    isError,
  } = trpc.adminChartData.getChartData.useQuery(
    {
      statisticId,
      chartType,
      period,
      startDate,
      endDate,
    },
    {
      enabled,
      refetchInterval,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Transform the API response to our expected format
  // The tRPC response follows the apiResponseSchema format: { code, status, data, timestamp }
  const response = data as { code: number; status: string; data: ChartData; timestamp: string } | undefined;
  const chartData: ChartData | undefined = response?.code === 200 && response?.data
    ? response.data
    : undefined;

  const errorMessage = isError 
    ? error?.message || 'Failed to load chart data'
    : undefined;

  return {
    data: chartData,
    isLoading,
    error: errorMessage,
    refetch,
    isError,
  };
};

// Hook for getting available chart types for a specific statistic
export const useAvailableChartTypes = (statisticId: string) => {
  const {
    data,
    isLoading,
    error,
  } = trpc.adminChartData.getAvailableChartTypes.useQuery(
    { statisticId },
    {
      staleTime: 30 * 60 * 1000, // 30 minutes - chart types don't change often
      gcTime: 60 * 60 * 1000, // 1 hour (renamed from cacheTime)
    }
  );

  // Type the response properly
  const response = data as { code: number; status: string; data: string[]; timestamp: string } | undefined;

  return {
    availableTypes: response?.code === 200 && response?.data ? response.data : [],
    isLoading,
    error: error?.message,
  };
};
