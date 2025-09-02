import { useMemo } from 'react';
import { trpc } from '../utils/trpc';

/**
 * Returns the default country code to use for phone inputs.
 * Logic:
 * - Try to fetch from settings key 'phone.default_country' via adminSettings.getByKey
 * - If missing or request fails, fallback to 'VN'
 * - Always return an uppercased 2-letter ISO country code
 */
export const useDefaultCountry = () => {
  const { data, isLoading, isError } = trpc.adminSettings.getByKey.useQuery(
    { key: 'phone.default_country' },
    {
      // In case of auth issues or server being down, do not retry aggressively
      retry: 1,
      staleTime: 5 * 60 * 1000,
    }
  );

  const country = useMemo(() => {
    try {
      // Expect BaseApiResponse shape: { data: { value: string } | null }
      const value = (data as any)?.data?.value as string | undefined;
      const code = (value || '').trim().toUpperCase();
      // Basic validation: 2 letters
      if (/^[A-Z]{2}$/.test(code)) return code;
    } catch {}
    return 'VN';
  }, [data, isError]);

  return {
    defaultCountry: country,
    isLoading,
    isError,
  };
};

