import { useCallback } from 'react';
import { useRouteLoading as useRouteLoadingContext } from '../context/RouteLoadingContext';

export const useRouteLoading = () => {
  const { startLoading, stopLoading, isLoading } = useRouteLoadingContext();

  const withLoading = useCallback(async <T,>(
    callback: () => Promise<T> | T,
    options?: {
      showLoader?: boolean;
      delay?: number;
    }
  ): Promise<T> => {
    const { showLoader = true, delay = 200 } = options || {};

    if (showLoader) {
      startLoading();
    }

    try {
      const result = await callback();
      return result;
    } finally {
      if (showLoader) {
        setTimeout(() => {
          stopLoading();
        }, delay);
      }
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};