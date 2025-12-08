import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '@admin/types/chart.types';
import { format, parseISO } from 'date-fns';

interface BarChartComponentProps {
  data: ChartDataPoint[];
  height: number;
  title: string;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
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
          <p className="text-sm text-green-600 dark:text-green-400">
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
        <BarChart
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
          <Bar
            dataKey="value"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            name="Value"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
