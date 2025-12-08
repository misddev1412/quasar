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
      const response = await trpcClient.clientProducts.getProducts.query(params) as unknown as PaginatedApiResponse<Product>;
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
      const response = await trpcClient.clientProducts.getProductById.query({ id }) as unknown as ApiResponse<{ product: Product }>;
      // For single product responses, the data is wrapped in a product object
      return response.data?.product || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await trpcClient.clientProducts.getProductBySlug.query({ slug }) as unknown as ApiResponse<{ product: Product }>;
      // For single product responses, the data is wrapped in a product object
      return response.data?.product || null;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      throw error;
    }
  }

  static async getFeaturedProducts(): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getFeaturedProducts.query() as unknown as PaginatedApiResponse<Product>;

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

  static async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const response = await trpcClient.clientProducts.getProductById.query({ id }) as unknown as ApiResponse<{ product: Product }>;
          const product = response.data?.product;
          if (!product) return null;

          const normalized: Product = { ...product } as Product;
          if (normalized.price == null) {
            const fallbackPrice = (product as any).lowestPrice ?? 0;
            normalized.price = fallbackPrice;
          }
          return normalized;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      })
    );

    return results.filter((product): product is Product => Boolean(product));
  }

  static async getNewProducts(): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getNewProducts.query() as unknown as PaginatedApiResponse<Product>;

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

  static async getProductsByCategory(
    categoryId?: string,
    options: { strategy?: 'latest' | 'featured' | 'bestsellers' | 'custom' } = {},
  ): Promise<ProductListResponse> {
    try {
      const response = await trpcClient.clientProducts.getProductsByCategory.query({
        categoryId,
        strategy: options.strategy,
      }) as unknown as PaginatedApiResponse<Product>;

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
      const response = await trpcClient.clientProducts.getProductFilters.query() as unknown as ApiResponse<ProductFilters>;
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
