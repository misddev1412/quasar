import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueuePublisher, QUEUE_NAMES, MESSAGE_TYPES } from '@shared/queues';
import { DataExportJob } from '../entities/data-export-job.entity';
import { ExportJobPayload } from '../interfaces/export-payload.interface';

@Injectable()
export class ExportQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(ExportQueueService.name);
  private publisher: QueuePublisher | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  private createPublisher(): QueuePublisher {
    const url = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const user = this.configService.get<string>('RABBITMQ_USER');
    const password = this.configService.get<string>('RABBITMQ_PASSWORD');
    const vhost = this.configService.get<string>('RABBITMQ_VHOST');

    return new QueuePublisher({
      url,
      user,
      password,
      vhost,
    });
  }

  private async ensureConnected(): Promise<void> {
    if (!this.publisher) {
      this.publisher = this.createPublisher();
    }

    if (!this.isConnected) {
      await this.publisher.connect();
      this.isConnected = true;
      this.logger.log('Connected to RabbitMQ for export queue publishing');
    }
  }

  async enqueue(job: DataExportJob): Promise<void> {
    await this.enqueuePayload({
      jobId: job.id,
      resource: job.resource,
      format: job.format,
      filters: job.filters,
      columns: job.columns,
      options: job.options,
      requestedBy: job.requestedBy,
    });
  }

  async enqueuePayload(payload: ExportJobPayload): Promise<void> {
    await this.ensureConnected();

    await this.publisher!.publish(QUEUE_NAMES.EXPORT, {
      type: MESSAGE_TYPES.EXPORT_GENERATE,
      payload,
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.publisher && this.isConnected) {
      await this.publisher.disconnect();
      this.isConnected = false;
    }
  }
}
