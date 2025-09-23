import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiCreditCard, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiExternalLink, FiStar, FiTrendingUp, FiToggleLeft, FiToggleRight, FiHome } from 'react-icons/fi';
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
import { CreatePaymentMethodModal } from '../../components/payment-methods/CreatePaymentMethodModal';
import { EditPaymentMethodModal } from '../../components/payment-methods/EditPaymentMethodModal';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CASH' | 'CHECK' | 'CRYPTOCURRENCY' | 'BUY_NOW_PAY_LATER' | 'OTHER';
  description?: string;
  isActive: boolean;
  sortOrder: number;
  processingFee: number;
  processingFeeType: 'FIXED' | 'PERCENTAGE';
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies?: string[];
  iconUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodFiltersType {
  search?: string;
  type?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Actions for BaseLayout header
  const actions = useMemo(() => [
    {
      label: t('admin.create_payment_method'),
      onClick: () => setShowCreateModal(true),
      icon: <FiPlus className="w-4 h-4" />,
      variant: 'primary' as const
    }
  ], [t]);

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('payment-methods-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['name', 'type', 'processingFee', 'status', 'isDefault', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<PaymentMethodFiltersType>({
    type: searchParams.get('type') || undefined,
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<PaymentMethod>>(() => ({
    columnAccessor: (searchParams.get('sortBy') || 'sortOrder') as keyof PaymentMethod,
    direction: searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'
  }));

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

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
    data: paymentMethodsData,
    isLoading,
    error,
    refetch
  } = trpc.adminPaymentMethods.list.useQuery({
    page,
    limit,
    type: filters.type as any,
    isActive: filters.isActive,
  });

  const { data: statsData, isLoading: statisticsLoading } = trpc.adminPaymentMethods.stats.useQuery();

  // tRPC mutations
  const deleteMutation = trpc.adminPaymentMethods.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Payment method deleted successfully',
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete payment method',
        type: 'error'
      });
    },
  });

  const toggleActiveMutation = trpc.adminPaymentMethods.toggleActive.useMutation({
    onSuccess: (result) => {
      addToast({
        title: 'Success',
        description: 'Payment method status updated successfully',
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update payment method',
        type: 'error'
      });
    },
  });

  const setDefaultMutation = trpc.adminPaymentMethods.setDefault.useMutation({
    onSuccess: (result) => {
      addToast({
        title: 'Success',
        description: 'Default payment method updated successfully',
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to set default payment method',
        type: 'error'
      });
    },
  });

  // Event handlers
  const handleDelete = useCallback((id: string) => {
    if (window.confirm(t('admin.confirm_delete_payment_method'))) {
      deleteMutation.mutate({ id });
    }
  }, [deleteMutation, t]);

  const handleToggleActive = useCallback((id: string) => {
    toggleActiveMutation.mutate({ id });
  }, [toggleActiveMutation]);

  const handleSetDefault = useCallback((id: string) => {
    setDefaultMutation.mutate({ id });
  }, [setDefaultMutation]);

  const handleEdit = useCallback((paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setShowEditModal(true);
  }, []);

  const handleSort = useCallback((descriptor: SortDescriptor<PaymentMethod>) => {
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

  // Table data
  const tableData = useMemo(() => {
    return (paymentMethodsData as any)?.data?.items || [];
  }, [paymentMethodsData]);

  const totalItems = (paymentMethodsData as any)?.data?.total || 0;
  const totalPages = (paymentMethodsData as any)?.data?.totalPages || 1;

  // Statistics data
  const statisticsData: StatisticData[] = useMemo(() => {
    if (!(statsData as any)?.data) return [];

    return [
      {
        id: 'total-payment-methods',
        title: t('admin.total_payment_methods'),
        value: (statsData as any).data.total.toString(),
        icon: <FiCreditCard className="h-5 w-5" />,
        trend: undefined,
      },
      {
        id: 'active-payment-methods',
        title: t('admin.active_payment_methods'),
        value: (statsData as any).data.active.toString(),
        icon: <FiActivity className="h-5 w-5 text-green-500" />,
        trend: undefined,
      },
      {
        id: 'inactive-payment-methods',
        title: t('admin.inactive_payment_methods'),
        value: (statsData as any).data.inactive.toString(),
        icon: <FiToggleLeft className="h-5 w-5 text-gray-500" />,
        trend: undefined,
      },
    ];
  }, [statsData, t]);

  // Table columns
  const columns: Column<PaymentMethod>[] = [
    {
      id: 'name',
      header: t('admin.name'),
      isSortable: true,
      className: 'w-48',
      accessor: (item) => (
        <div className="flex items-center space-x-3">
          {item.iconUrl ? (
            <img src={item.iconUrl} alt={item.name} className="h-6 w-6 rounded" />
          ) : (
            <FiCreditCard className="h-5 w-5 text-gray-400" />
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
      header: t('admin.type'),
      isSortable: true,
      className: 'w-32',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {item.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'processingFee',
      header: t('admin.processing_fee'),
      isSortable: true,
      className: 'w-32',
      accessor: (item) => (
        <div className="text-sm">
          {item.processingFeeType === 'PERCENTAGE'
            ? `${item.processingFee}%`
            : `$${item.processingFee.toFixed(2)}`
          }
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
            label: item.isActive ? t('admin.deactivate') : t('admin.activate'),
            icon: item.isActive ? <FiToggleLeft className="h-4 w-4" /> : <FiToggleRight className="h-4 w-4" />,
            onClick: () => handleToggleActive(item.id),
          },
        ];

        if (!item.isDefault) {
          items.push({
            label: t('admin.set_as_default'),
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
      <BaseLayout title={t('admin.payment_methods')} description={t('admin.payment_methods_description')} actions={actions}>
        <Loading />
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title={t('admin.payment_methods')} description={t('admin.payment_methods_description')} actions={actions}>
        <Alert variant="destructive">
          <AlertTitle>{t('admin.error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={t('admin.payment_methods')} description={t('admin.payment_methods_description')} actions={actions} fullWidth={true}>
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
              label: t('admin.payment_methods'),
              icon: <FiCreditCard className="w-4 h-4" />
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
                    {t('admin.type')}
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('admin.all_types')}</option>
                    <option value="CREDIT_CARD">{t('admin.credit_card')}</option>
                    <option value="DEBIT_CARD">{t('admin.debit_card')}</option>
                    <option value="BANK_TRANSFER">{t('admin.bank_transfer')}</option>
                    <option value="DIGITAL_WALLET">{t('admin.digital_wallet')}</option>
                    <option value="CASH">{t('admin.cash')}</option>
                    <option value="CHECK">{t('admin.check')}</option>
                    <option value="CRYPTOCURRENCY">{t('admin.cryptocurrency')}</option>
                    <option value="BUY_NOW_PAY_LATER">{t('admin.buy_now_pay_later')}</option>
                    <option value="OTHER">{t('admin.other')}</option>
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
                    <option value="">{t('admin.all_statuses')}</option>
                    <option value="true">{t('admin.active')}</option>
                    <option value="false">{t('admin.inactive')}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={handleClearFilters}>
                    {t('admin.clear_filters')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Payment Methods Table */}
        <Table<PaymentMethod>
          tableId="payment-methods-table"
          data={tableData}
          columns={columns}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder={t('admin.search_payment_methods')}
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
        <CreatePaymentMethodModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      {showEditModal && editingPaymentMethod && (
        <EditPaymentMethodModal
          isOpen={showEditModal}
          paymentMethod={editingPaymentMethod}
          onClose={() => {
            setShowEditModal(false);
            setEditingPaymentMethod(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingPaymentMethod(null);
            refetch();
          }}
        />
      )}
    </BaseLayout>
  );
};

export default PaymentMethodsPage;