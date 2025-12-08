export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  icon?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLanguageData {
  code: string;
  name: string;
  nativeName: string;
  icon?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface UpdateLanguageData {
  code?: string;
  name?: string;
  nativeName?: string;
  icon?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface LanguageFiltersType {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface LanguageStatistics {
  total: number;
  active: number;
  inactive: number;
  hasDefault: boolean;
}