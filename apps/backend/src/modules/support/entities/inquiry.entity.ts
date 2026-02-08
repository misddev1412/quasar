import { Entity, Column, Index } from 'typeorm';
import { BaseEntity, SoftDeletableEntity } from '@shared';
import { Expose } from 'class-transformer';

export enum InquiryStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    REJECTED = 'REJECTED',
    SPAM = 'SPAM',
}

@Entity('inquiries')
export class Inquiry extends SoftDeletableEntity {
    @Expose()
    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Expose()
    @Column({ type: 'varchar', length: 255, nullable: false })
    @Index()
    email: string;

    @Expose()
    @Column({ type: 'varchar', length: 50, nullable: false })
    @Index()
    phone: string;

    @Expose()
    @Column({ type: 'text', nullable: true })
    message?: string;

    @Expose()
    @Column({ type: 'varchar', length: 255, nullable: true })
    subject?: string;

    @Expose()
    @Column({ name: 'product_id', type: 'uuid', nullable: true })
    @Index()
    productId?: string;

    @Expose()
    @Column({ name: 'service_id', type: 'uuid', nullable: true })
    @Index()
    serviceId?: string;

    @Expose()
    @Column({ type: 'varchar', length: 500, nullable: true })
    url?: string;

    @Expose()
    @Column({
        type: 'enum',
        enum: InquiryStatus,
        default: InquiryStatus.PENDING,
    })
    @Index()
    status: InquiryStatus;

    @Expose()
    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;
}
