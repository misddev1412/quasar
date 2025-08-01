import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminChartDataService, ChartDataRequest } from '../../../modules/chart/services/admin-chart-data.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

// Zod schemas for chart data
const chartTypeSchema = z.enum(['line', 'bar', 'pie', 'area']);
const timePeriodSchema = z.enum(['7d', '30d', '90d', '1y', 'custom']);

const chartDataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
  label: z.string().optional(),
});

const pieChartDataPointSchema = z.object({
  name: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

const chartDataSchema = z.object({
  type: chartTypeSchema,
  title: z.string(),
  data: z.union([
    z.array(chartDataPointSchema),
    z.array(pieChartDataPointSchema),
  ]),
  period: timePeriodSchema,
  customDateRange: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }).optional(),
});

const getChartDataInputSchema = z.object({
  statisticId: z.string(),
  chartType: chartTypeSchema,
  period: timePeriodSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const getAvailableChartTypesInputSchema = z.object({
  statisticId: z.string(),
});

@Router({ alias: 'adminChartData' })
@Injectable()
export class AdminChartDataRouter {
  constructor(
    @Inject(AdminChartDataService)
    private readonly adminChartDataService: AdminChartDataService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getChartDataInputSchema,
    output: apiResponseSchema,
  })
  async getChartData(
    @Input() input: z.infer<typeof getChartDataInputSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const chartData = await this.adminChartDataService.getChartData(input as ChartDataRequest);
      return this.responseHandler.createTrpcSuccess(chartData);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.DASHBOARD, // Dashboard module for chart data
        OperationCode.READ,   // Read operation
        ErrorLevelCode.SERVER_ERROR, // Server error level
        error.message || 'Failed to retrieve chart data'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getAvailableChartTypesInputSchema,
    output: apiResponseSchema,
  })
  async getAvailableChartTypes(
    @Input() input: z.infer<typeof getAvailableChartTypesInputSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const availableTypes = await this.adminChartDataService.getAvailableChartTypes(input.statisticId);
      return this.responseHandler.createTrpcSuccess(availableTypes);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.DASHBOARD, // Dashboard module for chart data
        OperationCode.READ,   // Read operation
        ErrorLevelCode.SERVER_ERROR, // Server error level
        error.message || 'Failed to retrieve available chart types'
      );
    }
  }
}
