import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, rabbitmqConfig } from '../config';
import { RabbitMQModule } from '../queues';
import { ProcessorsModule } from '../processors/processors.module';
import { AppService } from './app.service';

// Import WorkerServicesModule from backend
import { WorkerServicesModule } from '@backend/modules/worker-services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, rabbitmqConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadEntities: true,
      }),
    }),
    RabbitMQModule,
    WorkerServicesModule,
    ProcessorsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
