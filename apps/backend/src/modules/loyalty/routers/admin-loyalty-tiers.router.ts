import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminLoyaltyTierService, CreateLoyaltyTierDto, UpdateLoyaltyTierDto } from '../services/admin-loyalty-tier.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';

export const getLoyaltyTiersQuerySchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'minPoints', 'sortOrder', 'createdAt']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
});

export const createLoyaltyTierSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  minPoints: z.number().min(0),
  maxPoints: z.number().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const updateLoyaltyTierSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  minPoints: z.number().min(0).optional(),
  maxPoints: z.number().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

@Router({ alias: 'adminLoyaltyTiers' })
@Injectable()
export class AdminLoyaltyTiersRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminLoyaltyTierService)
    private readonly loyaltyTierService: AdminLoyaltyTierService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getLoyaltyTiersQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getLoyaltyTiersQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.loyaltyTierService.getAllTiers({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        search: query.search,
        isActive: query.isActive,
        sortBy: query.sortBy ?? 'sortOrder',
        sortOrder: query.sortOrder ?? 'ASC',
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve loyalty tiers'
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
      const tier = await this.loyaltyTierService.getTierById(input.id);
      return this.responseHandler.createTrpcSuccess(tier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Loyalty tier not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createLoyaltyTierSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createLoyaltyTierSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const tier = await this.loyaltyTierService.createTier(input as CreateLoyaltyTierDto);
      return this.responseHandler.createTrpcSuccess(tier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create loyalty tier'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateLoyaltyTierSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateLoyaltyTierSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const tier = await this.loyaltyTierService.updateTier(id, updateData);
      return this.responseHandler.createTrpcSuccess(tier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update loyalty tier'
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
      await this.loyaltyTierService.deleteTier(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete loyalty tier'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyTierService.getTierStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve tier statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async active(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const tiers = await this.loyaltyTierService.getActiveTiers();
      return this.responseHandler.createTrpcSuccess(tiers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve active tiers'
      );
    }
  }
}