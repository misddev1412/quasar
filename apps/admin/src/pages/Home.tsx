import React, { useCallback, useMemo } from 'react';
import withAdminSeo from '@admin/components/SEO/withAdminSeo';
import { AdminSeoData } from '@admin/hooks/useAdminSeo';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import { FiHome } from 'react-icons/fi';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import BaseLayout from '../components/layout/BaseLayout';
import { trpc } from '../utils/trpc';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useDefaultCurrency } from '../hooks/useDefaultCurrency';

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
  const { data: orderStatsResponse, isLoading: orderStatsLoading } = trpc.adminOrders.stats.useQuery();
  const orderStats = (orderStatsResponse as any)?.data;
  const { defaultCurrency } = useDefaultCurrency();

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const displayCurrencyCode = defaultCurrency.code;
  const preciseFractionDigits = Math.max(0, defaultCurrency.decimalPlaces);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: displayCurrencyCode,
    maximumFractionDigits: 0,
  }), [displayCurrencyCode]);

  const preciseCurrencyFormatter = useMemo(() => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: displayCurrencyCode,
    minimumFractionDigits: preciseFractionDigits,
    maximumFractionDigits: preciseFractionDigits,
  }), [displayCurrencyCode, preciseFractionDigits]);

  const formatCurrencyValue = useCallback((value?: number | null, precise = false) => {
    const formatter = precise ? preciseCurrencyFormatter : currencyFormatter;
    return formatter.format(value ?? 0);
  }, [currencyFormatter, preciseCurrencyFormatter]);

  const statsCards = useMemo(() => {
    const hasStats = Boolean(orderStats);
    const totalOrders = orderStats?.totalOrders || 0;
    const deliveredOrders = orderStats?.statusStats?.DELIVERED || 0;
    const fulfillmentRate = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

    return [
      {
        title: t('dashboard.stats.total_revenue'),
        value: hasStats ? formatCurrencyValue(orderStats?.totalRevenue ?? 0) : '—',
        helper: hasStats
          ? t('dashboard.stats.last_30_days_revenue', { value: formatCurrencyValue(orderStats?.recentRevenue ?? 0) })
          : t('common.loading', 'Loading...'),
        icon: <MonetizationOnIcon />,
        bgColor: 'bg-emerald-500/90',
      },
      {
        title: t('dashboard.stats.total_orders'),
        value: hasStats ? (orderStats?.totalOrders || 0).toLocaleString() : '—',
        helper: hasStats
          ? t('dashboard.stats.last_30_days_orders', { count: (orderStats?.recentOrders || 0).toLocaleString() })
          : t('common.loading', 'Loading...'),
        icon: <ReceiptLongIcon />,
        bgColor: 'bg-blue-500/90',
      },
      {
        title: t('dashboard.stats.avg_order_value'),
        value: hasStats ? formatCurrencyValue(orderStats?.averageOrderValue ?? 0, true) : '—',
        helper: t('dashboard.stats.avg_order_value_helper'),
        icon: <ShowChartIcon />,
        bgColor: 'bg-indigo-500/90',
      },
      {
        title: t('dashboard.stats.fulfillment_rate'),
        value: hasStats ? `${fulfillmentRate}%` : '—',
        helper: hasStats
          ? t('dashboard.stats.fulfillment_rate_helper', { count: deliveredOrders.toLocaleString() })
          : t('common.loading', 'Loading...'),
        icon: <LocalShippingIcon />,
        bgColor: 'bg-amber-500/90',
      },
    ];
  }, [orderStats, t, formatCurrencyValue]);

  const salesTrendData = useMemo(() => {
    if (!orderStats?.recentOrdersList?.length) return [];

    const grouped = orderStats.recentOrdersList.reduce((acc: Record<string, { revenue: number; orders: number }>, order: any) => {
      if (!order?.orderDate) return acc;
      const isoDate = new Date(order.orderDate).toISOString().split('T')[0];
      if (!acc[isoDate]) {
        acc[isoDate] = { revenue: 0, orders: 0 };
      }
      acc[isoDate].revenue += Number(order.totalAmount) || 0;
      acc[isoDate].orders += 1;
      return acc;
    }, {});

    const groupedEntries = Object.entries(grouped) as Array<[string, { revenue: number; orders: number }]>;
    return groupedEntries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        date: new Date(key).toLocaleDateString(),
        revenue: Number(value.revenue.toFixed(2)),
        orders: value.orders,
      }));
  }, [orderStats]);

  const statusDistribution = useMemo(() => {
    if (!orderStats?.statusStats) return [];
    const statusEntries = Object.entries(orderStats.statusStats) as Array<[string, number]>;
    const total = statusEntries.reduce((sum, [, value]) => sum + (Number(value) || 0), 0);

    return statusEntries
      .map(([status, value], index) => {
        const numericValue = Number(value) || 0;
        const percentage = total ? Math.round((numericValue / total) * 100) : 0;
        return {
          status,
          label: t(`orders.status_types.${status}`, status),
          value: numericValue,
          percentage,
          color: COLORS[index % COLORS.length],
        };
      })
      .filter(entry => entry.value > 0);
  }, [orderStats, t]);

  const paymentDistribution = useMemo(() => {
    if (!orderStats?.paymentStats) return [];
    const paymentEntries = Object.entries(orderStats.paymentStats) as Array<[string, number]>;
    return paymentEntries
      .filter(([, value]) => (Number(value) || 0) > 0)
      .map(([status, value]) => ({
        status,
        label: t(`orders.payment_status_types.${status}`, status),
        value: Number(value) || 0,
      }));
  }, [orderStats, t]);

  const salesChannels = useMemo(() => {
    if (!orderStats?.sourceStats) return [];
    const channelEntries = Object.entries(orderStats.sourceStats) as Array<[string, number]>;
    return channelEntries
      .filter(([, value]) => (Number(value) || 0) > 0)
      .map(([source, value], index) => ({
        name: source || t('dashboard.labels.unknown_source', 'Unknown source'),
        value: Number(value) || 0,
        color: COLORS[index % COLORS.length],
      }));
  }, [orderStats, t]);

  const recentOrders = useMemo(() => {
    if (!orderStats?.recentOrdersList) return [];
    return orderStats.recentOrdersList.slice(0, 5);
  }, [orderStats]);

  const topCustomers = useMemo(() => {
    if (!orderStats?.topCustomers) return [];
    return orderStats.topCustomers.slice(0, 5);
  }, [orderStats]);

  const quickActions = useMemo(() => ([
    {
      icon: <AddShoppingCartIcon className="mr-3 text-blue-600" />,
      label: t('dashboard.actions.create_order'),
      description: t('dashboard.actions.create_order_description'),
    },
    {
      icon: <StorefrontIcon className="mr-3 text-emerald-600" />,
      label: t('dashboard.actions.add_product'),
      description: t('dashboard.actions.add_product_description'),
    },
    {
      icon: <CampaignIcon className="mr-3 text-purple-600" />,
      label: t('dashboard.actions.launch_campaign'),
      description: t('dashboard.actions.launch_campaign_description'),
    },
  ]), [t]);

  const renderStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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

        {/* Ecommerce KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="p-4 flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <TrendingUpIcon fontSize="small" className="mr-1 text-emerald-500" />
                    <span>{stat.helper}</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sales performance & status summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{t('dashboard.chart.sales_performance')}</h2>
            </div>
            {orderStatsLoading && !salesTrendData.length ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') {
                        return [formatCurrencyValue(value, true), t('dashboard.stats.total_revenue')];
                      }
                      return [value, t('orders.orders')];
                    }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                {t('dashboard.messages.no_sales_data')}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-medium mb-4">{t('dashboard.chart.order_status_distribution')}</h2>
              {statusDistribution.length > 0 ? (
                <div className="space-y-3">
                  {statusDistribution.map(status => (
                    <div key={status.status}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">{status.label}</span>
                        <span className="font-semibold">{status.value.toLocaleString()} · {status.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${status.percentage}%`, backgroundColor: status.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  {t('dashboard.messages.no_status_data')}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-medium mb-4">{t('dashboard.chart.sales_channel_distribution')}</h2>
              {salesChannels.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={salesChannels} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {salesChannels.map((entry, index) => (
                        <Cell key={`channel-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-gray-500">
                  {t('dashboard.messages.no_channel_data')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions, payment status & sales intelligence */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{t('dashboard.quick_actions')}</h2>
            </div>
            <div className="space-y-3">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex flex-row items-center justify-start gap-3"
                >
                  {action.icon}
                  <div>
                    <p className="font-medium text-gray-900">{action.label}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-medium mb-4">{t('dashboard.chart.payment_status_distribution')}</h2>
            {paymentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={paymentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-500">
                {t('dashboard.messages.no_payment_data')}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-medium mb-4">{t('dashboard.sections.top_customers')}</h2>
            {topCustomers.length > 0 ? (
              <div className="space-y-4">
                {topCustomers.map((customer: any) => (
                  <div key={customer.email} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name || customer.email}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrencyValue(customer.totalSpent ?? 0, true)}</p>
                      <p className="text-sm text-gray-500">{t('orders.orders')}: {customer.orderCount || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-500">
                {t('dashboard.messages.no_customer_data')}
              </div>
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-medium mb-4">{t('dashboard.sections.recent_orders')}</h2>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id || order.orderNumber} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerName || order.customerEmail}</p>
                      <p className="text-xs text-gray-400">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrencyValue(Number(order.totalAmount) || 0, true)}</p>
                      <span className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium ${renderStatusBadgeClasses(order.status)}`}>
                        {t(`orders.status_types.${order.status}`, order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                {t('dashboard.messages.no_recent_orders')}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

// Wrap the HomePage component with SEO
export default withAdminSeo(HomePage, homeSeoData); 
