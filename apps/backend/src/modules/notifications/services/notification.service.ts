import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository, CreateNotificationDto, NotificationFilters } from '../repositories/notification.repository';
import { NotificationEntity, NotificationType } from '../entities/notification.entity';
import { FirebaseMessagingService, FCMPayload, SendToUserOptions } from './firebase-messaging.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationChannel } from '../entities/notification-preference.entity';

export interface NotificationWithPagination {
  notifications: NotificationEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SendNotificationToUserDto {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  actionUrl?: string;
  icon?: string;
  image?: string;
  data?: Record<string, unknown>;
  fcmTokens?: string[];
  sendPush?: boolean;
}

export interface BulkNotificationDto {
  userIds: string[];
  title: string;
  body: string;
  type?: NotificationType;
  actionUrl?: string;
  icon?: string;
  image?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly firebaseMessagingService: FirebaseMessagingService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  async createNotification(data: CreateNotificationDto): Promise<NotificationEntity> {
    return await this.notificationRepository.create(data);
  }

  async getNotificationById(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: Omit<NotificationFilters, 'userId' | 'limit' | 'offset'> = {}
  ): Promise<NotificationWithPagination> {
    const offset = (page - 1) * limit;
    const { notifications, total } = await this.notificationRepository.findByUserId(userId, {
      ...filters,
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async getAllNotifications(
    page: number = 1,
    limit: number = 20,
    filters: Omit<NotificationFilters, 'limit' | 'offset'> = {}
  ): Promise<NotificationWithPagination> {
    const offset = (page - 1) * limit;
    const { notifications, total } = await this.notificationRepository.findAll({
      ...filters,
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async markAsRead(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.markAsRead(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAllAsReadForUser(userId: string, notificationIds?: string[]): Promise<void> {
    await this.notificationRepository.markAsReadByUserId(userId, notificationIds);
  }

  async deleteNotification(id: string): Promise<void> {
    const deleted = await this.notificationRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  async deleteUserNotifications(userId: string, olderThanDays?: number): Promise<number> {
    return await this.notificationRepository.deleteByUserId(userId, olderThanDays);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  async getRecentNotifications(userId: string, limit: number = 5): Promise<NotificationEntity[]> {
    return await this.notificationRepository.getRecentNotifications(userId, limit);
  }

  async sendNotificationToUser(data: SendNotificationToUserDto): Promise<NotificationEntity | null> {
    const {
      userId,
      title,
      body,
      type = NotificationType.INFO,
      actionUrl,
      icon,
      image,
      data: additionalData,
      fcmTokens = [],
      sendPush = true,
    } = data;

    // Check notification preferences before sending
    const canSendInApp = await this.notificationPreferenceService.canSendNotification(
      userId,
      type,
      NotificationChannel.IN_APP
    );

    const canSendPush = sendPush && await this.notificationPreferenceService.canSendNotification(
      userId,
      type,
      NotificationChannel.PUSH
    );

    // Always create in-app notification if preference allows
    let notification: NotificationEntity | null = null;
    if (canSendInApp) {
      notification = await this.notificationRepository.create({
        userId,
        title,
        body,
        type,
        actionUrl,
        icon,
        image,
        data: additionalData,
      });
    }

    // Send push notification if preferences allow and tokens are provided
    if (canSendPush && fcmTokens.length > 0) {
      const payload: FCMPayload = {
        title,
        body,
        icon,
        image,
        clickAction: actionUrl,
      };

      const options: SendToUserOptions = {
        userId,
        userFcmTokens: fcmTokens,
        saveToDatabase: false, // Already saved above if in-app is enabled
        notificationType: type,
        actionUrl,
        additionalData,
      };

      await this.firebaseMessagingService.sendToUser(payload, options);
    }

    return notification;
  }

  async sendBulkNotifications(data: BulkNotificationDto): Promise<NotificationEntity[]> {
    const {
      userIds,
      title,
      body,
      type = NotificationType.INFO,
      actionUrl,
      icon,
      image,
      data: additionalData,
    } = data;

    // Filter users who can receive in-app notifications
    const allowedUsers: string[] = [];
    for (const userId of userIds) {
      const canSend = await this.notificationPreferenceService.canSendNotification(
        userId,
        type,
        NotificationChannel.IN_APP
      );
      if (canSend) {
        allowedUsers.push(userId);
      }
    }

    if (allowedUsers.length === 0) {
      return [];
    }

    const notifications: CreateNotificationDto[] = allowedUsers.map(userId => ({
      userId,
      title,
      body,
      type,
      actionUrl,
      icon,
      image,
      data: additionalData,
    }));

    return await this.notificationRepository.bulkCreate(notifications);
  }

  async sendSystemNotification(
    userIds: string[],
    title: string,
    body: string,
    actionUrl?: string,
    additionalData?: Record<string, unknown>
  ): Promise<NotificationEntity[]> {
    return await this.sendBulkNotifications({
      userIds,
      title,
      body,
      type: NotificationType.SYSTEM,
      actionUrl,
      data: additionalData,
    });
  }

  async sendProductNotification(
    userIds: string[],
    title: string,
    body: string,
    productId: string,
    actionUrl?: string
  ): Promise<NotificationEntity[]> {
    return await this.sendBulkNotifications({
      userIds,
      title,
      body,
      type: NotificationType.PRODUCT,
      actionUrl,
      data: { productId },
    });
  }

  async sendOrderNotification(
    userId: string,
    title: string,
    body: string,
    orderId: string,
    actionUrl?: string,
    fcmTokens?: string[]
  ): Promise<NotificationEntity | null> {
    return await this.sendNotificationToUser({
      userId,
      title,
      body,
      type: NotificationType.ORDER,
      actionUrl,
      data: { orderId },
      fcmTokens,
    });
  }

  async subscribeUserToTopic(fcmTokens: string[], topic: string): Promise<void> {
    await this.firebaseMessagingService.subscribeToTopic(fcmTokens, topic);
  }

  async unsubscribeUserFromTopic(fcmTokens: string[], topic: string): Promise<void> {
    await this.firebaseMessagingService.unsubscribeFromTopic(fcmTokens, topic);
  }

  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    actionUrl?: string,
    additionalData?: Record<string, unknown>
  ): Promise<string | null> {
    const payload: FCMPayload = {
      title,
      body,
      clickAction: actionUrl,
    };

    const data: Record<string, string> = {};
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        data[key] = String(additionalData[key]);
      });
    }

    return await this.firebaseMessagingService.sendToTopic(topic, payload, { data });
  }

  async validateFCMToken(token: string): Promise<boolean> {
    return await this.firebaseMessagingService.validateToken(token);
  }

  async sendTestNotification(token: string, title?: string, body?: string): Promise<string | null> {
    return await this.firebaseMessagingService.sendTestNotification(token, title, body);
  }

  async cleanupOldNotifications(olderThanDays: number = 30): Promise<number> {
    return await this.notificationRepository.cleanup(olderThanDays);
  }

  async getNotificationStats(userId?: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  }> {
    const filters: NotificationFilters = userId ? { userId } : {};

    const { total } = await this.notificationRepository.findAll(filters);
    const unread = userId
      ? await this.notificationRepository.getUnreadCount(userId)
      : (await this.notificationRepository.findAll({ ...filters, read: false })).total;

    const byType: Record<NotificationType, number> = {} as Record<NotificationType, number>;

    for (const type of Object.values(NotificationType)) {
      const { total: typeCount } = await this.notificationRepository.findAll({
        ...filters,
        type,
      });
      byType[type] = typeCount;
    }

    return { total, unread, byType };
  }

  async getUserEnabledChannels(userId: string, type: NotificationType): Promise<NotificationChannel[]> {
    return await this.notificationPreferenceService.getEnabledChannelsForUser(userId, type);
  }

  async canSendEmailNotification(userId: string, type: NotificationType): Promise<boolean> {
    return await this.notificationPreferenceService.canSendNotification(
      userId,
      type,
      NotificationChannel.EMAIL
    );
  }

  async canSendPushNotification(userId: string, type: NotificationType): Promise<boolean> {
    return await this.notificationPreferenceService.canSendNotification(
      userId,
      type,
      NotificationChannel.PUSH
    );
  }

  async canSendInAppNotification(userId: string, type: NotificationType): Promise<boolean> {
    return await this.notificationPreferenceService.canSendNotification(
      userId,
      type,
      NotificationChannel.IN_APP
    );
  }

  async initializeUserNotificationPreferences(userId: string): Promise<void> {
    await this.notificationPreferenceService.initializeUserPreferences(userId);
  }
}