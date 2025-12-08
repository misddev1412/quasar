import { Module, Global, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQConsumer } from './rabbitmq.consumer';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService, RabbitMQConsumer],
  exports: [RabbitMQService, RabbitMQConsumer],
})
export class RabbitMQModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQModule.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    this.logger.log('Initializing RabbitMQ connection...');
    await this.rabbitMQService.connect();
    this.logger.log('RabbitMQ connection established');
  }

  async onModuleDestroy() {
    this.logger.log('Closing RabbitMQ connection...');
    await this.rabbitMQService.disconnect();
    this.logger.log('RabbitMQ connection closed');
  }
}
