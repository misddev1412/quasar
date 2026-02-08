import { Global, Module, forwardRef } from '@nestjs/common';
import { DataExportModule } from '@backend/modules/export/data-export.module';
import { WorkerExportService } from '@backend/modules/export/services/worker-export.service';
import { ExportJobRunnerService } from '@backend/modules/export/services/export-job-runner.service';
import { StorageModule } from '@backend/modules/storage/storage.module';
import { NotificationsModule } from '@backend/modules/notifications/notifications.module';

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
