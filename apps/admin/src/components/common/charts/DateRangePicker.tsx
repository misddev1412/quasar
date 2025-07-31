import React from 'react';
import { DateRangePickerProps, TimePeriod } from '@admin/types/chart.types';
import { cn } from '@admin/lib/utils';
import { Calendar } from 'lucide-react';

const periodOptions: { value: TimePeriod; label: string; description: string }[] = [
  { value: '7d', label: '7 Days', description: 'Last 7 days' },
  { value: '30d', label: '30 Days', description: 'Last 30 days' },
  { value: '90d', label: '90 Days', description: 'Last 90 days' },
  { value: '1y', label: '1 Year', description: 'Last 12 months' },
  { value: 'custom', label: 'Custom', description: 'Select custom date range' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  period,
  customDateRange,
  onPeriodChange,
  onCustomDateRangeChange,
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    if (customDateRange) {
      onCustomDateRangeChange({
        startDate,
        endDate: customDateRange.endDate,
      });
    } else {
      onCustomDateRangeChange({
        startDate,
        endDate: new Date().toISOString().split('T')[0], // Today
      });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    if (customDateRange) {
      onCustomDateRangeChange({
        startDate: customDateRange.startDate,
        endDate,
      });
    } else {
      // If no custom range exists, set start date to 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      onCustomDateRangeChange({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate,
      });
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Time Period
      </label>
      
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {periodOptions.map((option) => {
          const isSelected = period === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onPeriodChange(option.value)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
                'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              title={option.description}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Inputs */}
      {period === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={customDateRange?.startDate || ''}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                max={customDateRange?.endDate || new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={customDateRange?.endDate || ''}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={customDateRange?.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
