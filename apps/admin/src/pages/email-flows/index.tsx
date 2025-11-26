import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiHome } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useToast } from '../../context/ToastContext';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { trpc } from '../../utils/trpc';

type EmailFlowListItem = {
  id: string;
  name: string;
  description?: string | null;
  mailProvider?: {
    id: string;
    name: string;
    providerType?: string;
  };
  mailProviderId?: string | null;
  isActive: boolean;
  priority?: number | null;
  updatedAt?: string | null;
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'mailProvider',
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

const EmailFlowIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('email-flows-table', {
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
  const providerParam = searchParams.get('mailProviderId');

  const filters = useMemo(() => ({
    page,
    limit,
    search: searchValue || undefined,
    isActive: statusParam ? statusParam === 'true' : undefined,
    mailProviderId: providerParam || undefined,
  }), [page, limit, searchValue, statusParam, providerParam]);

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

  const { data: flowsData, isLoading, error, refetch } = trpc.adminEmailFlow.getFlows.useQuery(filters);
  const { data: mailProvidersData } = trpc.adminMailProvider.getActiveProviders.useQuery();
  const providerOptions = useMemo(() => {
    const base = [{ value: 'all', label: 'All mail providers' }];
    const items = (mailProvidersData as any)?.data;
    if (Array.isArray(items)) {
      return [
        ...base,
        ...items.map((provider: any) => ({
          value: provider.id,
          label: `${provider.name} (${provider.providerType})`,
        })),
      ];
    }
    return base;
  }, [mailProvidersData]);

  const deleteMutation = trpc.adminEmailFlow.deleteFlow.useMutation({
    onSuccess: () => {
      addToast({ title: 'Success', description: 'Email flow deleted successfully', type: 'success' });
      refetch();
      setShowDeleteModal(false);
      setFlowToDelete(null);
    },
    onError: (error) => {
      addToast({ title: 'Error', description: error.message, type: 'error' });
    },
  });

  const handleDelete = useCallback((flow: EmailFlowListItem) => {
    setFlowToDelete({ id: flow.id, name: flow.name });
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (flowToDelete) {
      deleteMutation.mutate({ id: flowToDelete.id });
    }
  }, [deleteMutation, flowToDelete]);

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

  const handleProviderFilterChange = useCallback((value: string) => {
    updateQueryParams({
      mailProviderId: value === 'all' ? undefined : value,
      page: '1',
    });
  }, [updateQueryParams]);

  const handleResetFilters = useCallback(() => {
    updateQueryParams({
      isActive: undefined,
      mailProviderId: undefined,
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

  const flows: EmailFlowListItem[] = useMemo(() => {
    const items = (flowsData as any)?.data?.items;
    return Array.isArray(items) ? items : [];
  }, [flowsData]);

  const paginationMeta = useMemo(() => (
    (flowsData as any)?.data || {
      page,
      limit,
      total: 0,
      totalPages: 0,
    }
  ), [flowsData, page, limit]);

  const hasActiveFilters = Boolean(statusParam || providerParam);

  const columns: Column<EmailFlowListItem>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Flow Name',
      accessor: 'name',
      isSortable: true,
    },
    {
      id: 'mailProvider',
      header: 'Mail Provider',
      accessor: 'mailProvider',
      render: (value: EmailFlowListItem['mailProvider']) => {
        if (!value) {
          return <span className="text-gray-400">No provider</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">{value.name}</span>
            {value.providerType && (
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {value.providerType}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'destructive'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: 'priority',
      align: 'center',
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      accessor: 'updatedAt',
      type: 'datetime',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: () => '',
      hideable: false,
      render: (_: unknown, row: EmailFlowListItem) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/email-flows/${row.id}/edit`)}
          >
            <FiEdit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [handleDelete, navigate]);

  const actions = useMemo(() => [
    {
      label: 'Create Flow',
      onClick: () => navigate('/email-flows/create'),
      primary: true,
      icon: <FiPlus className="h-4 w-4" />,
    },
  ], [navigate]);

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: 'Email Flows',
      icon: <FiMail className="h-4 w-4" />,
    },
  ]), []);

  return (
    <BaseLayout
      title="Email Flows"
      description="Monitor and orchestrate automated email delivery sequences."
      actions={actions}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load email flows</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {showFilters && (
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Status"
                value={statusParam ?? 'all'}
                onChange={handleStatusFilterChange}
                options={STATUS_FILTER_OPTIONS}
              />
              <Select
                label="Mail Provider"
                value={providerParam ?? 'all'}
                onChange={handleProviderFilterChange}
                options={providerOptions}
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset filters
              </Button>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                Hide filters
              </Button>
            </div>
          </Card>
        )}

        <Table<EmailFlowListItem>
          tableId="email-flows-table"
          columns={columns}
          data={flows}
          isLoading={isLoading}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onFilterClick={() => setShowFilters((prev) => !prev)}
          isFilterActive={showFilters || hasActiveFilters}
          searchPlaceholder="Search by email flow name"
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility
          enableRowHover
          onRowClick={(flow) => navigate(`/email-flows/${flow.id}/edit`)}
          pagination={{
            currentPage: paginationMeta.page || page,
            totalPages: paginationMeta.totalPages || 0,
            totalItems: paginationMeta.total || 0,
            itemsPerPage: paginationMeta.limit || limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleItemsPerPageChange,
          }}
          emptyMessage="No email flows found."
          emptyAction={{
            label: 'Create Flow',
            onClick: () => navigate('/email-flows/create'),
            icon: <FiPlus className="h-4 w-4" />,
          }}
        />

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Email Flow"
          message={`Are you sure you want to delete "${flowToDelete?.name}"?`}
          confirmVariant="danger"
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default EmailFlowIndexPage;
