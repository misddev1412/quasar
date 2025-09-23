import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiTruck, FiActivity, FiEdit2, FiTrash2, FiStar, FiHome, FiToggleLeft, FiToggleRight, FiClock, FiPackage } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
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
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { CreateDeliveryMethodModal } from '../../components/delivery-methods/CreateDeliveryMethodModal';
import { EditDeliveryMethodModal } from '../../components/delivery-methods/EditDeliveryMethodModal';

interface DeliveryMethod {
  id: string;
  name: string;
  type: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'SAME_DAY' | 'PICKUP' | 'DIGITAL' | 'COURIER' | 'FREIGHT' | 'OTHER';
  description?: string;
  isActive: boolean;
  sortOrder: number;
  deliveryCost: number;
  costCalculationType: 'FIXED' | 'WEIGHT_BASED' | 'DISTANCE_BASED' | 'FREE';
  freeDeliveryThreshold?: number;
  minDeliveryTimeHours?: number;
  maxDeliveryTimeHours?: number;
  weightLimitKg?: number;
  sizeLimitCm?: string;
  coverageAreas?: string[];
  supportedPaymentMethods?: string[];
  providerName?: string;
  providerApiConfig?: Record<string, any>;
  trackingEnabled: boolean;
  insuranceEnabled: boolean;
  signatureRequired: boolean;
  iconUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryMethodFiltersType {
  search?: string;
  type?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const DeliveryMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Actions for BaseLayout header
  const actions = useMemo(() => [
    {
      label: t('delivery_methods.create'),
      onClick: () => setShowCreateModal(true),
      icon: <FiPlus className="w-4 h-4" />,
      variant: 'primary' as const
    }
  ], [t]);

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('delivery-methods-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['name', 'type', 'deliveryCost', 'deliveryTime', 'status', 'features', 'isDefault', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<DeliveryMethodFiltersType>({
    type: searchParams.get('type') || undefined,
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<DeliveryMethod>>(() => ({
    columnAccessor: (searchParams.get('sortBy') || 'sortOrder') as keyof DeliveryMethod,
    direction: searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'
  }));

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeliveryMethod, setEditingDeliveryMethod] = useState<DeliveryMethod | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', page.toString());
    if (limit !== 10) params.set('limit', limit.toString());
    if (debouncedSearchValue) params.set('search', debouncedSearchValue);
    if (filters.type) params.set('type', filters.type);
    if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());
    if (sortDescriptor.columnAccessor !== 'sortOrder') params.set('sortBy', String(sortDescriptor.columnAccessor));
    if (sortDescriptor.direction !== 'asc') params.set('sortOrder', sortDescriptor.direction);

