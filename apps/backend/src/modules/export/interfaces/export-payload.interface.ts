import {
  ExportColumnDefinition,
  ExportFormat,
  ExportJobOptions,
} from '../entities/data-export-job.entity';

export interface ExportJobPayload {
  jobId: string;
  resource: string;
  format: ExportFormat;
  filters?: Record<string, any>;
  columns?: ExportColumnDefinition[];
  options?: ExportJobOptions;
  requestedBy?: string;
}
