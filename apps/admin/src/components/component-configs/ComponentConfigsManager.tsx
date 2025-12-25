import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ComponentCategory, ComponentStructureType } from '@shared/enums/component.enums';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Toggle } from '../common/Toggle';
import { Dropdown } from '../common/Dropdown';
import { useToast } from '../../context/ToastContext';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Table, type Column, type SortDescriptor } from '../common/Table';
import { StatisticsGrid, type StatisticData } from '../common/StatisticsGrid';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { flattenComponents, type ComponentConfigNode } from './componentConfigTree';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import {
  FiBox,
  FiEdit2,
  FiGrid,
  FiLayers,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSlash,
  FiTrash2,
} from 'react-icons/fi';

type ComponentTableRow = ComponentConfigNode & {
  depth: number;
  parentName?: string | null;
};

type ComponentConfigsApiResponse = ApiResponse<ComponentConfigNode[]>;

type StatusFilter = 'all' | 'enabled' | 'disabled';

type FiltersState = {
  category: ComponentCategory | 'all';
  structure: ComponentStructureType | 'all';
  status: StatusFilter;
};

const DEFAULT_FILTERS: FiltersState = {
  category: 'all',
  structure: 'all',
  status: 'all',
};

const DEFAULT_VISIBLE_COLUMNS = ['component', 'category', 'structure', 'status', 'updatedAt', 'actions'];

const compareValues = (a: unknown, b: unknown): number => {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  const dateA = Date.parse(String(a));
  const dateB = Date.parse(String(b));
  if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
    return dateA - dateB;
  }

  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
};

interface ComponentConfigsManagerProps {
  className?: string;
}

