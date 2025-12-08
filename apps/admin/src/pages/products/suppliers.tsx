import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiUser, FiActivity, FiEdit2, FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiEye, FiExternalLink, FiShoppingBag, FiGlobe, FiTrendingUp, FiMail, FiPhone, FiHome, FiPackage } from 'react-icons/fi';
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
import { Supplier } from '../../types/product';

// Define response types based on backend schema
interface ApiResponse<T = unknown> {
  code: number;
  status: string;
  data?: T;
  errors?: Array<{
    '@type': string;
    reason: string;
    domain: string;
    metadata?: Record<string, string>;
  }>;
  timestamp: string;
}

interface PaginatedResponse<T = unknown> {
  code: number;
  status: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  errors?: Array<{
    '@type': string;
    reason: string;
    domain: string;
    metadata?: Record<string, string>;
  }>;
  timestamp: string;
}

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalProducts: number;
  averageProductsPerSupplier: number;
  totalCountries: number;
  recentSuppliers: Array<{
    id: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    contactPerson?: string;
    isActive: boolean;
    sortOrder: number;
    productCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
import { CreateSupplierModal } from '../../components/products/CreateSupplierModal';
import { EditSupplierModal } from '../../components/products/EditSupplierModal';

interface SupplierFiltersType {
  search?: string;
  isActive?: boolean;
  country?: string;
  page?: number;
  limit?: number;
}

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('suppliers-table', {
    pageSize: parseInt(searchParams.get('limit') || '10'),
    visibleColumns: new Set(['supplier', 'contact', 'location', 'status', 'productsCount', 'createdAt']),
  });

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState<SupplierFiltersType>({
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    country: searchParams.get('country') || undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['supplier', 'contact', 'location', 'status', 'productsCount', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  // Selected suppliers for bulk actions
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string | number>>(new Set());

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const utils = trpc.useContext();

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
        country: filters.country || undefined,
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
    country: filters.country || undefined,
  };

  const { data: suppliersData, isLoading, error, refetch, isFetching } = trpc.adminProductSuppliers.getAll.useQuery(queryParams, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const suppliersResponse = suppliersData as PaginatedResponse<Supplier>;
  const suppliers = suppliersResponse?.data?.items || [];
  const totalSuppliers = suppliersResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalSuppliers / limit);

  // Fetch supplier statistics
  const { data: statsData, isLoading: statsLoading } = trpc.adminProductSuppliers.getStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Use API statistics data or calculate from existing data as fallback
  const statisticsData = useMemo(() => {
    const statsResponse = statsData as ApiResponse<SupplierStats>;
    const apiStats = statsResponse?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalSuppliers,
          active: apiStats.activeSuppliers,
          inactive: apiStats.inactiveSuppliers,
          totalProducts: apiStats.totalProducts,
          averageProductsPerSupplier: apiStats.averageProductsPerSupplier,
          totalCountries: apiStats.totalCountries,
        }
      };
    }

    // Fallback calculation from current data
    if (!suppliers.length) return null;

    const total = suppliers.length;
    const active = suppliers.filter((s: Supplier) => s.isActive).length;
    const inactive = total - active;
    const totalProducts = suppliers.reduce((sum: number, s: Supplier) => sum + (s.productCount || s.products?.length || 0), 0);
    const countries = [...new Set(suppliers.map((s: Supplier) => s.country).filter(Boolean))];

    return {
      data: {
        total,
        active,
        inactive,
        totalProducts,
        averageProductsPerSupplier: Math.round(totalProducts / total),
        totalCountries: countries.length,
      }
    };
  }, [suppliers, statsData]);

  const statisticsLoading = isLoading || statsLoading;
  const statisticsError = null;

  const deleteMutation = trpc.adminProductSuppliers.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: t('suppliers.deleteSuccess', 'Supplier deleted successfully'),
        type: 'success'
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message,
        type: 'error'
      });
    },
  });

  const handleCreateSupplier = () => {
    setCreateDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditDialogOpen(true);
  };

  const goToSupplier = (id: string) => navigate(`/products/suppliers/${id}`);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('suppliers.deleteConfirm', 'Are you sure you want to delete this supplier? This action cannot be undone.'))) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDeleteSupplier = useCallback(async (supplierId: string) => {
    try {
      const ok = window.confirm(t('suppliers.deleteConfirm', 'Are you sure you want to delete this supplier? This action cannot be undone.'));
      if (!ok) return;
      deleteMutation.mutate({ id: supplierId });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Delete failed', description: e?.message || 'Failed to delete supplier' });
    }
  }, [deleteMutation, addToast, t]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      country: filters.country || undefined,
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
      country: filters.country || undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
      sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
    });
  };

  // Handle sorting
  const handleSortChange = (sortDescriptor: SortDescriptor<Supplier>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const newSortOrder = sortDescriptor.direction;
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      isActive: filters.isActive !== undefined ? String(filters.isActive) : undefined,
      country: filters.country || undefined,
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
    console.log(`Bulk action: ${action} on ${selectedSupplierIds.size} suppliers`);
    switch (action) {
      case 'activate':
        addToast({ type: 'info', title: 'Feature coming soon', description: 'Bulk activate will be available soon' });
        break;
      case 'deactivate':
        addToast({ type: 'info', title: 'Feature coming soon', description: 'Bulk deactivate will be available soon' });
        break;
      case 'delete':
        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedSupplierIds.size} suppliers? This action cannot be undone.`);
        if (confirmDelete) {
          addToast({ type: 'info', title: 'Feature coming soon', description: 'Bulk delete will be available soon' });
        }
        break;
      default:
        break;
    }
  }, [selectedSupplierIds.size, addToast]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  // Enhanced column definitions
  const columns: Column<Supplier>[] = useMemo(() => [
    {
      id: 'supplier',
      header: t('suppliers.name', 'Supplier'),
      accessor: (supplier) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {supplier.logo ? (
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FiUser className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {supplier.name}
            </div>
            {supplier.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {supplier.description}
              </div>
            )}
          </div>
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'contact',
      header: t('suppliers.contact_person', 'Contact'),
      accessor: (supplier) => (
        <div>
          {supplier.contactPerson && (
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {supplier.contactPerson}
            </div>
          )}
          <div className="space-y-1">
            {supplier.email && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FiMail className="w-3 h-3 mr-1" />
                {supplier.email}
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FiPhone className="w-3 h-3 mr-1" />
                {supplier.phone}
              </div>
            )}
          </div>
        </div>
      ),
      hideable: true,
    },
    {
      id: 'location',
      header: t('suppliers.country', 'Location'),
      accessor: (supplier) => (
        <div className="text-sm">
          {supplier.city && supplier.country ? (
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{supplier.city}</div>
              <div className="text-gray-500 dark:text-gray-400">{supplier.country}</div>
            </div>
          ) : supplier.country ? (
            <div className="text-gray-900 dark:text-gray-100">{supplier.country}</div>
          ) : supplier.city ? (
            <div className="text-gray-900 dark:text-gray-100">{supplier.city}</div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
      hideable: true,
    },
    {
      id: 'website',
      header: t('suppliers.website', 'Website'),
      accessor: (supplier) => (
        supplier.website ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(supplier.website, '_blank')}
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
      header: t('suppliers.status', 'Status'),
      accessor: (supplier) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            supplier.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {supplier.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'productsCount',
      header: t('suppliers.products_count', 'Products'),
      accessor: (supplier) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {supplier.products?.length || supplier.productCount || 0}
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
      accessor: (supplier) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${supplier.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => goToSupplier(supplier.id)
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleEditSupplier(supplier)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDeleteSupplier(supplier.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleDeleteSupplier, handleEditSupplier, t]);

  // Current sort descriptor for the table
  const sortDescriptor: SortDescriptor<Supplier> = useMemo(() => ({
    columnAccessor: sortBy as keyof Supplier,
    direction: sortOrder,
  }), [sortBy, sortOrder]);

  // Bulk actions for selected suppliers
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
      label: t('suppliers.create', 'Create Supplier'),
      onClick: handleCreateSupplier,
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
  ], [handleCreateSupplier, handleRefresh, handleFilterToggle, showFilters, t]);

  // Prepare statistics data
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-suppliers',
        title: t('suppliers.total_suppliers', 'Total Suppliers'),
        value: stats.total?.toString() || '0',
        icon: <FiUser className="w-5 h-5" />,
        trend: stats.totalTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'active-suppliers',
        title: t('suppliers.active_suppliers', 'Active Suppliers'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        trend: stats.activeTrend || { value: 0, isPositive: true, label: '+0%' },
        enableChart: true,
      },
      {
        id: 'total-countries',
        title: t('suppliers.total_countries', 'Countries'),
        value: stats.totalCountries?.toString() || '0',
        icon: <FiGlobe className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'total-products',
        title: t('suppliers.total_products', 'Total Products'),
        value: stats.totalProducts?.toString() || '0',
        icon: <FiShoppingBag className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'average-products',
        title: t('suppliers.average_products', 'Avg Products/Supplier'),
        value: stats.averageProductsPerSupplier?.toString() || '0',
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
      label: t('suppliers.title', 'Supplier Management'),
      icon: <FiUser className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('suppliers.title', 'Supplier Management')}
        description={t('suppliers.description', 'Manage all suppliers in the system')}
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
        title={t('suppliers.title', 'Supplier Management')}
        description={t('suppliers.description', 'Manage all suppliers in the system')}
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
      title={t('suppliers.title', 'Supplier Management')}
      description={t('suppliers.description', 'Manage all suppliers in the system')}
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

        {/* Enhanced Suppliers Table */}
        <Table<Supplier>
          tableId="suppliers-table"
          columns={columns}
          data={suppliers}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder={t('suppliers.search_placeholder', 'Search suppliers...')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedSupplierIds}
          onSelectionChange={setSelectedSupplierIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalSuppliers,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(supplier) => goToSupplier(supplier.id)}
          // Empty state
          emptyMessage={t('suppliers.no_suppliers_found', 'No suppliers found')}
          emptyAction={{
            label: t('suppliers.create', 'Create Supplier'),
            onClick: handleCreateSupplier,
            icon: <FiPlus />,
          }}
        />
      </div>

      {/* Create Supplier Modal */}
      <CreateSupplierModal
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetch();
        }}
      />

      {/* Edit Supplier Modal */}
      <EditSupplierModal
        isOpen={editDialogOpen}
        supplier={editingSupplier}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingSupplier(null);
        }}
        onSuccess={() => {
          setEditDialogOpen(false);
          setEditingSupplier(null);
          refetch();
        }}
      />
    </BaseLayout>
  );
};

export default SuppliersPage;
