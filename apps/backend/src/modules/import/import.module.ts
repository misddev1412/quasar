
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { DataImportJob } from './entities/data-import-job.entity';
import { ImportJobService } from './services/import-job.service';
import { AdminImportController } from './controllers/admin-import.controller';
import { AdminImportRouter } from './routers/admin-import.router';

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
