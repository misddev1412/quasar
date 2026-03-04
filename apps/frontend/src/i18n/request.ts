import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { getMergedMessages } from './server-messages';

// Can be imported from a shared config
const locales = ['en', 'vi'];
const DEFAULT_LOCALE = 'vi';

export default getRequestConfig(async ({ locale }) => {
  const normalizedLocale = typeof locale === 'string'
    ? locale.split('-')[0].toLowerCase()
    : undefined;

  // Only hard-404 on explicit invalid locale segment.
  // For non-locale routes (e.g. /services/:slug), fall back to default locale.
  if (normalizedLocale && !locales.includes(normalizedLocale)) {
    notFound();
  }

  const resolvedLocale = (normalizedLocale && locales.includes(normalizedLocale))
    ? normalizedLocale
    : DEFAULT_LOCALE;

  return {
    locale: resolvedLocale,
    messages: await getMergedMessages(resolvedLocale),
    timeZone: 'Asia/Ho_Chi_Minh'
  };
});
