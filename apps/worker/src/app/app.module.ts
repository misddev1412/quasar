import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { databaseConfig, rabbitmqConfig } from '../config';
import { RabbitMQModule } from '../queues';
import { ProcessorsModule } from '../processors/processors.module';
import { AppService } from './app.service';

// Import WorkerServicesModule from backend
import { WorkerServicesModule } from '@backend/modules/worker-services';

const projectRoot = join(__dirname, '../../../../../..');
const workerEnvPath = join(projectRoot, 'apps/worker/.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: workerEnvPath,
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
