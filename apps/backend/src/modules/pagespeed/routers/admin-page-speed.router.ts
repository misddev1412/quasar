import { Inject, Injectable } from '@nestjs/common';
import { Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { PageSpeedService } from '@backend/modules/pagespeed/services/page-speed.service';
import { PageSpeedConfigService } from '@backend/modules/pagespeed/services/page-speed-config.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '@backend/trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '@backend/trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '@backend/trpc/schemas/response.schemas';
import { ErrorLevelCode, ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';

const runPageSpeedInputSchema = z.object({
  url: z.string().url(),
  strategy: z.enum(['mobile', 'desktop']).default('mobile'),
  categories: z.array(z.enum(['performance', 'accessibility', 'best-practices', 'seo', 'pwa'])).optional(),
  locale: z.string().optional(),
});

const updatePageSpeedConfigSchema = z.object({
  apiKey: z.string().optional(),
});

@Router({ alias: 'adminPageSpeed' })
@Injectable()
export class AdminPageSpeedRouter {
  constructor(
    @Inject(PageSpeedService)
    private readonly pageSpeedService: PageSpeedService,
    @Inject(PageSpeedConfigService)
    private readonly pageSpeedConfigService: PageSpeedConfigService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getConfig() {
    try {
      const config = await this.pageSpeedConfigService.getConfig();
      return this.responseHandler.createTrpcSuccess({ hasApiKey: config.hasApiKey });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ANALYTICS,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to get PageSpeed configuration',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updatePageSpeedConfigSchema,
    output: apiResponseSchema,
  })
  async updateConfig(@Input() input: z.infer<typeof updatePageSpeedConfigSchema>) {
    try {
      await this.pageSpeedConfigService.updateConfig(input);
      return this.responseHandler.createTrpcSuccess({ message: 'PageSpeed configuration updated successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ANALYTICS,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to update PageSpeed configuration',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: runPageSpeedInputSchema,
    output: apiResponseSchema,
  })
  async runInsights(@Input() input: z.infer<typeof runPageSpeedInputSchema>) {
    try {
      const result = await this.pageSpeedService.runInsights(input);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ANALYTICS,
        OperationCode.READ,
        ErrorLevelCode.EXTERNAL_API_ERROR,
        error.message || 'Failed to run Google PageSpeed insights',
      );
    }
  }
}
