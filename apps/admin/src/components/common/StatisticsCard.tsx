import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@admin/lib/utils';
import { BarChart3 } from 'lucide-react';
import { ChartModal } from './ChartModal';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  // Chart functionality props
  enableChart?: boolean;
  statisticId?: string;
}

interface StatisticsSkeletonProps {
  className?: string;
}

export const StatisticsSkeleton: React.FC<StatisticsSkeletonProps> = ({ className }) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon,
  isLoading = false,
  className,
  trend,
  enableChart = false,
  statisticId,
}) => {
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  if (isLoading) {
    return <StatisticsSkeleton className={className} />;
  }

  const handleChartClick = () => {
    if (enableChart && statisticId) {
      setIsChartModalOpen(true);
    }
  };

  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-shadow duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
            {enableChart && statisticId && (
              <button
                onClick={handleChartClick}
                className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="View chart"
                aria-label="View chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {trend && (
            <div className="flex items-center text-sm">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  trend.isPositive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Chart Modal */}
      {enableChart && statisticId && (
        <ChartModal
          isOpen={isChartModalOpen}
          onClose={() => setIsChartModalOpen(false)}
          statisticId={statisticId}
          title={title}
        />
      )}
    </Card>
  );
};

export default StatisticsCard;
