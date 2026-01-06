import { Global, Module, forwardRef } from '@nestjs/common';
import { DataExportModule } from './data-export.module';
import { WorkerExportService } from './services/worker-export.service';
import { ExportJobRunnerService } from './services/export-job-runner.service';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [
    DataExportModule,
    StorageModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [WorkerExportService, ExportJobRunnerService],
  exports: [WorkerExportService, ExportJobRunnerService],
})
export class ExportProcessingModule {}
