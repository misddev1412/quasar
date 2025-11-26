import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { StatisticData, StatisticsGrid } from '../common/StatisticsGrid';
import { DateRangePicker } from '../common/charts/DateRangePicker';
import { LineChartComponent } from '../common/charts/LineChart';
import { PieChartComponent } from '../common/charts/PieChart';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MousePointer,
  Activity
} from 'lucide-react';
import { TimePeriod } from '@admin/types/chart.types';

const DEFAULT_PERIOD: TimePeriod = '30d';

const getRangeFromPeriod = (period: TimePeriod) => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
};

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

interface VisitorStatisticsData {
  visitors: {
    totalVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    visitorsBySource: Array<{
      source: string;
      count: number;
      percentage: number;
    }>;
  };
  sessions: {
    totalSessions: number;
    avgDuration: number;
    avgPageViews: number;
    bounceRate: number;
  };
  pageViews: {
    totalPageViews: number;
    pageViewsByType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
  realTime: {
    visitors: number;
    sessions: number;
    pageViews: number;
    activeSessions: number;
  };
  trends: {
    daily: Array<{
      date: string;
      visitors: number;
      sessions: number;
      pageViews: number;
    }>;
    weekly: Array<{
      week: string;
      visitors: number;
      sessions: number;
      pageViews: number;
    }>;
  };
  topPages: Array<{
    url: string;
    title: string;
    uniqueViews: number;
    totalViews: number;
  }>;
  devices: {
    deviceTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    browsers: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    operatingSystems: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
  };
  geographic: {
    topCountries: Array<{
      country: string;
      count: number;
      percentage: number;
    }>;
    topCities: Array<{
      city: string;
      count: number;
      percentage: number;
    }>;
  };
}

interface VisitorStatisticsDashboardProps {
  data?: VisitorStatisticsData;
  isLoading?: boolean;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  initialDateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export const VisitorStatisticsDashboard: React.FC<VisitorStatisticsDashboardProps> = ({
  data,
  isLoading = false,
  onDateRangeChange,
  initialDateRange
}) => {
  const initialRange = initialDateRange || getRangeFromPeriod(DEFAULT_PERIOD);
  const [dateRange, setDateRange] = useState(initialRange);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    initialDateRange ? 'custom' : DEFAULT_PERIOD
  );
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | undefined>(
    initialDateRange
      ? {
          startDate: formatDateForInput(initialRange.startDate),
          endDate: formatDateForInput(initialRange.endDate)
        }
      : undefined
  );

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);

    if (period === 'custom') {
      setCustomDateRange(prev => prev || {
        startDate: formatDateForInput(dateRange.startDate),
        endDate: formatDateForInput(dateRange.endDate)
      });
      return;
    }

    const range = getRangeFromPeriod(period);
    setDateRange(range);
    setCustomDateRange(undefined);
    onDateRangeChange?.(range.startDate, range.endDate);
  };

  const handleCustomDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setCustomDateRange(range);
    setSelectedPeriod('custom');

    if (range.startDate && range.endDate) {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);

      setDateRange({ startDate, endDate });
      onDateRangeChange?.(startDate, endDate);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Visitor Analytics
          </h2>
          <DateRangePicker
            period={selectedPeriod}
            customDateRange={customDateRange}
            onPeriodChange={handlePeriodChange}
            onCustomDateRangeChange={handleCustomDateRangeChange}
          />
        </div>

        <StatisticsGrid statistics={[]} isLoading skeletonCount={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Select a date range to view visitor statistics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const returningVisitorsPercentage = data.visitors.totalVisitors
    ? (data.visitors.returningVisitors / data.visitors.totalVisitors) * 100
    : 0;

  const overviewStats: StatisticData[] = [
    {
      id: 'total-visitors',
      title: 'Total Visitors',
      value: data.visitors.totalVisitors,
      icon: <Users className="w-5 h-5" />,
      trend: {
        value: Number(returningVisitorsPercentage.toFixed(1)),
        isPositive: true,
        label: 'returning visitors'
      }
    },
    {
      id: 'total-sessions',
      title: 'Total Sessions',
      value: data.sessions.totalSessions,
      icon: <Activity className="w-5 h-5" />,
      trend: {
        value: data.sessions.bounceRate,
        isPositive: data.sessions.bounceRate < 50,
        label: 'bounce rate'
      }
    },
    {
      id: 'page-views',
      title: 'Page Views',
      value: data.pageViews.totalPageViews,
      icon: <Eye className="w-5 h-5" />,
      trend: {
        value: data.sessions.avgPageViews,
        isPositive: data.sessions.avgPageViews > 3,
        label: 'avg pages per session'
      }
    },
    {
      id: 'avg-session-duration',
      title: 'Avg Session Duration',
      value: formatDuration(data.sessions.avgDuration),
      icon: <Clock className="w-5 h-5" />,
      trend: {
        value: 15,
        isPositive: true,
        label: 'from last period'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Visitor Analytics
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor your website traffic and user behavior
          </p>
        </div>
        <DateRangePicker
          period={selectedPeriod}
          customDateRange={customDateRange}
          onPeriodChange={handlePeriodChange}
          onCustomDateRangeChange={handleCustomDateRangeChange}
        />
      </div>

      {/* Overview Stats */}
      <StatisticsGrid statistics={overviewStats} />

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.realTime.activeSessions}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Active Sessions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.realTime.visitors}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Current Visitors
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.realTime.pageViews}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page Views (Today)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(data.realTime.pageViews / data.realTime.sessions).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pages/Session
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={data.trends.daily.map(item => ({
                date: item.date,
                value: item.visitors,
                label: `${item.visitors} visitors`
              }))}
              height={300}
              title="Daily Visitors"
            />
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={data.visitors.visitorsBySource.map(item => ({
                name: item.source,
                value: item.count,
                percentage: item.percentage
              }))}
              height={300}
              title="Visitors by Source"
            />
          </CardContent>
        </Card>
      </div>

      {/* Device and Geographic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.devices.deviceTypes.map((device, index) => (
                <div key={device.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(device.type)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {device.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {device.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({device.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.geographic.topCountries.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {country.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {country.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({country.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Browsers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.devices.browsers.slice(0, 5).map((browser, index) => (
                <div key={browser.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {browser.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {browser.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({browser.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPages.map((page, index) => (
              <div key={page.url} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {page.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {page.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unique Views</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {page.uniqueViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {page.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorStatisticsDashboard;
