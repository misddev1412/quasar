import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Product } from './product.entity';

@Entity('product_translations')
@Index(['product_id', 'locale'], { unique: true })
@Index(['locale'])
@Index(['product_id'])
@Index(['locale', 'slug'], { unique: true, where: '"slug" IS NOT NULL' })
export class ProductTranslation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  product_id: string;

  @Column({ length: 5 })
  locale: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription?: string;

  @Column({ length: 255, nullable: true })
  slug?: string;

  @Column({ name: 'meta_title', length: 255, nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription?: string;

  @Column({ name: 'meta_keywords', type: 'text', nullable: true })
  metaKeywords?: string;

  @ManyToOne(() => Product, (product) => product.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
