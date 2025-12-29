import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import type { ApiResponse } from '../types/api';

export const ADD_TO_CART_BUTTON_COMPONENT_KEY = 'add_to_cart_button' as const;

export interface AddToCartButtonConfig {
  backgroundColor: {
    light: string;
    dark: string;
  };
  textColor: {
    light: string;
    dark: string;
  };
  textTransform: 'normal' | 'uppercase' | 'capitalize';
  icon: string;
}

const DEFAULT_ADD_TO_CART_BUTTON_CONFIG: AddToCartButtonConfig = {
  backgroundColor: {
    light: '#3b82f6',
    dark: '#2563eb',
  },
  textColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  textTransform: 'normal',
  icon: 'shopping-cart',
};

const normalizeAddToCartButtonConfig = (raw: Partial<AddToCartButtonConfig> | undefined): AddToCartButtonConfig => {
  if (!raw) {
    return DEFAULT_ADD_TO_CART_BUTTON_CONFIG;
  }

  const backgroundColorSource = raw.backgroundColor && typeof raw.backgroundColor === 'object' ? raw.backgroundColor : {};
  const textColorSource = raw.textColor && typeof raw.textColor === 'object' ? raw.textColor : {};

  return {
    backgroundColor: {
      light: typeof backgroundColorSource.light === 'string' && backgroundColorSource.light.trim()
        ? backgroundColorSource.light.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.backgroundColor.light,
      dark: typeof backgroundColorSource.dark === 'string' && backgroundColorSource.dark.trim()
        ? backgroundColorSource.dark.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.backgroundColor.dark,
    },
    textColor: {
      light: typeof textColorSource.light === 'string' && textColorSource.light.trim()
        ? textColorSource.light.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.textColor.light,
      dark: typeof textColorSource.dark === 'string' && textColorSource.dark.trim()
        ? textColorSource.dark.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.textColor.dark,
    },
    textTransform:
      raw.textTransform === 'normal' || raw.textTransform === 'uppercase' || raw.textTransform === 'capitalize'
        ? raw.textTransform
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.textTransform,
    icon: typeof raw.icon === 'string' && raw.icon.trim() ? raw.icon.trim() : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.icon,
  };
};

interface ComponentConfigResponse {
  componentKey: string;
  defaultConfig?: Record<string, unknown> | null;
}

export const useAddToCartButtonConfig = () => {
  const queryInput = useMemo(
    () => ({
      componentKeys: [ADD_TO_CART_BUTTON_COMPONENT_KEY],
    }),
    [],
  );
  const query = trpc.clientComponentConfigs.listByKeys.useQuery(queryInput);

  const config = useMemo<AddToCartButtonConfig>(() => {
    const response = query.data as ApiResponse<ComponentConfigResponse[]> | undefined;
    const record = response?.data?.find((item) => item.componentKey === ADD_TO_CART_BUTTON_COMPONENT_KEY);
    const raw = record?.defaultConfig as Partial<AddToCartButtonConfig> | undefined;
    return normalizeAddToCartButtonConfig(raw);
  }, [query.data]);

  return {
    config,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export type UseAddToCartButtonConfigReturn = ReturnType<typeof useAddToCartButtonConfig>;
