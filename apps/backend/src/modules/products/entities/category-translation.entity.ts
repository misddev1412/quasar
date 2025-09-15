import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Category } from './category.entity';

@Entity('category_translations')
@Index(['category_id', 'locale'], { unique: true })
@Index(['locale'])
@Index(['category_id'])
export class CategoryTranslation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  category_id: string;

  @Column({ length: 5 })
  locale: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  slug?: string;

  @Column({ name: 'seo_title', length: 255, nullable: true })
  seoTitle?: string;

  @Column({ name: 'seo_description', type: 'text', nullable: true })
  seoDescription?: string;

  @Column({ name: 'meta_keywords', type: 'text', nullable: true })
  metaKeywords?: string;

  // Relations
  @ManyToOne(() => Category, (category) => category.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}