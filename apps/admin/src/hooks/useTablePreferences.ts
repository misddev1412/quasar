import { useState, useEffect, useCallback } from 'react';

/**
 * Table preferences interface
 */
export interface TablePreferences {
  pageSize: number;
  visibleColumns?: Set<string>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Default table preferences
 */
const DEFAULT_PREFERENCES: TablePreferences = {
  pageSize: 10,
};

/**
 * Hook for managing table preferences with localStorage persistence
 * 
 * @param tableId - Unique identifier for the table (e.g., 'users-table', 'products-table')
 * @param initialPreferences - Initial preferences to merge with defaults
 * @returns Object containing preferences and update functions
 */
export function useTablePreferences(
  tableId: string,
  initialPreferences: Partial<TablePreferences> = {}
) {
  const storageKey = `table-preferences-${tableId}`;

  // Initialize preferences from localStorage or defaults
  const [preferences, setPreferences] = useState<TablePreferences>(() => {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_PREFERENCES, ...initialPreferences };
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored preferences with defaults and initial preferences
        return {
          ...DEFAULT_PREFERENCES,
          ...initialPreferences,
          ...parsed,
          // Handle Set serialization for visibleColumns
          visibleColumns: parsed.visibleColumns 
            ? new Set(parsed.visibleColumns) 
            : initialPreferences.visibleColumns,
        };
      }
    } catch (error) {
      console.warn(`Failed to load table preferences for ${tableId}:`, error);
    }

    return { ...DEFAULT_PREFERENCES, ...initialPreferences };
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const toStore = {
        ...preferences,
        // Convert Set to Array for JSON serialization
        visibleColumns: preferences.visibleColumns 
          ? Array.from(preferences.visibleColumns) 
          : undefined,
      };
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    } catch (error) {
      console.warn(`Failed to save table preferences for ${tableId}:`, error);
    }
  }, [preferences, storageKey, tableId]);

  // Update page size preference
  const updatePageSize = useCallback((pageSize: number) => {
    setPreferences(prev => ({ ...prev, pageSize }));
  }, []);

  // Update visible columns preference
  const updateVisibleColumns = useCallback((visibleColumns: Set<string>) => {
    setPreferences(prev => ({ ...prev, visibleColumns }));
  }, []);

  // Update sort preferences
  const updateSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setPreferences(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES, ...initialPreferences });
  }, [initialPreferences]);

  // Update multiple preferences at once
  const updatePreferences = useCallback((updates: Partial<TablePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    preferences,
    updatePageSize,
    updateVisibleColumns,
    updateSort,
    resetPreferences,
    updatePreferences,
  };
}

/**
 * Hook specifically for page size management with persistence
 * Simplified version for cases where only page size persistence is needed
 * 
 * @param tableId - Unique identifier for the table
 * @param defaultPageSize - Default page size (defaults to 10)
 * @returns Object containing pageSize and updatePageSize function
 */
export function usePageSizePreference(tableId: string, defaultPageSize: number = 10) {
  const { preferences, updatePageSize } = useTablePreferences(tableId, {
    pageSize: defaultPageSize,
  });

  return {
    pageSize: preferences.pageSize,
    updatePageSize,
  };
}
