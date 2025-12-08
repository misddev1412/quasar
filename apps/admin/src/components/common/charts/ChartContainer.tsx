import React from 'react';
import { ChartContainerProps, ChartDataPoint, PieChartDataPoint } from '@admin/types/chart.types';
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

  // Type guards to check data types
  const isChartDataPoint = (item: any): item is ChartDataPoint => {
    return item && typeof item.date === 'string' && typeof item.value === 'number';
  };

  const isPieChartDataPoint = (item: any): item is PieChartDataPoint => {
    return item && typeof item.name === 'string' && typeof item.value === 'number';
  };

  // Render the appropriate chart component based on type
  const renderChart = () => {
    const { data: chartData, type, title } = data;

    switch (type) {
      case 'line':
        if (chartData.length > 0 && isChartDataPoint(chartData[0])) {
          return (
            <LineChartComponent
              data={chartData as ChartDataPoint[]}
              height={height}
              title={title}
            />
          );
        }
        break;
      case 'bar':
        if (chartData.length > 0 && isChartDataPoint(chartData[0])) {
          return (
            <BarChartComponent
              data={chartData as ChartDataPoint[]}
              height={height}
              title={title}
            />
          );
        }
        break;
      case 'pie':
        if (chartData.length > 0 && isPieChartDataPoint(chartData[0])) {
          return (
            <PieChartComponent
              data={chartData as PieChartDataPoint[]}
              height={height}
              title={title}
            />
          );
        }
        break;
      case 'area':
        if (chartData.length > 0 && isChartDataPoint(chartData[0])) {
          return (
            <AreaChartComponent
              data={chartData as ChartDataPoint[]}
              height={height}
              title={title}
            />
          );
        }
        break;
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
                Chart type "{type}" is not supported
              </p>
            </div>
          </div>
        );
    }

    // Fallback for data type mismatch
    return (
      <div
        className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Data Type Mismatch
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-1">
            Chart data format doesn't match the selected chart type
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {renderChart()}
      </div>
    </div>
  );
};
