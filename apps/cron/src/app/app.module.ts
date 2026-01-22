import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { databaseConfig, rabbitmqConfig, cronConfig } from '../config';
import { AppService } from './app.service';
import { DataExportModule } from '@backend/modules/export/data-export.module';
import { ExportJobDispatcher } from '../jobs/export-job-dispatcher.service';
import { ProductStatsRecomputeJob } from '../jobs/product-stats-recompute.service';

const projectRoot = join(__dirname, '../../../../../..');
const cronEnvPath = join(projectRoot, 'apps/cron/.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: cronEnvPath,
      load: [databaseConfig, rabbitmqConfig, cronConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadEntities: true,
      }),
    }),
    DataExportModule,
  ],
  providers: [AppService, ExportJobDispatcher, ProductStatsRecomputeJob],
})
export class AppModule {}
