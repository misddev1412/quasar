import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminProductService } from '../services/admin-product.service';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';

const getPublicProductsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

const getProductByIdSchema = z.object({
  id: z.string(),
});

@Router({ alias: 'publicProducts' })
@Injectable()
export class PublicProductsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminProductService)
    private readonly productService: AdminProductService,
  ) {}

  @Query({
    input: getPublicProductsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getPublicProductsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: query.page,
        limit: query.limit,
        search: query.search,
        brandId: query.brandId,
        categoryId: query.categoryId,
        status: 'ACTIVE' as any, // Only show active products publicly
        isActive: true,
        isFeatured: query.isFeatured,
      };

      const result = await this.productService.getAllProducts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve products'
      );
    }
  }

  @Query({
    input: getProductByIdSchema,
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: z.infer<typeof getProductByIdSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.getProductById(input.id);
      
      // Only return active products publicly
      if (!product.isActive || product.status !== 'ACTIVE') {
        throw this.responseHandler.createTRPCError(
          15, // ModuleCode.PRODUCT
          2,  // OperationCode.READ
          4,  // ErrorLevelCode.NOT_FOUND
          'Product not available'
        );
      }

      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      if (error.statusCode) {
        throw error; // Re-throw TRPC errors
      }
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Product not found'
      );
    }
  }

  @Query({
    output: paginatedResponseSchema,
  })
  async featured(): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: 1,
        limit: 10,
        status: 'ACTIVE' as any,
        isActive: true,
        isFeatured: true,
      };

      const result = await this.productService.getAllProducts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve featured products'
      );
    }
  }

  @Query({
    input: z.object({
      categoryId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async byCategory(
    @Input() input: { categoryId: string; page: number; limit: number }
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: input.page,
        limit: input.limit,
        categoryId: input.categoryId,
        status: 'ACTIVE' as any,
        isActive: true,
      };

      const result = await this.productService.getAllProducts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve products by category'
      );
    }
  }

  @Query({
    input: z.object({
      brandId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async byBrand(
    @Input() input: { brandId: string; page: number; limit: number }
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: input.page,
        limit: input.limit,
        brandId: input.brandId,
        status: 'ACTIVE' as any,
        isActive: true,
      };

      const result = await this.productService.getAllProducts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve products by brand'
      );
    }
  }

  @Query({
    input: z.object({
      search: z.string().min(1),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async search(
    @Input() input: { search: string; page: number; limit: number }
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: input.page,
        limit: input.limit,
        search: input.search,
        status: 'ACTIVE' as any,
        isActive: true,
      };

      const result = await this.productService.getAllProducts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to search products'
      );
    }
  }

  @Query({
    input: z.object({}),
    output: z.object({
      data: z.string(), // base64 encoded file
      filename: z.string(),
      mimeType: z.string(),
    }),
  })
  async downloadExcelTemplate(
    @Input() input: {},
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    try {
      const buffer = await this.productService.generateExcelTemplate();
      const base64Data = buffer.toString('base64');
      const filename = `product-import-template-${new Date().toISOString().split('T')[0]}.xlsx`;

      return {
        data: base64Data,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to generate Excel template'
      );
    }
  }
}