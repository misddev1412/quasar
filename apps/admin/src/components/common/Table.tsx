import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Dropdown } from './Dropdown';
import { Select } from './Select';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { TABLE_CONFIG, getPageSizeOptions, type PageSizeOption } from '../../config/table.config';

/**
 * Utility function to format datetime values for table display
 * Supports multiple languages including Vietnamese
 */
const formatDateTime = (
  value: any, 
  locale: string = 'en', 
  t?: (key: string, options?: any) => string
): { formatted: string; raw: string } | null => {
  if (!value) return null;
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    let formatted: string;
    const isVietnamese = locale === 'vi';
    
    if (diffInDays === 0) {
      // Today - show relative time
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      if (diffInHours === 0) {
        if (diffInMinutes <= 0) {
          formatted = isVietnamese ? 'Vừa xong' : 'Just now';
        } else if (diffInMinutes === 1) {
          formatted = isVietnamese ? '1 phút trước' : '1 minute ago';
        } else {
          formatted = isVietnamese ? `${diffInMinutes} phút trước` : `${diffInMinutes} minutes ago`;
        }
      } else if (diffInHours === 1) {
        formatted = isVietnamese ? '1 giờ trước' : '1 hour ago';
      } else {
        formatted = isVietnamese ? `${diffInHours} giờ trước` : `${diffInHours} hours ago`;
      }
    } else if (diffInDays === 1) {
      formatted = isVietnamese ? 'Hôm qua' : 'Yesterday';
    } else if (diffInDays <= 7) {
      formatted = isVietnamese ? `${diffInDays} ngày trước` : `${diffInDays} days ago`;
    } else {
      // More than a week - show formatted date with proper locale
      if (isVietnamese) {
        // Vietnamese date format: "15 tháng 1, 2024"
        formatted = date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        // English date format: "Jan 15, 2024"
        formatted = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    
    const raw = date.toISOString();
    return { formatted, raw };
  } catch {
    return null;
  }
};

/**
 * Component for displaying formatted datetime with raw value
 * Automatically detects current language and formats accordingly
 */
const DateTimeDisplay = memo(({ value }: { value: any }) => {
  const { i18n, t } = useTranslationWithBackend();
  const currentLocale = i18n.resolvedLanguage || 'en';
  const dateInfo = formatDateTime(value, currentLocale, t);
  
  if (!dateInfo) {
    return <span className="text-gray-400 dark:text-gray-500">—</span>;
  }
  
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
        {dateInfo.formatted}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {dateInfo.raw}
      </span>
    </div>
  );
});

DateTimeDisplay.displayName = 'DateTimeDisplay';

/**
 * Professional Table Component Icons
 * Optimized for accessibility and visual clarity
 */

/** Sort direction indicator with enhanced visual feedback */
const SortIcon = memo(({ direction, isActive, t }: { direction?: 'asc' | 'desc'; isActive: boolean; t: (key: string) => string }) => (
  <div className="flex flex-col ml-2 transition-all duration-200" role="img" aria-hidden="true">
    <svg
      className={clsx(
        'w-3 h-3 transition-all duration-200',
        isActive && direction === 'asc'
          ? 'text-blue-600 dark:text-blue-400 scale-110'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
      )}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-label={isActive && direction === 'asc' ? t('table.sorting.sorted_ascending') : t('table.sorting.sort_ascending')}
    >
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
    <svg
      className={clsx(
        'w-3 h-3 -mt-1 transition-all duration-200',
        isActive && direction === 'desc'
          ? 'text-blue-600 dark:text-blue-400 scale-110'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
      )}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-label={isActive && direction === 'desc' ? t('table.sorting.sorted_descending') : t('table.sorting.sort_descending')}
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </div>
));

SortIcon.displayName = 'SortIcon';

