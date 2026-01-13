import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, Column } from '../../components/common/Table';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { UserFilters } from '../../components/features/UserFilters';
import { UserFiltersType } from '../../types/user';

type ExportJobItem = {
  id: string;
  resource: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'json';
  fileUrl?: string | null;
  fileName?: string | null;
  totalRecords?: number | null;
  createdAt: string | Date;
  completedAt?: string | Date | null;
};

type LocationState = {
  filters?: Record<string, unknown>;
  format?: 'csv' | 'json';
} | null;

const statusVariantMap: Record<ExportJobItem['status'], 'info' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'destructive',
};

const UserExportsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const locationState = (location.state as LocationState) || null;

  const [format, setFormat] = useState<'csv' | 'json'>(locationState?.format ?? 'csv');
  const [userFilters, setUserFilters] = useState<UserFiltersType>(() => (locationState?.filters as UserFiltersType) || {});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExportJobItem['status']>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFilterBuilder, setShowFilterBuilder] = useState(() => Boolean(locationState?.filters));
  const [filtersSource, setFiltersSource] = useState<'imported' | 'manual' | null>(() =>
    locationState?.filters ? 'imported' : null,
  );

  const formatOptions = useMemo(() => {
    const formatLabel = t('users.exports.fields.format', 'Format');
    return [
      { value: 'csv', label: `${formatLabel}: ${t('users.exports.format.csv', 'CSV')}` },
      { value: 'json', label: `${formatLabel}: ${t('users.exports.format.json', 'JSON')}` },
    ];
  }, [t]);

  const statusLabelMap = useMemo<Record<ExportJobItem['status'], string>>(
    () => ({
      pending: t('users.exports.status.pending', 'Pending'),
      processing: t('users.exports.status.processing', 'Processing'),
      completed: t('users.exports.status.completed', 'Completed'),
      failed: t('users.exports.status.failed', 'Failed'),
    }),
    [t],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('users.exports.filters.status_all', 'All statuses') },
      { value: 'pending', label: statusLabelMap.pending },
      { value: 'processing', label: statusLabelMap.processing },
      { value: 'completed', label: statusLabelMap.completed },
      { value: 'failed', label: statusLabelMap.failed },
    ],
    [statusLabelMap, t],
  );

  useEffect(() => {
    if (locationState?.format) {
      setFormat(locationState.format);
    }
    if (locationState?.filters) {
      setUserFilters(locationState.filters as UserFiltersType);
      setFiltersSource('imported');
      setShowFilterBuilder(true);
    } else {
      setUserFilters({});
      setFiltersSource(null);
    }
  }, [locationState?.format, locationState?.filters]);

  const exportUsersMutation = trpc.adminUser.exportUsers.useMutation();
  const {
    data: exportJobsResponse,
    isLoading: exportJobsLoading,
    refetch: refetchExportJobs,
  } = trpc.adminUser.listExportJobs.useQuery(
    { limit, page } as any,
    {
      placeholderData: (previousData) => previousData,
      refetchInterval: (response) => {
        const jobs = (response as any)?.data?.items as ExportJobItem[] | undefined;
        if (!Array.isArray(jobs)) {
          return false;
        }
        return jobs.some((job) => job.status === 'pending' || job.status === 'processing') ? 5000 : false;
      },
    }
  );

  const rawExportData = (exportJobsResponse as any)?.data;

  const normalizedExportData = useMemo(() => {
    if (!rawExportData) {
      return {
        items: [] as ExportJobItem[],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    if (Array.isArray(rawExportData)) {
      const items = rawExportData as ExportJobItem[];
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length || limit,
        totalPages: items.length ? 1 : 0,
      };
    }

    const items = Array.isArray(rawExportData.items) ? rawExportData.items : [];
    const total = typeof rawExportData.total === 'number' ? rawExportData.total : items.length;
    const normalizedLimit =
      typeof rawExportData.limit === 'number' ? rawExportData.limit : limit;
    const normalizedPage =
      typeof rawExportData.page === 'number' ? rawExportData.page : page;
    const totalPages =
      typeof rawExportData.totalPages === 'number'
        ? rawExportData.totalPages
        : total === 0
          ? 0
          : Math.ceil(total / (normalizedLimit || 1));

    return {
      items,
      total,
      page: normalizedPage,
      limit: normalizedLimit || limit,
      totalPages,
    };
  }, [rawExportData, limit, page]);

  const exportJobs = normalizedExportData.items;

  const filteredJobs = useMemo(() => {
    const search = searchValue.trim().toLowerCase();
    return exportJobs.filter((job) => {
      const matchesStatus = statusFilter === 'all' ? true : job.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        job.fileName ?? '',
        job.format,
        job.status,
        job.id,
      ]
        .map((value) => value.toString().toLowerCase())
        .join(' ');

      return haystack.includes(search);
    });
  }, [exportJobs, searchValue, statusFilter]);

  const isFiltering = searchValue.trim().length > 0 || statusFilter !== 'all';
  const filterButtonActive = showFilters || statusFilter !== 'all';

  useEffect(() => {
    if (normalizedExportData.totalPages > 0 && page > normalizedExportData.totalPages) {
      setPage(normalizedExportData.totalPages);
    }
  }, [normalizedExportData.totalPages, page]);

  const filterEntries = useMemo(
    () =>
      Object.entries(userFilters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    [userFilters],
  );

  const hasActiveFilters = filterEntries.length > 0;
  const activeFilterCount = filterEntries.length;

  const filterPayload = useMemo(
    () =>
      filterEntries.reduce((acc, [key, value]) => {
        acc[key] = value as unknown;
        return acc;
      }, {} as Record<string, unknown>),
    [filterEntries],
  );

  const estimateExportUsersQuery = (trpc.adminUser as Record<string, any>).estimateExportUsers;

  const {
    data: estimateResponse,
    isFetching: estimateLoading,
    error: estimateError,
  } = estimateExportUsersQuery.useQuery(
    {
      filters: filterEntries.length ? filterPayload : undefined,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  const estimatedTotal = useMemo(() => {
    const raw = (estimateResponse as any)?.data?.total;
    return typeof raw === 'number' ? raw : null;
  }, [estimateResponse]);

  const estimateErrored = Boolean(estimateError);
  const formattedEstimatedTotal = useMemo(
    () => (estimatedTotal !== null ? estimatedTotal.toLocaleString() : '—'),
    [estimatedTotal],
  );

  const handleRequestExport = useCallback(async () => {
    try {
      await exportUsersMutation.mutateAsync({
        format,
        filters: hasActiveFilters ? filterPayload : undefined,
      });
      addToast({
        type: 'success',
        title: t('users.exports.notifications.queue_success_title', 'Export queued'),
        description: t('users.exports.notifications.queue_success_description', 'We will notify you once your file is ready to download.'),
      });
      refetchExportJobs();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('users.exports.notifications.queue_failed_title', 'Failed to queue export'),
        description: error?.message || t('users.exports.notifications.queue_failed_description', 'Please try again in a few seconds.'),
      });
    }
  }, [exportUsersMutation, format, filterPayload, hasActiveFilters, addToast, refetchExportJobs, t]);

  const handleFiltersChange = useCallback(
    (newFilters: UserFiltersType) => {
      setUserFilters(newFilters);
      setFiltersSource('manual');
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setUserFilters({});
    setFiltersSource('manual');
  }, []);

  const toggleFilterBuilder = useCallback(() => {
    setShowFilterBuilder((prev) => !prev);
  }, []);

  const handleDownloadExport = useCallback((job: ExportJobItem) => {
    if (!job.fileUrl) return;
    const link = document.createElement('a');
    link.href = job.fileUrl;
    link.target = '_blank';
    if (job.fileName) {
      link.download = job.fileName;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchExportJobs();
  }, [refetchExportJobs]);

  const paginationMeta = normalizedExportData;

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleTablePageSizeChange = useCallback((value: number) => {
    setLimit(value);
    setPage(1);
  }, []);

  const tablePagination = isFiltering
    ? undefined
    : {
        currentPage: paginationMeta.totalPages === 0 ? 1 : paginationMeta.page,
        totalPages: paginationMeta.totalPages || 1,
        totalItems: paginationMeta.total,
        itemsPerPage: paginationMeta.limit,
        onPageChange: handlePageChange,
        onItemsPerPageChange: handleTablePageSizeChange,
      };

  const startIndex = isFiltering
    ? filteredJobs.length === 0
      ? 0
      : 1
    : paginationMeta.total === 0
      ? 0
      : (paginationMeta.page - 1) * paginationMeta.limit + 1;

  const endIndex = isFiltering
    ? filteredJobs.length
    : paginationMeta.total === 0
      ? 0
      : Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total);

  const exportColumns = useMemo<Column<ExportJobItem>[]>(() => [
    {
      id: 'file',
      header: t('users.exports.table.file', 'File'),
      accessor: (job) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {job.fileName || `users-export.${job.format}`}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('users.exports.table.job_id', 'Job ID: {{id}}…', { id: job.id.slice(0, 8) })}
          </span>
        </div>
      ),
    },
    {
      id: 'format',
      header: t('users.exports.table.format', 'Format'),
      accessor: (job) => job.format.toUpperCase(),
      className: 'uppercase',
    },
    {
      id: 'created',
      header: t('users.exports.table.created', 'Created'),
      accessor: (job) => new Date(job.createdAt).toLocaleString(),
      type: 'datetime',
    },
    {
      id: 'records',
      header: t('users.exports.table.total_records', 'Total records'),
      accessor: (job) =>
        typeof job.totalRecords === 'number'
          ? job.totalRecords.toLocaleString()
          : t('users.exports.table.pending', 'Pending'),
      align: 'center',
    },
    {
      id: 'status',
      header: t('users.exports.table.status', 'Status'),
      accessor: (job) => (
        <Badge variant={statusVariantMap[job.status]} size="sm">
          {statusLabelMap[job.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('users.exports.table.actions', 'Actions'),
      accessor: (job) => {
        const canDownload = job.status === 'completed' && !!job.fileUrl;
        return (
          <Button
            size="sm"
            variant="secondary"
            startIcon={<FiDownload />}
            disabled={!canDownload}
            onClick={() => handleDownloadExport(job)}
          >
            {t('users.exports.actions.download', 'Download')}
          </Button>
        );
      },
      align: 'right',
      hideable: false,
    },
  ], [handleDownloadExport, statusLabelMap, t]);

  const breadcrumbs = useMemo(
    () => [
      { label: t('navigation.users', 'Users'), href: '/users' },
      { label: t('users.exports.breadcrumb.exports', 'Exports'), href: '/users/exports', isCurrent: true },
    ],
    [t],
  );

  return (
    <BaseLayout
      title={t('users.exports.page_title', 'User exports')}
      description={t('users.exports.page_description', 'Track your export jobs and download completed files.')}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('users.exports.actions.back_to_users', 'Back to users'),
          onClick: () => navigate('/users'),
          icon: <FiArrowLeft />,
        },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('users.exports.request.title', 'Request a new export')}</CardTitle>
            <CardDescription>
              {t('users.exports.request.description', 'Choose the format and optional filters to queue a new export job.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`rounded-lg border p-4 ${hasActiveFilters ? 'border-amber-200 bg-amber-50' : 'border-neutral-200 bg-neutral-50'}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className={`text-sm font-medium ${hasActiveFilters ? 'text-amber-800' : 'text-neutral-800'}`}>
                    {hasActiveFilters
                      ? filtersSource === 'imported'
                        ? t('users.exports.filters.imported_title', 'Filters imported from the Users page')
                        : t('users.exports.filters.applied_title', 'Filters applied to this export')
                      : t('users.exports.filters.none_title', 'No filters applied yet')}
                  </p>
                  <p className={`text-sm ${hasActiveFilters ? 'text-amber-700' : 'text-neutral-600'}`}>
                    {hasActiveFilters
                      ? t('users.exports.filters.applied_description', 'The export will only include users matching these criteria.')
                      : t('users.exports.filters.none', 'No filters applied. The export will include all users.')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearFilters}
                    >
                      {t('users.exports.filters.clear', 'Clear filters')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={showFilterBuilder ? 'secondary' : 'outline'}
                    startIcon={<FiFilter />}
                    onClick={toggleFilterBuilder}
                  >
                    {showFilterBuilder
                      ? t('users.exports.filters.hide_builder', 'Hide filter builder')
                      : hasActiveFilters
                        ? t('users.exports.filters.edit_builder', 'Edit filters')
                        : t('users.exports.filters.add_builder', 'Add filters')}
                  </Button>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filterEntries.map(([key, value]) => (
                    <Badge key={key} variant="secondary" size="sm">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-700 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {estimateLoading ? (
                    <span>{t('users.exports.estimate.loading', 'Estimating records...')}</span>
                  ) : estimateErrored ? (
                    <span>{t('users.exports.estimate.unavailable', 'Unable to estimate record count right now.')}</span>
                  ) : (
                    <span>
                      {t('users.exports.estimate.result', 'Estimated records: {{count}}', {
                        count: formattedEstimatedTotal,
                      })}
                    </span>
                  )}
                  {hasActiveFilters && (
                    <Badge variant="outline" size="sm">
                      {t('users.exports.estimate.filtered_hint', 'Based on current filters')}
                    </Badge>
                  )}
                </div>
                {!estimateLoading && !estimateErrored && estimatedTotal === 0 && (
                  <span className="text-xs text-amber-700">
                    {t('users.exports.estimate.zero', 'No users match the selected filters.')}
                  </span>
                )}
              </div>
            </div>

            {showFilterBuilder && (
              <UserFilters
                filters={userFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
              />
            )}

            <div className="grid gap-4 md:grid-cols-[300px_auto]">
              <Select
                value={format}
                onChange={(value) => setFormat((value as 'csv' | 'json') || 'csv')}
                options={formatOptions}
                size="sm"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRequestExport}
                  isLoading={exportUsersMutation.isPending}
                  disabled={exportUsersMutation.isPending}
                  startIcon={<FiDownload />}
                >
                  {exportUsersMutation.isPending
                    ? t('users.exports.actions.queueing', 'Queuing export...')
                    : t('users.exports.actions.queue_export', 'Queue export')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRefresh}
                  startIcon={<FiRefreshCw />}
                  disabled={exportJobsLoading}
                >
                  {t('users.exports.actions.refresh_jobs', 'Refresh jobs')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="space-y-3">
              <div>
                <CardTitle>{t('users.exports.queue.title', 'Export queue')}</CardTitle>
                <CardDescription>
                  {exportJobs.some((job) => job.status === 'pending' || job.status === 'processing')
                    ? t('users.exports.queue.auto_refresh', 'Jobs refresh automatically while processing.')
                    : t('users.exports.queue.description', 'Monitor recent jobs and download completed files.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {t('users.exports.queue.filter_title', 'Filter exports')}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t('users.exports.queue.filter_description', 'Narrow down the export queue by status.')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    disabled={statusFilter === 'all'}
                  >
                    {t('users.exports.queue.clear_status_filter', 'Clear status filter')}
                  </Button>
                </div>
                <div className="mt-3 w-full max-w-xs">
                  <Select
                    label={t('users.exports.fields.status', 'Status')}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter((value as ExportJobItem['status'] | 'all') || 'all')}
                    options={statusFilterOptions}
                    size="sm"
                  />
                </div>
              </div>
            )}
            <Table<ExportJobItem>
              tableId="user-export-queue"
              columns={exportColumns}
              data={filteredJobs}
              isLoading={exportJobsLoading}
              emptyMessage={t('users.exports.table.empty', 'No export jobs found yet. Queue your first export above.')}
              pagination={tablePagination}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              showSearch
              showFilter
              onFilterClick={() => setShowFilters((prev) => !prev)}
              isFilterActive={filterButtonActive}
              enableRowHover
              density="normal"
            />
            <div className="mt-4 text-sm text-neutral-600">
              {isFiltering
                ? t('users.exports.summary.filtered', 'Showing {{count}} filtered {{label}}', {
                    count: endIndex,
                    label:
                      endIndex === 1
                        ? t('users.exports.summary.job_singular', 'job')
                        : t('users.exports.summary.job_plural', 'jobs'),
                  })
                : t('users.exports.summary.range', 'Showing {{start}}-{{end}} of {{total}} jobs', {
                    start: startIndex,
                    end: endIndex,
                    total: paginationMeta.total,
                  })}
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default UserExportsPage;
