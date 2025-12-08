import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  onApplicationBootstrap(): void {
    this.logger.log('Worker application started successfully');
    this.logger.log('Listening for messages on configured queues...');
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`Worker application shutting down (signal: ${signal})`);
  }

  getStatus(): { status: string; uptime: number } {
    return {
      status: 'running',
      uptime: process.uptime(),
    };
  }
}
