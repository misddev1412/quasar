import { headers, cookies } from 'next/headers';
import { serverTrpc } from '../utils/trpc-server';

const SUPPORTED_LOCALES = new Set(['en', 'vi']);
const DEFAULT_LOCALE = 'vi';

const normalizeLocale = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.toLowerCase();
  if (SUPPORTED_LOCALES.has(cleaned)) {
    return cleaned;
  }
  const short = cleaned.split('-')[0];
  return SUPPORTED_LOCALES.has(short) ? short : undefined;
};

export async function getPreferredLocale(
  searchParams?: Record<string, string | string[] | undefined>,
): Promise<string> {
  const searchLocaleParam = searchParams?.locale;
  const searchLocale = Array.isArray(searchLocaleParam) ? searchLocaleParam[0] : searchLocaleParam;
  const normalizedFromParam = normalizeLocale(searchLocale);
  if (normalizedFromParam) {
    return normalizedFromParam;
  }

  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get('NEXT_LOCALE')?.value);
  if (cookieLocale) {
    return cookieLocale;
  }

  const headerList = await headers();
  // const acceptLanguage = headerList.get('accept-language');
  // if (acceptLanguage) {
  //   const [primary] = acceptLanguage.split(',');
  //   const normalizedFromHeader = normalizeLocale(primary);
  //   if (normalizedFromHeader) {
  //     return normalizedFromHeader;
  //   }
  // }

  const nextLocaleHeader = normalizeLocale(headerList.get('x-next-locale'));
  if (nextLocaleHeader) {
    return nextLocaleHeader;
  }

  // Try to fetch default locale from backend settings
  try {
    const response = await serverTrpc.clientLanguage.getDefaultLanguage.query();
    if (response?.data?.code) {
      const backendLocale = normalizeLocale(response.data.code);
      if (backendLocale) return backendLocale;
    }
  } catch (error) {
    console.warn('Failed to fetch default locale from backend settings:', error);
  }

  return DEFAULT_LOCALE;
}
