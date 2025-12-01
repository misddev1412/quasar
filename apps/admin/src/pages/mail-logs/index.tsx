import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BaseLayout from '../../components/layout/BaseLayout';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import type { PaginatedResponse, ApiResponse } from '@backend/trpc/schemas/response.schemas';
import type { SelectOption } from '../../components/common/Select';
import { MailLogListItem, MailLogStatistics, MailLogStatus } from '../../types/mail-log';
import { MailLogFilters as MailLogFiltersPanel } from '../../components/features/MailLogFilters';
import type { MailLogFilterFormState } from '../../components/features/MailLogFilters';
import { FiRefreshCw, FiMail, FiAlertTriangle, FiCheckCircle, FiFilter } from 'react-icons/fi';
import { getMailLogSenderInfo } from '../../utils/mail-log';

const STATUS_COLORS: Record<MailLogStatus, string> = {
  sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  queued: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  delivered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

const BODY_PREVIEW_MAX_LENGTH = 80;

const MailLogsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);
  const limitParam = parseInt(searchParams.get('limit') ?? '20', 10);
  const searchValue = searchParams.get('search') || '';
  const statusParam = searchParams.get('status');
  const providerParam = searchParams.get('providerId');
  const channelParam = searchParams.get('channel');
  const isTestParam = searchParams.get('isTest');
  const dateFromParam = searchParams.get('dateFrom');
  const dateToParam = searchParams.get('dateTo');
  const templateParam = searchParams.get('templateId');
  const flowParam = searchParams.get('flowId');

  const queryInput = useMemo(() => ({
    page: pageParam,
    limit: limitParam,
    search: searchValue || undefined,
    status: (statusParam as MailLogStatus) || undefined,
    providerId: providerParam || undefined,
    isTest: isTestParam === null ? undefined : isTestParam === 'true',
    channel: (channelParam as 'email' | 'sms' | 'push') || undefined,
    dateFrom: dateFromParam || undefined,
    dateTo: dateToParam || undefined,
    templateId: templateParam || undefined,
    flowId: flowParam || undefined,
  }), [
    pageParam,
    limitParam,
    searchValue,
    statusParam,
    providerParam,
    isTestParam,
    channelParam,
    dateFromParam,
    dateToParam,
    templateParam,
    flowParam,
  ]);

  const logsQuery = trpc.adminMailLog.getLogs.useQuery(queryInput);
  const { refetch, isFetching } = logsQuery;

  const statsQuery = trpc.adminMailLog.getStatistics.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const providersQuery = trpc.adminMailProvider.getActiveProviders.useQuery();

  const logsResponse = logsQuery.data as PaginatedResponse<MailLogListItem> | undefined;
  const logs = logsResponse?.data.items ?? [];
  const total = logsResponse?.data.total ?? 0;
  const page = logsResponse?.data.page ?? pageParam;
  const limit = logsResponse?.data.limit ?? limitParam;
  const totalPages = logsResponse?.data.totalPages ?? 1;

  const providerOptions = useMemo<SelectOption[]>(() => {
    const data = (providersQuery.data as ApiResponse<any[]> | undefined)?.data;
    if (Array.isArray(data)) {
      return data.map((provider: any) => ({
        value: provider.id,
        label: `${provider.name} (${provider.providerType})`,
      }));
    }
    return [];
  }, [providersQuery.data]);

  const filterValues = useMemo<MailLogFilterFormState>(() => ({
    status: (statusParam as MailLogStatus) || '',
    providerId: providerParam || '',
    channel: (channelParam as 'email' | 'sms' | 'push') || '',
    type: isTestParam === null ? '' : (isTestParam === 'true' ? 'tests' : 'live'),
    dateFrom: dateFromParam || '',
    dateTo: dateToParam || '',
  }), [statusParam, providerParam, channelParam, isTestParam, dateFromParam, dateToParam]);

  const activeFilterCount = useMemo(
    () => Object.values(filterValues).filter((value) => value !== undefined && value !== null && value !== '').length,
    [filterValues],
  );

  const formatBodyPreview = useCallback((log: MailLogListItem) => {
    const baseText = (typeof log.bodyPreview === 'string' ? log.bodyPreview : '')?.trim();
    const metadataContext = log.metadata?.context;
    const fallbackText = typeof metadataContext === 'string' ? metadataContext.trim() : '';
    const raw = baseText || fallbackText;

    if (!raw) {
      return '';
    }

    const normalized = raw.replace(/\s+/g, ' ');
    if (normalized.length <= BODY_PREVIEW_MAX_LENGTH) {
      return normalized;
    }

    return `${normalized.slice(0, BODY_PREVIEW_MAX_LENGTH).trimEnd()}...`;
  }, []);

  const formatSender = useCallback((log: MailLogListItem) => {
    const sender = getMailLogSenderInfo(log);
    if (sender.isSystem) {
      return t('mail_logs.sent_by.system', 'System automation');
    }
    if (sender.primary) {
      if (sender.secondary) {
        return `${sender.primary} (${sender.secondary})`;
      }
      return sender.primary;
    }
    if (sender.fallbackId) {
      return t('mail_logs.sent_by.user_id', 'User ID: {{id}}', { id: sender.fallbackId });
    }
    return t('mail_logs.sent_by.unknown', 'Unknown sender');
  }, [t]);

  const [showFilters, setShowFilters] = useState(() => activeFilterCount > 0);

  useEffect(() => {
    if (activeFilterCount > 0 && !showFilters) {
      setShowFilters(true);
    }
  }, [activeFilterCount, showFilters]);

  const handleFilterToggle = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleFiltersChange = useCallback((changes: Partial<MailLogFilterFormState>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (key === 'type') {
        if (!value) {
          next.delete('isTest');
        } else {
          next.set('isTest', value === 'tests' ? 'true' : 'false');
        }
        return;
      }

      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    next.set('page', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    ['status', 'providerId', 'channel', 'isTest', 'dateFrom', 'dateTo'].forEach((key) => next.delete(key));
    next.set('page', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const handleSearchChange = useCallback((value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set('search', value);
    } else {
      next.delete('search');
    }
    next.set('page', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const actions = useMemo(() => [
    {
      label: t('common.refresh', 'Refresh'),
      onClick: () => refetch(),
      icon: <FiRefreshCw />,
      primary: true,
      disabled: isFetching,
    },
    {
      label: showFilters ? t('filters.hide_filters', 'Hide Filters') : t('filters.show_filters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleFilterToggle, isFetching, refetch, showFilters, t]);

  const statisticsCards: StatisticData[] = useMemo(() => {
    const stats = (statsQuery.data as ApiResponse<MailLogStatistics> | undefined)?.data;
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'mail-log-total',
        title: t('mail_logs.statistics.total', 'Total emails'),
        value: stats.total.toLocaleString(),
        icon: <FiMail />,
        trend: {
          value: stats.sent,
          isPositive: true,
          label: t('mail_logs.statistics.sent', 'Sent'),
        },
      },
      {
        id: 'mail-log-success',
        title: t('mail_logs.statistics.success', 'Successful'),
        value: stats.sent.toLocaleString(),
        icon: <FiCheckCircle />,
        trend: {
          value: stats.delivered,
          isPositive: true,
          label: t('mail_logs.statistics.delivered', 'Delivered'),
        },
      },
      {
        id: 'mail-log-failed',
        title: t('mail_logs.statistics.failed', 'Failed'),
        value: stats.failed.toLocaleString(),
        icon: <FiAlertTriangle />,
        trend: {
          value: stats.tests,
          isPositive: false,
          label: t('mail_logs.statistics.tests', 'Test emails'),
        },
      },
    ];
  }, [statsQuery.data, t]);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleLimitChange = (newLimit: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('limit', String(newLimit));
    next.set('page', '1');
    setSearchParams(next);
  };

  const columns: Column<MailLogListItem>[] = useMemo(() => [
    {
      id: 'status',
      header: t('mail_logs.columns.status', 'Status'),
      accessor: (item) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[item.status] || 'bg-neutral-200 text-neutral-800'}`}>
          {item.status}
        </span>
      ),
    },
    {
      id: 'subject',
      header: t('mail_logs.columns.subject', 'Subject'),
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
            {item.subject || t('mail_logs.empty_subject', 'Untitled email')}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {formatBodyPreview(item)}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            {t('mail_logs.sent_by.label', 'Sent by')}: {formatSender(item)}
          </span>
        </div>
      ),
      width: '28%',
    },
    {
      id: 'recipient',
      header: t('mail_logs.columns.recipient', 'Recipient'),
      accessor: 'recipient',
      className: 'text-sm text-neutral-600 dark:text-neutral-300',
    },
    {
      id: 'provider',
      header: t('mail_logs.columns.provider', 'Provider'),
      accessor: (item) => (
        item.mailProvider ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.mailProvider.name}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{item.mailProvider.providerType}</span>
          </div>
        ) : <span className="text-neutral-400">—</span>
      ),
    },
    {
      id: 'type',
      header: t('mail_logs.columns.type', 'Type'),
      accessor: (item) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${item.isTest ? 'text-purple-600 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`}>
          <FiMail className="w-3 h-3" />
          {item.isTest ? t('mail_logs.filters.test', 'Test') : t('mail_logs.filters.live', 'Live')}
        </span>
      ),
      align: 'center',
    },
    {
      id: 'sentAt',
      header: t('mail_logs.columns.sent_at', 'Sent at'),
      accessor: (item) => item.sentAt || item.createdAt,
      type: 'datetime',
      width: '160px',
    },
  ], [formatBodyPreview, formatSender, t]);

  return (
    <BaseLayout
      title={t('mail_logs.title', 'Mail delivery logs')}
      description={t('mail_logs.description', 'Monitor every outbound email and debug issues quickly.')}
      actions={actions}
      breadcrumbs={[
        { label: t('navigation.mail_management', 'Email Management'), href: '/mail-templates' },
        { label: t('mail_logs.title', 'Mail delivery logs'), current: true },
      ]}
    >
      <div className="space-y-6">
        {statisticsCards.length > 0 && (
          <StatisticsGrid statistics={statisticsCards} />
        )}

        {showFilters && (
          <MailLogFiltersPanel
            filters={filterValues}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
            providerOptions={providerOptions}
          />
        )}

        <Card>
          <Table<MailLogListItem>
            tableId="mail-logs-table"
            data={logs}
            columns={columns}
            isLoading={logsQuery.isLoading || logsQuery.isFetching}
            onRowClick={(log) => navigate(`/mail-logs/${log.id}`)}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onFilterClick={handleFilterToggle}
            isFilterActive={showFilters}
            pagination={{
              currentPage: page,
              totalPages,
              totalItems: total,
              itemsPerPage: limit,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleLimitChange,
            }}
            emptyMessage={t('mail_logs.empty', 'No mail logs found for the current filters.')}
            enableRowHover
            density="comfortable"
          />
        </Card>
      </div>
    </BaseLayout>
  );
};

export default MailLogsPage;
