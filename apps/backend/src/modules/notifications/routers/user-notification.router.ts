import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { NotificationService } from '../services/notification.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { NotificationType } from '../entities/notification.entity';

export const notificationTypeSchema = z.nativeEnum(NotificationType);

export const getUserNotificationsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  type: notificationTypeSchema.optional(),
  read: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const markAsReadSchema = z.object({
  id: z.string().min(1),
});

export const markMultipleAsReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1),
});

export const deleteNotificationSchema = z.object({
  id: z.string().min(1),
});

export const registerFCMTokenSchema = z.object({
  token: z.string().min(1),
  deviceInfo: z.object({
    platform: z.enum(['web', 'android', 'ios']).optional(),
    browser: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  types: z.array(notificationTypeSchema).optional(),
});

@Injectable()
@Router({ alias: 'userNotification' })
export class UserNotificationRouter {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: getUserNotificationsQuerySchema,
    output: paginatedResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async getMyNotifications(
    @Input() input: z.infer<typeof getUserNotificationsQuerySchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const { page, limit, type, read, sortBy, sortOrder } = input;
    const userId = ctx.user.id;

    const result = await this.notificationService.getUserNotifications(userId, page, limit, {
      type,
      read,
      sortBy,
      sortOrder,
    });

    const cleanNotifications = result.notifications.map(notification => {
      const { user, ...cleanNotification } = notification;
      return cleanNotification;
    });

    const transformedResult = {
      items: cleanNotifications,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
    };

    return this.responseService.createTrpcSuccess(transformedResult);
  }

  @Query({
    input: z.object({
      limit: z.number().min(1).max(20).default(5)
    }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async getMyRecentNotifications(
    @Input() input: { limit: number },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const userId = ctx.user.id;
    const notifications = await this.notificationService.getRecentNotifications(
      userId,
      input.limit
    );

    return this.responseService.createTrpcSuccess(notifications);
  }

  @Query({
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async getMyUnreadCount(
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const userId = ctx.user.id;
    const count = await this.notificationService.getUnreadCount(userId);

    return this.responseService.createTrpcSuccess({ count });
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async getMyNotificationById(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const notification = await this.notificationService.getNotificationById(input.id);

    if (notification.userId !== ctx.user.id) {
      throw new Error('Access denied: This notification does not belong to you');
    }

    return this.responseService.createTrpcSuccess(notification);
  }

  @Query({
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async getMyNotificationStats(
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const userId = ctx.user.id;
    const stats = await this.notificationService.getNotificationStats(userId);

    return this.responseService.createTrpcSuccess(stats);
  }

  @Mutation({
    input: markAsReadSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async markMyNotificationAsRead(
    @Input() input: z.infer<typeof markAsReadSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const notification = await this.notificationService.getNotificationById(input.id);

    if (notification.userId !== ctx.user.id) {
      throw new Error('Access denied: This notification does not belong to you');
    }

    const updatedNotification = await this.notificationService.markAsRead(input.id);

    return this.responseService.createTrpcSuccess(updatedNotification);
  }

  @Mutation({
    input: markMultipleAsReadSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async markMultipleAsRead(
    @Input() input: z.infer<typeof markMultipleAsReadSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const userId = ctx.user.id;
    await this.notificationService.markAllAsReadForUser(userId, input.notificationIds);

    return this.responseService.createTrpcSuccess(null);
  }

  @Mutation({
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async markAllMyNotificationsAsRead(
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const userId = ctx.user.id;
    await this.notificationService.markAllAsReadForUser(userId);

    return this.responseService.createTrpcSuccess(null);
  }

  @Mutation({
    input: deleteNotificationSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async deleteMyNotification(
    @Input() input: z.infer<typeof deleteNotificationSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const notification = await this.notificationService.getNotificationById(input.id);

    if (notification.userId !== ctx.user.id) {
      throw new Error('Access denied: This notification does not belong to you');
    }

    await this.notificationService.deleteNotification(input.id);

    return this.responseService.createTrpcSuccess(null);
  }

  @Mutation({
    input: z.object({
      olderThanDays: z.number().min(1).default(30)
    }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async deleteMyOldNotifications(
    @Input() input: { olderThanDays: number },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const userId = ctx.user.id;
    const deletedCount = await this.notificationService.deleteUserNotifications(
      userId,
      input.olderThanDays
    );

    return this.responseService.createTrpcSuccess({ deletedCount });
  }

  @Mutation({
    input: registerFCMTokenSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async registerFCMToken(
    @Input() input: z.infer<typeof registerFCMTokenSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    await this.notificationService.registerFCMToken(
      ctx.user.id,
      input.token,
      input.deviceInfo
        ? {
            platform: input.deviceInfo.platform,
            deviceModel: input.deviceInfo.browser,
            appVersion: input.deviceInfo.version,
          }
        : undefined,
    );

    return this.responseService.createTrpcSuccess({
      token: input.token,
      isValid: true,
      registered: true
    });
  }

  @Mutation({
    input: z.object({
      token: z.string().min(1)
    }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async testMyNotification(
    @Input() input: { token: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const result = await this.notificationService.sendTestNotification(
      input.token,
      'Test Notification',
      `Hello ${ctx.user.email || 'User'}, this is a test notification!`
    );

    return this.responseService.createTrpcSuccess({ messageId: result });
  }
}
