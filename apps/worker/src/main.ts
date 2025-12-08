/**
 * Worker Service - RabbitMQ Message Consumer
 * 
 * This service handles background jobs by consuming messages from RabbitMQ queues.
 * It processes emails, notifications, orders, and reports asynchronously.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app/app.module';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('Worker');
  
  logger.log('Starting Worker Service...');
  
  const app = await NestFactory.createApplicationContext(AppModule);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Handle process signals
  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM signal. Gracefully shutting down...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('Received SIGINT signal. Gracefully shutting down...');
    await app.close();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  });

  logger.log('🚀 Worker Service is running and consuming messages');
}

bootstrap().catch((error) => {
  console.error('Failed to start Worker Service:', error);
  process.exit(1);
});
