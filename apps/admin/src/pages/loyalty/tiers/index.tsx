import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiAward, FiActivity, FiEdit2, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiUsers, FiHome, FiStar } from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Dropdown } from '../../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../../components/common/Table';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { LoyaltyTier } from '../../../types/loyalty';

interface LoyaltyTierFiltersType {
  isActive?: boolean;
  minPointsRequired?: number;
  maxPointsRequired?: number;
}

const LoyaltyTiersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('loyalty-tiers-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['name', 'minPointsRequired', 'benefits', 'memberCount', 'isActive', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<LoyaltyTierFiltersType>({
    isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    minPointsRequired: searchParams.get('minPointsRequired') ? parseInt(searchParams.get('minPointsRequired')!) : undefined,
    maxPointsRequired: searchParams.get('maxPointsRequired') ? parseInt(searchParams.get('maxPointsRequired')!) : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'sortOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['name', 'minPointsRequired', 'benefits', 'memberCount', 'isActive', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Selected tiers for bulk actions
  const [selectedTierIds, setSelectedTierIds] = useState<Set<string | number>>(new Set());
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
        isActive: filters.isActive?.toString() || undefined,
        minPointsRequired: filters.minPointsRequired?.toString() || undefined,
        maxPointsRequired: filters.maxPointsRequired?.toString() || undefined,
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
    isActive: filters.isActive || undefined,
    minPointsRequired: filters.minPointsRequired || undefined,
    maxPointsRequired: filters.maxPointsRequired || undefined,
  };

  const { data: tiersData, isLoading, error, refetch, isFetching } = trpc.adminLoyaltyTiers.list.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const tiers = (tiersData as any)?.data?.items || [];
  const totalTiers = (tiersData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalTiers / limit);

  // Fetch tier statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminLoyaltyTiers.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalTiers,
          active: apiStats.activeTiers,
          inactive: apiStats.inactiveTiers,
          totalMembers: apiStats.totalMembers,
        }
      };
    }

    if (!tiers.length) return null;

    const total = tiers.length;
    const active = tiers.filter((tier: LoyaltyTier) => tier.isActive).length;
    const inactive = tiers.filter((tier: LoyaltyTier) => !tier.isActive).length;
    const totalMembers = tiers.reduce((sum: number, tier: LoyaltyTier) => sum + (tier.memberCount || 0), 0);

    return {
      data: {
        total,
        active,
        inactive,
        totalMembers,
      }
    };
  }, [tiers, statsData]);

  const statisticsLoadingValue = isLoading || statsLoading;

  const displayTiers = useMemo(() => {
    return tiers.map((tier: LoyaltyTier & { minPoints?: number; maxPoints?: number; icon?: string }) => {
      const rawMin = tier.minPointsRequired ?? tier.minPoints;
      const rawMax = tier.maxPointsRequired ?? tier.maxPoints;

      return {
        ...tier,
        minPointsRequired: rawMin ?? 0,
        maxPointsRequired: rawMax ?? undefined,
        iconUrl: tier.iconUrl ?? tier.icon ?? tier.iconUrl,
        __rawMinPoints: rawMin,
        __rawMaxPoints: rawMax,
      } as LoyaltyTier & { __rawMinPoints?: number; __rawMaxPoints?: number };
    });
  }, [tiers]);

  const handleCreateTier = () => {
    navigate('/loyalty/tiers/create');
  };

  const handleEditTier = useCallback((tier: LoyaltyTier) => {
    navigate(`/loyalty/tiers/${tier.id}/edit`);
  }, [navigate]);

  const handleDeleteTier = useCallback(async (tierId: string) => {
    try {
      const ok = window.confirm(t('loyalty.tiers.deleteConfirm', 'Are you sure you want to delete this tier? This action cannot be undone.'));
      if (!ok) return;

      // TODO: Implement delete mutation when available
      addToast({ type: 'success', title: t('loyalty.tiers.deleteSuccess', 'Tier deleted') });
      refetch();
    } catch (e: any) {
      addToast({ type: 'error', title: t('loyalty.tiers.deleteError', 'Delete failed'), description: e?.message || t('loyalty.tiers.deleteError', 'Failed to delete tier') });
    }
  }, [addToast, refetch, t]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive?.toString() || undefined,
      minPointsRequired: filters.minPointsRequired?.toString() || undefined,
      maxPointsRequired: filters.maxPointsRequired?.toString() || undefined,
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
      isActive: filters.isActive?.toString() || undefined,
      minPointsRequired: filters.minPointsRequired?.toString() || undefined,
      maxPointsRequired: filters.maxPointsRequired?.toString() || undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<LoyaltyTier>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive?.toString() || undefined,
      minPointsRequired: filters.minPointsRequired?.toString() || undefined,
      maxPointsRequired: filters.maxPointsRequired?.toString() || undefined,
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
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('loyalty.tiers.bulk_activate_coming_soon', 'Bulk activate will be available soon') });
        break;
      case 'deactivate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('loyalty.tiers.bulk_deactivate_coming_soon', 'Bulk deactivate will be available soon') });
        break;
      case 'delete':
        const confirmDelete = window.confirm(t('loyalty.tiers.bulk_delete_confirm', `Are you sure you want to delete ${selectedTierIds.size} tiers? This action cannot be undone.`));
        if (confirmDelete) {
          addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('loyalty.tiers.bulk_delete_coming_soon', 'Bulk delete will be available soon') });
        }
        break;
      default:
        break;
    }
  }, [selectedTierIds.size, addToast, t]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: LoyaltyTierFiltersType) => {
    setFilters(newFilters);
    setPage(1);

    updateUrlParams({
      search: searchValue || undefined,
      isActive: newFilters.isActive?.toString() || undefined,
      minPointsRequired: newFilters.minPointsRequired?.toString() || undefined,
      maxPointsRequired: newFilters.maxPointsRequired?.toString() || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'asc' ? sortOrder : undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: LoyaltyTierFiltersType = {};
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
    const value = filters[key as keyof LoyaltyTierFiltersType];
    return hasActiveValue(value);
  }).length;

  // Enhanced column definitions
  const columns: Column<LoyaltyTier>[] = useMemo(() => [
    {
      id: 'name',
      header: t('loyalty.tiers.name', 'Name'),
      accessor: (tier) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {tier.iconUrl ? (
              <img
                src={tier.iconUrl}
                alt={tier.name}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                  tier.color ? '' : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900'
                }`}
                style={tier.color ? { backgroundColor: tier.color } : undefined}
              >
                <FiAward
                  className={`w-5 h-5 ${
                    tier.color ? 'text-white drop-shadow' : 'text-purple-600 dark:text-purple-300'
                  }`}
                />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {tier.name}
            </div>
            {tier.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                {tier.description}
              </div>
            )}
            {tier.color && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex h-4 w-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                  style={{ backgroundColor: tier.color }}
                  aria-label={t('loyalty.color', 'Color')}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {tier.color.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'minPointsRequired',
      header: t('loyalty.tiers.points_required', 'Points Required'),
      accessor: 'minPointsRequired',
      render: (_value, tier) => {
        const rawMin = (tier as any).__rawMinPoints;
        const rawMax = (tier as any).__rawMaxPoints;
        const normalizedMin = rawMin ?? undefined;
        const normalizedMax = rawMax ?? undefined;

        if (normalizedMin === undefined && normalizedMax === undefined) {
          return <span className="text-gray-400">—</span>;
        }

        return (
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {normalizedMin !== undefined && normalizedMax !== undefined && normalizedMin !== normalizedMax
              ? `${normalizedMin} - ${normalizedMax}`
              : normalizedMin !== undefined && normalizedMax !== undefined
              ? `${normalizedMin}`
              : normalizedMin === undefined && normalizedMax !== undefined
              ? `≤ ${normalizedMax}`
              : `≥ ${normalizedMin ?? 0}`}
          </div>
        );
      },
      type: 'number',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'benefits',
      header: t('loyalty.tiers.benefits', 'Benefits'),
      accessor: (tier) => (
        <div className="max-w-xs">
          {tier.benefits && tier.benefits.length > 0 ? (
            <div className="space-y-1">
              {tier.benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  • {benefit}
                </div>
              ))}
              {tier.benefits.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{tier.benefits.length - 2} more
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'memberCount',
      header: t('loyalty.tiers.members', 'Members'),
      accessor: (tier) => tier.memberCount || 0,
      type: 'number',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'isActive',
      header: t('common.status', 'Status'),
      accessor: (tier) => (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
              tier.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
            style={{ minWidth: '72px' }}
          >
            {tier.isActive
              ? t('common.active', 'Active')
              : t('common.inactive', 'Inactive')}
          </span>
        </div>
      ),
      isSortable: true,
      hideable: true,
      width: '120px',
      className: 'text-center',
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
      accessor: (tier) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${tier.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleEditTier(tier)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteTier(tier.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleEditTier, handleDeleteTier, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<LoyaltyTier> = useMemo(() => ({
    columnAccessor: sortBy as keyof LoyaltyTier,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected tiers
  const bulkActions = useMemo(() => [
    {
      label: t('loyalty.tiers.activate_selected', 'Activate Selected'),
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: t('loyalty.tiers.deactivate_selected', 'Deactivate Selected'),
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: t('loyalty.tiers.delete_selected', 'Delete Selected'),
      value: 'delete',
      variant: 'danger' as const,
    },
  ], [t]);

  const actions = useMemo(() => [
    {
      label: t('loyalty.tiers.create', 'Create Tier'),
      onClick: handleCreateTier,
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
  ], [handleCreateTier, handleRefresh, handleFilterToggle, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-tiers',
        title: t('loyalty.tiers.total_tiers', 'Total Tiers'),
        value: stats.total?.toString() || '0',
        icon: <FiAward className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'active-tiers',
        title: t('loyalty.tiers.active_tiers', 'Active Tiers'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: false,
      },
      {
        id: 'total-members',
        title: t('loyalty.tiers.total_members', 'Total Members'),
        value: stats.totalMembers?.toLocaleString() || '0',
        icon: <FiUsers className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'inactive-tiers',
        title: t('loyalty.tiers.inactive_tiers', 'Inactive Tiers'),
        value: stats.inactive?.toString() || '0',
        icon: <FiStar className="w-5 h-5" />,
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
      label: t('loyalty.tiers.title', 'Loyalty Tiers'),
      icon: <FiStar className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('loyalty.tiers.title', 'Loyalty Tiers Management')}
        description={t('loyalty.tiers.description', 'Manage loyalty program tiers and benefits')}
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
        title={t('loyalty.tiers.title', 'Loyalty Tiers Management')}
        description={t('loyalty.tiers.description', 'Manage loyalty program tiers and benefits')}
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
      title={t('loyalty.tiers.title', 'Loyalty Tiers Management')}
      description={t('loyalty.tiers.description', 'Manage loyalty program tiers and benefits')}
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

        {/* Enhanced Tiers Table */}
        <Table<LoyaltyTier>
          tableId="loyalty-tiers-table"
          columns={columns}
          data={displayTiers as LoyaltyTier[]}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('loyalty.tiers.search_placeholder', 'Search tiers by name or description...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedTierIds}
          onSelectionChange={setSelectedTierIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalTiers,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          // Empty state
          emptyMessage={t('loyalty.tiers.no_tiers_found', 'No loyalty tiers found')}
          emptyAction={{
            label: t('loyalty.tiers.create', 'Create Tier'),
            onClick: handleCreateTier,
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default LoyaltyTiersPage;
