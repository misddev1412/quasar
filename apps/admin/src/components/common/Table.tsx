import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Loading } from './Loading';

// Enhanced Icons for Table
const SortIcon = ({ direction, isActive }: { direction?: 'asc' | 'desc'; isActive: boolean }) => (
  <div className="flex flex-col ml-2">
    <svg
      className={clsx(
        'w-3 h-3 transition-colors duration-200',
        isActive && direction === 'asc'
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-400 dark:text-gray-500'
      )}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
    <svg
      className={clsx(
        'w-3 h-3 -mt-1 transition-colors duration-200',
        isActive && direction === 'desc'
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-400 dark:text-gray-500'
      )}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </div>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
);

// Enhanced Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
        </div>
      )}

      {/* Page info */}
      {totalItems && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-2"
        >
          Previous
        </Button>

        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="px-3 py-2 min-w-[40px]"
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-2"
        >
          Next
        </Button>
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

// Enhanced Search and Filter component
const TableToolbar = ({
  searchValue,
  onSearchChange,
  onFilterClick,
  selectedCount,
  onBulkAction,
  showSearch = true,
  showFilter = true,
  bulkActions = [],
}: {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  selectedCount?: number;
  onBulkAction?: (action: string) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  bulkActions?: Array<{ label: string; value: string; variant?: 'primary' | 'danger' }>;
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        {showSearch && onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        )}

        {/* Filter */}
        {showFilter && onFilterClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            startIcon={<FilterIcon className="w-4 h-4" />}
          >
            Filter
          </Button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCount && selectedCount > 0 && bulkActions.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {selectedCount} selected
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.value}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => onBulkAction?.(action.value)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton Loading component
const TableSkeleton = ({ columns, rows = 5 }: { columns: number; rows?: number }) => (
  <div className="animate-pulse">
    <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  };
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  onRowClick?: (item: T) => void;
  sortDescriptor?: SortDescriptor<T>;
  onSortChange?: (descriptor: SortDescriptor<T>) => void;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  // Enhanced features
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  showSearch?: boolean;
  showFilter?: boolean;
  bulkActions?: Array<{ label: string; value: string; variant?: 'primary' | 'danger' }>;
  onBulkAction?: (action: string) => void;
  stickyHeader?: boolean;
  maxHeight?: string;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  pagination,
  emptyMessage = 'No data available',
  emptyAction,
  className,
  onRowClick,
  sortDescriptor,
  onSortChange,
  selectedIds,
  onSelectionChange,
  searchValue,
  onSearchChange,
  onFilterClick,
  showSearch = true,
  showFilter = true,
  bulkActions = [],
  onBulkAction,
  stickyHeader = true,
  maxHeight = '70vh',
}: TableProps<T>) {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);

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

  const handleSort = useCallback((columnAccessor: keyof T) => {
    if (!onSortChange) return;

    const newDirection =
      sortDescriptor?.columnAccessor === columnAccessor &&
      sortDescriptor.direction === 'asc'
        ? 'desc'
        : 'asc';

    onSortChange({ columnAccessor, direction: newDirection });
  }, [onSortChange, sortDescriptor]);

  const handleKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLTableRowElement>,
    item: T
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(item);
    }
  }, [onRowClick]);

  const handleRowHover = useCallback((itemId: string | number | null) => {
    setHoveredRow(itemId);
  }, []);

  // Enhanced row styling
  const getRowClassName = useCallback((item: T) => {
    const isSelected = selectedIds?.has(item.id);
    const isHovered = hoveredRow === item.id;

    return clsx(
      'group transition-all duration-200 ease-in-out',
      onRowClick && 'cursor-pointer',
      {
        // Selected state
        'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500': isSelected,
        // Hover state
        'hover:bg-gray-50 dark:hover:bg-gray-800/50': onRowClick && !isSelected,
        'hover:bg-blue-100 dark:hover:bg-blue-900/30': onRowClick && isSelected,
        // Default state
        'bg-white dark:bg-gray-900': !isSelected && !isHovered,
        // Transform on hover for better interaction feedback
        'hover:shadow-sm': onRowClick,
      }
    );
  }, [selectedIds, hoveredRow, onRowClick]);

  // Enhanced loading state with skeleton
  if (isLoading) {
    return (
      <Card className={clsx(className)}>
        {(showSearch || showFilter) && (
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onFilterClick={onFilterClick}
            showSearch={showSearch}
            showFilter={showFilter}
            bulkActions={[]}
          />
        )}
        <TableSkeleton columns={columns.length + (onSelectionChange ? 1 : 0)} />
      </Card>
    );
  }

  // Enhanced empty state
  if (!data || data.length === 0) {
    return (
      <Card className={clsx(className)}>
        {(showSearch || showFilter) && (
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onFilterClick={onFilterClick}
            showSearch={showSearch}
            showFilter={showFilter}
            bulkActions={[]}
          />
        )}
        <div className="text-center py-16 px-6">
          <div className="mx-auto w-24 h-24 mb-6 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No data found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {emptyMessage}
          </p>
          {emptyAction && (
            <Button onClick={emptyAction.onClick} variant="primary">
              {emptyAction.label}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={clsx('overflow-hidden', className)}>
      {/* Enhanced Toolbar */}
      {(showSearch || showFilter || (selectedIds && selectedIds.size > 0)) && (
        <TableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onFilterClick={onFilterClick}
          selectedCount={selectedIds?.size}
          onBulkAction={onBulkAction}
          showSearch={showSearch}
          showFilter={showFilter}
          bulkActions={bulkActions}
        />
      )}

      {/* Table Container */}
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: maxHeight }}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Enhanced Header */}
          <thead className={clsx(
            'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
            stickyHeader && 'sticky top-0 z-20'
          )}>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              {isSelectable && (
                <th scope="col" className="relative w-12 px-6 py-4">
                  <div className="flex items-center justify-center">
                    <input
                      id="checkbox-all"
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2 transition-colors duration-200"
                      checked={
                        allItemIdsOnPage.size > 0 &&
                        selectedIdsOnPage.size === allItemIdsOnPage.size
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </div>
                </th>
              )}
              {columns.map((col) => {
                const isSortable = col.isSortable && onSortChange && typeof col.accessor === 'string';
                const isCurrentSort = sortDescriptor && typeof col.accessor === 'string' && sortDescriptor.columnAccessor === col.accessor;

                return (
                  <th
                    key={col.header}
                    scope="col"
                    className={clsx(
                      'px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider',
                      isSortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200',
                      col.className
                    )}
                    onClick={() => isSortable && handleSort(col.accessor as keyof T)}
                    role={isSortable ? 'button' : undefined}
                    tabIndex={isSortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(col.accessor as keyof T);
                      }
                    }}
                    aria-sort={
                      isCurrentSort
                        ? sortDescriptor.direction === 'asc' ? 'ascending' : 'descending'
                        : isSortable ? 'none' : undefined
                    }
                  >
                    <div className="flex items-center justify-between group">
                      <span className="font-medium">{col.header}</span>
                      {isSortable && (
                        <SortIcon
                          direction={isCurrentSort ? sortDescriptor.direction : undefined}
                          isActive={!!isCurrentSort}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          {/* Enhanced Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                onMouseEnter={() => handleRowHover(item.id)}
                onMouseLeave={() => handleRowHover(null)}
                tabIndex={onRowClick ? 0 : undefined}
                className={getRowClassName(item)}
                role={onRowClick ? 'button' : undefined}
                aria-selected={selectedIds?.has(item.id)}
              >
                {isSelectable && (
                  <td className="relative w-12 px-6 py-4">
                    <div className="flex items-center justify-center">
                      <input
                        id={`checkbox-${item.id}`}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2 transition-colors duration-200"
                        checked={selectedIds?.has(item.id) ?? false}
                        onChange={(e) => handleRowSelect(item, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${index + 1}`}
                      />
                    </div>
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td
                    key={`${item.id}-${col.header}`}
                    className={clsx(
                      'px-6 py-4 text-sm text-gray-900 dark:text-gray-100',
                      colIndex === 0 && 'font-medium', // First column is typically more important
                      col.className
                    )}
                  >
                    <div className="flex items-center">
                      {renderCell(item, col, index)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination {...pagination} />
      )}
    </Card>
  );
}