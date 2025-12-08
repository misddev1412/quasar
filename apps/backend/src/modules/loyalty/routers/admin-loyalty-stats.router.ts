import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminLoyaltyStatsService } from '../services/admin-loyalty-stats.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';

@Router({ alias: 'adminLoyaltyStats' })
@Injectable()
export class AdminLoyaltyStatsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminLoyaltyStatsService)
    private readonly loyaltyStatsService: AdminLoyaltyStatsService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ days: z.number().min(1).max(365).default(30) }),
    output: apiResponseSchema,
  })
  async get(
    @Input() input: { days: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyStatsService.getLoyaltyStats(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve loyalty statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async dashboard(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyStatsService.getDashboardStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve dashboard statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async customerEngagement(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyStatsService.getCustomerEngagementStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customer engagement statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ days: z.number().min(1).max(365).default(30) }),
    output: apiResponseSchema,
  })
  async pointsFlow(
    @Input() input: { days: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyStatsService.getPointsFlowStats(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve points flow statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async tierDistribution(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const distribution = await this.loyaltyStatsService.getTierDistribution();
      return this.responseHandler.createTrpcSuccess(distribution);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve tier distribution'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async rewardPerformance(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const performance = await this.loyaltyStatsService.getRewardPerformance();
      return this.responseHandler.createTrpcSuccess(performance);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve reward performance data'
      );
    }
  }
}