import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiEdit,
  FiMoreVertical,
} from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Dropdown } from '../../../components/common/Dropdown';
import { Table, Column } from '../../../components/common/Table';
import { Badge } from '../../../components/common/Badge';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useToast } from '../../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { Loading } from '../../../components/common/Loading';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { trpc } from '../../../utils/trpc';

interface Fulfillment {
  id: string;
  fulfillmentNumber: string;
  orderNumber: string;
  customerName: string;
  status: 'PENDING' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  priorityLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  shippingProvider?: {
    name: string;
    code: string;
  };
  trackingNumber?: string;
  shippedDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalItems: number;
  fulfilledItems: number;
  shippingCost: number;
  createdAt: string;
  isOverdue: boolean;
}

type FulfillmentStatus = Fulfillment['status'];
type FulfillmentPriority = Fulfillment['priorityLevel'];

interface FulfillmentFilters {
  status?: FulfillmentStatus;
  priorityLevel?: FulfillmentPriority;
  shippingProviderId?: string;
  hasTrackingNumber?: boolean;
  isOverdue?: boolean;
  search?: string;
}

const OrderFulfillmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<FulfillmentFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: fulfillmentsData, isLoading, error: fulfillmentsError, refetch } = trpc.orderFulfillments.getAll.useQuery({
    page,
    limit,
    search: searchValue,
    status: filters.status,
    priorityLevel: filters.priorityLevel,
    hasTrackingNumber: filters.hasTrackingNumber,
    isOverdue: filters.isOverdue,
    orderId: orderId ? `ORD-${orderId}` : undefined,
  });

  const updateStatusMutation = trpc.orderFulfillments.updateStatus.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('fulfillments.status_updated'),
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error.message,
      });
    },
  });

  const updateTrackingMutation = trpc.orderFulfillments.updateTracking.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('fulfillments.tracking_updated'),
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (fulfillmentsData) {
      const items = Array.isArray((fulfillmentsData as any)?.items)
        ? (fulfillmentsData as any).items
        : Array.isArray((fulfillmentsData as any)?.data)
          ? (fulfillmentsData as any).data
          : Array.isArray((fulfillmentsData as any)?.data?.items)
            ? (fulfillmentsData as any).data.items
            : [];
      const totalValue = typeof (fulfillmentsData as any)?.total === 'number'
        ? (fulfillmentsData as any).total
        : typeof (fulfillmentsData as any)?.data?.total === 'number'
          ? (fulfillmentsData as any).data.total
          : items.length;

      setFulfillments(items);
      setTotal(totalValue);
    }
  }, [fulfillmentsData]);

  const handleStatusUpdate = (id: string, status: FulfillmentStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleTrackingUpdate = (id: string, trackingNumber: string) => {
    updateTrackingMutation.mutate({ id, trackingNumber });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'PACKED':
        return 'info';
      case 'SHIPPED':
        return 'success';
      case 'IN_TRANSIT':
        return 'success';
      case 'OUT_FOR_DELIVERY':
        return 'success';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'RETURNED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'secondary';
      case 'NORMAL':
        return 'default';
      case 'HIGH':
        return 'warning';
      case 'URGENT':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const columns: Column<Fulfillment>[] = [
    {
      id: 'fulfillmentNumber',
      header: t('fulfillments.fulfillment_number'),
      accessor: (fulfillment) => (
        <div className="font-medium">
          <div className="text-sm font-semibold text-gray-900">{fulfillment.fulfillmentNumber}</div>
          <div className="text-xs text-gray-500">{new Date(fulfillment.createdAt).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      id: 'order',
      header: t('fulfillments.order'),
      accessor: (fulfillment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{fulfillment.orderNumber}</div>
          <div className="text-xs text-gray-500">{fulfillment.customerName}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: t('fulfillments.status'),
      accessor: (fulfillment) => (
        <Badge variant={getStatusBadgeVariant(fulfillment.status) as any}>
          {t(`fulfillments.status_types.${fulfillment.status}`)}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: t('fulfillments.priority'),
      accessor: (fulfillment) => (
        <Badge variant={getPriorityBadgeVariant(fulfillment.priorityLevel) as any}>
          {t(`fulfillments.priority_types.${fulfillment.priorityLevel}`)}
        </Badge>
      ),
    },
    {
      id: 'shipping',
      header: t('fulfillments.shipping'),
      accessor: (fulfillment) => (
        <div className="text-sm">
          {fulfillment.shippingProvider && (
            <div className="font-medium">{fulfillment.shippingProvider.name}</div>
          )}
          {fulfillment.trackingNumber && (
            <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
              {fulfillment.trackingNumber}
            </div>
          )}
          {!fulfillment.trackingNumber && (
            <div className="text-gray-500">{t('fulfillments.no_tracking')}</div>
          )}
        </div>
      ),
    },
    {
      id: 'progress',
      header: t('fulfillments.progress'),
      accessor: (fulfillment) => {
        const progressPercent = fulfillment.totalItems > 0 ? (fulfillment.fulfilledItems / fulfillment.totalItems) * 100 : 0;
        return (
          <div className="text-sm">
            <div className="flex items-center justify-between mb-1">
              {fulfillment.totalItems > 0 ? (
                <>
                  <span>{fulfillment.fulfilledItems}/{fulfillment.totalItems}</span>
                  <span className="text-gray-500">
                    {Math.round(progressPercent)}%
                  </span>
                </>
              ) : (
                <span className="text-gray-500">0%</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'delivery',
      header: t('fulfillments.delivery'),
      accessor: (fulfillment) => (
        <div className="text-sm">
          {fulfillment.estimatedDeliveryDate && (
            <div>
              <span className="text-gray-600">{t('fulfillments.est_prefix')}</span>{' '}
              {new Date(fulfillment.estimatedDeliveryDate).toLocaleDateString()}
            </div>
          )}
          {fulfillment.actualDeliveryDate && (
            <div className="text-green-600">
              <span>{t('fulfillments.delivered_prefix')}</span>{' '}
              {new Date(fulfillment.actualDeliveryDate).toLocaleDateString()}
            </div>
          )}
          {fulfillment.isOverdue && (
            <div className="text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" />
              {t('fulfillments.overdue')}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('fulfillments.actions'),
      accessor: (fulfillment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/fulfillments/${fulfillment.id}`)}
          >
            <FiEye className="mr-1 h-4 w-4" />
            {t('fulfillments.view')}
          </Button>
          <Dropdown
            button={
              <Button variant="ghost" size="sm">
                <FiMoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: t('fulfillments.edit'),
                icon: React.createElement(FiEdit),
                onClick: () => navigate(`/orders/fulfillments/${fulfillment.id}/edit`),
              },
              {
                label: t('fulfillments.add_tracking'),
                icon: React.createElement(FiTruck),
                onClick: () => {
                  const trackingNumber = prompt(t('fulfillments.enter_tracking_number'));
                  if (trackingNumber) {
                    handleTrackingUpdate(fulfillment.id, trackingNumber);
                  }
                },
                disabled: !!fulfillment.trackingNumber,
              },
              {
                label: t('fulfillments.mark_delivered'),
                icon: React.createElement(FiCheck),
                onClick: () => {
                  handleStatusUpdate(fulfillment.id, 'DELIVERED');
                },
                disabled: fulfillment.status === 'DELIVERED',
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: t('fulfillments.create_fulfillment'),
      onClick: () => navigate('/orders/fulfillments/new'),
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('fulfillments.refresh'),
      onClick: () => refetch(),
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('fulfillments.hide_filters') : t('fulfillments.show_filters'),
      onClick: () => setShowFilters(!showFilters),
      icon: <FiFilter />,
      active: showFilters,
    },
  ];

  const breadcrumbItems = [
    {
      label: t('home'),
      href: '/',
    },
    {
      label: t('orders.title'),
      href: '/orders',
    },
    {
      label: t('fulfillments.title'),
      icon: <FiPackage className="w-4 h-4" />,
    },
  ];

  if (orderId) {
    breadcrumbItems.push({
      label: t('fulfillments.for_order', { orderNumber: `ORD-${orderId}` }),
      icon: <FiPackage className="w-4 h-4" />,
    });
  }

  if (isLoading) {
    return (
      <BaseLayout
        title={t('fulfillments.title')}
        description={t('fulfillments.manage_order_fulfillments')}
        actions={actions}
        breadcrumbs={breadcrumbItems}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (fulfillmentsError) {
    const errorMessage = fulfillmentsError.message || t('common.error', 'Error');
    return (
      <BaseLayout
        title={t('fulfillments.title')}
        description={t('fulfillments.manage_order_fulfillments')}
        actions={actions}
        breadcrumbs={breadcrumbItems}
      >
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('fulfillments.title')}
      description={t('fulfillments.manage_order_fulfillments')}
      actions={actions}
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fulfillments.status')}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value ? (e.target.value as FulfillmentStatus) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('fulfillments.all_statuses')}</option>
                  <option value="PENDING">{t('fulfillments.status_types.PENDING')}</option>
                  <option value="PROCESSING">{t('fulfillments.status_types.PROCESSING')}</option>
                  <option value="PACKED">{t('fulfillments.status_types.PACKED')}</option>
                  <option value="SHIPPED">{t('fulfillments.status_types.SHIPPED')}</option>
                  <option value="IN_TRANSIT">{t('fulfillments.status_types.IN_TRANSIT')}</option>
                  <option value="OUT_FOR_DELIVERY">{t('fulfillments.status_types.OUT_FOR_DELIVERY')}</option>
                  <option value="DELIVERED">{t('fulfillments.status_types.DELIVERED')}</option>
                  <option value="CANCELLED">{t('fulfillments.status_types.CANCELLED')}</option>
                  <option value="RETURNED">{t('fulfillments.status_types.RETURNED')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fulfillments.priority')}
                </label>
                <select
                  value={filters.priorityLevel || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priorityLevel: e.target.value
                        ? (e.target.value as FulfillmentPriority)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('fulfillments.all_priorities')}</option>
                  <option value="LOW">{t('fulfillments.priority_types.LOW')}</option>
                  <option value="NORMAL">{t('fulfillments.priority_types.NORMAL')}</option>
                  <option value="HIGH">{t('fulfillments.priority_types.HIGH')}</option>
                  <option value="URGENT">{t('fulfillments.priority_types.URGENT')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fulfillments.tracking')}
                </label>
                <select
                  value={filters.hasTrackingNumber === undefined ? '' : filters.hasTrackingNumber.toString()}
                  onChange={(e) => setFilters({
                    ...filters,
                    hasTrackingNumber: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('fulfillments.all')}</option>
                  <option value="true">{t('fulfillments.with_tracking')}</option>
                  <option value="false">{t('fulfillments.without_tracking')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('fulfillments.overdue')}
                </label>
                <select
                  value={filters.isOverdue === undefined ? '' : filters.isOverdue.toString()}
                  onChange={(e) => setFilters({
                    ...filters,
                    isOverdue: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('fulfillments.all')}</option>
                  <option value="true">{t('fulfillments.overdue_only')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Fulfillments Table */}
        <Table<Fulfillment>
          columns={columns}
          data={fulfillments}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t('fulfillments.search_placeholder')}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            onPageChange: setPage,
            onItemsPerPageChange: setLimit,
          }}
          emptyMessage={t('fulfillments.no_fulfillments_found')}
          emptyAction={{
            label: t('fulfillments.create_fulfillment'),
            onClick: () => navigate('/orders/fulfillments/new'),
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default OrderFulfillmentsPage;
