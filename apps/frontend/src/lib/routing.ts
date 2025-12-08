'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function useLocalePath() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Create simple URL without locale prefix
  const createLocalUrl = (path: string): string => {
    // Return the path as-is since we're not using locale prefixes
    return path;
  };

  // Navigate without locale prefix
  const push = (path: string) => {
    router.push(path);
  };

  const replace = (path: string) => {
    router.replace(path);
  };

  return {
    currentLocale: locale,
    createLocalUrl,
    push,
    replace,
  };
}