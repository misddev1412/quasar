import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Brand } from './brand.entity';

@Entity('brand_translations')
@Index(['brand_id', 'locale'], { unique: true })
@Index(['locale'])
@Index(['brand_id'])
export class BrandTranslation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  brand_id: string;

  @Column({ length: 5 })
  locale: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Relations
  @ManyToOne(() => Brand, (brand) => brand.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;
}