import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailLog } from './entities/mail-log.entity';
import { MailLogRepository } from './repositories/mail-log.repository';
import { MailLogService } from './services/mail-log.service';
import { AdminMailLogRouter } from './routers/admin-mail-log.router';
import { SharedModule } from '../shared/shared.module';

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
