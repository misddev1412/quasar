import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@shared';

export enum DataExportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type ExportFormat = 'csv' | 'json';

export interface ExportColumnDefinition {
  key: string;
  label: string;
  path?: string;
  formatter?: string;
}

export interface ExportJobOptions {
  pageSize?: number;
  fileName?: string;
  [key: string]: any;
}

@Entity('data_export_jobs')
@Index(['resource'])
@Index(['status'])
export class DataExportJob extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  resource!: string;

  @Column({ type: 'varchar', length: 50, default: 'csv' })
  format!: ExportFormat;

  @Column({
    type: 'enum',
    enum: DataExportJobStatus,
    default: DataExportJobStatus.PENDING,
  })
  status!: DataExportJobStatus;

  @Column({ type: 'jsonb', nullable: true })
  filters?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  columns?: ExportColumnDefinition[];

  @Column({ type: 'jsonb', nullable: true })
  options?: ExportJobOptions;

  @Column({ name: 'total_records', type: 'integer', nullable: true })
  totalRecords?: number | null;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl?: string | null;

  @Column({ name: 'file_name', type: 'text', nullable: true })
  fileName?: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number | null;

  @Column({ name: 'storage_provider', type: 'varchar', length: 20, nullable: true })
  storageProvider?: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy?: string | null;
}
