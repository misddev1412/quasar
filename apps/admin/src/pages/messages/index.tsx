import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiHome, FiMail } from 'react-icons/fi';
import { Card, Select, StandardListPage, Table } from '@admin/components/common';
import type { Column, SelectOption } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { trpc } from '@admin/utils/trpc';

type InquiryStatus = 'PENDING' | 'PROCESSED' | 'REJECTED' | 'SPAM';

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  status: InquiryStatus;
  createdAt: string;
}

const parseNumberParam = (value: string | null, fallback: number): number => {
  const parsed = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const InquiryListPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseNumberParam(searchParams.get('page'), 1);
  const limit = parseNumberParam(searchParams.get('limit'), 20);
  const searchValue = searchParams.get('search') || '';
  const status = (searchParams.get('status') || '') as InquiryStatus | '';

  const updateQueryParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const queryInput = useMemo(() => ({
    page,
    limit,
    search: searchValue || undefined,
    status: status || undefined,
  }), [limit, page, searchValue, status]);

  const { data, isLoading } = (trpc as any).adminInquiry.list.useQuery(queryInput);

  const items: InquiryItem[] = useMemo(() => {
    return (data?.data?.items || []) as InquiryItem[];
  }, [data]);

  const pagination = useMemo(() => ({
    currentPage: data?.data?.page || page,
    totalPages: data?.data?.totalPages || 1,
    totalItems: data?.data?.total || 0,
    itemsPerPage: data?.data?.limit || limit,
    onPageChange: (nextPage: number) => updateQueryParams({ page: String(nextPage) }),
    onItemsPerPageChange: (nextLimit: number) => updateQueryParams({ page: '1', limit: String(nextLimit) }),
  }), [data, limit, page, updateQueryParams]);

  const statusOptions: SelectOption[] = useMemo(() => ([
    { value: '', label: t('common.all', 'All') },
    { value: 'PENDING', label: 'PENDING' },
    { value: 'PROCESSED', label: 'PROCESSED' },
    { value: 'REJECTED', label: 'REJECTED' },
    { value: 'SPAM', label: 'SPAM' },
  ]), [t]);

  const columns: Column<InquiryItem>[] = useMemo(() => [
    {
      id: 'name',
      header: t('common.name', 'Name'),
      accessor: 'name',
      minWidth: '160px',
    },
    {
      id: 'email',
      header: t('common.email', 'Email'),
      accessor: 'email',
      minWidth: '200px',
    },
    {
      id: 'phone',
      header: t('common.phone', 'Phone'),
      accessor: 'phone',
      minWidth: '140px',
    },
    {
      id: 'subject',
      header: t('common.subject', 'Subject'),
      accessor: (item) => item.subject || '—',
      minWidth: '220px',
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      accessor: 'status',
      minWidth: '120px',
    },
    {
      id: 'createdAt',
      header: t('common.created_at', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      minWidth: '210px',
    },
  ], [t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('navigation.messages', 'Messages'),
      icon: <FiMail className="h-4 w-4" />,
    },
  ]), [t]);

  return (
    <StandardListPage
      title={t('navigation.messages', 'Messages')}
      description={t('messages.description', 'Customer contact inquiries')}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <Card>
          <div className="p-4 md:max-w-xs">
            <Select
              label={t('common.status', 'Status')}
              value={status}
              onChange={(value) => updateQueryParams({ status: value || undefined, page: '1' })}
              options={statusOptions}
            />
          </div>
        </Card>

        <Card>
          <Table<InquiryItem>
            tableId="inquiry-table"
            columns={columns}
            data={items}
            isLoading={isLoading}
            searchValue={searchValue}
            onSearchChange={(value) => updateQueryParams({ search: value || undefined, page: '1' })}
            searchPlaceholder={t('messages.search_placeholder', 'Search by name, email, phone, subject...')}
            pagination={pagination}
            emptyMessage={t('messages.empty', 'No inquiries found.')}
            density="comfortable"
          />
        </Card>
      </div>
    </StandardListPage>
  );
};

export default InquiryListPage;

