import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { RabbitMQService, QueueMessage } from './rabbitmq.service';
import * as amqp from 'amqplib';

export interface MessageHandler<T = unknown> {
  handle(message: QueueMessage<T>): Promise<void>;
}

export interface QueueConfig {
  queueName: string;
  handlerToken: string;
  enabled?: boolean;
}

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);
  private handlers: Map<string, MessageHandler> = new Map();
  private queueConfigs: QueueConfig[] = [];

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef
  ) {}

  async onModuleInit(): Promise<void> {
    // Initialize queue configs from config
    this.initializeQueueConfigs();
  }

  private initializeQueueConfigs(): void {
    const queues = this.configService.get<Record<string, string>>('rabbitmq.queues') || {};
    
    // Initialize default queue configs
    this.queueConfigs = Object.entries(queues).map(([key, queueName]) => ({
      queueName,
      handlerToken: `${key.toUpperCase()}_HANDLER`,
      enabled: true,
    }));
  }

  registerHandler(queueName: string, handler: MessageHandler): void {
    this.handlers.set(queueName, handler);
    this.logger.log(`Registered handler for queue: ${queueName}`);
  }

  async startConsuming(): Promise<void> {
    // Wait a bit for RabbitMQ connection to be fully established
    await new Promise((resolve) => setTimeout(resolve, 1000));

    for (const config of this.queueConfigs) {
      if (config.enabled !== false) {
        await this.consumeQueue(config.queueName);
      }
    }
  }

  private async consumeQueue(queueName: string): Promise<void> {
    const handler = this.handlers.get(queueName);
    
    if (!handler) {
      this.logger.warn(`No handler registered for queue: ${queueName}`);
      return;
    }

    try {
      await this.rabbitMQService.consume(queueName, async (msg) => {
        if (!msg) return;

        const startTime = Date.now();
        const message = this.rabbitMQService.parseMessage(msg);
        
        this.logger.log(`Processing message ${message.id} from ${queueName} (type: ${message.type})`);

        try {
          await handler.handle(message);
          
          const duration = Date.now() - startTime;
          this.logger.log(`Successfully processed message ${message.id} in ${duration}ms`);
        } catch (error) {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Failed to process message ${message.id} after ${duration}ms`,
            error instanceof Error ? error.stack : error
          );
          throw error; // Re-throw to trigger nack
        }
      });

      this.logger.log(`Started consuming from queue: ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to start consuming from queue: ${queueName}`, error);
    }
  }

  async stopConsuming(): Promise<void> {
    this.logger.log('Stopping all consumers...');
    // Channel close will automatically cancel all consumers
  }
}
