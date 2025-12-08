import { Injectable, Logger } from '@nestjs/common';
import { BaseProcessor } from './base.processor';
import { QueueMessage } from '../queues';
import { WorkerOrderService, OrderPayload } from '@backend/modules/worker-services';

@Injectable()
export class OrderProcessor extends BaseProcessor<OrderPayload> {
  protected readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private readonly workerOrderService: WorkerOrderService,
  ) {
    super();
  }

  async handle(message: QueueMessage<OrderPayload>): Promise<void> {
    const startTime = Date.now();
    this.logStart(message);

    try {
      const { payload } = message;
      
      // Validate payload
      if (!payload.orderId || !payload.action || !payload.userId) {
        throw new Error('Invalid order payload: missing required fields');
      }

      this.logger.log(`Processing order ${payload.orderId} - Action: ${payload.action}`);

      // Use WorkerOrderService from backend to process order
      const result = await this.workerOrderService.processOrder(payload);

      if (!result.success) {
        throw new Error(result.error || `Failed to process order ${payload.action}`);
      }

      this.logger.log(
        `Order ${payload.orderId} processed successfully. ` +
        `Notification: ${result.notificationSent ? 'sent' : 'skipped'}, ` +
        `Email: ${result.emailSent ? 'sent' : 'skipped'}`
      );

      this.logComplete(message, Date.now() - startTime);
    } catch (error) {
      this.logError(message, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
