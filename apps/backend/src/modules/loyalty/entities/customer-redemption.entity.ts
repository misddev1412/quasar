import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Customer } from '@backend/modules/products/entities/customer.entity';
import { LoyaltyReward } from './loyalty-reward.entity';

export enum RedemptionStatus {
  PENDING = 'pending',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('customer_redemptions')
export class CustomerRedemption extends BaseEntity {
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
    type: 'uuid',
  })
  rewardId: string;

  @Expose()
  @ManyToOne(() => LoyaltyReward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reward_id' })
  reward: LoyaltyReward;

  @Expose()
  @Column({
    type: 'integer',
  })
  pointsUsed: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    default: RedemptionStatus.PENDING,
  })
  status: RedemptionStatus;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  redemptionCode: string;

  @Expose()
  @Column({
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;

  @Expose()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  usedAt: Date;

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
