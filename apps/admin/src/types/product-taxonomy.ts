import type { Brand, Category } from '@admin/types/product';

export interface CategoriesTreeResponse {
  data?: Category[];
}

export interface CategoryStatsData {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  rootCategories: number;
  maxDepth: number;
}

export interface CategoryStatsResponse {
  data?: CategoryStatsData;
}

export interface DownloadTemplatePayload {
  data: string;
  filename: string;
  mimeType?: string;
}

export interface DownloadTemplateResponse {
  data?: DownloadTemplatePayload;
  filename?: string;
  mimeType?: string;
}

export interface BrandsListData {
  brands?: Brand[];
  items?: Brand[];
  total?: number;
}

export interface BrandsListResponse {
  data?: BrandsListData;
}

export interface BrandStatsData {
  totalBrands: number;
  activeBrands: number;
  totalProducts: number;
  averageProductsPerBrand: number;
}

export interface BrandStatsResponse {
  data?: BrandStatsData;
}
