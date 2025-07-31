import React from 'react';
import { StatisticsCard, StatisticsSkeleton } from './StatisticsCard';
import { cn } from '@admin/lib/utils';

export interface StatisticData {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  // Chart functionality
  enableChart?: boolean;
}

interface StatisticsGridProps {
  statistics: StatisticData[];
  isLoading?: boolean;
  className?: string;
  skeletonCount?: number;
}

export const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  statistics,
  isLoading = false,
  className,
  skeletonCount = 4,
}) => {
  if (isLoading) {
    return (
      <div className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
        className
      )}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <StatisticsSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (statistics.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center p-8 text-gray-500 dark:text-gray-400',
        className
      )}>
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
      className
    )}>
      {statistics.map((stat) => (
        <StatisticsCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          enableChart={stat.enableChart}
          statisticId={stat.id}
        />
      ))}
    </div>
  );
};

export default StatisticsGrid;
