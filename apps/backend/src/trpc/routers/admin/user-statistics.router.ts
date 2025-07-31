import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminUserStatisticsService } from '../../../modules/user/services/admin/admin-user-statistics.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../schemas/response.schemas';

// Zod schemas for user statistics
const userStatisticsTrendSchema = z.object({
  value: z.number(),
  isPositive: z.boolean(),
  label: z.string(),
}).optional();

const userStatisticsItemSchema = z.object({
  value: z.number(),
  trend: userStatisticsTrendSchema,
});

const userStatisticsWithProfileSchema = z.object({
  value: z.number(),
  percentage: z.number(),
});

const userStatisticsResponseSchema = z.object({
  totalUsers: userStatisticsItemSchema,
  activeUsers: userStatisticsItemSchema,
  newUsersThisMonth: userStatisticsItemSchema,
  usersWithProfiles: userStatisticsWithProfileSchema,
});

@Router({ alias: 'adminUserStatistics' })
@Injectable()
export class AdminUserStatisticsRouter {
  constructor(
    @Inject(AdminUserStatisticsService)
    private readonly adminUserStatisticsService: AdminUserStatisticsService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getUserStatistics(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const statistics = await this.adminUserStatisticsService.getUserStatistics();
      return this.responseHandler.createTrpcSuccess(statistics);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        10, // ModuleCode.USER
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve user statistics'
      );
    }
  }
}
