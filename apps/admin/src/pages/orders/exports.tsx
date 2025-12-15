import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, type Column } from '../../components/common/Table';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

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

type OrderExportFilters = {
  search?: string;
  status?: string;
  paymentStatus?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
};

type LocationState = {
  filters?: Record<string, unknown>;
  format?: 'csv' | 'json';
} | null;

const statusBadgeVariant: Record<ExportJobItem['status'], 'info' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'destructive',
};

const isEmptyValue = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

const OrdersExportsPage: React.FC = () => {
  const navigate = useNavigate();
  const locationState = (useLocation().state as LocationState) || null;
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [format, setFormat] = useState<'csv' | 'json'>(locationState?.format ?? 'csv');
  const [filters, setFilters] = useState<OrderExportFilters>(() => (locationState?.filters as OrderExportFilters) || {});
  const [showFilters, setShowFilters] = useState(Boolean(locationState?.filters));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (locationState?.filters) {
      setFilters(locationState.filters as OrderExportFilters);
      setShowFilters(true);
    }
    if (locationState?.format) {
      setFormat(locationState.format);
    }
  }, [locationState?.filters, locationState?.format]);

  const filterEntries = useMemo(
    () =>
      Object.entries(filters).filter(([, value]) => !isEmptyValue(value)),
    [filters],
  );

  const hasActiveFilters = filterEntries.length > 0;
  const sanitizedFilters = useMemo(
    () =>
      filterEntries.reduce((acc, [key, value]) => {
        acc[key] = value as unknown;
        return acc;
      }, {} as Record<string, unknown>),
    [filterEntries],
  );

  const exportOrdersMutation = trpc.adminOrders.exportOrders.useMutation();

  const {
    data: estimateResponse,
    isFetching: estimateLoading,
    error: estimateError,
  } = trpc.adminOrders.estimateExportOrders.useQuery(
    { filters: hasActiveFilters ? sanitizedFilters : undefined } as any,
    {
      placeholderData: (previousData) => previousData,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: exportJobsResponse,
    isLoading: exportJobsLoading,
    refetch: refetchExportJobs,
  } = trpc.adminOrders.listExportJobs.useQuery(
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

  const estimatedTotal = useMemo(() => {
    const raw = (estimateResponse as any)?.data?.total;
    return typeof raw === 'number' ? raw : null;
  }, [estimateResponse]);
  const estimateErrored = Boolean(estimateError);

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
    return {
      items,
      total: typeof rawExportData.total === 'number' ? rawExportData.total : items.length,
      page: typeof rawExportData.page === 'number' ? rawExportData.page : page,
      limit: typeof rawExportData.limit === 'number' ? rawExportData.limit : limit,
      totalPages: typeof rawExportData.totalPages === 'number'
        ? rawExportData.totalPages
        : items.length
          ? Math.ceil(items.length / (rawExportData.limit || limit || 1))
          : 0,
    };
  }, [rawExportData, limit, page]);

  useEffect(() => {
    if (normalizedExportData.totalPages > 0 && page > normalizedExportData.totalPages) {
      setPage(normalizedExportData.totalPages);
    }
  }, [normalizedExportData.totalPages, page]);

  const handleStartExport = useCallback(async () => {
    try {
      await exportOrdersMutation.mutateAsync({
        format,
        filters: hasActiveFilters ? sanitizedFilters : undefined,
      } as any);

      addToast({
        type: 'success',
        title: t('orders.exports.toast.started_title', 'Export requested'),
        description: t('orders.exports.toast.started_desc', 'We will notify you when the export is ready.'),
      });
      refetchExportJobs();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: t('orders.exports.toast.error_title', 'Export failed to start'),
        description: error?.message || t('orders.exports.toast.error_desc', 'Please try again later.'),
      });
    }
  }, [exportOrdersMutation, format, hasActiveFilters, sanitizedFilters, addToast, t, refetchExportJobs]);

  const handleDownload = useCallback((job: ExportJobItem) => {
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

  const handleAmountChange = useCallback(
    (key: 'minAmount' | 'maxAmount', value: string) => {
      const parsed = value === '' ? undefined : Number(value);
      if (parsed === undefined || Number.isFinite(parsed)) {
        setFilters((prev) => ({ ...prev, [key]: parsed }));
      }
    },
    [],
  );

  const paginationConfig = {
    currentPage: normalizedExportData.totalPages === 0 ? 1 : normalizedExportData.page,
    totalPages: normalizedExportData.totalPages || 1,
    totalItems: normalizedExportData.total,
    itemsPerPage: normalizedExportData.limit || limit,
    onPageChange: setPage,
    onItemsPerPageChange: (value: number) => {
      setLimit(value);
      setPage(1);
    },
  };

  const columns = useMemo<Column<ExportJobItem>[]>(() => [
    {
      id: 'file',
      header: t('orders.exports.table.file', 'File'),
      accessor: (job) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {job.fileName || `orders-export.${job.format}`}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('orders.exports.table.job_id', 'Job ID: {{id}}…', { id: job.id.slice(0, 8) })}
          </span>
        </div>
      ),
    },
    {
      id: 'format',
      header: t('orders.exports.table.format', 'Format'),
      accessor: (job) => job.format.toUpperCase(),
    },
    {
      id: 'status',
      header: t('orders.exports.table.status', 'Status'),
      accessor: (job) => (
        <Badge variant={statusBadgeVariant[job.status]}>
          {t(`orders.exports.status.${job.status}`, job.status)}
        </Badge>
      ),
    },
    {
      id: 'records',
      header: t('orders.exports.table.records', 'Records'),
      accessor: (job) => job.totalRecords ?? '—',
    },
    {
      id: 'createdAt',
      header: t('orders.exports.table.requested', 'Requested'),
      accessor: (job) => new Date(job.createdAt).toLocaleString(),
    },
    {
      id: 'actions',
      header: t('orders.exports.table.actions', 'Actions'),
      accessor: (job) => (
        <Button
          variant="ghost"
          size="sm"
          startIcon={<FiDownload />}
          disabled={job.status !== 'completed' || !job.fileUrl}
          onClick={() => handleDownload(job)}
        >
          {t('orders.exports.download', 'Download')}
        </Button>
      ),
      hideable: false,
    },
  ], [t, handleDownload]);

  const breadcrumbs = useMemo(() => [
    { label: t('orders.title', 'Orders'), href: '/orders', icon: <FiArrowLeft className="w-4 h-4" /> },
    { label: t('orders.exports.title', 'Exports'), isCurrent: true },
  ], [t]);

  const actions = useMemo(() => [
    {
      label: t('orders.exports.actions.back', 'Back to orders'),
      onClick: () => navigate('/orders'),
      startIcon: <FiArrowLeft />,
    },
    {
      label: showFilters ? t('orders.exports.actions.hide_filters', 'Hide filters') : t('orders.exports.actions.show_filters', 'Show filters'),
      onClick: () => setShowFilters((prev) => !prev),
      startIcon: <FiFilter />,
      active: showFilters,
    },
    {
      label: t('orders.exports.actions.refresh', 'Refresh jobs'),
      onClick: () => refetchExportJobs(),
      startIcon: <FiRefreshCw />,
    },
  ], [navigate, showFilters, t, refetchExportJobs]);

  const statusOptions = [
    { value: '', label: t('orders.status.all', 'All statuses') },
    { value: 'PENDING', label: t('orders.status.pending', 'Pending') },
    { value: 'CONFIRMED', label: t('orders.status.confirmed', 'Confirmed') },
    { value: 'PROCESSING', label: t('orders.status.processing', 'Processing') },
    { value: 'SHIPPED', label: t('orders.status.shipped', 'Shipped') },
    { value: 'DELIVERED', label: t('orders.status.delivered', 'Delivered') },
    { value: 'CANCELLED', label: t('orders.status.cancelled', 'Cancelled') },
    { value: 'RETURNED', label: t('orders.status.returned', 'Returned') },
    { value: 'REFUNDED', label: t('orders.status.refunded', 'Refunded') },
  ];

  const paymentStatusOptions = [
    { value: '', label: t('orders.payment.all', 'All payment statuses') },
    { value: 'PENDING', label: t('orders.payment.pending', 'Pending') },
    { value: 'PAID', label: t('orders.payment.paid', 'Paid') },
    { value: 'PARTIALLY_PAID', label: t('orders.payment.partially_paid', 'Partially paid') },
    { value: 'FAILED', label: t('orders.payment.failed', 'Failed') },
    { value: 'REFUNDED', label: t('orders.payment.refunded', 'Refunded') },
    { value: 'CANCELLED', label: t('orders.payment.cancelled', 'Cancelled') },
  ];

  const sourceOptions = [
    { value: '', label: t('orders.source.all', 'All sources') },
    { value: 'WEBSITE', label: t('orders.source.website', 'Website') },
    { value: 'MOBILE_APP', label: t('orders.source.mobile_app', 'Mobile app') },
    { value: 'PHONE', label: t('orders.source.phone', 'Phone') },
    { value: 'EMAIL', label: t('orders.source.email', 'Email') },
    { value: 'IN_STORE', label: t('orders.source.in_store', 'In store') },
    { value: 'SOCIAL_MEDIA', label: t('orders.source.social', 'Social media') },
    { value: 'MARKETPLACE', label: t('orders.source.marketplace', 'Marketplace') },
  ];

  return (
    <BaseLayout
      title={t('orders.exports.page_title', 'Order export center')}
      description={t('orders.exports.page_description', 'Request order exports and monitor their progress.')}
      breadcrumbs={breadcrumbs}
      actions={actions}
      fullWidth
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('orders.exports.filters.title', 'Configure export')}</CardTitle>
            <CardDescription>
              {t('orders.exports.filters.description', 'Choose a format and optional filters before requesting an export.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label={t('orders.exports.fields.format', 'Format')}
                value={format}
                onChange={(value) => setFormat((value as 'csv' | 'json') || 'csv')}
                options={[
                  { value: 'csv', label: 'CSV' },
                  { value: 'json', label: 'JSON' },
                ]}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-800">
                  {t('orders.exports.fields.search', 'Search')}
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                  value={filters.search || ''}
                  placeholder={t('orders.exports.fields.search_placeholder', 'Order number or customer')}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                />
              </div>
            </div>

            {showFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Select
                    label={t('orders.exports.fields.status', 'Status')}
                    value={filters.status || ''}
                    onChange={(value) => setFilters((prev) => ({ ...prev, status: value || undefined }))}
                    options={statusOptions}
                  />
                  <Select
                    label={t('orders.exports.fields.payment_status', 'Payment status')}
                    value={filters.paymentStatus || ''}
                    onChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value || undefined }))}
                    options={paymentStatusOptions}
                  />
                  <Select
                    label={t('orders.exports.fields.source', 'Source')}
                    value={filters.source || ''}
                    onChange={(value) => setFilters((prev) => ({ ...prev, source: value || undefined }))}
                    options={sourceOptions}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-800">
                      {t('orders.exports.fields.date_from', 'Date from')}
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                      value={filters.dateFrom || ''}
                      onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value || undefined }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-800">
                      {t('orders.exports.fields.date_to', 'Date to')}
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                      value={filters.dateTo || ''}
                      onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value || undefined }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-800">
                      {t('orders.exports.fields.min_amount', 'Min amount')}
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                      value={filters.minAmount?.toString() || ''}
                      onChange={(event) => handleAmountChange('minAmount', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-800">
                      {t('orders.exports.fields.max_amount', 'Max amount')}
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
                      value={filters.maxAmount?.toString() || ''}
                      onChange={(event) => handleAmountChange('maxAmount', event.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={handleStartExport}
                isLoading={exportOrdersMutation.isPending}
                disabled={exportOrdersMutation.isPending}
                startIcon={<FiDownload />}
              >
                {exportOrdersMutation.isPending
                  ? t('orders.exports.actions.requesting', 'Requesting…')
                  : t('orders.exports.actions.start', 'Start export')}
              </Button>
              <Button variant="outline" onClick={() => setShowFilters((prev) => !prev)} startIcon={<FiFilter />}>
                {showFilters
                  ? t('orders.exports.actions.hide_filters', 'Hide filters')
                  : t('orders.exports.actions.show_filters', 'Show filters')}
              </Button>
              <Button variant="ghost" onClick={() => { setFilters({}); setPage(1); }}>
                {t('orders.exports.actions.clear_filters', 'Clear filters')}
              </Button>
            </div>

            <div className="rounded-lg border bg-muted px-4 py-3 text-sm">
              {estimateLoading ? (
                <span>{t('orders.exports.estimate.loading', 'Estimating records...')}</span>
              ) : estimateErrored ? (
                <span>{t('orders.exports.estimate.error', 'Unable to estimate record count right now.')}</span>
              ) : estimatedTotal === 0 ? (
                <span>{t('orders.exports.estimate.zero', 'No orders match the selected filters.')}</span>
              ) : (
                <span>
                  {t('orders.exports.estimate.result', 'Estimated records: {{count}}', {
                    count: estimatedTotal?.toLocaleString() ?? '—',
                  })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('orders.exports.jobs.title', 'Recent exports')}</CardTitle>
            <CardDescription>
              {t('orders.exports.jobs.description', 'Track export progress and download completed files.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table<ExportJobItem>
              data={normalizedExportData.items}
              columns={columns}
              isLoading={exportJobsLoading}
              emptyMessage={t('orders.exports.jobs.empty', 'No export jobs yet.')}
              pagination={paginationConfig}
              enableRowHover
              density="normal"
            />
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default OrdersExportsPage;