/** Search icon with enhanced visibility and consistent styling */
const SearchIcon = memo(({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
));

SearchIcon.displayName = 'SearchIcon';

/** Filter icon with consistent styling */
const FilterIcon = memo(({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
));

FilterIcon.displayName = 'FilterIcon';

/** Column visibility icon with consistent styling */
const ColumnVisibilityIcon = memo(({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
));

ColumnVisibilityIcon.displayName = 'ColumnVisibilityIcon';

/** Empty state icon */
const EmptyIcon = memo(({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
));

EmptyIcon.displayName = 'EmptyIcon';

/**
 * Professional Pagination Component
 * Features: Accessible navigation, responsive design, customizable page sizes
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: PageSizeOption[];
}

const Pagination = memo(({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions,
}: PaginationProps) => {
  const { t } = useTranslationWithBackend();
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageSizeChange = useCallback((newPageSize: string) => {
    const size = parseInt(newPageSize, 10);
    if (onItemsPerPageChange && !isNaN(size)) {
      onItemsPerPageChange(size);
    }
  }, [onItemsPerPageChange]);

  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
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
  }, [currentPage, totalPages]);

  const startItem = useMemo(() =>
    totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : 0,
    [currentPage, itemsPerPage, totalItems]
  );

  const endItem = useMemo(() =>
    totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : 0,
    [currentPage, itemsPerPage, totalItems]
  );

  // Page size options for the selector with translations
  const translatedPageSizeOptions = useMemo(() => {
    const options = getPageSizeOptions(pageSizeOptions);
    return options.map(option => ({
      value: option.value,
      label: t(option.labelKey)
    }));
  }, [pageSizeOptions, t]);

  const handleItemsPerPageChange = useCallback((value: number) => {
    onItemsPerPageChange?.(value);
  }, [onItemsPerPageChange]);

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
      aria-label={t('table.accessibility.table_pagination')}
    >
      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('table.pagination.show')}</span>
          <Select
            value={String(itemsPerPage || TABLE_CONFIG.DEFAULT_PAGE_SIZE)}
            onChange={handlePageSizeChange}
            options={translatedPageSizeOptions}
            size="sm"
            className="w-auto min-w-[120px]"
            aria-label={t('table.pagination.show')}
          />
        </div>
      )}

      {/* Page info */}
      {!!totalItems && (
        <div className="text-sm text-gray-700 dark:text-gray-300" role="status" aria-live="polite">
          {t('table.pagination.showing')} <span className="font-medium">{startItem}</span> {t('table.pagination.to')}{' '}
          <span className="font-medium">{endItem}</span> {t('table.pagination.of')}{' '}
          <span className="font-medium">{totalItems}</span> {t('table.pagination.results')}
        </div>
      )}

      {/* Page navigation */}
      <div className="flex items-center gap-1" role="navigation" aria-label={t('table.pagination.page')}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3"
          aria-label={t('table.pagination.go_to_previous_page')}
        >
          {t('table.pagination.previous')}
        </Button>

        {getPageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500" aria-hidden="true">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="px-3 min-w-[40px]"
                aria-label={t('table.pagination.go_to_page', { page })}
                aria-current={currentPage === page ? 'page' : undefined}
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
          className="px-3"
          aria-label={t('table.pagination.go_to_next_page')}
        >
          {t('table.pagination.next')}
        </Button>
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

/**
 * Type Definitions for Professional Table Component
 */

export type SortDirection = 'asc' | 'desc';

export interface SortDescriptor<T> {
  columnAccessor: keyof T;
  direction: SortDirection;
}

export interface Column<T> {
  /** Unique column identifier for visibility control */
  id?: string;
  /** Column header text */
  header: string;
  /** Data accessor - can be a key or render function */
  accessor: keyof T | ((item: T, index: number) => React.ReactNode);
  /** Optional custom renderer when using key accessor */
  render?: (value: T[keyof T], item: T, index: number) => React.ReactNode;
  /** Additional CSS classes for the column */
  className?: string;
  /** Whether this column can be sorted */
  isSortable?: boolean;
  /** Column width (CSS value) */
  width?: string;
  /** Minimum column width (CSS value) */
  minWidth?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether this column can be hidden (default: true) */
  hideable?: boolean;
  /** Column type for special formatting */
  type?: 'text' | 'datetime' | 'number' | 'boolean';
}

export interface BulkAction {
  /** Action label */
  label: string;
  /** Action value/identifier */
  value: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  /** Action icon */
  icon?: React.ReactNode;
}

/**
 * Professional Table Toolbar Component
 * Features: Search, filters, bulk actions, column visibility with enhanced UX
 */
interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  selectedCount?: number;
  onBulkAction?: (action: string) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  bulkActions?: BulkAction[];
  searchPlaceholder?: string;
  // Column visibility props
  columns?: Array<{ id: string; header: string; hideable?: boolean }>;
  visibleColumns?: Set<string>;
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  showColumnVisibility?: boolean;
}

const TableToolbar = memo(({
  searchValue,
  onSearchChange,
  onFilterClick,
  isFilterActive = false,
  selectedCount,
  onBulkAction,
  showSearch = true,
  showFilter = true,
  bulkActions = [],
  searchPlaceholder,
  columns = [],
  visibleColumns,
  onColumnVisibilityChange,
  showColumnVisibility = true,
}: TableToolbarProps) => {
  const { t } = useTranslationWithBackend();
  // Local state for immediate UI updates
  const [localSearchValue, setLocalSearchValue] = useState(searchValue || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when external searchValue changes
  useEffect(() => {
    setLocalSearchValue(searchValue || '');
  }, [searchValue]);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setLocalSearchValue(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced callback
    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 400); // 400ms debounce delay
  }, [onSearchChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleBulkActionClick = useCallback((actionValue: string) => {
    onBulkAction?.(actionValue);
  }, [onBulkAction]);

  // Column visibility dropdown items
  const columnVisibilityItems = useMemo(() => {
    return columns
      .filter(col => col.hideable !== false)
      .map(col => ({
        label: col.header,
        onClick: () => onColumnVisibilityChange?.(col.id, !visibleColumns?.has(col.id)),
        icon: (
          <input
            type="checkbox"
            checked={visibleColumns?.has(col.id) ?? true}
            onChange={() => {}} // Handled by onClick
            className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        className: 'hover:bg-gray-50 dark:hover:bg-gray-700',
      }));
  }, [columns, visibleColumns, onColumnVisibilityChange]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
        {/* Enhanced Search - Always show if onSearchChange is provided */}
        {/* Spacing: Icon at 12px, Icon width 16px, Icon ends at 28px, Text starts at 60px = 32px clear gap */}
        {onSearchChange && (
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <SearchIcon
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none z-10"
              style={{ left: '12px' }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder || t('table.search_placeholder')}
              value={localSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="table-search-input w-full h-10 pl-11 pr-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 text-sm"
              aria-label={t('table.toolbar.search')}
            />
          </div>
        )}

        {/* Enhanced Filter */}
        {showFilter && onFilterClick && (
          <Button
            variant={isFilterActive ? "primary" : "outline"}
            size="sm"
            onClick={onFilterClick}
            startIcon={<FilterIcon className={`w-4 h-4 ${isFilterActive ? 'text-white' : ''}`} />}
            className={`whitespace-nowrap flex-shrink-0 w-auto sm:w-auto transition-all duration-200 ${
              isFilterActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md'
                : ''
            }`}
            aria-label={isFilterActive ? t('table.toolbar.close_filters') : t('table.toolbar.open_filters')}
          >
            {t('table.toolbar.filter')}
          </Button>
        )}

        {/* Column Visibility Selector */}
        {showColumnVisibility && onColumnVisibilityChange && columnVisibilityItems.length > 0 && (
          <Dropdown
            button={
              <Button
                variant="outline"
                size="sm"
                startIcon={<ColumnVisibilityIcon className="w-4 h-4" />}
                className="whitespace-nowrap flex-shrink-0 w-auto sm:w-auto"
                aria-label={t('table.toolbar.toggle_column_visibility')}
              >
                {t('table.toolbar.columns')}
              </Button>
            }
            items={columnVisibilityItems}
            menuClassName="w-56"
          />
        )}
      </div>
    </div>
  );
});

TableToolbar.displayName = 'TableToolbar';

/**
 * Professional Loading Skeleton Component
 * Provides visual feedback during data loading
 */
interface TableSkeletonProps {
  columns: number;
  rows?: number;
  hasSelection?: boolean;
}

const TableSkeleton = memo(({ columns, rows = 5, hasSelection = false }: TableSkeletonProps) => {
  const { t } = useTranslationWithBackend();

  return (
  <div className="animate-pulse" role="status" aria-label={t('table.accessibility.loading_table')}>
    {/* Header skeleton */}
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
      <div className="flex gap-4">
        {hasSelection && (
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        )}
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        ))}
      </div>
    </div>

    {/* Body skeleton */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex gap-4 items-center">
          {hasSelection && (
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          )}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={clsx(
                "bg-gray-200 dark:bg-gray-700 rounded flex-1",
                colIndex === 0 ? "h-5" : "h-4" // First column slightly taller
              )}
              style={{
                width: `${Math.random() * 40 + 60}%` // Varied widths for realism
              }}
            />
          ))}
        </div>
      </div>
    ))}

    <span className="sr-only">{t('table.loading')}</span>
  </div>
  );
});

