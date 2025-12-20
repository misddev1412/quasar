export interface CurrencyFormatOptions {
  currency?: string;
  symbol?: string;
  decimalPlaces?: number;
  format?: string;
  locale?: string;
}

const DEFAULT_FORMAT = '{symbol}{amount}';

export const normalizeCurrencyAmount = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return value;
};

export const formatCurrencyValue = (value: number, options: CurrencyFormatOptions = {}): string => {
  const {
    currency = 'USD',
    symbol,
    decimalPlaces = 2,
    format = DEFAULT_FORMAT,
    locale,
  } = options;

  const safeFormat = format && format.includes('{amount}') ? format : DEFAULT_FORMAT;
  const safeSymbol = symbol ?? currency;

  const normalizedValue = normalizeCurrencyAmount(value);
  const isNegative = normalizedValue < 0;
  const absoluteValue = Math.abs(normalizedValue);

  let formattedAmount: string;
  try {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
    formattedAmount = formatter.format(absoluteValue);
  } catch (error) {
    console.warn('Failed to format currency amount, falling back to fixed decimals', error);
    formattedAmount = absoluteValue.toFixed(decimalPlaces);
  }

  const withSymbol = safeFormat
    .replace(/{symbol}/g, safeSymbol)
    .replace(/{code}/g, currency)
    .replace(/{amount}/g, formattedAmount);

  return isNegative ? `-${withSymbol}` : withSymbol;
};

export type FormatCurrencyValue = typeof formatCurrencyValue;
