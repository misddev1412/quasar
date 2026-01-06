import { Injectable, Logger } from '@nestjs/common';
import { BaseProcessor } from './base.processor';
import { QueueMessage } from '../queues';
import { ExportPayload } from '@backend/modules/worker-services';
import { WorkerExportService } from '@backend/modules/export';

@Injectable()
export class ExportProcessor extends BaseProcessor<ExportPayload> {
  protected readonly logger = new Logger(ExportProcessor.name);

  constructor(private readonly workerExportService: WorkerExportService) {
    super();
  }

  async handle(message: QueueMessage<ExportPayload>): Promise<void> {
    const startTime = Date.now();
    this.logStart(message);

    try {
      if (!message.payload?.jobId || !message.payload?.resource) {
        throw new Error('Invalid export payload. jobId and resource are required.');
      }

      await this.workerExportService.processExport(message.payload);
      this.logComplete(message, Date.now() - startTime);
    } catch (error) {
      this.logError(
        message,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}
