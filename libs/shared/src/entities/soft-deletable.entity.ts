import { Column, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class SoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn({ 
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true 
  })
  deletedAt?: Date;

  @Column({ 
    name: 'deleted_by',
    type: 'varchar',
    nullable: true 
  })
  deletedBy?: string;

  // Check if entity is soft deleted
  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // Soft delete the entity
  softDelete(deletedBy?: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  // Restore soft deleted entity
  restore(): void {
    this.deletedAt = null;
    this.deletedBy = null;
  }

  // Get deletion age in milliseconds
  getDeletionAge(): number | null {
    if (!this.deletedAt) return null;
    return Date.now() - this.deletedAt.getTime();
  }
} 