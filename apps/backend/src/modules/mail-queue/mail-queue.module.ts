import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailQueue } from './entities/mail-queue.entity';
import { MailQueueRepository } from './repositories/mail-queue.repository';
import { MailQueueService } from './services/mail-queue.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailQueue])],
  providers: [MailQueueRepository, MailQueueService],
  exports: [MailQueueRepository, MailQueueService],
})
export class MailQueueModule {}
