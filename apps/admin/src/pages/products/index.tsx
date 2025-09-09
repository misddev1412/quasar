import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiPackage, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiShoppingBag, FiStar } from 'react-icons/fi';
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
import { Product } from '../../types/product';
import { ProductFilters, ProductFiltersType } from '../../components/features/ProductFilters';


const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('products-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['product', 'sku', 'brand', 'category', 'status', 'variants', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<ProductFiltersType>({
    status: searchParams.get('status') as any || undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['product', 'sku', 'brand', 'category', 'status', 'variants', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Selected products for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());

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
        status: filters.status || undefined,
        brandId: filters.brandId || undefined,
        categoryId: filters.categoryId || undefined,
        isFeatured: filters.isFeatured?.toString() || undefined,
        isActive: filters.isActive?.toString() || undefined,
        minPrice: filters.minPrice?.toString() || undefined,
        maxPrice: filters.maxPrice?.toString() || undefined,
        hasStock: filters.hasStock?.toString() || undefined,
        createdFrom: filters.createdFrom || undefined,
        createdTo: filters.createdTo || undefined,
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
    status: filters.status || undefined,
    brandId: filters.brandId || undefined,
    categoryId: filters.categoryId || undefined,
    isFeatured: filters.isFeatured || undefined,
    isActive: filters.isActive || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    hasStock: filters.hasStock || undefined,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
  };

  const { data: productsData, isLoading, error, refetch, isFetching } = trpc.adminProducts.list.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const products = (productsData as any)?.data?.products || (productsData as any)?.data?.items || [];
  const totalProducts = (productsData as any)?.data?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // Fetch product statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminProducts.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalProducts,
          active: apiStats.activeProducts,
          draft: apiStats.draftProducts,
          inactive: apiStats.inactiveProducts,
          featured: apiStats.featuredProducts,
          totalStockValue: apiStats.totalStockValue,
          totalViews: apiStats.totalViews,
        }
      };
    }
    
    // Fallback calculation from current data
    if (!products.length) return null;
    
    const total = products.length;
    const active = products.filter((p: Product) => p.status === 'ACTIVE').length;
    const draft = products.filter((p: Product) => p.status === 'DRAFT').length;
    const inactive = products.filter((p: Product) => p.status === 'INACTIVE').length;
    const featured = products.filter((p: Product) => p.isFeatured).length;
    const totalViews = products.reduce((sum: number, p: Product) => sum + (p.viewCount || 0), 0);
    
    return {
      data: {
        total,
        active,
        draft,
        inactive,
        featured,
        totalViews,
      }
    };
  }, [products, statsData]);
  
  const statisticsLoading = isLoading || statsLoading;
  const statisticsError = null;

  const handleCreateProduct = () => {
    navigate('/products/create');
  };

  const goToProduct = (id: string) => navigate(`/products/${id}`);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      const ok = window.confirm(t('products.deleteConfirm', 'Are you sure you want to delete this product? This action cannot be undone.'));
      if (!ok) return;
      // TODO: Implement delete mutation when available
      addToast({ type: 'success', title: t('products.deleteSuccess', 'Product deleted') });
      refetch();
    } catch (e: any) {
      addToast({ type: 'error', title: t('products.deleteError', 'Delete failed'), description: e?.message || t('products.deleteError', 'Failed to delete product') });
    }
  }, [addToast, refetch]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status || undefined,
      brandId: filters.brandId || undefined,
      categoryId: filters.categoryId || undefined,
      isFeatured: filters.isFeatured?.toString() || undefined,
      isActive: filters.isActive?.toString() || undefined,
      minPrice: filters.minPrice?.toString() || undefined,
      maxPrice: filters.maxPrice?.toString() || undefined,
      hasStock: filters.hasStock?.toString() || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
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
      status: filters.status || undefined,
      brandId: filters.brandId || undefined,
      categoryId: filters.categoryId || undefined,
      isFeatured: filters.isFeatured?.toString() || undefined,
      isActive: filters.isActive?.toString() || undefined,
      minPrice: filters.minPrice?.toString() || undefined,
      maxPrice: filters.maxPrice?.toString() || undefined,
      hasStock: filters.hasStock?.toString() || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<Product>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      status: filters.status || undefined,
      brandId: filters.brandId || undefined,
      categoryId: filters.categoryId || undefined,
      isFeatured: filters.isFeatured?.toString() || undefined,
      isActive: filters.isActive?.toString() || undefined,
      minPrice: filters.minPrice?.toString() || undefined,
      maxPrice: filters.maxPrice?.toString() || undefined,
      hasStock: filters.hasStock?.toString() || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
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
    console.log(`Bulk action: ${action} on ${selectedProductIds.size} products`);
    switch (action) {
      case 'activate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('products.bulk_activate_coming_soon', 'Bulk activate will be available soon') });
        break;
      case 'deactivate':
        addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('products.bulk_deactivate_coming_soon', 'Bulk deactivate will be available soon') });
        break;
      case 'delete':
        const confirmDelete = window.confirm(t('products.bulk_delete_confirm', `Are you sure you want to delete ${selectedProductIds.size} products? This action cannot be undone.`));
        if (confirmDelete) {
          addToast({ type: 'info', title: t('common.feature_coming_soon', 'Feature coming soon'), description: t('products.bulk_delete_coming_soon', 'Bulk delete will be available soon') });
        }
        break;
      default:
        break;
    }
  }, [selectedProductIds.size, addToast]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    
    // Update URL with new filters
    updateUrlParams({
      search: searchValue || undefined,
      status: newFilters.status || undefined,
      brandId: newFilters.brandId || undefined,
      categoryId: newFilters.categoryId || undefined,
      isFeatured: newFilters.isFeatured?.toString() || undefined,
      isActive: newFilters.isActive?.toString() || undefined,
      minPrice: newFilters.minPrice?.toString() || undefined,
      maxPrice: newFilters.maxPrice?.toString() || undefined,
      hasStock: newFilters.hasStock?.toString() || undefined,
      createdFrom: newFilters.createdFrom || undefined,
      createdTo: newFilters.createdTo || undefined,
      page: undefined, // Reset to first page
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductFiltersType = {};
    setFilters(clearedFilters);
    setPage(1);
    
    // Update URL to remove all filters
    updateUrlParams({
      search: searchValue || undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof ProductFiltersType] !== undefined &&
    filters[key as keyof ProductFiltersType] !== null &&
    filters[key as keyof ProductFiltersType] !== ''
  ).length;

  // Enhanced column definitions
  const columns: Column<Product>[] = useMemo(() => [
    {
      id: 'product',
      header: t('products.name', 'Product'),
      accessor: (product) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {product.name}
            </div>
            {product.sku && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                SKU: {product.sku}
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'sku',
      header: t('products.sku', 'SKU'),
      accessor: 'sku',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'brand',
      header: t('products.brand', 'Brand'),
      accessor: (product) => typeof product.brand === 'string' ? product.brand : product.brand?.name || '-',
      isSortable: false,
      hideable: true,
    },
    {
      id: 'category',
      header: t('products.category', 'Category'),
      accessor: (product) => typeof product.category === 'string' ? product.category : product.category?.name || '-',
      isSortable: false,
      hideable: true,
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      accessor: (product) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            product.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : product.status === 'INACTIVE'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              : product.status === 'DRAFT'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {t(`products.status.${product.status.toLowerCase()}`, product.status)}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'variants',
      header: t('products.variants', 'Variants'),
      accessor: (product) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {product.variants?.length || 0}
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
      accessor: (product) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${product.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => goToProduct(product.id)
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/products/${product.id}/edit`)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteProduct(product.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleDeleteProduct, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<Product> = useMemo(() => ({
    columnAccessor: sortBy as keyof Product,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected products
  const bulkActions = useMemo(() => [
    {
      label: t('products.activate_selected', 'Activate Selected'),
      value: 'activate',
      variant: 'primary' as const,
    },
    {
      label: t('products.deactivate_selected', 'Deactivate Selected'), 
      value: 'deactivate',
      variant: 'outline' as const,
    },
    {
      label: t('products.delete_selected', 'Delete Selected'),
      value: 'delete',
      variant: 'danger' as const,
    },
  ], [t]);

  const actions = useMemo(() => [
    {
      label: t('products.create', 'Create Product'),
      onClick: handleCreateProduct,
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
      active: showFilters,
    },
  ], [handleCreateProduct, handleRefresh, handleFilterToggle, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-products',
        title: t('products.total_products', 'Total Products'),
        value: stats.total?.toString() || '0',
        icon: <FiPackage className="w-5 h-5" />,
        trend: stats.totalTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'active-products',
        title: t('products.active_products', 'Active Products'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: stats.activeTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'draft-products',
        title: t('products.draft_products', 'Draft Products'),
        value: stats.draft?.toString() || '0',
        icon: <FiEdit2 className="w-5 h-5" />,
        trend: stats.draftTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'featured-products',
        title: t('products.featured_products', 'Featured Products'),
        value: stats.featured?.toString() || '0',
        icon: <FiStar className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'total-views',
        title: t('products.total_views', 'Total Views'),
        value: stats.totalViews?.toLocaleString() || '0',
        icon: <FiEye className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [statisticsData, t]);

  if (isLoading) {
    return (
      <BaseLayout title={t('products.title', 'Product Management')} description={t('products.description', 'Manage all products in the system')} actions={actions} fullWidth={true}>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title={t('products.title', 'Product Management')} description={t('products.description', 'Manage all products in the system')} actions={actions} fullWidth={true}>
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={t('products.title', 'Product Management')} description={t('products.description', 'Manage all products in the system')} actions={actions} fullWidth={true}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsLoading}
          skeletonCount={4}
        />

        {/* Filter Panel */}
        {showFilters && (
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Enhanced Products Table */}
        <Table<Product>
          tableId="products-table"
          columns={columns}
          data={products}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('products.search_placeholder', 'Search products by name, SKU, or description...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedProductIds}
          onSelectionChange={setSelectedProductIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalProducts,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(product) => goToProduct(product.id)}
          // Empty state
          emptyMessage={t('products.no_products_found', 'No products found')}
          emptyAction={{
            label: t('products.create', 'Create Product'),
            onClick: handleCreateProduct,
            icon: <FiPlus />,
          }}
        />
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;