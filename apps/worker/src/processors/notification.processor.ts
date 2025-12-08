import { Injectable, Logger } from '@nestjs/common';
import { BaseProcessor } from './base.processor';
import { QueueMessage } from '../queues';
import { WorkerNotificationService, NotificationPayload } from '@backend/modules/worker-services';

@Injectable()
export class NotificationProcessor extends BaseProcessor<NotificationPayload> {
  protected readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly workerNotificationService: WorkerNotificationService,
  ) {
    super();
  }

  async handle(message: QueueMessage<NotificationPayload>): Promise<void> {
    const startTime = Date.now();
    this.logStart(message);

    try {
      const { payload } = message;
      
      // Validate payload
      if (!payload.userId || !payload.title || !payload.message) {
        throw new Error('Invalid notification payload: missing required fields');
      }

      const channels = payload.channels || ['in_app'];
      
      this.logger.log(`Processing notification for user: ${payload.userId}`);
      this.logger.log(`Channels: ${channels.join(', ')}`);

      // Use WorkerNotificationService from backend
      const result = await this.workerNotificationService.sendNotification(payload);

      if (!result.success) {
        // Log failed channels
        Object.entries(result.channels).forEach(([channel, channelResult]) => {
          if (channelResult && !channelResult.success) {
            this.logger.warn(`Channel ${channel} failed: ${channelResult.error}`);
          }
        });
      }

      this.logger.log(`Notification processed for user: ${payload.userId}, success: ${result.success}`);
      this.logComplete(message, Date.now() - startTime);
    } catch (error) {
      this.logError(message, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
