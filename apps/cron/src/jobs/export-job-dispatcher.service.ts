import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataExportJob, DataExportJobStatus } from '@backend/modules/export/entities/data-export-job.entity';
import { ExportQueueService } from '@backend/modules/export/services/export-queue.service';

@Injectable()
export class ExportJobDispatcher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExportJobDispatcher.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(DataExportJob)
    private readonly exportRepository: Repository<DataExportJob>,
    private readonly exportQueueService: ExportQueueService,
  ) {}

  onModuleInit(): void {
    const initialDelay = this.configService.get<number>('cron.exportJobs.initialDelayMs') ?? 1000;
    this.logger.log(
      `Starting export dispatcher (interval=${this.intervalMs}ms, batchSize=${this.batchSize})`
    );
    this.scheduleNextRun(initialDelay);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private get intervalMs(): number {
    return this.configService.get<number>('cron.exportJobs.intervalMs') ?? 15000;
  }

  private get batchSize(): number {
    return this.configService.get<number>('cron.exportJobs.batchSize') ?? 20;
  }

  private scheduleNextRun(delay?: number): void {
    const nextDelay = delay ?? this.intervalMs;
    this.timer = setTimeout(async () => {
      await this.dispatchPendingJobs();
      this.scheduleNextRun();
    }, Math.max(nextDelay, 1000));
  }

  private async dispatchPendingJobs(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Dispatch already running, skipping this interval');
      return;
    }

    this.isProcessing = true;
    try {
      const pendingJobs = await this.exportRepository.find({
        where: { status: DataExportJobStatus.PENDING },
        order: { createdAt: 'ASC' },
        take: this.batchSize,
      });

      if (!pendingJobs.length) {
        this.logger.debug('No pending export jobs found');
        return;
      }

      for (const job of pendingJobs) {
        await this.processJob(job);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to dispatch export jobs: ${err.message}`, err.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: DataExportJob): Promise<void> {
    try {
      const locked = await this.exportRepository.update(
        {
          id: job.id,
          status: DataExportJobStatus.PENDING,
        },
        {
          status: DataExportJobStatus.PROCESSING,
          error: null,
        }
      );

      if (!locked.affected) {
        this.logger.debug(`Job ${job.id} already being processed, skipping`);
        return;
      }

      job.status = DataExportJobStatus.PROCESSING;

      await this.exportQueueService.enqueue(job);
      this.logger.log(`Enqueued export job ${job.id} (${job.resource})`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to enqueue export job ${job.id}: ${err.message}`);
      await this.exportRepository.update(job.id, {
        status: DataExportJobStatus.PENDING,
        error: err.message,
      });
    }
  }
}
