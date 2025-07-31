/**
 * Table Configuration
 * 
 * Centralized configuration for table components including
 * page size options, default settings, and other table-related constants.
 */

export interface PageSizeOption {
  value: string;
  labelKey: string; // Translation key for the label
}

/**
 * Default page size options for tables
 * These can be overridden per table if needed
 */
export const DEFAULT_PAGE_SIZE_OPTIONS: PageSizeOption[] = [
  { value: '10', labelKey: 'table.pagination.per_page_10' },
  { value: '25', labelKey: 'table.pagination.per_page_25' },
  { value: '50', labelKey: 'table.pagination.per_page_50' },
  { value: '100', labelKey: 'table.pagination.per_page_100' },
];

/**
 * Table configuration constants
 */
export const TABLE_CONFIG = {
  // Default page size
  DEFAULT_PAGE_SIZE: 10,
  
  // Maximum page size allowed
  MAX_PAGE_SIZE: 100,
  
  // Default debounce delay for search (in milliseconds)
  SEARCH_DEBOUNCE_DELAY: 400,
  
  // Default maximum table height
  DEFAULT_MAX_HEIGHT: '70vh',
  
  // Default density
  DEFAULT_DENSITY: 'normal' as const,
  
  // Default pagination options
  PAGE_SIZE_OPTIONS: DEFAULT_PAGE_SIZE_OPTIONS,
} as const;

/**
 * Table density options
 */
export const TABLE_DENSITY_OPTIONS = [
  { value: 'compact', labelKey: 'table.density.compact' },
  { value: 'normal', labelKey: 'table.density.normal' },
  { value: 'comfortable', labelKey: 'table.density.comfortable' },
] as const;

/**
 * Helper function to get page size options with custom options
 */
export const getPageSizeOptions = (customOptions?: PageSizeOption[]): PageSizeOption[] => {
  return customOptions || DEFAULT_PAGE_SIZE_OPTIONS;
};

/**
 * Helper function to validate page size
 */
export const isValidPageSize = (pageSize: number): boolean => {
  return pageSize > 0 && pageSize <= TABLE_CONFIG.MAX_PAGE_SIZE;
};

/**
 * Helper function to get the closest valid page size
 */
export const getValidPageSize = (pageSize: number): number => {
  if (pageSize <= 0) return TABLE_CONFIG.DEFAULT_PAGE_SIZE;
  if (pageSize > TABLE_CONFIG.MAX_PAGE_SIZE) return TABLE_CONFIG.MAX_PAGE_SIZE;
  return pageSize;
};
