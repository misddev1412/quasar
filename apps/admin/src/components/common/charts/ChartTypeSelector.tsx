import React from 'react';
import { ChartTypeSelectorProps, ChartType } from '@admin/types/chart.types';
import { BarChart3, LineChart, PieChart, AreaChart } from 'lucide-react';
import { cn } from '@admin/lib/utils';

const chartTypeConfig = {
  line: {
    icon: LineChart,
    label: 'Line Chart',
    description: 'Show trends over time',
  },
  bar: {
    icon: BarChart3,
    label: 'Bar Chart',
    description: 'Compare values',
  },
  pie: {
    icon: PieChart,
    label: 'Pie Chart',
    description: 'Show proportions',
  },
  area: {
    icon: AreaChart,
    label: 'Area Chart',
    description: 'Show cumulative trends',
  },
};

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  availableTypes = ['line', 'bar', 'pie', 'area'],
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Chart Type
      </label>
      <div className="flex flex-wrap gap-2">
        {availableTypes.map((type) => {
          const config = chartTypeConfig[type];
          const Icon = config.icon;
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200',
                'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
              title={config.description}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
