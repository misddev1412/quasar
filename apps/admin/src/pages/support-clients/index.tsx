import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMessageSquare, FiPlus, FiEdit2, FiTrash2, FiStar, FiCopy, FiEye, FiHome, FiFilter } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreateSupportClientModal } from '../../components/support-clients/CreateSupportClientModal';
import { EditSupportClientModal } from '../../components/support-clients/EditSupportClientModal';
import { SupportClientType, SupportClient } from '@shared/types/support-client';
import type { PaginatedResponse, ApiResponse } from '@backend/trpc/schemas/response.schemas';
import type { SelectOption } from '../../components/common/Select';

type SupportClientListItem = SupportClient;

const parseNumberParam = (value: string | null, fallback: number): number => {
  const parsed = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const SupportClientsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SupportClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<SupportClient | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseNumberParam(searchParams.get('page'), 1);
  const limit = parseNumberParam(searchParams.get('limit'), 20);
  const searchValue = searchParams.get('search') || '';
  const typeParam = searchParams.get('type');
  const isActiveParam = searchParams.get('isActive');

  const filters = useMemo(() => ({
    page,
    limit,
    search: searchValue || undefined,
    type: typeParam ? (typeParam as SupportClientType) : undefined,
    isActive: isActiveParam ? isActiveParam === 'true' : undefined,
  }), [page, limit, searchValue, typeParam, isActiveParam]);

  const updateQueryParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const { data: clientsData, isLoading, error, refetch } = trpc.adminSupportClients.getAll.useQuery(filters);
  const { data: typesData } = trpc.adminSupportClients.getTypes.useQuery();

  // Handle both response formats: 
  // 1. Standard format: { data: { items, total, page, limit, totalPages } }
  // 2. Current format: { data: { clients, pagination: { page, limit, total, pages } } }
  const clientsResponse = clientsData as any;
  const clients: SupportClientListItem[] = useMemo(() => {
    if (!clientsResponse?.data) return [];
    
    // Check for standard format first
    if (Array.isArray(clientsResponse.data.items)) {
      return clientsResponse.data.items;
    }
    
    // Check for current format
    if (Array.isArray(clientsResponse.data.clients)) {
      return clientsResponse.data.clients;
    }
    
    return [];
  }, [clientsResponse]);

  const paginationMeta = useMemo(() => {
    if (!clientsResponse?.data) {
      return {
        page,
        limit,
        total: 0,
        totalPages: 1,
      };
    }
    
    // Check for standard format first
    if (clientsResponse.data.total !== undefined) {
      return {
        page: clientsResponse.data.page || page,
        limit: clientsResponse.data.limit || limit,
        total: clientsResponse.data.total || 0,
        totalPages: clientsResponse.data.totalPages || 1,
      };
    }
    
    // Check for current format
    if (clientsResponse.data.pagination) {
      const pagination = clientsResponse.data.pagination;
      return {
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        totalPages: pagination.pages || 1,
      };
    }
    
    return {
      page,
      limit,
      total: 0,
      totalPages: 1,
    };
  }, [clientsResponse, page, limit]);

  const typeOptions = useMemo<SelectOption[]>(() => {
    const types = (typesData as ApiResponse<any[]> | undefined)?.data;
    if (Array.isArray(types)) {
      return [
        { value: '', label: t('common.all', 'All') },
        ...types.map((type: any) => ({
          value: type.value,
          label: type.label,
        })),
      ];
    }
    return [{ value: '', label: t('common.all', 'All') }];
  }, [typesData, t]);

  const statusFilterOptions: SelectOption[] = useMemo(() => [
    { value: '', label: t('common.all', 'All') },
    { value: 'true', label: t('admin.active', 'Active') },
    { value: 'false', label: t('admin.inactive', 'Inactive') },
  ], [t]);

  const deleteMutation = trpc.adminSupportClients.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: t('support_clients.delete_success'),
        type: 'success'
      });
      refetch();
      setShowDeleteModal(false);
      setClientToDelete(null);
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('support_clients.delete_error'),
        type: 'error'
      });
    },
  });

  const setAsDefaultMutation = trpc.adminSupportClients.setAsDefault.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: t('support_clients.set_default_success'),
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('support_clients.set_default_error'),
        type: 'error'
      });
    },
  });

  const duplicateMutation = trpc.adminSupportClients.duplicate.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: t('support_clients.duplicate_success'),
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || t('support_clients.duplicate_error'),
        type: 'error'
      });
    },
  });

  const handleDeleteClick = useCallback((client: SupportClientListItem) => {
    setClientToDelete({ id: client.id, name: client.name });
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (clientToDelete) {
      deleteMutation.mutate({ id: clientToDelete.id });
    }
  }, [deleteMutation, clientToDelete]);

  const handleSetAsDefault = useCallback((id: string) => {
    setAsDefaultMutation.mutate({ id });
  }, [setAsDefaultMutation]);

  const handleDuplicate = useCallback((id: string) => {
    const newName = prompt(t('support_clients.enter_duplicate_name', 'Enter name for duplicate:'));
    if (newName !== null && newName.trim()) {
      duplicateMutation.mutate({ id, newName: newName.trim() });
    }
  }, [duplicateMutation, t]);

  const handleSearchChange = useCallback((value: string) => {
    updateQueryParams({
      search: value ? value : undefined,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleTypeFilterChange = useCallback((value: string) => {
    updateQueryParams({
      type: value ? value : undefined,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleStatusFilterChange = useCallback((value: string) => {
    updateQueryParams({
      isActive: value ? value : undefined,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleResetFilters = useCallback(() => {
    updateQueryParams({
      type: undefined,
      isActive: undefined,
      page: '1',
    });
  }, [updateQueryParams]);

  const handlePageChange = useCallback((nextPage: number) => {
    updateQueryParams({ page: nextPage.toString() });
  }, [updateQueryParams]);

  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    updateQueryParams({
      limit: newLimit.toString(),
      page: '1',
    });
  }, [updateQueryParams]);

  const getClientTypeLabel = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const hasActiveFilters = Boolean(typeParam || isActiveParam);

  const columns: Column<SupportClientListItem>[] = useMemo(() => [
    {
      id: 'name',
      header: t('support_clients.name', 'Name'),
      accessor: (client) => (
        <div className="flex items-center space-x-3">
          {client.iconUrl && (
            <img
              src={client.iconUrl}
              alt={client.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {client.name}
            </div>
            {client.isDefault && (
              <Badge variant="default" size="sm" className="mt-1">
                <FiStar className="w-3 h-3 mr-1" />
                {t('support_clients.default', 'Default')}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: t('support_clients.type', 'Type'),
      accessor: (client) => (
        <Badge variant="secondary">
          {getClientTypeLabel(client.type)}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: t('support_clients.status', 'Status'),
      accessor: (client) => (
        <div className="space-y-1">
          <Badge variant={client.isActive ? 'success' : 'destructive'}>
            {client.isActive ? t('admin.active', 'Active') : t('admin.inactive', 'Inactive')}
          </Badge>
          {client.scheduleEnabled && (
            <Badge variant="secondary" size="sm" className="block mt-1">
              {t('support_clients.scheduled', 'Scheduled')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'position',
      header: t('support_clients.position', 'Position'),
      accessor: (client) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {client.widgetSettings?.position || 'Bottom Right'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: 'id',
      hideable: false,
      render: (_: unknown, client: SupportClientListItem) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedClient(client);
            }}
            title={t('support_clients.preview', 'Preview')}
          >
            <FiEye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingClient(client);
            }}
            title={t('common.edit', 'Edit')}
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate(client.id);
            }}
            title={t('support_clients.duplicate', 'Duplicate')}
          >
            <FiCopy className="w-4 h-4" />
          </Button>
          {!client.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSetAsDefault(client.id);
              }}
              title={t('support_clients.set_as_default', 'Set as Default')}
            >
              <FiStar className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(client);
            }}
            title={t('common.delete', 'Delete')}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [t, handleDeleteClick, handleSetAsDefault, handleDuplicate]);

  const actions = useMemo(() => [
    {
      label: t('support_clients.create', 'Create Support Client'),
      onClick: () => setIsCreateModalOpen(true),
      primary: true,
      icon: <FiPlus className="h-4 w-4" />,
    },
    {
      label: showFilters ? t('filters.hide_filters', 'Hide Filters') : t('filters.show_filters', 'Show Filters'),
      onClick: () => setShowFilters((prev) => !prev),
      icon: <FiFilter className="h-4 w-4" />,
      active: showFilters,
    },
  ], [showFilters, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('support_clients.title', 'Support Clients'),
      icon: <FiMessageSquare className="h-4 w-4" />,
    },
  ]), [t]);

  return (
    <BaseLayout
      title={t('support_clients.title', 'Support Clients')}
      description={t('support_clients.description', 'Manage support client configurations and widgets')}
      actions={actions}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {showFilters && (
          <Card>
            <div className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label={t('support_clients.type', 'Type')}
                  value={typeParam ?? ''}
                  onChange={handleTypeFilterChange}
                  options={typeOptions}
                />
                <Select
                  label={t('support_clients.status', 'Status')}
                  value={isActiveParam ?? ''}
                  onChange={handleStatusFilterChange}
                  options={statusFilterOptions}
                />
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <Button variant="secondary" onClick={handleResetFilters}>
                  {t('common.reset_filters', 'Reset filters')}
                </Button>
                <Button variant="ghost" onClick={() => setShowFilters(false)}>
                  {t('filters.hide_filters', 'Hide filters')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <Table<SupportClientListItem>
            tableId="support-clients-table"
            columns={columns}
            data={clients}
            isLoading={isLoading}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onFilterClick={() => setShowFilters((prev) => !prev)}
            isFilterActive={showFilters || hasActiveFilters}
            searchPlaceholder={t('support_clients.search_placeholder', 'Search by name...')}
            enableRowHover
            pagination={{
              currentPage: paginationMeta.page,
              totalPages: paginationMeta.totalPages,
              totalItems: paginationMeta.total,
              itemsPerPage: paginationMeta.limit,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange,
            }}
            emptyMessage={t('support_clients.empty', 'No support clients found.')}
            emptyAction={{
              label: t('support_clients.create', 'Create Support Client'),
              onClick: () => setIsCreateModalOpen(true),
              icon: <FiPlus className="h-4 w-4" />,
            }}
            density="comfortable"
          />
        </Card>

        {/* Create Modal */}
        <CreateSupportClientModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsCreateModalOpen(false);
          }}
        />

        {/* Edit Modal */}
        {editingClient && (
          <EditSupportClientModal
            isOpen={!!editingClient}
            client={editingClient}
            onClose={() => setEditingClient(null)}
            onSuccess={() => {
              refetch();
              setEditingClient(null);
            }}
          />
        )}

        {/* Preview Modal */}
        {selectedClient && (
          <Modal
            isOpen={!!selectedClient}
            onClose={() => setSelectedClient(null)}
            size="xl"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('support_clients.preview', 'Preview')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedClient.name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('support_clients.configuration', 'Configuration')}
                    </h4>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedClient.configuration, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('support_clients.widget_settings', 'Widget Settings')}
                    </h4>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedClient.widgetSettings, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {selectedClient.scheduleEnabled && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t('support_clients.scheduling', 'Scheduling')}
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedClient.scheduleStart && (
                      <p>{t('support_clients.start_date', 'Start Date')}: {new Date(selectedClient.scheduleStart).toLocaleDateString()}</p>
                    )}
                    {selectedClient.scheduleEnd && (
                      <p>{t('support_clients.end_date', 'End Date')}: {new Date(selectedClient.scheduleEnd).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title={t('support_clients.delete_title', 'Delete Support Client')}
          message={t('support_clients.confirm_delete', 'Are you sure you want to delete "{{name}}"?', { name: clientToDelete?.name || '' })}
          confirmVariant="danger"
          confirmText={t('common.delete', 'Delete')}
          cancelText={t('common.cancel', 'Cancel')}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default SupportClientsPage;
