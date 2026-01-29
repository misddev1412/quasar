import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTableState } from '@admin/hooks/useTableState';
import { FiPlus, FiMoreVertical, FiUsers, FiUserCheck, FiUserPlus, FiUser, FiActivity, FiClock, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiUserX, FiTrash2, FiEye, FiLogIn } from 'react-icons/fi';
import { Button, Card, CardHeader, CardContent, CardTitle, CardDescription, Dropdown, StatisticsGrid, Table, StandardListPage, Loading, Alert, AlertDescription, AlertTitle } from '@admin/components/common';
import type { StatisticData, Column, SortDescriptor } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useTablePreferences } from '@admin/hooks/useTablePreferences';
import { UserFilters } from '@admin/components/features';
import { User, UserRole, UserFiltersType } from '@admin/types/user';


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

const validateDateString = (date: string | null): string | undefined => {
  if (!date) return undefined;
  // Basic date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) ? date : undefined;
};

const validateString = (value: string | null): string | undefined => {
  return value && value.trim() ? value.trim() : undefined;
};

type StartImpersonationResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    impersonationLogId?: string;
    impersonatedUser?: {
      id: string;
      email: string;
      username: string;
    };
  };
};

const UserListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial filters from URL
  const initialFilters = useMemo(() => ({
    role: validateUserRole(searchParams.get('role')),
    isActive: validateBoolean(searchParams.get('isActive')),
    dateFrom: validateDateString(searchParams.get('dateFrom')) || validateDateString(searchParams.get('createdFrom')),
    dateTo: validateDateString(searchParams.get('dateTo')) || validateDateString(searchParams.get('createdTo')),
    isVerified: validateBoolean(searchParams.get('isVerified')),
    email: validateString(searchParams.get('email')),
    username: validateString(searchParams.get('username')),
    hasProfile: validateBoolean(searchParams.get('hasProfile')),
    country: validateString(searchParams.get('country')),
    city: validateString(searchParams.get('city')),
    lastLoginFrom: validateDateString(searchParams.get('lastLoginFrom')),
    lastLoginTo: validateDateString(searchParams.get('lastLoginTo')),
    createdFrom: validateDateString(searchParams.get('createdFrom')),
    createdTo: validateDateString(searchParams.get('createdTo')),
  }), []);

  const userTableState = useTableState<UserFiltersType>({
    tableId: 'users-table',
    defaultPreferences: {
      visibleColumns: ['user', 'username', 'role', 'status', 'createdAt', 'actions']
    },
    initialFilters,
  });

  const {
    page,
    limit,
    searchValue,
    debouncedSearchValue,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    sortBy,
    sortOrder,
    visibleColumns,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    handleColumnVisibilityChange,
    setSearchValue
  } = userTableState;

  // Selected users for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string | number>>(new Set());

  // Automatically show filter panel when there are active filters
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(value =>
      value !== undefined && value !== null && value !== ''
    );
    if (hasActiveFilters && !showFilters) {
      setShowFilters(true);
    }
  }, [filters, showFilters, setShowFilters]);



  // Automatically show filter panel when there are active filters
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(value =>
      value !== undefined && value !== null && value !== ''
    );

    // Only auto-show filters if there are active filters and panel is currently hidden
    if (hasActiveFilters && !showFilters) {
      setShowFilters(true);
    }
  }, [filters, showFilters]);

  // Build query parameters including filters and sorting
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    role: filters.role as any || undefined,
    isActive: filters.isActive !== undefined ? filters.isActive : undefined,
    sortBy,
    sortOrder,
    // Additional filter parameters (for future backend support)
    isVerified: filters.isVerified !== undefined ? filters.isVerified : undefined,
    email: filters.email || undefined,
    username: filters.username || undefined,
    hasProfile: filters.hasProfile !== undefined ? filters.hasProfile : undefined,
    country: filters.country || undefined,
    city: filters.city || undefined,
    lastLoginFrom: filters.lastLoginFrom || undefined,
    lastLoginTo: filters.lastLoginTo || undefined,
    // Use dateFrom/dateTo as primary, with createdFrom/createdTo as fallback
    dateFrom: filters.dateFrom || filters.createdFrom || undefined,
    dateTo: filters.dateTo || filters.createdTo || undefined,
  };

  const { data, isLoading, error, refetch, isFetching } = trpc.adminUser.getAllUsers.useQuery(queryParams);

  // Fetch user statistics
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = trpc.adminUserStatistics.getUserStatistics.useQuery(undefined);

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const goToUser = (id: string) => navigate(`/users/${id}`);

  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const handleOpenUserDashboard = useCallback(() => {
    navigate('/users/dashboard');
  }, [navigate]);

  /* Hook handles filter changes, but keeping this signature to match usage */
  const handleFilterChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Handle login as user
  const startImpersonationMutation = trpc.adminImpersonation.startImpersonation.useMutation();

  const handleLoginAsUser = useCallback(async (userId: string, userName: string) => {
    try {
      const ok = window.confirm(t('users.confirmations.login_as_user', `Are you sure you want to login as ${userName}?`));
      if (!ok) return;

      const response = await startImpersonationMutation.mutateAsync({ userId }) as StartImpersonationResponse;
      const sessionData = response?.data;

      if (!sessionData?.accessToken) {
        throw new Error(t('users.errors.missing_impersonation_token', 'Unable to start impersonation session. Please try again later.'));
      }

      const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:4200';
      const redirectUrl = `${storeUrl}/api/auth/impersonate?token=${encodeURIComponent(sessionData.accessToken)}`;

      // Open in new tab
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');

      addToast({ type: 'success', title: t('users.confirmations.login_success', 'Login successful') });
    } catch (e: any) {
      addToast({
        type: 'error',
        title: t('users.confirmations.login_failed', 'Login failed'),
        description: e?.message || t('users.errors.generic_error', 'An error occurred')
      });
    }
  }, [startImpersonationMutation, addToast, t]);

  // Row actions: delete, activate/deactivate
  const updateUserStatusMutation = trpc.adminUser.updateUserStatus.useMutation();
  const deleteUserMutation = trpc.adminUser.deleteUser.useMutation();

  const handleToggleStatus = useCallback(async (userId: string, currentActive: boolean) => {
    try {
      await updateUserStatusMutation.mutateAsync({ id: userId, isActive: !currentActive });

      // Show success toast with descriptive message
      const action = currentActive ? 'deactivated' : 'activated';
      addToast({
        type: 'success',
        title: `User ${action} successfully`,
        description: `The user has been ${action} and the changes are now in effect.`
      });

      // Refresh the data to show updated status
      refetch();
    } catch (e: any) {
      // Show error toast with detailed information
      addToast({
        type: 'error',
        title: t('users.confirmations.failed_to_update_status', 'Failed to update user status'),
        description: e?.message || t('users.errors.generic_error', 'An error occurred while updating the user status. Please try again.')
      });
    }
  }, [updateUserStatusMutation, addToast, refetch]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const ok = window.confirm(t('users.confirmations.delete_user', 'Are you sure you want to delete this user? This action cannot be undone.'));
      if (!ok) return;
      await deleteUserMutation.mutateAsync({ id: userId });
      addToast({ type: 'success', title: t('users.confirmations.delete_success', 'User deleted') });
      refetch();
    } catch (e: any) {
      addToast({ type: 'error', title: t('users.confirmations.delete_failed', 'Delete failed'), description: e?.message || t('users.confirmations.delete_error', 'Failed to delete user') });
    }
  }, [deleteUserMutation, addToast, refetch, t]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
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

  const handleRefresh = useCallback(() => {
    try {
      refetch();
    } catch (e) {
      console.error('Refresh failed', e);
    }
  }, [refetch]);

  const exportFiltersPayload = useMemo(() => {
    const payload: Record<string, unknown> = {};
    if (debouncedSearchValue) {
      payload.search = debouncedSearchValue;
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        payload[key] = value;
      }
    });
    return payload;
  }, [filters, debouncedSearchValue]);

  const handleOpenExportCenter = useCallback(() => {
    const payload = exportFiltersPayload;
    navigate('/users/exports', {
      state: Object.keys(payload).length ? { filters: payload } : undefined,
    });
  }, [navigate, exportFiltersPayload]);

  // Count active filters for display (search is handled separately by Table component)
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length,
    [filters]
  );

  const pageActions = useMemo(() => [
    {
      label: t('users.dashboard.title', 'User Management Dashboard'),
      onClick: handleOpenUserDashboard,
      icon: <FiActivity />,
    },
    {
      label: t('users.create_user', 'Create User'),
      onClick: handleCreateUser,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('users.actions.export_users', 'Export Users'),
      onClick: handleOpenExportCenter,
      icon: <FiDownload />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('common.hideFilters', 'Hide Filters') : t('common.showFilters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleOpenUserDashboard, handleCreateUser, handleOpenExportCenter, handleRefresh, handleFilterToggle, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;

    return [
      {
        id: 'total-users',
        title: t('users.dashboard.cards.total_users', 'Total Users'),
        value: stats.totalUsers.value,
        icon: <FiUsers className="w-5 h-5" />,
        trend: stats.totalUsers.trend,
        enableChart: true,
      },
      {
        id: 'active-users',
        title: t('users.dashboard.cards.active_users', 'Active Users'),
        value: stats.activeUsers.value,
        icon: <FiUserCheck className="w-5 h-5" />,
        trend: stats.activeUsers.trend,
        enableChart: true,
      },
      {
        id: 'new-users',
        title: t('users.dashboard.cards.new_this_month', 'New This Month'),
        value: stats.newUsersThisMonth.value,
        icon: <FiUserPlus className="w-5 h-5" />,
        trend: stats.newUsersThisMonth.trend,
        enableChart: true,
      },
      {
        id: 'users-with-profiles',
        title: t('users.dashboard.cards.profile_completion', 'Profile Completion'),
        value: `${stats.usersWithProfiles.percentage}%`,
        icon: <FiUser className="w-5 h-5" />,
        enableChart: true,
      },
      {
        id: 'currently-active',
        title: t('users.dashboard.cards.currently_active', 'Currently Active'),
        value: stats.currentlyActiveUsers?.value || 0,
        icon: <FiActivity className="w-5 h-5" />,
        description: stats.currentlyActiveUsers?.description || t('users.descriptions.active_last_15_min', 'Active in last 15 minutes'),
        enableChart: false,
      },
      {
        id: 'recent-activity',
        title: t('users.dashboard.cards.recent_activity', 'Recent Activity'),
        value: stats.recentActivity?.value || 0,
        icon: <FiClock className="w-5 h-5" />,
        description: stats.recentActivity?.description || t('users.descriptions.active_last_24_hours', 'Active in last 24 hours'),
        enableChart: false,
      },
    ];
  }, [statisticsData]);

  // Enhanced column definitions with IDs and visibility control
  const columns: Column<User>[] = useMemo(() => [
    {
      id: 'user',
      header: t('users.table.columns.user', 'User'),
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
      header: t('users.table.columns.username', 'Username'),
      accessor: 'username',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'email',
      header: t('users.table.columns.email', 'Email'),
      accessor: 'email',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'role',
      header: t('users.table.columns.role', 'Role'),
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {item.role || t('users.actions.default_role', 'USER')}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: t('users.table.columns.status', 'Status'),
      accessor: (item) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
        >
          {item.isActive ? t('users.table.status.active', 'Active') : t('users.table.status.inactive', 'Inactive')}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('users.table.columns.createdAt', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('users.table.columns.actions', 'Actions'),
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${item.username}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => goToUser(item.id)
            },
            {
              label: item.isActive ? t('users.actions.deactivate', 'Deactivate') : t('users.actions.activate', 'Activate'),
              icon: item.isActive
                ? <FiUserX className="w-4 h-4" aria-hidden="true" />
                : <FiUserCheck className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleToggleStatus(item.id, item.isActive),
            },
            {
              label: t('users.actions.view_profile', 'View Profile'),
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/users/${item.id}`)
            },
            {
              label: t('users.actions.login_as_user', 'Login as User'),
              icon: <FiLogIn className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleLoginAsUser(item.id, item.username || 'User'),
            },
            {
              label: t('users.actions.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteUser(item.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false, // Actions column should always be visible
      width: '80px',
    },
  ], [navigate, handleDeleteUser, handleLoginAsUser, handleToggleStatus, t]);

  // Current sort descriptor for the table - MOVED BEFORE EARLY RETURNS
  const sortDescriptor: SortDescriptor<User> = useMemo(() => ({
    columnAccessor: sortBy as keyof User,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected users - MOVED BEFORE EARLY RETURNS
  const bulkActions = useMemo(() => [
    {
      label: t('users.bulk_actions.activate_selected', 'Activate Selected'),
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: t('users.bulk_actions.deactivate_selected', 'Deactivate Selected'),
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: t('users.bulk_actions.delete_selected', 'Delete Selected'),
      value: 'delete',
      variant: 'danger' as const,
    },
  ], [t]);

  if (isLoading) {
    return (
      <StandardListPage title={t('users.page_title', 'User Management')} description={t('users.page_description', 'Manage all users in the system')} fullWidth={true}>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </StandardListPage>
    );
  }

  if (error) {
    return (
      <StandardListPage title={t('users.page_title', 'User Management')} description={t('users.page_description', 'Manage all users in the system')} fullWidth={true}>
        <Alert variant="destructive">
          <AlertTitle>{t('users.errors.error_title', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </StandardListPage>
    );
  }

  const users = (data as any)?.data?.items ?? [];
  const totalUsers = (data as any)?.data?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <StandardListPage title={t('users.page_title', 'User Management')} description={t('users.page_description', 'Manage all users in the system')} fullWidth={true} actions={pageActions}>
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
          searchPlaceholder={t('users.table.search_placeholder', 'Search users by name, email, or username...')}
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
          onSortChange={(descriptor) => handleSortChange(String(descriptor.columnAccessor), descriptor.direction)}
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
          onRowClick={(user) => goToUser(user.id)}
          // Empty state
          emptyMessage={t('users.no_users_found', 'No users found')}
          emptyAction={{
            label: t('users.create_user', 'Create User'),
            onClick: handleCreateUser,
            icon: <FiPlus />,
          }}
        />


      </div>
    </StandardListPage>
  );
};

export default UserListPage;
