export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published', 
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

export enum PostType {
  POST = 'post',
  PAGE = 'page',
  NEWS = 'news',
  EVENT = 'event',
}

export interface PostTranslation {
  id: string;
  locale: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Post {
  id: string;
  status: PostStatus;
  type: PostType;
  featuredImage?: string;
  authorId: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  viewCount: number;
  isFeatured: boolean;
  allowComments: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
  author?: any; // User type would be imported from user types
  translations: PostTranslation[];
  categories: PostCategory[];
  tags: PostTag[];
}

export interface PostFiltersType {
  status?: PostStatus;
  type?: PostType;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  locale?: string;
  isFeatured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  publishedFrom?: string;
  publishedTo?: string;
  title?: string;
  content?: string;
}