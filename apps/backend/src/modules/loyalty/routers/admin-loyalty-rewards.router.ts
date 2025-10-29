import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminLoyaltyRewardService, CreateLoyaltyRewardDto, UpdateLoyaltyRewardDto } from '../services/admin-loyalty-reward.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { RewardType, DiscountType } from '../entities/loyalty-reward.entity';

export const rewardTypeSchema = z.nativeEnum(RewardType);
export const discountTypeSchema = z.nativeEnum(DiscountType);

export const getLoyaltyRewardsQuerySchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  type: rewardTypeSchema.optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'pointsRequired', 'sortOrder', 'createdAt']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
});

export const createLoyaltyRewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: rewardTypeSchema,
  pointsRequired: z.number().min(0),
  value: z.number().optional(),
  discountType: discountTypeSchema.optional(),
  conditions: z.string().optional(),
  isActive: z.boolean().optional(),
  isLimited: z.boolean().optional(),
  totalQuantity: z.number().optional(),
  remainingQuantity: z.number().optional(),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
  imageUrl: z.string().optional(),
  termsConditions: z.string().optional(),
  tierRestrictions: z.array(z.string()).optional(),
  autoApply: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const updateLoyaltyRewardSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: rewardTypeSchema.optional(),
  pointsRequired: z.number().min(0).optional(),
  value: z.number().optional(),
  discountType: discountTypeSchema.optional(),
  conditions: z.string().optional(),
  isActive: z.boolean().optional(),
  isLimited: z.boolean().optional(),
  totalQuantity: z.number().optional(),
  remainingQuantity: z.number().optional(),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
  imageUrl: z.string().optional(),
  termsConditions: z.string().optional(),
  tierRestrictions: z.array(z.string()).optional(),
  autoApply: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

@Router({ alias: 'adminLoyaltyRewards' })
@Injectable()
export class AdminLoyaltyRewardsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminLoyaltyRewardService)
    private readonly loyaltyRewardService: AdminLoyaltyRewardService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getLoyaltyRewardsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getLoyaltyRewardsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.loyaltyRewardService.getAllRewards({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        search: query.search,
        type: query.type,
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
        error.message || 'Failed to retrieve loyalty rewards'
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
      const reward = await this.loyaltyRewardService.getRewardById(input.id);
      return this.responseHandler.createTrpcSuccess(reward);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Loyalty reward not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createLoyaltyRewardSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createLoyaltyRewardSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const reward = await this.loyaltyRewardService.createReward(input as CreateLoyaltyRewardDto);
      return this.responseHandler.createTrpcSuccess(reward);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create loyalty reward'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateLoyaltyRewardSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateLoyaltyRewardSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const reward = await this.loyaltyRewardService.updateReward(id, updateData);
      return this.responseHandler.createTrpcSuccess(reward);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update loyalty reward'
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
      await this.loyaltyRewardService.deleteReward(input.id);
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
        error.message || 'Failed to delete loyalty reward'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyRewardService.getRewardStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve reward statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async active(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const rewards = await this.loyaltyRewardService.getActiveRewards();
      return this.responseHandler.createTrpcSuccess(rewards);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve active rewards'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ customerPoints: z.number().min(0) }),
    output: apiResponseSchema,
  })
  async availableForCustomer(
    @Input() input: { customerPoints: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const rewards = await this.loyaltyRewardService.getRewardsAvailableForCustomer(input.customerPoints);
      return this.responseHandler.createTrpcSuccess(rewards);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve available rewards for customer'
      );
    }
  }
}