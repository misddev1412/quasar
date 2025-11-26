import { Injectable, Logger } from '@nestjs/common';
import { FirebaseMessagingService, FCMPayload } from './firebase-messaging.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../entities/notification.entity';
import { NotificationEvent } from '../entities/notification-event.enum';

export interface FCMNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  clickAction?: string;
  data?: Record<string, string>;
  type?: NotificationType;
}

export interface SendToUserOptions extends FCMNotificationOptions {
  userId: string;
  fcmTokens?: string[];
  saveToDatabase?: boolean;
}

export interface SendToMultipleUsersOptions extends FCMNotificationOptions {
  userIds: string[];
}

export interface SendToTopicOptions extends FCMNotificationOptions {
  topic: string;
}

@Injectable()
export class FCMNotificationService {
  private readonly logger = new Logger(FCMNotificationService.name);

  constructor(
    private readonly firebaseMessagingService: FirebaseMessagingService,
    private readonly notificationService: NotificationService,
  ) {}

  async sendToUser(options: SendToUserOptions) {
    const {
      userId,
      title,
      body,
      icon,
      image,
      clickAction,
      data,
      type = NotificationType.INFO,
      fcmTokens = [],
      saveToDatabase = true,
    } = options;

    const payload: FCMPayload = {
      title,
      body,
      icon,
      image,
      clickAction,
    };

    try {
      const result = await this.firebaseMessagingService.sendToUser(payload, {
        userId,
        userFcmTokens: fcmTokens,
        saveToDatabase,
        notificationType: type,
        actionUrl: clickAction,
        additionalData: data,
      });

      this.logger.log(`FCM notification sent to user ${userId}: ${title}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send FCM notification to user ${userId}:`, error);
      throw error;
    }
  }

  async sendToMultipleUsers(options: SendToMultipleUsersOptions) {
    const {
      userIds,
      title,
      body,
      icon,
      image,
      clickAction,
      data,
      type = NotificationType.INFO,
    } = options;

    try {
      const results = await this.notificationService.sendBulkNotifications({
        userIds,
        title,
        body,
        type,
        actionUrl: clickAction,
        icon,
        image,
        data,
      });

      this.logger.log(`FCM bulk notification sent to ${userIds.length} users: ${title}`);
      return results;
    } catch (error) {
      this.logger.error(`Failed to send bulk FCM notification:`, error);
      throw error;
    }
  }

  async sendToTopic(options: SendToTopicOptions) {
    const {
      topic,
      title,
      body,
      icon,
      image,
      clickAction,
      data,
    } = options;

    const payload: FCMPayload = {
      title,
      body,
      icon,
      image,
      clickAction,
    };

    try {
      const messageId = await this.firebaseMessagingService.sendToTopic(topic, payload, {
        data,
      });

      this.logger.log(`FCM notification sent to topic ${topic}: ${title} (${messageId})`);
      return messageId;
    } catch (error) {
      this.logger.error(`Failed to send FCM notification to topic ${topic}:`, error);
      throw error;
    }
  }

  async sendWelcomeNotification(userId: string, fcmTokens?: string[]) {
    return this.sendToUser({
      userId,
      title: 'Welcome!',
      body: 'Thank you for joining our platform. Enjoy exploring!',
      type: NotificationType.INFO,
      fcmTokens,
      icon: '/icons/welcome.png',
    });
  }

  async sendOrderNotification(userId: string, orderId: string, status: string, fcmTokens?: string[]) {
    const statusMessages = {
      pending: 'Your order has been received and is being processed.',
      confirmed: 'Your order has been confirmed and will be shipped soon.',
      shipped: 'Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.',
    };

    const title = `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const body = statusMessages[status] || `Your order status has been updated to ${status}.`;
    const eventKey = status === 'shipped'
      ? NotificationEvent.ORDER_SHIPPED
      : NotificationEvent.ORDER_CREATED;

    return this.notificationService.sendOrderNotification(
      userId,
      title,
      body,
      orderId,
      `/orders/${orderId}`,
      fcmTokens,
      eventKey,
      status,
    );
  }

  async sendPromotionalNotification(userIds: string[], title: string, body: string, actionUrl?: string) {
    return this.sendToMultipleUsers({
      userIds,
      title,
      body,
      type: NotificationType.INFO,
      clickAction: actionUrl,
      icon: '/icons/promotion.png',
    });
  }

  async sendSystemNotification(topic: string, title: string, body: string) {
    return this.sendToTopic({
      topic,
      title,
      body,
      icon: '/icons/system.png',
    });
  }

  async validateAndSendTestNotification(token: string, userEmail?: string) {
    try {
      const isValid = await this.firebaseMessagingService.validateToken(token);

      if (!isValid) {
        throw new Error('Invalid FCM token');
      }

      const result = await this.firebaseMessagingService.sendTestNotification(
        token,
        'Test Notification',
        `Hello ${userEmail || 'User'}, this is a test notification from the system!`
      );

      return { success: true, messageId: result, isValid };
    } catch (error) {
      this.logger.error('Test notification failed:', error);
      return { success: false, error: error.message, isValid: false };
    }
  }

  async subscribeUsersToTopic(fcmTokens: string[], topic: string) {
    try {
      await this.firebaseMessagingService.subscribeToTopic(fcmTokens, topic);
      this.logger.log(`Subscribed ${fcmTokens.length} tokens to topic: ${topic}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  async unsubscribeUsersFromTopic(fcmTokens: string[], topic: string) {
    try {
      await this.firebaseMessagingService.unsubscribeFromTopic(fcmTokens, topic);
      this.logger.log(`Unsubscribed ${fcmTokens.length} tokens from topic: ${topic}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }
}
