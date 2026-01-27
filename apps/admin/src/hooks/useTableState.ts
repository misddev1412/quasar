import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTablePreferences } from './useTablePreferences';

interface UseTableStateOptions<TFilters> {
    tableId: string;
    defaultPreferences?: {
        pageSize?: number;
        visibleColumns?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    };
    initialFilters?: TFilters;
    onUrlChange?: (params: Record<string, string | undefined>) => void;
}

export function useTableState<TFilters extends Record<string, any>>(
    options: UseTableStateOptions<TFilters>
) {
    const { tableId, defaultPreferences = {}, initialFilters, onUrlChange } = options;
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Preferences Persistence
    const { preferences, updatePageSize, updateVisibleColumns, updateSort } = useTablePreferences(tableId, {
        pageSize: defaultPreferences.pageSize || 10,
        visibleColumns: defaultPreferences.visibleColumns ? new Set(defaultPreferences.visibleColumns) : undefined,
        sortBy: defaultPreferences.sortBy,
        sortOrder: defaultPreferences.sortOrder,
    });

    // 2. State Initialization (from URL or Preferences)
    // Page
    const [page, setPage] = useState(() => {
        const pageParam = searchParams.get('page');
        const parsed = pageParam ? parseInt(pageParam, 10) : 1;
        return parsed > 0 ? parsed : 1;
    });

    // Limit
    const [limit, setLimit] = useState(preferences.pageSize);

    // Search
    const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
    const [debouncedSearchValue, setDebouncedSearchValue] = useState(() => searchParams.get('search') || '');

    // Filters
    const [filters, setFilters] = useState<TFilters>(() => {
        return (initialFilters || {}) as TFilters;
    });
    const [showFilters, setShowFilters] = useState(false);

    // Sort
    const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || preferences.sortBy || 'createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() =>
        (searchParams.get('sortOrder') as 'asc' | 'desc') || preferences.sortOrder || 'desc'
    );

    // Visible Columns
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
        // Return empty set if no preferences yet, relying on table component default handling or manual init
        return preferences.visibleColumns || new Set();
    });

    // 3. Effects

    // Debounce Search
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchValue(searchValue);
        }, 400);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchValue]);

    // Reset Page Logic (The Fix)
    const prevSearchRef = useRef(debouncedSearchValue);
    const prevFiltersRef = useRef(filters);
    const prevSortByRef = useRef(sortBy);
    const prevSortOrderRef = useRef(sortOrder);
    const prevLimitRef = useRef(limit);

    useEffect(() => {
        let shouldReset = false;

        if (prevSearchRef.current !== debouncedSearchValue) {
            prevSearchRef.current = debouncedSearchValue;
            shouldReset = true;
        }
        if (prevFiltersRef.current !== filters) {
            prevFiltersRef.current = filters;
            shouldReset = true;
        }
        if (prevSortByRef.current !== sortBy) {
            prevSortByRef.current = sortBy;
            shouldReset = true;
        }
        if (prevSortOrderRef.current !== sortOrder) {
            prevSortOrderRef.current = sortOrder;
            shouldReset = true;
        }
        if (prevLimitRef.current !== limit) {
            prevLimitRef.current = limit;
            shouldReset = true;
        }

        if (shouldReset) {
            setPage(1);
        }
    }, [debouncedSearchValue, filters, sortBy, sortOrder, limit]);

    // URL Synchronization
    const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateUrlParams = useCallback((params: Record<string, string | undefined>) => {
        if (urlUpdateTimeoutRef.current) clearTimeout(urlUpdateTimeoutRef.current);
        urlUpdateTimeoutRef.current = setTimeout(() => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        newParams.set(key, value);
                    } else {
                        newParams.delete(key);
                    }
                });
                return newParams;
            }, { replace: true });
        }, 100);
    }, [setSearchParams]);

    useEffect(() => {
        // Construct base params
        const params: Record<string, string | undefined> = {
            page: page > 1 ? String(page) : undefined,
            limit: limit !== 10 ? String(limit) : undefined,
            search: debouncedSearchValue || undefined,
            sortBy: sortBy !== 'createdAt' ? sortBy : undefined,
            sortOrder: sortOrder !== 'desc' ? sortOrder : undefined,
        };

        // Flatten filters generic for URL
        // NOTE: This assumes filters are simple key-value pairs appropriate for URL params.
        // Complex objects in filters will need custom handling or serialization from the caller.
        // For now, we perform a shallow merge of simple stringifiable values.
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params[key] = String(value);
                } else {
                    params[key] = undefined; // Force removal
                }
            });
        }

        if (onUrlChange) {
            onUrlChange(params);
        } else {
            updateUrlParams(params);
        }

    }, [page, limit, debouncedSearchValue, sortBy, sortOrder, filters, updateUrlParams, onUrlChange]);

    // 4. Action Handlers

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        updatePageSize(newLimit);
        // Page reset handled by effect
    }, [updatePageSize]);

    const handleSortChange = useCallback((column: string, direction: 'asc' | 'desc') => {
        setSortBy(column);
        setSortOrder(direction);
        updateSort(column, direction);
        // Page reset handled by effect
    }, [updateSort]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
        // Debounce effect handles setDebouncedSearchValue -> Reset Page Effect
    }, []);

    const handleFiltersChange = useCallback((newFilters: TFilters) => {
        setFilters(newFilters);
        // Reset Page Effect handles reset
    }, []);

    const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (visible) newSet.add(columnId);
            else newSet.delete(columnId);
            updateVisibleColumns(newSet);
            return newSet;
        });
    }, [updateVisibleColumns]);

    const clearFilters = useCallback(() => {
        // Logic depends on what 'empty' filters look like.
        // We'll rely on the consumer to pass "empty" filters via handleFiltersChange 
        // or we can add a reset function if we knew the default state.
        // For generic safety, we might not assume {} is valid TFilters.
    }, []);

    // Sync visible columns from preferences if they load later
    useEffect(() => {
        const targetColumns = preferences.visibleColumns || defaultPreferences.visibleColumns;

        if (targetColumns) {
            setVisibleColumns(prev => {
                const targetSet = targetColumns instanceof Set
                    ? targetColumns
                    : new Set(targetColumns);

                // Deep comparison to prevent infinite loop if ref changes but content is same
                if (prev.size === targetSet.size &&
                    Array.from(prev).every(col => targetSet.has(col))) {
                    return prev;
                }

                return targetSet;
            });
        }
    }, [preferences.visibleColumns, defaultPreferences.visibleColumns]);


    return {
        // State
        page,
        limit,
        searchValue,
        debouncedSearchValue,
        filters,
        showFilters,
        sortBy,
        sortOrder,
        visibleColumns,

        // Actions
        setPage: handlePageChange, // exposed as setPage to match common pattern, but actually is handlePageChange logic involving state update
        setLimit: handlePageSizeChange,
        setSearchValue: handleSearchChange,
        setFilters: handleFiltersChange,
        setShowFilters,
        setSortBy, // Direct setters if needed, but usually via handleSortChange
        setSortOrder,
        handleSortChange,
        handlePageChange,
        handlePageSizeChange,
        handleColumnVisibilityChange,

        // Raw Setters (use carefully)
        setRawFilters: setFilters,
    };
}
