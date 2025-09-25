import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '../../shared/services/response.service';
import { NotificationService } from '../services/notification.service';
import { NotificationType } from '../entities/notification.entity';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';

export const clientNotificationTypeSchema = z.nativeEnum(NotificationType);

export const createClientNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  type: clientNotificationTypeSchema.optional().default(NotificationType.INFO),
  actionUrl: z.string().url().optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  data: z.record(z.unknown()).optional(),
});

export const subscribeToTopicSchema = z.object({
  token: z.string().min(1),
  topic: z.string().min(1),
});

export const unsubscribeFromTopicSchema = z.object({
  token: z.string().min(1),
  topic: z.string().min(1),
});

@Router({ alias: 'clientNotification' })
@Injectable()
export class ClientNotificationRouter {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: z.object({
      userId: z.string().min(1),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
      type: clientNotificationTypeSchema.optional(),
      read: z.boolean().optional(),
    }),
    output: apiResponseSchema,
  })
  async getUserNotifications(
    @Input() input: z.infer<typeof createClientNotificationSchema> & {
      page: number;
      limit: number;
      type?: NotificationType;
      read?: boolean;
    }
  ) {
    try {
      const { userId, page, limit, type, read } = input;
      const result = await this.notificationService.getUserNotifications(userId, page, limit, {
        type,
        read,
      });

      return this.responseService.createTrpcSuccess(result);
    } catch (error) {
      // For client endpoints, return empty result instead of throwing
      console.warn('Failed to get user notifications:', error.message);
      return this.responseService.createTrpcSuccess({
        notifications: [],
        total: 0,
        page: 1,
        limit: input.limit,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    }
  }

  @Query({
    input: z.object({
      userId: z.string().min(1),
    }),
    output: apiResponseSchema,
  })
  async getUnreadCount(@Input() input: { userId: string }) {
    try {
      const count = await this.notificationService.getUnreadCount(input.userId);
      return this.responseService.createTrpcSuccess({ count });
    } catch (error) {
      console.warn('Failed to get unread count:', error.message);
      return this.responseService.createTrpcSuccess({ count: 0 });
    }
  }

  @Query({
    input: z.object({
      userId: z.string().min(1),
      limit: z.number().min(1).max(20).default(5),
    }),
    output: apiResponseSchema,
  })
  async getRecentNotifications(
    @Input() input: { userId: string; limit: number }
  ) {
    try {
      const notifications = await this.notificationService.getRecentNotifications(
        input.userId,
        input.limit
      );
      return this.responseService.createTrpcSuccess(notifications);
    } catch (error) {
      console.warn('Failed to get recent notifications:', error.message);
      return this.responseService.createTrpcSuccess([]);
    }
  }

  @Mutation({
    input: createClientNotificationSchema,
    output: apiResponseSchema,
  })
  async createNotification(
    @Input() input: z.infer<typeof createClientNotificationSchema>
  ) {
    try {
      const notification = await this.notificationService.createNotification({
        userId: input.userId,
        title: input.title,
        body: input.body,
        type: input.type,
        actionUrl: input.actionUrl,
        icon: input.icon,
        image: input.image,
        data: input.data,
      });

      return this.responseService.createTrpcSuccess(notification);
    } catch (error) {
      console.warn('Failed to create notification:', error.message);
      return this.responseService.createTrpcSuccess(null);
    }
  }

  @Mutation({
    input: z.object({
      userId: z.string().min(1),
      notificationIds: z.array(z.string().min(1)).optional(),
    }),
    output: apiResponseSchema,
  })
  async markAllAsRead(
    @Input() input: { userId: string; notificationIds?: string[] }
  ) {
    try {
      await this.notificationService.markAllAsReadForUser(
        input.userId,
        input.notificationIds
      );
      return this.responseService.createTrpcSuccess(null);
    } catch (error) {
      console.warn('Failed to mark notifications as read:', error.message);
      return this.responseService.createTrpcSuccess(null);
    }
  }

  @Mutation({
    input: z.object({
      token: z.string().min(1),
    }),
    output: apiResponseSchema,
  })
  async validateFCMToken(@Input() input: { token: string }) {
    try {
      const isValid = await this.notificationService.validateFCMToken(input.token);
      return this.responseService.createTrpcSuccess({ isValid });
    } catch (error) {
      console.warn('Failed to validate FCM token:', error.message);
      return this.responseService.createTrpcSuccess({ isValid: false });
    }
  }

  @Mutation({
    input: subscribeToTopicSchema,
    output: apiResponseSchema,
  })
  async subscribeToTopic(
    @Input() input: z.infer<typeof subscribeToTopicSchema>
  ) {
    try {
      await this.notificationService.subscribeUserToTopic([input.token], input.topic);
      return this.responseService.createTrpcSuccess({ subscribed: true });
    } catch (error) {
      console.warn('Failed to subscribe to topic:', error.message);
      return this.responseService.createTrpcSuccess({ subscribed: false });
    }
  }

  @Mutation({
    input: unsubscribeFromTopicSchema,
    output: apiResponseSchema,
  })
  async unsubscribeFromTopic(
    @Input() input: z.infer<typeof unsubscribeFromTopicSchema>
  ) {
    try {
      await this.notificationService.unsubscribeUserFromTopic([input.token], input.topic);
      return this.responseService.createTrpcSuccess({ unsubscribed: true });
    } catch (error) {
      console.warn('Failed to unsubscribe from topic:', error.message);
      return this.responseService.createTrpcSuccess({ unsubscribed: false });
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getNotificationTypes() {
    try {
      const types = Object.values(NotificationType).map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      }));
      return this.responseService.createTrpcSuccess(types);
    } catch (error) {
      console.warn('Failed to get notification types:', error.message);
      return this.responseService.createTrpcSuccess([]);
    }
  }
}