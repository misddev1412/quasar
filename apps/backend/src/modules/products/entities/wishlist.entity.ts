import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Customer } from './customer.entity';
import { Product } from './product.entity';

@Entity('wishlists')
@Index(['customerId', 'productId'], { unique: true })
export class Wishlist extends BaseEntity {
  @Expose()
  @Column({
    name: 'customer_id',
    type: 'uuid',
  })
  customerId: string;

  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Expose()
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    name: 'priority',
    type: 'int',
    default: 0,
  })
  priority: number;

  @Expose()
  @Column({
    name: 'notes',
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'is_public',
    type: 'boolean',
    default: false,
  })
  isPublic: boolean;

  @ManyToOne(() => Customer, customer => customer.wishlists, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => Product, product => product.wishlists, {
    onDelete: 'CASCADE',
  })
  product: Product;
}