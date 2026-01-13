import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiLock, FiUsers, FiSettings, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiShield } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { Permission, PermissionFiltersType, PermissionStatistics } from '../../types/permission';
import { FiHome } from 'react-icons/fi';

interface PermissionIndexPageProps {}

const PermissionIndexPage: React.FC<PermissionIndexPageProps> = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [filters, setFilters] = useState<PermissionFiltersType>({
    search: searchParams.get('search') || '',
    resource: searchParams.get('resource') || undefined,
    action: searchParams.get('action') || undefined,
    scope: searchParams.get('scope') || undefined,
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<Permission>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  // Table preferences - Default to showing only essential columns (actions hidden by default)
  const { preferences, updateVisibleColumns, resetPreferences } = useTablePreferences('permissions-table', {
    visibleColumns: new Set([
      'name',
      'resource',
      'action',
      'scope',
      'isActive',
    ]),
  });

  const visibleColumns = preferences.visibleColumns || new Set([
    'name',
    'resource',
    'action',
    'scope',
    'isActive',
  ]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.resource) params.set('resource', filters.resource);
    if (filters.action) params.set('action', filters.action);
    if (filters.scope) params.set('scope', filters.scope);
    if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 10) params.set('limit', filters.limit.toString());

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Build query parameters for API call
  const queryParams = useMemo(() => ({
    page: filters.page || 1,
    limit: filters.limit || 10,
    search: filters.search || undefined,
    resource: filters.resource,
    action: filters.action,
    scope: filters.scope,
    isActive: filters.isActive,
  }), [filters]);

  // Use the real permission API endpoint with pagination
  const { data, isLoading, error, refetch, isFetching } = trpc.adminPermission.getAllPermissions.useQuery({
    resource: filters.resource,
    action: filters.action as any, // Type cast since filter values are strings but API expects enum
    scope: filters.scope as any,   // Type cast since filter values are strings but API expects enum
    isActive: filters.isActive,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  });

  // Process real API data
  const processedData = useMemo(() => {
    if (!data || !(data as any)?.data) return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };

    const responseData = (data as any).data;

    // Check if the response is paginated (has meta property) or is a simple array
    if (responseData.data && responseData.meta) {
      // Paginated response
      return {
        items: responseData.data || [],
        total: responseData.meta.total || 0,
        page: responseData.meta.page || 1,
        limit: responseData.meta.limit || 10,
        totalPages: responseData.meta.totalPages || 0,
      };
    } else {
      // Legacy non-paginated response - apply client-side pagination for backward compatibility
      let permissions = Array.isArray(responseData) ? responseData : [];

      // Apply client-side filters (these should now be handled server-side, but keeping for safety)
      if (filters.search) {
        permissions = permissions.filter((p: any) =>
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.description?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.resource.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      if (filters.resource) {
        permissions = permissions.filter((p: any) => p.resource === filters.resource);
      }

      if (filters.action) {
        permissions = permissions.filter((p: any) => p.action === filters.action);
      }

      if (filters.scope) {
        permissions = permissions.filter((p: any) => p.scope === filters.scope);
      }

      // Client-side pagination
      const total = permissions.length;
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const items = permissions.slice(start, end);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }, [data, filters]);

  // Calculate statistics from real data
  const statistics: StatisticData[] = useMemo(() => {
    const responseData = (data as any)?.data;
    let permissions = [];

    if (responseData?.data && responseData?.meta) {
      // For paginated response, we need to use the total from meta for accurate statistics
      // But we can only calculate active/inactive from the current page data
      permissions = responseData.data || [];
    } else {
      // For non-paginated response
      permissions = Array.isArray(responseData) ? responseData : [];
    }

    const total = responseData?.meta?.total || permissions.length;
    const active = permissions.filter((p: any) => p.isActive !== false).length;
    const inactive = permissions.filter((p: any) => p.isActive === false).length;

    return [
      {
        id: 'total-permissions',
        title: t('permissions.statistics.total_permissions', 'Total Permissions'),
        value: total.toString(),
        icon: <FiLock className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'blue',
      },
      {
        id: 'active-permissions',
        title: t('permissions.statistics.active_permissions', 'Active Permissions'),
        value: active.toString(),
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'green',
      },
      {
        id: 'inactive-permissions',
        title: t('permissions.statistics.inactive_permissions', 'Inactive Permissions'),
        value: inactive.toString(),
        icon: <FiShield className="w-5 h-5" />,
        trend: { value: 0, isPositive: false, label: '0%' },
        color: 'red',
      },
      {
        id: 'resources',
        title: t('permissions.statistics.resources', 'Resources'),
        value: [...new Set(permissions.map((p: any) => p.resource))].length.toString(),
        icon: <FiSettings className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'purple',
      },
    ];
  }, [data, t]);

  const handleCreatePermission = () => {
    navigate('/permissions/create');
  };

  const goToPermission = (id: string) => navigate(`/permissions/${id}`);

  // Permission mutations
  const updatePermissionMutation = trpc.adminPermission.updatePermission.useMutation();
  const deletePermissionMutation = trpc.adminPermission.deletePermission.useMutation();

  const handleTogglePermissionStatus = useCallback(async (permission: Permission) => {
    try {
      await updatePermissionMutation.mutateAsync({ 
        id: permission.id, 
        isActive: !permission.isActive 
      });

      // Show success toast with descriptive message
      const action = permission.isActive ? 'deactivated' : 'activated';
      addToast({
        type: 'success',
        title: `Permission ${action} successfully`,
        description: `The permission "${permission.name}" has been ${action} and the changes are now in effect.`
      });

      // Refresh the data to show updated status
      refetch();
    } catch (e: any) {
      // Show error toast with detailed information
      addToast({
        type: 'error',
        title: 'Failed to update permission status',
        description: e?.message || 'An error occurred while updating the permission status. Please try again.'
      });
    }
  }, [updatePermissionMutation, addToast, refetch]);

  const handleDeletePermission = useCallback(async (permission: Permission) => {
    try {
      const ok = window.confirm(
        `Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone and may affect users who have this permission.`
      );
      if (!ok) return;

      await deletePermissionMutation.mutateAsync({ id: permission.id });
      
      addToast({ 
        type: 'success', 
        title: 'Permission deleted successfully',
        description: `The permission "${permission.name}" has been permanently deleted.`
      });
      
      refetch();
    } catch (e: any) {
      addToast({ 
        type: 'error', 
        title: 'Delete failed', 
        description: e?.message || 'Failed to delete permission. Please try again.'
      });
    }
  }, [deletePermissionMutation, addToast, refetch]);

  const handleDuplicatePermission = useCallback((permission: Permission) => {
    // Navigate to create page with pre-filled data
    navigate('/permissions/create', { 
      state: { 
        template: {
          name: `${permission.name} (Copy)`,
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
          description: permission.description ? `${permission.description} (Copy)` : undefined,
          isActive: permission.isActive
        }
      }
    });
  }, [navigate]);

  // Handle permission actions
  const handlePermissionAction = useCallback((action: string, permission: Permission) => {
    switch (action) {
      case 'view':
      case 'edit':
        goToPermission(permission.id);
        break;
      case 'delete':
        handleDeletePermission(permission);
        break;
      case 'toggle-status':
        handleTogglePermissionStatus(permission);
        break;
      case 'duplicate':
        handleDuplicatePermission(permission);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }, [handleDeletePermission, handleTogglePermissionStatus, handleDuplicatePermission]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedPermissions.size === 0) {
      addToast({
        type: 'warning',
        title: 'No permissions selected',
        description: 'Please select at least one permission to perform bulk actions.'
      });
      return;
    }

    const selectedIds = Array.from(selectedPermissions);
    const count = selectedIds.length;

    try {
      switch (action) {
        case 'activate':
          // TODO: Implement bulk activate when API is available
          addToast({
            type: 'info',
            title: 'Bulk activate',
            description: `Would activate ${count} permission(s). Feature coming soon.`
          });
          break;

        case 'deactivate':
          // TODO: Implement bulk deactivate when API is available
          addToast({
            type: 'info',
            title: 'Bulk deactivate',
            description: `Would deactivate ${count} permission(s). Feature coming soon.`
          });
          break;

        case 'delete':
          const confirmDelete = window.confirm(
            `Are you sure you want to delete ${count} permission(s)? This action cannot be undone and may affect users who have these permissions.`
          );
          if (!confirmDelete) return;

          // TODO: Implement bulk delete when API is available
          addToast({
            type: 'info',
            title: 'Bulk delete',
            description: `Would delete ${count} permission(s). Feature coming soon.`
          });
          break;

        case 'export':
          // TODO: Implement export functionality
          addToast({
            type: 'info',
            title: 'Export permissions',
            description: `Would export ${count} permission(s). Feature coming soon.`
          });
          break;

        default:
          console.warn('Unknown bulk action:', action);
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Bulk action failed',
        description: e?.message || `Failed to perform bulk ${action}. Please try again.`
      });
    }
  }, [selectedPermissions, addToast]);

  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<PermissionFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Handle sorting
  const handleSortChange = useCallback((sortDescriptor: SortDescriptor<Permission>) => {
    setSortDescriptor(sortDescriptor);
    // TODO: Implement server-side sorting
  }, []);

  // Table columns configuration
  const columns: Column<Permission>[] = useMemo(() => [
    {
      id: 'name',
      accessor: (permission: Permission) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              permission.isActive !== false ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiLock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {permission.name}
            </div>
          </div>
        </div>
      ),
      header: t('permission.name', 'Permission Name'),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'resource',
      accessor: (permission: Permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {permission.resource}
        </span>
      ),
      header: t('permission.resource', 'Resource'),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'action',
      accessor: (permission: Permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {permission.action}
        </span>
      ),
      header: t('permission.action', 'Action'),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'scope',
      accessor: (permission: Permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          {permission.scope}
        </span>
      ),
      header: t('permission.scope', 'Scope'),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'description',
      accessor: (permission: Permission) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {permission.description || t('common.no_description', 'No description')}
          </p>
        </div>
      ),
      header: t('permission.description', 'Description'),
      hideable: true,
    },
    {
      id: 'isActive',
      accessor: (permission: Permission) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          permission.isActive !== false
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {permission.isActive !== false ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
      header: t('common.status', 'Status'),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      accessor: 'createdAt',
      header: t('common.created_at', 'Created At'),
      isSortable: true,
      type: 'datetime',
      hideable: true,
    },
    {
      id: 'actions',
      accessor: (permission: Permission) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: <FiEye className="w-4 h-4" />,
              onClick: () => handlePermissionAction('view', permission),
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => handlePermissionAction('edit', permission),
            },
            {
              label: permission.isActive !== false ? t('common.deactivate', 'Deactivate') : t('common.activate', 'Activate'),
              icon: permission.isActive !== false ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />,
              onClick: () => handlePermissionAction('toggle-status', permission),
            },
            {
              label: t('common.duplicate', 'Duplicate'),
              icon: <FiPlus className="w-4 h-4" />,
              onClick: () => handlePermissionAction('duplicate', permission),
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handlePermissionAction('delete', permission),
            },
          ]}
        />
      ),
      header: t('common.actions', 'Actions'),
      hideable: false,
      width: '80px',
    },
  ], [t, handlePermissionAction]);


  // Bulk actions configuration
  const bulkActions = useMemo(() => [
    {
      value: 'activate',
      label: t('common.activate', 'Activate'),
      icon: <FiToggleRight className="w-4 h-4" />,
    },
    {
      value: 'deactivate',
      label: t('common.deactivate', 'Deactivate'),
      icon: <FiToggleLeft className="w-4 h-4" />,
    },
    {
      value: 'export',
      label: t('common.export', 'Export'),
      icon: <FiDownload className="w-4 h-4" />,
    },
    {
      value: 'delete',
      label: t('common.delete', 'Delete'),
      icon: <FiTrash2 className="w-4 h-4" />,
    },
  ], [t]);

  // Page actions
  const pageActions = useMemo(() => [
    {
      label: t('permissions.create_permission', 'Create Permission'),
      onClick: handleCreatePermission,
      primary: true,
      icon: <FiPlus className="w-4 h-4" />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: () => refetch(),
      icon: <FiRefreshCw className="w-4 h-4" />,
    },
    {
      label: t('common.export', 'Export'),
      onClick: () => handleBulkAction('export'),
      icon: <FiDownload className="w-4 h-4" />,
    },
  ], [t, handleCreatePermission, refetch, handleBulkAction]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('permissions.title', 'Permissions'),
      icon: <FiLock className="h-4 w-4" />,
    },
  ]), [t]);

  // Render loading state
  if (isLoading) {
    return (
      <BaseLayout
        title={t('permissions.permission_management', 'Permission Management')}
        description={t('permissions.manage_permissions_description', 'Manage system permissions and access controls')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Loading />
      </BaseLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <BaseLayout
        title={t('permissions.permission_management', 'Permission Management')}
        description={t('permissions.manage_permissions_description', 'Manage system permissions and access controls')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>
            {(error as any)?.message || t('messages.failed_to_load_permissions', 'Failed to load permissions')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('permissions.permission_management', 'Permission Management')}
      description={t('permissions.manage_permissions_description', 'Manage system permissions and access controls')}
      actions={pageActions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      {/* Statistics */}
      <div className="mb-6">
        <StatisticsGrid statistics={statistics} />
      </div>

      {/* Main Content */}
      <Card>
        <Table<Permission>
          tableId="permissions-table"
          data={processedData.items}
          columns={columns}
          isLoading={isFetching}
          selectedIds={selectedPermissions}
          onSelectionChange={(selectedIds: Set<string | number>) => {
            const stringIds = new Set(Array.from(selectedIds).map(id => String(id)));
            setSelectedPermissions(stringIds);
          }}
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          pagination={{
            currentPage: processedData.page,
            totalPages: processedData.totalPages,
            totalItems: processedData.total,
            itemsPerPage: processedData.limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          searchValue={filters.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder={t('permissions.search_placeholder', 'Search permissions...')}
          bulkActions={selectedPermissions.size > 0 ? bulkActions : undefined}
          onBulkAction={handleBulkAction}
          emptyMessage={t('permissions.no_permissions_found', 'No permissions found')}
          emptyAction={{
            label: t('permissions.create_permission', 'Create Permission'),
            onClick: handleCreatePermission,
            icon: <FiPlus />,
          }}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={(columnId: string, visible: boolean) => {
            const newVisibleColumns = new Set(visibleColumns);
            if (visible) {
              newVisibleColumns.add(columnId);
            } else {
              newVisibleColumns.delete(columnId);
            }
            updateVisibleColumns(newVisibleColumns);
          }}
          showColumnVisibility={true}
          enableRowHover={true}
          density="normal"
        />
      </Card>
    </BaseLayout>
  );
};

export default PermissionIndexPage;
