import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiHome, FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import BaseLayout from '../../components/layout/BaseLayout';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Input } from '../../components/common/Input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/common/Dialog';
import { useToast } from '../../context/ToastContext';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { trpc } from '../../utils/trpc';

type MailProviderListItem = {
  id: string;
  name: string;
  providerType: string;
  defaultFromEmail?: string | null;
  isActive: boolean;
  priority?: number | null;
  updatedAt?: string | null;
};

const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'providerType',
  'defaultFromEmail',
  'isActive',
  'priority',
  'updatedAt',
  'actions',
] as const;

const createDefaultColumnSet = () => new Set<string>(DEFAULT_VISIBLE_COLUMNS);

const parseNumberParam = (value: string | null, fallback: number): number => {
  const parsed = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const MailProviderIndexPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedTestProvider, setSelectedTestProvider] = useState<MailProviderListItem | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('mail-providers-table', {
    pageSize: parseInt(searchParams.get('limit') || '10', 10),
    visibleColumns: createDefaultColumnSet(),
  });

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => (preferences.visibleColumns ? new Set(preferences.visibleColumns) : createDefaultColumnSet())
  );

  useEffect(() => {
    if (preferences.visibleColumns) {
      setVisibleColumns(new Set(preferences.visibleColumns));
    } else {
      setVisibleColumns(createDefaultColumnSet());
    }
  }, [preferences.visibleColumns]);

  const preferredPageSize = preferences.pageSize || 10;
  const page = parseNumberParam(searchParams.get('page'), 1);
  const limit = parseNumberParam(searchParams.get('limit'), preferredPageSize);
  const searchValue = searchParams.get('search') || '';
  const statusParam = searchParams.get('isActive');
  const providerTypeParam = searchParams.get('providerType');

  const PROVIDER_TYPES = ['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'custom'];

  const PROVIDER_TYPE_FILTER_OPTIONS = useMemo(() => [
    { value: 'all', label: t('mail_providers.filters.all_types') },
    ...PROVIDER_TYPES.map((type) => ({ value: type, label: t(`mail_providers.types.${type}`) })),
  ], [t]);

  const STATUS_FILTER_OPTIONS = useMemo(() => [
    { value: 'all', label: t('mail_providers.filters.all_statuses') },
    { value: 'true', label: t('mail_providers.filters.active') },
    { value: 'false', label: t('mail_providers.filters.inactive') },
  ], [t]);

  const filters = useMemo(() => ({
    page,
    limit,
    search: searchValue || undefined,
    isActive: statusParam ? statusParam === 'true' : undefined,
    providerType: providerTypeParam || undefined,
  }), [page, limit, searchValue, statusParam, providerTypeParam]);

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

  const { data: providersData, isLoading, error, refetch } = trpc.adminMailProvider.getProviders.useQuery(filters);

  const deleteMutation = trpc.adminMailProvider.deleteProvider.useMutation({
    onSuccess: () => {
      addToast({ title: 'Success', description: t('mail_providers.success_deleted'), type: 'success' });
      refetch();
      setShowDeleteModal(false);
      setProviderToDelete(null);
    },
    onError: (error) => {
      addToast({ title: 'Error', description: error.message, type: 'error' });
    },
  });

  const testConnectionMutation = trpc.adminMailProvider.testConnection.useMutation({
    onSuccess: (result) => {
      const testResult = (result as any)?.data;
      if (testResult?.success) {
        addToast({
          type: 'success',
          title: t('mail_providers.test_success_title'),
          description: testResult.message || t('mail_providers.test_success_default'),
        });
      } else {
        addToast({
          type: 'error',
          title: t('mail_providers.test_failed_title'),
          description: testResult?.message || t('mail_providers.test_failed_default'),
        });
      }
      setTestingProviderId(null);
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('mail_providers.test_failed_title'),
        description: error.message || t('mail_providers.test_failed_generic'),
      });
      setTestingProviderId(null);
    },
  });

  const handleDeleteClick = useCallback((provider: MailProviderListItem) => {
    setProviderToDelete({ id: provider.id, name: provider.name });
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (providerToDelete) {
      deleteMutation.mutate({ id: providerToDelete.id });
    }
  }, [deleteMutation, providerToDelete]);

  const handleSearchChange = useCallback((value: string) => {
    updateQueryParams({
      search: value ? value : undefined,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleStatusFilterChange = useCallback((value: string) => {
    updateQueryParams({
      isActive: value === 'all' ? undefined : value,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleProviderTypeChange = useCallback((value: string) => {
    updateQueryParams({
      providerType: value === 'all' ? undefined : value,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleResetFilters = useCallback(() => {
    updateQueryParams({
      isActive: undefined,
      providerType: undefined,
      page: '1',
    });
  }, [updateQueryParams]);

  const handlePageChange = useCallback((nextPage: number) => {
    updateQueryParams({ page: nextPage.toString() });
  }, [updateQueryParams]);

  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    updatePageSize(newLimit);
    updateQueryParams({
      limit: newLimit.toString(),
      page: '1',
    });
  }, [updatePageSize, updateQueryParams]);

  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns((current) => {
      const updated = new Set(current);
      if (visible) {
        updated.add(columnId);
      } else {
        updated.delete(columnId);
      }
      updateVisibleColumns(updated);
      return updated;
    });
  }, [updateVisibleColumns]);

  const providers: MailProviderListItem[] = useMemo(() => {
    const items = (providersData as any)?.data?.items;
    return Array.isArray(items) ? items : [];
  }, [providersData]);

  const openTestDialog = useCallback((provider: MailProviderListItem) => {
    if (!provider) {
      addToast({
        type: 'error',
        title: t('mail_providers.provider_not_found'),
        description: t('mail_providers.provider_not_found_desc'),
      });
      return;
    }
    setSelectedTestProvider(provider);
    setIsTestDialogOpen(true);
  }, [addToast, t]);

  const handleRowTestClick = useCallback((provider: MailProviderListItem) => {
    openTestDialog(provider);
  }, [openTestDialog]);

  const handleCloseTestDialog = useCallback(() => {
    setIsTestDialogOpen(false);
    setSelectedTestProvider(null);
    setTestEmail('');
  }, []);

  const handleTestDialogSubmit = useCallback(() => {
    if (!selectedTestProvider) {
      addToast({
        type: 'error',
        title: t('mail_providers.provider_unavailable'),
        description: t('mail_providers.provider_unavailable_desc'),
      });
      return;
    }

    setTestingProviderId(selectedTestProvider.id);
    testConnectionMutation.mutate(
      {
        id: selectedTestProvider.id,
        ...(testEmail ? { testEmail } : {}),
      },
      {
        onSuccess: () => {
          handleCloseTestDialog();
        },
      }
    );
  }, [addToast, handleCloseTestDialog, selectedTestProvider, testConnectionMutation, testEmail, t]);

  const paginationMeta = useMemo(() => (
    (providersData as any)?.data || {
      page,
      limit,
      total: 0,
      totalPages: 0,
    }
  ), [providersData, page, limit]);

  const hasActiveFilters = Boolean(statusParam || providerTypeParam);

  const columns: Column<MailProviderListItem>[] = useMemo(() => [
    {
      id: 'name',
      header: t('mail_providers.table.name'),
      accessor: 'name',
      isSortable: true,
    },
    {
      id: 'providerType',
      header: t('mail_providers.table.type'),
      accessor: 'providerType',
      render: (value: MailProviderListItem['providerType']) => {
        const label = typeof value === 'string'
          ? t(`mail_providers.types.${value.toLowerCase()}`, { defaultValue: value })
          : t('mail_providers.table.unknown');
        return <Badge variant="secondary">{label}</Badge>;
      },
    },
    {
      id: 'defaultFromEmail',
      header: t('mail_providers.table.from_email'),
      accessor: 'defaultFromEmail',
      className: 'max-w-xs truncate',
    },
    {
      id: 'isActive',
      header: t('mail_providers.table.status'),
      accessor: 'isActive',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'destructive'}>
          {value ? t('mail_providers.table.active') : t('mail_providers.table.inactive')}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: t('mail_providers.table.priority'),
      accessor: 'priority',
      align: 'center',
    },
    {
      id: 'updatedAt',
      header: t('mail_providers.table.updated_at'),
      accessor: 'updatedAt',
      type: 'datetime',
    },
    {
      id: 'actions',
      header: t('mail_providers.table.actions'),
      accessor: 'id',
      hideable: false,
      render: (_: unknown, row: MailProviderListItem) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRowTestClick(row);
            }}
            title={t('mail_providers.test_connection')}
            aria-label={t('mail_providers.test_connection')}
          >
            <FiActivity className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/mail-providers/${row.id}/edit`);
            }}
            title={t('mail_providers.edit')}
          >
            <FiEdit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            title={t('mail_providers.delete')}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [handleDeleteClick, handleRowTestClick, navigate, t]);

  const actions = useMemo(() => [
    {
      label: t('mail_providers.create'),
      onClick: () => navigate('/mail-providers/create'),
      primary: true,
      icon: <FiPlus className="h-4 w-4" />,
    },
  ], [navigate, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('mail_providers.list_title'),
      icon: <FiMail className="h-4 w-4" />,
    },
  ]), [t]);

  return (
    <BaseLayout
      title={t('mail_providers.title')}
      description={t('mail_providers.description')}
      actions={actions}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('mail_providers.load_error')}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {showFilters && (
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={t('mail_providers.filters.status_label')}
                value={statusParam ?? 'all'}
                onChange={handleStatusFilterChange}
                options={STATUS_FILTER_OPTIONS}
              />
              <Select
                label={t('mail_providers.filters.type_label')}
                value={providerTypeParam ?? 'all'}
                onChange={handleProviderTypeChange}
                options={PROVIDER_TYPE_FILTER_OPTIONS}
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={handleResetFilters}>
                {t('mail_providers.filters.reset')}
              </Button>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                {t('mail_providers.filters.hide')}
              </Button>
            </div>
          </Card>
        )}

        <Table<MailProviderListItem>
          tableId="mail-providers-table"
          columns={columns}
          data={providers}
          isLoading={isLoading}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onFilterClick={() => setShowFilters((prev) => !prev)}
          isFilterActive={showFilters || hasActiveFilters}
          searchPlaceholder={t('mail_providers.filters.search_placeholder')}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility
          enableRowHover
          onRowClick={(provider) => navigate(`/mail-providers/${provider.id}/edit`)}
          pagination={{
            currentPage: paginationMeta.page || page,
            totalPages: paginationMeta.totalPages || 0,
            totalItems: paginationMeta.total || 0,
            itemsPerPage: paginationMeta.limit || limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleItemsPerPageChange,
          }}
          emptyMessage={t('mail_providers.empty_message')}
          emptyAction={{
            label: t('mail_providers.create'),
            onClick: () => navigate('/mail-providers/create'),
            icon: <FiPlus className="h-4 w-4" />,
          }}
        />

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title={t('mail_providers.delete_title')}
          message={t('mail_providers.delete_confirm', { name: providerToDelete?.name })}
          confirmVariant="danger"
          confirmText={t('mail_providers.delete_button')}
          cancelText={t('mail_providers.cancel_button')}
          isLoading={deleteMutation.isPending}
        />

        <Dialog open={isTestDialogOpen} onOpenChange={(open) => (open ? setIsTestDialogOpen(true) : handleCloseTestDialog())}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('mail_providers.test_title')}</DialogTitle>
              <DialogDescription>{t('mail_providers.test_description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
                {selectedTestProvider ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedTestProvider.name || t('mail_providers.untitled_provider')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTestProvider.defaultFromEmail || t('mail_providers.no_default_email')}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {t(`mail_providers.types.${selectedTestProvider.providerType?.toLowerCase()}`, {
                          defaultValue: selectedTestProvider.providerType || t('mail_providers.types.custom')
                        })}
                      </Badge>
                    </div>
                    {typeof selectedTestProvider.priority === 'number' && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('mail_providers.priority_label', { priority: selectedTestProvider.priority })}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">{t('mail_providers.no_provider_selected')}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="test-email-input">
                  {t('mail_providers.test_email_label')}
                </label>
                <Input
                  id="test-email-input"
                  type="email"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder={t('mail_providers.test_email_placeholder')}
                  inputSize="md"
                />
                <p className="text-xs text-gray-500">{t('mail_providers.test_email_help')}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseTestDialog} disabled={testConnectionMutation.isPending}>
                {t('mail_providers.cancel_button')}
              </Button>
              <Button
                variant="primary"
                onClick={handleTestDialogSubmit}
                disabled={!selectedTestProvider || testConnectionMutation.isPending}
                isLoading={Boolean(selectedTestProvider && testConnectionMutation.isPending && testingProviderId === selectedTestProvider.id)}
              >
                {t('mail_providers.run_test')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BaseLayout>
  );
};

export default MailProviderIndexPage;
