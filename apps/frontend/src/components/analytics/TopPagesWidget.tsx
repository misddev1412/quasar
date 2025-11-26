'use client';

import React from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';

export interface TopPage {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage?: number;
}

export interface TopPagesWidgetProps {
  pages: TopPage[];
  title?: string;
  showMetrics?: 'views' | 'uniqueViews' | 'both';
  maxPages?: number;
  className?: string;
}

export function TopPagesWidget({
  pages,
  title = "Popular Pages",
  showMetrics = 'uniqueViews',
  maxPages = 5,
  className = ''
}: TopPagesWidgetProps) {
  const formatTimeOnPage = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDisplayValue = (page: TopPage) => {
    switch (showMetrics) {
      case 'views':
        return page.views.toLocaleString();
      case 'uniqueViews':
        return page.uniqueViews.toLocaleString();
      case 'both':
        return `${page.uniqueViews.toLocaleString()} / ${page.views.toLocaleString()}`;
      default:
        return page.uniqueViews.toLocaleString();
    }
  };

  const getMetricLabel = () => {
    switch (showMetrics) {
      case 'views':
        return 'Total Views';
      case 'uniqueViews':
        return 'Unique Views';
      case 'both':
        return 'Unique / Total';
      default:
        return 'Unique Views';
    }
  };

  const displayPages = pages.slice(0, maxPages);

  return (
    <Card variant="default" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-4">
          {displayPages.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No page data available yet
              </p>
            </div>
          ) : (
            displayPages.map((page, index) => (
              <div key={`${page.url}-${index}`} className="flex items-center justify-between group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {page.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {page.url}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  {page.avgTimeOnPage && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Avg. time
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTimeOnPage(page.avgTimeOnPage)}
                      </p>
                    </div>
                  )}

                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getMetricLabel()}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {getDisplayValue(page)}
                    </p>
                  </div>

                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Open ${page.title} in new tab`}
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {pages.length > maxPages && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Showing top {maxPages} of {pages.length} pages
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}