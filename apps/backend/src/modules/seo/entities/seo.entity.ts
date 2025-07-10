import { Column, Entity, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';

@Entity('seo')
export class SEOEntity extends SoftDeletableEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  keywords: string;

  @Index('IDX_SEO_PATH', { unique: true })
  @Column({ length: 255 })
  path: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'json', nullable: true })
  additionalMetaTags: Record<string, string>;

  isActive(): boolean {
    return this.active && !this.isDeleted();
  }
} 