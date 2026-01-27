
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ImportJobStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('data_import_jobs')
export class DataImportJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    resource: string; // e.g., 'products', 'users'

    @Column({
        type: 'enum',
        enum: ImportJobStatus,
        default: ImportJobStatus.PENDING,
    })
    status: ImportJobStatus;

    @Column({ type: 'int', default: 0 })
    progress: number; // 0-100

    @Column({ name: 'total_items', type: 'int', default: 0 })
    totalItems: number;

    @Column({ name: 'processed_items', type: 'int', default: 0 })
    processedItems: number;

    @Column({ name: 'failed_items', type: 'int', default: 0 })
    failedItems: number;

    @Column({ type: 'jsonb', nullable: true })
    result: any; // JSON summary of results (errors, specific success details)

    @Column({ name: 'file_name', type: 'varchar', nullable: true })
    fileName: string;

    @Column({ name: 'created_by', type: 'varchar', nullable: true })
    createdBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
