import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiPlus, 
  FiMoreVertical, 
  FiMail, 
  FiEdit2, 
  FiDownload, 
  FiFilter, 
  FiRefreshCw, 
  FiTrash2, 
  FiEye, 
  FiToggleLeft, 
  FiToggleRight, 
  FiCopy,
  FiActivity,
  FiFileText
} from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { 
  MailTemplateListItem, 
  MailTemplateFilters, 
  MailTemplateStatistics,
  MailTemplateBulkAction,
  MAIL_TEMPLATE_TYPE_OPTIONS
} from '../../types/mail-template';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { FiHome } from 'react-icons/fi';

interface MailTemplateIndexPageProps {}

const MailTemplateIndexPage: React.FC<MailTemplateIndexPageProps> = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // State management
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<MailTemplateListItem | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Table preferences
  const {
    preferences,
    updateVisibleColumns,
  } = useTablePreferences('mail-templates-table', {
    visibleColumns: new Set(['name', 'subject', 'type', 'isActive', 'variableCount', 'updatedAt', 'actions']),
  });

  const visibleColumns = preferences.visibleColumns || new Set(['name', 'subject', 'type', 'isActive', 'variableCount', 'updatedAt', 'actions']);

  // URL state management
  const filters: MailTemplateFilters = useMemo(() => ({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'updatedAt',
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
  }), [searchParams]);

  // API queries
  const { data, isLoading, error, refetch, isFetching } = trpc.adminMailTemplate.getTemplates.useQuery(filters);
  
  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = trpc.adminMailTemplate.getStatistics.useQuery();

  const {
    data: templateTypesData,
    isLoading: typesLoading
  } = trpc.adminMailTemplate.getTemplateTypes.useQuery();

  // Mutations
  const deleteTemplateMutation = trpc.adminMailTemplate.deleteTemplate.useMutation({
    onSuccess: () => {
      addToast({
        title: t('mail_templates.delete_success', 'Mail template deleted successfully'),
        type: 'success'
      });
      refetch();
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      addToast({
        title: error.message || t('mail_templates.delete_error', 'Failed to delete mail template'),
        type: 'error'
      });
    },
  });

  const bulkUpdateStatusMutation = trpc.adminMailTemplate.bulkUpdateStatus.useMutation({
    onSuccess: (result) => {
      const count = (result as any)?.data?.affectedCount || 0;
      addToast({
        title: t('mail_templates.bulk_update_success', `Updated ${count} templates`),
        type: 'success'
      });
      refetch();
      setSelectedTemplates(new Set());
    },
    onError: (error) => {
      addToast({
        title: error.message || t('mail_templates.bulk_update_error', 'Failed to update templates'),
        type: 'error'
      });
    },
  });

  // Event handlers
  const handleCreateTemplate = () => {
    navigate('/mail-templates/create');
  };

  const goToTemplate = (id: string) => navigate(`/mail-templates/${id}`);

  const handleEditTemplate = (template: MailTemplateListItem) => {
    navigate(`/mail-templates/${template.id}`);
  };

  const handleDeleteTemplate = (template: MailTemplateListItem) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const handleCloneTemplate = (template: MailTemplateListItem) => {
    navigate(`/mail-templates/${template.id}/clone`);
  };

  const handlePreviewTemplate = (template: MailTemplateListItem) => {
    navigate(`/mail-templates/${template.id}/preview`);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplateMutation.mutate({ id: templateToDelete.id });
    }
  };

  const handleBulkAction = (action: MailTemplateBulkAction) => {
    const selectedIds = Array.from(selectedTemplates);
    
    switch (action) {
      case 'activate':
        bulkUpdateStatusMutation.mutate({ ids: selectedIds, isActive: true });
        break;
      case 'deactivate':
        bulkUpdateStatusMutation.mutate({ ids: selectedIds, isActive: false });
        break;
      case 'delete':
        setShowBulkDeleteModal(true);
        break;
      case 'export':
        // TODO: Implement export functionality
        addToast({
          title: t('common.feature_coming_soon', 'Feature coming soon'),
          type: 'info'
        });
        break;
      case 'clone':
        // TODO: Implement bulk clone functionality
        addToast({
          title: t('common.feature_coming_soon', 'Feature coming soon'),
          type: 'info'
        });
        break;
    }
  };

  const handleSearch = useCallback((searchValue: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (searchValue) {
      newParams.set('search', searchValue);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleFilterChange = useCallback((key: string, value: string | boolean | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== '') {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((sortDescriptor: any) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortDescriptor.column);
    newParams.set('sortOrder', sortDescriptor.direction === 'ascending' ? 'ASC' : 'DESC');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Table columns configuration
  const columns: Column<MailTemplateListItem>[] = useMemo(() => [
    {
      id: 'name',
      header: t('mail_templates.name', 'Name'),
      isSortable: true,
      hideable: true,
      accessor: (template) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FiMail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {template.name}
            </div>
            {template.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {template.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'subject',
      header: t('mail_templates.subject', 'Subject'),
      isSortable: true,
      hideable: true,
      accessor: (template) => (
        <div className="max-w-xs truncate" title={template.subject}>
          {template.subject}
        </div>
      ),
    },
    {
      id: 'type',
      header: t('mail_templates.type', 'Type'),
      isSortable: true,
      hideable: true,
      accessor: (template) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {template.type}
        </span>
      ),
    },
    {
      id: 'isActive',
      header: t('mail_templates.status', 'Status'),
      isSortable: true,
      hideable: true,
      accessor: (template) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          template.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {template.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
    },
    {
      id: 'variableCount',
      header: t('mail_templates.variables', 'Variables'),
      isSortable: false,
      hideable: true,
      accessor: (template) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {template.variableCount}
        </span>
      ),
    },
    {
      id: 'updatedAt',
      header: t('common.updated_at', 'Updated'),
      accessor: 'updatedAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      isSortable: false,
      hideable: false,
      width: '80px',
      accessor: (template) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: t('common.preview', 'Preview'),
              icon: <FiEye className="w-4 h-4" />,
              onClick: () => handlePreviewTemplate(template),
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => handleEditTemplate(template),
            },
            {
              label: t('common.clone', 'Clone'),
              icon: <FiCopy className="w-4 h-4" />,
              onClick: () => handleCloneTemplate(template),
            },
            {
              label: template.isActive ? t('common.deactivate', 'Deactivate') : t('common.activate', 'Activate'),
              icon: template.isActive ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />,
              onClick: () => bulkUpdateStatusMutation.mutate({ 
                ids: [template.id], 
                isActive: !template.isActive 
              }),
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleDeleteTemplate(template),
              className: 'text-red-600 dark:text-red-400',
            },
          ]}
        />
      ),
    },
  ], [t, handleEditTemplate, handleDeleteTemplate, handleCloneTemplate, handlePreviewTemplate, bulkUpdateStatusMutation]);

  // Statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!(statisticsData as any)?.data) return [];

    const stats = (statisticsData as any).data;
    return [
      {
        id: 'total',
        title: t('mail_templates.total_templates', 'Total Templates'),
        value: stats.total.toString(),
        icon: <FiFileText className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '' },
        color: 'blue',
      },
      {
        id: 'active',
        title: t('mail_templates.active_templates', 'Active Templates'),
        value: stats.active.toString(),
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '' },
        color: 'green',
      },
      {
        id: 'inactive',
        title: t('mail_templates.inactive_templates', 'Inactive Templates'),
        value: stats.inactive.toString(),
        icon: <FiToggleLeft className="w-5 h-5" />,
        trend: { value: 0, isPositive: false, label: '' },
        color: 'red',
      },
      {
        id: 'types',
        title: t('mail_templates.template_types', 'Template Types'),
        value: Object.keys(stats.byType).length.toString(),
        icon: <FiMail className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '' },
        color: 'purple',
      },
    ];
  }, [statisticsData, t]);

  // Bulk actions
  const bulkActions = useMemo(() => [
    {
      label: t('common.activate', 'Activate'),
      value: 'activate',
      onClick: () => handleBulkAction('activate'),
      icon: <FiToggleRight className="w-4 h-4" />,
    },
    {
      label: t('common.deactivate', 'Deactivate'),
      value: 'deactivate',
      onClick: () => handleBulkAction('deactivate'),
      icon: <FiToggleLeft className="w-4 h-4" />,
    },
    {
      label: t('common.export', 'Export'),
      value: 'export',
      onClick: () => handleBulkAction('export'),
      icon: <FiDownload className="w-4 h-4" />,
    },
    {
      label: t('common.delete', 'Delete'),
      value: 'delete',
      onClick: () => handleBulkAction('delete'),
      icon: <FiTrash2 className="w-4 h-4" />,
      className: 'text-red-600 dark:text-red-400',
    },
  ], [t, handleBulkAction]);

  // Page actions
  const pageActions = useMemo(() => [
    {
      label: t('mail_templates.create_template', 'Create Template'),
      onClick: handleCreateTemplate,
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
  ], [t, handleCreateTemplate, refetch, handleBulkAction]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('mail_templates.title', 'Mail Templates'),
      icon: <FiMail className="w-4 h-4" />,
    },
  ]), [t]);

  // Render loading state
  if (isLoading) {
    return (
      <BaseLayout
        title={t('mail_templates.mail_template_management', 'Mail Template Management')}
        description={t('mail_templates.manage_templates_description', 'Manage email templates for your application')}
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
        title={t('mail_templates.mail_template_management', 'Mail Template Management')}
        description={t('mail_templates.manage_templates_description', 'Manage email templates for your application')}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>
            {error.message || t('mail_templates.load_error', 'Failed to load mail templates')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const templates = (data as any)?.data?.items || [];
  const total = (data as any)?.data?.total || 0;

  return (
    <BaseLayout
      title={t('mail_templates.mail_template_management', 'Mail Template Management')}
      description={t('mail_templates.manage_templates_description', 'Manage email templates for your application')}
      actions={pageActions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      {/* Statistics */}
      {!statisticsLoading && statisticsCards.length > 0 && (
        <div className="mb-6">
          <StatisticsGrid statistics={statisticsCards} />
        </div>
      )}

      {/* Main Content */}
      <Card>
        <Table
          tableId="mail-templates-table"
          data={templates}
          columns={columns}
          isLoading={isFetching}
          pagination={{
            currentPage: filters.page,
            totalPages: Math.ceil(total / filters.limit),
            totalItems: total,
            itemsPerPage: filters.limit,
            onPageChange: handlePageChange,
          }}
          sortDescriptor={{
            columnAccessor: filters.sortBy as keyof MailTemplateListItem,
            direction: filters.sortOrder === 'ASC' ? 'asc' : 'desc',
          }}
          onSortChange={handleSortChange}
          selectedIds={selectedTemplates}
          onSelectionChange={(selectedIds: Set<string | number>) => {
            setSelectedTemplates(new Set(Array.from(selectedIds).map(String)));
          }}
          onRowClick={(template) => goToTemplate(template.id)}
          searchValue={filters.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder={t('mail_templates.search_placeholder', 'Search templates...')}
          bulkActions={selectedTemplates.size > 0 ? bulkActions : undefined}
          onBulkAction={handleBulkAction}
          emptyMessage={t('mail_templates.no_templates_found', 'No mail templates found')}
          emptyAction={{
            label: t('mail_templates.create_template', 'Create Template'),
            onClick: handleCreateTemplate,
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t('mail_templates.delete_template', 'Delete Mail Template')}
        message={t('mail_templates.delete_confirmation', 'Are you sure you want to delete this mail template? This action cannot be undone.')}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        isLoading={deleteTemplateMutation.isPending}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={() => {
          // TODO: Implement bulk delete
          setShowBulkDeleteModal(false);
          setSelectedTemplates(new Set());
        }}
        title={t('mail_templates.bulk_delete_templates', 'Delete Mail Templates')}
        message={t('mail_templates.bulk_delete_confirmation', `Are you sure you want to delete ${selectedTemplates.size} mail templates? This action cannot be undone.`)}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
      />
    </BaseLayout>
  );
};

export default MailTemplateIndexPage;
