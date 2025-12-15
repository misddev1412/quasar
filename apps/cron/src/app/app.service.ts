import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  onApplicationBootstrap(): void {
    this.logger.log('Cron service bootstrapped');
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`Cron service shutting down (signal: ${signal ?? 'unknown'})`);
  }
}
