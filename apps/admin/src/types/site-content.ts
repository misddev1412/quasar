import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

export interface SiteContent {
  id: string;
  code: string;
  title: string;
  slug: string;
  category: SiteContentCategory;
  status: SiteContentStatus;
  summary?: string | null;
  content?: string | null;
  languageCode: string;
  publishedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentFormValues {
  code: string;
  title: string;
  slug: string;
  category: SiteContentCategory;
  status: SiteContentStatus;
  summary?: string;
  content?: string;
  languageCode: string;
  publishedAt?: string;
  metadata?: string;
  displayOrder: number;
  isFeatured: boolean;
}

export const defaultSiteContentFormValues: SiteContentFormValues = {
  code: '',
  title: '',
  slug: '',
  category: SiteContentCategory.INFORMATION,
  status: SiteContentStatus.DRAFT,
  summary: '',
  content: '',
  languageCode: 'vi',
  publishedAt: '',
  metadata: '',
  displayOrder: 0,
  isFeatured: false,
};
