import { Logger } from '@nestjs/common';
import { MessageHandler, QueueMessage } from '../queues';

export abstract class BaseProcessor<T = unknown> implements MessageHandler<T> {
  protected abstract readonly logger: Logger;

  abstract handle(message: QueueMessage<T>): Promise<void>;

  protected async retry<R>(
    fn: () => Promise<R>,
    maxRetries = 3,
    delay = 1000
  ): Promise<R> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`
        );

        if (attempt < maxRetries) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected logStart(message: QueueMessage<T>): void {
    this.logger.log(
      `Starting to process message: ${message.id} (type: ${message.type})`
    );
  }

  protected logComplete(message: QueueMessage<T>, duration: number): void {
    this.logger.log(
      `Completed processing message: ${message.id} in ${duration}ms`
    );
  }

  protected logError(message: QueueMessage<T>, error: Error): void {
    this.logger.error(
      `Failed to process message: ${message.id} - ${error.message}`,
      error.stack
    );
  }
}
