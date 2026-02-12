import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import type { ApiResponse } from '../types/api';

export const ADD_TO_CART_BUTTON_COMPONENT_KEY = 'add_to_cart_button' as const;

export interface AddToCartButtonConfig {
  backgroundColor: {
    light: string;
    dark: string;
  };
  outOfStockBackgroundColor: {
    light: string;
    dark: string;
  };
  textColor: {
    light: string;
    dark: string;
  };
  outOfStockTextColor: {
    light: string;
    dark: string;
  };
  size: 'sm' | 'md' | 'lg';
  textTransform: 'normal' | 'uppercase' | 'capitalize';
  icon: string;
}

const DEFAULT_ADD_TO_CART_BUTTON_CONFIG: AddToCartButtonConfig = {
  backgroundColor: {
    light: '#3b82f6',
    dark: '#2563eb',
  },
  outOfStockBackgroundColor: {
    light: '#94a3b8',
    dark: '#64748b',
  },
  textColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  outOfStockTextColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  size: 'md',
  textTransform: 'normal',
  icon: 'shopping-cart',
};

const normalizeAddToCartButtonConfig = (raw: Partial<AddToCartButtonConfig> | undefined): AddToCartButtonConfig => {
  if (!raw) {
    return DEFAULT_ADD_TO_CART_BUTTON_CONFIG;
  }

  const backgroundColorSource = raw.backgroundColor && typeof raw.backgroundColor === 'object' ? raw.backgroundColor : {};
  const textColorSource = raw.textColor && typeof raw.textColor === 'object' ? raw.textColor : {};
  const outOfStockBackgroundColorSource =
    raw.outOfStockBackgroundColor && typeof raw.outOfStockBackgroundColor === 'object'
      ? raw.outOfStockBackgroundColor
      : {};
  const outOfStockTextColorSource =
    raw.outOfStockTextColor && typeof raw.outOfStockTextColor === 'object' ? raw.outOfStockTextColor : {};

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
    outOfStockBackgroundColor: {
      light: typeof outOfStockBackgroundColorSource.light === 'string' && outOfStockBackgroundColorSource.light.trim()
        ? outOfStockBackgroundColorSource.light.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockBackgroundColor.light,
      dark: typeof outOfStockBackgroundColorSource.dark === 'string' && outOfStockBackgroundColorSource.dark.trim()
        ? outOfStockBackgroundColorSource.dark.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockBackgroundColor.dark,
    },
    outOfStockTextColor: {
      light: typeof outOfStockTextColorSource.light === 'string' && outOfStockTextColorSource.light.trim()
        ? outOfStockTextColorSource.light.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockTextColor.light,
      dark: typeof outOfStockTextColorSource.dark === 'string' && outOfStockTextColorSource.dark.trim()
        ? outOfStockTextColorSource.dark.trim()
        : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.outOfStockTextColor.dark,
    },
    size: raw.size === 'sm' || raw.size === 'md' || raw.size === 'lg' ? raw.size : DEFAULT_ADD_TO_CART_BUTTON_CONFIG.size,
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
