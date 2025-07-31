import React from 'react';
import { ChartContainerProps } from '@admin/types/chart.types';
import { LineChartComponent } from './LineChart';
import { BarChartComponent } from './BarChart';
import { PieChartComponent } from './PieChart';
import { AreaChartComponent } from './AreaChart';

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  isLoading = false,
  error,
  height = 400,
}) => {
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
        style={{ height }}
      >
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-6 w-6"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">Chart Error</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No Data Available</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Try selecting a different time period or chart type
          </p>
        </div>
      </div>
    );
  }

  // Render the appropriate chart component based on type
  const renderChart = () => {
    const commonProps = {
      data: data.data,
      height,
      title: data.title,
    };

    switch (data.type) {
      case 'line':
        return <LineChartComponent {...commonProps} />;
      case 'bar':
        return <BarChartComponent {...commonProps} />;
      case 'pie':
        return <PieChartComponent {...commonProps} />;
      case 'area':
        return <AreaChartComponent {...commonProps} />;
      default:
        return (
          <div 
            className="flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
            style={{ height }}
          >
            <div className="text-center">
              <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                Unsupported Chart Type
              </p>
              <p className="text-yellow-500 dark:text-yellow-300 text-sm mt-1">
                Chart type "{data.type}" is not supported
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {renderChart()}
      </div>
    </div>
  );
};
