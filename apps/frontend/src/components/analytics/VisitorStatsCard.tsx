'use client';

import React from 'react';
import { Users, Eye, TrendingUp, Globe } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';

export interface VisitorStatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'increase' | 'decrease';
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function VisitorStatsCard({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  format = 'number',
  className = ''
}: VisitorStatsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getIconBgColor = () => {
    switch (variant) {
      case 'increase':
        return 'bg-green-100 dark:bg-green-900';
      case 'decrease':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-blue-100 dark:bg-blue-900';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <Card variant="default" hover className={className}>
      <CardBody className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center text-sm">
              <TrendingUp className={`w-4 h-4 mr-1 ${getChangeColor()}`} />
              <span className={getChangeColor()}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                from last period
              </span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${getIconBgColor()}`}>
          <Icon className={`w-6 h-6 ${getIconColor()}`} />
        </div>
      </CardBody>
    </Card>
  );
}

export function TotalVisitorsCard({
  totalVisitors,
  change,
  className = ''
}: {
  totalVisitors: number;
  change?: number;
  className?: string;
}) {
  return (
    <VisitorStatsCard
      title="Total Visitors"
      value={totalVisitors}
      change={change}
      icon={Users}
      variant={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'default'}
      format="number"
      className={className}
    />
  );
}

export function TotalPageViewsCard({
  totalPageViews,
  change,
  className = ''
}: {
  totalPageViews: number;
  change?: number;
  className?: string;
}) {
  return (
    <VisitorStatsCard
      title="Page Views"
      value={totalPageViews}
      change={change}
      icon={Eye}
      variant={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'default'}
      format="number"
      className={className}
    />
  );
}

export function AvgSessionDurationCard({
  avgDuration,
  change,
  className = ''
}: {
  avgDuration: number;
  change?: number;
  className?: string;
}) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <VisitorStatsCard
      title="Avg. Session Duration"
      value={formatDuration(avgDuration)}
      change={change}
      icon={TrendingUp}
      variant={change && change > 0 ? 'increase' : change && change < 0 ? 'decrease' : 'default'}
      format="number"
      className={className}
    />
  );
}

export function BounceRateCard({
  bounceRate,
  change,
  className = ''
}: {
  bounceRate: number;
  change?: number;
  className?: string;
}) {
  return (
    <VisitorStatsCard
      title="Bounce Rate"
      value={bounceRate}
      change={change}
      icon={Globe}
      variant={change && change < 0 ? 'increase' : change && change > 0 ? 'decrease' : 'default'} // Lower bounce rate is better
      format="percentage"
      className={className}
    />
  );
}