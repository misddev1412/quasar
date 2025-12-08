import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiPackage,
  FiMapPin,
  FiGrid,
  FiActivity,
} from 'react-icons/fi';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Dropdown } from '../../../components/common/Dropdown';
import { StatisticsGrid, type StatisticData } from '../../../components/common/StatisticsGrid';
import { Table, type Column, type SortDescriptor } from '../../../components/common/Table';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import type { WarehouseLocation } from '../../../types/warehouse';

const DEFAULT_VISIBLE_COLUMNS = [
  'name',
  'code',
  'warehouse',
  'type',
  'itemCount',
  'capacity',
  'isActive',
  'createdAt',
  'actions',
];

const getColumnId = <T,>(column: Column<T>): string => {
  if (column.id) return column.id;
  if (typeof column.accessor === 'string') return column.accessor as string;
  return 'column';
};

const WarehouseLocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const {
    preferences,
    updatePageSize,
    updateSort,
    updatePreferences,
  } = useTablePreferences('warehouse-locations', {
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    visibleColumns: new Set(DEFAULT_VISIBLE_COLUMNS),
  });

  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: integrate with backend once warehouse location endpoints are available.
    setLocations([]);
    setLoading(false);
  }, []);

  const pageParam = Number(searchParams.get('page'));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const searchValue = searchParams.get('search') || '';
  const statusFilterParam = searchParams.get('isActive');

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

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<WarehouseLocation>>({
    columnAccessor: (preferences.sortBy as keyof WarehouseLocation) || 'createdAt',
    direction: preferences.sortOrder || 'desc',
  });

  useEffect(() => {
    if (preferences.sortBy) {
      setSortDescriptor({
        columnAccessor: preferences.sortBy as keyof WarehouseLocation,
        direction: preferences.sortOrder || 'desc',
      });
    }
  }, [preferences.sortBy, preferences.sortOrder]);

  const filteredLocations = useMemo(() => {
    const text = searchValue.trim().toLowerCase();
    const statusFilter =
      statusFilterParam !== null ? statusFilterParam === 'true' : undefined;

    return locations.filter((location) => {
      if (text) {
        const haystack = [
          location.name,
          location.code,
          location.type,
          location.fullPath,
          location.warehouse?.name,
        ]
          .filter(Boolean)
          .map((value) => value!.toLowerCase())
          .join(' ');

        if (!haystack.includes(text)) {
          return false;
        }
      }

      if (typeof statusFilter === 'boolean' && location.isActive !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [locations, searchValue, statusFilterParam]);

  const sortedLocations = useMemo(() => {
    const data = [...filteredLocations];
    const { columnAccessor, direction } = sortDescriptor;

    const compare = (a: WarehouseLocation, b: WarehouseLocation) => {
      const valueA = a[columnAccessor];
      const valueB = b[columnAccessor];

      if (valueA === valueB) return 0;
      if (valueA === undefined || valueA === null) return direction === 'asc' ? -1 : 1;
      if (valueB === undefined || valueB === null) return direction === 'asc' ? 1 : -1;

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
  }, [filteredLocations, sortDescriptor]);

  const pageSize = preferences.pageSize || 20;
  const totalItems = sortedLocations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(totalPages));
      setSearchParams(params);
    }
  }, [page, totalPages, searchParams, setSearchParams]);

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLocations.slice(startIndex, startIndex + pageSize);
  }, [sortedLocations, currentPage, pageSize]);

  const statistics: StatisticData[] = useMemo(() => {
    const totalLocations = locations.length;
    const activeLocations = locations.filter((location) => location.isActive).length;
    const inactiveLocations = totalLocations - activeLocations;
    const totalItems = locations.reduce((sum, location) => sum + (location.itemCount || 0), 0);

    return [
      {
        id: 'total-locations',
        title: t('warehouse_locations.total_locations', 'Total Locations'),
        value: totalLocations,
        icon: React.createElement(FiGrid),
      },
      {
        id: 'active-locations',
        title: t('warehouse_locations.active_locations', 'Active Locations'),
        value: activeLocations,
        icon: React.createElement(FiActivity),
      },
      {
        id: 'inactive-locations',
        title: t('warehouse_locations.inactive_locations', 'Inactive Locations'),
        value: inactiveLocations,
        icon: React.createElement(FiActivity),
      },
      {
        id: 'total-items',
        title: t('warehouse_locations.total_items', 'Total Items'),
        value: totalItems,
        icon: React.createElement(FiPackage),
      },
    ];
  }, [locations, t]);

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

  const handleSortChange = useCallback((descriptor: SortDescriptor<WarehouseLocation>) => {
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

  const handleDeleteLocation = useCallback((location: WarehouseLocation) => {
    addToast({
      type: 'info',
      title: t('warehouse_locations.delete_unavailable', 'Not available yet'),
      description: t('warehouse_locations.delete_placeholder', 'Location management will be enabled once the backend endpoints are ready.'),
    });
  }, [addToast, t]);

  const columns: Column<WarehouseLocation>[] = useMemo(() => [
    {
      id: 'name',
      header: t('warehouse_locations.name', 'Location Name'),
      accessor: 'name',
      render: (_value, location) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{location.name}</span>
          {location.fullPath && (
            <span className="text-xs text-gray-500">{location.fullPath}</span>
          )}
        </div>
      ),
      isSortable: true,
    },
    {
      id: 'code',
      header: t('warehouse_locations.code', 'Code'),
      accessor: 'code',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value as string}
        </span>
      ),
      isSortable: true,
    },
    {
      id: 'warehouse',
      header: t('warehouse_locations.warehouse', 'Warehouse'),
      accessor: (location) => (
        <div className="flex items-center space-x-1">
          <FiMapPin className="w-4 h-4 text-gray-400" />
          <span>{location.warehouse?.name || t('warehouse_locations.unknown', 'Unknown')}</span>
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'type',
      header: t('warehouse_locations.type', 'Type'),
      accessor: 'type',
      render: (value) => (
        <span className="text-sm text-gray-700">{value as string}</span>
      ),
      isSortable: true,
    },
    {
      id: 'itemCount',
      header: t('warehouse_locations.item_count', 'Items'),
      accessor: 'itemCount',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <FiPackage className="w-4 h-4 text-gray-400" />
          <span>{Number(value || 0)}</span>
        </div>
      ),
      isSortable: true,
      align: 'right',
    },
    {
      id: 'capacity',
      header: t('warehouse_locations.capacity', 'Capacity'),
      accessor: (location) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {t('warehouse_locations.capacity_summary', '{current} / {max}', {
              current: Number(location.currentCapacity || 0),
              max: location.maxCapacity ? Number(location.maxCapacity) : '—',
            })}
          </span>
          {typeof location.capacityPercentage === 'number' && (
            <span className="text-xs text-gray-500">
              {location.capacityPercentage.toFixed(0)}%
            </span>
          )}
        </div>
      ),
      isSortable: false,
    },
    {
      id: 'isActive',
      header: t('warehouse_locations.status', 'Status'),
      accessor: 'isActive',
      render: (value) => {
        const active = Boolean(value);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
          </span>
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
          {value ? new Date(String(value)).toLocaleDateString() : '—'}
        </span>
      ),
      isSortable: true,
      type: 'datetime',
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (location) => (
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
              onClick: () => navigate(`/warehouses/locations/${location.id}`),
            },
            {
              label: t('common.edit', 'Edit'),
              icon: React.createElement(FiEdit2),
              onClick: () => navigate(`/warehouses/locations/${location.id}`),
            },
            {
              label: t('common.delete', 'Delete'),
              icon: React.createElement(FiTrash2),
              onClick: () => handleDeleteLocation(location),
              className: 'text-red-600 hover:text-red-700',
            },
          ]}
        />
      ),
      hideable: false,
    },
  ], [t, navigate, handleDeleteLocation]);

  const visibleColumnsArray = useMemo(() => {
    return columns.filter((column) => visibleColumns.has(getColumnId(column)));
  }, [columns, visibleColumns]);

  const breadcrumbItems = useMemo(() => ([
    { label: t('navigation.dashboard', 'Dashboard'), href: '/' },
    { label: t('warehouse_locations.title', 'Warehouse Locations') },
  ]), [t]);

  const actions = useMemo(() => ([
    {
      label: t('warehouse_locations.create', 'Create Location'),
      onClick: () => navigate('/warehouses/locations/create'),
      primary: true,
      icon: <FiPlus className="w-4 h-4" />,
    },
  ]), [navigate, t]);

  if (loading) {
    return (
      <BaseLayout
        title={t('warehouse_locations.title', 'Warehouse Locations')}
        description={t('warehouse_locations.description', 'Manage logical locations inside your warehouses')}
        actions={actions}
        fullWidth
      >
        <div className="flex justify-center items-center h-64">
          <Loading size="large" />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout
        title={t('warehouse_locations.title', 'Warehouse Locations')}
        description={t('warehouse_locations.description', 'Manage logical locations inside your warehouses')}
        actions={actions}
        fullWidth
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('warehouse_locations.title', 'Warehouse Locations')}
      description={t('warehouse_locations.description', 'Manage logical locations inside your warehouses')}
      actions={actions}
      fullWidth
    >
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <StatisticsGrid statistics={statistics} isLoading={loading} />

        <Card>
          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('warehouse_locations.search_placeholder', 'Search locations...')}
                className="w-64 pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchValue}
                onChange={(event) => handleSearch(event.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 300);
                }}
                className="flex items-center space-x-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>{t('common.refresh', 'Refresh')}</span>
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <Table<WarehouseLocation>
            tableId="warehouse-locations-table"
            columns={visibleColumnsArray}
            data={paginatedLocations}
            isLoading={loading}
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
            visibleColumns={visibleColumns}
            onColumnVisibilityChange={handleVisibleColumnsChange}
            showColumnVisibility
            enableRowHover
            density="normal"
            onRowClick={(location) => navigate(`/warehouses/locations/${location.id}`)}
            emptyMessage={t('warehouse_locations.empty', 'No locations available yet')}
            emptyAction={{
              label: t('warehouse_locations.create', 'Create Location'),
              onClick: () => navigate('/warehouses/locations/create'),
              icon: <FiPlus className="w-4 h-4" />,
            }}
          />
        </Card>
      </div>
    </BaseLayout>
  );
};

export default WarehouseLocationsPage;
