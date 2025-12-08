import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { MailProviderService } from '../services/mail-provider.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ErrorLevelCode, ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';

// Zod schemas for mail provider operations
const createMailProviderSchema = z.object({
  name: z.string().min(2).max(255),
  providerType: z.string().max(100).default('smtp'),
  description: z.string().max(1000).nullable().optional().transform(val => val === null ? undefined : val),
  smtpHost: z.string().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  smtpPort: z.number().int().min(1).max(65535).nullable().optional().transform(val => val === null ? undefined : val),
  smtpSecure: z.boolean().optional().default(true),
  smtpUsername: z.string().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  smtpPassword: z.string().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  apiKey: z.string().max(500).nullable().optional().transform(val => val === null ? undefined : val),
  apiSecret: z.string().max(500).nullable().optional().transform(val => val === null ? undefined : val),
  apiHost: z.string().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  defaultFromEmail: z.string().email().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  defaultFromName: z.string().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  replyToEmail: z.string().email().max(255).nullable().optional().transform(val => val === null ? undefined : val),
  isActive: z.boolean().optional().default(true),
  rateLimit: z.number().int().min(1).nullable().optional().transform(val => val === null ? undefined : val),
  maxDailyLimit: z.number().int().min(1).nullable().optional().transform(val => val === null ? undefined : val),
  priority: z.number().int().min(1).max(10).optional().default(5),
  config: z.record(z.any()).nullable().optional().transform(val => val === null ? undefined : val),
  webhookUrl: z.string().max(500).nullable().optional().transform(val => val === null ? undefined : val),
});

const updateMailProviderSchema = createMailProviderSchema.partial();

const getMailProvidersQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  providerType: z.string().max(100).optional(),
});

@Router({ alias: 'adminMailProvider' })
@Injectable()
export class AdminMailProviderRouter {
  constructor(
    @Inject(MailProviderService)
    private readonly mailProviderService: MailProviderService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createMailProviderSchema,
    output: apiResponseSchema,
  })
  async createProvider(
    @Input() input: z.infer<typeof createMailProviderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mailProviderService.createProvider(input as any);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.CREATE,
        error?.status === 409 ? ErrorLevelCode.CONFLICT : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create mail provider'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getMailProvidersQuerySchema,
    output: paginatedResponseSchema,
  })
  async getProviders(
    @Input() input: z.infer<typeof getMailProvidersQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.mailProviderService.getProviders(input as any);
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
        error.message || 'Failed to retrieve mail providers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getProviderById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mailProviderService.getProviderById(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Mail provider not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getActiveProviders(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mailProviderService.getActiveProviders();
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to retrieve active mail providers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateMailProviderSchema),
    output: apiResponseSchema,
  })
  async updateProvider(
    @Input() input: { id: string } & z.infer<typeof updateMailProviderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const result = await this.mailProviderService.updateProvider(id, updateDto as any);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND :
                        error?.status === 409 ? ErrorLevelCode.CONFLICT : 
                        ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.UPDATE,
        errorLevel,
        error.message || 'Failed to update mail provider'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteProvider(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mailProviderService.deleteProvider(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.DELETE,
        errorLevel,
        error.message || 'Failed to delete mail provider'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ 
      id: z.string().uuid(),
      testEmail: z.string().email().optional(),
    }),
    output: apiResponseSchema,
  })
  async testConnection(
    @Input() input: { id: string; testEmail?: string },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mailProviderService.testConnection(input.id, input.testEmail, ctx.user?.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND : 
                        error?.status === 400 ? ErrorLevelCode.BUSINESS_LOGIC_ERROR :
                        ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.PROCESS,
        errorLevel,
        error.message || 'Failed to test mail provider connection'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createMailProviderSchema.extend({
      testEmail: z.string().email().optional(),
    }),
    output: apiResponseSchema,
  })
  async testConnectionWithData(
    @Input() input: z.infer<typeof createMailProviderSchema> & { testEmail?: string },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { testEmail, ...providerData } = input;
      const result = await this.mailProviderService.testConnectionWithData(providerData as any, testEmail, ctx.user?.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 400 ? ErrorLevelCode.BUSINESS_LOGIC_ERROR : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.PROCESS,
        errorLevel,
        error.message || 'Failed to test mail provider connection'
      );
    }
  }
}
