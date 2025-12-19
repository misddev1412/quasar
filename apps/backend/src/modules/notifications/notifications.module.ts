import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationPreferenceEntity } from './entities/notification-preference.entity';
import { NotificationChannelConfigEntity } from './entities/notification-channel-config.entity';
import { NotificationTelegramConfigEntity } from './entities/notification-telegram-config.entity';
import { NotificationEventFlow } from './entities/notification-event-flow.entity';
import { UserDeviceEntity } from './entities/user-device.entity';
import { MailTemplate } from '../mail-template/entities/mail-template.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { NotificationChannelConfigRepository } from './repositories/notification-channel-config.repository';
import { NotificationTelegramConfigRepository } from './repositories/notification-telegram-config.repository';
import { NotificationEventFlowRepository } from './repositories/notification-event-flow.repository';
import { UserDeviceRepository } from './repositories/user-device.repository';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationChannelConfigService } from './services/notification-channel-config.service';
import { NotificationTelegramConfigService } from './services/notification-telegram-config.service';
import { NotificationEventFlowService } from './services/notification-event-flow.service';
import { FirebaseMessagingService } from './services/firebase-messaging.service';
import { FCMNotificationService } from './services/fcm-notification.service';
import { AdminNotificationRouter } from './routers/admin-notification.router';
import { UserNotificationRouter } from './routers/user-notification.router';
import { AdminNotificationPreferencesRouter } from './routers/admin-notification-preferences.router';
import { AdminNotificationChannelsRouter } from './routers/admin-notification-channels.router';
import {
  AdminNotificationTelegramConfigsRouter,
  AdminNotificationTelegramConfigPermissions,
} from './routers/admin-notification-telegram-configs.router';
import { ClientNotificationRouter } from './routers/client-notification.router';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationPreferenceEntity,
      NotificationChannelConfigEntity,
      NotificationTelegramConfigEntity,
      NotificationEventFlow,
      NotificationEventFlow,
      MailTemplate,
      UserDeviceEntity,
    ]),
    SharedModule,
    FirebaseModule,
    UserModule,
  ],
  providers: [
    NotificationRepository,
    NotificationPreferenceRepository,
    NotificationChannelConfigRepository,
    NotificationTelegramConfigRepository,
    NotificationTelegramConfigRepository,
    NotificationEventFlowRepository,
    UserDeviceRepository,
    NotificationService,
    NotificationPreferenceService,
    NotificationChannelConfigService,
    NotificationTelegramConfigService,
    NotificationEventFlowService,
    FirebaseMessagingService,
    FCMNotificationService,
    ...AdminNotificationTelegramConfigPermissions,
    AdminNotificationRouter,
    UserNotificationRouter,
    AdminNotificationPreferencesRouter,
    AdminNotificationChannelsRouter,
    AdminNotificationTelegramConfigsRouter,
    ClientNotificationRouter,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    NotificationChannelConfigService,
    NotificationTelegramConfigService,
    NotificationEventFlowService,
    FirebaseMessagingService,
    FCMNotificationService,
    NotificationRepository,
    NotificationPreferenceRepository,
    NotificationChannelConfigRepository,
    NotificationTelegramConfigRepository,
    NotificationTelegramConfigRepository,
    NotificationEventFlowRepository,
    UserDeviceRepository,
    AdminNotificationRouter,
    UserNotificationRouter,
    AdminNotificationPreferencesRouter,
    AdminNotificationChannelsRouter,
    AdminNotificationTelegramConfigsRouter,
    ClientNotificationRouter,
  ],
})
export class NotificationsModule { }
