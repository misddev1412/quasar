import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { NotificationPayload, NotificationResult } from '../interfaces/worker-payloads.interface';

@Injectable()
export class WorkerNotificationService {
  private readonly logger = new Logger(WorkerNotificationService.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send notification to a user through multiple channels
   */
  async sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
    this.logger.log(`Sending notification to user: ${payload.userId}`);

    const channels = payload.channels || ['in_app'];
    const result: NotificationResult = {
      success: false,
      channels: {},
    };

    try {
      // Map payload type to NotificationType enum
      const notificationType = this.mapNotificationType(payload.type);

      // Send in-app notification
      if (channels.includes('in_app')) {
        try {
          const notification = await this.notificationService.sendNotificationToUser({
            userId: payload.userId,
            title: payload.title,
            body: payload.message,
            type: notificationType,
            actionUrl: payload.actionUrl,
            icon: payload.icon,
            image: payload.image,
            data: payload.data,
            fcmTokens: channels.includes('push') ? payload.fcmTokens : undefined,
            sendPush: channels.includes('push'),
          });

          result.notificationId = notification?.id;
          result.channels.in_app = { success: true };

          if (channels.includes('push') && payload.fcmTokens?.length) {
            result.channels.push = { success: true };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.channels.in_app = { success: false, error: errorMessage };
          this.logger.error(`In-app notification failed: ${errorMessage}`);
        }
      }

      // Send push notification separately if not sent with in_app
      if (channels.includes('push') && !channels.includes('in_app') && payload.fcmTokens?.length) {
        try {
          await this.notificationService.sendNotificationToUser({
            userId: payload.userId,
            title: payload.title,
            body: payload.message,
            type: notificationType,
            actionUrl: payload.actionUrl,
            icon: payload.icon,
            image: payload.image,
            data: payload.data,
            fcmTokens: payload.fcmTokens,
            sendPush: true,
          });
          result.channels.push = { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.channels.push = { success: false, error: errorMessage };
          this.logger.error(`Push notification failed: ${errorMessage}`);
        }
      }

      // Send email notification if requested
      if (channels.includes('email')) {
        // Email should be handled by email processor
        // This is just a placeholder - actual implementation depends on your email setup
        result.channels.email = {
          success: false,
          error: 'Email should be sent via email queue',
        };
        this.logger.warn('Email notification should be routed to email queue');
      }

      // Send SMS notification if requested
      if (channels.includes('sms')) {
        // SMS integration placeholder
        result.channels.sms = {
          success: false,
          error: 'SMS integration not implemented',
        };
        this.logger.warn('SMS notification not implemented');
      }

      // Determine overall success
      result.success = Object.values(result.channels).some(ch => ch?.success);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send notification: ${errorMessage}`);
      return {
        success: false,
        channels: {},
      };
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    payload: Omit<NotificationPayload, 'userId'>
  ): Promise<{ total: number; success: number; failed: number }> {
    this.logger.log(`Sending bulk notifications to ${userIds.length} users`);

    const notificationType = this.mapNotificationType(payload.type);

    try {
      const notifications = await this.notificationService.sendBulkNotifications({
        userIds,
        title: payload.title,
        body: payload.message,
        type: notificationType,
        actionUrl: payload.actionUrl,
        icon: payload.icon,
        image: payload.image,
        data: payload.data,
      });

      return {
        total: userIds.length,
        success: notifications.length,
        failed: userIds.length - notifications.length,
      };
    } catch (error) {
      this.logger.error(`Failed to send bulk notifications: ${error}`);
      return {
        total: userIds.length,
        success: 0,
        failed: userIds.length,
      };
    }
  }

  /**
   * Send system-wide notification
   */
  async sendSystemNotification(
    userIds: string[],
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    await this.notificationService.sendSystemNotification(
      userIds,
      title,
      message,
      actionUrl
    );
  }

  /**
   * Map payload type string to NotificationType enum
   */
  private mapNotificationType(type: string): NotificationType {
    const typeMap: Record<string, NotificationType> = {
      info: NotificationType.INFO,
      warning: NotificationType.WARNING,
      error: NotificationType.ERROR,
      success: NotificationType.SUCCESS,
      system: NotificationType.SYSTEM,
      order: NotificationType.ORDER,
      product: NotificationType.PRODUCT,
      user: NotificationType.USER,
    };

    return typeMap[type] || NotificationType.INFO;
  }
}
