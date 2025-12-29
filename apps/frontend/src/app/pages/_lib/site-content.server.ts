import { TRPCClientError } from '@trpc/client';
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';
import { serverTrpc } from '../../../utils/trpc-server';
import type { ApiResponse } from '../../../types/api';
import type {
  SiteContent,
  SiteContentListResponse,
  SiteContentResponse,
} from '../../../types/site-content';
import { SiteContentCategory } from '@shared/enums/site-content.enums';

type SiteContentListArgs = {
  locale?: string;
  page?: number;
  limit?: number;
  category?: SiteContentCategory;
  isFeatured?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'displayOrder';
  sortOrder?: 'asc' | 'desc';
};

type SiteContentCandidate = {
  type: 'slug' | 'code';
  value: string;
};

const SUPPORTED_LOCALES = new Set(['en', 'vi']);

const isTrpcNotFoundError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) {
    return false;
  }

  const code = error.data?.code;
  if (code === 'NOT_FOUND') {
    return true;
  }

  return typeof error.message === 'string' && error.message.toLowerCase().includes('not found');
};

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

const normalizeLocale = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const lower = value.toLowerCase();

  if (SUPPORTED_LOCALES.has(lower)) {
    return lower;
  }

  const short = lower.split('-')[0];
  return SUPPORTED_LOCALES.has(short) ? short : undefined;
};

export const resolvePreferredLocale = async (
  searchParams?: Record<string, string | string[] | undefined>,
): Promise<string> => {
  const searchLocaleParam = searchParams?.locale ?? searchParams?.lang ?? searchParams?.language;
  const searchLocale = Array.isArray(searchLocaleParam) ? searchLocaleParam[0] : searchLocaleParam;
  const fromSearch = normalizeLocale(searchLocale);
  if (fromSearch) {
    return fromSearch;
  }

  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get('NEXT_LOCALE')?.value);
  if (cookieLocale) {
    return cookieLocale;
  }

  const headerList = await headers();
  const acceptLanguage = headerList.get('accept-language');
  if (acceptLanguage) {
    const [primary] = acceptLanguage.split(',');
    const fromHeader = normalizeLocale(primary);
    if (fromHeader) {
      return fromHeader;
    }
  }

  const nextLocaleHeader = normalizeLocale(headerList.get('x-next-locale'));
  if (nextLocaleHeader) {
    return nextLocaleHeader;
  }

  return 'en';
};

export const fetchSiteContentList = async (
  args: SiteContentListArgs = {},
): Promise<SiteContentListResponse | null> => {
  const {
    locale,
    page = 1,
    limit = 12,
    category,
    isFeatured,
    sortBy = 'displayOrder',
    sortOrder = 'asc',
  } = args;

  try {
    const response = (await serverTrpc.clientSiteContents.listSiteContents.query({
      page,
      limit,
      category,
      languageCode: locale,
      isFeatured,
      sortBy,
      sortOrder,
    })) as ApiResponse<SiteContentListResponse> | undefined;

    return response?.data ?? null;
  } catch (error) {
    if (isTrpcNotFoundError(error)) {
      return null;
    }

    throw error;
  }
};

export const fetchSiteContentBySlug = async (
  slug: string,
  locale?: string,
): Promise<SiteContent | null> => {
  if (!slug) {
    return null;
  }

  try {
    const response = (await serverTrpc.clientSiteContents.getSiteContentBySlug.query({
      slug,
      languageCode: locale,
    })) as ApiResponse<SiteContentResponse> | undefined;

    return response?.data?.siteContent ?? null;
  } catch (error) {
    if (isTrpcNotFoundError(error)) {
      return null;
    }

    throw error;
  }
};

export const fetchSiteContentByCode = async (
  code: string,
  locale?: string,
): Promise<SiteContent | null> => {
  if (!code) {
    return null;
  }

  try {
    const response = (await serverTrpc.clientSiteContents.getSiteContentByCode.query({
      code,
      languageCode: locale,
    })) as ApiResponse<SiteContentResponse> | undefined;

    return response?.data?.siteContent ?? null;
  } catch (error) {
    if (isTrpcNotFoundError(error)) {
      return null;
    }

    throw error;
  }
};

