import { trpcClient } from '../utils/trpc';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationInfo
} from '../types/api';
import type {
  Category,
  CategoryTree,
  Product
} from '../types/product';

export interface GetCategoryProductsParams {
  categoryRef: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CategoryProductListResponse {
  items: Product[];
  pagination: PaginationInfo;
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await trpcClient.clientCategories.getCategories.query() as unknown as ApiResponse<Category[]>;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await trpcClient.clientCategories.getCategoryById.query({ id }) as unknown as ApiResponse<Category>;
      return response.data || null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await trpcClient.clientCategories.getCategoryBySlug.query({ slug }) as unknown as ApiResponse<Category>;
      return response.data || null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  static async getCategoryTree(): Promise<CategoryTree[]> {
    try {
      const response = await trpcClient.clientCategories.getCategoryTree.query() as unknown as ApiResponse<CategoryTree[]>;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  }

  static async getRootCategories(parentId?: string): Promise<Category[]> {
    try {
      const response = await trpcClient.clientCategories.getRootCategories.query({ parentId }) as unknown as ApiResponse<Category[]>;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching root categories:', error);
      throw error;
    }
  }

  static async getCategoryProducts(params: GetCategoryProductsParams): Promise<CategoryProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getProductsByCategory.query({
        categoryId: params.categoryRef,
        page: params.page || 1,
        limit: params.limit || 12,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }) as unknown as PaginatedApiResponse<Product>;

      const paginateData = response.data;
      if (paginateData?.items && paginateData.pagination) {
        return {
          items: paginateData.items,
          pagination: paginateData.pagination
        };
      }

      return {
        items: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  }
}
