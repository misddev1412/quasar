import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @VersionColumn({
    name: 'version',
    default: 1,
  })
  version: number;

  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string;

  @Column({
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  updatedBy?: string;

  // Lifecycle hooks
  @BeforeInsert()
  setCreatedAt() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  // Helper methods
  isNew(): boolean {
    return !this.id;
  }

  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  wasRecentlyCreated(minutes: number = 5): boolean {
    const ageInMinutes = this.getAge() / (1000 * 60);
    return ageInMinutes <= minutes;
  }

  wasRecentlyUpdated(minutes: number = 5): boolean {
    const ageInMinutes = (Date.now() - this.updatedAt.getTime()) / (1000 * 60);
    return ageInMinutes <= minutes;
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };
  }
}

export abstract class SoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @Column({
    name: 'deleted_by',
    type: 'uuid',
    nullable: true,
  })
  deletedBy?: string;

  // Soft delete methods
  softDelete(deletedBy?: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  restore(): void {
    this.deletedAt = undefined;
    this.deletedBy = undefined;
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  isActive(): boolean {
    return !this.isDeleted();
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
    };
  }
} 