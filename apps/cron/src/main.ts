/**
 * Cron Service
 *
 * Hosts application-specific cron jobs (e.g. export dispatcher) outside of the main backend.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app/app.module';
import 'reflect-metadata';

async function bootstrap() {
  const logger = new Logger('CronService');
  logger.log('Starting Cron Service...');

  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  const gracefulShutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Gracefully shutting down Cron Service...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', error => {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Uncaught exception in Cron Service', err.stack);
  });

  process.on('unhandledRejection', reason => {
    logger.error(`Unhandled rejection in Cron Service: ${String(reason)}`);
  });

  logger.log('🚀 Cron Service is running');
}

bootstrap().catch(error => {
  console.error('Failed to start Cron Service:', error);
  process.exit(1);
});
