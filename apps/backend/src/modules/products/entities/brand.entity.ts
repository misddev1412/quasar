import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { BrandTranslation } from './brand-translation.entity';

@Entity('brands')
export class Brand extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  name: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  logo?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  website?: string;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  // Relations
  @OneToMany(() => Product, (product) => product.brand)
  products?: Product[];

  @OneToMany(() => BrandTranslation, (translation) => translation.brand, {
    cascade: true,
    eager: false,
  })
  translations: BrandTranslation[];

  // Virtual properties
  get productCount(): number {
    return this.products?.length || 0;
  }
}