export interface AdminSeoListQuery {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  group?: string;
}

export interface AdminSeoListData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSeoStats {
  total: number;
  active: number;
  inactive: number;
  groups: number;
}

export const SEO_GROUP_OPTIONS = ['general', 'blog', 'product'] as const;
export type SeoGroupOption = typeof SEO_GROUP_OPTIONS[number];
