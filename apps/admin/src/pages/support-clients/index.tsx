import React, { useState } from 'react';
import { FiMessageSquare, FiPlus, FiEdit2, FiTrash2, FiStar, FiCopy, FiEye, FiSettings, FiCalendar, FiTarget } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { CreateSupportClientModal } from '../../components/support-clients/CreateSupportClientModal';
import { EditSupportClientModal } from '../../components/support-clients/EditSupportClientModal';
import { SupportClientType, SupportClient } from '@shared/types/support-client';

interface SupportClientsResponse {
  clients: SupportClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const SupportClientsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SupportClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<SupportClient | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    isActive: '',
  });

  const { data, isLoading, refetch } = trpc.adminSupportClients.getAll.useQuery({
    page: 1,
    limit: 20,
    search: filters.search || undefined,
    type: filters.type ? filters.type as SupportClientType : undefined,
    isActive: filters.isActive ? filters.isActive === 'true' : undefined,
  });

  const { data: types } = trpc.adminSupportClients.getTypes.useQuery();

  const supportClientsData = data as any;
  const typesData = types as any;

  const deleteMutation = trpc.adminSupportClients.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: t('support_clients.delete_success'),
        type: 'success'
      });
      refetch();
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

  const handleDelete = (id: string) => {
    if (confirm(t('support_clients.confirm_delete'))) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSetAsDefault = (id: string) => {
    setAsDefaultMutation.mutate({ id });
  };

  const handleDuplicate = (id: string) => {
    const newName = prompt(t('support_clients.enter_duplicate_name'));
    if (newName !== null) {
      duplicateMutation.mutate({ id, newName: newName || undefined });
    }
  };

  const getClientTypeLabel = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const columns = [
    {
      id: 'name',
      header: t('support_clients.name'),
      accessor: (client: SupportClient) => (
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
                {t('support_clients.default')}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: t('support_clients.type'),
      accessor: (client: SupportClient) => (
        <Badge variant="secondary">
          {getClientTypeLabel(client.type)}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: t('support_clients.status'),
      accessor: (client: SupportClient) => (
        <div className="space-y-1">
          <Badge variant={client.isActive ? 'default' : 'secondary'}>
            {client.isActive ? t('admin.active') : t('admin.inactive')}
          </Badge>
          {client.scheduleEnabled && (
            <Badge variant="secondary" size="sm">
              <FiCalendar className="w-3 h-3 mr-1" />
              {t('support_clients.scheduled')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'position',
      header: t('support_clients.position'),
      accessor: (client: SupportClient) => (
        <span className="text-gray-600 dark:text-gray-400">
          {client.widgetSettings?.position || 'Bottom Right'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      accessor: (client: SupportClient) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedClient(client)}
            title={t('support_clients.preview')}
          >
            <FiEye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingClient(client)}
            title={t('common.edit')}
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicate(client.id)}
            title={t('support_clients.duplicate')}
          >
            <FiCopy className="w-4 h-4" />
          </Button>
          {!client.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetAsDefault(client.id)}
              title={t('support_clients.set_as_default')}
            >
              <FiStar className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(client.id)}
            title={t('common.delete')}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('support_clients.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('support_clients.description')}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <FiPlus className="w-4 h-4 mr-2" />
          {t('support_clients.create')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('support_clients.search')}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={t('support_clients.search_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('support_clients.type')}
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              {typesData?.data?.map?.((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('support_clients.status')}
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="true">{t('admin.active')}</option>
              <option value="false">{t('admin.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={supportClientsData?.data?.clients || []}
        isLoading={isLoading}
        pagination={{
          currentPage: supportClientsData?.data?.pagination?.page || 1,
          totalPages: supportClientsData?.data?.pagination?.pages || 1,
          totalItems: supportClientsData?.data?.pagination?.total || 0,
          itemsPerPage: supportClientsData?.data?.pagination?.limit || 20,
          onPageChange: (page) => {
            // Handle page change
          },
        }}
      />

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
                {t('support_clients.preview')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedClient.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('support_clients.configuration')}
                  </h4>
                  <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto">
                    {JSON.stringify(selectedClient.configuration, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('support_clients.widget_settings')}
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
                  <FiCalendar className="w-4 h-4 inline mr-1" />
                  {t('support_clients.scheduling')}
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedClient.scheduleStart && (
                    <p>{t('support_clients.start_date')}: {selectedClient.scheduleStart.toLocaleDateString()}</p>
                  )}
                  {selectedClient.scheduleEnd && (
                    <p>{t('support_clients.end_date')}: {selectedClient.scheduleEnd.toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupportClientsPage;