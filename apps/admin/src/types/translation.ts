export interface Translation {
  id: string;
  key: string;
  locale: string;
  value: string;
  namespace?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTranslationData {
  key: string;
  locale: string;
  value: string;
  namespace?: string;
  isActive?: boolean;
}

export interface UpdateTranslationData {
  key?: string;
  locale?: string;
  value?: string;
  namespace?: string;
  isActive?: boolean;
}

export interface TranslationFiltersType {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  namespace?: string;
  isActive?: boolean;
}

export interface TranslationStatistics {
  total: number;
  active: number;
  inactive: number;
  localesCount: number;
  namespacesCount: number;
}
