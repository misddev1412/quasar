import { 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  VersionColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  @VersionColumn({ 
    name: 'version',
    default: 1 
  })
  version: number;

  // Audit fields - optional, can be used when needed
  createdBy?: string;
  updatedBy?: string;

  @BeforeInsert()
  updateDateCreation() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedAt = new Date();
  }

  // Helper method to check if entity is new (not persisted yet)
  isNew(): boolean {
    return !this.id;
  }

  // Helper method to get entity age in milliseconds
  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  // Helper method to check if entity was recently created (within given minutes)
  isRecentlyCreated(minutes: number = 5): boolean {
    const ageInMinutes = this.getAge() / (1000 * 60);
    return ageInMinutes <= minutes;
  }

  // Helper method to check if entity was recently updated (within given minutes)
  isRecentlyUpdated(minutes: number = 5): boolean {
    const updateAgeInMinutes = (Date.now() - this.updatedAt.getTime()) / (1000 * 60);
    return updateAgeInMinutes <= minutes;
  }
} 