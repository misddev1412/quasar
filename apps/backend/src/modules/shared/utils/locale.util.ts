import { SupportedLocale } from '@shared';

const SUPPORTED_LOCALES: SupportedLocale[] = ['vi', 'en'];
export const DEFAULT_LOCALE: SupportedLocale = 'vi';

const normalize = (value?: string | string[]): string | null => {
  if (!value) return null;

  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved) return null;

  const trimmed = resolved.split(',')[0]?.trim();
  if (!trimmed) return null;

  return trimmed.toLowerCase();
};

const mapToSupported = (value: string | null): SupportedLocale | null => {
  if (!value) return null;

  const shortCode = value.split('-')[0];
  if (!shortCode) return null;

  const matched = SUPPORTED_LOCALES.find((locale) => locale === shortCode) || null;
  return matched ?? null;
};

export const resolveLocaleFromRequest = (req: any): SupportedLocale => {
  const headerLocale = normalize(req?.headers?.['x-locale']);
  const fromHeader = mapToSupported(headerLocale);
  if (fromHeader) {
    return fromHeader;
  }

  const acceptLanguage = normalize(req?.headers?.['accept-language']);
  const fromAcceptLanguage = mapToSupported(acceptLanguage);
  if (fromAcceptLanguage) {
    return fromAcceptLanguage;
  }

  return DEFAULT_LOCALE;
};

export const resolveLocale = (value?: string | string[]): SupportedLocale => {
  const normalized = normalize(value);
  const mapped = mapToSupported(normalized);
  return mapped ?? DEFAULT_LOCALE;
};

export const getSupportedLocales = (): SupportedLocale[] => [...SUPPORTED_LOCALES];
