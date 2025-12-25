import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import type { Currency } from '../types/currency';

interface DefaultCurrencyInfo {
  code: string;
  symbol: string;
  decimalPlaces: number;
  raw?: Currency;
}

const FALLBACK_CURRENCY: DefaultCurrencyInfo = {
  code: 'USD',
  symbol: '$',
  decimalPlaces: 2,
};

export const useDefaultCurrency = () => {
  const { data, isLoading, isError } = trpc.adminCurrency.getCurrencies.useQuery(
    {
      page: 1,
      limit: 10,
      isActive: true,
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const defaultCurrency = useMemo<DefaultCurrencyInfo>(() => {
    const items = ((data as any)?.data?.items ?? []) as Currency[];

    if (!Array.isArray(items) || items.length === 0) {
      return { ...FALLBACK_CURRENCY };
    }

    const resolvedCurrency = items.find((item) => item.isDefault) ?? items[0];
    if (!resolvedCurrency) {
      return { ...FALLBACK_CURRENCY };
    }

    const decimalPlaces = typeof resolvedCurrency.decimalPlaces === 'number' && resolvedCurrency.decimalPlaces >= 0
      ? resolvedCurrency.decimalPlaces
      : FALLBACK_CURRENCY.decimalPlaces;

    return {
      code: resolvedCurrency.code || FALLBACK_CURRENCY.code,
      symbol: resolvedCurrency.symbol || resolvedCurrency.code || FALLBACK_CURRENCY.symbol,
      decimalPlaces,
      raw: resolvedCurrency,
    };
  }, [data]);

  return {
    defaultCurrency,
    isLoading,
    isError,
  };
};
