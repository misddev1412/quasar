import { Injectable } from '@nestjs/common';
import { MailQueueRepository, EnqueueMailPayload } from '../repositories/mail-queue.repository';
import { MailQueue } from '../entities/mail-queue.entity';

@Injectable()
export class MailQueueService {
  constructor(private readonly repository: MailQueueRepository) {}

  enqueueMail(payload: EnqueueMailPayload): Promise<MailQueue> {
    return this.repository.enqueue(payload);
  }

  async claimPending(limit: number, workerId: string): Promise<MailQueue[]> {
    return this.repository.findPending(limit, workerId);
  }

  async markQueued(jobId: string, metadata?: Record<string, any>): Promise<void> {
    await this.repository.markAsQueued(jobId, metadata);
  }

  async markSent(jobId: string): Promise<void> {
    await this.repository.markAsSent(jobId);
  }

  async markFailed(jobId: string, error: string): Promise<void> {
    await this.repository.markAsFailed(jobId, error);
  }

  async releaseJobs(jobIds: string[]): Promise<void> {
    await this.repository.release(jobIds);
  }
}
