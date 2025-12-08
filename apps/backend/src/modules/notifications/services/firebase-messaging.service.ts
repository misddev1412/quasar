import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAuthService } from '../../firebase/services/firebase-auth.service';
import { FirebaseConfigService } from '../../firebase/services/firebase-config.service';
import * as admin from 'firebase-admin';
import { NotificationRepository, CreateNotificationDto } from '../repositories/notification.repository';
import { NotificationEntity, NotificationType } from '../entities/notification.entity';

export interface FCMPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  clickAction?: string;
  tag?: string;
}

export interface FCMData {
  [key: string]: string;
}

export interface SendNotificationOptions {
  token?: string;
  tokens?: string[];
  topic?: string;
  condition?: string;
  data?: FCMData;
  android?: admin.messaging.AndroidConfig;
  apns?: admin.messaging.ApnsConfig;
  webpush?: admin.messaging.WebpushConfig;
  fcmOptions?: admin.messaging.FcmOptions;
}

export interface SendToUserOptions {
  userId: string;
  userFcmTokens?: string[];
  saveToDatabase?: boolean;
  notificationType?: NotificationType;
  actionUrl?: string;
  additionalData?: Record<string, unknown>;
}

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(FirebaseMessagingService.name);

  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly firebaseConfigService: FirebaseConfigService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  private async getMessaging(): Promise<admin.messaging.Messaging | null> {
    try {
      const adminApp = await this.getFirebaseAdminApp();
      if (!adminApp) {
        this.logger.warn('Firebase Admin not configured for messaging');
        return null;
      }
      return admin.messaging(adminApp);
    } catch (error) {
      this.logger.error('Error getting Firebase messaging instance:', error);
      return null;
    }
  }

  private async getFirebaseAdminApp(): Promise<admin.app.App | null> {
    try {
      if (admin.apps.length > 0) {
        return admin.apps[0];
      }

      // Initialize Firebase Admin if not already initialized
      const serviceAccountConfig = await this.firebaseConfigService.getAdminConfig();
      if (serviceAccountConfig) {
        const app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountConfig),
        });
        this.logger.log('Firebase Admin initialized for messaging');
        return app;
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting Firebase admin app:', error);
      return null;
    }
  }

  async sendToToken(
    token: string,
    payload: FCMPayload,
    options: Omit<SendNotificationOptions, 'token' | 'tokens'> = {}
  ): Promise<string | null> {
    const messaging = await this.getMessaging();
    if (!messaging) return null;

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: options.data || {},
        android: options.android,
        apns: options.apns,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            image: payload.image,
            badge: payload.badge,
            sound: payload.sound,
            tag: payload.tag,
            ...(payload.clickAction && {
              actions: [{ action: 'open', title: 'Open' }],
            }),
          },
          fcmOptions: {
            link: payload.clickAction,
            ...options.fcmOptions,
          },
          ...options.webpush,
        },
        fcmOptions: options.fcmOptions,
      };

      const response = await messaging.send(message);
      this.logger.log(`Successfully sent message to token: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending message to token ${token}:`, error);
      return null;
    }
  }

  async sendToMultipleTokens(
    tokens: string[],
    payload: FCMPayload,
    options: Omit<SendNotificationOptions, 'token' | 'tokens'> = {}
  ): Promise<admin.messaging.BatchResponse | null> {
    const messaging = await this.getMessaging();
    if (!messaging || tokens.length === 0) return null;

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: options.data || {},
        android: options.android,
        apns: options.apns,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            image: payload.image,
            badge: payload.badge,
            sound: payload.sound,
            tag: payload.tag,
          },
          fcmOptions: {
            link: payload.clickAction,
            ...options.fcmOptions,
          },
          ...options.webpush,
        },
        fcmOptions: options.fcmOptions,
      };

      const response = await (messaging as admin.messaging.Messaging & { sendMulticast: (message: admin.messaging.MulticastMessage) => Promise<admin.messaging.BatchResponse> }).sendMulticast(message);
      this.logger.log(
        `Successfully sent ${response.successCount}/${tokens.length} messages`
      );

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.warn(
              `Failed to send to token ${tokens[idx]}: ${resp.error?.message}`
            );
          }
        });
      }

      return response;
    } catch (error) {
      this.logger.error('Error sending multicast message:', error);
      return null;
    }
  }

  async sendToTopic(
    topic: string,
    payload: FCMPayload,
    options: Omit<SendNotificationOptions, 'topic'> = {}
  ): Promise<string | null> {
    const messaging = await this.getMessaging();
    if (!messaging) return null;

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: options.data || {},
        android: options.android,
        apns: options.apns,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            image: payload.image,
            badge: payload.badge,
            sound: payload.sound,
            tag: payload.tag,
          },
          fcmOptions: {
            link: payload.clickAction,
            ...options.fcmOptions,
          },
          ...options.webpush,
        },
        fcmOptions: options.fcmOptions,
      };

      const response = await messaging.send(message);
      this.logger.log(`Successfully sent message to topic ${topic}: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending message to topic ${topic}:`, error);
      return null;
    }
  }

  async sendToUser(
    payload: FCMPayload,
    options: SendToUserOptions
  ): Promise<NotificationEntity | null> {
    const {
      userId,
      userFcmTokens = [],
      saveToDatabase = true,
      notificationType = NotificationType.INFO,
      actionUrl,
      additionalData,
    } = options;

    let notificationEntity: NotificationEntity | null = null;

    if (saveToDatabase) {
      try {
        const createNotificationDto: CreateNotificationDto = {
          userId,
          title: payload.title,
          body: payload.body,
          type: notificationType,
          actionUrl: actionUrl || payload.clickAction,
          icon: payload.icon,
          image: payload.image,
          data: additionalData,
        };

        notificationEntity = await this.notificationRepository.create(createNotificationDto);
      } catch (error) {
        this.logger.error('Error saving notification to database:', error);
      }
    }

    if (userFcmTokens.length > 0) {
      const response = await this.sendToMultipleTokens(userFcmTokens, payload);

      if (response && notificationEntity) {
        try {
          await this.notificationRepository.markAsSent(
            notificationEntity.id,
            userFcmTokens[0]
          );
        } catch (error) {
          this.logger.error('Error updating notification sent status:', error);
        }
      }
    }

    return notificationEntity;
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    const messaging = await this.getMessaging();
    if (!messaging) return;

    try {
      const response = await messaging.subscribeToTopic(tokens, topic);
      this.logger.log(
        `Successfully subscribed ${response.successCount}/${tokens.length} tokens to topic ${topic}`
      );

      if (response.failureCount > 0) {
        this.logger.warn(
          `Failed to subscribe ${response.failureCount} tokens to topic ${topic}`
        );
      }
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    const messaging = await this.getMessaging();
    if (!messaging) return;

    try {
      const response = await messaging.unsubscribeFromTopic(tokens, topic);
      this.logger.log(
        `Successfully unsubscribed ${response.successCount}/${tokens.length} tokens from topic ${topic}`
      );

      if (response.failureCount > 0) {
        this.logger.warn(
          `Failed to unsubscribe ${response.failureCount} tokens from topic ${topic}`
        );
      }
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    const messaging = await this.getMessaging();
    if (!messaging) return false;

    try {
      await messaging.send({
        token,
        data: { test: 'true' },
      }, true);
      return true;
    } catch (error) {
      this.logger.warn(`Invalid FCM token: ${token}`);
      return false;
    }
  }

  async sendTestNotification(
    token: string,
    title: string = 'Test Notification',
    body: string = 'This is a test notification from your app'
  ): Promise<string | null> {
    return this.sendToToken(token, { title, body });
  }
}