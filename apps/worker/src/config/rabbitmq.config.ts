import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  user: process.env.RABBITMQ_USER || 'guest',
  password: process.env.RABBITMQ_PASSWORD || 'guest',
  vhost: process.env.RABBITMQ_VHOST || '/',
  prefetchCount: parseInt(process.env.WORKER_PREFETCH_COUNT || '10', 10),
  maxRetries: parseInt(process.env.WORKER_MAX_RETRIES || '5', 10),
  retryDelayMs: parseInt(process.env.WORKER_RETRY_DELAY_MS || '0', 10),
  queues: {
    email: process.env.QUEUE_EMAIL || 'email_queue',
    notification: process.env.QUEUE_NOTIFICATION || 'notification_queue',
    order: process.env.QUEUE_ORDER || 'order_queue',
    report: process.env.QUEUE_REPORT || 'report_queue',
    export: process.env.QUEUE_EXPORT || 'export_queue',
  },
}));
