import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminProductService } from '../services/admin-product.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { ProductStatus } from '../entities/product.entity';

export const productStatusSchema = z.nativeEnum(ProductStatus);

export const getProductsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  hasStock: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
});

@Router({ alias: 'adminProducts' })
@Injectable()
export class AdminProductsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminProductService)
    private readonly productService: AdminProductService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getProductsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getProductsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: query.page,
        limit: query.limit,
        search: query.search,
        brandId: query.brandId,
        categoryId: query.categoryId,
        status: query.status,
        isActive: query.isActive,
        isFeatured: query.isFeatured,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        hasStock: query.hasStock,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
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

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.getProductById(input.id);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Product not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createProductSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createProductSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.createProduct(input);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create product'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateProductSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateProductSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const product = await this.productService.updateProduct(id, updateDto);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update product'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.productService.deleteProduct(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete product'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.productService.getProductStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve product statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string(),
      isActive: z.boolean(),
    }),
    output: apiResponseSchema,
  })
  async updateStatus(
    @Input() input: { id: string; isActive: boolean }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.updateProductStatus(input.id, input.isActive);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update product status'
      );
    }
  }
}