import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { MailProvider } from '../mail-provider/entities/mail-provider.entity';
import { MailTemplate } from '../mail-template/entities/mail-template.entity';
import { MailLog } from '../mail-log/entities/mail-log.entity';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { NotificationPreferenceEntity } from '../notifications/entities/notification-preference.entity';
import { NotificationChannelConfigEntity } from '../notifications/entities/notification-channel-config.entity';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { FirebaseConfigEntity } from '../firebase/entities/firebase-config.entity';

// Repositories
import { MailProviderRepository } from '../mail-provider/repositories/mail-provider.repository';
import { MailTemplateRepository } from '../mail-template/repositories/mail-template.repository';
import { MailLogRepository } from '../mail-log/repositories/mail-log.repository';
import { NotificationRepository } from '../notifications/repositories/notification.repository';
import { NotificationPreferenceRepository } from '../notifications/repositories/notification-preference.repository';
import { NotificationChannelConfigRepository } from '../notifications/repositories/notification-channel-config.repository';
import { UserRepository } from '../user/repositories/user.repository';

// Services
import { MailProviderService } from '../mail-provider/services/mail-provider.service';
import { MailTemplateService } from '../mail-template/services/mail-template.service';
import { MailLogService } from '../mail-log/services/mail-log.service';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationPreferenceService } from '../notifications/services/notification-preference.service';
import { NotificationChannelConfigService } from '../notifications/services/notification-channel-config.service';
import { FirebaseMessagingService } from '../notifications/services/firebase-messaging.service';
import { FirebaseAuthService } from '../firebase/services/firebase-auth.service';
import { FirebaseConfigService } from '../firebase/services/firebase-config.service';
import { FirebaseConfigRepository } from '../firebase/repositories/firebase-config.repository';
import { ResponseService } from '../shared/services/response.service';

// Worker-specific services
import { WorkerEmailService } from './services/worker-email.service';
import { WorkerNotificationService } from './services/worker-notification.service';
import { WorkerOrderService } from './services/worker-order.service';
import { WorkerReportService } from './services/worker-report.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      MailProvider,
      MailTemplate,
      MailLog,
      NotificationEntity,
      NotificationPreferenceEntity,
      NotificationChannelConfigEntity,
      User,
      UserProfile,
      FirebaseConfigEntity,
    ]),
  ],
  providers: [
    // Shared Services
    ResponseService,
    
    // Repositories
    MailProviderRepository,
    MailTemplateRepository,
    MailLogRepository,
    NotificationRepository,
    NotificationPreferenceRepository,
    NotificationChannelConfigRepository,
    UserRepository,
    FirebaseConfigRepository,
    
    // Backend Services
    MailProviderService,
    MailTemplateService,
    MailLogService,
    FirebaseConfigService,
    FirebaseAuthService,
    FirebaseMessagingService,
    NotificationPreferenceService,
    NotificationChannelConfigService,
    NotificationService,
    
    // Worker Services
    WorkerEmailService,
    WorkerNotificationService,
    WorkerOrderService,
    WorkerReportService,
  ],
  exports: [
    // Export worker services for use by processors
    WorkerEmailService,
    WorkerNotificationService,
    WorkerOrderService,
    WorkerReportService,
    
    // Also export base services for direct usage if needed
    MailProviderService,
    NotificationService,
    MailLogService,
  ],
})
export class WorkerServicesModule {}
