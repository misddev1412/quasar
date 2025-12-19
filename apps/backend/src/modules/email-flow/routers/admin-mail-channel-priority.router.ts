import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { EmailFlowService } from '../services/email-flow.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ErrorLevelCode, ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';

// Zod schemas for mail channel priority operations
const createMailChannelPrioritySchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  mailProviderId: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().min(1).max(10).optional().default(5),
  config: z.record(z.any()).optional(),
  mailTemplateId: z.string().uuid().optional(),
});

const updateMailChannelPrioritySchema = createMailChannelPrioritySchema.partial();

const getMailChannelPrioritiesQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  mailProviderId: z.string().uuid().optional(),
  mailTemplateId: z.string().uuid().optional(),
});

@Router({ alias: 'adminMailChannelPriority' })
@Injectable()
export class AdminMailChannelPriorityRouter {
  constructor(
    @Inject(EmailFlowService)
    private readonly emailFlowService: EmailFlowService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createMailChannelPrioritySchema,
    output: apiResponseSchema,
  })
  async createFlow(
    @Input() input: z.infer<typeof createMailChannelPrioritySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailFlowService.createFlow(input as any);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.CREATE,
        error?.status === 409 ? ErrorLevelCode.CONFLICT : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create mail channel priority'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getMailChannelPrioritiesQuerySchema,
    output: paginatedResponseSchema,
  })
  async getFlows(
    @Input() input: z.infer<typeof getMailChannelPrioritiesQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.emailFlowService.getFlows(input as any);
      return this.responseHandler.createTrpcSuccess({
        items: result.data.items,
        total: result.data.meta.total,
        page: result.data.meta.page,
        limit: result.data.meta.limit,
        totalPages: result.data.meta.totalPages,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve mail channel priorities'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getFlowById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailFlowService.getFlowById(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Mail channel priority not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getActiveFlows(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailFlowService.getActiveFlows();
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve active mail channel priorities'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ mailProviderId: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getFlowsByProvider(
    @Input() input: { mailProviderId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailFlowService.getFlowsByProvider(input.mailProviderId);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve mail channel priorities by provider'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateMailChannelPrioritySchema),
    output: apiResponseSchema,
  })
  async updateFlow(
    @Input() input: { id: string } & z.infer<typeof updateMailChannelPrioritySchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const result = await this.emailFlowService.updateFlow(id, updateDto as any);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND :
                        error?.status === 409 ? ErrorLevelCode.CONFLICT : 
                        ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.UPDATE,
        errorLevel,
        error.message || 'Failed to update mail channel priority'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteFlow(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailFlowService.deleteFlow(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.DELETE,
        errorLevel,
        error.message || 'Failed to delete mail channel priority'
      );
    }
  }
}







