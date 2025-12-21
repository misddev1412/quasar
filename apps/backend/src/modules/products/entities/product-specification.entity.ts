import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { ProductSpecificationLabel } from './product-specification-label.entity';

@Entity('product_specifications')
export class ProductSpecification extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId!: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Expose()
  @Column({
    type: 'text',
  })
  value!: string;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder!: number;

  @Expose()
  @Column({
    name: 'label_id',
    type: 'uuid',
    nullable: true,
  })
  labelId?: string;

  @ManyToOne(() => Product, (product) => product.specifications, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Promise<Product>;

  @ManyToOne(() => ProductSpecificationLabel, (label) => label.specifications, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'label_id' })
  label?: ProductSpecificationLabel | null;
}
