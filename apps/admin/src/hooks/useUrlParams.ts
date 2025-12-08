import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing URL query parameters with debouncing
 * Provides utilities for reading, updating, and clearing URL parameters
 */
export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get a parameter value from URL
   */
  const getParam = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);

  /**
   * Get multiple parameters from URL
   */
  const getParams = useCallback((keys: string[]): Record<string, string | null> => {
    const result: Record<string, string | null> = {};
    keys.forEach(key => {
      result[key] = searchParams.get(key);
    });
    return result;
  }, [searchParams]);

  /**
   * Update URL parameters with debouncing
   */
  const updateParams = useCallback((
    params: Record<string, string | undefined | null>,
    options: { debounceMs?: number; replace?: boolean } = {}
  ) => {
    const { debounceMs = 100, replace = true } = options;

    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newSearchParams = new URLSearchParams();

      // Add non-empty parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          newSearchParams.set(key, value);
        }
      });

      // Update URL without causing navigation
      setSearchParams(newSearchParams, { replace });
    }, debounceMs);
  }, [setSearchParams]);

  /**
   * Clear all URL parameters
   */
  const clearParams = useCallback(() => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  /**
   * Clear specific URL parameters
   */
  const clearSpecificParams = useCallback((keys: string[]) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    const newSearchParams = new URLSearchParams(searchParams);
    keys.forEach(key => {
      newSearchParams.delete(key);
    });

    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  /**
   * Cleanup function to clear timeouts
   */
  const cleanup = useCallback(() => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }
  }, []);

  return {
    getParam,
    getParams,
    updateParams,
    clearParams,
    clearSpecificParams,
    cleanup,
  };
};

/**
 * Validation utilities for common parameter types
 */
export const urlParamValidators = {
  /**
   * Validate and parse a boolean parameter
   */
  boolean: (value: string | null): boolean | undefined => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  },

  /**
   * Validate and parse a number parameter
   */
  number: (value: string | null, min = 1): number | undefined => {
    if (!value) return undefined;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min ? num : undefined;
  },

  /**
   * Validate and parse a page number parameter
   */
  page: (value: string | null): number => {
    const pageNum = value ? parseInt(value, 10) : 1;
    return pageNum > 0 ? pageNum : 1;
  },

  /**
   * Validate an enum parameter
   */
  enum: <T extends Record<string, string>>(
    value: string | null,
    enumObject: T
  ): T[keyof T] | undefined => {
    if (!value) return undefined;
    return Object.values(enumObject).includes(value as T[keyof T]) 
      ? (value as T[keyof T]) 
      : undefined;
  },

  /**
   * Validate a date string parameter
   */
  date: (value: string | null): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? value : undefined;
  },
};
