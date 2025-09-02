import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailTemplate } from './entities/mail-template.entity';
import { MailTemplateRepository } from './repositories/mail-template.repository';
import { MailTemplateService } from './services/mail-template.service';
import { AdminMailTemplateRouter } from '../../trpc/routers/admin/mail-template.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailTemplate]),
    SharedModule,
  ],
  providers: [
    MailTemplateRepository,
    MailTemplateService,
    AdminMailTemplateRouter,
  ],
  exports: [
    MailTemplateService,
    MailTemplateRepository,
  ],
})
export class MailTemplateModule {}
