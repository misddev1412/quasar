import { useQuery } from '@tanstack/react-query';
import { trpc } from '@admin/utils/trpc';
import { ChartDataRequest, ChartData } from '@admin/types/chart.types';

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
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Transform the API response to our expected format
  const chartData: ChartData | undefined = data?.success && data?.data 
    ? data.data 
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
      cacheTime: 60 * 60 * 1000, // 1 hour
    }
  );

  return {
    availableTypes: data?.success && data?.data ? data.data : [],
    isLoading,
    error: error?.message,
  };
};
