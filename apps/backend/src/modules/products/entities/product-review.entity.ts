import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { Customer } from './customer.entity';

export enum ProductReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('product_reviews')
@Index(['productId', 'status'])
export class ProductReview extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    name: 'customer_id',
    type: 'uuid',
    nullable: true,
  })
  customerId?: string | null;

  @Expose()
  @Column({
    name: 'user_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  userName?: string | null;

  @Expose()
  @Column({
    name: 'user_avatar',
    type: 'text',
    nullable: true,
  })
  userAvatar?: string | null;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
  })
  rating: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string | null;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  comment?: string | null;

  @Expose()
  @Column({
    name: 'verified_purchase',
    type: 'boolean',
    default: false,
  })
  verifiedPurchase: boolean;

  @Expose()
  @Column({
    name: 'helpful_count',
    type: 'int',
    default: 0,
  })
  helpfulCount: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: ProductReviewStatus,
    default: ProductReviewStatus.PENDING,
  })
  status: ProductReviewStatus;

  @ManyToOne(() => Product, product => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Customer, customer => customer.productReviews, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;
}
