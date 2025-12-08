import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import withAdminSeo from '@admin/components/SEO/withAdminSeo';
import BaseLayout from '@admin/components/layout/BaseLayout';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { AdminSeoData } from '@admin/hooks/useAdminSeo';
import { StatisticsGrid, StatisticData } from '@admin/components/common/StatisticsGrid';
import { Alert, AlertDescription, AlertTitle } from '@admin/components/common/Alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@admin/components/common/Card';
import { Loading } from '@admin/components/common/Loading';
import { Button } from '@admin/components/common/Button';
import { trpc } from '@admin/utils/trpc';
import { useChartData } from '@admin/hooks/useChartData';
import { ChartDataPoint, PieChartDataPoint } from '@admin/types/chart.types';
import {
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiUser,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiArrowRightCircle
} from 'react-icons/fi';
import type { User } from '@admin/types/user';

const userDashboardSeo: AdminSeoData = {
  path: '/users/dashboard',
  title: 'User Management Dashboard | Quasar Admin',
  description: 'Monitor user growth, engagement, and segmentation in real time.',
  keywords: 'user dashboard, admin analytics, user management',
  ogTitle: 'User Management Dashboard',
  ogDescription: 'Track user growth, activity, and conversion funnels.',
  ogType: 'website'
};

const PIE_COLORS = ['#6366F1', '#34D399', '#FBBF24', '#F87171', '#8B5CF6', '#0EA5E9'];

const UserDashboardPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const navigate = useNavigate();

  const breadcrumbs = useMemo(() => ([
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('admin.user_management', 'User Management'), href: '/users' },
    { label: t('admin.user_dashboard', 'User Dashboard'), href: '/users/dashboard' },
  ]), [t]);

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = trpc.adminUserStatistics.getUserStatistics.useQuery();

  const stats = (statisticsData as any)?.data;

  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'total-users',
        title: t('users.dashboard.cards.total_users', 'Total Users'),
        value: stats.totalUsers?.value || 0,
        icon: <FiUsers className="w-5 h-5" />,
        trend: stats.totalUsers?.trend,
        enableChart: true,
      },
      {
        id: 'active-users',
        title: t('users.dashboard.cards.active_users', 'Active Users'),
        value: stats.activeUsers?.value || 0,
        icon: <FiUserCheck className="w-5 h-5" />,
        trend: stats.activeUsers?.trend,
        enableChart: true,
      },
      {
        id: 'new-users',
        title: t('users.dashboard.cards.new_this_month', 'New This Month'),
        value: stats.newUsersThisMonth?.value || 0,
        icon: <FiUserPlus className="w-5 h-5" />,
        trend: stats.newUsersThisMonth?.trend,
        enableChart: true,
      },
      {
        id: 'users-with-profiles',
        title: t('users.dashboard.cards.profile_completion', 'Profile Completion'),
        value: `${stats.usersWithProfiles?.percentage ?? 0}%`,
        icon: <FiUser className="w-5 h-5" />,
        enableChart: true,
      },
      {
        id: 'currently-active',
        title: t('users.dashboard.cards.currently_active', 'Currently Active'),
        value: stats.currentlyActiveUsers?.value || 0,
        icon: <FiActivity className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'recent-activity',
        title: t('users.dashboard.cards.recent_activity', 'Active (24h)'),
        value: stats.recentActivity?.value || 0,
        icon: <FiClock className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [stats, t]);

  const {
    data: growthChart,
    isLoading: growthLoading,
    error: growthError,
  } = useChartData({
    statisticId: 'total-users',
    chartType: 'area',
    period: '90d',
  });

  const {
    data: signupsChart,
    isLoading: signupsLoading,
    error: signupsError,
  } = useChartData({
    statisticId: 'new-users',
    chartType: 'bar',
    period: '30d',
  });

  const {
    data: roleChart,
    isLoading: roleChartLoading,
    error: roleChartError,
  } = useChartData({
    statisticId: 'total-users',
    chartType: 'pie',
    period: '30d',
  });

  const {
    data: recentUsersData,
    isLoading: recentUsersLoading,
    error: recentUsersError,
  } = trpc.adminUser.getAllUsers.useQuery({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  } as any);

  const recentUsers: User[] = useMemo(() => {
    const items = (recentUsersData as any)?.data?.items;
    return Array.isArray(items) ? items : [];
  }, [recentUsersData]);

  const userGrowthSeries = useMemo(() => {
    if (!growthChart || !Array.isArray(growthChart.data) || growthChart.type === 'pie') {
      return [];
    }

    return (growthChart.data as ChartDataPoint[]).map((point) => ({
      date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: point.value,
    }));
  }, [growthChart]);

  const signupSeries = useMemo(() => {
    if (!signupsChart || !Array.isArray(signupsChart.data) || signupsChart.type === 'pie') {
      return [];
    }

    return (signupsChart.data as ChartDataPoint[]).map((point) => ({
      date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: point.value,
    }));
  }, [signupsChart]);

  const roleDistribution = useMemo(() => {
    if (!roleChart || !Array.isArray(roleChart.data) || roleChart.type !== 'pie') {
      return [];
    }

    return roleChart.data as PieChartDataPoint[];
  }, [roleChart]);

  const profileCompletion = Math.min(100, Math.max(0, stats?.usersWithProfiles?.percentage ?? 0));
  const profileCount = stats?.usersWithProfiles?.value || 0;
  const totalUsers = stats?.totalUsers?.value || 0;
  const missingProfiles = Math.max(0, totalUsers - profileCount);

  const quickActions = useMemo(() => ([
    {
      label: t('users.dashboard.actions.invite_user', 'Invite User'),
      description: t('users.dashboard.actions.invite_user_desc', 'Create a new account for a teammate or partner.'),
      onClick: () => navigate('/users/create'),
    },
    {
      label: t('users.dashboard.actions.view_all_users', 'View all users'),
      description: t('users.dashboard.actions.view_all_users_desc', 'Open the full directory with filters and bulk actions.'),
      onClick: () => navigate('/users'),
    },
    {
      label: t('users.dashboard.actions.manage_roles', 'Manage roles & permissions'),
      description: t('users.dashboard.actions.manage_roles_desc', 'Review access policies and assignments.'),
      onClick: () => navigate('/roles'),
    },
  ]), [navigate, t]);

  return (
    <BaseLayout
      title={t('users.dashboard.title', 'User Management Dashboard')}
      description={t('users.dashboard.subtitle', 'Understand how your user base is growing and behaving in real time.')}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('users.dashboard.actions.invite_user', 'Invite User'),
          onClick: () => navigate('/users/create'),
          primary: true,
        },
        {
          label: t('users.dashboard.actions.view_all_users', 'View all users'),
          onClick: () => navigate('/users'),
        },
      ]}
    >
      <div className="space-y-6">
        {statisticsError && (
          <Alert variant="destructive">
            <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
            <AlertDescription>
              {statisticsError.message || t('users.dashboard.errors.stats_failed', 'Failed to load user statistics.')}
            </AlertDescription>
          </Alert>
        )}

        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsLoading}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>{t('users.dashboard.charts.user_growth', 'User growth (90 days)')}</CardTitle>
              <CardDescription>
                {t('users.dashboard.charts.user_growth_description', 'Track cumulative user count to catch growth inflection points.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {growthLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loading size="small" />
                </div>
              ) : growthError ? (
                <Alert variant="destructive">
                  <AlertDescription>{growthError}</AlertDescription>
                </Alert>
              ) : userGrowthSeries.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthSeries} margin={{ left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="text-gray-100" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#6366F1" fill="url(#userGrowthGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('users.dashboard.empty_states.no_growth_data', 'No growth data available for this period.')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('users.dashboard.activity_overview.title', 'Activity overview')}</CardTitle>
              <CardDescription>{t('users.dashboard.activity_overview.subtitle', 'Live view of engagement health.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div>
                    <p className="text-xs uppercase text-gray-500 tracking-wide">{t('users.dashboard.activity_overview.currently_active', 'Currently active')}</p>
                    <p className="text-2xl font-semibold">{stats?.currentlyActiveUsers?.value?.toLocaleString() ?? '—'}</p>
                  </div>
                  <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-full">
                    <FiActivity className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div>
                    <p className="text-xs uppercase text-gray-500 tracking-wide">{t('users.dashboard.activity_overview.recent_active', 'Active last 24h')}</p>
                    <p className="text-2xl font-semibold">{stats?.recentActivity?.value?.toLocaleString() ?? '—'}</p>
                    <p className="text-xs text-gray-500">{stats?.recentActivity?.description}</p>
                  </div>
                  <div className="text-sky-500 bg-sky-50 dark:bg-sky-500/10 p-3 rounded-full">
                    <FiClock className="w-5 h-5" />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 px-4 py-4 dark:border-gray-800">
                  <p className="text-sm text-gray-500">{t('users.dashboard.activity_overview.profile_completion', 'Profile completion rate')}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{profileCompletion}%</span>
                      <span className="text-gray-500">{t('users.dashboard.activity_overview.complete', '{{count}} complete', { count: profileCount.toLocaleString() })}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {t('users.dashboard.activity_overview.missing_profiles', '{{count}} profiles still missing key info', { count: missingProfiles.toLocaleString() })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.dashboard.charts.new_signups', 'New signups (30 days)')}</CardTitle>
              <CardDescription>{t('users.dashboard.charts.new_signups_description', 'Track acquisition spikes from launches and campaigns.')}</CardDescription>
            </CardHeader>
            <CardContent>
              {signupsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loading size="small" />
                </div>
              ) : signupsError ? (
                <Alert variant="destructive">
                  <AlertDescription>{signupsError}</AlertDescription>
                </Alert>
              ) : signupSeries.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={signupSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="text-gray-100" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('users.dashboard.empty_states.no_signup_data', 'No signup data for this range.')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('users.dashboard.charts.role_distribution', 'Role distribution')}</CardTitle>
              <CardDescription>{t('users.dashboard.charts.role_distribution_description', 'Understand how access levels are distributed.')}</CardDescription>
            </CardHeader>
            <CardContent>
              {roleChartLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loading size="small" />
                </div>
              ) : roleChartError ? (
                <Alert variant="destructive">
                  <AlertDescription>{roleChartError}</AlertDescription>
                </Alert>
              ) : roleDistribution.length ? (
                <div className="flex flex-col lg:flex-row lg:items-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                      >
                        {roleDistribution.map((_, index) => (
                          <Cell key={`role-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 lg:mt-0 lg:ml-6 space-y-2">
                    {roleDistribution.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                          <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                        </div>
                        <span className="font-medium">{entry.value?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('users.dashboard.empty_states.no_role_data', 'No role distribution data available.')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>{t('users.dashboard.recent_signups.title', 'Recent signups')}</CardTitle>
              <CardDescription>{t('users.dashboard.recent_signups.subtitle', 'Newest accounts created within your workspace.')}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsersLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loading size="small" />
                </div>
              ) : recentUsersError ? (
                <Alert variant="destructive">
                  <AlertDescription>{recentUsersError.message || t('users.dashboard.errors.recent_users_failed', 'Unable to load recent users.')}</AlertDescription>
                </Alert>
              ) : recentUsers.length ? (
                <div className="-mx-4 space-y-3 sm:-mx-6">
                  {recentUsers.map((user) => {
                    const fullName = user.profile?.firstName && user.profile?.lastName
                      ? `${user.profile.firstName} ${user.profile.lastName}`
                      : user.username;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="group flex w-full items-start justify-start gap-4 rounded-xl border border-gray-100 px-4 py-3 text-left transition hover:border-transparent hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-800 dark:hover:bg-primary-500/80 sm:px-6"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 transition group-hover:text-white dark:text-gray-50">
                            {fullName}
                          </p>
                          <p className="text-sm text-gray-500 transition group-hover:text-white/80">
                            {user.email}
                          </p>
                          <p className="mt-2 text-xs text-gray-500 transition group-hover:text-white/80">
                            {t('users.dashboard.recent_signups.joined', 'Joined {{timeAgo}}', {
                              timeAgo: formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }),
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 transition group-hover:text-white">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium transition group-hover:bg-white/25 group-hover:text-white ${
                              user.isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-200'
                            }`}
                          >
                            {user.isActive
                              ? t('users.status.active', 'Active')
                              : t('users.status.inactive', 'Inactive')}
                          </span>
                          <FiArrowRightCircle className="w-5 h-5 text-gray-400 transition group-hover:text-white" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('users.dashboard.empty_states.no_recent_users', 'No users have signed up recently.')}
                </p>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" onClick={() => navigate('/users')} startIcon={<FiUsers />}>
                  {t('users.dashboard.actions.view_all_users', 'View all users')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('users.dashboard.profile_completion.title', 'Profile completeness')}</CardTitle>
                <CardDescription>{t('users.dashboard.profile_completion.subtitle', 'Encourage richer customer context by nudging users to complete their profile.')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold">{profileCompletion}%</p>
                    <p className="text-sm text-gray-500">
                      {t('users.dashboard.profile_completion.completed', '{{completed}} of {{total}} profiles complete', {
                        completed: profileCount.toLocaleString(),
                        total: totalUsers.toLocaleString(),
                      })}
                    </p>
                  </div>
                  <FiTrendingUp className="w-10 h-10 text-primary-500" />
                </div>
                <div className="mt-4 h-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-3 rounded-full bg-primary-500" style={{ width: `${profileCompletion}%` }} />
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  {t('users.dashboard.profile_completion.missing', '{{count}} profiles missing optional details', {
                    count: missingProfiles.toLocaleString(),
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('users.dashboard.quick_actions.title', 'Quick actions')}</CardTitle>
                <CardDescription>{t('users.dashboard.quick_actions.subtitle', 'Move faster with shortcuts tailored for people operations.')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickActions.map((action) => (
                    <div key={action.label} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{action.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-primary-600 dark:text-primary-300"
                        onClick={action.onClick}
                        endIcon={<FiArrowRightCircle />}
                      >
                        {t('users.dashboard.quick_actions.go', 'Open')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(UserDashboardPage, userDashboardSeo);
