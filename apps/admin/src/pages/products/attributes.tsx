import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiRefreshCw, FiFilter, FiTag, FiSettings, FiEye, FiHome, FiPackage } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import { AttributeFilter, AttributeFilterOptions } from '../../components/products/AttributeFilter';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { CreateAttributeModal } from '../../components/products/CreateAttributeModal';
import { EditAttributeModal } from '../../components/products/EditAttributeModal';

const AttributesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('attributes-table', {
    pageSize: (() => {
      const limitParam = searchParams.get('limit');
      const parsedLimit = limitParam ? parseInt(limitParam, 10) : 10;
      return [10, 25, 50, 100].includes(parsedLimit) ? parsedLimit : 10;
    })(),
    visibleColumns: new Set(['name', 'type', 'status', 'createdAt']),
  });

  // State management
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    return pageNum > 0 ? pageNum : 1;
  });
  const [limit, setLimit] = useState(preferences.pageSize);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'name' | 'displayName' | 'createdAt' | 'updatedAt' | 'sortOrder'>(() => {
    const param = searchParams.get('sortBy');
    return ['name', 'displayName', 'createdAt', 'updatedAt', 'sortOrder'].includes(param as any) ? param as any : 'sortOrder';
  });
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(() =>
    searchParams.get('sortOrder') === 'ASC' ? 'ASC' : 'DESC'
  );
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<Set<string | number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(['name', 'type', 'status', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });
  const [filters, setFilters] = useState<AttributeFilterOptions>({
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') as any || undefined,
    isRequired: searchParams.get('isRequired') ? searchParams.get('isRequired') === 'true' : undefined,
    isFilterable: searchParams.get('isFilterable') ? searchParams.get('isFilterable') === 'true' : undefined,
  });

  const utils = trpc.useContext();

  // Function to update URL parameters
  const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams, { replace: true });
  }, [setSearchParams]);

  // Debounce search value
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  // Data fetching
  const { data: attributesData, isLoading, error, refetch, isFetching } = trpc.adminProductAttributes.getAll.useQuery({
    page,
    limit,
    search: debouncedSearchValue || undefined,
    sortBy,
    sortOrder,
    ...filters,
  });

  const { data: statsData, isLoading: statsLoading } = trpc.adminProductAttributes.getStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const attributes = (attributesData as any)?.data?.items || [];

  // Mutations
  const deleteMutation = trpc.adminProductAttributes.delete.useMutation({
    onSuccess: () => {
      addToast({ 
        title: t('attributes.deleteSuccess', 'Attribute deleted successfully'), 
        type: 'success' 
      });
      utils.adminProductAttributes.getAll.invalidate();
      utils.adminProductAttributes.getStats.invalidate();
    },
    onError: (error) => {
      addToast({ 
        title: t('common.error', 'Error'), 
        description: error.message, 
        type: 'error' 
      });
    },
  });

  // Event handlers
  const handleDelete = useCallback(async (id: string) => {
    const confirmDelete = window.confirm(t('attributes.deleteConfirm', 'Are you sure you want to delete this attribute? This action cannot be undone.'));
    if (confirmDelete) {
      deleteMutation.mutate({ id });
    }
  }, [deleteMutation, t]);

  const handleCreateAttribute = () => {
    setShowCreateModal(true);
  };

  const handleEditAttribute = (attribute: any) => {
    setEditingAttribute(attribute);
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFiltersChange = useCallback((newFilters: AttributeFilterOptions) => {
    setFilters(newFilters);
    setPage(1);
    
    updateUrlParams({
      search: searchValue || undefined,
      type: newFilters.type || undefined,
      isRequired: newFilters.isRequired !== undefined ? String(newFilters.isRequired) : undefined,
      isFilterable: newFilters.isFilterable !== undefined ? String(newFilters.isFilterable) : undefined,
      page: '1',
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'DESC' ? sortOrder : undefined,
    });
  }, [searchValue, limit, sortBy, sortOrder, updateUrlParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      isRequired: filters.isRequired !== undefined ? String(filters.isRequired) : undefined,
      isFilterable: filters.isFilterable !== undefined ? String(filters.isFilterable) : undefined,
      page: newPage > 1 ? String(newPage) : undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'DESC' ? sortOrder : undefined,
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updatePageSize(newLimit);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      isRequired: filters.isRequired !== undefined ? String(filters.isRequired) : undefined,
      isFilterable: filters.isFilterable !== undefined ? String(filters.isFilterable) : undefined,
      page: undefined,
      limit: newLimit !== 10 ? String(newLimit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'DESC' ? sortOrder : undefined,
    });
  };

  const handleSortChange = (sortDescriptor: SortDescriptor<any>) => {
    const newSortBy = String(sortDescriptor.columnAccessor);
    const validSortFields = ['name', 'displayName', 'createdAt', 'updatedAt', 'sortOrder'];
    const typedSortBy = validSortFields.includes(newSortBy) ? newSortBy as 'name' | 'displayName' | 'createdAt' | 'updatedAt' | 'sortOrder' : 'sortOrder';
    const newSortOrder = sortDescriptor.direction === 'asc' ? 'ASC' : 'DESC';
    setSortBy(typedSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      type: filters.type || undefined,
      isRequired: filters.isRequired !== undefined ? String(filters.isRequired) : undefined,
      isFilterable: filters.isFilterable !== undefined ? String(filters.isFilterable) : undefined,
      page: undefined,
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: typedSortBy !== 'sortOrder' ? typedSortBy : undefined,
      sortOrder: newSortOrder !== 'DESC' ? newSortOrder : undefined,
    });
  };

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

  const handleBulkAction = useCallback((action: string) => {
    console.log(`Bulk action: ${action} on ${selectedAttributeIds.size} attributes`);
    switch (action) {
      case 'delete':
        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedAttributeIds.size} attributes? This action cannot be undone.`);
        if (confirmDelete) {
          selectedAttributeIds.forEach(id => {
            deleteMutation.mutate({ id: String(id) });
          });
          setSelectedAttributeIds(new Set());
        }
        break;
      default:
        break;
    }
  }, [selectedAttributeIds]);

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
    updateUrlParams({
      search: searchValue || undefined,
      type: undefined,
      isRequired: undefined,
      isFilterable: undefined,
      page: '1',
      limit: limit !== 10 ? String(limit) : undefined,
      sortBy: sortBy !== 'sortOrder' ? sortBy : undefined,
      sortOrder: sortOrder !== 'DESC' ? sortOrder : undefined,
    });
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    utils.adminProductAttributes.getAll.invalidate();
    utils.adminProductAttributes.getStats.invalidate();
  };

  const handleEditSuccess = () => {
    setEditingAttribute(null);
    utils.adminProductAttributes.getAll.invalidate();
    utils.adminProductAttributes.getStats.invalidate();
  };

  // Count active filters for display
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length,
    [filters]
  );

  // Statistics computation from data if stats endpoint is not available
  const computedStats = useMemo(() => {
    if (!attributes.length) return null;
    
    const totalAttributes = attributes.length;
    const requiredAttributes = attributes.filter((attr: any) => attr.isRequired).length;
    const filterableAttributes = attributes.filter((attr: any) => attr.isFilterable).length;
    
    const attributesByType = attributes.reduce((acc: any, attr: any) => {
      acc[attr.type] = (acc[attr.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAttributes,
      requiredAttributes,
      filterableAttributes,
      attributesByType,
    };
  }, [attributes]);

  const stats = (statsData && typeof statsData === 'object' && 'data' in statsData ? statsData.data : null) || computedStats;

  const statisticsData: StatisticData[] = [
    {
      id: 'total',
      title: t('attributes.stats.total', 'Total Attributes'),
      value: (stats as any)?.totalAttributes || 0,
      icon: <FiTag className="h-5 w-5" />,
    },
    {
      id: 'required',
      title: t('attributes.stats.required', 'Required'),
      value: (stats as any)?.requiredAttributes || 0,
      icon: <FiSettings className="h-5 w-5" />,
    },
    {
      id: 'filterable',
      title: t('attributes.stats.filterable', 'Filterable'),
      value: (stats as any)?.filterableAttributes || 0,
      icon: <FiFilter className="h-5 w-5" />,
    },
  ];

  // Column definitions
  const columns: Column<any>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {item.type}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item) => (
        <div className="flex items-center space-x-2">
          {item.isRequired && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Required
            </span>
          )}
          {item.isFilterable && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Filterable
            </span>
          )}
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${item.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleEditAttribute(item)
            },
            {
              label: 'View',
              icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
              onClick: () => console.log('View attribute:', item.id)
            },
            {
              label: 'Delete',
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDelete(item.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [t, handleEditAttribute, handleDelete]);

  // Sort descriptor
  const sortDescriptor: SortDescriptor<any> = useMemo(() => ({
    columnAccessor: sortBy as any,
    direction: sortOrder === 'ASC' ? 'asc' : 'desc',
  }), [sortBy, sortOrder]);

  // Bulk actions
  const bulkActions = useMemo(() => [
    {
      label: 'Delete Selected',
      value: 'delete',
      variant: 'danger' as const,
    },
  ], []);

  // Actions for header
  const actions = useMemo(() => [
    {
      label: 'Create Attribute',
      onClick: handleCreateAttribute,
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
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleCreateAttribute, handleRefresh, handleFilterToggle, showFilters]);

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
      label: t('attributes.title', 'Product Attributes'),
      icon: <FiSettings className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout
        title={t('attributes.title', 'Product Attributes')}
        description={t('attributes.description', 'Manage product attributes and their values')}
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
        title={t('attributes.title', 'Product Attributes')}
        description={t('attributes.description', 'Manage product attributes and their values')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  const totalAttributes = (attributesData as any)?.data?.total ?? 0;
  const totalPages = Math.ceil(totalAttributes / limit);

  return (
    <BaseLayout
      title={t('attributes.title', 'Product Attributes')}
      description={t('attributes.description', 'Manage product attributes and their values')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics */}
        <StatisticsGrid statistics={statisticsData} isLoading={statsLoading} />

        {/* Filters */}
        {showFilters && (
          <Card className="p-4">
            <AttributeFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowFilters(false)}
            />
          </Card>
        )}

        {/* Enhanced Attributes Table */}
        <Table<any>
          tableId="attributes-table"
          columns={columns}
          data={attributes}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={handleFilterToggle}
          isFilterActive={showFilters}
          searchPlaceholder="Search attributes by name or type..."
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          // Selection and bulk actions
          selectedIds={selectedAttributeIds}
          onSelectionChange={setSelectedAttributeIds}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          // Sorting
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalAttributes,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handlePageSizeChange,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          onRowClick={(attribute) => handleEditAttribute(attribute)}
          // Empty state
          emptyMessage={t('attributes.no_attributes_found', 'No attributes found')}
          emptyAction={{
            label: t('attributes.create', 'Create Attribute'),
            onClick: handleCreateAttribute,
            icon: <FiPlus />,
          }}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAttributeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Modal */}
      {editingAttribute && (
        <EditAttributeModal
          isOpen={true}
          attribute={editingAttribute}
          onClose={() => setEditingAttribute(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </BaseLayout>
  );
};

export default AttributesPage;
