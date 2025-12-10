/**
 * Queue Publisher Service
 * 
 * Use this service in backend to publish messages to RabbitMQ queues
 * The worker service will consume and process these messages
 */

import * as amqp from 'amqplib';

export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
  retryCount?: number;
  maxRetries?: number;
}

export interface QueuePublisherConfig {
  url: string;
  user?: string;
  password?: string;
  vhost?: string;
}

export class QueuePublisher {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private config: QueuePublisherConfig;

  constructor(config: QueuePublisherConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    const { url, user, password, vhost } = this.config;
    
    let connectionUrl = url;
    if (user && password) {
      connectionUrl = url.replace('amqp://', `amqp://${user}:${password}@`);
    }
    if (vhost && vhost !== '/') {
      connectionUrl += vhost;
    }

    const connection = await amqp.connect(connectionUrl);

    this.connection = connection;
    this.channel = await connection.createChannel();
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async publish<T>(
    queueName: string,
    message: Omit<QueueMessage<T>, 'id' | 'timestamp'>
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    await this.channel.assertQueue(queueName, { durable: true });

    const fullMessage: QueueMessage<T> = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
    };

    return this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(fullMessage)),
      { persistent: true }
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Queue names constants
export const QUEUE_NAMES = {
  EMAIL: 'email_queue',
  NOTIFICATION: 'notification_queue',
  ORDER: 'order_queue',
  REPORT: 'report_queue',
} as const;

// Message types
export const MESSAGE_TYPES = {
  // Email types
  EMAIL_SEND: 'email:send',
  EMAIL_BULK: 'email:bulk',
  EMAIL_TEMPLATE: 'email:template',

  // Notification types
  NOTIFICATION_PUSH: 'notification:push',
  NOTIFICATION_SMS: 'notification:sms',
  NOTIFICATION_IN_APP: 'notification:in_app',

  // Order types
  ORDER_CREATED: 'order:created',
  ORDER_CONFIRMED: 'order:confirmed',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_REFUNDED: 'order:refunded',

  // Report types
  REPORT_SALES: 'report:sales',
  REPORT_INVENTORY: 'report:inventory',
  REPORT_USERS: 'report:users',
  REPORT_ANALYTICS: 'report:analytics',
} as const;
