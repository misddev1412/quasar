import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Customer } from '@backend/modules/products/entities/customer.entity';
import { Order } from '@backend/modules/products/entities/order.entity';
import { LoyaltyReward } from './loyalty-reward.entity';

export enum TransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
  REFERRAL_BONUS = 'referral_bonus',
}

@Entity('loyalty_transactions')
export class LoyaltyTransaction extends BaseEntity {
  @Expose()
  @Column({
    type: 'uuid',
  })
  customerId: string;

  @Expose()
  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Expose()
  @Column({
    type: 'integer',
  })
  points: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
  })
  type: TransactionType;

  @Expose()
  @Column({
    type: 'text',
  })
  description: string;

  @Expose()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  orderId: string;

  @Expose()
  @ManyToOne(() => Order, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Expose()
  @Column({
    type: 'uuid',
    nullable: true,
  })
  rewardId: string;

  @Expose()
  @ManyToOne(() => LoyaltyReward, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reward_id' })
  reward: LoyaltyReward;

  @Expose()
  @Column({
    type: 'integer',
  })
  balanceAfter: number;

  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date;

  @Expose()
  @Column({
    type: 'jsonb',
    default: () => "'{}'",
  })
  metadata: Record<string, any>;
}
