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
import { OrderTransactionModal } from '../../components/orders/OrderTransactionModal';
import type { OrderTransactionContext } from '../../components/orders/OrderTransactionModal';

interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  source: 'WEBSITE' | 'MOBILE_APP' | 'PHONE' | 'EMAIL' | 'IN_STORE' | 'SOCIAL_MEDIA' | 'MARKETPLACE';
  totalAmount: number | string;
  amountPaid?: number | string;
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

const formatAmount = (value: unknown) => {
  const numericValue = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : 0;

  if (!Number.isFinite(numericValue)) {
    return '0.00';
  }

  return numericValue.toFixed(2);
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('orders-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['orderNumber', 'customer', 'paymentStatus', 'actions']),
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
  const [transactionModalOrder, setTransactionModalOrder] = useState<OrderTransactionContext | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const defaultColumns = ['orderNumber', 'customer', 'paymentStatus', 'actions'];
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(defaultColumns);
    defaultColumns.forEach((columnId) => initial.add(columnId));
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
    refetch: refetchOrderStats,
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

  const exportFiltersPayload = useMemo(() => {
    const payload: Record<string, unknown> = {};
    if (debouncedSearchValue) {
      payload.search = debouncedSearchValue;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (typeof value === 'string' && value.trim() === '') {
        return;
      }

      payload[key] = value;
    });

    return payload;
  }, [filters, debouncedSearchValue]);

  const handleOpenExportCenter = useCallback(() => {
    const payload = exportFiltersPayload;
    navigate('/orders/exports', {
      state: Object.keys(payload).length ? { filters: payload } : undefined,
    });
  }, [navigate, exportFiltersPayload]);

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
        title: t('orders.statistics.total_orders'),
        value: stats.totalOrders?.toString() || '0',
        icon: React.createElement(FiShoppingBag),
        trend: {
          value: stats.recentOrders || 0,
          isPositive: true,
          label: t('orders.last_30_days'),
        },
      },
      {
        id: 'totalRevenue',
        title: t('orders.statistics.total_revenue'),
        value: `$${stats.totalRevenue?.toLocaleString() || '0'}`,
        icon: React.createElement(FiDollarSign),
        trend: {
          value: stats.recentRevenue || 0,
          isPositive: true,
          label: t('orders.last_30_days'),
        },
      },
      {
        id: 'averageOrderValue',
        title: t('orders.statistics.avg_order_value'),
        value: `$${stats.averageOrderValue?.toFixed(2) || '0.00'}`,
        icon: React.createElement(FiActivity),
      },
      {
        id: 'pendingOrders',
        title: t('orders.statistics.pending_orders'),
        value: stats.statusStats?.PENDING?.toString() || '0',
        icon: React.createElement(FiClock),
      },
    ];
  }, [statsData, t]);

  // Define table columns
  const compactActionButtonClasses = 'group/action-btn gap-1 h-9 px-2 text-xs font-medium rounded-full border border-slate-200/70 dark:border-slate-700/70 !justify-start overflow-hidden';
  const compactActionIconClasses = 'h-4 w-4 flex-shrink-0';
  const compactActionLabelClasses = 'inline-flex items-center whitespace-nowrap overflow-hidden max-w-0 opacity-0 -translate-x-2 transition-[max-width,opacity,transform] duration-300 ease-out group-hover/action-btn:max-w-[140px] group-hover/action-btn:opacity-100 group-hover/action-btn:translate-x-0 group-focus-visible/action-btn:max-w-[140px] group-focus-visible/action-btn:opacity-100 group-focus-visible/action-btn:translate-x-0';
  const columns: Column<Order>[] = useMemo(() => [
    {
      id: 'orderNumber',
      header: t('orders.order_number'),
      accessor: (order) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">#{order.orderNumber}</span>
            <Badge variant={getStatusBadgeVariant(order.status) as any}>
              {t(`orders.status_types.${order.status}`)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span>{new Date(order.orderDate).toLocaleDateString()}</span>
            <span>&bull;</span>
            <span>{t(`orders.source_types.${order.source}`)}</span>
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'customer',
      header: t('orders.customer'),
      accessor: (order) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
          <div className="text-xs text-gray-500">{order.customerEmail}</div>
        </div>
      ),
    },
    {
      id: 'paymentStatus',
      header: t('orders.payment'),
      accessor: (order) => (
        <div className="text-sm">
          <div className="mb-1">
            <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any}>
              {t(`orders.payment_status_types.${order.paymentStatus}`)}
            </Badge>
          </div>
          <div className="font-medium text-gray-900">
            {order.currency} {formatAmount(order.amountPaid ?? 0)}
            <span className="text-xs text-gray-500">
              {' / '}
              {formatAmount(order.totalAmount)}
            </span>
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'actions',
      header: t('orders.actions'),
      accessor: (order) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={compactActionButtonClasses}
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/orders/${order.id}`);
            }}
          >
            <FiEye className={compactActionIconClasses} />
            <span className={compactActionLabelClasses}>
              {t('orders.view')}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={compactActionButtonClasses}
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/orders/fulfillments/new?orderId=${encodeURIComponent(order.id)}`);
            }}
          >
            <FiPackage className={compactActionIconClasses} />
            <span className={compactActionLabelClasses}>
              {t('orders.fulfill_order', 'Fulfill order')}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={compactActionButtonClasses}
            onClick={(event) => {
              event.stopPropagation();
              setTransactionModalOrder({
                id: order.id,
                orderNumber: order.orderNumber,
                customerId: order.customerId,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                currency: order.currency,
                totalAmount: order.totalAmount,
              });
            }}
          >
            <FiDollarSign className={compactActionIconClasses} />
            <span className={compactActionLabelClasses}>
              {t('orders.record_transaction', 'Record transaction')}
            </span>
          </Button>
          <Dropdown
            button={
              <Button
                variant="ghost"
                size="sm"
                className={`${compactActionButtonClasses} px-0`}
                onClick={(event) => event.stopPropagation()}
              >
                <FiMoreVertical className={compactActionIconClasses} />
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
      onClick: handleOpenExportCenter,
      icon: <FiDownload />,
    },
    {
      label: t('orders.refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('orders.hide_filters') : t('orders.show_filters'),
      onClick: () => setShowFilters(!showFilters),
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [navigate, handleRefresh, showFilters, t, handleOpenExportCenter]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: t('orders.title'),
      icon: <FiShoppingBag className="w-4 h-4" />
    }
  ]), [t]);

  if (ordersLoading) {
    return (
      <BaseLayout
        title={t('orders.title')}
        description={t('orders.manage_and_track_customer_orders')}
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

  if (ordersError) {
    return (
      <BaseLayout
        title={t('orders.title')}
        description={t('orders.manage_and_track_customer_orders')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('orders.error_loading_orders')}</AlertTitle>
          <AlertDescription>
            {ordersError.message || t('orders.something_went_wrong_loading_orders')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('orders.title')}
      description={t('orders.manage_and_track_customer_orders')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
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
                  {t('orders.status')}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('orders.all_statuses')}</option>
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
                  {t('orders.payment_status')}
                </label>
                <select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFiltersChange({ ...filters, paymentStatus: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('orders.all_payment_statuses')}</option>
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
                  {t('orders.source')}
                </label>
                <select
                  value={filters.source || ''}
                  onChange={(e) => handleFiltersChange({ ...filters, source: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('orders.all_sources')}</option>
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
          searchPlaceholder={t('orders.search_placeholder')}
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
          emptyMessage={t('orders.no_orders_found')}
          emptyAction={{
            label: t('orders.new_order'),
            onClick: () => navigate('/orders/new'),
            icon: <FiPlus />,
          }}
        />
      </div>

      {transactionModalOrder && (
        <OrderTransactionModal
          isOpen={Boolean(transactionModalOrder)}
          order={transactionModalOrder}
          onClose={() => setTransactionModalOrder(null)}
          onSuccess={() => {
            refetchOrders();
            refetchOrderStats();
          }}
        />
      )}
    </BaseLayout>
  );
};

export default OrdersPage;
