import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiRefreshCw, FiFilter, FiDownload, FiEye, FiHome, FiTrendingUp, FiTrendingDown, FiAward, FiUser, FiCalendar } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { StatisticsGrid, StatisticData } from '../../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../../components/common/Table';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../contexts/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { LoyaltyTransaction } from '../../../types/loyalty';

interface LoyaltyTransactionFiltersType {
  type?: "expired" | "earned" | "redeemed" | "adjusted" | "referral_bonus";
  customerId?: string;
  createdFrom?: string;
  createdTo?: string;
}

const LoyaltyTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('loyalty-transactions-table', {
    pageSize: parseInt(searchParams.get('limit') || '20'),
    visibleColumns: new Set(['customer', 'type', 'points', 'description', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<LoyaltyTransactionFiltersType>({
    type: searchParams.get('type') as any || undefined,
    customerId: searchParams.get('customerId') || undefined,
    createdFrom: searchParams.get('createdFrom') || undefined,
    createdTo: searchParams.get('createdTo') || undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['customer', 'type', 'points', 'description', 'balance', 'createdAt']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  const trpcContext = trpc.useContext();

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          newSearchParams.set(key, value);
        }
      });

      setSearchParams(newSearchParams, { replace: true });
    }, 100);
  }, [setSearchParams]);

  // Debounce search value for API calls and URL updates
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1);

      updateUrlParams({
        search: searchValue || undefined,
        type: filters.type || undefined,
        customerId: filters.customerId || undefined,
        createdFrom: filters.createdFrom || undefined,
        createdTo: filters.createdTo || undefined,
        page: searchValue ? '1' : String(page),
        limit: limit !== 20 ? String(limit) : undefined,
        sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
        sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
      });
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, filters, page, sortBy, sortOrder, updateUrlParams, limit]);

  // Build query parameters
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    type: filters.type || undefined,
    customerId: filters.customerId || undefined,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
  };

  const { data: transactionsData, isLoading, error, refetch, isFetching } = trpc.adminLoyaltyTransactions.list.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const transactions = (transactionsData as any)?.data?.items || [];
  const totalTransactions = (transactionsData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalTransactions / limit);

  // Fetch transaction statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminLoyaltyTransactions.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          totalTransactions: apiStats.totalTransactions,
          totalPointsEarned: apiStats.totalPointsEarned,
          totalPointsSpent: apiStats.totalPointsSpent,
          uniqueCustomers: apiStats.uniqueCustomers,
        }
      };
    }

    if (!transactions.length) return null;

    const totalTransactions = transactions.length;
    const totalPointsEarned = transactions
      .filter((t: LoyaltyTransaction) => t.type === 'EARN')
      .reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0);
    const totalPointsSpent = Math.abs(transactions
      .filter((t: LoyaltyTransaction) => t.type === 'SPEND')
      .reduce((sum: number, t: LoyaltyTransaction) => sum + t.points, 0));
    const uniqueCustomers = new Set(transactions.map((t: LoyaltyTransaction) => t.customerId)).size;

    return {
      data: {
        totalTransactions,
        totalPointsEarned,
        totalPointsSpent,
        uniqueCustomers,
      }
    };
  }, [transactions, statsData]);

  const statisticsLoadingValue = isLoading || statsLoading;

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      customerId: filters.customerId || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 20 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updatePageSize(newLimit);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      customerId: filters.customerId || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      page: undefined,
      limit: newLimit !== 20 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<LoyaltyTransaction>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      customerId: filters.customerId || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      page: undefined,
      limit: limit !== 20 ? String(limit) : undefined,
      sortBy: newSortBy !== 'createdAt' ? newSortBy : undefined,
      sortOrder: newSortOrder !== 'desc' ? newSortOrder : undefined,
    });
  };

  // Handle column visibility
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
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
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: LoyaltyTransactionFiltersType) => {
    setFilters(newFilters);
    setPage(1);

    updateUrlParams({
      search: searchValue || undefined,
      type: newFilters.type || undefined,
      customerId: newFilters.customerId || undefined,
      createdFrom: newFilters.createdFrom || undefined,
      createdTo: newFilters.createdTo || undefined,
      page: undefined,
      limit: limit !== 20 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: LoyaltyTransactionFiltersType = {};
    setFilters(clearedFilters);
    setPage(1);

    updateUrlParams({
      search: searchValue || undefined,
      page: undefined,
      limit: limit !== 20 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof LoyaltyTransactionFiltersType];
    return value !== undefined && value !== null && value !== '';
  }).length;

  const handleExportData = useCallback(() => {
    // TODO: Implement export functionality
    addToast({
      type: 'info',
      title: t('common.feature_coming_soon', 'Feature coming soon'),
      description: t('loyalty.transactions.export_coming_soon', 'Export functionality will be available soon')
    });
  }, [addToast, t]);

  // Enhanced column definitions
  const columns: Column<LoyaltyTransaction>[] = useMemo(() => [
    {
      id: 'customer',
      header: t('loyalty.transactions.customer', 'Customer'),
      accessor: (transaction) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {transaction.customer?.name || transaction.customer?.email || 'Unknown Customer'}
            </div>
            {transaction.customer?.email && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {transaction.customer.email}
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'type',
      header: t('loyalty.transactions.type', 'Type'),
      accessor: (transaction) => (
        <div className="flex items-center space-x-2">
          {transaction.type === 'EARN' ? (
            <FiTrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <FiTrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            transaction.type === 'EARN'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {t(`loyalty.transactions.type.${transaction.type.toLowerCase()}`, transaction.type)}
          </span>
        </div>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'points',
      header: t('loyalty.transactions.points', 'Points'),
      accessor: (transaction) => (
        <span className={`font-medium ${
          transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'EARN' ? '+' : ''}{transaction.points}
        </span>
      ),
      type: 'number',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'description',
      header: t('loyalty.transactions.description', 'Description'),
      accessor: (transaction) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
            {transaction.description}
          </div>
          {transaction.source && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Source: {transaction.source}
            </div>
          )}
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'balanceAfter',
      header: t('loyalty.transactions.balance', 'Balance'),
      accessor: (transaction) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {transaction.balanceAfter || 0}
        </span>
      ),
      type: 'number',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('loyalty.transactions.date', 'Date'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
  ], [t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<LoyaltyTransaction> = useMemo(() => ({
    columnAccessor: sortBy as keyof LoyaltyTransaction,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  const actions = useMemo(() => [
    {
      label: t('loyalty.transactions.export', 'Export'),
      onClick: handleExportData,
      icon: <FiDownload />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('common.hide_filters', 'Hide Filters') : t('common.show_filters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleRefresh, handleFilterToggle, handleExportData, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-transactions',
        title: t('loyalty.transactions.total_transactions', 'Total Transactions'),
        value: stats.totalTransactions?.toLocaleString() || '0',
        icon: <FiCalendar className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'total-points-earned',
        title: t('loyalty.transactions.total_points_earned', 'Total Points Earned'),
        value: stats.totalPointsEarned?.toLocaleString() || '0',
        icon: <FiTrendingUp className="w-5 h-5 text-green-500" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'total-points-spent',
        title: t('loyalty.transactions.total_points_spent', 'Total Points Spent'),
        value: stats.totalPointsSpent?.toLocaleString() || '0',
        icon: <FiTrendingDown className="w-5 h-5 text-red-500" />,
        trend: { value: 0, isPositive: false, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'unique-customers',
        title: t('loyalty.transactions.unique_customers', 'Unique Customers'),
        value: stats.uniqueCustomers?.toLocaleString() || '0',
        icon: <FiUser className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [statisticsData, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: t('loyalty.title', 'Loyalty Program'),
      href: '/loyalty',
      icon: <FiAward className="w-4 h-4" />
    },
    {
      label: t('loyalty.transactions.title', 'Loyalty Transactions'),
      icon: <FiCalendar className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('loyalty.transactions.title', 'Loyalty Transactions')}
        description={t('loyalty.transactions.description', 'View and manage loyalty point transactions')}
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

  if (error) {
    return (
      <BaseLayout
        title={t('loyalty.transactions.title', 'Loyalty Transactions')}
        description={t('loyalty.transactions.description', 'View and manage loyalty point transactions')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('loyalty.transactions.title', 'Loyalty Transactions')}
      description={t('loyalty.transactions.description', 'View and manage loyalty point transactions')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsLoadingValue}
          skeletonCount={4}
        />

        {/* Enhanced Transactions Table */}
        <Table<LoyaltyTransaction>
          tableId="loyalty-transactions-table"
          columns={columns}
          data={transactions}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('loyalty.transactions.search_placeholder', 'Search transactions by customer name or description...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalTransactions,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="compact"
          // Empty state
          emptyMessage={t('loyalty.transactions.no_transactions_found', 'No loyalty transactions found')}
        />
      </div>
    </BaseLayout>
  );
};

export default LoyaltyTransactionsPage;