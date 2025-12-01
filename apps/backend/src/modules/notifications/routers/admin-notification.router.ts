import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { NotificationService } from '../services/notification.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { NotificationType } from '../entities/notification.entity';
import { CreateNotificationDto } from '../repositories/notification.repository';
import { SendNotificationToUserDto, BulkNotificationDto } from '../services/notification.service';
import { NotificationEvent } from '../entities/notification-event.enum';
import { NotificationChannel } from '../entities/notification-preference.entity';
import { NotificationEventFlowService } from '../services/notification-event-flow.service';

export const notificationTypeSchema = z.nativeEnum(NotificationType);

export const getNotificationsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  userId: z.string().optional(),
  type: notificationTypeSchema.optional(),
  read: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  type: notificationTypeSchema.optional(),
  actionUrl: z.string().url().optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  data: z.record(z.unknown()).optional(),
});

export const sendNotificationToUserSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  type: notificationTypeSchema.optional(),
  actionUrl: z.string().url().optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  data: z.record(z.unknown()).optional(),
  fcmTokens: z.array(z.string()).optional(),
  sendPush: z.boolean().default(true),
  eventKey: z.nativeEnum(NotificationEvent).optional(),
});

export const sendBulkNotificationSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  type: notificationTypeSchema.optional(),
  actionUrl: z.string().url().optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  data: z.record(z.unknown()).optional(),
  eventKey: z.nativeEnum(NotificationEvent).optional(),
});

export const sendTopicNotificationSchema = z.object({
  topic: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  actionUrl: z.string().url().optional(),
  data: z.record(z.unknown()).optional(),
});

export const markAsReadSchema = z.object({
  id: z.string().min(1),
});

export const markAllAsReadSchema = z.object({
  userId: z.string().min(1),
  notificationIds: z.array(z.string()).optional(),
});

export const deleteNotificationSchema = z.object({
  id: z.string().min(1),
});

export const deleteUserNotificationsSchema = z.object({
  userId: z.string().min(1),
  olderThanDays: z.number().min(1).optional(),
});

export const validateTokenSchema = z.object({
  token: z.string().min(1),
});

export const sendTestNotificationSchema = z.object({
  token: z.string().min(1),
  title: z.string().optional(),
  body: z.string().optional(),
});

export const subscribeToTopicSchema = z.object({
  fcmTokens: z.array(z.string().min(1)).min(1),
  topic: z.string().min(1),
});

export const cleanupNotificationsSchema = z.object({
  olderThanDays: z.number().min(1).default(30),
});

const notificationChannelEnum = z.enum(['push', 'email', 'in_app', 'sms', 'telegram']);

const listEventFlowsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  channel: notificationChannelEnum.optional(),
  eventKey: z.nativeEnum(NotificationEvent).optional(),
  isActive: z.boolean().optional(),
});

const getEventFlowSchema = z.object({
  id: z.string().uuid().optional(),
  eventKey: z.nativeEnum(NotificationEvent).optional(),
}).refine(data => data.id || data.eventKey, {
  message: 'Either id or eventKey must be provided',
  path: ['id'],
});

const upsertEventFlowSchema = z.object({
  id: z.string().uuid().optional(),
  eventKey: z.nativeEnum(NotificationEvent),
  displayName: z.string().min(3).max(150),
  description: z.string().max(500).optional(),
  channelPreferences: z.array(notificationChannelEnum).min(1),
  includeActor: z.boolean().default(true),
  recipientUserIds: z.array(z.string().uuid()).optional().default([]),
  ccUserIds: z.array(z.string().uuid()).optional().default([]),
  bccUserIds: z.array(z.string().uuid()).optional().default([]),
  ccEmails: z.array(z.string().email()).optional().default([]),
  bccEmails: z.array(z.string().email()).optional().default([]),
  mailTemplateIds: z.array(z.string().uuid()).optional().default([]),
  channelMetadata: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const deleteEventFlowSchema = z.object({
  id: z.string().uuid(),
});

const searchRecipientsSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(50).default(10),
});

@Injectable()
@Router({ alias: 'adminNotification' })
export class AdminNotificationRouter {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationEventFlowService: NotificationEventFlowService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: getNotificationsQuerySchema,
    output: paginatedResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getNotifications(
    @Input() input: z.infer<typeof getNotificationsQuerySchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const { page, limit, userId, type, read, sortBy, sortOrder } = input;

    const result = await this.notificationService.getAllNotifications(page, limit, {
      userId,
      type,
      read,
      sortBy,
      sortOrder,
    });

    // Transform the response to match paginatedResponseSchema (only 5 required fields)
    // Remove user relation to avoid circular references and keep response clean
    const cleanNotifications = result.notifications.map(notification => {
      const { user, ...cleanNotification } = notification;
      return {
        ...cleanNotification,
        // Keep only essential user info if needed
        userEmail: user?.email || null,
      };
    });

    const transformedResult = {
      items: cleanNotifications,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };

    return this.responseService.createTrpcSuccess(transformedResult);
  }

