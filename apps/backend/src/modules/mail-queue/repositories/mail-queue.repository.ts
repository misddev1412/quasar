import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailQueue, MailQueueStatus } from '../entities/mail-queue.entity';

export interface EnqueueMailPayload {
  emailFlowId?: string | null;
  mailTemplateId?: string | null;
  mailProviderId?: string | null;
  recipientEmail: string;
  recipientName?: string | null;
  subject?: string | null;
  payload?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  priority?: number;
  scheduledAt?: Date;
}

@Injectable()
export class MailQueueRepository {
  constructor(
    @InjectRepository(MailQueue)
    private readonly repository: Repository<MailQueue>,
  ) {}

  enqueue(payload: EnqueueMailPayload): Promise<MailQueue> {
    const job = this.repository.create({
      ...payload,
      priority: payload.priority ?? 5,
      scheduledAt: payload.scheduledAt ?? new Date(),
      availableAt: payload.scheduledAt ?? new Date(),
      status: MailQueueStatus.PENDING,
    });
    return this.repository.save(job);
  }

  async findPending(limit: number, lockId: string): Promise<MailQueue[]> {
    const now = new Date();
    const jobs = await this.repository
      .createQueryBuilder('queue')
      .where('queue.status = :status', { status: MailQueueStatus.PENDING })
      .andWhere('queue.scheduledAt <= :now', { now })
      .andWhere('(queue.availableAt IS NULL OR queue.availableAt <= :now)', { now })
      .orderBy('queue.priority', 'ASC')
      .addOrderBy('queue.createdAt', 'ASC')
      .take(limit)
      .getMany();

    if (jobs.length === 0) {
      return [];
    }

    await this.repository
      .createQueryBuilder()
      .update(MailQueue)
      .set({
        status: MailQueueStatus.PROCESSING,
        lockedAt: now,
        lockedBy: lockId,
      })
      .whereInIds(jobs.map((job) => job.id))
      .execute();

    return jobs.map((job) => {
      job.status = MailQueueStatus.PROCESSING;
      job.lockedAt = now;
      job.lockedBy = lockId;
      return job;
    });
  }

  async markAsQueued(jobId: string, metadata?: Record<string, any>): Promise<void> {
    await this.repository.update(jobId, {
      status: MailQueueStatus.QUEUED,
      metadata: metadata ?? undefined,
      lockedAt: null,
      lockedBy: null,
    });
  }

  async markAsSent(jobId: string): Promise<void> {
    await this.repository.update(jobId, {
      status: MailQueueStatus.SENT,
      lockedAt: null,
      lockedBy: null,
      lastError: null,
    });
  }

  async markAsFailed(jobId: string, error: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MailQueue)
      .set({
        status: MailQueueStatus.FAILED,
        lastError: error,
        attemptCount: () => '"attempt_count" + 1',
        lockedAt: null,
        lockedBy: null,
      })
      .where('id = :id', { id: jobId })
      .execute();
  }

  async release(jobIds: string[]): Promise<void> {
    if (!jobIds.length) return;
    await this.repository
      .createQueryBuilder()
      .update(MailQueue)
      .set({
        status: MailQueueStatus.PENDING,
        lockedAt: null,
        lockedBy: null,
      })
      .whereInIds(jobIds)
      .execute();
  }
}
