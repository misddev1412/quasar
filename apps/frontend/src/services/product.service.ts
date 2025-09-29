import { trpcClient } from '../utils/trpc';

export interface ProductFilter {
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  brands: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
}

export class ProductService {
  static async getProductFilters(): Promise<ProductFilter> {
    try {
      const response = await trpcClient.clientProducts.getProductFilters.query();
      return response.data as ProductFilter;
    } catch (error) {
      console.error('Error fetching product filters:', error);
      throw error;
    }
  }
}