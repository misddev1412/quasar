import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import type { ApiResponse } from '../types/api';
import { createMainMenuConfig, type MainMenuConfig } from '@shared/types/navigation.types';

interface ComponentConfigResponse {
  id: string;
  componentKey: string;
  defaultConfig?: Record<string, unknown> | null;
}

export const MAIN_MENU_COMPONENT_KEY = 'navigation.main_menu' as const;

export const useMainMenuConfig = () => {
  const queryInput = useMemo(
    () => ({
      componentKeys: [MAIN_MENU_COMPONENT_KEY],
    }),
    [],
  );
  const query = trpc.clientComponentConfigs.listByKeys.useQuery(queryInput);

  const config = useMemo<MainMenuConfig>(() => {
    const response = query.data as ApiResponse<ComponentConfigResponse[]> | undefined;
    const record = response?.data?.find((item) => item.componentKey === MAIN_MENU_COMPONENT_KEY);
    const raw = record?.defaultConfig as Partial<MainMenuConfig> | undefined;
    return createMainMenuConfig(raw);
  }, [query.data]);

  return {
    config,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export type UseMainMenuConfigReturn = ReturnType<typeof useMainMenuConfig>;
