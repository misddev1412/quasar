'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { trpc } from '../utils/trpc';

export interface CurrencyInfo {
  id?: string;
  code: string;
  symbol: string;
  decimalPlaces?: number;
  format?: string;
}

interface CurrencyContextValue {
  currency: CurrencyInfo;
  isLoading: boolean;
}

const fallbackCurrency: CurrencyInfo = {
  code: 'USD',
  symbol: '$',
  decimalPlaces: 2,
  format: '{symbol}{amount}',
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: fallbackCurrency,
  isLoading: false,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading } = trpc.clientCurrency.getDefaultCurrency.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const value = useMemo<CurrencyContextValue>(() => {
    const currencyData = (data as any)?.data;
    if (currencyData) {
      return {
        currency: {
          code: currencyData.code || fallbackCurrency.code,
          symbol: currencyData.symbol || fallbackCurrency.symbol,
          decimalPlaces: currencyData.decimalPlaces ?? fallbackCurrency.decimalPlaces,
          format: currencyData.format || fallbackCurrency.format,
        },
        isLoading,
      };
    }

    return {
      currency: fallbackCurrency,
      isLoading,
    };
  }, [data, isLoading]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);
