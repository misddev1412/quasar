import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductRepository, ProductFilters, PaginatedProducts } from '../repositories/product.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Product, ProductStatus } from '../entities/product.entity';
import { ApiStatusCodes } from '@shared';

export interface AdminProductFilters {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface ProductStatsResponse {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  discontinuedProducts: number;
  featuredProducts: number;
  totalStockValue: number;
  averagePrice: number;
  totalViews: number;
  categoryStats: Record<string, number>;
  brandStats: Record<string, number>;
  recentProducts: Product[];
  topViewedProducts: Product[];
}

@Injectable()
export class AdminProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async getAllProducts(filters: AdminProductFilters) {
    // Debug logging can be enabled when needed
    
    try {
      // Get products using repository
      const result = await this.productRepository.findAll({
        page: filters.page,
        limit: filters.limit,
        filters: {
          search: filters.search,
          brandId: filters.brandId,
          categoryId: filters.categoryId,
          status: filters.status,
          isActive: filters.isActive,
          isFeatured: filters.isFeatured,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          hasStock: filters.hasStock,
          createdFrom: filters.createdFrom,
          createdTo: filters.createdTo,
        }
      });
      
      // Transform results for frontend
      
      // For now, return the raw items without transformation to debug
      const transformedItems = result.items.map(product => ({
        id: product.id,
        name: product.name || 'Unknown Product',
        sku: product.sku || 'NO-SKU',
        description: product.description || '',
        status: product.status,
        brand: null, // Simplified for debugging
        category: null, // Simplified for debugging
        images: [],
        tags: [],
        variants: [],
        isFeatured: product.isFeatured || false,
        viewCount: 0,
        isActive: product.isActive !== false, // Default to true if undefined
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      const finalResult = {
        items: transformedItems,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
      
      // Return final result
      
      return finalResult;
      
    } catch (error) {
      console.error('ERROR in AdminProductService.getAllProducts:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve products: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProductById(id: string, relations: string[] = []): Promise<Product> {
    const product = await this.productRepository.findById(id, relations);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      // Check for duplicate SKU if provided
      if (productData.sku) {
        const existingProduct = await this.productRepository.findBySku(productData.sku);
        if (existingProduct) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Product with this SKU already exists',
            'CONFLICT'
          );
        }
      }

      return await this.productRepository.create(productData);
    } catch (error) {
      if (error.statusCode === ApiStatusCodes.CONFLICT) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to create product',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    try {
      // Check for duplicate SKU if updating SKU
      if (productData.sku && productData.sku !== existingProduct.sku) {
        const duplicateProduct = await this.productRepository.findBySku(productData.sku);
        if (duplicateProduct && duplicateProduct.id !== id) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Product with this SKU already exists',
            'CONFLICT'
          );
        }
      }

      const updatedProduct = await this.productRepository.update(id, productData);
      if (!updatedProduct) {
        throw new NotFoundException('Product not found after update');
      }

      return updatedProduct;
    } catch (error) {
      if (error.statusCode === ApiStatusCodes.CONFLICT) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update product',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      return await this.productRepository.delete(id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to delete product',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProductStats(): Promise<ProductStatsResponse> {
    try {
      return await this.productRepository.getStats();
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve product statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateProductStatus(id: string, isActive: boolean): Promise<Product> {
    return this.updateProduct(id, { isActive });
  }
}