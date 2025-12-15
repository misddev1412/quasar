import { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import type { SettingData } from './useSettings';

type JsonRecord = Record<string, any>;

const mergeWithFallback = <T extends JsonRecord>(fallback: T, rawValue?: string | null): T => {
  if (!rawValue) {
    return { ...fallback };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return { ...fallback };
  }
};

export const useBrandingSetting = <T extends JsonRecord>(
  key: string,
  fallback: T,
  options?: Parameters<typeof trpc.adminSettings.getByKey.useQuery>[1],
) => {
  const query = trpc.adminSettings.getByKey.useQuery(
    { key },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      ...options,
    },
  );

  const setting = (query.data as any)?.data as SettingData | undefined;

  const config = useMemo<T>(() => mergeWithFallback(fallback, setting?.value), [setting?.value, fallback]);

  return {
    config,
    setting,
    ...query,
  };
};
