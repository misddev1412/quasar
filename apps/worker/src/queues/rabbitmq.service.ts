import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
  retryCount?: number;
  maxRetries?: number;
}

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async connect(): Promise<void> {
    try {
      const url = this.configService.get<string>('rabbitmq.url');
      const user = this.configService.get<string>('rabbitmq.user');
      const password = this.configService.get<string>('rabbitmq.password');
      const vhost = this.configService.get<string>('rabbitmq.vhost');

      // Build connection URL with credentials
      const connectionUrl = url?.replace(
        'amqp://',
        `amqp://${user}:${password}@`
      ) + (vhost ? vhost : '');

      this.connection = await amqp.connect(connectionUrl || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();

      // Set prefetch count for fair dispatch
      const prefetchCount = this.configService.get<number>('rabbitmq.prefetchCount') || 10;
      await this.channel.prefetch(prefetchCount);

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
        this.isConnected = false;
        this.reconnect();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.isConnected = false;
        this.reconnect();
      });

      this.isConnected = true;
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  private async reconnect(): Promise<void> {
    if (!this.isConnected) {
      this.logger.log('Attempting to reconnect to RabbitMQ...');
      await this.connect();
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.isConnected = false;
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  getChannel(): amqp.Channel | null {
    return this.channel;
  }

  isChannelConnected(): boolean {
    return this.isConnected && this.channel !== null;
  }

  async assertQueue(queueName: string, options?: amqp.Options.AssertQueue): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.assertQueue(queueName, {
      durable: true,
      ...options,
    });
  }

  async assertExchange(
    exchangeName: string,
    type: 'direct' | 'topic' | 'fanout' | 'headers' = 'direct',
    options?: amqp.Options.AssertExchange
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.assertExchange(exchangeName, type, {
      durable: true,
      ...options,
    });
  }

  async bindQueue(queueName: string, exchangeName: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.bindQueue(queueName, exchangeName, routingKey);
  }

  async publish<T>(
    queueName: string,
    message: QueueMessage<T>,
    options?: amqp.Options.Publish
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    return this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        ...options,
      }
    );
  }

  async publishToExchange<T>(
    exchangeName: string,
    routingKey: string,
    message: QueueMessage<T>,
    options?: amqp.Options.Publish
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    return this.channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        ...options,
      }
    );
  }

  async consume(
    queueName: string,
    callback: (msg: amqp.ConsumeMessage | null) => Promise<void>,
    options?: amqp.Options.Consume
  ): Promise<amqp.Replies.Consume> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await this.assertQueue(queueName);

    return this.channel.consume(
      queueName,
      async (msg) => {
        if (msg) {
          try {
            await callback(msg);
            this.channel?.ack(msg);
          } catch (error) {
            this.logger.error(`Error processing message from ${queueName}`, error);
            // Reject and requeue if processing fails
            this.channel?.nack(msg, false, true);
          }
        }
      },
      {
        noAck: false,
        ...options,
      }
    );
  }

  ack(message: amqp.ConsumeMessage): void {
    this.channel?.ack(message);
  }

  nack(message: amqp.ConsumeMessage, requeue = true): void {
    this.channel?.nack(message, false, requeue);
  }

  parseMessage<T>(msg: amqp.ConsumeMessage): QueueMessage<T> {
    const content = msg.content.toString();
    return JSON.parse(content) as QueueMessage<T>;
  }
}
