import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkerExportService } from './worker-export.service';
import { ExportJobPayload } from '../interfaces/export-payload.interface';
import { ExportQueueService } from './export-queue.service';

export type ExportExecutionMode = 'direct' | 'queue' | 'local-async';

@Injectable()
export class ExportJobRunnerService {
  private readonly logger = new Logger(ExportJobRunnerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly workerExportService: WorkerExportService,
    private readonly exportQueueService: ExportQueueService
  ) { }

  async run(
    payload: ExportJobPayload,
    overrideMode?: ExportExecutionMode
  ): Promise<'processed' | 'queued'> {
    const mode = this.resolveMode(overrideMode);
    this.logger.debug(`Executing export job ${payload.jobId} using mode=${mode}`);

    if (mode === 'queue') {
      await this.exportQueueService.enqueuePayload(payload);
      return 'queued';
    }

    if (mode === 'local-async') {
      // Fire and forget - processing happens in background
      this.workerExportService.processExport(payload).catch((error) => {
        this.logger.error(`Background local-async export ${payload.jobId} failed`, error instanceof Error ? error.stack : error);
      });
      return 'queued'; // Return 'queued' so the frontend polls for status
    }

    // mode === 'direct'
    await this.workerExportService.processExport(payload);
    return 'processed';
  }

  private resolveMode(override?: ExportExecutionMode): ExportExecutionMode {
    if (override) {
      return override;
    }

    const configured = (this.configService.get<string>('EXPORT_PROCESSING_MODE') || '').toLowerCase();

    if (configured === 'queue') {
      return 'queue';
    }

    if (configured === 'local-async' || configured === 'async') {
      return 'local-async';
    }

    return 'direct';
  }
}
