import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './Dialog';
import { ChartContainer } from './charts/ChartContainer';
import { ChartTypeSelector } from './charts/ChartTypeSelector';
import { DateRangePicker } from './charts/DateRangePicker';
import { useChartData } from '@admin/hooks/useChartData';
import { ChartType, TimePeriod, ChartModalProps } from '@admin/types/chart.types';
import { Loader2 } from 'lucide-react';

export const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  statisticId,
  title,
  initialChartType = 'line',
}) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(initialChartType);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | undefined>();

  const {
    data: chartData,
    isLoading,
    error,
    refetch,
  } = useChartData({
    statisticId,
    chartType: selectedChartType,
    period: selectedPeriod,
    startDate: customDateRange?.startDate,
    endDate: customDateRange?.endDate,
    enabled: isOpen, // Only fetch when modal is open
  });

  const handleChartTypeChange = (type: ChartType) => {
    setSelectedChartType(type);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      setCustomDateRange(undefined);
    }
  };

  const handleCustomDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setCustomDateRange(range);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title} - Chart View
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <ChartTypeSelector
              selectedType={selectedChartType}
              onTypeChange={handleChartTypeChange}
            />
            
            <DateRangePicker
              period={selectedPeriod}
              customDateRange={customDateRange}
              onPeriodChange={handlePeriodChange}
              onCustomDateRangeChange={handleCustomDateRangeChange}
            />
          </div>

          {/* Chart Container */}
          <div className="min-h-[400px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading chart data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <p className="text-red-500 mb-2">Failed to load chart data</p>
                  <p className="text-sm text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : chartData ? (
              <ChartContainer
                data={chartData}
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
