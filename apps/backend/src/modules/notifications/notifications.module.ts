import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { FirebaseModule } from '@backend/modules/firebase/firebase.module';
import { NotificationEntity } from '@backend/modules/notifications/entities/notification.entity';
import { NotificationPreferenceEntity } from '@backend/modules/notifications/entities/notification-preference.entity';
import { NotificationChannelConfigEntity } from '@backend/modules/notifications/entities/notification-channel-config.entity';
import { NotificationTelegramConfigEntity } from '@backend/modules/notifications/entities/notification-telegram-config.entity';
import { NotificationEventFlow } from '@backend/modules/notifications/entities/notification-event-flow.entity';
import { UserDeviceEntity } from '@backend/modules/notifications/entities/user-device.entity';
import { MailTemplate } from '@backend/modules/mail-template/entities/mail-template.entity';
import { NotificationRepository } from '@backend/modules/notifications/repositories/notification.repository';
import { NotificationPreferenceRepository } from '@backend/modules/notifications/repositories/notification-preference.repository';
import { NotificationChannelConfigRepository } from '@backend/modules/notifications/repositories/notification-channel-config.repository';
import { NotificationTelegramConfigRepository } from '@backend/modules/notifications/repositories/notification-telegram-config.repository';
import { NotificationEventFlowRepository } from '@backend/modules/notifications/repositories/notification-event-flow.repository';
import { UserDeviceRepository } from '@backend/modules/notifications/repositories/user-device.repository';
import { NotificationService } from '@backend/modules/notifications/services/notification.service';
import { NotificationPreferenceService } from '@backend/modules/notifications/services/notification-preference.service';
import { NotificationChannelConfigService } from '@backend/modules/notifications/services/notification-channel-config.service';
import { NotificationTelegramConfigService } from '@backend/modules/notifications/services/notification-telegram-config.service';
import { NotificationEventFlowService } from '@backend/modules/notifications/services/notification-event-flow.service';
import { FirebaseMessagingService } from '@backend/modules/notifications/services/firebase-messaging.service';
import { FCMNotificationService } from '@backend/modules/notifications/services/fcm-notification.service';
import { AdminNotificationRouter } from '@backend/modules/notifications/routers/admin-notification.router';
import { UserNotificationRouter } from '@backend/modules/notifications/routers/user-notification.router';
import { AdminNotificationPreferencesRouter } from '@backend/modules/notifications/routers/admin-notification-preferences.router';
import { AdminNotificationChannelsRouter } from '@backend/modules/notifications/routers/admin-notification-channels.router';
import {
  AdminNotificationTelegramConfigsRouter,
  AdminNotificationTelegramConfigPermissions,
} from '@backend/modules/notifications/routers/admin-notification-telegram-configs.router';
import { ClientNotificationRouter } from '@backend/modules/notifications/routers/client-notification.router';
import { UserModule } from '@backend/modules/user/user.module';

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
    forwardRef(() => UserModule),
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
