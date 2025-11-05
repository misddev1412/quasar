import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit3, FiTrash2, FiSettings, FiTruck, FiCheck, FiX, FiMoreVertical, FiEye, FiHome, FiGlobe, FiKey } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { StatisticsGrid } from '../../components/common/StatisticsGrid';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ShippingProviderFilters } from '../../components/features/ShippingProviderFilters';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { ShippingProvider, ShippingProviderFiltersType } from '../../types/shipping-provider';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { useUrlParams, urlParamValidators } from '../../hooks/useUrlParams';

const TOGGLEABLE_FILTER_KEYS = ['isActive', 'hasTracking', 'supportsDomestic', 'supportsInternational', 'supportsExpress'] as const;

const ShippingProvidersIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // URL state management
  const { getParam, updateParams } = useUrlParams();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; shippingProvider?: ShippingProvider }>({
    isOpen: false,
  });

  // URL parameters
  const page = urlParamValidators.page(getParam('page'));
  const limit = urlParamValidators.number(getParam('limit'), 10) || 10;
  const search = getParam('search') || '';
  const isActive = urlParamValidators.boolean(getParam('isActive'));
  const hasTracking = urlParamValidators.boolean(getParam('hasTracking'));
  const supportsDomestic = urlParamValidators.boolean(getParam('supportsDomestic'));
  const supportsInternational = urlParamValidators.boolean(getParam('supportsInternational'));
  const supportsExpress = urlParamValidators.boolean(getParam('supportsExpress'));

  // Build filters for API call
  const filters: ShippingProviderFiltersType = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      isActive,
      hasTracking,
      supportsDomestic,
      supportsInternational,
      supportsExpress,
    }),
    [page, limit, search, isActive, hasTracking, supportsDomestic, supportsInternational, supportsExpress]
  );

  const buildParamsFromFilters = useCallback(
    (filterValues: ShippingProviderFiltersType) => {
      const params: Record<string, string | undefined> = {};
      const nextPage = filterValues.page ?? 1;
      params.page = nextPage.toString();

      if (filterValues.limit !== undefined) {
        params.limit = filterValues.limit.toString();
      }

      if (filterValues.search) {
        params.search = filterValues.search;
      }

      if (typeof filterValues.isActive === 'boolean') {
        params.isActive = filterValues.isActive.toString();
      }

      TOGGLEABLE_FILTER_KEYS.forEach((key) => {
        if (key === 'isActive') {
          return;
        }
        if (filterValues[key] === true) {
          params[key] = 'true';
        }
      });

      return params;
    },
    []
  );

  const applyFiltersToUrl = useCallback(
    (nextFilters: ShippingProviderFiltersType) => {
      const params = buildParamsFromFilters(nextFilters);
      updateParams(params);
    },
    [buildParamsFromFilters, updateParams]
  );

  // Table preferences
  const preferences = useTablePreferences('shipping-providers-table');

  // Column visibility state - ensure non-hideable columns like 'actions' are always included
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.preferences.visibleColumns ? new Set(preferences.preferences.visibleColumns) : new Set(['name', 'status', 'trackingUrl', 'apiStatus', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  const updatePageSize = (newSize: number) => {
    preferences.updatePageSize(newSize);
    applyFiltersToUrl({ ...filters, limit: newSize, page: 1 });
  };

  const updateVisibleColumns = (columns: Set<string>) => {
    preferences.updateVisibleColumns(columns);
  };

  // tRPC queries - using type assertion to resolve TypeScript issues
  const adminShippingProviders = (trpc as any)['adminShippingProviders'];

  const shippingProvidersQuery =
    adminShippingProviders?.list?.useQuery?.(filters) ?? {
      data: null,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve(),
    };

  const deleteShippingProviderMutation =
    adminShippingProviders?.delete?.useMutation?.({
      onSuccess: () => {
        addToast({
          type: 'success',
          title: t('shippingProviders.deleteSuccess'),
        });
        shippingProvidersQuery.refetch?.();
        setDeleteModal({ isOpen: false });
      },
      onError: (error: any) => {
        addToast({
          type: 'error',
          title: t('shippingProviders.deleteError'),
          description: error?.message,
        });
      },
    }) ?? {
      mutate: () => undefined,
      mutateAsync: async () => {
        throw new Error(t('shippingProviders.apiUnavailable', 'Shipping provider API is not available.'));
      },
      isPending: false,
    };

  const toggleStatusMutation =
    adminShippingProviders?.toggleActive?.useMutation?.({
      onSuccess: () => {
        addToast({
          type: 'success',
          title: t('shippingProviders.statusUpdateSuccess'),
        });
        shippingProvidersQuery.refetch?.();
      },
      onError: (error: any) => {
        addToast({
          type: 'error',
          title: t('shippingProviders.statusUpdateError'),
          description: error?.message,
        });
      },
    }) ?? {
      mutate: () => undefined,
      mutateAsync: async () => {
        throw new Error(t('shippingProviders.apiUnavailable', 'Shipping provider API is not available.'));
      },
      isPending: false,
    };

  // Data processing
  const { data: apiResponse, isLoading, error } = shippingProvidersQuery;
  const shippingProviders = Array.isArray((apiResponse as any)?.data?.items) ? (apiResponse as any).data.items : [];
  const pagination = (apiResponse as any)?.data || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Statistics
  const statisticsCards = useMemo(() => {
    const stats = {
      total: pagination.total || 0,
      active: Array.isArray(shippingProviders) ? shippingProviders.filter((provider) => provider.isActive).length : 0,
      inactive: Array.isArray(shippingProviders) ? shippingProviders.filter((provider) => !provider.isActive).length : 0,
      withTracking: Array.isArray(shippingProviders) ? shippingProviders.filter((provider) => provider.trackingUrl).length : 0,
      configured: Array.isArray(shippingProviders) ? shippingProviders.filter((provider) => provider.apiKey && provider.apiSecret).length : 0,
    };

    return [
      {
        id: 'total-shipping-providers',
        title: t('shippingProviders.stats.total'),
        value: stats.total.toString(),
        icon: <FiTruck className="w-5 h-5" />,
        color: 'blue' as const,
      },
      {
        id: 'active-shipping-providers',
        title: t('shippingProviders.stats.active'),
        value: stats.active.toString(),
        icon: <FiCheck className="w-5 h-5" />,
        color: 'green' as const,
      },
      {
        id: 'inactive-shipping-providers',
        title: t('shippingProviders.stats.inactive'),
        value: stats.inactive.toString(),
        icon: <FiX className="w-5 h-5" />,
        color: 'red' as const,
      },
      {
        id: 'with-tracking',
        title: t('shippingProviders.stats.withTracking'),
        value: stats.withTracking.toString(),
        icon: <FiGlobe className="w-5 h-5" />,
        color: 'purple' as const,
      },
      {
        id: 'configured-providers',
        title: t('shippingProviders.stats.configured'),
        value: stats.configured.toString(),
        icon: <FiKey className="w-5 h-5" />,
        color: 'orange' as const,
      },
    ];
  }, [shippingProviders, pagination.total, t]);

  // Event handlers
  const handlePageChange = useCallback((nextPage: number) => {
    applyFiltersToUrl({ ...filters, page: nextPage });
  }, [applyFiltersToUrl, filters]);

  const handleFiltersChange = useCallback((newFilters: ShippingProviderFiltersType) => {
    applyFiltersToUrl({ ...filters, ...newFilters, page: 1 });
  }, [applyFiltersToUrl, filters]);

  const handleClearFilters = useCallback(() => {
    applyFiltersToUrl({
      page: 1,
      limit: filters.limit,
    });
  }, [applyFiltersToUrl, filters.limit]);

  const handleRefresh = useCallback(() => {
    shippingProvidersQuery.refetch?.();
  }, [shippingProvidersQuery]);

  const handleDelete = useCallback((shippingProvider: ShippingProvider) => {
    setDeleteModal({ isOpen: true, shippingProvider });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteModal.shippingProvider) {
      deleteShippingProviderMutation.mutate({ id: deleteModal.shippingProvider.id });
    }
  }, [deleteModal.shippingProvider, deleteShippingProviderMutation]);

  const handleToggleStatus = useCallback((shippingProvider: ShippingProvider) => {
    toggleStatusMutation.mutate({ id: shippingProvider.id });
  }, [toggleStatusMutation]);

  // Table columns
  const columns: Column<ShippingProvider>[] = useMemo(
    () => [
      {
        id: 'name',
        header: t('shippingProviders.table.name'),
        accessor: (shippingProvider) => (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  {shippingProvider.code.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {shippingProvider.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {t('shippingProviders.code')}: {shippingProvider.code}
              </div>
            </div>
          </div>
        ),
        isSortable: false,
        hideable: true,
      },
      {
        id: 'status',
        header: t('shippingProviders.table.status'),
        accessor: (shippingProvider) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            shippingProvider.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {shippingProvider.isActive ? t('common.active') : t('common.inactive')}
          </span>
        ),
        isSortable: false,
        hideable: true,
      },
      {
        id: 'trackingUrl',
        header: t('shippingProviders.table.trackingUrl'),
        accessor: (shippingProvider) => (
          <div className="text-gray-900 dark:text-gray-100">
            {shippingProvider.trackingUrl ? (
              <a
                href={shippingProvider.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <FiGlobe className="w-3 h-3" />
                <span className="truncate max-w-xs">{shippingProvider.trackingUrl}</span>
              </a>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">{t('shippingProviders.noTrackingUrl')}</span>
            )}
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'apiStatus',
        header: t('shippingProviders.table.apiStatus'),
        accessor: (shippingProvider) => {
          const isConfigured = Boolean(shippingProvider.apiKey && shippingProvider.apiSecret);
          return (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                isConfigured
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-300'
              }`}
            >
              <FiKey className="h-3 w-3" />
              {isConfigured ? t('shippingProviders.apiConfigured') : t('shippingProviders.apiNotConfigured')}
            </span>
          );
        },
        isSortable: false,
        hideable: true,
      },
      {
        id: 'description',
        header: t('shippingProviders.table.description'),
        accessor: (shippingProvider) => (
          <div className="text-gray-900 dark:text-gray-100">
            <div className="truncate max-w-xs" title={shippingProvider.description || ''}>
              {shippingProvider.description || <span className="text-gray-400 dark:text-gray-500">{t('shippingProviders.noDescription')}</span>}
            </div>
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'createdAt',
        header: t('shippingProviders.table.createdAt'),
        accessor: 'createdAt',
        type: 'datetime',
        isSortable: true,
        hideable: true,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        accessor: (shippingProvider) => (
          <Dropdown
            button={
              <Button variant="ghost" size="sm" aria-label={`Actions for ${shippingProvider.name}`}>
                <FiMoreVertical />
              </Button>
            }
            items={[
              {
                label: t('common.view'),
                icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/shipping-providers/${shippingProvider.id}`)
              },
              {
                label: t('common.edit'),
                icon: <FiEdit3 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/shipping-providers/${shippingProvider.id}/edit`)
              },
              {
                label: shippingProvider.isActive ? t('common.deactivate') : t('common.activate'),
                icon: shippingProvider.isActive
                  ? <FiX className="w-4 h-4" aria-hidden="true" />
                  : <FiCheck className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleToggleStatus(shippingProvider),
              },
              {
                label: t('common.delete'),
                icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleDelete(shippingProvider),
                className: 'text-red-500 hover:text-red-700'
              },
            ]}
          />
        ),
        isSortable: false,
        hideable: false, // Actions column should always be visible
        width: '80px',
      },
    ],
    [t, navigate, handleToggleStatus, handleDelete]
  );

  // Actions for BaseLayout
  const actions = useMemo(() => [
    {
      label: t('shippingProviders.create'),
      onClick: () => navigate('/shipping-providers/create'),
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('common.refresh'),
      onClick: handleRefresh,
      icon: <FiSettings />,
    },
    {
      label: showFilters ? t('common.hideFilters') : t('common.showFilters'),
      onClick: () => setShowFilters(!showFilters),
      icon: <FiSettings />,
    },
  ], [navigate, handleRefresh, showFilters, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('shippingProviders.shippingProviders', 'Shipping Providers'),
      icon: <FiTruck className="w-4 h-4" />,
    },
  ]), [t]);

  // Count active filters for display
  const activeFilterCount = useMemo(() => {
    const {
      isActive: isActiveFilter,
      hasTracking: hasTrackingFilter,
      supportsDomestic: supportsDomesticFilter,
      supportsInternational: supportsInternationalFilter,
      supportsExpress: supportsExpressFilter,
    } = filters;

    return [
      isActiveFilter ? 1 : 0,
      hasTrackingFilter ? 1 : 0,
      supportsDomesticFilter ? 1 : 0,
      supportsInternationalFilter ? 1 : 0,
      supportsExpressFilter ? 1 : 0,
    ].reduce((sum, current) => sum + current, 0);
  }, [filters]);

  if (error) {
    return (
      <BaseLayout
        title="Shipping Provider Management"
        description="Manage system shipping providers"
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="text-red-600 dark:text-red-400">
          Error loading shipping providers: {error.message}
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Shipping Provider Management"
      description="Manage system shipping providers and tracking configurations"
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={isLoading}
          skeletonCount={4}
        />

        {/* Filter Panel */}
        {showFilters && (
          <ShippingProviderFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Shipping Providers Table */}
        <Table<ShippingProvider>
          tableId="shipping-providers-table"
          columns={columns}
          data={shippingProviders}
          searchValue={search}
          onSearchChange={(value) => applyFiltersToUrl({ ...filters, search: value || undefined, page: 1 })}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder={t('shippingProviders.searchPlaceholder')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={(columnId, visible) => {
            setVisibleColumns(prev => {
              const newSet = new Set(prev);
              if (visible) {
                newSet.add(columnId);
              } else {
                newSet.delete(columnId);
              }
              // Update preferences for persistence
              updateVisibleColumns(newSet);
              return newSet;
            });
          }}
          showColumnVisibility={true}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            itemsPerPage: pagination.limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: updatePageSize,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          // Empty state
          emptyMessage={t('shippingProviders.noShippingProvidersFound')}
          emptyAction={{
            label: t('shippingProviders.create'),
            onClick: () => navigate('/shipping-providers/create'),
            icon: <FiPlus />,
          }}
          // Loading state
          isLoading={isLoading}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          onConfirm={confirmDelete}
          title={t('shippingProviders.confirmDelete')}
          message={
            deleteModal.shippingProvider
              ? t('shippingProviders.confirmDeleteDescription', { name: deleteModal.shippingProvider.name })
              : ''
          }
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          confirmVariant="danger"
          isLoading={deleteShippingProviderMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default ShippingProvidersIndexPage;
