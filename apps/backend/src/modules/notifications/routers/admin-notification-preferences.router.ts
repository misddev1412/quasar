import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { NotificationType } from '../entities/notification.entity';
import { NotificationChannel, NotificationFrequency } from '../entities/notification-preference.entity';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const notificationTypeEnum = z.enum([
  'info',
  'success',
  'warning',
  'error',
  'system',
  'product',
  'order',
  'user',
]);

const notificationChannelEnum = z.enum(['push', 'email', 'in_app', 'sms', 'telegram']);

const notificationFrequencyEnum = z.enum([
  'immediate',
  'hourly',
  'daily',
  'weekly',
  'never',
]);

const createPreferenceSchema = z.object({
  userId: z.string().uuid(),
  type: notificationTypeEnum,
  channel: notificationChannelEnum,
  enabled: z.boolean().optional().default(true),
  frequency: notificationFrequencyEnum.optional().default('immediate'),
  quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursTimezone: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

const getUserPreferencesSchema = z.object({
  userId: z.string().uuid(),
});

const deletePreferenceSchema = z.object({
  id: z.string().uuid(),
});

const updatePreferenceSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: notificationFrequencyEnum.optional(),
  quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursTimezone: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

const bulkUpdateSchema = z.object({
  preferences: z.array(
    z.object({
      type: notificationTypeEnum,
      channel: notificationChannelEnum,
      enabled: z.boolean().optional(),
      frequency: notificationFrequencyEnum.optional(),
      quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      quietHoursTimezone: z.string().optional(),
      settings: z.record(z.unknown()).optional(),
    }),
  ),
});

@Injectable()
@Router({ alias: 'adminNotificationPreferences' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminNotificationPreferencesRouter {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: getUserPreferencesSchema,
    output: apiResponseSchema
  })
  async getUserPreferences(
    @Input() input: z.infer<typeof getUserPreferencesSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const preferences = await this.notificationPreferenceService.getUserPreferencesGrouped(input.userId);
      return this.responseHandler.createTrpcSuccess(preferences);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to fetch user preferences'
      );
    }
  }

  @Query({
    input: getUserPreferencesSchema,
    output: apiResponseSchema
  })
  async getUserPreferencesRaw(
    @Input() input: z.infer<typeof getUserPreferencesSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const preferences = await this.notificationPreferenceService.getUserPreferences(input.userId);
      return this.responseHandler.createTrpcSuccess(preferences);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to fetch user preferences'
      );
    }
  }

  @Mutation({
    input: createPreferenceSchema,
    output: apiResponseSchema
  })
  async createPreference(
    @Input() input: z.infer<typeof createPreferenceSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const preference = await this.notificationPreferenceService.createPreference({
        userId: input.userId,
        type: input.type as NotificationType,
        channel: input.channel as NotificationChannel,
        enabled: input.enabled,
        frequency: input.frequency as NotificationFrequency,
        quietHoursStart: input.quietHoursStart,
        quietHoursEnd: input.quietHoursEnd,
        quietHoursTimezone: input.quietHoursTimezone,
        settings: input.settings,
      });
      return this.responseHandler.createTrpcSuccess(preference);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to create notification preference'
      );
    }
  }

  @Mutation({
    input: z.object({
      id: z.string().uuid(),
    }).merge(updatePreferenceSchema),
    output: apiResponseSchema
  })
  async updatePreference(
    @Input() input: { id: string } & z.infer<typeof updatePreferenceSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const { id, ...updateData } = input;
      const preference = await this.notificationPreferenceService.updatePreference(id, {
        enabled: updateData.enabled,
        frequency: updateData.frequency as NotificationFrequency,
        quietHoursStart: updateData.quietHoursStart,
        quietHoursEnd: updateData.quietHoursEnd,
        quietHoursTimezone: updateData.quietHoursTimezone,
        settings: updateData.settings,
      });
      return this.responseHandler.createTrpcSuccess(preference);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to update notification preference'
      );
    }
  }

  @Mutation({
    input: z.object({
      userId: z.string().uuid(),
      type: notificationTypeEnum,
      channel: notificationChannelEnum,
    }).merge(updatePreferenceSchema),
    output: apiResponseSchema
  })
  async updateUserPreference(
    @Input() input: {
      userId: string;
      type: string;
      channel: string;
    } & z.infer<typeof updatePreferenceSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const { userId, type, channel, ...updateData } = input;
      const preference = await this.notificationPreferenceService.updateUserPreference(
        userId,
        type as NotificationType,
        channel as NotificationChannel,
        {
          enabled: updateData.enabled,
          frequency: updateData.frequency as NotificationFrequency,
          quietHoursStart: updateData.quietHoursStart,
          quietHoursEnd: updateData.quietHoursEnd,
          quietHoursTimezone: updateData.quietHoursTimezone,
          settings: updateData.settings,
        },
      );
      return this.responseHandler.createTrpcSuccess(preference);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to update user notification preference'
      );
    }
  }

  @Mutation({
    input: z.object({
      userId: z.string().uuid(),
    }).merge(bulkUpdateSchema),
    output: apiResponseSchema
  })
  async bulkUpdateUserPreferences(
    @Input() input: { userId: string } & z.infer<typeof bulkUpdateSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const { userId, preferences } = input;
      const result = await this.notificationPreferenceService.bulkUpdateUserPreferences(userId, {
        preferences: preferences.map(pref => ({
          type: pref.type as NotificationType,
          channel: pref.channel as NotificationChannel,
          enabled: pref.enabled,
          frequency: pref.frequency as NotificationFrequency,
          quietHoursStart: pref.quietHoursStart,
          quietHoursEnd: pref.quietHoursEnd,
          quietHoursTimezone: pref.quietHoursTimezone,
          settings: pref.settings,
        })),
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to bulk update notification preferences'
      );
    }
  }

  @Mutation({
    input: deletePreferenceSchema,
    output: apiResponseSchema
  })
  async deletePreference(
    @Input() input: z.infer<typeof deletePreferenceSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.notificationPreferenceService.deletePreference(input.id);
      return this.responseHandler.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to delete notification preference'
      );
    }
  }

  @Mutation({
    input: getUserPreferencesSchema,
    output: apiResponseSchema
  })
  async initializeUserPreferences(
    @Input() input: z.infer<typeof getUserPreferencesSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.notificationPreferenceService.initializeUserPreferences(input.userId);
      return this.responseHandler.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to initialize user preferences'
      );
    }
  }

  @Mutation({
    input: z.object({
      userId: z.string().uuid(),
      type: notificationTypeEnum,
      enabled: z.boolean(),
    }),
    output: apiResponseSchema
  })
  async toggleNotificationType(
    @Input() input: { userId: string; type: string; enabled: boolean },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.notificationPreferenceService.toggleNotificationType(
        input.userId,
        input.type as NotificationType,
        input.enabled,
      );
      return this.responseHandler.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to toggle notification type'
      );
    }
  }

  @Mutation({
    input: z.object({
      userId: z.string().uuid(),
      channel: notificationChannelEnum,
      start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      timezone: z.string().optional(),
    }),
    output: apiResponseSchema
  })
  async setQuietHours(
    @Input() input: { userId: string; channel: string; start: string; end: string; timezone?: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.notificationPreferenceService.setQuietHours(
        input.userId,
        input.channel as NotificationChannel,
        input.start,
        input.end,
        input.timezone,
      );
      return this.responseHandler.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to set quiet hours'
      );
    }
  }

  @Query({
    input: z.object({
      userId: z.string().uuid(),
      channel: notificationChannelEnum,
    }),
    output: apiResponseSchema
  })
  async getQuietHours(
    @Input() input: { userId: string; channel: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const quietHours = await this.notificationPreferenceService.getQuietHoursForUser(
        input.userId,
        input.channel as NotificationChannel,
      );
      return this.responseHandler.createTrpcSuccess(quietHours);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to get quiet hours'
      );
    }
  }

  @Query({
    input: z.object({
      userId: z.string().uuid(),
      type: notificationTypeEnum,
      channel: notificationChannelEnum,
      timezone: z.string().optional(),
    }),
    output: apiResponseSchema
  })
  async canSendNotification(
    @Input() input: { userId: string; type: string; channel: string; timezone?: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const canSend = await this.notificationPreferenceService.canSendNotification(
        input.userId,
        input.type as NotificationType,
        input.channel as NotificationChannel,
        input.timezone,
      );
      return this.responseHandler.createTrpcSuccess(canSend);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to check notification permission'
      );
    }
  }
}
