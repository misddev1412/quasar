import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input, UseMiddlewares, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { MailLogService } from '../services/mail-log.service';
import { ResponseService } from '../../shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { AuthenticatedContext } from '../../../trpc/context';
import { MailLogStatus } from '../entities/mail-log.entity';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';

const mailLogStatusSchema = z.nativeEnum(MailLogStatus);

const listMailLogsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(255).optional(),
  status: mailLogStatusSchema.optional(),
  providerId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  flowId: z.string().uuid().optional(),
  isTest: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  channel: z.enum(['email', 'sms', 'push']).optional(),
});

@Router({ alias: 'adminMailLog' })
@Injectable()
export class AdminMailLogRouter {
  constructor(
    @Inject(MailLogService)
    private readonly mailLogService: MailLogService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: listMailLogsSchema,
    output: paginatedResponseSchema,
  })
  async getLogs(
    @Input() input: z.infer<typeof listMailLogsSchema>,
    @Ctx() _ctx: AuthenticatedContext,
  ) {
    const filters = {
      page: input.page,
      limit: input.limit,
      search: input.search,
      status: input.status,
      providerId: input.providerId,
      templateId: input.templateId,
      flowId: input.flowId,
      isTest: input.isTest,
      channel: input.channel,
      dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
      dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
    };

    try {
      const result = await this.mailLogService.getLogs(filters as any);
      return this.responseHandler.createTrpcSuccess({
        items: result.data.items,
        total: result.data.meta.total,
        page: result.data.meta.page,
        limit: result.data.meta.limit,
        totalPages: result.data.meta.totalPages,
      });
    } catch (error: any) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve mail logs',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getLogById(
    @Input() input: { id: string },
    @Ctx() _ctx: AuthenticatedContext,
  ) {
    try {
      const result = await this.mailLogService.getLogById(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error: any) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL,
        OperationCode.READ,
        error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve mail log',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStatistics(@Ctx() _ctx: AuthenticatedContext) {
    try {
      const result = await this.mailLogService.getStatistics();
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error: any) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve mail log statistics',
        error,
      );
    }
  }
}
