import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailFlow } from './entities/email-flow.entity';
import { EmailFlowRepository } from './repositories/email-flow.repository';
import { EmailFlowService } from './services/email-flow.service';
import { AdminMailChannelPriorityRouter } from './routers/admin-mail-channel-priority.router';
import { MailProviderModule } from '../mail-provider/mail-provider.module';
import { MailTemplateModule } from '../mail-template/mail-template.module';
import { SharedModule } from '../shared/shared.module';

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








