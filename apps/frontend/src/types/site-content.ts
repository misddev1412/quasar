import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

export interface SiteContent {
  id: string;
  code: string;
  title: string;
  slug: string;
  category: SiteContentCategory;
  status: SiteContentStatus;
  summary: string | null;
  content: string | null;
  languageCode: string;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SiteContentListResponse {
  items: SiteContent[];
  pagination: SiteContentPagination;
}

export interface SiteContentResponse {
  siteContent: SiteContent;
}
