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

export const createBrandTranslationSchema = z.object({
  brandId: z.string().uuid(),
  locale: z.string().min(2).max(5),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const updateBrandTranslationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
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

  // Translation endpoints
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ 
      brandId: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getBrandTranslations(
    @Input() input: { brandId: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (input.locale) {
        const translation = await this.brandRepository.findBrandTranslation(input.brandId, input.locale);
        return this.responseHandler.createTrpcSuccess(translation);
      } else {
        const translations = await this.brandRepository.findBrandTranslations(input.brandId);
        return this.responseHandler.createTrpcSuccess(translations);
      }
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve brand translations'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ 
      id: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getByIdWithTranslations(
    @Input() input: { id: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const brand = await this.brandRepository.findByIdWithTranslations(input.id, input.locale);
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
    input: createBrandTranslationSchema,
    output: apiResponseSchema,
  })
  async createBrandTranslation(
    @Input() input: z.infer<typeof createBrandTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.brandRepository.createBrandTranslation({
        brand_id: input.brandId,
        locale: input.locale,
        name: input.name,
        description: input.description,
      });
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create brand translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      brandId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }).merge(updateBrandTranslationSchema),
    output: apiResponseSchema,
  })
  async updateBrandTranslation(
    @Input() input: { brandId: string; locale: string } & z.infer<typeof updateBrandTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { brandId, locale, ...updateData } = input;
      const translation = await this.brandRepository.updateBrandTranslation(brandId, locale, updateData);
      
      if (!translation) {
        throw this.responseHandler.createTRPCError(
          50, // ModuleCode.PRODUCT
          3,  // OperationCode.UPDATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Brand translation not found'
        );
      }
      
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update brand translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      brandId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }),
    output: apiResponseSchema,
  })
  async deleteBrandTranslation(
    @Input() input: { brandId: string; locale: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.brandRepository.deleteBrandTranslation(input.brandId, input.locale);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete brand translation'
      );
    }
  }
}