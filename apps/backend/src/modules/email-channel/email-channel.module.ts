import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChannel } from './entities/email-channel.entity';
import { EmailChannelRepository } from './repositories/email-channel.repository';
import { EmailChannelService } from './services/email-channel.service';
import { AdminEmailChannelRouter } from './routers/admin-email-channel.router';
import { SharedModule } from '../shared/shared.module';

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