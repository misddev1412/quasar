import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { UserActivityStatusService } from '../services/user-activity-status.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';

// Zod schemas for user activity
const userActivityStatusSchema = z.object({
  userId: z.string(),
  isCurrentlyActive: z.boolean(),
  lastActivityAt: z.date(),
  sessionCount: z.number(),
  deviceTypes: z.array(z.string()),
  locations: z.array(z.string()),
});

const activitySummarySchema = z.object({
  currentlyActiveUsers: z.number(),
  recentlyActiveUsers: z.number(),
  totalActiveSessions: z.number(),
  averageSessionDuration: z.number(),
  topActiveUsers: z.array(z.object({
    userId: z.string(),
    activityCount: z.number(),
    lastActivityAt: z.date(),
  })),
});

const getUserActivityStatusInputSchema = z.object({
  userId: z.string(),
});

const getBulkUserActivityStatusInputSchema = z.object({
  userIds: z.array(z.string()),
});

@Router({ alias: 'adminUserActivity' })
@Injectable()
export class AdminUserActivityRouter {
  constructor(
    @Inject(UserActivityStatusService)
    private readonly userActivityStatusService: UserActivityStatusService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getUserActivityStatusInputSchema,
    output: apiResponseSchema,
  })
  async getUserActivityStatus(
    @Input() input: z.infer<typeof getUserActivityStatusInputSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const activityStatus = await this.userActivityStatusService.getUserActivityStatus(input.userId);
      return this.responseHandler.createTrpcSuccess(activityStatus);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.USER_ACTIVITY
        1,  // OperationCode.READ
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to get user activity status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getBulkUserActivityStatusInputSchema,
    output: apiResponseSchema,
  })
  async getBulkUserActivityStatus(
    @Input() input: z.infer<typeof getBulkUserActivityStatusInputSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const activityStatuses = await this.userActivityStatusService.getBulkUserActivityStatus(input.userIds);
      return this.responseHandler.createTrpcSuccess(activityStatuses);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.USER_ACTIVITY
        1,  // OperationCode.READ
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to get bulk user activity status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getCurrentlyActiveUsers(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const activeUsers = await this.userActivityStatusService.getCurrentlyActiveUsers();
      return this.responseHandler.createTrpcSuccess(activeUsers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.USER_ACTIVITY
        1,  // OperationCode.READ
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to get currently active users'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getRecentlyActiveUsers(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const recentUsers = await this.userActivityStatusService.getRecentlyActiveUsers();
      return this.responseHandler.createTrpcSuccess(recentUsers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.USER_ACTIVITY
        1,  // OperationCode.READ
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to get recently active users'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getActivitySummary(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const summary = await this.userActivityStatusService.getActivitySummary();
      return this.responseHandler.createTrpcSuccess(summary);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        21, // ModuleCode.USER_ACTIVITY
        1,  // OperationCode.READ
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to get activity summary'
      );
    }
  }
}
