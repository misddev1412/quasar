import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity('product_media')
export class ProductMedia extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  type: MediaType;

  @Expose()
  @Column({
    type: 'text',
  })
  url: string;

  @Expose()
  @Column({
    name: 'alt_text',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  altText?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  caption?: string;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  @Expose()
  @Column({
    name: 'file_size',
    type: 'bigint',
    nullable: true,
  })
  fileSize?: number;

  @Expose()
  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mimeType?: string;

  @Expose()
  @Column({
    type: 'int',
    nullable: true,
  })
  width?: number;

  @Expose()
  @Column({
    type: 'int',
    nullable: true,
  })
  height?: number;

  @Expose()
  @Column({
    type: 'int',
    nullable: true,
    comment: 'Duration in seconds for videos/audio',
  })
  duration?: number;

  @Expose()
  @Column({
    name: 'thumbnail_url',
    type: 'text',
    nullable: true,
  })
  thumbnailUrl?: string;

  @Expose()
  @Column({
    name: 'is_primary',
    type: 'boolean',
    default: false,
  })
  isPrimary: boolean;

  // Relations
  @ManyToOne(() => Product, (product) => product.media, { lazy: true })
  @JoinColumn({ name: 'product_id' })
  product: Promise<Product>;

  // Helper methods
  get isImage(): boolean {
    return this.type === MediaType.IMAGE;
  }

  get isVideo(): boolean {
    return this.type === MediaType.VIDEO;
  }

  get isAudio(): boolean {
    return this.type === MediaType.AUDIO;
  }

  get isDocument(): boolean {
    return this.type === MediaType.DOCUMENT;
  }

  get displayName(): string {
    return this.altText || this.caption || `${this.type} file`;
  }

  get aspectRatio(): number | null {
    if (this.width && this.height) {
      return this.width / this.height;
    }
    return null;
  }

  get fileSizeFormatted(): string | null {
    if (!this.fileSize) return null;

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  get durationFormatted(): string | null {
    if (!this.duration) return null;

    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}