import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other'
}

@Entity('media')
@Index(['userId', 'type'])
@Index(['userId', 'createdAt'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'varchar', length: 100, default: 'general' })
  folder: string;

  @Column({ type: 'varchar', length: 50, default: 'local' })
  provider: string;

  @Column({ type: 'text', nullable: true })
  alt: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // User who uploaded the file (nullable for system uploads)
  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  @Index()
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get isImage(): boolean {
    return this.type === MediaType.IMAGE;
  }

  get isVideo(): boolean {
    return this.type === MediaType.VIDEO;
  }

  get sizeFormatted(): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let size = this.size;
    let sizeIndex = 0;
    
    while (size >= 1024 && sizeIndex < sizes.length - 1) {
      size /= 1024;
      sizeIndex++;
    }
    
    return `${size.toFixed(sizeIndex === 0 ? 0 : 1)} ${sizes[sizeIndex]}`;
  }
}