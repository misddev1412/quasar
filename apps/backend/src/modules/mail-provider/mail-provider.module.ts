import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailProvider } from '@backend/modules/mail-provider/entities/mail-provider.entity';
import { MailProviderRepository } from '@backend/modules/mail-provider/repositories/mail-provider.repository';
import { MailProviderService } from '@backend/modules/mail-provider/services/mail-provider.service';
import { AdminMailProviderRouter } from '@backend/modules/mail-provider/routers/admin-mail-provider.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { MailLogModule } from '@backend/modules/mail-log/mail-log.module';

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









