import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiTrendingUp, FiUsers, FiAward, FiGift, FiActivity, FiHome, FiCalendar, FiDownload, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { StatisticsGrid, StatisticData } from '../../../components/common/StatisticsGrid';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../contexts/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const LoyaltyStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeRanges: TimeRange[] = [
    { label: t('loyalty.stats.time_ranges.last_7_days', 'Last 7 Days'), value: '7d', days: 7 },
    { label: t('loyalty.stats.time_ranges.last_30_days', 'Last 30 Days'), value: '30d', days: 30 },
    { label: t('loyalty.stats.time_ranges.last_90_days', 'Last 90 Days'), value: '90d', days: 90 },
    { label: t('loyalty.stats.time_ranges.last_12_months', 'Last 12 Months'), value: '12m', days: 365 },
    { label: t('loyalty.stats.time_ranges.all_time', 'All Time'), value: 'all', days: 0 },
  ];

  // Get the number of days from selected time range
  const getTimeRangeDays = (timeRange: string): number => {
    const range = timeRanges.find(r => r.value === timeRange);
    return range ? range.days : 30;
  };

  // Fetch comprehensive loyalty statistics
  const { data: statsData, isLoading, error, refetch } = trpc.adminLoyaltyStats.get.useQuery(
    { days: getTimeRangeDays(selectedTimeRange) },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch dashboard statistics
  const { data: dashboardData, isLoading: dashboardLoading } = trpc.adminLoyaltyStats.dashboard.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch customer engagement statistics
  const { data: engagementData, isLoading: engagementLoading } = trpc.adminLoyaltyStats.customerEngagement.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch tier distribution
  const { data: tierData, isLoading: tierLoading } = trpc.adminLoyaltyStats.tierDistribution.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch reward performance data
  const { data: rewardData, isLoading: rewardLoading } = trpc.adminLoyaltyStats.rewardPerformance.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const stats = (statsData as any)?.data || {};
  const dashboard = (dashboardData as any)?.data || {};
  const engagement = (engagementData as any)?.data || {};
  const tierDistribution = (tierData as any)?.data || {};
  const rewardPerformance = (rewardData as any)?.data || {};

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      addToast({
        type: 'success',
        title: t('common.refreshed', 'Data refreshed'),
        description: t('loyalty.stats.data_refreshed', 'Loyalty statistics have been updated'),
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('loyalty.stats.refresh_error', 'Failed to refresh data'),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    addToast({
      type: 'info',
      title: t('common.feature_coming_soon', 'Feature coming soon'),
      description: t('loyalty.stats.export_coming_soon', 'Export functionality will be available soon')
    });
  };

  // Prepare main statistics cards
  const mainStatisticsCards: StatisticData[] = useMemo(() => {
    return [
      {
        id: 'total-members',
        title: t('loyalty.stats.total_members', 'Total Members'),
        value: stats.totalMembers?.toLocaleString() || '0',
        icon: <FiUsers className="w-5 h-5" />,
        trend: stats.membersTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
        chartData: [],
        chartColor: '#3B82F6',
      },
      {
        id: 'active-members',
        title: t('loyalty.stats.active_members', 'Active Members'),
        value: stats.activeMembers?.toLocaleString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: stats.activeMembersTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
        chartData: [],
        chartColor: '#10B981',
      },
      {
        id: 'total-points-issued',
        title: t('loyalty.stats.total_points_issued', 'Total Points Issued'),
        value: stats.totalPointsIssued?.toLocaleString() || '0',
        icon: <FiAward className="w-5 h-5" />,
        trend: stats.pointsIssuedTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
        chartData: [],
        chartColor: '#8B5CF6',
      },
      {
        id: 'total-points-redeemed',
        title: t('loyalty.stats.total_points_redeemed', 'Total Points Redeemed'),
        value: stats.totalPointsRedeemed?.toLocaleString() || '0',
        icon: <FiGift className="w-5 h-5" />,
        trend: stats.pointsRedeemedTrend || { value: 0, isPositive: false, label: '+0%' },
        enableChart: false,
        chartData: [],
        chartColor: '#F59E0B',
      },
    ];
  }, [stats, t]);

  // Program health statistics
  const programHealthCards: StatisticData[] = useMemo(() => {
    return [
      {
        id: 'engagement-rate',
        title: t('loyalty.stats.engagement_rate', 'Engagement Rate'),
        value: `${stats.engagementRate || 0}%`,
        icon: <FiTrendingUp className="w-5 h-5" />,
        trend: stats.engagementTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'redemption-rate',
        title: t('loyalty.stats.redemption_rate', 'Redemption Rate'),
        value: `${stats.redemptionRate || 0}%`,
        icon: <FiGift className="w-5 h-5" />,
        trend: stats.redemptionTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'avg-points-per-member',
        title: t('loyalty.stats.avg_points_per_member', 'Avg Points per Member'),
        value: (stats.avgPointsPerMember || 0).toLocaleString(),
        icon: <FiBarChart2 className="w-5 h-5" />,
        trend: stats.avgPointsTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'total-tiers',
        title: t('loyalty.stats.total_tiers', 'Total Tiers'),
        value: stats.totalTiers?.toString() || '0',
        icon: <FiAward className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [stats, t]);

  const actions = useMemo(() => [
    {
      label: t('loyalty.stats.export', 'Export Report'),
      onClick: handleExportData,
      icon: <FiDownload />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
      loading: isRefreshing,
    },
  ], [handleRefresh, handleExportData, isRefreshing, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: t('loyalty.title', 'Loyalty Program'),
      href: '/loyalty',
      icon: <FiAward className="w-4 h-4" />
    },
    {
      label: t('loyalty.stats.title', 'Analytics Dashboard'),
      icon: <FiBarChart2 className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('loyalty.stats.title', 'Loyalty Analytics Dashboard')}
        description={t('loyalty.stats.description', 'Comprehensive analytics and insights for your loyalty program')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout
        title={t('loyalty.stats.title', 'Loyalty Analytics Dashboard')}
        description={t('loyalty.stats.description', 'Comprehensive analytics and insights for your loyalty program')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('loyalty.stats.title', 'Loyalty Analytics Dashboard')}
      description={t('loyalty.stats.description', 'Comprehensive analytics and insights for your loyalty program')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedTimeRange === range.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('loyalty.stats.last_updated', 'Last updated')}: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Main Statistics Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('loyalty.stats.overview', 'Program Overview')}
          </h2>
          <StatisticsGrid
            statistics={mainStatisticsCards}
            isLoading={isLoading}
            skeletonCount={4}
          />
        </div>

        {/* Program Health Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('loyalty.stats.program_health', 'Program Health')}
          </h2>
          <StatisticsGrid
            statistics={programHealthCards}
            isLoading={isLoading}
            skeletonCount={4}
          />
        </div>

        {/* Detailed Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Growth Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('loyalty.stats.member_growth', 'Member Growth')}
              </h3>
              <FiUsers className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FiBarChart2 className="w-8 h-8 mx-auto mb-2" />
                <p>{t('loyalty.stats.chart_placeholder', 'Chart visualization coming soon')}</p>
              </div>
            </div>
          </Card>

          {/* Points Flow Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('loyalty.stats.points_flow', 'Points Flow')}
              </h3>
              <FiAward className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FiPieChart className="w-8 h-8 mx-auto mb-2" />
                <p>{t('loyalty.stats.chart_placeholder', 'Chart visualization coming soon')}</p>
              </div>
            </div>
          </Card>

          {/* Tier Distribution */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('loyalty.stats.tier_distribution', 'Tier Distribution')}
              </h3>
              <FiAward className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.tierDistribution?.map((tier: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      index === 0 ? 'from-gray-400 to-gray-600' :
                      index === 1 ? 'from-blue-400 to-blue-600' :
                      index === 2 ? 'from-purple-400 to-purple-600' :
                      'from-yellow-400 to-yellow-600'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tier.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tier.members?.toLocaleString() || 0} members
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tier.percentage || 0}%
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <p>{t('loyalty.stats.no_tier_data', 'No tier distribution data available')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('loyalty.stats.recent_activity', 'Recent Activity')}
              </h3>
              <FiActivity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    activity.type === 'EARN' ? 'bg-green-500' :
                    activity.type === 'SPEND' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-gray-100 truncate">
                      {activity.description}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {activity.customer} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <p>{t('loyalty.stats.no_recent_activity', 'No recent activity')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('loyalty.stats.quick_actions', 'Quick Actions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/loyalty/tiers')}
            >
              <FiAward className="w-4 h-4 mr-2" />
              {t('loyalty.stats.manage_tiers', 'Manage Tiers')}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/loyalty/rewards')}
            >
              <FiGift className="w-4 h-4 mr-2" />
              {t('loyalty.stats.manage_rewards', 'Manage Rewards')}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/loyalty/transactions')}
            >
              <FiCalendar className="w-4 h-4 mr-2" />
              {t('loyalty.stats.view_transactions', 'View Transactions')}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleExportData}
            >
              <FiDownload className="w-4 h-4 mr-2" />
              {t('loyalty.stats.export_full_report', 'Export Full Report')}
            </Button>
          </div>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default LoyaltyStatsPage;