import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '@admin/types/chart.types';
import { format, parseISO } from 'date-fns';

interface LineChartComponentProps {
  data: ChartDataPoint[];
  height: number;
  title: string;
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({
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
          <p className="text-sm text-blue-600 dark:text-blue-400">
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
        <LineChart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{
              fill: '#3B82F6',
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: '#1D4ED8',
              strokeWidth: 2,
              stroke: '#ffffff',
            }}
            name="Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
