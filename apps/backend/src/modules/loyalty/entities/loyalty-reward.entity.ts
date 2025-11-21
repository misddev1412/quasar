import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';

export enum RewardType {
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
  FREE_PRODUCT = 'free_product',
  CASHBACK = 'cashback',
  GIFT_CARD = 'gift_card',
  EXCLUSIVE_ACCESS = 'exclusive_access',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('loyalty_rewards')
export class LoyaltyReward extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
  })
  type: RewardType;

  @Expose()
  @Column({
    name: 'points_required',
    type: 'integer',
  })
  pointsRequired: number;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  value: number;

  @Expose()
  @Column({
    name: 'discount_type',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  discountType: DiscountType;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  conditions: string;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'is_limited',
    type: 'boolean',
    default: false,
  })
  isLimited: boolean;

  @Expose()
  @Column({
    name: 'total_quantity',
    type: 'integer',
    nullable: true,
  })
  totalQuantity: number;

  @Expose()
  @Column({
    name: 'remaining_quantity',
    type: 'integer',
    nullable: true,
  })
  remainingQuantity: number;

  @Expose()
  @Column({
    name: 'starts_at',
    type: 'timestamp',
    nullable: true,
  })
  startsAt: Date;

  @Expose()
  @Column({
    name: 'ends_at',
    type: 'timestamp',
    nullable: true,
  })
  endsAt: Date;

  @Expose()
  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imageUrl: string;

  @Expose()
  @Column({
    name: 'terms_conditions',
    type: 'text',
    nullable: true,
  })
  termsConditions: string;

  @Expose()
  @Column({
    name: 'tier_restrictions',
    type: 'jsonb',
    default: () => "'[]'",
  })
  tierRestrictions: string[];

  @Expose()
  @Column({
    name: 'auto_apply',
    type: 'boolean',
    default: false,
  })
  autoApply: boolean;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'integer',
    default: 0,
  })
  sortOrder: number;
}
