import { useState, useEffect } from 'react';
import type { PaginatedResponse } from '@backend/trpc/schemas/response.schemas';
import type { SiteContent } from '@admin/types/site-content';
import { trpc } from '../utils/trpc';

export interface SiteContentOption {
  id: string;
  title: string;
  code: string;
  slug: string;
  category: string;
  status: string;
  languageCode: string;
}

export interface UseSiteContentOptionsOptions {
  enabled?: boolean;
  languageCode?: string;
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  search?: string;
}

export const useSiteContentOptions = (options: UseSiteContentOptionsOptions = {}) => {
  const {
    enabled = true,
    languageCode = 'vi',
    status = 'published',
    category,
    search,
  } = options;

  const [siteContentOptions, setSiteContentOptions] = useState<SiteContentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: siteContentsData,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = trpc.adminSiteContents.listSiteContents.useQuery(
    {
      page: 1,
      limit: 100, // Get a good number of options
      languageCode,
      status: status as any,
      category: category as any,
      search,
      sortOrder: 'asc',
    },
    {
      enabled,
      select: (response: PaginatedResponse<SiteContent>) => {
        const items = response.data?.items ?? [];
        return items
          .map((item) => ({
            id: item.id,
            title: item.title,
            code: item.code,
            slug: item.slug,
            category: item.category,
            status: item.status,
            languageCode: item.languageCode,
          }))
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      },
    }
  );

  useEffect(() => {
    if (siteContentsData) {
      setSiteContentOptions(siteContentsData);
    }
  }, [siteContentsData]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message || 'Failed to load site content options');
    } else {
      setError(null);
    }
  }, [queryError]);

  return {
    siteContentOptions,
    isLoading: isQueryLoading,
    error,
    refetch,
  };
};
