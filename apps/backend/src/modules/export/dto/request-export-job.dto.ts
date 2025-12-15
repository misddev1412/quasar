import { ExportColumnDefinition, ExportFormat, ExportJobOptions } from '../entities/data-export-job.entity';

export interface RequestExportJobDto {
  resource: string;
  format?: ExportFormat;
  filters?: Record<string, any>;
  columns?: ExportColumnDefinition[];
  options?: ExportJobOptions;
  requestedBy?: string;
  context?: Record<string, any>;
}

export interface ExportJobSummary {
  id: string;
  resource: string;
  status: string;
  fileUrl?: string | null;
  fileName?: string | null;
  totalRecords?: number | null;
  createdAt: Date;
  completedAt?: Date | null;
  format: ExportFormat;
}
