'use client';

import React from 'react';
import {
  TotalVisitorsCard,
  TotalPageViewsCard,
  AvgSessionDurationCard,
  BounceRateCard
} from './VisitorStatsCard';
import { TopPagesWidget } from './TopPagesWidget';
import { Card, CardHeader, CardBody } from '../common/Card';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export interface PublicVisitorStats {
  totalVisitors: number;
  totalPageViews: number;
  topPages: Array<{
    url: string;
    title: string;
    views: number;
  }>;
  lastUpdated: string;
}

export interface VisitorStatsSectionProps {
  stats: PublicVisitorStats;
  showTopPages?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function VisitorStatsSection({
  stats,
  showTopPages = true,
  className = '',
  title = "Live Visitor Statistics",
  subtitle = "Real-time insights into store performance"
}: VisitorStatsSectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalVisitorsCard totalVisitors={stats.totalVisitors} />
        <TotalPageViewsCard totalPageViews={stats.totalPageViews} />

        {/* These would need additional data from the API - using placeholders */}
        <AvgSessionDurationCard avgDuration={0} />
        <BounceRateCard bounceRate={0} />
      </div>

      {/* Top Pages */}
      {showTopPages && stats.topPages.length > 0 && (
        <TopPagesWidget
          pages={stats.topPages.map(page => ({
            ...page,
            uniqueViews: page.views,
            views: page.views,
          }))}
          title="Most Visited Pages"
          showMetrics="uniqueViews"
          maxPages={5}
        />
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </section>
  );
}

export function CompactVisitorStats({
  stats,
  className = ''
}: {
  stats: PublicVisitorStats;
  className?: string;
}) {
  return (
    <Card variant="outlined" className={className}>
      <CardBody className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Live Stats
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Visitors</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {stats.totalVisitors.toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Page Views</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {stats.totalPageViews.toLocaleString()}
              </p>
            </div>

            {stats.topPages.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Top Page</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-32">
                  {stats.topPages[0]?.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function VisitorStatsDashboard({
  stats,
  className = ''
}: {
  stats: PublicVisitorStats;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      <div className="lg:col-span-2">
        <VisitorStatsSection
          stats={stats}
          title="Visitor Analytics"
          subtitle="Monitor your store's performance and user engagement"
          showTopPages={true}
        />
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Overview
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Visitors</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.totalVisitors.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Page Views</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.totalPageViews.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pages per Visitor</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.totalVisitors > 0
                  ? (stats.totalPageViews / stats.totalVisitors).toFixed(1)
                  : '0'
                }
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Top Performing Page</span>
              </div>
              <div className="mt-2">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {stats.topPages[0]?.title || 'No data'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {stats.topPages[0]?.url || ''}
                </p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.topPages[0]?.views?.toLocaleString() || 0} views
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Mini Top Pages */}
        {stats.topPages.length > 0 && (
          <TopPagesWidget
            pages={stats.topPages.slice(0, 3).map(page => ({
              ...page,
              uniqueViews: page.views,
              views: page.views,
            }))}
            title="Top 3 Pages"
            showMetrics="uniqueViews"
            maxPages={3}
          />
        )}
      </div>
    </div>
  );
}