TableSkeleton.displayName = 'TableSkeleton';

/**
 * Professional Table Component Props
 * Comprehensive interface for enterprise-grade data tables
 */
export interface TableProps<T> {
  /** Table data array */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Pagination configuration */
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    pageSizeOptions?: PageSizeOption[];
  };
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action button */
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Additional CSS classes */
  className?: string;
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Current sort configuration */
  sortDescriptor?: SortDescriptor<T>;
  /** Sort change handler */
  onSortChange?: (descriptor: SortDescriptor<T>) => void;
  /** Selected row IDs */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;

  // Enhanced features
  /** Search input value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Filter button click handler */
  onFilterClick?: () => void;
  /** Whether the filter panel is currently active/expanded */
  isFilterActive?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Show filter button */
  showFilter?: boolean;
  /** Bulk action definitions */
  bulkActions?: BulkAction[];
  /** Bulk action handler */
  onBulkAction?: (action: string) => void;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Maximum table height */
  maxHeight?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Enable row hover effects */
  enableRowHover?: boolean;
  /** Table density */
  density?: 'compact' | 'normal' | 'comfortable';
  /** Column visibility control */
  visibleColumns?: Set<string>;
  /** Column visibility change handler */
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  /** Show column visibility selector */
  showColumnVisibility?: boolean;
  /** Table identifier for preferences persistence */
  tableId?: string;
  /** Optional row-level props (e.g., drag and drop handlers) */
  rowProps?: (item: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

/**
 * Professional Table Component
 *
 * A comprehensive, accessible, and performant data table component
 * designed for enterprise applications with modern UX patterns.
 *
 * Features:
 * - Full accessibility support (ARIA, keyboard navigation)
 * - Responsive design with mobile-first approach
 * - Advanced sorting, filtering, and search capabilities
 * - Bulk actions with intuitive selection
 * - Professional loading states and empty states
 * - Dark mode support
 * - Customizable styling and behavior
 *
 * @example
 * ```tsx
 * <Table
 *   data={users}
 *   columns={columns}
 *   onRowClick={handleRowClick}
 *   selectedIds={selectedIds}
 *   onSelectionChange={setSelectedIds}
 *   bulkActions={bulkActions}
 *   pagination={paginationConfig}
 * />
 * ```
 */
export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  pagination,
  emptyMessage,
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
  isFilterActive = false,
  showSearch = true,
  showFilter = true,
  bulkActions = [],
  onBulkAction,
  stickyHeader = true,
  maxHeight = TABLE_CONFIG.DEFAULT_MAX_HEIGHT,
  searchPlaceholder,
  enableRowHover = true,
  density = TABLE_CONFIG.DEFAULT_DENSITY,
  visibleColumns,
  onColumnVisibilityChange,
  showColumnVisibility = true,
  tableId,
  rowProps,
}: TableProps<T>) {
  const { t } = useTranslationWithBackend();
  // Refs and state
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);

  // Memoized values
  const isSelectable = useMemo(() => !!onSelectionChange, [onSelectionChange]);

  // Generate column IDs if not provided and filter visible columns
  const columnsWithIds = useMemo(() => {
    return columns.map((col, index) => ({
      ...col,
      id: col.id || `column-${index}`,
    }));
  }, [columns]);

  // Filter visible columns based on visibility state
  const visibleColumnsFiltered = useMemo(() => {
    if (!visibleColumns || !onColumnVisibilityChange) {
      return columnsWithIds;
    }
    // Always include non-hideable columns (e.g., Actions) regardless of preferences
    return columnsWithIds.filter(col => (col.hideable === false) || visibleColumns.has(col.id));
  }, [columnsWithIds, visibleColumns, onColumnVisibilityChange]);

  // Prepare column data for toolbar
  const toolbarColumns = useMemo(() => {
    return columnsWithIds.map(col => ({
      id: col.id,
      header: col.header,
      hideable: col.hideable,
    }));
  }, [columnsWithIds]);

  const densityClasses = useMemo(() => {
    switch (density) {
      case 'compact':
        return { cell: 'px-4 py-2', header: 'px-4 py-3' };
      case 'comfortable':
        return { cell: 'px-6 py-5', header: 'px-6 py-5' };
      default:
        return { cell: 'px-6 py-4', header: 'px-6 py-4' };
    }
  }, [density]);

  // Enhanced cell renderer with proper typing
  const renderCell = useCallback((item: T, column: Column<T>, index: number): React.ReactNode => {
    try {
      if (typeof column.accessor === 'function') {
        return column.accessor(item, index);
      }

      const value = item[column.accessor as keyof T];

      // Handle null/undefined values gracefully
      if (value === null || value === undefined) {
        return <span className="text-gray-400 dark:text-gray-500">—</span>;
      }

      if (column.render) {
        return column.render(value, item, index);
      }

      // Handle datetime formatting
      if (column.type === 'datetime') {
        return <DateTimeDisplay value={value} />;
      }

      return String(value);
    } catch (error) {
      console.warn('Error rendering table cell:', error);
      return <span className="text-red-500">Error</span>;
    }
  }, []);

  // Selection logic with performance optimization
  const allItemIdsOnPage = useMemo(
    () => new Set(data.map((item) => item.id)),
    [data]
  );

  const selectedIdsOnPage = useMemo(() => {
    if (!selectedIds || selectedIds.size === 0) return new Set();
    return new Set([...selectedIds].filter((id) => allItemIdsOnPage.has(id)));
  }, [selectedIds, allItemIdsOnPage]);

  // Enhanced checkbox indeterminate state management
  useEffect(() => {
    if (selectAllCheckboxRef.current && isSelectable) {
      const isIndeterminate = selectedIdsOnPage.size > 0 && selectedIdsOnPage.size < allItemIdsOnPage.size;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedIdsOnPage, allItemIdsOnPage, isSelectable]);

  // Optimized selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      // Add all current page items to selection
      const newSelectedIds = new Set([...(selectedIds || []), ...allItemIdsOnPage]);
      onSelectionChange(newSelectedIds);
    } else {
      // Remove all current page items from selection
      const newSelectedIds = new Set(
        [...(selectedIds || [])].filter((id) => !allItemIdsOnPage.has(id))
      );
      onSelectionChange(newSelectedIds);
    }
  }, [onSelectionChange, selectedIds, allItemIdsOnPage]);

  const handleRowSelect = useCallback((item: T, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(item.id);
    } else {
      newSelectedIds.delete(item.id);
    }
    onSelectionChange(newSelectedIds);
  }, [onSelectionChange, selectedIds]);

  // Enhanced sort handler with better UX
  const handleSort = useCallback((columnAccessor: keyof T) => {
    if (!onSortChange) return;

    const newDirection: SortDirection =
      sortDescriptor?.columnAccessor === columnAccessor &&
      sortDescriptor.direction === 'asc'
        ? 'desc'
        : 'asc';

    onSortChange({ columnAccessor, direction: newDirection });
  }, [onSortChange, sortDescriptor]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLTableRowElement>,
    item: T
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(item);
    }
    // Add escape key to clear selection
    if (event.key === 'Escape' && selectedIds?.has(item.id)) {
      handleRowSelect(item, false);
    }
  }, [onRowClick, selectedIds, handleRowSelect]);

  // Optimized hover handler
  const handleRowHover = useCallback((itemId: string | number | null) => {
    if (enableRowHover) {
      setHoveredRow(itemId);
    }
  }, [enableRowHover]);

  // Professional row styling with subtle visual hierarchy
  const getRowClassName = useCallback((item: T) => {
    const isSelected = selectedIds?.has(item.id);
    const isHovered = enableRowHover && hoveredRow === item.id;

    return clsx(
      'group transition-all duration-200 ease-in-out',
      onRowClick && 'cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
      {
        // Selected state with professional blue accent
        'bg-blue-50/80 dark:bg-blue-900/20 shadow-sm': isSelected,
        // Hover state with subtle elevation
        'hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:shadow-sm':
          onRowClick && !isSelected && enableRowHover,
        'hover:bg-blue-100/80 dark:hover:bg-blue-900/30 hover:shadow-md':
          onRowClick && isSelected && enableRowHover,
        // Default state
        'bg-white dark:bg-gray-900': !isSelected,
      }
    );
  }, [selectedIds, hoveredRow, onRowClick, enableRowHover]);

  // Professional loading state with enhanced skeleton
  if (isLoading) {
    return (
      <Card className={clsx('overflow-hidden', className)}>
        {(onSearchChange || onFilterClick || showColumnVisibility) && (
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onFilterClick={onFilterClick}
            isFilterActive={isFilterActive}
            showSearch={showSearch}
            showFilter={showFilter}
            bulkActions={[]}
            searchPlaceholder={searchPlaceholder}
            columns={toolbarColumns}
            visibleColumns={visibleColumns}
            onColumnVisibilityChange={onColumnVisibilityChange}
            showColumnVisibility={showColumnVisibility}
          />
        )}
        <TableSkeleton
          columns={visibleColumnsFiltered.length}
          hasSelection={isSelectable}
          rows={pagination?.itemsPerPage || TABLE_CONFIG.DEFAULT_PAGE_SIZE}
        />
      </Card>
    );
  }

  // Professional empty state with enhanced UX
  if (!data || data.length === 0) {
    return (
      <Card className={clsx('overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700', className)}>
        {(onSearchChange || onFilterClick || showColumnVisibility) && (
          <TableToolbar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onFilterClick={onFilterClick}
            isFilterActive={isFilterActive}
            showSearch={showSearch}
            showFilter={showFilter}
            bulkActions={[]}
            searchPlaceholder={searchPlaceholder}
            columns={toolbarColumns}
            visibleColumns={visibleColumns}
            onColumnVisibilityChange={onColumnVisibilityChange}
            showColumnVisibility={showColumnVisibility}
          />
        )}

        {/* Enhanced Table Container with Empty State */}
        <div
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: maxHeight }}
          role="region"
          aria-label={t('table.accessibility.table_region')}
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
            {/* Table Header */}
            <thead className={clsx(
              'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
              stickyHeader && 'sticky top-0 z-20 shadow-sm'
            )}>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                {isSelectable && (
                  <th scope="col" className={clsx("relative w-12", densityClasses.header)}>
                    <div className="flex items-center justify-center">
                      <input
                        id="checkbox-all"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2 transition-colors duration-200"
                        disabled
                        aria-label={t('table.selection.select_all', { count: 0 })}
                      />
                    </div>
                  </th>
                )}
                {visibleColumnsFiltered.map((col, colIndex) => (
                  <th
                    key={`${col.header}-${colIndex}`}
                    scope="col"
                    className={clsx(
                      densityClasses.header,
                      'text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                    style={{
                      width: col.width,
                      minWidth: col.minWidth,
                    }}
                  >
                    <div className={clsx(
                      "flex items-center group",
                      col.align === 'center' && 'justify-center',
                      col.align === 'right' && 'justify-end',
                      !col.align && 'justify-between'
                    )}>
                      <span className="font-medium">{col.header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Empty State Body */}
            <tbody className="bg-white dark:bg-gray-900">
              <tr>
                <td colSpan={visibleColumnsFiltered.length + (isSelectable ? 1 : 0)} className="p-0">
                  <div className="flex items-center justify-center min-h-[400px] py-20 px-6">
                    <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
                      <div className="w-20 h-20 mb-6 text-gray-300 dark:text-gray-600">
                        <EmptyIcon className="w-full h-full" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        {t('table.empty_state.title')}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
                        {emptyMessage || t('table.empty_state.message')}
                      </p>
                      {emptyAction && (
                        <Button
                          onClick={emptyAction.onClick}
                          variant="primary"
                          startIcon={emptyAction.icon}
                          className="shadow-sm"
                        >
                          {emptyAction.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  // Main table render
  return (
    <Card className={clsx('overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Professional Toolbar */}
      {(onSearchChange || onFilterClick || showColumnVisibility || (selectedIds && selectedIds.size > 0)) && (
        <TableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onFilterClick={onFilterClick}
          isFilterActive={isFilterActive}
          selectedCount={selectedIds?.size}
          onBulkAction={onBulkAction}
          showSearch={showSearch}
          showFilter={showFilter}
          bulkActions={bulkActions}
          searchPlaceholder={searchPlaceholder}
          columns={toolbarColumns}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={onColumnVisibilityChange}
          showColumnVisibility={showColumnVisibility}
        />
      )}

      {/* Enhanced Table Container */}
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: maxHeight }}
        role="region"
        aria-label={t('table.accessibility.table_region')}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" role="table">
          {/* Professional Header */}
          <thead className={clsx(
            'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
            stickyHeader && 'sticky top-0 z-20 shadow-sm'
          )}>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              {isSelectable && (
                <th scope="col" className={clsx("relative w-12", densityClasses.header)}>
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
                      aria-label={t('table.selection.select_all', { count: allItemIdsOnPage.size })}
                      aria-describedby="select-all-description"
                    />
                    <span id="select-all-description" className="sr-only">
                      {selectedIdsOnPage.size === allItemIdsOnPage.size
                        ? t('table.selection.all_rows_selected')
                        : selectedIdsOnPage.size > 0
                        ? t('table.selection.some_rows_selected')
                        : t('table.selection.no_rows_selected')}
                    </span>
                  </div>
                </th>
              )}
              {visibleColumnsFiltered.map((col, colIndex) => {
                const isSortable = col.isSortable && onSortChange && typeof col.accessor === 'string';
                const isCurrentSort = sortDescriptor && typeof col.accessor === 'string' && sortDescriptor.columnAccessor === col.accessor;

                return (
                  <th
                    key={`${col.header}-${colIndex}`}
                    scope="col"
                    className={clsx(
                      densityClasses.header,
                      'text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider',
                      isSortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                    style={{
                      width: col.width,
                      minWidth: col.minWidth,
                    }}
                    onClick={() => isSortable && handleSort(col.accessor as keyof T)}
                    role={isSortable ? 'columnheader button' : 'columnheader'}
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
                    aria-label={isSortable ? t('table.sorting.sort_by', { column: col.header }) : col.header}
                  >
                    <div className={clsx(
                      "flex items-center group",
                      col.align === 'center' && 'justify-center',
                      col.align === 'right' && 'justify-end',
                      !col.align && 'justify-between'
                    )}>
                      <span className="font-medium">{col.header}</span>
                      {isSortable && (
                        <SortIcon
                          direction={isCurrentSort ? sortDescriptor.direction : undefined}
                          isActive={!!isCurrentSort}
                          t={t}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Professional Table Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => {
              const additionalRowProps = rowProps?.(item, index) ?? {};
              const {
                className: additionalRowClassName,
                onClick: additionalOnClick,
                onKeyDown: additionalOnKeyDown,
                onMouseEnter: additionalOnMouseEnter,
                onMouseLeave: additionalOnMouseLeave,
                role: additionalRole,
                tabIndex: additionalTabIndex,
                ...restRowProps
              } = additionalRowProps;

              const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
                additionalOnClick?.(event);
                if (!event.defaultPrevented) {
                  onRowClick?.(item);
                }
              };

              const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                additionalOnKeyDown?.(event);
                if (!event.defaultPrevented) {
                  handleKeyDown(event, item);
                }
              };

              const handleRowMouseEnter = (event: React.MouseEvent<HTMLTableRowElement>) => {
                additionalOnMouseEnter?.(event);
                if (!event.defaultPrevented) {
                  handleRowHover(item.id);
                }
              };

              const handleRowMouseLeave = (event: React.MouseEvent<HTMLTableRowElement>) => {
                additionalOnMouseLeave?.(event);
                if (!event.defaultPrevented) {
                  handleRowHover(null);
                }
              };

              return (
                <tr
                  key={item.id}
                  {...restRowProps}
                  onClick={handleRowClick}
                  onKeyDown={handleRowKeyDown}
                  onMouseEnter={handleRowMouseEnter}
                  onMouseLeave={handleRowMouseLeave}
                  tabIndex={additionalTabIndex ?? (onRowClick ? 0 : undefined)}
                  className={clsx(getRowClassName(item), additionalRowClassName)}
                  role={additionalRole ?? (onRowClick ? 'row button' : 'row')}
                  aria-selected={selectedIds?.has(item.id)}
                  aria-rowindex={index + 2} // +2 because header is row 1
                >
                {isSelectable && (
                  <td className={clsx("relative w-12", densityClasses.cell)}>
                    <div className="flex items-center justify-center">
                      <input
                        id={`checkbox-${item.id}`}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2 transition-colors duration-200"
                        checked={selectedIds?.has(item.id) ?? false}
                        onChange={(e) => handleRowSelect(item, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={t('table.selection.select_row', {
                          index: index + 1,
                          name: typeof item.id === 'string' ? item.id : `Item ${item.id}`
                        })}
                      />
                    </div>
                  </td>
                )}
                {visibleColumnsFiltered.map((col, colIndex) => (
                  <td
                    key={`${item.id}-${col.id}-${colIndex}`}
                    className={clsx(
                      densityClasses.cell,
                      'text-sm text-gray-900 dark:text-gray-100',
                      colIndex === 0 && 'font-medium', // First column emphasis
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                    style={{
                      width: col.width,
                      minWidth: col.minWidth,
                    }}
                  >
                    <div className={clsx(
                      "flex items-center",
                      col.align === 'center' && 'justify-center',
                      col.align === 'right' && 'justify-end'
                    )}>
                      {renderCell(item, col, index)}
                    </div>
                  </td>
                ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Professional Pagination - Show even with 1 page for page size selector */}
      {pagination && (
        <Pagination {...pagination} pageSizeOptions={pagination.pageSizeOptions} />
      )}
    </Card>
  );
}

// Export the component with display name for better debugging
Table.displayName = 'Table';

// Export utility functions and components
export { formatDateTime, DateTimeDisplay };

// Export default for convenience
export default Table;
