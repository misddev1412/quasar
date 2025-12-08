import React from 'react';
import { useChartData } from '@admin/hooks/useChartData';

interface ChartDataDebugProps {
  statisticId: string;
  chartType: 'line' | 'bar' | 'pie' | 'area';
  period: '7d' | '30d' | '90d' | '1y' | 'custom';
}

export const ChartDataDebug: React.FC<ChartDataDebugProps> = ({
  statisticId,
  chartType,
  period,
}) => {
  const {
    data: chartData,
    isLoading,
    error,
    isError,
  } = useChartData({
    statisticId,
    chartType,
    period,
    enabled: true,
  });

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Chart Data Debug</h3>
      <div className="space-y-2 text-sm">
        <div><strong>statisticId:</strong> {statisticId}</div>
        <div><strong>chartType:</strong> {chartType}</div>
        <div><strong>period:</strong> {period}</div>
        <div><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</div>
        <div><strong>isError:</strong> {isError ? 'true' : 'false'}</div>
        <div><strong>error:</strong> {error || 'null'}</div>
        <div><strong>chartData:</strong> {chartData ? 'exists' : 'null'}</div>
        {chartData && (
          <div className="ml-4">
            <div><strong>chartData.type:</strong> {chartData.type}</div>
            <div><strong>chartData.title:</strong> {chartData.title}</div>
            <div><strong>chartData.data.length:</strong> {chartData.data?.length || 0}</div>
          </div>
        )}
      </div>
    </div>
  );
};
