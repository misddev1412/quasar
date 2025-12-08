import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';

@Entity('product_tags')
export class ProductTag extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  slug?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  color?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  // Relations
  @ManyToMany(() => Product, (product) => product.tags)
  products?: Product[];

  // Virtual properties
  get productCount(): number {
    return this.products?.length || 0;
  }
}