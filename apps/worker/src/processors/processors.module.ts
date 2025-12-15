import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConsumer } from '../queues';
import { EmailProcessor } from './email.processor';
import { NotificationProcessor } from './notification.processor';
import { OrderProcessor } from './order.processor';
import { ReportProcessor } from './report.processor';
import { ExportProcessor } from './export.processor';

@Module({
  providers: [
    EmailProcessor,
    NotificationProcessor,
    OrderProcessor,
    ReportProcessor,
    ExportProcessor,
  ],
  exports: [
    EmailProcessor,
    NotificationProcessor,
    OrderProcessor,
    ReportProcessor,
    ExportProcessor,
  ],
})
export class ProcessorsModule implements OnModuleInit {
  private readonly logger = new Logger(ProcessorsModule.name);

  constructor(
    private readonly consumer: RabbitMQConsumer,
    private readonly configService: ConfigService,
    private readonly emailProcessor: EmailProcessor,
    private readonly notificationProcessor: NotificationProcessor,
    private readonly orderProcessor: OrderProcessor,
    private readonly reportProcessor: ReportProcessor,
    private readonly exportProcessor: ExportProcessor,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Registering message processors...');

    const queues = this.configService.get<Record<string, string>>('rabbitmq.queues');

    // Register processors for each queue
    if (queues?.email) {
      this.consumer.registerHandler(queues.email, this.emailProcessor);
      this.logger.log(`Registered EmailProcessor for queue: ${queues.email}`);
    }

    if (queues?.notification) {
      this.consumer.registerHandler(queues.notification, this.notificationProcessor);
      this.logger.log(`Registered NotificationProcessor for queue: ${queues.notification}`);
    }

    if (queues?.order) {
      this.consumer.registerHandler(queues.order, this.orderProcessor);
      this.logger.log(`Registered OrderProcessor for queue: ${queues.order}`);
    }

    if (queues?.report) {
      this.consumer.registerHandler(queues.report, this.reportProcessor);
      this.logger.log(`Registered ReportProcessor for queue: ${queues.report}`);
    }

    if (queues?.export) {
      this.consumer.registerHandler(queues.export, this.exportProcessor);
      this.logger.log(`Registered ExportProcessor for queue: ${queues.export}`);
    }

    // Start consuming messages
    await this.consumer.startConsuming();
    this.logger.log('All processors registered and consuming started');
  }
}
