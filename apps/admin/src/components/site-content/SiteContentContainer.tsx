'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiEdit2, FiFileText, FiFilter, FiGlobe, FiMoreVertical, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import SiteContentFilters, { SiteContentFilterKey, SiteContentFiltersState } from '../features/SiteContentFilters';
import { Button } from '../common/Button';
import { Dropdown } from '../common/Dropdown';
import { StatisticsGrid, StatisticData } from '../common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../common/Table';
import { Loading } from '../common/Loading';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';
import { SiteContent } from '../../types/site-content';
import { useTablePreferences } from '../../hooks/useTablePreferences';

type LayoutAction = {
  label: string;
  onClick: () => void;
  primary?: boolean;
  icon?: React.ReactNode;
  active?: boolean;
};

interface SiteContentContainerProps {
  initialSiteContent?: SiteContent[];
  onActionsChange?: (actions: LayoutAction[]) => void;
}

type SortOption = 'updatedAt' | 'createdAt' | 'publishedAt' | 'displayOrder';

const SiteContentContainer: React.FC<SiteContentContainerProps> = ({ initialSiteContent, onActionsChange }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('site-content-table', {
    pageSize: 10,
    visibleColumns: new Set(['page', 'category', 'status', 'language', 'updatedAt', 'actions']),
  });
  const [limit, setLimit] = useState(preferences.pageSize);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() =>
    preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['page', 'category', 'status', 'language', 'updatedAt', 'actions'])
  );
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<SiteContentFiltersState>({
    category: '',
    status: '',
    languageCode: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

  // State for data
  const [siteContents, setSiteContents] = useState<SiteContent[]>(initialSiteContent || []);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLimit(preferences.pageSize);
  }, [preferences.pageSize]);

  useEffect(() => {
    if (preferences.visibleColumns) {
      setVisibleColumns(new Set(preferences.visibleColumns));
    }
  }, [preferences.visibleColumns]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // TRPC query
  const siteContentQuery = trpc.adminSiteContents.listSiteContents.useQuery({
    page: currentPage,
    limit,
    search: debouncedSearchValue || undefined,
    category: filters.category ? (filters.category as SiteContentCategory) : undefined,
    status: filters.status ? (filters.status as SiteContentStatus) : undefined,
    languageCode: filters.languageCode || undefined,
    sortBy,
    sortOrder,
  });
  const { refetch } = siteContentQuery;

  // Delete mutation
  const deleteMutation = trpc.adminSiteContents.deleteSiteContent.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('siteContent.notifications.deletedTitle', 'Content deleted'),
        description: t('siteContent.notifications.deletedDescription', 'The page was removed successfully.'),
      });
      siteContentQuery.refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('siteContent.notifications.deleteErrorTitle', 'Delete failed'),
        description: error.message || t('siteContent.notifications.deleteErrorDescription', 'We could not delete this page.'),
      });
    },
  });

  // Update data when query results change
  useEffect(() => {
    if (siteContentQuery.data) {
      const response = siteContentQuery.data as any;
      const data = (response?.data?.items || []) as SiteContent[];
      const meta = response?.data || {};

      setSiteContents(data);
      setPagination({
        page: meta.page || 1,
        limit: meta.limit || 10,
        total: meta.total || data.length || 0,
        totalPages: meta.totalPages || 1,
      });
    }
  }, [siteContentQuery.data]);

  // Update loading and error states
  useEffect(() => {
    setIsLoading(siteContentQuery.isLoading);
    setError(siteContentQuery.error ? siteContentQuery.error.message : null);
  }, [siteContentQuery.isLoading, siteContentQuery.error]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, sortOrder, debouncedSearchValue, filters.category, filters.status, filters.languageCode]);

  const handleFilterChange = (filterType: SiteContentFilterKey, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      languageCode: '',
    });
    setSearchValue('');
  };

  const handleDelete = useCallback((id: string, title: string) => {
    const confirmed = window.confirm(
      t('siteContent.confirmations.delete', 'Delete "{{title}}"?', { title }),
    );
    if (!confirmed) return;

    deleteMutation.mutate({ id });
  }, [deleteMutation, t]);

  const handleSort = useCallback((descriptor: SortDescriptor<SiteContent>) => {
    setSortBy(descriptor.columnAccessor as SortOption);
    setSortOrder(descriptor.direction);
  }, []);

  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      const updated = new Set(prev);
      if (!visible) {
        updated.delete(columnId);
      } else {
        updated.add(columnId);
      }
      updateVisibleColumns(updated);
      return updated;
    });
  }, [updateVisibleColumns]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.languageCode) count++;
    return count;
  }, [filters]);

  const columns: Column<SiteContent>[] = useMemo(() => [
    {
      id: 'page',
      header: 'Page',
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {item.title || item.code}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            /{item.slug}
          </span>
        </div>
      ),
      hideable: false,
      width: '30%',
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      isSortable: false,
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {String(value).replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      isSortable: false,
      render: (value) => (
        <span
          className={
            value === SiteContentStatus.PUBLISHED
              ? 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800'
              : value === SiteContentStatus.DRAFT
                ? 'inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800'
                : 'inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700'
          }
        >
          {String(value).toLowerCase()}
        </span>
      ),
    },
    {
      id: 'language',
      header: 'Language',
      accessor: 'languageCode',
      isSortable: false,
      render: (value) => (value ? String(value).toUpperCase() : '—'),
    },
    {
      id: 'updatedAt',
      header: 'Last Updated',
      accessor: 'updatedAt',
      type: 'datetime',
      isSortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              label: 'Edit',
              icon: <FiEdit2 className="h-4 w-4" />,
              onClick: () => navigate(`/site-content/${item.id}/edit`),
            },
            {
              label: 'Delete',
              icon: <FiTrash2 className="h-4 w-4" />,
              className: 'text-red-600 dark:text-red-400',
              onClick: () => handleDelete(item.id, item.title),
              disabled: deleteMutation.isPending,
            },
          ]}
        />
      ),
      hideable: false,
      align: 'right',
    },
  ], [navigate, handleDelete, deleteMutation.isPending]);

  const publishedCount = siteContents.filter(item => item.status === SiteContentStatus.PUBLISHED).length;
  const draftCount = siteContents.filter(item => item.status === SiteContentStatus.DRAFT).length;
  const localeCount = Array.from(new Set(siteContents.map(item => item.languageCode).filter(Boolean))).length;

  const statisticsCards: StatisticData[] = useMemo(() => [
    {
      id: 'total-pages',
      title: t('siteContent.stats.totalPages', 'Total Pages'),
      value: pagination.total,
      icon: <FiFileText className="h-5 w-5" />,
      enableChart: false,
    },
    {
      id: 'published-pages',
      title: t('siteContent.stats.publishedPages', 'Published'),
      value: publishedCount,
      icon: <FiBookOpen className="h-5 w-5" />,
      enableChart: false,
    },
    {
      id: 'draft-pages',
      title: t('siteContent.stats.draftPages', 'Drafts'),
      value: draftCount,
      icon: <FiEdit2 className="h-5 w-5" />,
      enableChart: false,
    },
    {
      id: 'locales',
      title: t('siteContent.stats.locales', 'Locales'),
      value: localeCount,
      icon: <FiGlobe className="h-5 w-5" />,
      enableChart: false,
    },
  ], [draftCount, localeCount, pagination.total, publishedCount, t]);

  // Use refs to store stable references to functions
  const refetchRef = useRef(refetch);
  const navigateRef = useRef(navigate);

  // Update refs when functions change
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    refetchRef.current();
  }, []);

  const handleCreatePage = useCallback(() => {
    navigateRef.current('/site-content/create');
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  useEffect(() => {
    const actions: LayoutAction[] = [
      {
        label: showFilters ? t('actions.hideFilters', 'Hide Filters') : t('actions.showFilters', 'Show Filters'),
        onClick: toggleFilters,
        icon: <FiFilter />,
        active: showFilters,
      },
      {
        label: t('actions.refresh', 'Refresh'),
        onClick: handleRefresh,
        icon: <FiRefreshCw />,
      },
      {
        label: t('siteContent.actions.createPage', 'Create Page'),
        onClick: handleCreatePage,
        icon: <FiPlus />,
        primary: true,
      },
    ];

    onActionsChange?.(actions);
  }, [showFilters, t, toggleFilters, handleRefresh, handleCreatePage, onActionsChange]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading content</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <Button
            onClick={() => siteContentQuery.refetch()}
            variant="primary"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatisticsGrid
        statistics={statisticsCards}
        isLoading={isLoading && siteContents.length === 0}
        skeletonCount={4}
      />

      {showFilters && (
        <SiteContentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      )}

      <Table<SiteContent>
        tableId="site-content-table"
        data={siteContents}
        columns={columns}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t('siteContent.searchPlaceholder', 'Search pages by title, code, or slug...')}
        onFilterClick={() => setShowFilters((prev) => !prev)}
        isFilterActive={showFilters || activeFilterCount > 0}
        sortDescriptor={{ columnAccessor: sortBy, direction: sortOrder }}
        onSortChange={handleSort}
        pagination={{
          currentPage,
          totalPages: Math.max(pagination.totalPages, 1),
          totalItems: pagination.total,
          itemsPerPage: limit,
          onPageChange: (page) => setCurrentPage(page),
          onItemsPerPageChange: (newSize) => {
            setLimit(newSize);
            updatePageSize(newSize);
            setCurrentPage(1);
          },
        }}
        emptyMessage={t('siteContent.emptyState', 'No site content pages found.')}
        emptyAction={{
          label: t('siteContent.actions.createPage', 'Create Page'),
          onClick: () => navigate('/site-content/create'),
          icon: <FiPlus className="h-4 w-4" />,
        }}
        showColumnVisibility
        visibleColumns={visibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        enableRowHover
        density="normal"
        onRowClick={(item) => navigate(`/site-content/${item.id}/edit`)}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SiteContentContainer;
