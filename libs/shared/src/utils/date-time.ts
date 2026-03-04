export interface DateTimeFormatOptions {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

export interface RelativeDateTimeOptions extends DateTimeFormatOptions {
  maxRelativeDays?: number;
}

const DEFAULT_LOCALE = 'vi';
const DEFAULT_INTL_LOCALE_MAP: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

const normalizeLocale = (locale?: string): string => {
  if (!locale) return DEFAULT_LOCALE;
  return locale.split('-')[0].toLowerCase();
};

const resolveIntlLocale = (locale?: string): string => {
  const normalized = normalizeLocale(locale);
  return DEFAULT_INTL_LOCALE_MAP[normalized] || locale || DEFAULT_LOCALE;
};

const toDate = (value: Date | string | number): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatLocalizedDate = (
  value: Date | string | number,
  options: DateTimeFormatOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return '';

  const { locale = DEFAULT_LOCALE, dateStyle = 'medium', timeStyle } = options;
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    dateStyle,
    ...(timeStyle ? { timeStyle } : {}),
  }).format(date);
};

export const formatRelativeDateTime = (
  value: Date | string | number,
  options: RelativeDateTimeOptions = {},
): { formatted: string; raw: string } | null => {
  const date = toDate(value);
  if (!date) return null;

  const { locale = DEFAULT_LOCALE, dateStyle = 'medium', maxRelativeDays = 7 } = options;
  const intlLocale = resolveIntlLocale(locale);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInMinutes = Math.round(diffInMs / 60000);
  const diffInHours = Math.round(diffInMs / 3600000);
  const diffInDays = Math.round(diffInMs / 86400000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });

  let formatted: string;

  if (Math.abs(diffInMinutes) < 1) {
    formatted = rtf.format(0, 'second');
  } else if (Math.abs(diffInMinutes) < 60) {
    formatted = rtf.format(diffInMinutes, 'minute');
  } else if (Math.abs(diffInHours) < 24) {
    formatted = rtf.format(diffInHours, 'hour');
  } else if (Math.abs(diffInDays) <= maxRelativeDays) {
    formatted = rtf.format(diffInDays, 'day');
  } else {
    formatted = formatLocalizedDate(date, { locale, dateStyle });
  }

  return {
    formatted,
    raw: date.toISOString(),
  };
};
