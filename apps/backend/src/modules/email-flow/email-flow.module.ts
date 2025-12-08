import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailFlow } from './entities/email-flow.entity';
import { EmailFlowRepository } from './repositories/email-flow.repository';
import { EmailFlowService } from './services/email-flow.service';
import { AdminEmailFlowRouter } from './routers/admin-email-flow.router';
import { MailProviderModule } from '../mail-provider/mail-provider.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailFlow]),
    MailProviderModule,
    SharedModule,
  ],
  providers: [
    EmailFlowRepository,
    EmailFlowService,
    AdminEmailFlowRouter,
  ],
  exports: [
    EmailFlowRepository,
    EmailFlowService,
    AdminEmailFlowRouter,
  ],
})
export class EmailFlowModule {}









