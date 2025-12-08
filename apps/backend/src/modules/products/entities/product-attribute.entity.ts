import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { Attribute } from './attribute.entity';

@Entity('product_attributes')
export class ProductAttribute extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    name: 'attribute_id',
    type: 'uuid',
  })
  attributeId: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
  })
  value: string;

  // Relations with lazy loading
  @ManyToOne(() => Product, (product) => product.productAttributes, { lazy: true })
  @JoinColumn({ name: 'product_id' })
  product: Promise<Product>;

  @ManyToOne(() => Attribute, (attribute) => attribute.productAttributes, { lazy: true })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Promise<Attribute>;
}