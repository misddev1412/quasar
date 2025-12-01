import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailProvider } from './entities/mail-provider.entity';
import { MailProviderRepository } from './repositories/mail-provider.repository';
import { MailProviderService } from './services/mail-provider.service';
import { AdminMailProviderRouter } from './routers/admin-mail-provider.router';
import { SharedModule } from '../shared/shared.module';
import { MailLogModule } from '../mail-log/mail-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailProvider]),
    SharedModule,
    MailLogModule,
  ],
  providers: [
    MailProviderRepository,
    MailProviderService,
    AdminMailProviderRouter,
  ],
  exports: [
    MailProviderRepository,
    MailProviderService,
    AdminMailProviderRouter,
  ],
})
export class MailProviderModule {}



