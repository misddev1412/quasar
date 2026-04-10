import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiHome, FiShoppingCart } from 'react-icons/fi';
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
  metadata?: Record<string, unknown>;
}

interface ProductSnapshot {
  name?: string;
  sku?: string;
  category?: string;
  primaryImage?: string;
}

const parseNumberParam = (value: string | null, fallback: number): number => {
  const parsed = value ? parseInt(value, 10) : NaN;
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const extractProductSnapshot = (item: InquiryItem): ProductSnapshot => {
  const metadata = item.metadata;
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const rawSnapshot = (metadata as Record<string, unknown>).productSnapshot;
  if (!rawSnapshot || typeof rawSnapshot !== 'object') {
    return {};
  }

  return rawSnapshot as ProductSnapshot;
};

const getLegacyProductName = (subject?: string): string | null => {
  if (!subject) {
    return null;
  }
  const prefix = 'Inquiry for ';
  if (!subject.startsWith(prefix)) {
    return null;
  }
  const value = subject.slice(prefix.length).trim();
  return value || null;
};

const ContactPriceInquiryListPage: React.FC = () => {
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

  const { data, isLoading } = (trpc as any).adminInquiry.listContactPrice.useQuery(queryInput);

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
      minWidth: '150px',
    },
    {
      id: 'phone',
      header: t('common.phone', 'Phone'),
      accessor: 'phone',
      minWidth: '140px',
    },
    {
      id: 'email',
      header: t('common.email', 'Email'),
      accessor: 'email',
      minWidth: '200px',
    },
    {
      id: 'productImage',
      header: t('products.image', 'Image'),
      accessor: (item) => {
        const snapshot = extractProductSnapshot(item);
        if (!snapshot.primaryImage) {
          return '—';
        }
        return (
          <img
            src={snapshot.primaryImage}
            alt={snapshot.name || 'product-image'}
            className="h-12 w-12 rounded-md object-cover border border-gray-200"
            loading="lazy"
          />
        );
      },
      minWidth: '100px',
    },
    {
      id: 'product',
      header: t('products.product', 'Product'),
      accessor: (item) => {
        const snapshot = extractProductSnapshot(item);
        return snapshot.name || getLegacyProductName(item.subject) || '—';
      },
      minWidth: '220px',
    },
    {
      id: 'sku',
      header: t('products.sku', 'SKU'),
      accessor: (item) => {
        const snapshot = extractProductSnapshot(item);
        return snapshot.sku || '—';
      },
      minWidth: '140px',
    },
    {
      id: 'category',
      header: t('products.category', 'Category'),
      accessor: (item) => {
        const snapshot = extractProductSnapshot(item);
        return snapshot.category || '—';
      },
      minWidth: '180px',
    },
    {
      id: 'message',
      header: t('common.message', 'Message'),
      accessor: (item) => item.message || '—',
      minWidth: '260px',
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
      label: t('navigation.contact_price_inquiries', 'Liên hệ báo giá'),
      icon: <FiShoppingCart className="h-4 w-4" />,
    },
  ]), [t]);

  return (
    <StandardListPage
      title={t('navigation.contact_price_inquiries', 'Liên hệ báo giá')}
      description={t('messages.contact_price_description', 'Danh sách yêu cầu liên hệ báo giá từ trang sản phẩm')}
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
            tableId="contact-price-inquiry-table"
            columns={columns}
            data={items}
            isLoading={isLoading}
            searchValue={searchValue}
            onSearchChange={(value) => updateQueryParams({ search: value || undefined, page: '1' })}
            searchPlaceholder={t('messages.contact_price_search_placeholder', 'Tìm theo khách hàng, số điện thoại, email, tên sản phẩm, SKU...')}
            pagination={pagination}
            emptyMessage={t('messages.contact_price_empty', 'Chưa có yêu cầu liên hệ báo giá.')}
            density="comfortable"
          />
        </Card>
      </div>
    </StandardListPage>
  );
};

export default ContactPriceInquiryListPage;
