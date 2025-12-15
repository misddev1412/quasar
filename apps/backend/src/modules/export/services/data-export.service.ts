import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { DataExportJob, DataExportJobStatus } from '../entities/data-export-job.entity';
import { RequestExportJobDto, ExportJobSummary } from '../dto/request-export-job.dto';

@Injectable()
export class DataExportService {
  private readonly logger = new Logger(DataExportService.name);

  constructor(
    @InjectRepository(DataExportJob)
    private readonly exportRepository: Repository<DataExportJob>,
  ) {}

  /**
   * Create a new export job and enqueue it for processing
   */
  async requestExportJob(input: RequestExportJobDto): Promise<DataExportJob> {
    const job = this.exportRepository.create({
      resource: input.resource,
      format: input.format || 'csv',
      filters: input.filters || null,
      columns: input.columns || null,
      options: input.options || null,
      requestedBy: input.requestedBy || null,
      status: DataExportJobStatus.PENDING,
    });

    const saved = await this.exportRepository.save(job);
    this.logger.log(`Queued export job ${saved.id} (${saved.resource}) as PENDING`);
    return saved;
  }

  async getJob(jobId: string): Promise<DataExportJob | null> {
    return this.exportRepository.findOne({ where: { id: jobId } });
  }

  async listJobs(
    resource: string,
    options: { limit?: number; page?: number; requestedBy?: string } = {}
  ): Promise<{
    items: ExportJobSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const page = Math.max(options.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<DataExportJob> = { resource };
    if (options.requestedBy) {
      where.requestedBy = options.requestedBy;
    }

    const [jobs, total] = await this.exportRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    const items: ExportJobSummary[] = jobs.map(job => ({
      id: job.id,
      resource: job.resource,
      status: job.status,
      fileUrl: job.fileUrl,
      fileName: job.fileName,
      totalRecords: job.totalRecords,
      createdAt: job.createdAt,
      completedAt: job.completedAt ?? null,
      format: job.format,
    }));

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async markProcessing(jobId: string): Promise<void> {
    await this.exportRepository.update(jobId, {
      status: DataExportJobStatus.PROCESSING,
      error: null,
    });
  }

  async markCompleted(
    jobId: string,
    payload: {
      totalRecords: number;
      fileUrl: string;
      fileName: string;
      fileSize?: number;
      storageProvider?: string;
    }
  ): Promise<void> {
    await this.exportRepository.update(jobId, {
      status: DataExportJobStatus.COMPLETED,
      totalRecords: payload.totalRecords,
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize ?? null,
      storageProvider: payload.storageProvider ?? null,
      completedAt: new Date(),
    });
  }

  async markFailed(jobId: string, error: string): Promise<void> {
    await this.exportRepository.update(jobId, {
      status: DataExportJobStatus.FAILED,
      error,
      completedAt: new Date(),
    });
  }
}
