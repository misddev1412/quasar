import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiTag, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiExternalLink, FiShoppingBag, FiGlobe, FiTrendingUp, FiHome, FiPackage } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { Brand } from '../../types/product';
import { CreateBrandModal } from '../../components/products/CreateBrandModal';
import { EditBrandModal } from '../../components/products/EditBrandModal';

interface BrandFiltersType {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const BrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('brands-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['brand', 'description', 'website', 'status', 'productsCount', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<BrandFiltersType>({
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['brand', 'description', 'website', 'status', 'productsCount', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Selected brands for bulk actions
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string | number>>(new Set());

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams();

      // Add non-empty parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          newSearchParams.set(key, value);
        }
      });

      // Update URL without causing navigation
      setSearchParams(newSearchParams, { replace: true });
    }, 100);
  }, [setSearchParams]);

  // Debounce search value for API calls and URL updates
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1); // Reset to first page when search changes

      // Update URL with search parameter and all filters
      updateUrlParams({
        search: searchValue || undefined,
        isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
        page: searchValue ? '1' : String(page),
        limit: limit !== 10 ? String(limit) : undefined,
        sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
        sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
      });
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, filters, page, sortBy, sortOrder, updateUrlParams, limit]);

  // Build query parameters - match the API schema exactly
  const queryParams = {
    page,
    limit,
    search: debouncedSearchValue || undefined,
    isActive: filters.isActive,
  };

  const {
    data: brandsData,
    isLoading,
    error,
    refetch: refetchBrands,
    isFetching
  } = trpc.adminProductBrands.getAll.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const brands = (brandsData as any)?.data?.brands || (brandsData as any)?.data?.items || [];
  const totalBrands = (brandsData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalBrands / limit);

  // Fetch brand statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats
  } = trpc.adminProductBrands.getStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalBrands,
          active: apiStats.activeBrands,
          withWebsite: Math.floor(apiStats.totalBrands * 0.8), // Estimated
          totalProducts: apiStats.totalProducts,
          averageProductsPerBrand: apiStats.averageProductsPerBrand,
        }
      };
    }
    
    // Fallback calculation from current data
    if (!brands.length) return null;
    
    const total = brands.length;
    const active = brands.filter((b: Brand) => b.isActive).length;
    const withWebsite = brands.filter((b: Brand) => b.website).length;
    const totalProducts = brands.reduce((sum: number, b: Brand) => sum + (b.productCount || b.products?.length || 0), 0);
    
    return {
      data: {
        total,
        active,
        withWebsite,
        totalProducts,
        averageProductsPerBrand: Math.round(totalProducts / total),
      }
    };
  }, [brands, statsData]);
  
  const statisticsLoading = isLoading || statsLoading;
  const statisticsError = null;

  const deleteMutation = trpc.adminProductBrands.delete.useMutation({
    onSuccess: () => {
      addToast({ 
        title: t('brands.deleteSuccess', 'Brand deleted successfully'), 
        type: 'success' 
      });
      refetchBrands();
      refetchStats();
    },
    onError: (error) => {
      addToast({ 
        title: t('common.error', 'Error'), 
        description: error.message, 
        type: 'error' 
      });
    },
  });

  const handleCreateBrand = () => {
    setCreateDialogOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setEditDialogOpen(true);
  };

  const goToBrand = (id: string) => navigate(`/products/brands/${id}`);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('brands.deleteConfirm', 'Are you sure you want to delete this brand? This action cannot be undone.'))) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDeleteBrand = useCallback(async (brandId: string) => {
    try {
      const ok = window.confirm(t('brands.deleteConfirm', 'Are you sure you want to delete this brand? This action cannot be undone.'));
      if (!ok) return;
      deleteMutation.mutate({ id: brandId });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Delete failed', description: e?.message || 'Failed to delete brand' });
    }
  }, [deleteMutation, addToast, t]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updatePageSize(newLimit);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<Brand>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: newSortBy !== 'createdAt' ? newSortBy : undefined,
      sortOrder: newSortOrder !== 'desc' ? newSortOrder : undefined,
    });
  };

  // Handle column visibility
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

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'activate':
        addToast({ type: 'info', title: 'Feature coming soon', description: 'Bulk activate will be available soon' });
        break;
      case 'deactivate':
        addToast({ type: 'info', title: 'Feature coming soon', description: 'Bulk deactivate will be available soon' });
        break;
      case 'delete':
        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedBrandIds.size} brands? This action cannot be undone.`);
        if (confirmDelete) {
          addToast({ type: 'info', title: 'Feature coming soon', description: 'Bulk delete will be available soon' });
        }
        break;
      default:
        break;
    }
  }, [selectedBrandIds.size, addToast]);

  const handleRefresh = useCallback(() => {
    refetchBrands();
    refetchStats();
  }, [refetchBrands, refetchStats]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  // Enhanced column definitions
  const columns: Column<Brand>[] = useMemo(() => [
    {
      id: 'brand',
      header: t('brands.name', 'Brand'),
      accessor: (brand) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FiTag className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {brand.name}
            </div>
            {brand.website && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {brand.website.replace(/^https?:\/\//, '')}
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'description',
      header: t('brands.description', 'Description'),
      accessor: (brand) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {brand.description || t('common.no_description', 'No description')}
          </p>
        </div>
      ),
      hideable: true,
    },
    {
      id: 'website',
      header: t('brands.website', 'Website'),
      accessor: (brand) => (
        brand.website ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(brand.website, '_blank')}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiExternalLink className="w-4 h-4" />
          </Button>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
      hideable: true,
    },
    {
      id: 'status',
      header: t('brands.status', 'Status'),
      accessor: (brand) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            brand.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {brand.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'productsCount',
      header: t('brands.products_count', 'Products'),
      accessor: (brand) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {brand.products?.length || 0}
        </span>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('common.created_at', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (brand) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${brand.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => goToBrand(brand.id)
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleEditBrand(brand)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteBrand(brand.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleDeleteBrand, handleEditBrand, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<Brand> = useMemo(() => ({
    columnAccessor: sortBy as keyof Brand,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected brands
  const bulkActions = useMemo(() => [
    {
      label: 'Activate Selected',
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: 'Deactivate Selected', 
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: 'Delete Selected',
      value: 'delete',
      variant: 'danger' as const,
    },
  ], []);

  const actions = useMemo(() => [
    {
      label: t('brands.create', 'Create Brand'),
      onClick: handleCreateBrand,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('common.hide_filters', 'Hide Filters') : t('common.show_filters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
    },
  ], [handleCreateBrand, handleRefresh, handleFilterToggle, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-brands',
        title: t('brands.total_brands', 'Total Brands'),
        value: stats.total?.toString() || '0',
        icon: <FiTag className="w-5 h-5" />,
        trend: stats.totalTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'active-brands',
        title: t('brands.active_brands', 'Active Brands'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: stats.activeTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'brands-with-website',
        title: t('brands.with_website', 'With Website'),
        value: stats.withWebsite?.toString() || '0',
        icon: <FiGlobe className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'total-products',
        title: t('brands.total_products', 'Total Products'),
        value: stats.totalProducts?.toString() || '0',
        icon: <FiShoppingBag className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'average-products',
        title: t('brands.average_products', 'Avg Products/Brand'),
        value: stats.averageProductsPerBrand?.toString() || '0',
        icon: <FiTrendingUp className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [statisticsData, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: 'Products',
      href: '/products',
      icon: <FiPackage className="w-4 h-4" />
    },
    {
      label: t('brands.title', 'Brand Management'),
      icon: <FiTag className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('brands.title', 'Brand Management')}
        description={t('brands.description', 'Manage all brands in the system')}
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

  if (error) {
    return (
      <BaseLayout
        title={t('brands.title', 'Brand Management')}
        description={t('brands.description', 'Manage all brands in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('brands.title', 'Brand Management')}
      description={t('brands.description', 'Manage all brands in the system')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsLoading}
          skeletonCount={4}
        />

        {/* Enhanced Brands Table */}
        <Table<Brand>
          tableId="brands-table"
          columns={columns}
          data={brands}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('brands.search_placeholder', 'Search brands by name or description...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedBrandIds}
          onSelectionChange={setSelectedBrandIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalBrands,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(brand) => goToBrand(brand.id)}
          // Empty state
          emptyMessage={t('brands.no_brands_found', 'No brands found')}
          emptyAction={{
            label: t('brands.create', 'Create Brand'),
            onClick: handleCreateBrand,
            icon: <FiPlus />,
          }}
        />
      </div>

      {/* Create Brand Modal */}
      <CreateBrandModal
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetchBrands();
          refetchStats();
        }}
      />

      {/* Edit Brand Modal */}
      <EditBrandModal
        isOpen={editDialogOpen}
        brand={editingBrand}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingBrand(null);
        }}
        onSuccess={() => {
          setEditDialogOpen(false);
          setEditingBrand(null);
          refetchBrands();
          refetchStats();
        }}
      />
    </BaseLayout>
  );
};

export default BrandsPage;
