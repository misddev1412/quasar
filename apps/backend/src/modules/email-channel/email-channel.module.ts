import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChannel } from '@backend/modules/email-channel/entities/email-channel.entity';
import { EmailChannelRepository } from '@backend/modules/email-channel/repositories/email-channel.repository';
import { EmailChannelService } from '@backend/modules/email-channel/services/email-channel.service';
import { AdminEmailChannelRouter } from '@backend/modules/email-channel/routers/admin-email-channel.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailChannel]),
    SharedModule,
  ],
  providers: [
    EmailChannelRepository,
    EmailChannelService,
    AdminEmailChannelRouter,
  ],
  exports: [
    EmailChannelRepository,
    EmailChannelService,
    AdminEmailChannelRouter,
  ],
})
export class EmailChannelModule {}