
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { DataImportJob } from '@backend/modules/import/entities/data-import-job.entity';
import { ImportJobService } from '@backend/modules/import/services/import-job.service';
import { AdminImportController } from '@backend/modules/import/controllers/admin-import.controller';
import { AdminImportRouter } from '@backend/modules/import/routers/admin-import.router';

@Module({
    imports: [
        TypeOrmModule.forFeature([DataImportJob]),
        SharedModule,
    ],
    controllers: [AdminImportController],
    providers: [ImportJobService, AdminImportRouter],
    exports: [ImportJobService, AdminImportRouter],
})
export class ImportModule { }
