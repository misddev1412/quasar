import { Injectable, Logger } from '@nestjs/common';
import { BaseProcessor } from './base.processor';
import { QueueMessage } from '../queues';
import { WorkerEmailService, EmailPayload } from '@backend/modules/worker-services';

@Injectable()
export class EmailProcessor extends BaseProcessor<EmailPayload> {
  protected readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly workerEmailService: WorkerEmailService,
  ) {
    super();
  }

  async handle(message: QueueMessage<EmailPayload>): Promise<void> {
    const startTime = Date.now();
    this.logStart(message);

    try {
      const { payload } = message;
      
      // Validate payload
      if (!payload.to || !payload.subject) {
        throw new Error('Invalid email payload: missing required fields (to, subject)');
      }

      this.logger.log(`Sending email to: ${payload.to}`);
      this.logger.log(`Subject: ${payload.subject}`);

      // Use WorkerEmailService from backend to send email
      const result = await this.retry(async () => {
        return await this.workerEmailService.sendEmail(payload);
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      this.logger.log(`Email sent successfully to: ${payload.to} via provider: ${result.provider}`);
      this.logComplete(message, Date.now() - startTime);
    } catch (error) {
      this.logError(message, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
