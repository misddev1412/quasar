import React, { useState } from 'react';
import withAdminSeo from '@admin/components/SEO/withAdminSeo';
import { AdminSeoData } from '@admin/hooks/useAdminSeo';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { FiHome } from 'react-icons/fi';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import BaseLayout from '../components/layout/BaseLayout';
import { trpc } from '../utils/trpc';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Define the static SEO data for the home page
const homeSeoData: AdminSeoData = {
  path: '/',
  title: 'Dashboard | Quasar Admin',
  description: 'Welcome to Quasar Admin Dashboard - Manage your application with ease',
  keywords: 'dashboard, admin, quasar, management',
  ogTitle: 'Quasar Admin Dashboard',
  ogDescription: 'Powerful admin dashboard for managing your application',
  ogType: 'website'
};

export const HomePage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch real user statistics
  const { data: userStats, isLoading: statsLoading } = trpc.adminUserStatistics.getUserStatistics.useQuery();
  
  // Fetch real chart data for user growth
  const { data: userGrowthData, isLoading: chartLoading } = trpc.adminChartData.getChartData.useQuery({
    statisticId: 'total-users',
    chartType: 'line',
    period: selectedPeriod
  });

  // Fetch posts data for content statistics
  const { data: postsData } = trpc.adminPosts.getPosts.useQuery({ limit: 1, page: 1 });

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Process real statistics data with proper type handling
  const statsData = (userStats as any)?.data;
  const processedStats = statsData ? [
    {
      title: t('dashboard.stats.total_users'),
      value: statsData.totalUsers?.value?.toLocaleString() || '0',
      change: statsData.totalUsers?.trend ? 
        `${statsData.totalUsers.trend.isPositive ? '+' : ''}${statsData.totalUsers.trend.label}` : 'N/A',
      positive: statsData.totalUsers?.trend?.isPositive ?? true,
      icon: <PeopleIcon />,
      bgColor: 'bg-blue-500/90'
    },
    {
      title: t('dashboard.stats.active_users'),
      value: statsData.activeUsers?.value?.toLocaleString() || '0',
      change: statsData.activeUsers?.trend ? 
        `${statsData.activeUsers.trend.isPositive ? '+' : ''}${statsData.activeUsers.trend.label}` : 'N/A',
      positive: statsData.activeUsers?.trend?.isPositive ?? true,
      icon: <VisibilityIcon />,
      bgColor: 'bg-cyan-500/90'
    },
    {
      title: t('dashboard.stats.new_users_month'),
      value: statsData.newUsersThisMonth?.value?.toLocaleString() || '0',
      change: statsData.newUsersThisMonth?.trend ? 
        `${statsData.newUsersThisMonth.trend.isPositive ? '+' : ''}${statsData.newUsersThisMonth.trend.label}` : 'N/A',
      positive: statsData.newUsersThisMonth?.trend?.isPositive ?? true,
      icon: <TrendingUpIcon />,
      bgColor: 'bg-emerald-500/90'
    },
    {
      title: t('dashboard.stats.users_with_profiles'),
      value: statsData.usersWithProfiles?.percentage ? `${statsData.usersWithProfiles.percentage.toFixed(1)}%` : '0%',
      change: statsData.usersWithProfiles?.value ? `${statsData.usersWithProfiles.value} users` : '0 users',
      positive: (statsData.usersWithProfiles?.percentage || 0) > 50,
      icon: <DescriptionIcon />,
      bgColor: 'bg-amber-500/90'
    }
  ] : [
    {
      title: t('dashboard.stats.total_users'),
      value: 'Loading...',
      change: 'N/A',
      positive: true,
      icon: <PeopleIcon />,
      bgColor: 'bg-blue-500/90'
    },
    {
      title: t('dashboard.stats.active_users'),
      value: 'Loading...',
      change: 'N/A',
      positive: true,
      icon: <VisibilityIcon />,
      bgColor: 'bg-cyan-500/90'
    },
    {
      title: t('dashboard.stats.new_users_month'),
      value: 'Loading...',
      change: 'N/A',
      positive: true,
      icon: <TrendingUpIcon />,
      bgColor: 'bg-emerald-500/90'
    },
    {
      title: t('dashboard.stats.users_with_profiles'),
      value: 'Loading...',
      change: 'N/A',
      positive: true,
      icon: <DescriptionIcon />,
      bgColor: 'bg-amber-500/90'
    }
  ];

  // Process chart data for user growth with proper type handling
  const chartDataRaw = (userGrowthData as any)?.data?.data;
  const chartData = chartDataRaw && Array.isArray(chartDataRaw) ? chartDataRaw.map((item: any) => ({
    date: item.date ? new Date(item.date).toLocaleDateString() : '',
    value: item.value || 0,
    label: item.label || ''
  })) : [];

  return (
    <BaseLayout
      title={t('dashboard.title')}
      description={t('dashboard.welcome_back')}
      breadcrumbs={[
        {
          label: t('navigation.dashboard', 'Dashboard'),
          icon: <FiHome className="h-4 w-4" />,
        }
      ]}
    >
      <div className="space-y-6">

        {/* Real Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {processedStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="p-4 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <div className={`flex items-center ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.positive ? (
                    <TrendingUpIcon fontSize="small" className="mr-1" />
                  ) : (
                    <TrendingDownIcon fontSize="small" className="mr-1" />
                  )}
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
              <div className={`${stat.bgColor} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{t('dashboard.chart.user_growth')}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPeriod('7d')}
                className={`px-3 py-1 text-sm rounded cursor-pointer transition-colors ${
                  selectedPeriod === '7d' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-100'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setSelectedPeriod('30d')}
                className={`px-3 py-1 text-sm rounded cursor-pointer transition-colors ${
                  selectedPeriod === '30d' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-100'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setSelectedPeriod('90d')}
                className={`px-3 py-1 text-sm rounded cursor-pointer transition-colors ${
                  selectedPeriod === '90d' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-100'
                }`}
              >
                90D
              </button>
            </div>
          </div>
          {chartLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available for the selected period
            </div>
          )}
        </div>

        {/* User Activity Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-medium mb-4">{t('dashboard.chart.user_activity')}</h2>
          {statsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : statsData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active Users', value: statsData.activeUsers?.value || 0, color: COLORS[0] },
                    { name: 'Total Users', value: Math.max(0, (statsData.totalUsers?.value || 0) - (statsData.activeUsers?.value || 0)), color: COLORS[1] },
                    { name: 'With Profiles', value: statsData.usersWithProfiles?.value || 0, color: COLORS[2] }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Active Users', value: statsData.activeUsers?.value || 0, color: COLORS[0] },
                    { name: 'Inactive Users', value: Math.max(0, (statsData.totalUsers?.value || 0) - (statsData.activeUsers?.value || 0)), color: COLORS[1] },
                    { name: 'With Profiles', value: statsData.usersWithProfiles?.value || 0, color: COLORS[2] }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No user activity data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{t('dashboard.quick_actions')}</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center">
              <PeopleIcon className="mr-3 text-blue-600" />
              <span className="font-medium text-blue-700">Add New User</span>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center">
              <DescriptionIcon className="mr-3 text-green-600" />
              <span className="font-medium text-green-700">Create Post</span>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center">
              <ShoppingCartIcon className="mr-3 text-purple-600" />
              <span className="font-medium text-purple-700">View Reports</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{t('dashboard.system_status')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">Database</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold text-green-700">99.9%</div>
                <div className="text-xs text-green-600">Uptime</div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">API</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Healthy</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold text-blue-700">{chartData.length > 0 ? `${chartData[chartData.length - 1]?.value || 0}` : '0'}</div>
                <div className="text-xs text-blue-600">Last Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </BaseLayout>
  );
};

// Wrap the HomePage component with SEO
export default withAdminSeo(HomePage, homeSeoData); 
