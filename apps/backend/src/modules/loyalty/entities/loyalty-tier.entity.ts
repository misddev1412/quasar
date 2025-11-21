import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';

@Entity('loyalty_tiers')
export class LoyaltyTier extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
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
    name: 'min_points',
    type: 'integer',
  })
  minPoints: number;

  @Expose()
  @Column({
    name: 'max_points',
    type: 'integer',
    nullable: true,
  })
  maxPoints: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 7,
    default: '#000000',
  })
  color: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  icon: string;

  @Expose()
  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  benefits: string[];

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'integer',
    default: 0,
  })
  sortOrder: number;
}
