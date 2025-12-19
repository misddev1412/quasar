import { Injectable, Logger } from '@nestjs/common';
import { FirebaseConfigService } from './firebase-config.service';
import * as admin from 'firebase-admin';
import { NotificationEvent } from '../../notifications/entities/notification-event.enum';

export interface RealtimeOrderNotificationPayload {
  id: string;
  userId: string;
  title: string;
  body: string;
  eventKey?: NotificationEvent;
  orderId?: string;
  status?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class FirebaseRealtimeDatabaseService {
  private readonly logger = new Logger(FirebaseRealtimeDatabaseService.name);
  private readonly appName = 'quasar-realtime-db';
  private app: admin.app.App | null = null;

  constructor(
    private readonly firebaseConfigService: FirebaseConfigService,
  ) {}

  private async getApp(): Promise<admin.app.App | null> {
    if (this.app) {
      return this.app;
    }

    const existingApp = admin.apps.find(app => app.name === this.appName);
    if (existingApp) {
      this.app = existingApp;
      return this.app;
    }

    const adminConfig = await this.firebaseConfigService.getAdminConfig();
    if (!adminConfig) {
      this.logger.warn('Firebase admin config not found. Realtime database features are disabled.');
      return null;
    }

    const projectId = (adminConfig as Record<string, any>).project_id;
    const databaseURL = projectId ? `https://${projectId}.firebaseio.com` : undefined;

    try {
      this.app = admin.initializeApp(
        {
          credential: admin.credential.cert(adminConfig as admin.ServiceAccount),
          ...(databaseURL ? { databaseURL } : {}),
        },
        this.appName,
      );
      this.logger.log('Firebase realtime database initialized');
      return this.app;
    } catch (error) {
      this.logger.error('Failed to initialize Firebase realtime database', error as Error);
      return null;
    }
  }

  private async getDatabase(): Promise<admin.database.Database | null> {
    const app = await this.getApp();
    if (!app) {
      return null;
    }

    try {
      return admin.database(app);
    } catch (error) {
      this.logger.error('Unable to access Firebase realtime database', error as Error);
      return null;
    }
  }

  async publish(path: string, payload: unknown): Promise<void> {
    const database = await this.getDatabase();
    if (!database) {
      return;
    }

    try {
      await database.ref(path).set(payload);
    } catch (error) {
      this.logger.error(`Failed to publish realtime payload at path ${path}`, error as Error);
    }
  }

  async append(path: string, payload: unknown): Promise<void> {
    const database = await this.getDatabase();
    if (!database) {
      return;
    }

    try {
      await database.ref(path).push(payload);
    } catch (error) {
      this.logger.error(`Failed to append realtime payload at path ${path}`, error as Error);
    }
  }

  async publishOrderNotification(userId: string, payload: RealtimeOrderNotificationPayload): Promise<void> {
    const safePayload = {
      ...payload,
      publishedAt: new Date().toISOString(),
    };

    await this.publish(`/order-notifications/${userId}/${payload.id}`, safePayload);
    await this.publish(`/order-notifications/${userId}/latest`, safePayload);
    await this.append('/order-notifications/feed', safePayload);
  }
}
