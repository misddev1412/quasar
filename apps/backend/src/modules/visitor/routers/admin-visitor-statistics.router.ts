import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminVisitorStatisticsService } from '../services/admin/admin-visitor-statistics.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';

// Zod schemas for validation
const GetOverallStatsSchema = z.object({
  days: z.number().min(1).max(365).default(30),
});

const GetTrendsSchema = z.object({
  days: z.number().min(1).max(365).default(30),
  weeks: z.number().min(1).max(52).default(12),
  months: z.number().min(1).max(24).default(12),
});

const GetTopPagesSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  days: z.number().min(1).max(365).default(30),
});

@Router({ alias: 'adminVisitorStatistics' })
@Injectable()
export class AdminVisitorStatisticsRouter {
  constructor(
    @Inject(AdminVisitorStatisticsService)
    private readonly adminVisitorStatisticsService: AdminVisitorStatisticsService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getOverallStats(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getOverallStatistics(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve overall statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetTrendsSchema,
    output: apiResponseSchema,
  })
  async getDailyTrends(
    @Input() input: z.infer<typeof GetTrendsSchema>
  ) {
    try {
      const trends = await this.adminVisitorStatisticsService.getDailyTrends(input.days);
      return this.responseHandler.createTrpcSuccess(trends);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve daily trends'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetTrendsSchema,
    output: apiResponseSchema,
  })
  async getWeeklyTrends(
    @Input() input: z.infer<typeof GetTrendsSchema>
  ) {
    try {
      const trends = await this.adminVisitorStatisticsService.getWeeklyTrends(input.weeks);
      return this.responseHandler.createTrpcSuccess(trends);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve weekly trends'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetTrendsSchema,
    output: apiResponseSchema,
  })
  async getMonthlyTrends(
    @Input() input: z.infer<typeof GetTrendsSchema>
  ) {
    try {
      const trends = await this.adminVisitorStatisticsService.getMonthlyTrends(input.months);
      return this.responseHandler.createTrpcSuccess(trends);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve monthly trends'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetTopPagesSchema,
    output: apiResponseSchema,
  })
  async getTopPages(
    @Input() input: z.infer<typeof GetTopPagesSchema>
  ) {
    try {
      const pages = await this.adminVisitorStatisticsService.getTopPages(input.limit, input.days);
      return this.responseHandler.createTrpcSuccess(pages);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve top pages'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getPageViewStatsByType(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getPageViewStatsByType(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve page view statistics by type'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getVisitorStatsBySource(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getVisitorStatsBySource(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve visitor statistics by source'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getRealTimeStats() {
    try {
      const stats = await this.adminVisitorStatisticsService.getRealTimeStatistics();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve real-time statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getGeographicStats(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getGeographicStatistics(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve geographic statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getDeviceStats(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getDeviceStatistics(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve device statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getConversionStats(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getConversionStatistics(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve conversion statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: GetOverallStatsSchema,
    output: apiResponseSchema,
  })
  async getTrafficSources(
    @Input() input: z.infer<typeof GetOverallStatsSchema>
  ) {
    try {
      const stats = await this.adminVisitorStatisticsService.getTrafficSources(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.VISITOR_ANALYTICS
        1,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve traffic sources'
      );
    }
  }
}