export const resolveSiteContent = async (
  candidates: SiteContentCandidate[],
  locale?: string,
): Promise<SiteContent | null> => {
  for (const candidate of candidates) {
    const value = candidate.value.trim();
    if (!value) {
      continue;
    }

    const siteContent = candidate.type === 'code'
      ? await fetchSiteContentByCode(value, locale)
      : await fetchSiteContentBySlug(value, locale);

    if (siteContent) {
      return siteContent;
    }
  }

  return null;
};

export const extractSummary = (siteContent: SiteContent, maxLength = 160): string => {
  if (siteContent.summary) {
    return siteContent.summary;
  }

  if (siteContent.content) {
    const plainText = siteContent.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plainText.length <= maxLength) {
      return plainText;
    }

    return `${plainText.slice(0, maxLength - 3)}...`;
  }

  return '';
};

export const formatCategoryLabel = (category: SiteContentCategory): string => {
  return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const asKeywordString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const keywords = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);

    if (keywords.length > 0) {
      return keywords.join(', ');
    }
    return undefined;
  }

  return asNonEmptyString(value);
};

const pickSeoField = (
  metadata: Record<string, unknown> | null | undefined,
  field: 'title' | 'description' | 'keywords' | 'image',
): string | undefined => {
  if (!metadata) {
    return undefined;
  }

  const metadataRecord = metadata as Record<string, unknown>;

  const directKey = `seo${field.charAt(0).toUpperCase()}${field.slice(1)}` as const;
  const directValue = asNonEmptyString(metadataRecord[directKey]);
  if (directValue) {
    return directValue;
  }

  const nestedSeo = metadataRecord.seo;
  if (typeof nestedSeo === 'object' && nestedSeo !== null) {
    const nestedValue = (nestedSeo as Record<string, unknown>)[field];
    if (field === 'keywords') {
      const keywords = asKeywordString(nestedValue);
      if (keywords) {
        return keywords;
      }
    } else {
      const stringValue = asNonEmptyString(nestedValue);
      if (stringValue) {
        return stringValue;
      }
    }
  }

  if (field === 'keywords') {
    return asKeywordString(metadataRecord[field]);
  }

  return asNonEmptyString(metadataRecord[field]);
};

export const buildMetadataFromSiteContent = async (
  siteContent: SiteContent,
  overrides: Partial<Metadata> = {},
): Promise<Metadata> => {
  const metadata = siteContent.metadata ?? undefined;

  const titleFromMeta = pickSeoField(metadata, 'title');
  const descriptionFromMeta = pickSeoField(metadata, 'description') ?? extractSummary(siteContent, 180);
  const keywordsFromMeta = pickSeoField(metadata, 'keywords');
  const imageFromMeta = pickSeoField(metadata, 'image');

  // Fetch site name from config API first, then fall back to env variable
  let siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Quasar';
  try {
    const settingsResponse = (await serverTrpc.settings.getPublicSettings.query()) as ApiResponse<any> | undefined;
    const settings = settingsResponse?.data || [];
    const siteNameSetting = settings.find((s: any) => s.key === 'site.name');
    if (siteNameSetting?.value) {
      siteName = siteNameSetting.value;
    }
  } catch (error) {
    // If API call fails, continue with env variable fallback
    console.warn('Failed to fetch site name from config API, using environment variable:', error);
  }

  const resolvedTitle = titleFromMeta || siteContent.title;
  const finalTitle = resolvedTitle.includes(siteName) ? resolvedTitle : `${resolvedTitle} | ${siteName}`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const pageUrl = `${baseUrl}/pages/${siteContent.slug}`;

  return {
    title: finalTitle,
    description: descriptionFromMeta,
    keywords: keywordsFromMeta,
    openGraph: {
      title: finalTitle,
      description: descriptionFromMeta,
      url: pageUrl,
      type: 'article',
      images: imageFromMeta ? [{ url: imageFromMeta }] : undefined,
    },
    twitter: {
      card: imageFromMeta ? 'summary_large_image' : 'summary',
      title: finalTitle,
      description: descriptionFromMeta,
      images: imageFromMeta ? [imageFromMeta] : undefined,
    },
    ...overrides,
  };
};
