import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiServer, FiActivity, FiSettings, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiCopy, FiGlobe, FiHome } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface FirebaseConfig {
  id: string;
  name: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  active: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface FirebaseConfigFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

const FirebaseConfigsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [filters, setFilters] = useState<FirebaseConfigFilters>({
    search: searchParams.get('search') || '',
    active: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  });

  const [selectedConfigs, setSelectedConfigs] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<FirebaseConfig>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; config: FirebaseConfig | null }>({
    isOpen: false,
    config: null
  });

  // Table preferences
  const { preferences, updateVisibleColumns } = useTablePreferences('firebase-configs-table', {
    visibleColumns: new Set([
      'name',
      'projectId',
      'authDomain',
      'description',
      'active',
      'createdAt',
      'actions',
    ]),
  });

  const visibleColumns = preferences.visibleColumns || new Set([
    'name',
    'projectId', 
    'authDomain',
    'description',
    'active',
    'createdAt',
    'actions',
  ]);

  // Build query parameters for API call
  const queryParams = useMemo(() => ({
    page: filters.page || 1,
    limit: filters.limit || 10,
    search: filters.search || undefined,
    active: filters.active,
  }), [filters]);

  const { data, isLoading, error, refetch, isFetching } = trpc.adminFirebaseConfig.getAllConfigs.useQuery();

  const deleteConfigMutation = trpc.adminFirebaseConfig.deleteConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Firebase configuration deleted successfully',
        type: 'success',
      });
      refetch();
      setDeleteModal({ isOpen: false, config: null });
    },
    onError: (error) => {
      setDeleteModal({ isOpen: false, config: null });
      
      if (error.message?.includes('not found')) {
        addToast({
          title: 'Configuration Not Found',
          description: 'The Firebase configuration you are trying to delete no longer exists.',
          type: 'error',
        });
        refetch(); // Refresh the list
      } else if (error.message?.includes('active') || error.message?.includes('in use')) {
        addToast({
          title: 'Cannot Delete Active Configuration',
          description: 'You cannot delete an active Firebase configuration. Please deactivate it first.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'Error',
          description: error.message || 'Failed to delete Firebase configuration',
          type: 'error',
        });
      }
    }
  });

  const toggleConfigStatusMutation = trpc.adminFirebaseConfig.updateConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success', 
        description: 'Firebase configuration status updated successfully',
        type: 'success',
      });
      refetch();
    },
    onError: (error) => {
      if (error.message?.includes('not found')) {
        addToast({
          title: 'Configuration Not Found',
          description: 'The Firebase configuration you are trying to update no longer exists.',
          type: 'error',
        });
        refetch(); // Refresh the list
      } else if (error.message?.includes('validation') || error.message?.includes('invalid')) {
        addToast({
          title: 'Invalid Configuration',
          description: 'Cannot activate configuration. Please check the configuration details and try again.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'Error',
          description: error.message || 'Failed to update configuration status',
          type: 'error',
        });
      }
    }
  });

  const handleCreateConfig = () => {
    navigate('/firebase-configs/create');
  };

  const goToConfig = (id: string) => navigate(`/firebase-configs/${id}`);

  // Handle config actions
  const handleConfigAction = useCallback((action: string, config: FirebaseConfig) => {
    switch (action) {
      case 'view':
      case 'edit':
        goToConfig(config.id);
        break;
      case 'delete':
        handleDeleteConfig(config);
        break;
      case 'toggle-status':
        handleToggleConfigStatus(config);
        break;
      case 'duplicate':
        handleDuplicateConfig(config);
        break;
      case 'test-connection':
        handleTestConnection(config);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }, []);

  const handleDeleteConfig = (config: FirebaseConfig) => {
    setDeleteModal({ isOpen: true, config });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.config) {
      deleteConfigMutation.mutate({ id: deleteModal.config.id });
    }
  };

  const handleToggleConfigStatus = (config: FirebaseConfig) => {
    toggleConfigStatusMutation.mutate({ 
      id: config.id, 
      active: !config.active 
    });
  };

  const handleDuplicateConfig = (config: FirebaseConfig) => {
    // For now, navigate to create page with pre-filled data
    navigate('/firebase-configs/create', { 
      state: { 
        duplicateFrom: {
          ...config,
          name: `${config.name} (Copy)`,
          active: false
        }
      }
    });
  };

  const handleTestConnection = (config: FirebaseConfig) => {
    addToast({
      title: 'Testing Connection',
      description: `Testing connection to ${config.name}...`,
      type: 'info',
    });
  };

  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Handle sorting
  const handleSortChange = useCallback((sortDescriptor: SortDescriptor<FirebaseConfig>) => {
    setSortDescriptor(sortDescriptor);
  }, []);

  // Statistics data
  const statistics: StatisticData[] = useMemo(() => {
    const responseData = data as any;
    const configsData = (responseData?.data as FirebaseConfig[]) || [];
    const activeCount = configsData.filter(config => config.active).length;
    const inactiveCount = configsData.length - activeCount;
    
    return [
      {
        id: 'total-configs',
        title: 'Total Configurations',
        value: configsData.length.toString(),
        icon: <FiServer className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'blue',
      },
      {
        id: 'active-configs',
        title: 'Active Configurations',
        value: activeCount.toString(),
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'green',
      },
      {
        id: 'inactive-configs',
        title: 'Inactive Configurations',
        value: inactiveCount.toString(),
        icon: <FiSettings className="w-5 h-5" />,
        trend: { value: 0, isPositive: false, label: '0%' },
        color: 'red',
      },
      {
        id: 'environments',
        title: 'Environments',
        value: configsData.length.toString(),
        icon: <FiGlobe className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        color: 'purple',
      },
    ];
  }, [data]);

  // Table columns configuration
  const columns: Column<FirebaseConfig>[] = useMemo(() => [
    {
      id: 'name',
      accessor: (config: FirebaseConfig) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              config.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiServer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {config.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {config.projectId}
            </div>
          </div>
        </div>
      ),
      header: 'Configuration Name',
      isSortable: true,
    },
    {
      id: 'projectId',
      accessor: (config: FirebaseConfig) => (
        <div className="font-mono text-sm text-gray-600 dark:text-gray-300">
          {config.projectId}
        </div>
      ),
      header: 'Project ID',
      isSortable: true,
    },
    {
      id: 'authDomain',
      accessor: (config: FirebaseConfig) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {config.authDomain}
        </div>
      ),
      header: 'Auth Domain',
      isSortable: true,
    },
    {
      id: 'description',
      accessor: (config: FirebaseConfig) => (
        <div className="max-w-xs">
          <p 
            className="text-sm text-gray-600 dark:text-gray-300 truncate"
            title={config.description || 'No description'}
          >
            {config.description || 
              <span className="italic text-gray-400">No description</span>
            }
          </p>
        </div>
      ),
      header: 'Description',
    },
    {
      id: 'active',
      accessor: (config: FirebaseConfig) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          config.active
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {config.active ? 'Active' : 'Inactive'}
        </span>
      ),
      header: 'Status',
      isSortable: true,
    },
    {
      id: 'createdAt',
      accessor: 'createdAt',
      header: 'Created At',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      accessor: (config: FirebaseConfig) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: 'View',
              icon: <FiEye className="w-4 h-4" />,
              onClick: () => handleConfigAction('view', config),
            },
            {
              label: 'Edit',
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => handleConfigAction('edit', config),
            },
            {
              label: 'Test Connection',
              icon: <FiActivity className="w-4 h-4" />,
              onClick: () => handleConfigAction('test-connection', config),
            },
            {
              label: config.active ? 'Deactivate' : 'Activate',
              icon: config.active ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />,
              onClick: () => handleConfigAction('toggle-status', config),
            },
            {
              label: 'Duplicate',
              icon: <FiCopy className="w-4 h-4" />,
              onClick: () => handleConfigAction('duplicate', config),
            },
            {
              label: 'Delete',
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleConfigAction('delete', config),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      header: 'Actions',
      hideable: false,
    },
  ], [handleConfigAction]);

  // Page actions
  const pageActions = useMemo(() => [
    {
      label: 'Create Configuration',
      onClick: handleCreateConfig,
      primary: true,
      icon: <FiPlus className="w-4 h-4" />,
    },
    {
      label: 'Refresh',
      onClick: () => refetch(),
      icon: <FiRefreshCw className="w-4 h-4" />,
    },
    {
      label: 'Export',
      onClick: () => {},
      icon: <FiDownload className="w-4 h-4" />,
    },
  ], [handleCreateConfig, refetch]);

  // Render loading state
  if (isLoading) {
    return (
      <BaseLayout
        title="Firebase Configurations"
        description="Manage Firebase project configurations"
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
        title="Firebase Configurations"
        description="Manage Firebase project configurations"
        fullWidth={true}
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as any)?.message || 'Failed to load Firebase configurations'}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const responseData = data as any;
  const configs = (responseData?.data as FirebaseConfig[]) || [];
  const totalConfigs = configs.length || 0;
  const currentPage = 1;
  const pageSize = configs.length || 10;
  const totalPages = 1;

  return (
    <BaseLayout
      title="Firebase Configurations"
      description="Manage Firebase project configurations"
      actions={pageActions}
      fullWidth={true}
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: 'Home',
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: 'Firebase Configurations',
              icon: <FiServer className="w-4 h-4" />
            }
          ]}
        />

        {/* Statistics */}
        <div className="mb-6">
          <StatisticsGrid statistics={statistics} />
        </div>

      {/* Main Content */}
      <Card>
        <Table<FirebaseConfig>
          data={configs}
          columns={columns}
          isLoading={isFetching}
          selectedIds={selectedConfigs}
          onSelectionChange={(selectedIds: Set<string | number>) => {
            const stringIds = new Set(Array.from(selectedIds).map(id => String(id)));
            setSelectedConfigs(stringIds);
          }}
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalConfigs,
            itemsPerPage: pageSize,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          searchValue={filters.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder="Search Firebase configurations..."
          emptyMessage="No Firebase configurations found"
          emptyAction={{
            label: 'Create Configuration',
            onClick: handleCreateConfig,
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
        onClose={() => setDeleteModal({ isOpen: false, config: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Firebase Configuration"
        message={deleteModal.config ? 
          `Are you sure you want to delete the Firebase configuration "${deleteModal.config.name}"? This action cannot be undone.` : ''
        }
        confirmText="Delete"
        confirmVariant="danger"
        icon={<FiTrash2 className="w-6 h-6" />}
        isLoading={deleteConfigMutation.isPending}
      />
      </div>
    </BaseLayout>
  );
};

export default FirebaseConfigsPage;