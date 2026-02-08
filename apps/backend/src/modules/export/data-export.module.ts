import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataExportJob } from '@backend/modules/export/entities/data-export-job.entity';
import { DataExportService } from '@backend/modules/export/services/data-export.service';
import { ExportQueueService } from '@backend/modules/export/services/export-queue.service';
import { ExportHandlerRegistry } from '@backend/modules/export/services/export-handler.registry';

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
