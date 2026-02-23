'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from './routes.config';
import { getProductLink, getNewsLink } from './link-utils';

export function useLocalePath() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Create localized URL
  const createLocalUrl = (path: string, targetLocale?: string): string => {
    const activeLocale = targetLocale || locale;
    return getLocalizedPath(path, activeLocale);
  };

  // Helper to generate product links
  const createProductUrl = (slug: string) => getProductLink(slug, locale);

  // Helper to generate news/blog links
  const createNewsUrl = (slug: string) => getNewsLink(slug, locale);

  // Navigate using localized path
  const push = (path: string) => {
    router.push(createLocalUrl(path));
  };

  const replace = (path: string) => {
    router.replace(createLocalUrl(path));
  };

  return {
    currentLocale: locale,
    createLocalUrl,
    createProductUrl,
    createNewsUrl,
    push,
    replace,
  };
}