import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailFlow } from '@backend/modules/email-flow/entities/email-flow.entity';
import { EmailFlowRepository } from '@backend/modules/email-flow/repositories/email-flow.repository';
import { EmailFlowService } from '@backend/modules/email-flow/services/email-flow.service';
import { AdminMailChannelPriorityRouter } from '@backend/modules/email-flow/routers/admin-mail-channel-priority.router';
import { MailProviderModule } from '@backend/modules/mail-provider/mail-provider.module';
import { MailTemplateModule } from '@backend/modules/mail-template/mail-template.module';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailFlow]),
    MailProviderModule,
    MailTemplateModule,
    SharedModule,
  ],
  providers: [
    EmailFlowRepository,
    EmailFlowService,
    AdminMailChannelPriorityRouter,
  ],
  exports: [
    EmailFlowRepository,
    EmailFlowService,
    AdminMailChannelPriorityRouter,
  ],
})
export class EmailFlowModule {}








