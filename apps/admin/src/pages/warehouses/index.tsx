import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiPackage,
  FiMapPin,
  FiHome,
  FiActivity,
  FiTrendingUp,
} from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, type StatisticData } from '../../components/common/StatisticsGrid';
import { Table, type Column, type SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { WarehouseFilters } from '../../components/features/WarehouseFilters';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import type { Warehouse, WarehouseFiltersType } from '../../types/warehouse';

const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'code',
  'city',
  'locationCount',
  'totalInventoryValue',
  'isActive',
  'createdAt',
  'actions',
];

const getColumnId = <T,>(column: Column<T>): string => {
  if (column.id) {
    return column.id;
  }

  if (typeof column.accessor === 'string') {
    return column.accessor as string;
  }

  return 'column';
};

const WarehousesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const isActiveParam = searchParams.get('isActive');
  const isDefaultParam = searchParams.get('isDefault');

  const [filters, setFilters] = useState<WarehouseFiltersType>(() => {
    const initial: WarehouseFiltersType = {};
    if (isActiveParam !== null) {
      initial.isActive = isActiveParam === 'true';
    }
    if (isDefaultParam !== null) {
      initial.isDefault = isDefaultParam === 'true';
    }
    return initial;
  });
  const [showFilters, setShowFilters] = useState(false);

  const {
    preferences,
    updatePageSize,
    updateSort,
    updatePreferences,
  } = useTablePreferences('warehouses', {
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    visibleColumns: new Set(DEFAULT_VISIBLE_COLUMNS),
  });

  const pageParam = Number(searchParams.get('page'));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const searchValue = searchParams.get('search') || '';

  const {
    data: warehousesResponse,
    isLoading: isLoadingWarehouses,
    error: warehousesError,
    refetch: refetchWarehouses,
  } = trpc.adminWarehouses.getAll.useQuery(undefined, {
    retry: 1,
  });

  const rawWarehouses: Warehouse[] = useMemo(() => {
    const data = (warehousesResponse as { data?: unknown } | undefined)?.data;
    if (Array.isArray(data)) {
      return data as Warehouse[];
    }
    return [];
  }, [warehousesResponse]);

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (preferences.visibleColumns && preferences.visibleColumns.size > 0) {
      return new Set(preferences.visibleColumns);
    }
    return new Set(DEFAULT_VISIBLE_COLUMNS);
  });

  useEffect(() => {
    if (!preferences.visibleColumns || preferences.visibleColumns.size === 0) {
      updatePreferences({ visibleColumns: new Set(DEFAULT_VISIBLE_COLUMNS) });
    }
  }, [preferences.visibleColumns, updatePreferences]);

  useEffect(() => {
    if (preferences.visibleColumns) {
      setVisibleColumns(new Set(preferences.visibleColumns));
    }
  }, [preferences.visibleColumns]);

  useEffect(() => {
    const nextFilters: WarehouseFiltersType = {};
    if (isActiveParam !== null) {
      nextFilters.isActive = isActiveParam === 'true';
    }
    if (isDefaultParam !== null) {
      nextFilters.isDefault = isDefaultParam === 'true';
    }

    setFilters((prev) => {
      if (prev.isActive === nextFilters.isActive && prev.isDefault === nextFilters.isDefault) {
        return prev;
      }
      return nextFilters;
    });
  }, [isActiveParam, isDefaultParam]);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<Warehouse>>({
    columnAccessor: (preferences.sortBy as keyof Warehouse) || 'createdAt',
    direction: preferences.sortOrder || 'desc',
  });

  useEffect(() => {
    if (preferences.sortBy) {
      setSortDescriptor({
        columnAccessor: preferences.sortBy as keyof Warehouse,
        direction: preferences.sortOrder || 'desc',
      });
    }
  }, [preferences.sortBy, preferences.sortOrder]);

  const filteredWarehouses = useMemo(() => {
    const text = searchValue.trim().toLowerCase();
    const filterByStatus = filters.isActive;
    const filterByDefault = filters.isDefault;

    return rawWarehouses.filter((warehouse) => {
      if (text) {
        const haystack = [
          warehouse.name,
          warehouse.code,
          warehouse.city,
          warehouse.country,
          warehouse.managerName,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase())
          .join(' ');

        if (!haystack.includes(text)) {
          return false;
        }
      }

      if (typeof filterByStatus === 'boolean' && warehouse.isActive !== filterByStatus) {
        return false;
      }

      if (typeof filterByDefault === 'boolean' && warehouse.isDefault !== filterByDefault) {
        return false;
      }

      return true;
    });
  }, [rawWarehouses, searchValue, filters.isActive, filters.isDefault]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.isActive !== undefined) {
      count += 1;
    }
    if (filters.isDefault !== undefined) {
      count += 1;
    }
    return count;
  }, [filters.isActive, filters.isDefault]);

  const sortedWarehouses = useMemo(() => {
    const data = [...filteredWarehouses];
    const { columnAccessor, direction } = sortDescriptor;

    const compare = (a: Warehouse, b: Warehouse) => {
      const valueA = a[columnAccessor];
      const valueB = b[columnAccessor];

      if (valueA === valueB) {
        return 0;
      }

      if (valueA === undefined || valueA === null) {
        return direction === 'asc' ? -1 : 1;
      }

      if (valueB === undefined || valueB === null) {
        return direction === 'asc' ? 1 : -1;
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (columnAccessor === 'createdAt' || columnAccessor === 'updatedAt') {
        const dateA = new Date(String(valueA)).getTime();
        const dateB = new Date(String(valueB)).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return direction === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    };

    data.sort(compare);
    return data;
  }, [filteredWarehouses, sortDescriptor]);

  const pageSize = preferences.pageSize || 20;
  const totalItems = sortedWarehouses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(totalPages));
      setSearchParams(params);
    }
  }, [page, totalPages, searchParams, setSearchParams]);

  const paginatedWarehouses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedWarehouses.slice(startIndex, startIndex + pageSize);
  }, [sortedWarehouses, currentPage, pageSize]);

  const statistics: StatisticData[] = useMemo(() => {
    const totalWarehouses = rawWarehouses.length;
    const activeWarehouses = rawWarehouses.filter((warehouse) => warehouse.isActive).length;
    const inactiveWarehouses = totalWarehouses - activeWarehouses;
    const defaultWarehouses = rawWarehouses.filter((warehouse) => warehouse.isDefault).length;
    const totalInventoryValue = rawWarehouses.reduce(
      (sum, warehouse) => sum + (warehouse.totalInventoryValue || 0),
      0,
    );
    const averageLocations = totalWarehouses
      ? rawWarehouses.reduce((sum, warehouse) => sum + (warehouse.locationCount || 0), 0) /
        totalWarehouses
      : 0;

    return [
      {
        id: 'total-warehouses',
        title: t('warehouses.total_warehouses', 'Total Warehouses'),
        value: totalWarehouses,
        icon: React.createElement(FiHome),
      },
      {
        id: 'active-warehouses',
        title: t('warehouses.active_warehouses', 'Active Warehouses'),
        value: activeWarehouses,
        icon: React.createElement(FiActivity),
      },
      {
        id: 'inactive-warehouses',
        title: t('warehouses.inactive_warehouses', 'Inactive Warehouses'),
        value: inactiveWarehouses,
        icon: React.createElement(FiActivity),
      },
      {
        id: 'default-warehouses',
        title: t('warehouses.default_warehouses', 'Default Warehouses'),
        value: defaultWarehouses,
        icon: React.createElement(FiHome),
      },
      {
        id: 'total-inventory',
        title: t('warehouses.total_inventory', 'Total Inventory Value'),
        value: `$${totalInventoryValue.toLocaleString()}`,
        icon: React.createElement(FiTrendingUp),
        trend: {
          value: Math.round(averageLocations),
          isPositive: true,
          label: 'avg locations',
        },
      },
    ];
  }, [rawWarehouses, t]);

  const handleVisibleColumnsChange = useCallback((columnId: string, isVisible: boolean) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (isVisible) {
        next.add(columnId);
      } else {
        next.delete(columnId);
      }
      updatePreferences({ visibleColumns: new Set(next) });
      return next;
    });
  }, [updatePreferences]);

  const handleSortChange = useCallback((descriptor: SortDescriptor<Warehouse>) => {
    setSortDescriptor(descriptor);
    updateSort(descriptor.columnAccessor as string, descriptor.direction);
  }, [updateSort]);

  const handleSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleItemsPerPageChange = useCallback((newPageSize: number) => {
    updatePageSize(newPageSize);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    setSearchParams(params);
  }, [updatePageSize, searchParams, setSearchParams]);

  const handleFilterToggle = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleFiltersChange = useCallback((nextFilters: WarehouseFiltersType) => {
    setFilters(nextFilters);
    setShowFilters(true);

    const params = new URLSearchParams(searchParams.toString());
    if (nextFilters.isActive !== undefined) {
      params.set('isActive', String(nextFilters.isActive));
    } else {
      params.delete('isActive');
    }

    if (nextFilters.isDefault !== undefined) {
      params.set('isDefault', String(nextFilters.isDefault));
    } else {
      params.delete('isDefault');
    }

    params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('isActive');
    params.delete('isDefault');
    params.delete('page');
    setSearchParams(params);
    setFilters({});
  }, [searchParams, setSearchParams]);

  const handleRefresh = useCallback(() => {
    refetchWarehouses();
  }, [refetchWarehouses]);

  const handleCreateWarehouse = useCallback(() => {
    navigate('/warehouses/create');
  }, [navigate]);

  const handleEditWarehouse = useCallback((warehouse: Warehouse) => {
    navigate(`/warehouses/${warehouse.id}`);
  }, [navigate]);

  const deleteWarehouseMutation = trpc.adminWarehouses.delete.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('warehouses.deleteSuccess', 'Warehouse deleted successfully'),
        description: t('warehouses.deleteSuccessDescription', 'The warehouse has been deleted.'),
      });
      refetchWarehouses();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('warehouses.deleteError', 'Failed to delete warehouse'),
        description: error.message,
      });
    },
  });

  const handleDeleteWarehouse = useCallback((warehouse: Warehouse) => {
    const confirmed = window.confirm(
      t(
        'warehouses.deleteConfirm',
        'Are you sure you want to delete this warehouse? This action cannot be undone.',
      ),
    );

    if (!confirmed) {
      return;
    }

    deleteWarehouseMutation.mutate({ id: warehouse.id });
  }, [deleteWarehouseMutation, t]);

  const columns: Column<Warehouse>[] = useMemo(() => [
    {
      id: 'name',
      header: t('warehouses.name', 'Warehouse Name'),
      accessor: 'name',
      render: (_value, warehouse) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiHome className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
            {warehouse.description && (
              <div className="text-sm text-gray-500">{warehouse.description}</div>
            )}
          </div>
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'code',
      header: t('warehouses.code', 'Warehouse Code'),
      accessor: 'code',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value as string}
        </span>
      ),
      isSortable: true,
    },
    {
      id: 'city',
      header: t('warehouses.city', 'City'),
      accessor: 'city',
      render: (value, warehouse) => (
        <div className="flex items-center space-x-1">
          <FiMapPin className="w-4 h-4 text-gray-400" />
          <span>{value as string}</span>
          {warehouse.country && <span className="text-gray-500">({warehouse.country})</span>}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'locationCount',
      header: t('warehouses.location_count', 'Locations'),
      accessor: 'locationCount',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <FiPackage className="w-4 h-4 text-gray-400" />
          <span>{value as number}</span>
        </div>
      ),
      isSortable: true,
      align: 'right',
    },
    {
      id: 'totalInventoryValue',
      header: t('warehouses.total_inventory_value', 'Inventory Value'),
      accessor: 'totalInventoryValue',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          ${Number(value || 0).toLocaleString()}
        </span>
      ),
      isSortable: true,
      align: 'right',
    },
    {
      id: 'isActive',
      header: t('warehouses.is_active', 'Status'),
      accessor: 'isActive',
      render: (value, warehouse) => {
        const active = Boolean(value);
        return (
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
            </span>
            {warehouse.isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {t('warehouses.is_default', 'Default')}
              </span>
            )}
          </div>
        );
      },
      isSortable: true,
    },
    {
      id: 'createdAt',
      header: t('common.created', 'Created'),
      accessor: 'createdAt',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(String(value)).toLocaleDateString()}
        </span>
      ),
      isSortable: true,
      type: 'datetime',
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (warehouse) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: t('common.view', 'View'),
              icon: React.createElement(FiEye),
              onClick: () => navigate(`/warehouses/${warehouse.id}`),
            },
            {
              label: t('common.edit', 'Edit'),
              icon: React.createElement(FiEdit2),
              onClick: () => handleEditWarehouse(warehouse),
            },
            {
              label: t('warehouses.view_locations', 'View Locations'),
              icon: React.createElement(FiPackage),
              onClick: () => navigate(`/warehouses/locations?warehouse=${warehouse.id}`),
            },
            {
              label: t('common.delete', 'Delete'),
              icon: React.createElement(FiTrash2),
              onClick: () => handleDeleteWarehouse(warehouse),
              className: 'text-red-600 hover:text-red-700',
            },
          ]}
        />
      ),
      hideable: false,
    },
  ], [t, navigate, handleEditWarehouse, handleDeleteWarehouse]);

  const visibleColumnsArray = useMemo(() => {
    return columns.filter((column) => visibleColumns.has(getColumnId(column)));
  }, [columns, visibleColumns]);

  const breadcrumbItems = useMemo(() => ([
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('warehouses.title', 'Warehouses') },
  ]), [t]);

  const actions = useMemo(() => ([
    {
      label: t('warehouses.create', 'Create Warehouse'),
      onClick: handleCreateWarehouse,
      primary: true,
      icon: <FiPlus className="w-4 h-4" />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw className="w-4 h-4" />,
    },
    {
      label: showFilters
        ? t('common.hide_filters', 'Hide Filters')
        : t('common.show_filters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter className="w-4 h-4" />,
      active: showFilters,
    },
  ]), [handleCreateWarehouse, handleFilterToggle, handleRefresh, showFilters, t]);

  if (isLoadingWarehouses) {
    return (
      <BaseLayout
        title={t('warehouses.title', 'Warehouses')}
        description={t('warehouses.description', 'Manage warehouse locations and inventory')}
        actions={actions}
        fullWidth
        breadcrumbs={breadcrumbItems}
      >
        <div className="flex justify-center items-center h-64">
          <Loading size="large" />
        </div>
      </BaseLayout>
    );
  }

  if (warehousesError) {
    return (
      <BaseLayout
        title={t('warehouses.title', 'Warehouses')}
        description={t('warehouses.description', 'Manage warehouse locations and inventory')}
        actions={actions}
        fullWidth
        breadcrumbs={breadcrumbItems}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{warehousesError.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('warehouses.title', 'Warehouses')}
      description={t('warehouses.description', 'Manage warehouse locations and inventory')}
      actions={actions}
      fullWidth
      breadcrumbs={breadcrumbItems}
    >
      <div className="space-y-6">
        <StatisticsGrid statistics={statistics} isLoading={isLoadingWarehouses} />


        {showFilters && (
          <WarehouseFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}


        <Card>
          <Table<Warehouse>
            tableId="warehouses-table"
            columns={visibleColumnsArray}
            data={paginatedWarehouses}
            isLoading={isLoadingWarehouses}
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage: pageSize,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange,
            }}
            searchValue={searchValue}
            onSearchChange={handleSearch}
            onFilterClick={handleFilterToggle}
            isFilterActive={showFilters}
            visibleColumns={visibleColumns}
            onColumnVisibilityChange={handleVisibleColumnsChange}
            showColumnVisibility
            enableRowHover
            density="normal"
            onRowClick={(warehouse) => navigate(`/warehouses/${warehouse.id}`)}
            emptyMessage={t('warehouses.empty', 'No warehouses found')}
            emptyAction={{
              label: t('warehouses.create', 'Create Warehouse'),
              onClick: handleCreateWarehouse,
              icon: <FiPlus className="w-4 h-4" />,
            }}
          />
        </Card>
      </div>
    </BaseLayout>
  );
};

export default WarehousesPage;
