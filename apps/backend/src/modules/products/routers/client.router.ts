import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminProductService } from '../services/admin-product.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';

const getProductsQuerySchema = z.object({
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

@Router({ alias: 'clientProducts' })
@Injectable()
export class ClientProductsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminProductService)
    private readonly productService: AdminProductService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getProductsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getProductsQuerySchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: query.page,
        limit: query.limit,
        search: query.search,
        brandId: query.brandId,
        categoryId: query.categoryId,
        status: 'ACTIVE' as any, // Only show active products to clients
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

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getProductByIdSchema,
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: z.infer<typeof getProductByIdSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.getProductById(input.id);
      
      // Only return active products to clients
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

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: paginatedResponseSchema,
  })
  async featured(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
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

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      categoryId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async byCategory(
    @Input() input: { categoryId: string; page: number; limit: number },
    @Ctx() ctx: AuthenticatedContext
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

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      brandId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async byBrand(
    @Input() input: { brandId: string; page: number; limit: number },
    @Ctx() ctx: AuthenticatedContext
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
}