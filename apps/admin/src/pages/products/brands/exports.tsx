import React, { useCallback, useEffect, useMemo, useState, useId } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { StandardListPage, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, Button, Badge, Table, FormInput } from '@admin/components/common';
import type { Column } from '@admin/components/common';
import { trpc } from '@admin/utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

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

type BrandExportFilters = {
  search?: string;
  isActive?: boolean;
};

const statusVariantMap: Record<ExportJobItem['status'], 'info' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'destructive',
};

const isValueEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const BrandExportsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const locationState = (location.state as LocationState) || null;
  const searchInputId = useId();

  const [format, setFormat] = useState<'csv' | 'json'>(locationState?.format ?? 'csv');
  const [filters, setFilters] = useState<BrandExportFilters>(() => (locationState?.filters as BrandExportFilters) || {});
  const [exportMode, setExportMode] = useState<'standard' | 'template'>('standard');
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
    const formatLabel = t('brands.exports.fields.format', 'Format');
    return [
      { value: 'csv', label: `${formatLabel}: ${t('brands.exports.format.csv', 'CSV')}` },
      { value: 'json', label: `${formatLabel}: ${t('brands.exports.format.json', 'JSON')}` },
    ];
  }, [t]);

  const statusLabelMap = useMemo<Record<ExportJobItem['status'], string>>(
    () => ({
      pending: t('brands.exports.status.pending', 'Pending'),
      processing: t('brands.exports.status.processing', 'Processing'),
      completed: t('brands.exports.status.completed', 'Completed'),
      failed: t('brands.exports.status.failed', 'Failed'),
    }),
    [t],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('brands.exports.filters.status_all', 'All statuses') },
      { value: 'pending', label: statusLabelMap.pending },
      { value: 'processing', label: statusLabelMap.processing },
      { value: 'completed', label: statusLabelMap.completed },
      { value: 'failed', label: statusLabelMap.failed },
    ],
    [statusLabelMap, t],
  );

  const activeFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('brands.exports.filters.active_all', 'All') },
      { value: 'true', label: t('common.active', 'Active') },
      { value: 'false', label: t('common.inactive', 'Inactive') },
    ],
    [t],
  );

  useEffect(() => {
    if (locationState?.format) {
      setFormat(locationState.format);
    }
    if (locationState?.filters) {
      setFilters(locationState.filters as BrandExportFilters);
      setFiltersSource('imported');
      setShowFilterBuilder(true);
    } else {
      setFilters({});
      setFiltersSource(null);
    }
  }, [locationState?.format, locationState?.filters]);

  const exportBrandsMutation = (trpc.adminProductBrands as Record<string, any>).exportBrands.useMutation();
  const {
    data: exportJobsResponse,
    isLoading: exportJobsLoading,
    refetch: refetchExportJobs,
  } = (trpc.adminProductBrands as Record<string, any>).listExportJobs.useQuery(
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
    const normalizedLimit = typeof rawExportData.limit === 'number' ? rawExportData.limit : limit;
    const normalizedPage = typeof rawExportData.page === 'number' ? rawExportData.page : page;
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

      const haystack = [job.fileName ?? '', job.format, job.status, job.id]
        .map((value) => value.toString().toLowerCase())
        .join(' ');

      return haystack.includes(search);
    });
  }, [exportJobs, searchValue, statusFilter]);

  const isFiltering = searchValue.trim().length > 0 || statusFilter !== 'all';
  const filterButtonActive = showFilters || statusFilter !== 'all';

  const filterEntries = useMemo(
    () => Object.entries(filters).filter(([, value]) => !isValueEmpty(value)),
    [filters],
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

  const estimateExportBrandsQuery = (trpc.adminProductBrands as Record<string, any>).estimateExportBrands;

  const {
    data: estimateResponse,
    isFetching: estimateLoading,
    error: estimateError,
  } = estimateExportBrandsQuery.useQuery(
    { filters: filterPayload },
    {
      enabled: hasActiveFilters,
    },
  );

  const estimatedTotal = useMemo(() => {
    const raw = (estimateResponse as any)?.data?.total;
    return typeof raw === 'number' ? raw : null;
  }, [estimateResponse]);

  const estimateErrored = Boolean(estimateError);

  const handleStartExport = useCallback(async () => {
    try {
      await exportBrandsMutation.mutateAsync({
        format,
        exportMode,
        filters: hasActiveFilters ? filterPayload : undefined,
      });
      addToast({
        type: 'success',
        title: t('brands.exports.notifications.queue_success_title', 'Export queued'),
        description: t('brands.exports.notifications.queue_success_description', 'We will notify you once your file is ready to download.'),
      });
      refetchExportJobs();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('brands.exports.notifications.queue_failed_title', 'Failed to queue export'),
        description: error?.message || t('brands.exports.notifications.queue_failed_description', 'Please try again in a few seconds.'),
      });
    }
  }, [exportBrandsMutation, format, exportMode, hasActiveFilters, filterPayload, addToast, refetchExportJobs, t]);

  const exportColumns = useMemo<Column<ExportJobItem>[]>(() => [
    {
      id: 'file',
      header: t('brands.exports.table.file', 'File'),
      accessor: (job) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {job.fileName || `brands-export.${job.format}`}
          </span>
          <span className="text-xs text-gray-500">
            {t('brands.exports.table.job_id', 'Job ID: {{id}}…', { id: job.id.slice(0, 8) })}
          </span>
        </div>
      ),
    },
    {
      id: 'format',
      header: t('brands.exports.table.format', 'Format'),
      accessor: (job) => (
        <Badge variant="outline" className="uppercase">
          {job.format}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: t('brands.exports.table.status', 'Status'),
      accessor: (job) => (
        <Badge variant={statusVariantMap[job.status]}>
          {statusLabelMap[job.status]}
        </Badge>
      ),
    },
    {
      id: 'records',
      header: t('brands.exports.table.records', 'Records'),
      accessor: (job) => job.totalRecords?.toLocaleString() ?? '—',
    },
    {
      id: 'requested',
      header: t('brands.exports.table.requested', 'Requested'),
      accessor: (job) => new Date(job.createdAt).toLocaleString(),
    },
    {
      id: 'actions',
      header: t('brands.exports.table.actions', 'Actions'),
      accessor: (job) => (
        <Button
          size="sm"
          variant="outline"
          disabled={!job.fileUrl}
          onClick={() => {
            if (job.fileUrl) {
              const link = document.createElement('a');
              link.href = job.fileUrl;
              link.download = job.fileName || 'export';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
        >
          <FiDownload className="mr-2" />
          {t('brands.exports.download', 'Download')}
        </Button>
      ),
    },
  ], [statusLabelMap, t]);

  const breadcrumbs = useMemo(() => ([
    { label: t('brands.title', 'Brand Management'), href: '/products/brands' },
    { label: t('brands.exports.title', 'Exports'), isCurrent: true },
  ]), [t]);

  return (
    <StandardListPage
      title={t('brands.exports.page_title', 'Brand export center')}
      description={t('brands.exports.page_description', 'Request brand exports and monitor their progress.')}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('brands.exports.actions.back', 'Back to brands'),
          onClick: () => navigate('/products/brands'),
          icon: <FiArrowLeft />,
        },
        {
          label: showFilters ? t('brands.exports.actions.hide_filters', 'Hide filters') : t('brands.exports.actions.show_filters', 'Show filters'),
          onClick: () => setShowFilters((value) => !value),
          icon: <FiFilter />,
          active: showFilters,
        },
        {
          label: t('brands.exports.actions.refresh', 'Refresh jobs'),
          onClick: () => refetchExportJobs(),
          icon: <FiRefreshCw />,
        },
      ]}
      fullWidth
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('brands.exports.filters.title', 'Configure export')}</CardTitle>
            <CardDescription>
              {t('brands.exports.filters.description', 'Choose a format and optional filters before requesting an export.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Select
                value={format}
                onChange={(value) => setFormat(value as 'csv' | 'json')}
                options={formatOptions}
                label={t('brands.exports.fields.format', 'Format')}
              />
              <Select
                value={exportMode}
                onChange={(value) => setExportMode((value as 'standard' | 'template') || 'standard')}
                options={[
                  { value: 'standard', label: t('brands.exports.mode.standard', 'Standard Export') },
                  { value: 'template', label: t('brands.exports.mode.template', 'Import Template Format') },
                ]}
                label={t('brands.exports.fields.mode', 'Mode')}
              />
              <FormInput
                id={searchInputId}
                type="text"
                label={t('brands.exports.fields.search', 'Search')}
                placeholder={t('brands.exports.fields.search_placeholder', 'Brand name or description')}
                value={filters.search ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    search: value || undefined,
                  }));
                  setFiltersSource('manual');
                  setShowFilterBuilder(true);
                }}
              />
              <Select
                value={filters.isActive === undefined ? 'all' : String(filters.isActive)}
                onChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    isActive: value === 'all' ? undefined : value === 'true',
                  }));
                  setFiltersSource('manual');
                  setShowFilterBuilder(true);
                }}
                options={activeFilterOptions}
                label={t('brands.exports.fields.status', 'Status')}
              />
            </div>

            {showFilterBuilder && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {hasActiveFilters ? (
                  <>
                    <span>{t('brands.exports.filters.active_count', '{{count}} active filters', { count: activeFilterCount })}</span>
                    {filtersSource === 'imported' && (
                      <Badge variant="outline">{t('brands.exports.filters.imported', 'Imported from list')}</Badge>
                    )}
                  </>
                ) : (
                  <span>{t('brands.exports.filters.none', 'No filters applied')}</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleStartExport}
                disabled={exportBrandsMutation.isPending}
              >
                {exportBrandsMutation.isPending
                  ? t('brands.exports.actions.requesting', 'Requesting…')
                  : t('brands.exports.actions.start', 'Start export')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setFiltersSource('manual');
                }}
                disabled={!hasActiveFilters}
              >
                {t('brands.exports.actions.clear_filters', 'Clear filters')}
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              {estimateLoading ? (
                <span>{t('brands.exports.estimate.loading', 'Estimating records...')}</span>
              ) : estimateErrored ? (
                <span>{t('brands.exports.estimate.unavailable', 'Unable to estimate record count right now.')}</span>
              ) : estimatedTotal !== null ? (
                <span>{t('brands.exports.estimate.result', 'Estimated records: {{count}}', { count: estimatedTotal.toLocaleString() })}</span>
              ) : (
                <span>{t('brands.exports.estimate.hint', 'Apply filters to estimate the record count.')}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('brands.exports.jobs.title', 'Recent exports')}</CardTitle>
            <CardDescription>
              {t('brands.exports.jobs.description', 'Track export progress and download completed files.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {t('brands.exports.queue.filter_title', 'Filter exports')}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t('brands.exports.queue.filter_description', 'Narrow down the export queue by status.')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    disabled={statusFilter === 'all'}
                  >
                    {t('brands.exports.queue.clear_status_filter', 'Clear status filter')}
                  </Button>
                </div>
                <div className="mt-3 w-full max-w-xs">
                  <Select
                    label={t('brands.exports.fields.status', 'Status')}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter((value as ExportJobItem['status'] | 'all') || 'all')}
                    options={statusFilterOptions}
                    size="sm"
                  />
                </div>
              </div>
            )}
            <Table<ExportJobItem>
              tableId="brand-export-jobs"
              columns={exportColumns}
              data={filteredJobs}
              isLoading={exportJobsLoading}
              emptyMessage={t('brands.exports.jobs.empty', 'No export jobs yet.')}
              pagination={{
                currentPage: page,
                totalPages: normalizedExportData.totalPages,
                totalItems: normalizedExportData.total,
                itemsPerPage: normalizedExportData.limit,
                onPageChange: setPage,
                onItemsPerPageChange: setLimit,
              }}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onFilterClick={() => setShowFilters((value) => !value)}
              isFilterActive={filterButtonActive}
              showSearch
              showFilter
              showColumnVisibility={false}
            />
          </CardContent>
        </Card>
      </div>
    </StandardListPage>
  );
};

export default BrandExportsPage;
