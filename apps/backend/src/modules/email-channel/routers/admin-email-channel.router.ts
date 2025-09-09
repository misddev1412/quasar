import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { EmailChannelService } from '../services/email-channel.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ErrorLevelCode, ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';

// Zod schemas for email channel operations
const createEmailChannelSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  smtpHost: z.string().max(255),
  smtpPort: z.number().int().min(1).max(65535),
  smtpSecure: z.boolean(),
  smtpUsername: z.string().max(255).optional(),
  smtpPassword: z.string().max(255).optional(),
  defaultFromEmail: z.string().email().max(255),
  defaultFromName: z.string().max(255),
  replyToEmail: z.string().email().max(255).optional(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
  rateLimit: z.number().int().min(1).optional(),
  providerName: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill']).optional().default('smtp'),
  priority: z.number().int().min(1).max(10).optional().default(5),
  usageType: z.enum(['transactional', 'marketing', 'notification', 'general']).optional().default('general'),
  configKeys: z.record(z.any()).optional(),
  advancedConfig: z.record(z.any()).optional(),
  maxDailyLimit: z.number().int().min(1).optional(),
  webhookUrl: z.string().max(500).optional(),
});

const updateEmailChannelSchema = createEmailChannelSchema.partial();

const getEmailChannelsQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  providerName: z.string().max(100).optional(),
  usageType: z.string().max(50).optional(),
});

const cloneEmailChannelSchema = z.object({
  newName: z.string().min(2).max(255),
});

@Router({ alias: 'adminEmailChannel' })
@Injectable()
export class AdminEmailChannelRouter {
  constructor(
    @Inject(EmailChannelService)
    private readonly emailChannelService: EmailChannelService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createEmailChannelSchema,
    output: apiResponseSchema,
  })
  async createChannel(
    @Input() input: z.infer<typeof createEmailChannelSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.createChannel(input as any);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.CREATE,
        error?.status === 409 ? ErrorLevelCode.CONFLICT : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create email channel'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getEmailChannelsQuerySchema,
    output: paginatedResponseSchema,
  })
  async getChannels(
    @Input() input: z.infer<typeof getEmailChannelsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.emailChannelService.getChannels(input as any);
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
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve email channels'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getChannelById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.getChannelById(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Email channel not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getActiveChannels(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.getActiveChannels();
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve active email channels'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ usageType: z.string() }),
    output: apiResponseSchema,
  })
  async getChannelsByUsageType(
    @Input() input: { usageType: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.getChannelsByUsageType(input.usageType);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve email channels by usage type'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getDefaultChannel(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.getDefaultChannel();
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.READ,
        error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'No default email channel found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateEmailChannelSchema),
    output: apiResponseSchema,
  })
  async updateChannel(
    @Input() input: { id: string } & z.infer<typeof updateEmailChannelSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const result = await this.emailChannelService.updateChannel(id, updateDto as any);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND :
                        error?.status === 409 ? ErrorLevelCode.CONFLICT : 
                        ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.UPDATE,
        errorLevel,
        error.message || 'Failed to update email channel'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteChannel(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.deleteChannel(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.DELETE,
        errorLevel,
        error.message || 'Failed to delete email channel'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async setAsDefault(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.setAsDefault(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.UPDATE,
        errorLevel,
        error.message || 'Failed to set email channel as default'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async testChannel(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.testChannel(input.id);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.PROCESS,
        errorLevel,
        error.message || 'Failed to test email channel'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(cloneEmailChannelSchema),
    output: apiResponseSchema,
  })
  async cloneChannel(
    @Input() input: { id: string } & z.infer<typeof cloneEmailChannelSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.emailChannelService.cloneChannel(input.id, input.newName);
      return this.responseHandler.createTrpcSuccess(result.data);
    } catch (error) {
      const errorLevel = error?.status === 404 ? ErrorLevelCode.NOT_FOUND :
                        error?.status === 409 ? ErrorLevelCode.CONFLICT : 
                        ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        ModuleCode.EMAIL_CHANNEL,
        OperationCode.CREATE,
        errorLevel,
        error.message || 'Failed to clone email channel'
      );
    }
  }
}