  @Query({
    input: z.object({
      userId: z.string().min(1),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }),
    output: paginatedResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getUserNotifications(
    @Input() input: { userId: string; page?: number; limit?: number },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const result = await this.notificationService.getUserNotifications(
      input.userId,
      input.page || 1,
      input.limit || 20
    );

    // Transform the response to match paginatedResponseSchema (only 5 required fields)
    // Remove user relation to avoid circular references and keep response clean
    const cleanNotifications = result.notifications.map(notification => {
      const { user, ...cleanNotification } = notification;
      return {
        ...cleanNotification,
        // Keep only essential user info if needed
        userEmail: user?.email || null,
      };
    });

    const transformedResult = {
      items: cleanNotifications,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };

    return this.responseService.createTrpcSuccess(transformedResult);
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getNotificationById(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const notification = await this.notificationService.getNotificationById(input.id);

    return this.responseService.createTrpcSuccess(
notification);
  }

  @Query({
    input: z.object({ userId: z.string().min(1) }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getUnreadCount(
    @Input() input: { userId: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const count = await this.notificationService.getUnreadCount(input.userId);

    return this.responseService.createTrpcSuccess(
{ count });
  }

  @Query({
    input: z.object({
      userId: z.string().min(1),
      limit: z.number().min(1).max(20).default(5)
    }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getRecentNotifications(
    @Input() input: { userId: string; limit: number },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const notifications = await this.notificationService.getRecentNotifications(
      input.userId,
      input.limit
    );

    return this.responseService.createTrpcSuccess(
notifications);
  }

  @Query({
    input: z.object({ userId: z.string().optional() }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getNotificationStats(
    @Input() input: { userId?: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const stats = await this.notificationService.getNotificationStats(input.userId);

    return this.responseService.createTrpcSuccess(
stats);
  }

  @Mutation({
    input: createNotificationSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async createNotification(
    @Input() input: z.infer<typeof createNotificationSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const createDto: CreateNotificationDto = {
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      actionUrl: input.actionUrl,
      icon: input.icon,
      image: input.image,
      data: input.data,
    };
    const notification = await this.notificationService.createNotification(createDto);

    return this.responseService.createTrpcSuccess(
notification);
  }

  @Mutation({
    input: z.object({
      debugPayload: z.any(),
    }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async debugSendNotification(
    @Input() input: { debugPayload: any },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    // Debug endpoint to see what's being sent
    return this.responseService.createTrpcSuccess({
      receivedPayload: input.debugPayload,
      payloadType: typeof input.debugPayload,
      payloadKeys: input.debugPayload ? Object.keys(input.debugPayload) : [],
      userId: input.debugPayload?.userId,
      userIdType: typeof input.debugPayload?.userId,
      userIdLength: input.debugPayload?.userId?.length || 0,
    });
  }

  @Mutation({
    input: sendNotificationToUserSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async sendNotificationToUser(
    @Input() input: z.infer<typeof sendNotificationToUserSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const sendDto: SendNotificationToUserDto = {
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      actionUrl: input.actionUrl,
      icon: input.icon,
      image: input.image,
      data: input.data,
      fcmTokens: input.fcmTokens,
      sendPush: input.sendPush,
      eventKey: input.eventKey,
    };
    const notification = await this.notificationService.sendNotificationToUser(sendDto);

    return this.responseService.createTrpcSuccess(
notification);
  }

  @Mutation({
    input: sendBulkNotificationSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async sendBulkNotifications(
    @Input() input: z.infer<typeof sendBulkNotificationSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const bulkDto: BulkNotificationDto = {
      userIds: input.userIds,
      title: input.title,
      body: input.body,
      type: input.type,
      actionUrl: input.actionUrl,
      icon: input.icon,
      image: input.image,
      data: input.data,
      eventKey: input.eventKey,
    };
    const notifications = await this.notificationService.sendBulkNotifications(bulkDto);

    return this.responseService.createTrpcSuccess(
notifications);
  }

  @Mutation({
    input: sendTopicNotificationSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async sendTopicNotification(
    @Input() input: z.infer<typeof sendTopicNotificationSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const result = await this.notificationService.sendTopicNotification(
      input.topic,
      input.title,
      input.body,
      input.actionUrl,
      input.data
    );

    return this.responseService.createTrpcSuccess(
{ messageId: result });
  }

  @Mutation({
    input: markAsReadSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async markAsRead(
    @Input() input: z.infer<typeof markAsReadSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const notification = await this.notificationService.markAsRead(input.id);

    return this.responseService.createTrpcSuccess(
notification);
  }

  @Mutation({
    input: markAllAsReadSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async markAllAsRead(
    @Input() input: z.infer<typeof markAllAsReadSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    await this.notificationService.markAllAsReadForUser(input.userId, input.notificationIds);

    return this.responseService.createTrpcSuccess(
null);
  }

  @Mutation({
    input: deleteNotificationSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async deleteNotification(
    @Input() input: z.infer<typeof deleteNotificationSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    await this.notificationService.deleteNotification(input.id);

    return this.responseService.createTrpcSuccess(
null);
  }

  @Mutation({
    input: deleteUserNotificationsSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async deleteUserNotifications(
    @Input() input: z.infer<typeof deleteUserNotificationsSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const deletedCount = await this.notificationService.deleteUserNotifications(
      input.userId,
      input.olderThanDays
    );

    return this.responseService.createTrpcSuccess(
{ deletedCount });
  }

  @Mutation({
    input: subscribeToTopicSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async subscribeToTopic(
    @Input() input: z.infer<typeof subscribeToTopicSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    await this.notificationService.subscribeUserToTopic(input.fcmTokens, input.topic);

    return this.responseService.createTrpcSuccess(
null);
  }

  @Mutation({
    input: subscribeToTopicSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async unsubscribeFromTopic(
    @Input() input: z.infer<typeof subscribeToTopicSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    await this.notificationService.unsubscribeUserFromTopic(input.fcmTokens, input.topic);

    return this.responseService.createTrpcSuccess(
null);
  }

  @Mutation({
    input: validateTokenSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async validateFCMToken(
    @Input() input: z.infer<typeof validateTokenSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const isValid = await this.notificationService.validateFCMToken(input.token);

    return this.responseService.createTrpcSuccess(
{ isValid });
  }

  @Mutation({
    input: sendTestNotificationSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async sendTestNotification(
    @Input() input: z.infer<typeof sendTestNotificationSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const result = await this.notificationService.sendTestNotification(
      input.token,
      input.title,
      input.body
    );

    return this.responseService.createTrpcSuccess(
{ messageId: result });
  }

  @Mutation({
    input: cleanupNotificationsSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async cleanupNotifications(
    @Input() input: z.infer<typeof cleanupNotificationsSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    const deletedCount = await this.notificationService.cleanupOldNotifications(input.olderThanDays);

    return this.responseService.createTrpcSuccess(
{ deletedCount });
  }

  @Query({
    input: listEventFlowsSchema,
    output: paginatedResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async listEventFlows(
    @Input() input: z.infer<typeof listEventFlowsSchema>,
  ) {
    const result = await this.notificationEventFlowService.listFlows({
      page: input.page,
      limit: input.limit,
      search: input.search,
      channel: input.channel as NotificationChannel | undefined,
      eventKey: input.eventKey,
      isActive: input.isActive,
    });

    return this.responseService.createTrpcSuccess({
      items: result.data,
      total: result.meta.total,
      page: result.meta.page,
      limit: result.meta.limit,
      totalPages: result.meta.totalPages,
    });
  }

  @Query({
    input: getEventFlowSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getEventFlow(
    @Input() input: z.infer<typeof getEventFlowSchema>,
  ) {
    const flow = input.id
      ? await this.notificationEventFlowService.getFlowById(input.id)
      : await this.notificationEventFlowService.getFlowByEvent(input.eventKey!);

    return this.responseService.createTrpcSuccess(flow);
  }

  @Mutation({
    input: upsertEventFlowSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async upsertEventFlow(
    @Input() input: z.infer<typeof upsertEventFlowSchema>,
  ) {
    const flow = await this.notificationEventFlowService.upsertFlow({
      id: input.id,
      eventKey: input.eventKey,
      displayName: input.displayName,
      description: input.description,
      channelPreferences: input.channelPreferences as NotificationChannel[],
      includeActor: input.includeActor,
      recipientUserIds: input.recipientUserIds || [],
      ccUserIds: input.ccUserIds || [],
      bccUserIds: input.bccUserIds || [],
      ccEmails: input.ccEmails || [],
      bccEmails: input.bccEmails || [],
      mailTemplateIds: input.mailTemplateIds || [],
      channelMetadata: input.channelMetadata,
      isActive: input.isActive,
    });

    return this.responseService.createTrpcSuccess(flow);
  }

  @Mutation({
    input: deleteEventFlowSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async deleteEventFlow(
    @Input() input: z.infer<typeof deleteEventFlowSchema>,
  ) {
    await this.notificationEventFlowService.deleteFlow(input.id);
    return this.responseService.createTrpcSuccess({ deleted: true });
  }

  @Query({
    input: searchRecipientsSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async searchNotificationRecipients(
    @Input() input: z.infer<typeof searchRecipientsSchema>,
  ) {
    const query = (input.query || '').trim();
    const result = await this.notificationEventFlowService.searchRecipients(query, input.limit);
    return this.responseService.createTrpcSuccess(result);
  }
}
