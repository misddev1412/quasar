import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailLog } from '@backend/modules/mail-log/entities/mail-log.entity';
import { MailLogRepository } from '@backend/modules/mail-log/repositories/mail-log.repository';
import { MailLogService } from '@backend/modules/mail-log/services/mail-log.service';
import { AdminMailLogRouter } from '@backend/modules/mail-log/routers/admin-mail-log.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailLog]),
    SharedModule,
  ],
  providers: [
    MailLogRepository,
    MailLogService,
    AdminMailLogRouter,
  ],
  exports: [
    MailLogRepository,
    MailLogService,
    AdminMailLogRouter,
  ],
})
export class MailLogModule {}
