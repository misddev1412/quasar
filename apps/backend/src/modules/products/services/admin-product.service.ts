import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductRepository, ProductFilters, PaginatedProducts } from '../repositories/product.repository';
import { ProductMediaRepository, CreateProductMediaDto } from '../repositories/product-media.repository';
import { ProductVariantRepository, CreateProductVariantDto, UpdateProductVariantDto } from '../repositories/product-variant.repository';
import { ProductSpecificationRepository, CreateProductSpecificationDto } from '../repositories/product-specification.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Product, ProductStatus } from '../entities/product.entity';
import { MediaType } from '../entities/product-media.entity';
import { ApiStatusCodes } from '@shared';
import { ProductTransformer, TransformedProduct } from '../transformers/product.transformer';

export interface AdminProductFilters {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryIds?: string[];
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
    private readonly productMediaRepository: ProductMediaRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productSpecificationRepository: ProductSpecificationRepository,
    private readonly responseHandler: ResponseService,
    private readonly productTransformer: ProductTransformer,
  ) {}

  async getAllProducts(filters: AdminProductFilters) {
    try {
      // Get products using repository with all relations like detail endpoint
      const result = await this.productRepository.findAll({
        page: filters.page,
        limit: filters.limit,
        relations: ['media', 'variants', 'variants.variantItems', 'variants.variantItems.attribute', 'variants.variantItems.attributeValue', 'brand', 'productCategories', 'productCategories.category', 'specifications'],
        filters: {
          search: filters.search,
          brandId: filters.brandId,
          categoryIds: filters.categoryIds,
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


      // Transform products to consistent frontend format
      const transformedItems = await this.productTransformer.transformProducts(result.items);

      const finalResult = {
        items: transformedItems,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };

      return finalResult;

    } catch (error) {

      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve products: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getProductById(id: string, relations: string[] = ['media', 'variants', 'variants.variantItems', 'variants.variantItems.attribute', 'variants.variantItems.attributeValue', 'brand', 'productCategories', 'productCategories.category', 'specifications']): Promise<TransformedProduct> {
    const product = await this.productRepository.findById(id, relations);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Transform product to consistent frontend format
    return await this.productTransformer.transformProduct(product);
  }

  async createProduct(productData: any): Promise<Product> {
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

      // Helper function to handle empty strings and convert to null
      const cleanUuid = (value: any) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return null;
        }
        return value;
      };

      // Transform the data to match the entity structure
      const transformedData: Partial<Product> = {
        name: productData.name,
        description: productData.description || null,
        sku: productData.sku || null,
        status: productData.status || 'DRAFT',
        brandId: cleanUuid(productData.brandId),
        warrantyId: cleanUuid(productData.warrantyId),
        metaTitle: productData.metaTitle || null,
        metaDescription: productData.metaDescription || null,
        metaKeywords: productData.metaKeywords || null,
        isFeatured: productData.isFeatured || false,
        isActive: true, // Default to active
      };

      // Handle media - will be processed after product creation

      // For now, skip tags and variants processing - these will need separate handling
      // as they involve relations that should be created after the product is saved

      const product = await this.productRepository.create(transformedData);

      // Handle media creation
      if (productData.media && Array.isArray(productData.media)) {
        await this.handleProductMedia(product.id, productData.media);
      }

      if (productData.specifications && Array.isArray(productData.specifications)) {
        await this.handleProductSpecifications(product.id, productData.specifications);
      }

      // Handle variants creation
      if (productData.variants && Array.isArray(productData.variants)) {
        await this.handleProductVariants(product.id, productData.variants);
      }

      // Handle category assignments
      if (productData.categoryIds && Array.isArray(productData.categoryIds)) {
        await this.handleProductCategories(product.id, productData.categoryIds);
      }

      // TODO: Handle tags after product creation
      // This would require additional service methods to create related entities

      return product;
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

  async updateProduct(id: string, productData: any): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    try {
      // Helper function to handle empty strings and convert to null
      const cleanUuid = (value: any) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return null;
        }
        return value;
      };

      // Transform the data to match the entity structure
      const transformedData: Partial<Product> = {
        name: productData.name,
        description: productData.description || null,
        sku: productData.sku || null,
        status: productData.status || 'DRAFT',
        brandId: cleanUuid(productData.brandId),
        warrantyId: cleanUuid(productData.warrantyId),
        metaTitle: productData.metaTitle || null,
        metaDescription: productData.metaDescription || null,
        metaKeywords: productData.metaKeywords || null,
        isFeatured: productData.isFeatured || false,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
      };

      // Handle media - will be processed after product update

      // Check for duplicate SKU if updating SKU
      if (transformedData.sku && transformedData.sku !== existingProduct.sku) {
        const duplicateProduct = await this.productRepository.findBySku(transformedData.sku);
        if (duplicateProduct && duplicateProduct.id !== id) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Product with this SKU already exists',
            'CONFLICT'
          );
        }
      }

      const updatedProduct = await this.productRepository.update(id, transformedData);
      if (!updatedProduct) {
        throw new NotFoundException('Product not found after update');
      }

      // Handle media update
      if (productData.media && Array.isArray(productData.media)) {
        await this.handleProductMedia(id, productData.media);
      }

      if (productData.specifications !== undefined) {
        if (Array.isArray(productData.specifications)) {
          await this.handleProductSpecifications(id, productData.specifications);
        } else {
          await this.productSpecificationRepository.deleteByProductId(id);
        }
      }

      // Handle variants update - only if variants are explicitly provided
      if (productData.variants !== undefined) {
        if (Array.isArray(productData.variants)) {
          await this.handleProductVariants(id, productData.variants);
        } else {
          // If variants is not an array, delete all existing variants
          await this.productVariantRepository.deleteByProductId(id);
        }
      }

      // Handle category assignments - only if categoryIds are explicitly provided
      if (productData.categoryIds !== undefined) {
        if (Array.isArray(productData.categoryIds)) {
          await this.handleProductCategories(id, productData.categoryIds);
        } else {
          // If categoryIds is not an array, clear all category assignments
          await this.handleProductCategories(id, []);
        }
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

  private async handleProductMedia(productId: string, mediaData: any[]): Promise<void> {
    try {
      // Delete existing media for this product
      await this.productMediaRepository.deleteByProductId(productId);

      // Create new media entries
      if (mediaData.length > 0) {
        const createMediaData: CreateProductMediaDto[] = mediaData.map((media, index) => ({
          productId,
          type: (media.type as MediaType) || MediaType.IMAGE,
          url: media.url,
          altText: media.altText || null,
          caption: media.caption || null,
          sortOrder: media.sortOrder !== undefined ? media.sortOrder : index,
          fileSize: media.fileSize || null,
          mimeType: media.mimeType || null,
          width: media.width || null,
          height: media.height || null,
          duration: media.duration || null,
          thumbnailUrl: media.thumbnailUrl || null,
          isPrimary: media.isPrimary || false,
        }));

        await this.productMediaRepository.createMany(createMediaData);
      }
    } catch (error) {
      throw new Error('Failed to update product media');
    }
  }

  private async handleProductVariants(productId: string, variantsData: any[]): Promise<void> {
    try {
      // Delete existing variants for this product first
      await this.productVariantRepository.deleteByProductId(productId);

      // Create new variants only if there are any
      if (variantsData && variantsData.length > 0) {
        for (const variantData of variantsData) {

          const createVariantData: CreateProductVariantDto = {
            productId,
            name: variantData.name || 'Default Variant',
            sku: variantData.sku || null,
            barcode: variantData.barcode || null,
            price: Number(variantData.price) || 0,
            compareAtPrice: variantData.compareAtPrice ? Number(variantData.compareAtPrice) : null,
            costPrice: variantData.costPrice ? Number(variantData.costPrice) : null,
            stockQuantity: Number(variantData.stockQuantity) || 0,
            lowStockThreshold: variantData.lowStockThreshold ? Number(variantData.lowStockThreshold) : null,
            trackInventory: Boolean(variantData.trackInventory),
            allowBackorders: Boolean(variantData.allowBackorders),
            weight: variantData.weight ? Number(variantData.weight) : null,
            dimensions: variantData.dimensions || null,
            image: variantData.image || null,
            isActive: Boolean(variantData.isActive),
            sortOrder: Number(variantData.sortOrder) || 0,
            variantItems: variantData.variantItems || [],
          };

          await this.productVariantRepository.create(createVariantData);
        }
      }
    } catch (error) {
      throw new Error('Failed to update product variants: ' + error.message);
    }
  }

  private async handleProductSpecifications(productId: string, specifications: any[]): Promise<void> {
    const normalized = specifications
      .filter((spec) => spec && typeof spec.name === 'string' && spec.name.trim() !== '' && spec.value !== undefined && spec.value !== null)
      .map((spec, index): CreateProductSpecificationDto => {
        const parsedOrder = spec.sortOrder !== undefined ? Number(spec.sortOrder) : index;
        const sortOrder = Number.isFinite(parsedOrder) ? parsedOrder : index;

        return {
          productId,
          name: String(spec.name).trim(),
          value: String(spec.value).trim(),
          sortOrder,
        };
      });

    if (normalized.length === 0) {
      await this.productSpecificationRepository.deleteByProductId(productId);
      return;
    }

    await this.productSpecificationRepository.replaceForProduct(productId, normalized);
  }

  private async handleProductCategories(productId: string, categoryIds: string[]): Promise<void> {
    try {
      // Update product categories using repository method
      await this.productRepository.updateProductCategories(productId, categoryIds);
    } catch (error) {
      throw new Error('Failed to update product categories: ' + error.message);
    }
  }
}
