import { Injectable, Logger } from '@nestjs/common';
import { BaseProcessor } from './base.processor';
import { QueueMessage } from '../queues';
import { WorkerReportService, ReportPayload } from '@backend/modules/worker-services';

@Injectable()
export class ReportProcessor extends BaseProcessor<ReportPayload> {
  protected readonly logger = new Logger(ReportProcessor.name);

  constructor(
    private readonly workerReportService: WorkerReportService,
  ) {
    super();
  }

  async handle(message: QueueMessage<ReportPayload>): Promise<void> {
    const startTime = Date.now();
    this.logStart(message);

    try {
      const { payload } = message;
      
      // Validate payload
      if (!payload.reportId || !payload.type || !payload.userId) {
        throw new Error('Invalid report payload: missing required fields');
      }

      this.logger.log(`Generating ${payload.type} report: ${payload.reportId}`);

      // Use WorkerReportService from backend to generate report
      const result = await this.workerReportService.generateReport(payload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      this.logger.log(
        `Report ${payload.reportId} generated successfully. ` +
        `Format: ${result.format}, ` +
        `Delivery: ${result.deliveryMethod}${result.deliveredTo ? ` to ${result.deliveredTo}` : ''}`
      );

      this.logComplete(message, Date.now() - startTime);
    } catch (error) {
      this.logError(message, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
