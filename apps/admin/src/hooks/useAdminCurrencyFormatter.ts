import { useCallback } from 'react';
import { formatCurrencyValue, type CurrencyFormatOptions } from '@shared';
import { useDefaultCurrency } from '@admin/hooks/useDefaultCurrency';

export const useAdminCurrencyFormatter = () => {
  const { defaultCurrency, isLoading, isError } = useDefaultCurrency();

  const formatCurrency = useCallback((value: number, overrides?: CurrencyFormatOptions) => {
    return formatCurrencyValue(value, {
      currency: overrides?.currency ?? defaultCurrency.code,
      symbol: overrides?.symbol ?? defaultCurrency.symbol,
      decimalPlaces: overrides?.decimalPlaces ?? defaultCurrency.decimalPlaces,
      format: overrides?.format ?? defaultCurrency.format,
      locale: overrides?.locale,
    });
  }, [defaultCurrency.code, defaultCurrency.symbol, defaultCurrency.decimalPlaces, defaultCurrency.format]);

  return {
    formatCurrency,
    defaultCurrency,
    isLoading,
    isError,
  };
};
