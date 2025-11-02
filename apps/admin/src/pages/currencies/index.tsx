import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit3, FiTrash2, FiSettings, FiDollarSign, FiCheck, FiX, FiMoreVertical, FiEye, FiHome } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { StatisticsGrid } from '../../components/common/StatisticsGrid';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { CurrencyFilters } from '../../components/features/CurrencyFilters';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { Currency, CurrencyFiltersType } from '../../types/currency';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { useUrlParams, urlParamValidators } from '../../hooks/useUrlParams';

const CurrenciesIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // URL state management
  const { getParam, updateParams } = useUrlParams();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; currency?: Currency }>({
    isOpen: false,
  });

  // URL parameters
  const page = urlParamValidators.page(getParam('page'));
  const limit = urlParamValidators.number(getParam('limit'), 10) || 10;
  const search = getParam('search') || '';
  const isActive = urlParamValidators.boolean(getParam('isActive'));
  const isDefault = urlParamValidators.boolean(getParam('isDefault'));

  // Build filters for API call
  const filters: CurrencyFiltersType = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      isActive,
      isDefault,
    }),
    [page, limit, search, isActive, isDefault]
  );

  // Table preferences
  const preferences = useTablePreferences('currencies-table');

  // Column visibility state - ensure non-hideable columns like 'actions' are always included
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.preferences.visibleColumns ? new Set(preferences.preferences.visibleColumns) : new Set(['currency', 'status', 'exchangeRate', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  const updatePageSize = (newSize: number) => {
    preferences.updatePageSize(newSize);
    updateParams({ limit: newSize.toString(), page: '1' });
  };

  const updateVisibleColumns = (columns: Set<string>) => {
    preferences.updateVisibleColumns(columns);
  };

  // tRPC queries - using placeholder for now, will need to implement actual currency routes
  const currenciesQuery = trpc.adminCurrency.getCurrencies.useQuery(filters);

  const deleteCurrencyMutation = trpc.adminCurrency.deleteCurrency.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('currencies.deleteSuccess'),
      });
      currenciesQuery.refetch();
      setDeleteModal({ isOpen: false });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('currencies.deleteError'),
        description: error.message,
      });
    },
  });

  const toggleStatusMutation = trpc.adminCurrency.toggleCurrencyStatus.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('currencies.statusUpdateSuccess'),
      });
      currenciesQuery.refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('currencies.statusUpdateError'),
        description: error.message,
      });
    },
  });

  const setDefaultMutation = trpc.adminCurrency.setDefaultCurrency.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('currencies.setDefaultSuccess'),
      });
      currenciesQuery.refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('currencies.setDefaultError'),
        description: error.message,
      });
    },
  });

  // Data processing
  const { data: apiResponse, isLoading, error } = currenciesQuery;
  const currencies = Array.isArray((apiResponse as any)?.data?.items) ? (apiResponse as any).data.items : [];
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
      active: Array.isArray(currencies) ? currencies.filter((curr) => curr.isActive).length : 0,
      inactive: Array.isArray(currencies) ? currencies.filter((curr) => !curr.isActive).length : 0,
      hasDefault: Array.isArray(currencies) ? currencies.some((curr) => curr.isDefault) : false,
    };

    return [
      {
        id: 'total-currencies',
        title: t('currencies.stats.total'),
        value: stats.total.toString(),
        icon: <FiDollarSign className="w-5 h-5" />,
        color: 'blue' as const,
      },
      {
        id: 'active-currencies',
        title: t('currencies.stats.active'),
        value: stats.active.toString(),
        icon: <FiCheck className="w-5 h-5" />,
        color: 'green' as const,
      },
      {
        id: 'inactive-currencies',
        title: t('currencies.stats.inactive'),
        value: stats.inactive.toString(),
        icon: <FiX className="w-5 h-5" />,
        color: 'red' as const,
      },
      {
        id: 'has-default',
        title: t('currencies.stats.hasDefault'),
        value: stats.hasDefault ? t('common.yes') : t('common.no'),
        icon: <FiDollarSign className="w-5 h-5" />,
        color: stats.hasDefault ? 'green' : 'yellow' as const,
      },
    ];
  }, [currencies, pagination.total, t]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: page.toString() });
  }, [updateParams]);

  const handleFiltersChange = useCallback((newFilters: CurrencyFiltersType) => {
    const params: Record<string, string> = { page: '1' };
    if (newFilters.search !== undefined) params.search = newFilters.search;
    if (newFilters.isActive !== undefined) params.isActive = newFilters.isActive.toString();
    if (newFilters.isDefault !== undefined) params.isDefault = newFilters.isDefault.toString();
    if (newFilters.limit !== undefined) params.limit = newFilters.limit.toString();
    updateParams(params);
  }, [updateParams]);

  const handleClearFilters = useCallback(() => {
    updateParams({
      search: '',
      isActive: undefined,
      isDefault: undefined,
      page: '1',
    });
  }, [updateParams]);

  const handleRefresh = useCallback(() => {
    currenciesQuery.refetch();
  }, [currenciesQuery]);

  const handleDelete = useCallback((currency: Currency) => {
    setDeleteModal({ isOpen: true, currency });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteModal.currency) {
      deleteCurrencyMutation.mutate({ id: deleteModal.currency.id });
    }
  }, [deleteModal.currency, deleteCurrencyMutation]);

  const handleToggleStatus = useCallback((currency: Currency) => {
    toggleStatusMutation.mutate({ id: currency.id });
  }, [toggleStatusMutation]);

  const handleSetDefault = useCallback((currency: Currency) => {
    setDefaultMutation.mutate({ id: currency.id });
  }, [setDefaultMutation]);

  // Table columns
  const columns: Column<Currency>[] = useMemo(
    () => [
      {
        id: 'currency',
        header: t('currencies.table.currency'),
        accessor: (currency) => (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  {currency.symbol}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {currency.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {currency.code} • Exchange Rate: {currency.exchangeRate}
              </div>
            </div>
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'status',
        header: t('currencies.table.status'),
        accessor: (currency) => (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currency.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {currency.isActive ? t('common.active') : t('common.inactive')}
            </span>
            {currency.isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <FiDollarSign className="w-3 h-3 mr-1" />
                {t('currencies.default')}
              </span>
            )}
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'exchangeRate',
        header: t('currencies.table.exchangeRate'),
        accessor: (currency) => (
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {currency.exchangeRate.toFixed(8)}
          </span>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'format',
        header: t('currencies.table.format'),
        accessor: (currency) => (
          <div className="text-gray-900 dark:text-gray-100">
            <div className="font-medium">{currency.format}</div>
            <div className="text-sm text-gray-500">
              {currency.symbol}99.99{currency.decimalPlaces > 2 ? '.' + '9'.repeat(currency.decimalPlaces - 2) : ''}
            </div>
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'createdAt',
        header: t('currencies.table.createdAt'),
        accessor: 'createdAt',
        type: 'datetime',
        isSortable: true,
        hideable: true,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        accessor: (currency) => (
          <Dropdown
            button={
              <Button variant="ghost" size="sm" aria-label={`Actions for ${currency.name}`}>
                <FiMoreVertical />
              </Button>
            }
            items={[
              {
                label: t('common.view'),
                icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/currencies/${currency.id}`)
              },
              {
                label: t('common.edit'),
                icon: <FiEdit3 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/currencies/${currency.id}/edit`)
              },
              {
                label: currency.isActive ? t('common.deactivate') : t('common.activate'),
                icon: currency.isActive 
                  ? <FiX className="w-4 h-4" aria-hidden="true" />
                  : <FiCheck className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleToggleStatus(currency),
                disabled: currency.isDefault && currency.isActive
              },
              {
                label: t('currencies.setAsDefault'),
                icon: <FiDollarSign className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleSetDefault(currency),
                disabled: currency.isDefault
              },
              {
                label: t('common.delete'),
                icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleDelete(currency),
                disabled: currency.isDefault,
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
    [t, navigate, handleToggleStatus, handleSetDefault, handleDelete]
  );

  // Actions for BaseLayout
  const actions = useMemo(() => [
    {
      label: t('currencies.create'),
      onClick: () => navigate('/currencies/create'),
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
      label: t('currencies.currencies', 'Currencies'),
      icon: <FiDollarSign className="w-4 h-4" />,
    },
  ]), [t]);

  // Count active filters for display
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length - 2, // Subtract page and limit
    [filters]
  );

  if (error) {
    return (
      <BaseLayout
        title="Currency Management"
        description="Manage system currencies"
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="text-red-600 dark:text-red-400">
          Error loading currencies: {error.message}
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Currency Management"
      description="Manage system currencies and exchange rates"
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
          <CurrencyFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Currencies Table */}
        <Table<Currency>
          tableId="currencies-table"
          columns={columns}
          data={currencies}
          searchValue={search}
          onSearchChange={(value) => updateParams({ search: value, page: '1' })}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder={t('currencies.searchPlaceholder')}
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
          emptyMessage={t('currencies.noCurrenciesFound')}
          emptyAction={{
            label: t('currencies.create'),
            onClick: () => navigate('/currencies/create'),
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
          title={t('currencies.confirmDelete')}
          message={
            deleteModal.currency
              ? t('currencies.confirmDeleteDescription', { name: deleteModal.currency.name })
              : ''
          }
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          confirmVariant="danger"
          isLoading={deleteCurrencyMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default CurrenciesIndexPage;