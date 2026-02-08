import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailTemplate } from '@backend/modules/mail-template/entities/mail-template.entity';
import { MailTemplateRepository } from '@backend/modules/mail-template/repositories/mail-template.repository';
import { MailTemplateService } from '@backend/modules/mail-template/services/mail-template.service';
import { AdminMailTemplateRouter } from '@backend/modules/mail-template/routers/admin-mail-template.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

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
    AdminMailTemplateRouter,
  ],
})
export class MailTemplateModule {}
