import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiTrash2, FiEdit2, FiToggleLeft, FiToggleRight, FiCpu } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import { Dropdown } from '../../components/common/Dropdown';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface OpenAiConfig {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  active: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const OpenAiConfigsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [searchValue, setSearchValue] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<OpenAiConfig>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; config: OpenAiConfig | null }>({
    isOpen: false,
    config: null,
  });

  const { data, isLoading, error, refetch } = trpc.adminOpenAiConfig.getAllConfigs.useQuery();

  const deleteConfigMutation = trpc.adminOpenAiConfig.deleteConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'OpenAI configuration deleted successfully',
        type: 'success',
      });
      refetch();
      setDeleteModal({ isOpen: false, config: null });
    },
    onError: (error) => {
      setDeleteModal({ isOpen: false, config: null });
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete OpenAI configuration',
        type: 'error',
      });
    }
  });

  const toggleConfigStatusMutation = trpc.adminOpenAiConfig.updateConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'OpenAI configuration status updated successfully',
        type: 'success',
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update configuration status',
        type: 'error',
      });
    }
  });

  const configsData = useMemo(() => {
    const responseData = data as any;
    return (responseData?.data || []) as OpenAiConfig[];
  }, [data]);

  const filteredConfigs = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return configsData;

    return configsData.filter((config) => {
      return [
        config.name,
        config.model,
        config.baseUrl,
        config.description,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword));
    });
  }, [configsData, searchValue]);

  const handleCreateConfig = () => {
    navigate('/openai-configs/create');
  };

  const goToConfig = (id: string) => navigate(`/openai-configs/${id}`);

  const handleConfigAction = useCallback((action: string, config: OpenAiConfig) => {
    switch (action) {
      case 'edit':
        goToConfig(config.id);
        break;
      case 'delete':
        setDeleteModal({ isOpen: true, config });
        break;
      case 'toggle-status':
        toggleConfigStatusMutation.mutate({ id: config.id, active: !config.active });
        break;
      default:
        break;
    }
  }, [toggleConfigStatusMutation]);

  const handleConfirmDelete = () => {
    if (deleteModal.config) {
      deleteConfigMutation.mutate({ id: deleteModal.config.id });
    }
  };

  const columns: Column<OpenAiConfig>[] = useMemo(() => [
    {
      id: 'name',
      accessor: (config: OpenAiConfig) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              config.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiCpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {config.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {config.model}
            </div>
          </div>
        </div>
      ),
      header: 'Configuration Name',
      isSortable: true,
    },
    {
      id: 'model',
      accessor: (config: OpenAiConfig) => (
        <div className="font-mono text-sm text-gray-600 dark:text-gray-300">
          {config.model}
        </div>
      ),
      header: 'Model',
      isSortable: true,
    },
    {
      id: 'baseUrl',
      accessor: (config: OpenAiConfig) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {config.baseUrl || <span className="italic text-gray-400">Default</span>}
        </div>
      ),
      header: 'Base URL',
    },
    {
      id: 'description',
      accessor: (config: OpenAiConfig) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate" title={config.description || 'No description'}>
            {config.description || <span className="italic text-gray-400">No description</span>}
          </p>
        </div>
      ),
      header: 'Description',
    },
    {
      id: 'active',
      accessor: (config: OpenAiConfig) => (
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
    },
    {
      id: 'actions',
      accessor: (config: OpenAiConfig) => (
        <Dropdown
          button={
            <Button variant="outline" size="sm">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: 'Edit Configuration',
              onClick: () => handleConfigAction('edit', config),
              icon: <FiEdit2 className="w-4 h-4" />,
            },
            {
              label: config.active ? 'Deactivate' : 'Activate',
              onClick: () => handleConfigAction('toggle-status', config),
              icon: config.active
                ? <FiToggleLeft className="w-4 h-4" />
                : <FiToggleRight className="w-4 h-4" />,
            },
            {
              label: 'Delete Configuration',
              onClick: () => handleConfigAction('delete', config),
              icon: <FiTrash2 className="w-4 h-4" />,
              className: 'text-red-600',
            },
          ]}
        />
      ),
      header: 'Actions',
    },
  ], [handleConfigAction]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('navigation.openai_configs', 'OpenAI Configurations')}
        description={t('openai_configs.description', 'Manage OpenAI model configurations')}
      >
        <Loading />
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout
        title={t('navigation.openai_configs', 'OpenAI Configurations')}
        description={t('openai_configs.description', 'Manage OpenAI model configurations')}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('admin.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as { message?: string })?.message || 'Failed to load OpenAI configurations'}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('navigation.openai_configs', 'OpenAI Configurations')}
      description={t('openai_configs.description', 'Manage OpenAI model configurations')}
      actions={[
        {
          label: t('openai_configs.create', 'Create configuration'),
          onClick: handleCreateConfig,
          icon: <FiPlus className="w-4 h-4" />,
        },
      ]}
    >
      <Table<OpenAiConfig>
        tableId="openai-configs-table"
        data={filteredConfigs}
        columns={columns}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        emptyMessage="No OpenAI configurations found"
        emptyAction={{
          label: 'Create configuration',
          onClick: handleCreateConfig,
          icon: <FiPlus className="w-4 h-4" />,
        }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, config: null })}
        onConfirm={handleConfirmDelete}
        title="Delete OpenAI Configuration"
        message={
          deleteModal.config
            ? `Are you sure you want to delete "${deleteModal.config.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this configuration?'
        }
        confirmText="Delete"
        confirmVariant="danger"
      />
    </BaseLayout>
  );
};

export default OpenAiConfigsPage;
