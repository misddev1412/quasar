import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailQueue } from '@backend/modules/mail-queue/entities/mail-queue.entity';
import { MailQueueRepository } from '@backend/modules/mail-queue/repositories/mail-queue.repository';
import { MailQueueService } from '@backend/modules/mail-queue/services/mail-queue.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailQueue])],
  providers: [MailQueueRepository, MailQueueService],
  exports: [MailQueueRepository, MailQueueService],
})
export class MailQueueModule {}
