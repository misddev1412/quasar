import type { ApiResponse } from '../types/api';
import type {
  SiteContent,
  SiteContentListResponse,
  SiteContentPagination,
  SiteContentResponse,
} from '../types/site-content';
import type { SiteContentCategory } from '@shared/enums/site-content.enums';

export interface FetchSiteContentListParams {
  page?: number;
  limit?: number;
  category?: SiteContentCategory;
  languageCode?: string;
  isFeatured?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'displayOrder';
  sortOrder?: 'asc' | 'desc';
}

function buildDefaultPagination(items: SiteContent[]): SiteContentPagination {
  const total = items.length;
  return {
    page: 1,
    limit: total || 10,
    total,
    totalPages: total > 0 ? 1 : 0,
    hasNext: false,
    hasPrevious: false,
  };
}

export async function fetchSiteContents(
  params: FetchSiteContentListParams = {},
): Promise<SiteContentListResponse | null> {
  try {
    const { trpcClient } = await import('../utils/trpc');
    const response = await (trpcClient as any).clientSiteContents.listSiteContents.query(params);

    if (!response) {
      return null;
    }

    const data = (response as ApiResponse<SiteContentListResponse>).data;
    if (!data) {
      return null;
    }

    const items = Array.isArray(data.items) ? data.items : [];
    const pagination = data.pagination ?? buildDefaultPagination(items);

    return {
      items,
      pagination,
    };
  } catch (error) {
    console.error('Failed to fetch site contents', error);
    return null;
  }
}

export async function fetchSiteContentBySlug(
  slug: string,
  languageCode?: string,
): Promise<SiteContent | null> {
  try {
    if (!slug) {
      return null;
    }

    const { trpcClient } = await import('../utils/trpc');
    const response = await (trpcClient as any).clientSiteContents.getSiteContentBySlug.query({
      slug,
      languageCode,
    });

    if (!response) {
      return null;
    }

    const data = (response as ApiResponse<SiteContentResponse>).data;
    return data?.siteContent ?? null;
  } catch (error) {
    console.error('Failed to fetch site content by slug', error);
    return null;
  }
}

export async function fetchSiteContentByCode(
  code: string,
  languageCode?: string,
): Promise<SiteContent | null> {
  try {
    if (!code) {
      return null;
    }

    const { trpcClient } = await import('../utils/trpc');
    const response = await (trpcClient as any).clientSiteContents.getSiteContentByCode.query({
      code,
      languageCode,
    });

    if (!response) {
      return null;
    }

    const data = (response as ApiResponse<SiteContentResponse>).data;
    return data?.siteContent ?? null;
  } catch (error) {
    console.error('Failed to fetch site content by code', error);
    return null;
  }
}
