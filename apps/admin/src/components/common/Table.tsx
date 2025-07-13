import clsx from 'clsx';
import React, { useEffect, useMemo, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Loading } from './Loading';

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="rounded-r-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="rounded-l-none"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export type SortDirection = 'asc' | 'desc';

export interface SortDescriptor<T> {
  columnAccessor: keyof T;
  direction: SortDirection;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  className?: string;
  isSortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  sortDescriptor?: SortDescriptor<T>;
  onSortChange?: (descriptor: SortDescriptor<T>) => void;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  pagination,
  emptyMessage = 'No data available',
  className,
  onRowClick,
  sortDescriptor,
  onSortChange,
  selectedIds,
  onSelectionChange,
}: TableProps<T>) {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const renderCell = (item: T, column: Column<T>, index: number) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item, index);
    }
    return (item as any)[column.accessor];
  };

  const isSelectable = !!onSelectionChange;

  const allItemIdsOnPage = useMemo(
    () => new Set(data.map((item) => item.id)),
    [data]
  );
  const selectedIdsOnPage = useMemo(() => {
    if (!selectedIds) return new Set();
    return new Set([...selectedIds].filter((id) => allItemIdsOnPage.has(id)));
  }, [selectedIds, allItemIdsOnPage]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedIdsOnPage.size > 0 &&
        selectedIdsOnPage.size < allItemIdsOnPage.size;
    }
  }, [selectedIdsOnPage, allItemIdsOnPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedIds = new Set([...(selectedIds || []), ...allItemIdsOnPage]);
      onSelectionChange?.(newSelectedIds);
    } else {
      const newSelectedIds = new Set(
        [...(selectedIds || [])].filter((id) => !allItemIdsOnPage.has(id))
      );
      onSelectionChange?.(newSelectedIds);
    }
  };

  const handleRowSelect = (item: T, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(item.id);
    } else {
      newSelectedIds.delete(item.id);
    }
    onSelectionChange?.(newSelectedIds);
  };

  const handleSort = (columnAccessor: keyof T) => {
    if (!onSortChange) return;

    const newDirection =
      sortDescriptor?.columnAccessor === columnAccessor &&
      sortDescriptor.direction === 'asc'
        ? 'desc'
        : 'asc';

    onSortChange({ columnAccessor, direction: newDirection });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    item: T
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onRowClick?.(item);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loading />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="text-center p-8">
        <p>{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className={clsx(className)}>
      <div className="overflow-x-auto overflow-y-auto" style={{ height: '70vh' }}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {isSelectable && (
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input
                      id="checkbox-all"
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={
                        allItemIdsOnPage.size > 0 &&
                        selectedIdsOnPage.size === allItemIdsOnPage.size
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <label htmlFor="checkbox-all" className="sr-only">
                      checkbox
                    </label>
                  </div>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.header}
                  scope="col"
                  className={clsx(
                    'px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 tracking-wide',
                    col.isSortable &&
                      onSortChange &&
                      typeof col.accessor === 'string' &&
                      'cursor-pointer select-none'
                  )}
                  onClick={() =>
                    col.isSortable &&
                    onSortChange &&
                    typeof col.accessor === 'string' &&
                    handleSort(col.accessor as keyof T)
                  }
                >
                  <div className="flex items-center">
                    <span>{col.header}</span>
                    {sortDescriptor &&
                      typeof col.accessor === 'string' &&
                      sortDescriptor.columnAccessor === col.accessor && (
                        <span className="ml-1">
                          {sortDescriptor.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                tabIndex={onRowClick ? 0 : undefined}
                className={clsx(
                  'transition-colors duration-150 ease-in-out',
                  onRowClick && 'cursor-pointer',
                  {
                    'bg-sky-100 dark:bg-sky-900/50': selectedIds?.has(item.id),
                    'odd:bg-white even:bg-gray-50/50 dark:odd:bg-gray-900 dark:even:bg-gray-800/50':
                      !selectedIds?.has(item.id),
                    'hover:bg-sky-200/70 dark:hover:bg-sky-800/60':
                      onRowClick && selectedIds?.has(item.id),
                    'hover:bg-gray-100 dark:hover:bg-gray-800':
                      onRowClick && !selectedIds?.has(item.id),
                  }
                )}
              >
                {isSelectable && (
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                      <input
                        id={`checkbox-${item.id}`}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        checked={selectedIds?.has(item.id) ?? false}
                        onChange={(e) => handleRowSelect(item, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`checkbox-${item.id}`}
                        className="sr-only"
                      >
                        checkbox
                      </label>
                    </div>
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={`${item.id}-${col.header}`}
                    className={clsx(
                      'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200',
                      col.className
                    )}
                  >
                    {renderCell(item, col, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <Pagination {...pagination} />
        </div>
      )}
    </Card>
  );
} 