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
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    type: 'boolean',
    default: false,
  })
  isLimited: boolean;

  @Expose()
  @Column({
    type: 'integer',
    nullable: true,
  })
  totalQuantity: number;

  @Expose()
  @Column({
    type: 'integer',
    nullable: true,
  })
  remainingQuantity: number;

  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  startsAt: Date;

  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  endsAt: Date;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imageUrl: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  termsConditions: string;

  @Expose()
  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  tierRestrictions: string[];

  @Expose()
  @Column({
    type: 'boolean',
    default: false,
  })
  autoApply: boolean;

  @Expose()
  @Column({
    type: 'integer',
    default: 0,
  })
  sortOrder: number;
}