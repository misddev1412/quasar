import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiFileText, FiEye, FiEdit2, FiTrash2, FiFilter, FiRefreshCw, FiStar, FiCalendar, FiTag, FiFolder } from 'react-icons/fi';
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
import { PostFilters } from '../../components/features/PostFilters';
import { Post, PostStatus, PostType, PostFiltersType } from '../../types/post';
import { FiHome } from 'react-icons/fi';

// Helper functions for URL parameter validation
const validatePostStatus = (status: string | null): PostStatus | undefined => {
  if (!status) return undefined;
  return Object.values(PostStatus).includes(status as PostStatus) ? (status as PostStatus) : undefined;
};

const validatePostType = (type: string | null): PostType | undefined => {
  if (!type) return undefined;
  return Object.values(PostType).includes(type as PostType) ? (type as PostType) : undefined;
};

const validateBoolean = (value: string | null): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const validatePage = (page: string | null): number => {
  const pageNum = page ? parseInt(page, 10) : 1;
  return pageNum > 0 ? pageNum : 1;
};

const validateDateString = (date: string | null): string | undefined => {
  if (!date) return undefined;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) ? date : undefined;
};

const validateString = (value: string | null): string | undefined => {
  return value && value.trim() ? value.trim() : undefined;
};

const PostListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('posts-table', {
    pageSize: (() => {
      const limitParam = searchParams.get('limit');
      const parsedLimit = limitParam ? parseInt(limitParam, 10) : 10;
      return [10, 25, 50, 100].includes(parsedLimit) ? parsedLimit : 10;
    })(),
    visibleColumns: new Set(['post', 'status', 'type', 'author', 'publishedAt', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => validatePage(searchParams.get('page')));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<PostFiltersType>(() => ({
    status: validatePostStatus(searchParams.get('status')),
    type: validatePostType(searchParams.get('type')),
    isFeatured: validateBoolean(searchParams.get('isFeatured')),
    dateFrom: validateDateString(searchParams.get('dateFrom')),
    dateTo: validateDateString(searchParams.get('dateTo')),
    publishedFrom: validateDateString(searchParams.get('publishedFrom')),
    publishedTo: validateDateString(searchParams.get('publishedTo')),
    title: validateString(searchParams.get('title')),
    authorId: validateString(searchParams.get('authorId')),
    categoryId: validateString(searchParams.get('categoryId')),
    tagId: validateString(searchParams.get('tagId')),
    locale: validateString(searchParams.get('locale')),
  }));

  // Initialize showFilters based on whether there are active filters from URL
  const [showFilters, setShowFilters] = useState(() => {
    const hasFilters = Object.values(filters).some(value => value !== undefined && value !== null && value !== '');
    return hasFilters;
  });

  // Sorting state
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(() => (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Update URL parameters helper
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        newSearchParams.set(key, value);
      }
    });

    setSearchParams(newSearchParams);
  }, [setSearchParams]);

  // Sync limit with preferences
  useEffect(() => {
    if (limit !== preferences.pageSize) {
      setLimit(preferences.pageSize);
    }
  }, [preferences.pageSize, limit]);

  // Fetch posts data
  const postsQuery = trpc.adminPosts.getPosts.useQuery({
    page,
    limit,
    search: debouncedSearchValue || undefined,
    status: filters.status,
    type: filters.type,
    isFeatured: filters.isFeatured,
    authorId: filters.authorId,
    categoryId: filters.categoryId,
    tagId: filters.tagId,
    locale: filters.locale,
  });

  const deletePostMutation = trpc.adminPosts.deletePost.useMutation({
    onSuccess: () => {
      addToast({ title: 'Post deleted successfully', type: 'success' });
      postsQuery.refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || 'Failed to delete post', type: 'error' });
    }
  });

  const posts = (postsQuery.data as any)?.data?.items || [];
  const totalPosts = (postsQuery.data as any)?.data?.total || 0;
  const totalPages = (postsQuery.data as any)?.data?.totalPages || 0;

  // Statistics cards
  const statisticsCards: StatisticData[] = useMemo(() => [
    {
      id: 'total-posts',
      title: 'Total Posts',
      value: totalPosts,
      icon: <FiFileText className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'published-posts',
      title: 'Published Posts',
      value: posts.filter(p => p.status === PostStatus.PUBLISHED).length,
      icon: <FiEye className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'draft-posts',
      title: 'Draft Posts',
      value: posts.filter(p => p.status === PostStatus.DRAFT).length,
      icon: <FiEdit2 className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'featured-posts',
      title: 'Featured Posts',
      value: posts.filter(p => p.isFeatured).length,
      icon: <FiStar className="w-5 h-5" />,
      enableChart: false,
    },
  ], [posts, totalPosts]);

  // Table columns
  const columns: Column<Post>[] = useMemo(() => [
    {
      id: 'post',
      header: 'Post',
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {item.translations?.[0]?.title || 'Untitled'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {item.translations?.[0]?.excerpt || 'No excerpt'}
          </span>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === PostStatus.PUBLISHED
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : item.status === PostStatus.DRAFT
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : item.status === PostStatus.ARCHIVED
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
          {item.status}
        </span>
      ),
      isSortable: true,
      sortKey: 'status',
      hideable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (item) => (
        <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
          {item.type}
        </span>
      ),
      isSortable: true,
      sortKey: 'type',
      hideable: true,
    },
    {
      id: 'author',
      header: 'Author',
      accessor: (item) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {item.author?.username || 'Unknown'}
        </span>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'viewCount',
      header: 'Views',
      accessor: (item) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {item.viewCount.toLocaleString()}
        </span>
      ),
      isSortable: true,
      sortKey: 'viewCount',
      hideable: true,
    },
    {
      id: 'publishedAt',
      header: 'Published',
      accessor: 'publishedAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '80px',
      hideable: false,
      isSortable: false,
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: 'View',
              icon: <FiEye className="w-4 h-4" />,
              onClick: () => navigate(`/posts/${item.id}`),
            },
            {
              label: 'Edit',
              icon: <FiEdit2 className="w-4 h-4" />,
              onClick: () => navigate(`/posts/${item.id}`),
            },
            {
              label: '-',
              onClick: () => { },
              disabled: true,
            },
            {
              label: 'Delete',
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleDeletePost(item.id),
              className: 'text-red-600 dark:text-red-400',
            },
          ]}
        />
      ),
    },
  ], [navigate]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePostMutation.mutateAsync({ id: postId });
    } catch (error) {
      // Error handling is done in onError callback
      console.error('Failed to delete user', error);
    }
  };

  const handleSort = (descriptor: SortDescriptor<Post>) => {
    setSortBy(descriptor.columnAccessor as string);
    setSortOrder(descriptor.direction);

    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status,
      type: filters.type,
      isFeatured: filters.isFeatured !== undefined ? String(filters.isFeatured) : undefined,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      publishedFrom: filters.publishedFrom,
      publishedTo: filters.publishedTo,
      title: filters.title,
      page: page > 1 ? String(page) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: descriptor.columnAccessor !== 'createdAt' ? descriptor.columnAccessor as string : undefined,
      sortOrder: descriptor.direction !== 'desc' ? descriptor.direction : undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
    setPage(1);

    updateUrlParams({
      search: undefined,
      status: undefined,
      type: undefined,
      isFeatured: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      publishedFrom: undefined,
      publishedTo: undefined,
      title: undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status,
      type: filters.type,
      isFeatured: filters.isFeatured !== undefined ? String(filters.isFeatured) : undefined,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      publishedFrom: filters.publishedFrom,
      publishedTo: filters.publishedTo,
      title: filters.title,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleFiltersChange = (newFilters: PostFiltersType) => {
    setFilters(newFilters);
    setPage(1);

    updateUrlParams({
      search: searchValue || undefined,
      status: newFilters.status,
      type: newFilters.type,
      isFeatured: newFilters.isFeatured !== undefined ? String(newFilters.isFeatured) : undefined,
      dateFrom: newFilters.dateFrom,
      dateTo: newFilters.dateTo,
      publishedFrom: newFilters.publishedFrom,
      publishedTo: newFilters.publishedTo,
      title: newFilters.title,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleRefresh = () => {
    postsQuery.refetch();
    addToast({ title: 'Posts refreshed', type: 'success' });
  };

  // Actions for BaseLayout - matching users page pattern
  const actions = useMemo(() => [
    {
      label: 'Create Post',
      onClick: () => navigate('/posts/create'),
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: 'Refresh',
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? 'Hide Filters' : 'Show Filters',
      onClick: () => setShowFilters(!showFilters),
      icon: <FiFilter />,
    },
  ], [navigate, handleRefresh, showFilters]);

  const breadcrumbs = useMemo(() => ([
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('posts.title', 'Posts'),
      icon: <FiFileText className="w-4 h-4" />,
    },
  ]), [t]);

  // Column visibility state - matching users page
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['post', 'status', 'type', 'author', 'publishedAt', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(columnId);
      } else {
        newSet.delete(columnId);
      }
      updateVisibleColumns(newSet);
      return newSet;
    });
  };

  // Count active filters for display
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length,
    [filters]
  );

  if (postsQuery.isLoading) {
    return (
      <BaseLayout
        title="Post Management"
        description="Manage all posts in the system"
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (postsQuery.error) {
    return (
      <BaseLayout
        title="Post Management"
        description="Manage all posts in the system"
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{postsQuery.error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Post Management"
      description="Manage all posts in the system"
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={postsQuery.isLoading}
          skeletonCount={4}
        />

        {/* Filter Panel */}
        {showFilters && (
          <PostFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Posts Table */}
        <Table<Post>
          tableId="posts-table"
          columns={columns}
          data={posts}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder="Search posts by title, content, or slug..."
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Sorting
          sortDescriptor={{
            columnAccessor: sortBy as keyof Post,
            direction: sortOrder,
          }}
          onSortChange={handleSort}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalPosts,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: (newSize) => {
              updatePageSize(newSize);
              setLimit(newSize);
              setPage(1);
            },
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(post) => navigate(`/posts/${post.id}`)}
          // Empty state
          emptyMessage={t('posts.no_posts_found', 'No posts found')}
          emptyAction={{
            label: t('posts.create_post', 'Create Post'),
            onClick: () => navigate('/posts/create'),
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default PostListPage;
