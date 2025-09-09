import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { BrandRepository } from '../repositories/brand.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';

export const getBrandsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const createBrandSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
});

export const updateBrandSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

@Router({ alias: 'adminProductBrands' })
@Injectable()
export class AdminProductBrandsRouter {
  constructor(
    @Inject(BrandRepository)
    private readonly brandRepository: BrandRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getBrandsQuerySchema,
    output: paginatedResponseSchema,
  })
  async getAll(
    @Input() query: z.infer<typeof getBrandsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const { page, limit, search, isActive, sortBy, sortOrder } = query;
      
      // This is a placeholder - you'll need to implement the actual service method
      const result = await this.brandRepository.findMany({
        page,
        limit,
        search,
        isActive,
        sortBy,
        sortOrder,
      });

      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve brands'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const brand = await this.brandRepository.findById(input.id);
      if (!brand) {
        throw new Error('Brand not found');
      }
      return this.responseHandler.createTrpcSuccess(brand);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Brand not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createBrandSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createBrandSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const brand = await this.brandRepository.create(input);
      return this.responseHandler.createTrpcSuccess(brand);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create brand'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateBrandSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateBrandSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const brand = await this.brandRepository.update(id, updateData);
      return this.responseHandler.createTrpcSuccess(brand);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update brand'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.brandRepository.delete(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete brand'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.brandRepository.getStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve brand statistics'
      );
    }
  }
}