import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataExportJob } from './entities/data-export-job.entity';
import { DataExportService } from './services/data-export.service';
import { ExportQueueService } from './services/export-queue.service';
import { ExportHandlerRegistry } from './services/export-handler.registry';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DataExportJob]),
  ],
  providers: [
    DataExportService,
    ExportQueueService,
    ExportHandlerRegistry,
  ],
  exports: [
    DataExportService,
    ExportQueueService,
    ExportHandlerRegistry,
    TypeOrmModule,
  ],
})
export class DataExportModule {}
