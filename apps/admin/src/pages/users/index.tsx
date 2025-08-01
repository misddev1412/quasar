import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiUsers, FiUserCheck, FiUserPlus, FiUser, FiActivity, FiClock } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { UserFilters } from '../../components/features/UserFilters';
import { User, UserRole, UserFiltersType } from '../../types/user';

// Helper functions for URL parameter validation
const validateUserRole = (role: string | null): UserRole | undefined => {
  if (!role) return undefined;
  return Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : undefined;
};

const validateBoolean = (value: string | null): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const validatePage = (page: string | null): number => {
  const pageNum = page ? parseInt(page, 10) : 1;
  return pageNum > 0 ? pageNum : 1;
};

const UserListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('users-table', {
    pageSize: (() => {
      const limitParam = searchParams.get('limit');
      const parsedLimit = limitParam ? parseInt(limitParam, 10) : 10;
      return [10, 25, 50, 100].includes(parsedLimit) ? parsedLimit : 10;
    })(),
    visibleColumns: new Set(['user', 'username', 'role', 'status', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => validatePage(searchParams.get('page')));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>(() => ({
    role: validateUserRole(searchParams.get('role')),
    isActive: validateBoolean(searchParams.get('isActive')),
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  }));
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state - use preferences with fallback
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    preferences.visibleColumns || new Set(['user', 'username', 'role', 'status', 'createdAt'])
  );

  // Selected users for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string | number>>(new Set());

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams();

      // Add non-empty parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          newSearchParams.set(key, value);
        }
      });

      // Update URL without causing navigation
      setSearchParams(newSearchParams, { replace: true });
    }, 100); // Short debounce for URL updates
  }, [setSearchParams]);

  // Debounce search value for API calls and URL updates
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1); // Reset to first page when search changes

      // Update URL with search parameter
      updateUrlParams({
        search: searchValue || undefined,
        role: filters.role || undefined,
        isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page: searchValue ? '1' : String(page), // Reset to page 1 if searching
        limit: limit !== 10 ? String(limit) : undefined,
        sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
        sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
      });
    }, 400); // 400ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, filters, page, sortBy, sortOrder, updateUrlParams]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Build query parameters including filters and sorting
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    role: filters.role as any || undefined,
    isActive: filters.isActive !== undefined ? filters.isActive : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, error } = trpc.adminUser.getAllUsers.useQuery(queryParams);

  // Fetch user statistics
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = trpc.adminUserStatistics.getUserStatistics.useQuery();

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleFilterChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change

    // Update URL with new filters
    updateUrlParams({
      search: searchValue || undefined,
      role: newFilters.role || undefined,
      isActive: newFilters.isActive !== undefined ? String(newFilters.isActive) : undefined,
      dateFrom: newFilters.dateFrom || undefined,
      dateTo: newFilters.dateTo || undefined,
      page: '1', // Reset to page 1 when filters change
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);

    // Update URL to remove all filters but keep search
    updateUrlParams({
      search: searchValue || undefined,
      role: undefined,
      isActive: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: '1',
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    // Update URL with new page
    updateUrlParams({
      search: searchValue || undefined,
      role: filters.role || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle page size change (server-side)
  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing page size

    // Update preferences for persistence
    updatePageSize(newLimit);

    // Update URL with new limit
    updateUrlParams({
      search: searchValue || undefined,
      role: filters.role || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: undefined, // Reset to page 1
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle column visibility change (client-side)
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
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
  };

  // Handle sorting change
  const handleSortChange = (sortDescriptor: SortDescriptor<User>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when sorting changes

    // Update URL with new sorting
    updateUrlParams({
      search: searchValue || undefined,
      role: filters.role || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: undefined, // Reset to page 1
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: newSortBy !== 'createdAt' ? newSortBy : undefined,
      sortOrder: newSortOrder !== 'desc' ? newSortOrder : undefined,
    });
  };

  // Handle individual user deletion - moved before columns definition
  const handleDeleteUser = useCallback((userId: string) => {
    // Implement delete confirmation and API call
    console.log(`Deleting user: ${userId}`);
  }, []);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    console.log(`Bulk action: ${action} on ${selectedUserIds.size} users`);
    // Implement bulk actions here
    switch (action) {
      case 'activate':
        // Implement bulk activate
        break;
      case 'deactivate':
        // Implement bulk deactivate
        break;
      case 'delete':
        // Implement bulk delete with confirmation
        break;
      default:
        break;
    }
  }, [selectedUserIds.size]);

  // Count active filters for display (search is handled separately by Table component)
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length,
    [filters]
  );

  const actions = useMemo(() => [
    {
      label: 'Create User',
      onClick: handleCreateUser,
      primary: true,
      icon: <FiPlus />,
    },
  ], []);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;

    return [
      {
        id: 'total-users',
        title: 'Total Users',
        value: stats.totalUsers.value,
        icon: <FiUsers className="w-5 h-5" />,
        trend: stats.totalUsers.trend,
        enableChart: true,
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: stats.activeUsers.value,
        icon: <FiUserCheck className="w-5 h-5" />,
        trend: stats.activeUsers.trend,
        enableChart: true,
      },
      {
        id: 'new-users',
        title: 'New This Month',
        value: stats.newUsersThisMonth.value,
        icon: <FiUserPlus className="w-5 h-5" />,
        trend: stats.newUsersThisMonth.trend,
        enableChart: true,
      },
      {
        id: 'users-with-profiles',
        title: 'Profile Completion',
        value: `${stats.usersWithProfiles.percentage}%`,
        icon: <FiUser className="w-5 h-5" />,
        enableChart: true,
      },
      {
        id: 'currently-active',
        title: 'Currently Active',
        value: stats.currentlyActiveUsers?.value || 0,
        icon: <FiActivity className="w-5 h-5" />,
        description: stats.currentlyActiveUsers?.description || 'Active in last 15 minutes',
        enableChart: false,
      },
      {
        id: 'recent-activity',
        title: 'Recent Activity',
        value: stats.recentActivity?.value || 0,
        icon: <FiClock className="w-5 h-5" />,
        description: stats.recentActivity?.description || 'Active in last 24 hours',
        enableChart: false,
      },
    ];
  }, [statisticsData]);

  // Enhanced column definitions with IDs and visibility control
  const columns: Column<User>[] = useMemo(() => [
    {
      id: 'user',
      header: 'User',
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {item.profile?.firstName && item.profile?.lastName
              ? `${item.profile.firstName} ${item.profile.lastName}`
              : item.username
            }
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {item.email}
          </span>
        </div>
      ),
      isSortable: false, // Complex display, not sortable
      hideable: true,
    },
    {
      id: 'username',
      header: 'Username',
      accessor: 'username',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {item.role || 'USER'}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessor: (item) => new Date(item.createdAt).toLocaleDateString(),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${item.username}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: 'Edit',
              onClick: () => navigate(`/users/${item.id}/edit`)
            },
            {
              label: 'View Profile',
              onClick: () => navigate(`/users/${item.id}`)
            },
            {
              label: 'Delete',
              onClick: () => handleDeleteUser(item.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false, // Actions column should always be visible
      width: '80px',
    },
  ], [navigate, handleDeleteUser]);

  // Current sort descriptor for the table - MOVED BEFORE EARLY RETURNS
  const sortDescriptor: SortDescriptor<User> = useMemo(() => ({
    columnAccessor: sortBy as keyof User,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected users - MOVED BEFORE EARLY RETURNS
  const bulkActions = useMemo(() => [
    {
      label: 'Activate Selected',
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: 'Deactivate Selected',
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: 'Delete Selected',
      value: 'delete',
      variant: 'danger' as const,
    },
  ], []);

  if (isLoading) {
    return (
      <BaseLayout title="User Management" description="Manage all users in the system" actions={actions}>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title="User Management" description="Manage all users in the system" actions={actions}>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const users = (data as any)?.data?.items ?? [];
  const totalUsers = (data as any)?.data?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <BaseLayout title="User Management" description="Manage all users in the system" actions={actions}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsLoading}
          skeletonCount={6}
        />

        {/* Filter Panel */}
        {showFilters && (
          <UserFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Enhanced Users Table */}
        <Table<User>
          tableId="users-table"
          columns={columns}
          data={users}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder="Search users by name, email, or username..."
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalUsers,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange, // Server-side page size handling
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(user) => navigate(`/users/${user.id}`)}
        />


      </div>
    </BaseLayout>
  );
};

export default UserListPage; 