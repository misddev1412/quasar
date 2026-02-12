import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiTag, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiExternalLink, FiShoppingBag, FiGlobe, FiTrendingUp, FiHome, FiPackage, FiUpload } from 'react-icons/fi';
import { Button, Dropdown, StatisticsGrid, Table, StandardListPage, Loading, Alert, AlertDescription, AlertTitle } from '@admin/components/common';
import type { StatisticData, Column, SortDescriptor } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useTableState } from '@admin/hooks/useTableState';
import { Brand } from '@admin/types/product';
import { CreateBrandModal, EditBrandModal, BrandImportModal } from '@admin/components/products';
import type { BrandStatsResponse, BrandsListResponse } from '@admin/types/product-taxonomy';

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
  const [searchParams] = useSearchParams();

  // Initial filters from URL
  const initialFilters = useMemo(() => ({
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
  }), [searchParams]);

  const brandTableState = useTableState<BrandFiltersType>({
    tableId: 'brands-table',
    defaultPreferences: {
      visibleColumns: ['brand', 'description', 'website', 'status', 'productsCount', 'createdAt', 'actions'],
    },
    initialFilters,
  });

  const {
    page,
    limit,
    searchValue,
    debouncedSearchValue,
    filters,
    showFilters,
    setShowFilters,
    sortBy,
    sortOrder,
    visibleColumns,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    handleColumnVisibilityChange,
    setSearchValue,
  } = brandTableState;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Selected brands for bulk actions
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string | number>>(new Set());

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

  const typedBrandsData = brandsData as BrandsListResponse | undefined;
  const brands = typedBrandsData?.data?.brands || typedBrandsData?.data?.items || [];
  const totalBrands = typedBrandsData?.data?.total || 0;
  const totalPages = Math.ceil(totalBrands / limit);

  useEffect(() => {
    if (isLoading || error) return;
    if (page <= 1) return;

    if (totalBrands === 0) {
      handlePageChange(1);
      return;
    }

    if (brands.length === 0) {
      const lastPage = Math.max(1, totalPages);
      if (page !== lastPage) {
        handlePageChange(lastPage);
      }
    }
  }, [brands.length, error, handlePageChange, isLoading, page, totalBrands, totalPages]);

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
    const apiStats = (statsData as BrandStatsResponse | undefined)?.data;
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

  const goToBrand = (brand: Brand) => handleEditBrand(brand);

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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : undefined;
      addToast({ type: 'error', title: 'Delete failed', description: errorMessage || 'Failed to delete brand' });
    }
  }, [deleteMutation, addToast, t]);

  const handleSortDescriptorChange = (sortDescriptor: SortDescriptor<Brand>) => {
    handleSortChange(String(sortDescriptor.columnAccessor), sortDescriptor.direction);
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

  const exportFiltersPayload = useMemo(() => {
    const payload: Record<string, unknown> = {};
    if (debouncedSearchValue) {
      payload.search = debouncedSearchValue;
    }
    if (filters.isActive !== undefined) {
      payload.isActive = filters.isActive;
    }
    return payload;
  }, [debouncedSearchValue, filters.isActive]);

  const handleOpenExportCenter = useCallback(() => {
    const payload = exportFiltersPayload;
    navigate('/products/brands/exports', {
      state: Object.keys(payload).length ? { filters: payload } : undefined,
    });
  }, [navigate, exportFiltersPayload]);

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
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Actions for ${brand.name}`}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => goToBrand(brand)
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
      label: t('brands.import.title', 'Import Brands'),
      onClick: () => setImportDialogOpen(true),
      icon: <FiUpload />,
    },
    {
      label: t('brands.create', 'Create Brand'),
      onClick: handleCreateBrand,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('brands.actions.export_brands', 'Export Brands'),
      onClick: handleOpenExportCenter,
      icon: <FiDownload />,
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
  ], [handleCreateBrand, handleRefresh, handleFilterToggle, showFilters, t, handleOpenExportCenter]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = statisticsData?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-brands',
        title: t('brands.total_brands', 'Total Brands'),
        value: stats.total?.toString() || '0',
        icon: <FiTag className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'active-brands',
        title: t('brands.active_brands', 'Active Brands'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: { value: 0, isPositive: true, label: '+0%' },
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
      <StandardListPage
        title={t('brands.title', 'Brand Management')}
        description={t('brands.description', 'Manage all brands in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </StandardListPage>
    );
  }

  if (error) {
    return (
      <StandardListPage
        title={t('brands.title', 'Brand Management')}
        description={t('brands.description', 'Manage all brands in the system')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </StandardListPage>
    );
  }

  return (
    <StandardListPage
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
          onSortChange={handleSortDescriptorChange}
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
          onRowClick={(brand) => goToBrand(brand)}
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

      <BrandImportModal
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImportSuccess={() => {
          setImportDialogOpen(false);
          refetchBrands();
          refetchStats();
        }}
      />
    </StandardListPage>
  );
};

export default BrandsPage;
