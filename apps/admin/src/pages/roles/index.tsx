import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiShield, FiUsers, FiSettings, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiCopy, FiUser } from 'react-icons/fi';
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
import { Role, RoleFiltersType, RoleStatistics } from '../../types/role';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { QuickAddPermissionModal } from '../../components/role/QuickAddPermissionModal';
import { QuickAddUserModal } from '../../components/role/QuickAddUserModal';
import { FiHome } from 'react-icons/fi';

interface RoleIndexPageProps {}

const RoleIndexPage: React.FC<RoleIndexPageProps> = () => {
  // Actions column fix applied
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [filters, setFilters] = useState<RoleFiltersType>({
    search: searchParams.get('search') || '',
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    isDefault: searchParams.get('isDefault') ? searchParams.get('isDefault') === 'true' : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  });

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<Role>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; role: Role | null }>({
    isOpen: false,
    role: null
  });
  const [quickAddPermissionModal, setQuickAddPermissionModal] = useState<{ 
    isOpen: boolean; 
    role: Role | null 
  }>({
    isOpen: false,
    role: null
  });
  const [quickAddUserModal, setQuickAddUserModal] = useState<{ 
    isOpen: boolean; 
    role: Role | null 
  }>({
    isOpen: false,
    role: null
  });

  // Table preferences - show most important columns by default
  const { preferences, updateVisibleColumns, resetPreferences } = useTablePreferences('roles-table', {
    visibleColumns: new Set([
      'name',
      'code',
      'description', 
      'permissionCount',
      'userCount',
      'isActive',
      'isDefault',
      'createdAt',
      'actions',
    ]),
  });

  const visibleColumns = preferences.visibleColumns || new Set([
    'name',
    'code',
    'description',
    'permissionCount', 
    'userCount',
    'isActive',
    'isDefault',
    'createdAt',
    'actions',
  ]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());
    if (filters.isDefault !== undefined) params.set('isDefault', filters.isDefault.toString());
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 10) params.set('limit', filters.limit.toString());

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Build query parameters for API call
  const queryParams = useMemo(() => ({
    page: filters.page || 1,
    limit: filters.limit || 10,
    search: filters.search || undefined,
    isActive: filters.isActive,
    isDefault: filters.isDefault,
  }), [filters]);

  const { data, isLoading, error, refetch, isFetching } = trpc.adminRole.getAllRoles.useQuery(queryParams);

  // Fetch role statistics
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = trpc.adminRole.getRoleStatistics.useQuery();

  // Mutations
  const deleteRoleMutation = trpc.adminRole.deleteRole.useMutation({
    onSuccess: () => {
      addToast({
        title: t('common.success', 'Success'),
        description: t('roles.role_deleted_successfully', 'Role deleted successfully'),
        type: 'success',
      });
      refetch();
      setDeleteModal({ isOpen: false, role: null });
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message || t('roles.failed_to_delete_role', 'Failed to delete role'),
        type: 'error',
      });
    },
  });

  const toggleRoleStatusMutation = trpc.adminRole.toggleRoleStatus.useMutation({
    onSuccess: (response) => {
      const roleData = (response as any)?.data;
      addToast({
        title: t('common.success', 'Success'),
        description: t('roles.role_status_updated', 'Role status updated successfully'),
        type: 'success',
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message || t('roles.failed_to_update_role_status', 'Failed to update role status'),
        type: 'error',
      });
    },
  });

  const duplicateRoleMutation = trpc.adminRole.duplicateRole.useMutation({
    onSuccess: (response) => {
      const roleData = (response as any)?.data;
      addToast({
        title: t('common.success', 'Success'),
        description: t('roles.role_duplicated_successfully', 'Role duplicated successfully'),
        type: 'success',
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message || t('roles.failed_to_duplicate_role', 'Failed to duplicate role'),
        type: 'error',
      });
    },
  });

  const handleCreateRole = () => {
    navigate('/roles/create');
  };

  const goToRole = (id: string) => navigate(`/roles/${id}`);

  // Handle role actions
  const handleRoleAction = useCallback((action: string, role: Role) => {
    switch (action) {
      case 'view':
      case 'edit':
        goToRole(role.id);
        break;
      case 'delete':
        handleDeleteRole(role);
        break;
      case 'toggle-status':
        handleToggleRoleStatus(role);
        break;
      case 'duplicate':
        handleDuplicateRole(role);
        break;
      case 'quick-add-permission':
        handleQuickAddPermission(role);
        break;
      case 'quick-add-user':
        handleQuickAddUser(role);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }, []);

  const handleDeleteRole = (role: Role) => {
    setDeleteModal({ isOpen: true, role });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.role) {
      deleteRoleMutation.mutate({ id: deleteModal.role.id });
    }
  };

  const handleToggleRoleStatus = (role: Role) => {
    toggleRoleStatusMutation.mutate({ id: role.id });
  };

  const handleDuplicateRole = (role: Role) => {
    duplicateRoleMutation.mutate({ id: role.id });
  };

  const handleQuickAddPermission = (role: Role) => {
    setQuickAddPermissionModal({ isOpen: true, role });
  };

  const handleQuickAddUser = (role: Role) => {
    setQuickAddUserModal({ isOpen: true, role });
  };

  // Handle bulk actions
  const handleBulkAction = (_action: string) => {};

  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<RoleFiltersType>) => {
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
  const handleSortChange = useCallback((sortDescriptor: SortDescriptor<Role>) => {
    setSortDescriptor(sortDescriptor);
    // TODO: Implement server-side sorting
  }, []);

  // Statistics data
  const statistics: StatisticData[] = useMemo(() => {
    if (!(statisticsData as any)?.data) return [];

    const stats = (statisticsData as any).data as RoleStatistics;
    return [
      {
        id: 'total-roles',
        title: t('roles.statistics.total_roles', 'Total Roles'),
        value: stats.total?.toString() || '0',
        icon: <FiShield className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'blue',
      },
      {
        id: 'active-roles',
        title: t('roles.statistics.active_roles', 'Active Roles'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'green',
      },
      {
        id: 'inactive-roles',
        title: t('roles.statistics.inactive_roles', 'Inactive Roles'),
        value: stats.inactive?.toString() || '0',
        icon: <FiUsers className="w-5 h-5" />,
        trend: { value: 0, isPositive: false, label: '0%' },
        color: 'red',
      },
      {
        id: 'default-roles',
        title: t('roles.statistics.default_roles', 'Default Roles'),
        value: stats.default?.toString() || '0',
        icon: <FiSettings className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'purple',
      },
    ];
  }, [statisticsData, t]);

  // Table columns configuration
  const columns: Column<Role>[] = useMemo(() => [
    {
      id: 'name',
      accessor: (role: Role) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              role.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiShield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {role.name}
            </div>
          </div>
        </div>
      ),
      header: t('role.name', 'Role Name'),
      isSortable: true,
    },
    {
      id: 'code',
      accessor: (role: Role) => (
        <div className="font-mono text-sm text-gray-600 dark:text-gray-300">
          {role.code}
        </div>
      ),
      header: t('role.code', 'Code'),
      isSortable: true,
    },
    {
      id: 'description',
      accessor: (role: Role) => (
        <div className="max-w-xs">
          <p 
            className="text-sm text-gray-600 dark:text-gray-300 truncate"
            title={role.description || t('common.no_description', 'No description')}
          >
            {role.description || 
              <span className="italic text-gray-400">{t('common.no_description', 'No description')}</span>
            }
          </p>
        </div>
      ),
      header: t('role.description', 'Description'),
    },
    {
      id: 'permissionCount',
      accessor: (role: Role) => (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {role.permissionCount || 0}
          </span>
        </div>
      ),
      header: t('role.permissions', 'Permissions'),
      isSortable: true,
    },
    {
      id: 'userCount',
      accessor: (role: Role) => (
        <div className="flex items-center space-x-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {role.userCount || 0}
          </span>
        </div>
      ),
      header: t('role.users', 'Users'),
      isSortable: true,
    },
    {
      id: 'isActive',
      accessor: (role: Role) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {role.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
      header: t('common.status', 'Status'),
      isSortable: true,
    },
    {
      id: 'isDefault',
      accessor: (role: Role) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          role.isDefault
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {role.isDefault ? t('common.yes', 'Yes') : t('common.no', 'No')}
        </span>
      ),
      header: t('role.is_default', 'Default'),
      isSortable: true,
    },
    {
      id: 'createdAt',
      accessor: 'createdAt',
      header: t('common.created_at', 'Created At'),
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      accessor: (role: Role) => (
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
              onClick: () => handleRoleAction('view', role),
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => handleRoleAction('edit', role),
            },
            {
              label: t('roles.quick_add_permissions', 'Quick Add Permissions'),
              icon: <FiPlus className="w-4 h-4" />,
              onClick: () => handleRoleAction('quick-add-permission', role),
            },
            {
              label: t('roles.quick_add_users', 'Quick Add Users'),
              icon: <FiUser className="w-4 h-4" />,
              onClick: () => handleRoleAction('quick-add-user', role),
            },
            {
              label: role.isActive ? t('common.deactivate', 'Deactivate') : t('common.activate', 'Activate'),
              icon: role.isActive ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />,
              onClick: () => handleRoleAction('toggle-status', role),
            },
            {
              label: t('common.duplicate', 'Duplicate'),
              icon: <FiCopy className="w-4 h-4" />,
              onClick: () => handleRoleAction('duplicate', role),
            },
            ...(!role.isDefault ? [{
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleRoleAction('delete', role),
              disabled: (role.userCount || 0) > 0,
              tooltip: (role.userCount || 0) > 0 
                ? t('roles.cannot_delete_role_with_users', {
                    count: role.userCount,
                    defaultValue: `Cannot delete role. It is assigned to ${role.userCount} user(s). Remove all users first.`
                  })
                : undefined,
            }] : []),
          ]}
        />
      ),
      header: t('common.actions', 'Actions'),
      hideable: false,
    },
  ], [t, handleRoleAction]);

  // Filter visible columns based on user preferences - handled by Table component internally

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
      label: t('roles.create_role', 'Create Role'),
      onClick: handleCreateRole,
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
  ], [t, handleCreateRole, refetch, handleBulkAction]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('roles.title', 'Roles'),
      icon: <FiShield className="w-4 h-4" />,
    },
  ]), [t]);

  // Render loading state
  if (isLoading) {
    return (
      <BaseLayout
        title={t('roles.role_management', 'Role Management')}
        description={t('roles.manage_roles_description', 'Manage user roles and permissions')}
        fullWidth={true}
      >
        <Loading />
      </BaseLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <BaseLayout
        title={t('roles.role_management', 'Role Management')}
        description={t('roles.manage_roles_description', 'Manage user roles and permissions')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>
            {(error as any)?.message || t('messages.failed_to_load_roles', 'Failed to load roles')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const roles = (data as any)?.data?.items || [];
  const totalRoles = (data as any)?.data?.total || 0;
  const currentPage = (data as any)?.data?.page || 1;
  const pageSize = (data as any)?.data?.limit || 10;
  const totalPages = (data as any)?.data?.totalPages || 1;

  return (
    <BaseLayout
      title={t('roles.role_management', 'Role Management')}
      description={t('roles.manage_roles_description', 'Manage user roles and permissions')}
      actions={pageActions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      {/* Statistics */}
      {!statisticsLoading && !statisticsError && (
        <div className="mb-6">
          <StatisticsGrid statistics={statistics} />
        </div>
      )}

      {/* Main Content */}
      <Card>
        <Table<Role>
          data={roles}
          columns={columns}
          isLoading={isFetching}
          selectedIds={selectedRoles}
          onSelectionChange={(selectedIds: Set<string | number>) => {
            const stringIds = new Set(Array.from(selectedIds).map(id => String(id)));
            setSelectedRoles(stringIds);
          }}
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalRoles,
            itemsPerPage: pageSize,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          searchValue={filters.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder={t('roles.search_placeholder', 'Search roles...')}
          bulkActions={selectedRoles.size > 0 ? bulkActions : undefined}
          onBulkAction={handleBulkAction}
          emptyMessage={t('roles.no_roles_found', 'No roles found')}
          emptyAction={{
            label: t('roles.create_role', 'Create Role'),
            onClick: handleCreateRole,
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
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, role: null })}
        onConfirm={handleConfirmDelete}
        title={t('roles.delete_role', 'Delete Role')}
        message={deleteModal.role ? 
          t('roles.delete_role_confirmation', { 
            roleName: deleteModal.role.name,
            defaultValue: `Are you sure you want to delete the role "${deleteModal.role.name}"? This action cannot be undone.`
          }) : ''
        }
        confirmText={t('common.delete', 'Delete')}
        confirmVariant="danger"
        icon={<FiTrash2 className="w-6 h-6" />}
        isLoading={deleteRoleMutation.isPending}
      />

      {/* Quick Add Permission Modal */}
      <QuickAddPermissionModal
        isOpen={quickAddPermissionModal.isOpen}
        onClose={() => setQuickAddPermissionModal({ isOpen: false, role: null })}
        roleId={quickAddPermissionModal.role?.id || ''}
        roleName={quickAddPermissionModal.role?.name || ''}
        onSuccess={() => {
          refetch();
          addToast({
            title: t('common.success', 'Success'),
            description: t('roles.permissions_added_successfully', 'Permissions added successfully'),
            type: 'success',
          });
        }}
      />

      {/* Quick Add User Modal */}
      <QuickAddUserModal
        isOpen={quickAddUserModal.isOpen}
        onClose={() => setQuickAddUserModal({ isOpen: false, role: null })}
        roleId={quickAddUserModal.role?.id || ''}
        roleName={quickAddUserModal.role?.name || ''}
        onSuccess={(result) => {
          refetch();
          addToast({
            title: t('common.success', 'Success'),
            description: t('roles.users_added_successfully', { 
              added: result.addedCount,
              skipped: result.skippedCount,
              defaultValue: `Successfully added ${result.addedCount} user(s) to role. ${result.skippedCount} user(s) were skipped.`
            }),
            type: 'success',
          });
        }}
      />
    </BaseLayout>
  );
};

export default RoleIndexPage;
