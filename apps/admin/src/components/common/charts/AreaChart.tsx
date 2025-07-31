import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '@admin/types/chart.types';
import { format, parseISO } from 'date-fns';

interface AreaChartComponentProps {
  data: ChartDataPoint[];
  height: number;
  title: string;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  height,
  title,
}) => {
  // Format data for Recharts
  const formattedData = data.map((point) => ({
    ...point,
    formattedDate: format(parseISO(point.date), 'MMM dd'),
    fullDate: format(parseISO(point.date), 'MMM dd, yyyy'),
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.fullDate}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            <span className="font-medium">Value:</span> {payload[0].value.toLocaleString()}
          </p>
          {data.label && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.label}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200 dark:stroke-gray-600"
          />
          <XAxis
            dataKey="formattedDate"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8B5CF6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Value"
            dot={{
              fill: '#8B5CF6',
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: '#7C3AED',
              strokeWidth: 2,
              stroke: '#ffffff',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
