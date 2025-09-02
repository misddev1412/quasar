import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailChannel } from './entities/email-channel.entity';
import { EmailChannelRepository } from './repositories/email-channel.repository';
import { EmailChannelService } from './services/email-channel.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailChannel])],
  providers: [EmailChannelRepository, EmailChannelService],
  exports: [EmailChannelRepository, EmailChannelService],
})
export class EmailChannelModule {}