    setSearchParams(params);
  }, [page, limit, debouncedSearchValue, filters, sortDescriptor, setSearchParams]);

  // tRPC queries
  const {
    data: deliveryMethodsData,
    isLoading,
    error,
    refetch
  } = trpc.adminDeliveryMethods.list.useQuery({
    page,
    limit,
    type: filters.type as any,
    isActive: filters.isActive,
    search: debouncedSearchValue,
  });

  const { data: statsData, isLoading: statisticsLoading } = trpc.adminDeliveryMethods.stats.useQuery();

  // tRPC mutations
  const deleteMutation = trpc.adminDeliveryMethods.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: t('delivery_methods.delete_success'),
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('delivery_methods.delete_error'),
        type: 'error'
      });
    },
  });

  const toggleActiveMutation = trpc.adminDeliveryMethods.toggleActive.useMutation({
    onSuccess: (result) => {
      addToast({
        title: 'Success',
        description: t('delivery_methods.status_updated'),
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('delivery_methods.update_error'),
        type: 'error'
      });
    },
  });

  const setDefaultMutation = trpc.adminDeliveryMethods.setDefault.useMutation({
    onSuccess: (result) => {
      addToast({
        title: 'Success',
        description: t('delivery_methods.default_set_success'),
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('delivery_methods.default_set_error'),
        type: 'error'
      });
    },
  });

  // Event handlers
  const handleDelete = useCallback((id: string) => {
    if (window.confirm(t('delivery_methods.confirm_delete'))) {
      deleteMutation.mutate({ id });
    }
  }, [deleteMutation, t]);

  const handleToggleActive = useCallback((id: string) => {
    toggleActiveMutation.mutate({ id });
  }, [toggleActiveMutation]);

  const handleSetDefault = useCallback((id: string) => {
    setDefaultMutation.mutate({ id });
  }, [setDefaultMutation]);

  const handleEdit = useCallback((deliveryMethod: DeliveryMethod) => {
    setEditingDeliveryMethod(deliveryMethod);
    setShowEditModal(true);
  }, []);

  const handleSort = useCallback((descriptor: SortDescriptor<DeliveryMethod>) => {
    if (descriptor.columnAccessor) {
      setSortDescriptor(descriptor);
      setPage(1);
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updatePageSize(newLimit);
  }, [updatePageSize]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchValue('');
    setDebouncedSearchValue('');
    setPage(1);
  }, []);

  // Helper functions
  const getDeliveryMethodTypeLabel = (type: string): string => {
    return t(`delivery_methods.types.${type}`);
  };

  const getCostCalculationTypeLabel = (type: string): string => {
    return t(`delivery_methods.cost_types.${type}`);
  };

  const formatDeliveryTime = (minHours?: number, maxHours?: number): string => {
    if (!minHours && !maxHours) return '-';

    const formatTime = (hours: number): string => {
      if (hours < 24) {
        return `${hours}h`;
      } else {
        const days = Math.ceil(hours / 24);
        return `${days}d`;
      }
    };

    if (minHours && maxHours) {
      return `${formatTime(minHours)} - ${formatTime(maxHours)}`;
    } else if (minHours) {
      return `≥ ${formatTime(minHours)}`;
    } else if (maxHours) {
      return `≤ ${formatTime(maxHours)}`;
    }

    return '-';
  };

  // Table data
  const tableData = useMemo(() => {
    return (deliveryMethodsData as any)?.data?.items || [];
  }, [deliveryMethodsData]);

  const totalItems = (deliveryMethodsData as any)?.data?.total || 0;
  const totalPages = (deliveryMethodsData as any)?.data?.totalPages || 1;

  // Statistics data
  const statisticsData: StatisticData[] = useMemo(() => {
    if (!(statsData as any)?.data) return [];

    return [
      {
        id: 'total-delivery-methods',
        title: t('delivery_methods.stats.total'),
        value: (statsData as any).data.total.toString(),
        icon: <FiTruck className="h-5 w-5" />,
        trend: undefined,
      },
      {
        id: 'active-delivery-methods',
        title: t('delivery_methods.stats.active'),
        value: (statsData as any).data.active.toString(),
        icon: <FiActivity className="h-5 w-5 text-green-500" />,
        trend: undefined,
      },
      {
        id: 'with-tracking',
        title: t('delivery_methods.stats.with_tracking'),
        value: (statsData as any).data.withTracking.toString(),
        icon: <FiPackage className="h-5 w-5 text-blue-500" />,
        trend: undefined,
      },
    ];
  }, [statsData, t]);

  // Table columns
  const columns: Column<DeliveryMethod>[] = [
    {
      id: 'name',
      header: t('delivery_methods.name'),
      isSortable: true,
      className: 'w-48',
      accessor: (item) => (
        <div className="flex items-center space-x-3">
          {item.iconUrl ? (
            <img src={item.iconUrl} alt={item.name} className="h-6 w-6 rounded" />
          ) : (
            <FiTruck className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
            {item.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {item.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: t('delivery_methods.type'),
      isSortable: true,
      className: 'w-32',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {getDeliveryMethodTypeLabel(item.type)}
        </span>
      ),
    },
    {
      id: 'deliveryCost',
      header: t('delivery_methods.delivery_cost'),
      isSortable: true,
      className: 'w-32',
      accessor: (item) => (
        <div className="text-sm">
          {item.costCalculationType === 'FREE' ? (
            <span className="text-green-600 font-medium">{t('delivery_methods.free')}</span>
          ) : (
            <div>
              <div>${item.deliveryCost.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{getCostCalculationTypeLabel(item.costCalculationType)}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'deliveryTime',
      header: t('delivery_methods.delivery_time'),
      isSortable: false,
      className: 'w-32',
      accessor: (item) => (
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <FiClock className="h-4 w-4 mr-1" />
          {formatDeliveryTime(item.minDeliveryTimeHours, item.maxDeliveryTimeHours)}
        </div>
      ),
    },
    {
      id: 'status',
      header: t('admin.status'),
      isSortable: false,
      className: 'w-24',
      accessor: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {item.isActive ? t('admin.active') : t('admin.inactive')}
        </span>
      ),
    },
    {
      id: 'features',
      header: 'Features',
      isSortable: false,
      className: 'w-24',
      accessor: (item) => (
        <div className="flex items-center space-x-1">
          {item.trackingEnabled && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" title="Tracking">
              T
            </span>
          )}
          {item.insuranceEnabled && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" title="Insurance">
              I
            </span>
          )}
          {item.signatureRequired && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" title="Signature Required">
              S
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'isDefault',
      header: t('admin.default'),
      isSortable: false,
      className: 'w-20',
      accessor: (item) => (
        item.isDefault ? (
          <FiStar className="h-4 w-4 text-yellow-500" />
        ) : null
      ),
    },
    {
      id: 'createdAt',
      header: t('admin.created_at'),
      isSortable: true,
      className: 'w-32',
      accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: t('admin.actions'),
      isSortable: false,
      className: 'w-24',
      accessor: (item) => {
        const items = [
          {
            label: t('admin.edit'),
            icon: <FiEdit2 className="h-4 w-4" />,
            onClick: () => handleEdit(item),
          },
          {
            label: item.isActive ? t('delivery_methods.form.deactivate') : t('delivery_methods.form.activate'),
            icon: item.isActive ? <FiToggleLeft className="h-4 w-4" /> : <FiToggleRight className="h-4 w-4" />,
            onClick: () => handleToggleActive(item.id),
          },
        ];

        if (!item.isDefault) {
          items.push({
            label: t('delivery_methods.form.set_as_default'),
            icon: <FiStar className="h-4 w-4" />,
            onClick: () => handleSetDefault(item.id),
          });
        }

        items.push({
          label: t('admin.delete'),
          icon: <FiTrash2 className="h-4 w-4" />,
          onClick: () => handleDelete(item.id),
        });

        return (
          <Dropdown
            button={
              <Button variant="ghost" size="sm">
                <FiMoreVertical className="h-4 w-4" />
              </Button>
            }
            items={items}
          />
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <BaseLayout title={t('delivery_methods.title')} description={t('delivery_methods.description')} actions={actions}>
        <Loading />
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title={t('delivery_methods.title')} description={t('delivery_methods.description')} actions={actions}>
        <Alert variant="destructive">
          <AlertTitle>{t('admin.error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={t('delivery_methods.title')} description={t('delivery_methods.description')} actions={actions} fullWidth={true}>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: t('navigation.home', 'Home'),
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: t('delivery_methods.title'),
              icon: <FiTruck className="w-4 h-4" />
            }
          ]}
        />

        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsData}
          isLoading={statisticsLoading}
          skeletonCount={3}
        />

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('delivery_methods.type')}
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('delivery_methods.filters.all_types')}</option>
                    <option value="STANDARD">{t('delivery_methods.types.STANDARD')}</option>
                    <option value="EXPRESS">{t('delivery_methods.types.EXPRESS')}</option>
                    <option value="OVERNIGHT">{t('delivery_methods.types.OVERNIGHT')}</option>
                    <option value="SAME_DAY">{t('delivery_methods.types.SAME_DAY')}</option>
                    <option value="PICKUP">{t('delivery_methods.types.PICKUP')}</option>
                    <option value="DIGITAL">{t('delivery_methods.types.DIGITAL')}</option>
                    <option value="COURIER">{t('delivery_methods.types.COURIER')}</option>
                    <option value="FREIGHT">{t('delivery_methods.types.FREIGHT')}</option>
                    <option value="OTHER">{t('delivery_methods.types.OTHER')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.status')}
                  </label>
                  <select
                    value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('delivery_methods.filters.all_statuses')}</option>
                    <option value="true">{t('admin.active')}</option>
                    <option value="false">{t('admin.inactive')}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={handleClearFilters}>
                    {t('delivery_methods.filters.clear_filters')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Delivery Methods Table */}
        <Table<DeliveryMethod>
          tableId="delivery-methods-table"
          data={tableData}
          columns={columns}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder={t('delivery_methods.search_placeholder')}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSort}
          // Pagination
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleLimitChange,
          }}
        />
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateDeliveryMethodModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      {showEditModal && editingDeliveryMethod && (
        <EditDeliveryMethodModal
          isOpen={showEditModal}
          deliveryMethod={editingDeliveryMethod}
          onClose={() => {
            setShowEditModal(false);
            setEditingDeliveryMethod(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingDeliveryMethod(null);
            refetch();
          }}
        />
      )}
    </BaseLayout>
  );
};

export default DeliveryMethodsPage;