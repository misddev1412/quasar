import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationPreferenceEntity } from './entities/notification-preference.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { FirebaseMessagingService } from './services/firebase-messaging.service';
import { FCMNotificationService } from './services/fcm-notification.service';
import { AdminNotificationRouter } from './routers/admin-notification.router';
import { UserNotificationRouter } from './routers/user-notification.router';
import { AdminNotificationPreferencesRouter } from './routers/admin-notification-preferences.router';
import { ClientNotificationRouter } from './routers/client-notification.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, NotificationPreferenceEntity]),
    SharedModule,
    FirebaseModule,
  ],
  providers: [
    NotificationRepository,
    NotificationPreferenceRepository,
    NotificationService,
    NotificationPreferenceService,
    FirebaseMessagingService,
    FCMNotificationService,
    AdminNotificationRouter,
    UserNotificationRouter,
    AdminNotificationPreferencesRouter,
    ClientNotificationRouter,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    FirebaseMessagingService,
    FCMNotificationService,
    NotificationRepository,
    NotificationPreferenceRepository,
    AdminNotificationRouter,
    UserNotificationRouter,
    AdminNotificationPreferencesRouter,
    ClientNotificationRouter,
  ],
})
export class NotificationsModule {}