export const ComponentConfigsManager: React.FC<ComponentConfigsManagerProps> = ({ className }) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FiltersState>(() => ({
    category: (searchParams.get('category') as ComponentCategory) || DEFAULT_FILTERS.category,
    structure: (searchParams.get('structure') as ComponentStructureType) || DEFAULT_FILTERS.structure,
    status: (searchParams.get('status') as StatusFilter) || DEFAULT_FILTERS.status,
  }));
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchParams.get('q')?.trim().toLowerCase() || '');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (filters.category !== 'all') params.set('category', filters.category);
    else params.delete('category');

    if (filters.structure !== 'all') params.set('structure', filters.structure);
    else params.delete('structure');

    if (filters.status !== 'all') params.set('status', filters.status);
    else params.delete('status');

    if (debouncedSearchValue) params.set('q', debouncedSearchValue);
    else params.delete('q');

    if (page > 1) params.set('page', page.toString());
    else params.delete('page');

    setSearchParams(params, { replace: true });
  }, [filters, debouncedSearchValue, page, setSearchParams]);

  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('component-configs-table', {
    pageSize: 10,
    visibleColumns: new Set(DEFAULT_VISIBLE_COLUMNS),
  });

  const [limit, setLimit] = useState(preferences.pageSize);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : new Set(DEFAULT_VISIBLE_COLUMNS);
    if (!initial.has('actions')) {
      initial.add('actions');
    }
    return initial;
  });

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<ComponentTableRow>>({
    columnAccessor: 'displayName',
    direction: 'asc',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    if (limit !== preferences.pageSize) {
      setLimit(preferences.pageSize);
    }
  }, [preferences.pageSize, limit]);

  const categoryFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('componentConfigs.allCategories', 'All categories') },
      ...Object.values(ComponentCategory).map((value) => ({
        value,
        label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    ],
    [t],
  );

  const typeFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('componentConfigs.allComponentTypes', 'All component types') },
      ...Object.values(ComponentStructureType).map((value) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
      })),
    ],
    [t],
  );

  const statusFilterOptions: { value: StatusFilter; label: string }[] = useMemo(
    () => [
      { value: 'all', label: t('componentConfigs.allStatuses', 'All statuses') },
      { value: 'enabled', label: t('componentConfigs.enabledOnly', 'Enabled only') },
      { value: 'disabled', label: t('componentConfigs.disabledOnly', 'Disabled only') },
    ],
    [t],
  );

  const queryInput = useMemo(() => {
    const input: {
      parentId: string | null;
      includeChildren: boolean;
      category?: ComponentCategory;
      componentType?: ComponentStructureType;
      onlyEnabled: boolean;
    } = {
      parentId: null,
      includeChildren: true,
      onlyEnabled: filters.status === 'enabled',
    };

    if (filters.category !== 'all') {
      input.category = filters.category as ComponentCategory;
    }

    if (filters.structure !== 'all') {
      input.componentType = filters.structure as ComponentStructureType;
    }

    return input;
  }, [filters]);

  const listQuery = trpc.adminComponentConfigs.list.useQuery<ComponentConfigsApiResponse>(queryInput);
  const updateMutation = trpc.adminComponentConfigs.update.useMutation();
  const deleteMutation = trpc.adminComponentConfigs.delete.useMutation();

  const componentTree = listQuery.data?.data ?? [];

  const flattenedComponents = useMemo(() => flattenComponents(componentTree), [componentTree]);

  const componentLookup = useMemo(() => {
    const map = new Map<string, ComponentConfigNode>();
    flattenedComponents.forEach(({ node }) => map.set(node.id, node));
    return map;
  }, [flattenedComponents]);

  const tableRows = useMemo<ComponentTableRow[]>(() => {
    return flattenedComponents.map(({ node, depth }) => ({
      ...node,
      depth,
      parentName: node.parentId ? componentLookup.get(node.parentId)?.displayName ?? null : null,
    }));
  }, [flattenedComponents, componentLookup]);

  const filteredRows = useMemo(() => {
    const keyword = debouncedSearchValue;
    return tableRows.filter((row) => {
      if (filters.category !== 'all' && row.category !== filters.category) {
        return false;
      }
      if (filters.structure !== 'all' && row.componentType !== filters.structure) {
        return false;
      }
      if (filters.status === 'enabled' && !row.isEnabled) {
        return false;
      }
      if (filters.status === 'disabled' && row.isEnabled) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        row.displayName.toLowerCase().includes(keyword) ||
        row.componentKey.toLowerCase().includes(keyword) ||
        (row.description ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [tableRows, filters.category, filters.structure, filters.status, debouncedSearchValue]);

  const sortedRows = useMemo(() => {
    const data = [...filteredRows];
    const { columnAccessor, direction } = sortDescriptor;
    data.sort((a, b) => {
      const result = compareValues(a[columnAccessor], b[columnAccessor]);
      return direction === 'asc' ? result : -result;
    });
    return data;
  }, [filteredRows, sortDescriptor]);

  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () => sortedRows.slice((currentPage - 1) * limit, currentPage * limit),
    [sortedRows, currentPage, limit],
  );

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
  }, [filters, debouncedSearchValue, limit]);

  const navigateToCreate = useCallback(() => {
    navigate('/component-configs/create');
  }, [navigate]);

  const navigateToEdit = useCallback(
    (componentId: string) => {
      navigate(`/component-configs/${componentId}/edit`);
    },
    [navigate],
  );

  const navigateToCreateWithParent = useCallback(
    (parentId: string) => {
      navigate(`/component-configs/create?parentId=${parentId}`);
    },
    [navigate],
  );

  const stats = useMemo(
    () => ({
      total: tableRows.length,
      disabled: tableRows.filter((node) => !node.isEnabled).length,
      composites: tableRows.filter((node) => node.componentType === ComponentStructureType.COMPOSITE).length,
      atomics: tableRows.filter((node) => node.componentType === ComponentStructureType.ATOMIC).length,
      categories: new Set(tableRows.map((node) => node.category)).size,
    }),
    [tableRows],
  );

  const statisticsCards: StatisticData[] = [
    {
      id: 'total-components',
      title: t('componentConfigs.totalComponents', 'Total Components'),
      value: stats.total,
      icon: <FiBox className="w-5 h-5" />,
    },
    {
      id: 'composites',
      title: t('componentConfigs.composite', 'Composite'),
      value: stats.composites,
      icon: <FiLayers className="w-5 h-5" />,
    },
    {
      id: 'atomics',
      title: t('componentConfigs.atomic', 'Atomic'),
      value: stats.atomics,
      icon: <FiGrid className="w-5 h-5" />,
    },
    {
      id: 'disabled',
      title: t('componentConfigs.disabled', 'Disabled'),
      value: stats.disabled,
      icon: <FiSlash className="w-5 h-5" />,
    },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count += 1;
    if (filters.structure !== 'all') count += 1;
    if (filters.status !== 'all') count += 1;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    updatePageSize(newSize);
    setLimit(newSize);
    setPage(1);
  };

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (visible) {
        next.add(columnId);
      } else if (columnId !== 'actions') {
        next.delete(columnId);
      }
      updateVisibleColumns(next);
      return next;
    });
  };

  const handleToggleEnabled = useCallback(
    async (component: ComponentConfigNode, nextValue: boolean) => {
      try {
        await updateMutation.mutateAsync({ id: component.id, data: { isEnabled: nextValue } });
        listQuery.refetch();
        addToast({
          title: nextValue ? t('componentConfigs.componentEnabled', 'Component enabled') : t('componentConfigs.componentDisabled', 'Component disabled'),
          description: component.displayName,
          type: 'success',
        });
      } catch (error) {
        addToast({
          title: t('componentConfigs.unableToUpdateStatus', 'Unable to update status'),
          description: error instanceof Error ? error.message : t('common.pleaseTryAgainLater', 'Please try again later.'),
          type: 'error',
        });
      }
    },
    [updateMutation, addToast, listQuery],
  );

  const handleDelete = useCallback(
    async (component: ComponentConfigNode) => {
      const confirmed = window.confirm(
        `Delete "${component.displayName}" and detach all of its children? This cannot be undone.`,
      );
      if (!confirmed) return;

      try {
        await deleteMutation.mutateAsync({ id: component.id });
        addToast({ title: t('componentConfigs.componentDeleted', 'Component deleted'), description: component.displayName, type: 'success' });
        listQuery.refetch();
      } catch (error) {
        addToast({
          title: t('componentConfigs.unableToDeleteComponent', 'Unable to delete component'),
          description: error instanceof Error ? error.message : t('common.pleaseTryAgainLater', 'Please try again later.'),
          type: 'error',
        });
      }
    },
    [deleteMutation, addToast, listQuery],
  );

  const columns: Column<ComponentTableRow>[] = useMemo(
    () => [
      {
        id: 'component',
        header: t('componentConfigs.component', 'Component'),
        accessor: 'displayName',
        hideable: false,
        minWidth: '260px',
        isSortable: true,
        render: (_, item) => (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-900">{item.displayName}</span>
            <span className="text-xs font-mono text-neutral-500">{item.componentKey}</span>
            {item.description && <p className="text-xs text-neutral-500">{item.description}</p>}
            {item.parentName && (
              <p className="text-xs text-neutral-500">
                {t('componentConfigs.parent', 'Parent')}:&nbsp;<span className="font-medium text-neutral-700">{item.parentName}</span>
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'category',
        header: t('componentConfigs.category', 'Category'),
        accessor: 'category',
        width: '150px',
        isSortable: true,
        render: (value) => (
          <Badge variant="secondary" size="sm" className="uppercase tracking-wide">
            {String(value)}
          </Badge>
        ),
      },
      {
        id: 'structure',
        header: t('componentConfigs.structure', 'Structure'),
        accessor: 'componentType',
        width: '160px',
        isSortable: true,
        render: (value, item) => (
          <div className="flex flex-col text-sm text-neutral-700">
            <span className="capitalize">{String(value)}</span>
            {item.slotKey && <span className="text-xs text-neutral-500">{t('componentConfigs.slot', 'Slot')} {item.slotKey}</span>}
          </div>
        ),
      },
      {
        id: 'status',
        header: t('componentConfigs.status', 'Status'),
        accessor: 'isEnabled',
        width: '190px',
        isSortable: true,
        render: (value, item) => (
          <div
            className="flex items-center gap-2"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Badge variant={value ? 'success' : 'destructive'} size="sm">
              {value ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
            </Badge>
            <Toggle
              checked={item.isEnabled}
              onChange={(checked) => handleToggleEnabled(item, checked)}
              size="sm"
              aria-label="Toggle component visibility"
            />
          </div>
        ),
      },
      {
        id: 'updatedAt',
        header: t('componentConfigs.updated', 'Updated'),
        accessor: 'updatedAt',
        type: 'datetime',
        width: '200px',
        isSortable: true,
      },
      {
        id: 'actions',
        header: t('componentConfigs.actions', 'Actions'),
        accessor: 'id',
        hideable: false,
        width: '80px',
        align: 'right',
        render: (_, item) => (
          <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            <Dropdown
              button={
                <Button variant="ghost" size="sm" aria-label={`Actions for ${item.displayName}`}>
                  <FiMoreVertical className="w-4 h-4" />
                </Button>
              }
              items={[
                {
                  label: t('common.edit', 'Edit'),
                  icon: <FiEdit2 className="w-4 h-4" />,
                  onClick: () => navigateToEdit(item.id),
                },
                {
                  label: t('componentConfigs.addChild', 'Add child'),
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: () => navigateToCreateWithParent(item.id),
                },
                {
                  label: '-',
                  onClick: () => { },
                  disabled: true,
                },
                {
                  label: item.isEnabled ? t('common.disable', 'Disable') : t('common.enable', 'Enable'),
                  icon: <FiRefreshCw className="w-4 h-4" />,
                  onClick: () => handleToggleEnabled(item, !item.isEnabled),
                },
                {
                  label: t('common.delete', 'Delete'),
                  icon: <FiTrash2 className="w-4 h-4" />,
                  className: 'text-red-600',
                  onClick: () => handleDelete(item),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [handleToggleEnabled, navigateToCreateWithParent, navigateToEdit, handleDelete],
  );

  return (
    <div className={className}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => listQuery.refetch()}
            isLoading={listQuery.isRefetching}
            startIcon={<FiRefreshCw className="h-4 w-4" />}
          >
            {t('sections.manager.refresh', 'Refresh')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={navigateToCreate} startIcon={<FiPlus className="h-4 w-4" />}>
            {t('componentConfigs.newComponent', 'New component')}
          </Button>
        </div>
      </div>

      <StatisticsGrid statistics={statisticsCards} isLoading={listQuery.isLoading} />

      {showFilters && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{t('componentConfigs.filters', 'Filters')}</p>
              <p className="text-xs text-neutral-500">{activeFilterCount} {t('componentConfigs.active', 'active')}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0}>
              {t('componentConfigs.resetFilters', 'Reset filters')}
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Input
              placeholder={t('componentConfigs.searchPlaceholder', 'Search by name, key, or description')}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <Select
              label={t('componentConfigs.category', 'Category')}
              value={filters.category}
              options={categoryFilterOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, category: value as FiltersState['category'] }))}
              size="sm"
            />
            <Select
              label={t('componentConfigs.structure', 'Structure')}
              value={filters.structure}
              options={typeFilterOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, structure: value as FiltersState['structure'] }))}
              size="sm"
            />
            <Select
              label={t('componentConfigs.status', 'Status')}
              value={filters.status}
              options={statusFilterOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: (value as StatusFilter) ?? 'all' }))}
              size="sm"
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <Table<ComponentTableRow>
          tableId="component-configs-table"
          columns={columns}
          data={paginatedRows}
          isLoading={listQuery.isLoading}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => setShowFilters((prev) => !prev)}
          isFilterActive={showFilters || activeFilterCount > 0}
          searchPlaceholder={t('componentConfigs.searchPlaceholder', 'Search components...')}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          sortDescriptor={sortDescriptor}
          onSortChange={(descriptor) => setSortDescriptor(descriptor)}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleItemsPerPageChange,
          }}
          rowProps={(item) => ({
            className: item.isEnabled ? undefined : 'opacity-60 bg-neutral-50',
          })}
          enableRowHover
          emptyMessage={t('componentConfigs.noComponentsFound', 'No component configurations found')}
          emptyAction={{
            label: t('componentConfigs.createComponent', 'Create component'),
            onClick: navigateToCreate,
            icon: <FiPlus />,
          }}
        />
      </div>
    </div>
  );
};

export default ComponentConfigsManager;
