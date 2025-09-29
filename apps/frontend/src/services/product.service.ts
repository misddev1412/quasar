import { trpcClient } from '../utils/trpc';
import type {
  PaginatedApiResponse,
  ApiResponse,
  PaginationInfo
} from '../types/api';
import type {
  Product,
  ProductFilters
} from '../types/product';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface ProductListResponse {
  items: Product[];
  pagination: PaginationInfo;
}

export class ProductService {
  static async getProducts(params: GetProductsParams = {}): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getProducts.query(params);
      // For paginated responses, the data is directly in response.data
      const paginateData = response?.data;

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
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await trpcClient.clientProducts.getProductById.query({ id });
      // For single product responses, the data is wrapped in a product object
      return response.data?.product || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await trpcClient.clientProducts.getProductBySlug.query({ slug });
      // For single product responses, the data is wrapped in a product object
      return response.data?.product || null;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      throw error;
    }
  }

  static async getFeaturedProducts(): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getFeaturedProducts.query();

      // For paginated responses, the data is directly in response.data
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
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  static async getNewProducts(): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getNewProducts.query();

      // For paginated responses, the data is directly in response.data
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
      console.error('Error fetching new products:', error);
      throw error;
    }
  }

  static async getProductsByCategory(categoryId?: string): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getProductsByCategory.query({ categoryId });

      // For paginated responses, the data is directly in response.data
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
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  static async getProductFilters(): Promise<ProductFilters> {
    try {
      const response = await trpcClient.clientProducts.getProductFilters.query();
      // For filters, the data is directly in response.data
      return response.data || {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 0 }
      };
    } catch (error) {
      console.error('Error fetching product filters:', error);
      throw error;
    }
  }
}