import { useCallback, useMemo } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { CurrencyFormatOptions, formatCurrencyValue } from '../utils/currency';

interface FormatterOverrides extends CurrencyFormatOptions {}

export const useCurrencyFormatter = (overrides?: FormatterOverrides) => {
  const { currency } = useCurrency();

  const overrideCurrency = overrides?.currency;
  const overrideSymbol = overrides?.symbol;
  const overrideDecimalPlaces = overrides?.decimalPlaces;
  const overrideFormat = overrides?.format;
  const overrideLocale = overrides?.locale;

  const baseConfig = useMemo(() => {
    const fallbackCode = currency.code || 'USD';
    return {
      currency: overrideCurrency ?? fallbackCode,
      symbol: overrideSymbol ?? currency.symbol ?? overrideCurrency ?? fallbackCode,
      decimalPlaces: overrideDecimalPlaces ?? currency.decimalPlaces ?? 2,
      format: overrideFormat ?? currency.format ?? '{symbol}{amount}',
      locale: overrideLocale,
    };
  }, [
    currency.code,
    currency.symbol,
    currency.decimalPlaces,
    currency.format,
    overrideCurrency,
    overrideSymbol,
    overrideDecimalPlaces,
    overrideFormat,
    overrideLocale,
  ]);

  const formatCurrency = useCallback(
    (value: number, dynamicOverrides?: CurrencyFormatOptions) => {
      const merged: CurrencyFormatOptions = {
        ...baseConfig,
        ...dynamicOverrides,
        currency: dynamicOverrides?.currency ?? baseConfig.currency,
        symbol: dynamicOverrides?.symbol ?? baseConfig.symbol,
        decimalPlaces: dynamicOverrides?.decimalPlaces ?? baseConfig.decimalPlaces,
        format: dynamicOverrides?.format ?? baseConfig.format,
        locale: dynamicOverrides?.locale ?? baseConfig.locale,
      };
      return formatCurrencyValue(value, merged);
    },
    [baseConfig]
  );

  return {
    formatCurrency,
    currencyCode: baseConfig.currency,
    currencySymbol: baseConfig.symbol,
    decimalPlaces: baseConfig.decimalPlaces,
  };
};

export type UseCurrencyFormatterReturn = ReturnType<typeof useCurrencyFormatter>;
