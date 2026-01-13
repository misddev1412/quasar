import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiGift, FiActivity, FiEdit2, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiAward, FiHome, FiStar, FiTag } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Dropdown } from '../../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../../components/common/Table';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../contexts/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { LoyaltyReward } from '../../../types/loyalty';

interface LoyaltyRewardFiltersType {
  type?: "discount" | "free_shipping" | "free_product" | "cashback" | "gift_card" | "exclusive_access";
  isActive?: boolean;
}

const LoyaltyRewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('loyalty-rewards-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['name', 'type', 'pointsRequired', 'value', 'isActive', 'sortOrder', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<LoyaltyRewardFiltersType>({
    type: searchParams.get('type') as any || undefined,
    isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['name', 'type', 'pointsRequired', 'value', 'isActive', 'sortOrder', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Selected rewards for bulk actions
  const [selectedRewardIds, setSelectedRewardIds] = useState<Set<string | number>>(new Set());
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
        isActive: filters.isActive?.toString() || undefined,
        page: searchValue ? '1' : String(page),
        limit: limit !== 10 ? String(limit) : undefined,
        sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
        sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
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
    isActive: filters.isActive || undefined,
  };

  const { data: rewardsData, isLoading, error, refetch, isFetching } = trpc.adminLoyaltyRewards.list.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const rewards = (rewardsData as any)?.data?.items || [];
  const totalRewards = (rewardsData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalRewards / limit);

  // Fetch reward statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminLoyaltyRewards.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalRewards,
          active: apiStats.activeRewards,
          expiringSoon: apiStats.expiringSoonCount,
          totalRedemptions: apiStats.totalRedemptions || 0,
        }
      };
    }

    if (!rewards.length) return null;

    const total = rewards.length;
    const active = rewards.filter((reward: LoyaltyReward) => reward.isActive).length;
    const expiringSoon = rewards.filter((reward: LoyaltyReward) => {
      if (!reward.endsAt) return false;
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return new Date(reward.endsAt) <= thirtyDaysFromNow;
    }).length;

    return {
      data: {
        total,
        active,
        expiringSoon,
        totalRedemptions: 0,
      }
    };
  }, [rewards, statsData]);

  const statisticsLoadingValue = isLoading || statsLoading;

  const handleCreateReward = () => {
    navigate('/loyalty/rewards/create');
  };

  const handleEditReward = useCallback((reward: LoyaltyReward) => {
    navigate(`/loyalty/rewards/${reward.id}/edit`);
  }, [navigate]);

  const handleDeleteReward = useCallback(async (rewardId: string) => {
    try {
      const ok = window.confirm(t('loyalty.rewards.deleteConfirm', 'Are you sure you want to delete this reward? This action cannot be undone.'));
      if (!ok) return;

      // TODO: Implement delete mutation when available
      addToast({ type: 'success', title: t('loyalty.rewards.deleteSuccess', 'Reward deleted') });
      refetch();
    } catch (e: any) {
      addToast({ type: 'error', title: t('loyalty.rewards.deleteError', 'Delete failed'), description: e?.message || t('loyalty.rewards.deleteError', 'Failed to delete reward') });
    }
  }, [addToast, refetch, t]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      isActive: filters.isActive?.toString() || undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updatePageSize(newLimit);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      isActive: filters.isActive?.toString() || undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<LoyaltyReward>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      isActive: filters.isActive?.toString() || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: newSortBy !== 'sortOrder' ? newSortBy : undefined,
      sortOrder: newSortOrder !== 'asc' ? newSortOrder : undefined,
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

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'activate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('loyalty.rewards.bulk_activate_coming_soon', 'Bulk activate will be available soon') });
        break;
      case 'deactivate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('loyalty.rewards.bulk_deactivate_coming_soon', 'Bulk deactivate will be available soon') });
        break;
      case 'delete':
        const confirmDelete = window.confirm(t('loyalty.rewards.bulk_delete_confirm', `Are you sure you want to delete ${selectedRewardIds.size} rewards? This action cannot be undone.`));
        if (confirmDelete) {
          addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('loyalty.rewards.bulk_delete_coming_soon', 'Bulk delete will be available soon') });
        }
        break;
      default:
        break;
    }
  }, [selectedRewardIds.size, addToast, t]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: LoyaltyRewardFiltersType) => {
    setFilters(newFilters);
    setPage(1);

    updateUrlParams({
      search: searchValue || undefined,
      type: newFilters.type || undefined,
      isActive: newFilters.isActive?.toString() || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: LoyaltyRewardFiltersType = {};
    setFilters(clearedFilters);
    setPage(1);

    updateUrlParams({
      search: searchValue || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
    });
  };

  const hasActiveValue = (value: unknown) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof LoyaltyRewardFiltersType];
    return hasActiveValue(value);
  }).length;

  // Enhanced column definitions
  const columns: Column<LoyaltyReward>[] = useMemo(() => [
    {
      id: 'name',
      header: t('loyalty.rewards.name', 'Name'),
      accessor: (reward) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {reward.imageUrl ? (
              <img
                src={reward.imageUrl}
                alt={reward.name}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                <FiGift className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {reward.name}
            </div>
            {reward.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                {reward.description}
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
      header: t('loyalty.rewards.type', 'Type'),
      accessor: (reward) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          reward.type === 'DISCOUNT'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : reward.type === 'FREE_PRODUCT'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : reward.type === 'FREE_SHIPPING'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {t(`loyalty.rewards.type.${reward.type.toLowerCase()}`, reward.type)}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'pointsRequired',
      header: t('loyalty.rewards.points_required', 'Points Required'),
      accessor: 'pointsRequired',
      type: 'number',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'value',
      header: t('loyalty.rewards.value', 'Value'),
      accessor: (reward) => {
        if (reward.type === 'DISCOUNT') {
          return reward.discountType === 'PERCENTAGE'
            ? `${reward.value}%`
            : `$${reward.value?.toFixed(2)}`;
        }
        return reward.value ? `$${reward.value.toFixed(2)}` : '-';
      },
      isSortable: false,
      hideable: true,
    },
    {
      id: 'isActive',
      header: t('common.status', 'Status'),
      accessor: (reward) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            reward.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {reward.isActive
            ? t('common.active', 'Active')
            : t('common.inactive', 'Inactive')}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'sortOrder',
      header: t('loyalty.rewards.sort_order', 'Sort Order'),
      accessor: 'sortOrder',
      type: 'number',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('common.created_at', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (reward) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${reward.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleEditReward(reward)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteReward(reward.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleEditReward, handleDeleteReward, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<LoyaltyReward> = useMemo(() => ({
    columnAccessor: sortBy as keyof LoyaltyReward,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected rewards
  const bulkActions = useMemo(() => [
    {
      label: t('loyalty.rewards.activate_selected', 'Activate Selected'),
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: t('loyalty.rewards.deactivate_selected', 'Deactivate Selected'),
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: t('loyalty.rewards.delete_selected', 'Delete Selected'),
      value: 'delete',
      variant: 'danger' as const,
    },
  ], [t]);

  const actions = useMemo(() => [
    {
      label: t('loyalty.rewards.create', 'Create Reward'),
      onClick: handleCreateReward,
      primary: true,
      icon: <FiPlus />,
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
  ], [handleCreateReward, handleRefresh, handleFilterToggle, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-rewards',
        title: t('loyalty.rewards.total_rewards', 'Total Rewards'),
        value: stats.total?.toString() || '0',
        icon: <FiGift className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'active-rewards',
        title: t('loyalty.rewards.active_rewards', 'Active Rewards'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'expiring-soon',
        title: t('loyalty.rewards.expiring_soon', 'Expiring Soon'),
        value: stats.expiringSoon?.toString() || '0',
        icon: <FiTag className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'total-redemptions',
        title: t('loyalty.rewards.total_redemptions', 'Total Redemptions'),
        value: stats.totalRedemptions?.toLocaleString() || '0',
        icon: <FiAward className="w-5 h-5" />,
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
      label: t('loyalty.rewards.title', 'Loyalty Rewards'),
      icon: <FiGift className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('loyalty.rewards.title', 'Loyalty Rewards Management')}
        description={t('loyalty.rewards.description', 'Manage loyalty program rewards and prizes')}
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
        title={t('loyalty.rewards.title', 'Loyalty Rewards Management')}
        description={t('loyalty.rewards.description', 'Manage loyalty program rewards and prizes')}
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
      title={t('loyalty.rewards.title', 'Loyalty Rewards Management')}
      description={t('loyalty.rewards.description', 'Manage loyalty program rewards and prizes')}
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

        {/* Enhanced Rewards Table */}
        <Table<LoyaltyReward>
          tableId="loyalty-rewards-table"
          columns={columns}
          data={rewards}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('loyalty.rewards.search_placeholder', 'Search rewards by name or description...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedRewardIds}
          onSelectionChange={setSelectedRewardIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalRewards,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          // Empty state
          emptyMessage={t('loyalty.rewards.no_rewards_found', 'No loyalty rewards found')}
          emptyAction={{
            label: t('loyalty.rewards.create', 'Create Reward'),
            onClick: handleCreateReward,
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default LoyaltyRewardsPage;
