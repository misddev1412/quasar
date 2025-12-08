import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { NotificationChannelConfigService } from '../services/notification-channel-config.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { NotificationEvent } from '../entities/notification-event.enum';
import { NotificationChannel } from '../entities/notification-preference.entity';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AuthenticatedContext } from '../../../trpc/context';

const notificationEventEnum = z.nativeEnum(NotificationEvent);
const notificationChannelEnum = z.enum(['push', 'email', 'in_app', 'sms', 'telegram']);

const upsertConfigSchema = z.object({
  eventKey: notificationEventEnum,
  displayName: z.string().min(3).max(150),
  description: z.string().max(500).optional(),
  allowedChannels: z.array(notificationChannelEnum).min(1),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateChannelsSchema = z.object({
  eventKey: notificationEventEnum,
  channels: z.array(notificationChannelEnum).min(1),
});

@Injectable()
@Router({ alias: 'adminNotificationChannels' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminNotificationChannelsRouter {
  constructor(
    private readonly channelConfigService: NotificationChannelConfigService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  async listConfigs(@Ctx() ctx: AuthenticatedContext) {
    try {
      const configs = await this.channelConfigService.list();
      return this.responseService.createTrpcSuccess(configs);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to fetch notification channel configs',
      );
    }
  }

  @Mutation({
    input: upsertConfigSchema,
    output: apiResponseSchema,
  })
  async upsertConfig(
    @Input() input: z.infer<typeof upsertConfigSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const config = await this.channelConfigService.upsertConfig({
        eventKey: input.eventKey,
        displayName: input.displayName,
        description: input.description,
        allowedChannels: input.allowedChannels as NotificationChannel[],
        isActive: input.isActive,
        metadata: input.metadata,
      });

      return this.responseService.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to update notification channel config',
      );
    }
  }

  @Mutation({
    input: updateChannelsSchema,
    output: apiResponseSchema,
  })
  async updateAllowedChannels(
    @Input() input: z.infer<typeof updateChannelsSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const config = await this.channelConfigService.setAllowedChannels(
        input.eventKey,
        input.channels as NotificationChannel[],
      );

      return this.responseService.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to update allowed channels',
      );
    }
  }

  @Mutation({
    output: apiResponseSchema,
  })
  async initializeDefaults(@Ctx() ctx: AuthenticatedContext) {
    try {
      await this.channelConfigService.initializeDefaults();
      return this.responseService.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to initialize notification channel configs',
      );
    }
  }
}
