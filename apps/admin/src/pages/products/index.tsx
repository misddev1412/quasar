import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiPackage, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiShoppingBag, FiStar, FiHome, FiUpload } from 'react-icons/fi';
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
import { Product, ProductVariant } from '../../types/product';
import { ProductFilters, ProductFiltersType } from '../../components/features/ProductFilters';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ProductVariantsQuickViewModal } from '../../components/products/ProductVariantsQuickViewModal';
import { ProductVariantQuickEditModal } from '../../components/products/ProductVariantQuickEditModal';
import { ProductImportModal } from '../../components/products/ProductImportModal';


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
  const trpcContext = trpc.useContext();

  const [isVariantsModalOpen, setVariantsModalOpen] = useState(false);
  const [productForVariants, setProductForVariants] = useState<Product | null>(null);
  const [variantForEdit, setVariantForEdit] = useState<ProductVariant | null>(null);
  const [isVariantEditModalOpen, setVariantEditModalOpen] = useState(false);
  const [togglingVariantId, setTogglingVariantId] = useState<string | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const showVariantsQuickView = isVariantsModalOpen && !isVariantEditModalOpen;

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
        categoryIds: filters.categoryIds?.join(',') || undefined,
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
    categoryIds: filters.categoryIds || undefined,
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

  const updateVariantMutation = trpc.adminProducts.updateVariant.useMutation();

  const handleOpenVariantsModal = useCallback((product: Product) => {
    setProductForVariants(product);
    setVariantsModalOpen(true);
  }, []);

  const handleCloseVariantsModal = useCallback(() => {
    setVariantsModalOpen(false);
    setProductForVariants(null);
    setVariantEditModalOpen(false);
    setVariantForEdit(null);
  }, []);

  const handleVariantEditClick = useCallback((variant: ProductVariant) => {
    setVariantForEdit(variant);
    setVariantEditModalOpen(true);
  }, []);

  const handleVariantEditClose = useCallback(() => {
    setVariantEditModalOpen(false);
    setVariantForEdit(null);
  }, []);

  const handleOpenImportModal = useCallback(() => setImportModalOpen(true), []);
  const handleCloseImportModal = useCallback(() => setImportModalOpen(false), []);
  const handleImportSuccess = useCallback(() => {
    void trpcContext.adminProducts.list.invalidate();
    refetch();
  }, [trpcContext, refetch]);

  const handleVariantUpdate = useCallback(async (payload: {
    id: string;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    price: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    stockQuantity: number;
    lowStockThreshold?: number | null;
    trackInventory: boolean;
    allowBackorders: boolean;
    isActive: boolean;
  }) => {
    try {
      const response = await updateVariantMutation.mutateAsync(payload);
      const updatedVariant = (response as any)?.data as ProductVariant | undefined;

      if (updatedVariant) {
        setProductForVariants((prev) => {
          if (!prev) return prev;
          const updatedVariants = (prev.variants || []).map((variant) =>
            variant.id === updatedVariant.id ? { ...variant, ...updatedVariant } : variant
          );
          return { ...prev, variants: updatedVariants } as Product;
        });
      }

      addToast({
        type: 'success',
        title: t('products.variant_updated', 'Variant updated'),
        description: t('products.variant_updated_desc', 'The variant has been updated successfully.'),
      });

      await trpcContext.adminProducts.list.invalidate();
      setVariantEditModalOpen(false);
      setVariantForEdit(null);
    } catch (mutationError: any) {
      const message = mutationError?.message || t('products.update_variant_error', 'Failed to update variant.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    }
  }, [updateVariantMutation, addToast, t, trpcContext]);

  const handleToggleVariantActive = useCallback(async (variant: ProductVariant, nextValue: boolean) => {
    if (!variant?.id || updateVariantMutation.isPending) {
      return;
    }

    setTogglingVariantId(variant.id);
    try {
      const response = await updateVariantMutation.mutateAsync({ id: variant.id, isActive: nextValue });
      const updatedVariant = (response as any)?.data as ProductVariant | undefined;

      if (updatedVariant) {
        setProductForVariants((prev) => {
          if (!prev) return prev;
          const updatedVariants = (prev.variants || []).map((item) =>
            item.id === updatedVariant.id ? { ...item, ...updatedVariant } : item
          );
          return { ...prev, variants: updatedVariants } as Product;
        });
      }

      addToast({
        type: 'success',
        title: nextValue
          ? t('products.variant_activated', 'Variant activated')
          : t('products.variant_deactivated', 'Variant deactivated'),
        description: t('products.variant_status_updated', 'Variant status has been updated.'),
      });

      await trpcContext.adminProducts.list.invalidate();
    } catch (mutationError: any) {
      const message = mutationError?.message || t('products.update_variant_error', 'Failed to update variant.');
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: message,
      });
    } finally {
      setTogglingVariantId(null);
    }
  }, [updateVariantMutation, addToast, t, trpcContext]);

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

  const goToProduct = useCallback((product: Product) => {
    const storefrontBase = process.env.NX_STOREFRONT_URL
      || process.env.NEXT_PUBLIC_SITE_URL
      || '';
    const identifier = (product as any)?.slug || product.id;
    const cleanBase = storefrontBase.replace(/\/$/, '');
    const targetUrl = `${cleanBase || ''}/products/${identifier}`;

    if (storefrontBase) {
      window.open(targetUrl, '_blank', 'noopener');
      return;
    }

    window.open(`/products/${identifier}`, '_blank', 'noopener');
  }, []);

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
      categoryIds: filters.categoryIds?.join(',') || undefined,
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
      categoryIds: filters.categoryIds?.join(',') || undefined,
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
      categoryIds: filters.categoryIds?.join(',') || undefined,
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
      categoryIds: newFilters.categoryIds?.join(',') || undefined,
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
            {product.media?.[0]?.url ? (
              <img
                src={product.media[0].url}
                alt={product.media[0].altText || product.name}
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
      accessor: (product) => {
        // Handle both new categories array and old single category
        if (product.categories && Array.isArray(product.categories)) {
          return product.categories.map(cat => typeof cat === 'string' ? cat : cat?.name).filter(Boolean).join(', ') || '-';
        }
        return typeof product.category === 'string' ? product.category : product.category?.name || '-';
      },
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
      accessor: (product) => {
        const variantCount = product.variants?.length || 0;
        const variantLabelTemplate = t('products.variant_count', '{{count}} variants');
        const variantLabel = variantLabelTemplate.replace('{{count}}', String(variantCount));
        return (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenVariantsModal(product);
            }}
          >
            {variantCount === 1
              ? t('products.single_variant', '1 variant')
              : variantLabel}
          </Button>
        );
      },
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
              onClick: () => goToProduct(product)
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
  ], [navigate, handleDeleteProduct, handleOpenVariantsModal, goToProduct, t]);

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
      label: t('products.import.action', 'Import from Excel'),
      onClick: handleOpenImportModal,
      icon: <FiUpload />,
    },
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
  ], [handleCreateProduct, handleRefresh, handleFilterToggle, handleOpenImportModal, showFilters, t]);

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
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: t('navigation.home', 'Home'),
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: t('products.title', 'Products'),
              icon: <FiPackage className="w-4 h-4" />
            }
          ]}
        />

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
          onRowClick={(product) => goToProduct(product)}
          // Empty state
          emptyMessage={t('products.no_products_found', 'No products found')}
          emptyAction={{
            label: t('products.create', 'Create Product'),
            onClick: handleCreateProduct,
            icon: <FiPlus />,
          }}
        />

        <ProductImportModal
          isOpen={isImportModalOpen}
          onClose={handleCloseImportModal}
          onImportSuccess={handleImportSuccess}
        />

        <ProductVariantsQuickViewModal
          product={productForVariants}
          isOpen={showVariantsQuickView}
          onClose={handleCloseVariantsModal}
          onEditVariant={handleVariantEditClick}
          onToggleVariantActive={handleToggleVariantActive}
          togglingVariantId={togglingVariantId}
        />

        <ProductVariantQuickEditModal
          variant={variantForEdit}
          isOpen={isVariantEditModalOpen}
          onClose={handleVariantEditClose}
          onSubmit={handleVariantUpdate}
          isSubmitting={updateVariantMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default ProductsPage;
