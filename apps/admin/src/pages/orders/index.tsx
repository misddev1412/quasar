import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiPackage, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiShoppingBag, FiDollarSign, FiTruck, FiCheck, FiX, FiClock, FiUser, FiHome } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { Badge } from '../../components/common/Badge';
import { Breadcrumb } from '../../components/common/Breadcrumb';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  source: 'WEBSITE' | 'MOBILE_APP' | 'PHONE' | 'EMAIL' | 'IN_STORE' | 'SOCIAL_MEDIA' | 'MARKETPLACE';
  totalAmount: number;
  currency: string;
  itemCount: number;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderFiltersType {
  status?: string;
  paymentStatus?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('orders-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['orderNumber', 'customer', 'status', 'paymentStatus', 'totalAmount', 'source', 'orderDate']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<OrderFiltersType>({
    status: searchParams.get('status') as any || undefined,
    paymentStatus: searchParams.get('paymentStatus') as any || undefined,
    source: searchParams.get('source') as any || undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['orderNumber', 'customer', 'status', 'paymentStatus', 'totalAmount', 'source', 'orderDate', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Debounce search input
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  // Update URL parameters when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (limit !== 10) params.set('limit', limit.toString());
    if (debouncedSearchValue) params.set('search', debouncedSearchValue);
    if (filters.status) params.set('status', filters.status);
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.source) params.set('source', filters.source);
    if (sortBy !== 'orderDate') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    setSearchParams(params);
  }, [page, limit, debouncedSearchValue, filters, sortBy, sortOrder, setSearchParams]);

  // Fetch orders data
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = trpc.adminOrders.list.useQuery({
    page,
    limit,
    search: debouncedSearchValue || undefined,
    status: filters.status as any,
    paymentStatus: filters.paymentStatus as any,
    source: filters.source as any,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
  });

  // Fetch order statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = trpc.adminOrders.stats.useQuery();

  // Handle table sort
  const handleSort = useCallback((sort: SortDescriptor<Order>) => {
    setSortBy(sort.columnAccessor as string);
    setSortOrder(sort.direction);
    setPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setLimit(newPageSize);
    updatePageSize(newPageSize);
    setPage(1);
  }, [updatePageSize]);

  // Handle column visibility change
  const handleVisibleColumnsChange = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(columnId);
      } else {
        newSet.delete(columnId);
      }
      updateVisibleColumns(newSet);
      return newSet;
    });
  }, [updateVisibleColumns]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  // Handle filter change
  const handleFiltersChange = useCallback((newFilters: OrderFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchOrders();
  }, [refetchOrders]);

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'PROCESSING':
        return 'info';
      case 'SHIPPED':
        return 'success';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'RETURNED':
        return 'secondary';
      case 'REFUNDED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Get payment status badge variant
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PARTIALLY_PAID':
        return 'warning';
      case 'FAILED':
        return 'destructive';
      case 'REFUNDED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Prepare statistics data
  const statisticsData: StatisticData[] = useMemo(() => {
    if (!(statsData as any)?.data) return [];

    const stats = (statsData as any).data;
    return [
      {
        id: 'totalOrders',
        title: t('total_orders'),
        value: stats.totalOrders?.toString() || '0',
        icon: React.createElement(FiShoppingBag),
        trend: {
          value: stats.recentOrders || 0,
          isPositive: true,
          label: t('last_30_days'),
        },
      },
      {
        id: 'totalRevenue',
        title: t('total_revenue'),
        value: `$${stats.totalRevenue?.toLocaleString() || '0'}`,
        icon: React.createElement(FiDollarSign),
        trend: {
          value: stats.recentRevenue || 0,
          isPositive: true,
          label: t('last_30_days'),
        },
      },
      {
        id: 'averageOrderValue',
        title: t('avg_order_value'),
        value: `$${stats.averageOrderValue?.toFixed(2) || '0.00'}`,
        icon: React.createElement(FiActivity),
      },
      {
        id: 'pendingOrders',
        title: t('pending_orders'),
        value: stats.statusStats?.PENDING?.toString() || '0',
        icon: React.createElement(FiClock),
      },
    ];
  }, [statsData, t]);

  // Define table columns
  const columns: Column<Order>[] = useMemo(() => [
    {
      id: 'orderNumber',
      header: t('order_number'),
      accessor: (order) => (
        <div className="font-medium">
          <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
          <div className="text-xs text-gray-500">
            {new Date(order.orderDate).toLocaleDateString()}
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'customer',
      header: t('customer'),
      accessor: (order) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
          <div className="text-xs text-gray-500">{order.customerEmail}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: t('status'),
      accessor: (order) => (
        <Badge variant={getStatusBadgeVariant(order.status) as any}>
          {t(`orders.status_types.${order.status}`)}
        </Badge>
      ),
      isSortable: true,
    },
    {
      id: 'paymentStatus',
      header: t('payment'),
      accessor: (order) => (
        <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any}>
          {t(`orders.payment_status_types.${order.paymentStatus}`)}
        </Badge>
      ),
      isSortable: true,
    },
    {
      id: 'totalAmount',
      header: t('total'),
      accessor: (order) => (
        <div className="text-sm font-medium">
          {order.currency} {order.totalAmount.toFixed(2)}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'source',
      header: t('source'),
      accessor: (order) => (
        <div className="text-sm text-gray-600">
          {t(`orders.source_types.${order.source}`)}
        </div>
      ),
    },
    {
      id: 'orderDate',
      header: t('order_date'),
      accessor: (order) => (
        <div className="text-sm text-gray-600">
          {new Date(order.orderDate).toLocaleDateString()}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'actions',
      header: t('orders.actions'),
      accessor: (order) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <FiEye className="mr-1 h-4 w-4" />
            {t('orders.view')}
          </Button>
          <Dropdown
            button={
              <Button variant="ghost" size="sm">
                <FiMoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: t('orders.edit'),
                icon: React.createElement(FiEdit2),
                onClick: () => navigate(`/orders/${order.id}/edit`),
              },
              {
                label: t('orders.mark_as_shipped'),
                icon: React.createElement(FiTruck),
                onClick: () => {
                  // Handle mark as shipped
                },
                disabled: order.status !== 'PROCESSING',
              },
              {
                label: t('orders.mark_as_delivered'),
                icon: React.createElement(FiCheck),
                onClick: () => {
                  // Handle mark as delivered
                },
                disabled: order.status !== 'SHIPPED',
              },
              {
                label: t('orders.cancel_order'),
                icon: React.createElement(FiX),
                onClick: () => {
                  // Handle cancel order
                },
                disabled: !['PENDING', 'CONFIRMED'].includes(order.status),
              },
            ]}
          />
        </div>
      ),
    },
  ], [t, navigate]);

  // Filter columns based on visibility
  const visibleColumnsArray = useMemo(() => {
    return columns.filter(column => visibleColumns.has(column.id));
  }, [columns, visibleColumns]);

  // Actions for BaseLayout
  const actions = useMemo(() => [
    {
      label: t('orders.new_order'),
      onClick: () => navigate('/orders/new'),
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('orders.export'),
      onClick: () => {
        // Handle export
      },
      icon: <FiDownload />,
    },
    {
      label: t('orders.refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('hide_filters') : t('show_filters'),
      onClick: () => setShowFilters(!showFilters),
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [navigate, handleRefresh, showFilters, t]);

  if (ordersLoading) {
    return (
      <BaseLayout title={t('orders.title')} description={t('orders.manage_and_track_customer_orders')} actions={actions} fullWidth={true}>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (ordersError) {
    return (
      <BaseLayout title={t('orders.title')} description={t('orders.manage_and_track_customer_orders')} actions={actions} fullWidth={true}>
        <Alert variant="destructive">
          <AlertTitle>{t('error_loading_orders')}</AlertTitle>
          <AlertDescription>
            {ordersError.message || t('something_went_wrong_loading_orders')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={t('orders.title')} description={t('orders.manage_and_track_customer_orders')} actions={actions} fullWidth={true}>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: t('home'),
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: t('orders.title'),
              icon: <FiShoppingBag className="w-4 h-4" />
            }
          ]}
        />

        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsData}
          isLoading={statsLoading}
          skeletonCount={4}
        />

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status')}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('all_statuses')}</option>
                  <option value="PENDING">{t('orders.status_types.PENDING')}</option>
                  <option value="CONFIRMED">{t('orders.status_types.CONFIRMED')}</option>
                  <option value="PROCESSING">{t('orders.status_types.PROCESSING')}</option>
                  <option value="SHIPPED">{t('orders.status_types.SHIPPED')}</option>
                  <option value="DELIVERED">{t('orders.status_types.DELIVERED')}</option>
                  <option value="CANCELLED">{t('orders.status_types.CANCELLED')}</option>
                  <option value="RETURNED">{t('orders.status_types.RETURNED')}</option>
                  <option value="REFUNDED">{t('orders.status_types.REFUNDED')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('payment_status')}
                </label>
                <select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFiltersChange({ ...filters, paymentStatus: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('all_payment_statuses')}</option>
                  <option value="PENDING">{t('orders.payment_status_types.PENDING')}</option>
                  <option value="PAID">{t('orders.payment_status_types.PAID')}</option>
                  <option value="PARTIALLY_PAID">{t('orders.payment_status_types.PARTIALLY_PAID')}</option>
                  <option value="FAILED">{t('orders.payment_status_types.FAILED')}</option>
                  <option value="REFUNDED">{t('orders.payment_status_types.REFUNDED')}</option>
                  <option value="CANCELLED">{t('orders.payment_status_types.CANCELLED')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('source')}
                </label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => handleFiltersChange({ ...filters, source: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('all_sources')}</option>
                  <option value="WEBSITE">{t('orders.source_types.WEBSITE')}</option>
                  <option value="MOBILE_APP">{t('orders.source_types.MOBILE_APP')}</option>
                  <option value="PHONE">{t('orders.source_types.PHONE')}</option>
                  <option value="EMAIL">{t('orders.source_types.EMAIL')}</option>
                  <option value="IN_STORE">{t('orders.source_types.IN_STORE')}</option>
                  <option value="SOCIAL_MEDIA">{t('orders.source_types.SOCIAL_MEDIA')}</option>
                  <option value="MARKETPLACE">{t('orders.source_types.MARKETPLACE')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Orders Table */}
        <Table<Order>
          tableId="orders-table"
          columns={visibleColumnsArray}
          data={(ordersData as any)?.data?.items || []}
          searchValue={searchValue}
          onSearchChange={handleSearch}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder={t('search_placeholder')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleVisibleColumnsChange}
          showColumnVisibility={true}
          // Sorting
          sortDescriptor={{
            columnAccessor: sortBy as keyof Order,
            direction: sortOrder,
          }}
          onSortChange={handleSort}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(((ordersData as any)?.data?.total || 0) / limit),
            totalItems: (ordersData as any)?.data?.total || 0,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          // Empty state
          emptyMessage={t('no_orders_found')}
          emptyAction={{
            label: t('orders.new_order'),
            onClick: () => navigate('/orders/new'),
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default OrdersPage;