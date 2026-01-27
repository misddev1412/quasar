
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataImportJob, ImportJobStatus } from '../entities/data-import-job.entity';

@Injectable()
export class ImportJobService {
    constructor(
        @InjectRepository(DataImportJob)
        private readonly importJobRepository: Repository<DataImportJob>,
    ) { }

    async createJob(resource: string, fileName?: string, createdBy?: string): Promise<DataImportJob> {
        const job = this.importJobRepository.create({
            resource,
            fileName,
            createdBy,
            status: ImportJobStatus.PENDING,
            progress: 0,
            totalItems: 0,
            processedItems: 0,
            failedItems: 0,
        });
        return this.importJobRepository.save(job);
    }

    async updateProgress(
        id: string,
        progress: number,
        processedItems: number,
        failedItems: number,
        totalItems?: number
    ): Promise<void> {
        const updates: Partial<DataImportJob> = {
            progress: Math.min(100, Math.max(0, progress)),
            processedItems,
            failedItems,
            status: ImportJobStatus.PROCESSING,
        };

        if (totalItems !== undefined) {
            updates.totalItems = totalItems;
        }

        await this.importJobRepository.update(id, updates);
    }

    async completeJob(id: string, result: any): Promise<void> {
        await this.importJobRepository.update(id, {
            status: ImportJobStatus.COMPLETED,
            progress: 100,
            result,
        });
    }

    async failJob(id: string, error: string): Promise<void> {
        await this.importJobRepository.update(id, {
            status: ImportJobStatus.FAILED,
            result: { error } as any,
        });
    }

    async getJob(id: string): Promise<DataImportJob> {
        const job = await this.importJobRepository.findOne({ where: { id } });
        if (!job) {
            throw new NotFoundException(`Import job ${id} not found`);
        }
        return job;
    }
}
