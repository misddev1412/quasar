import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';

export enum WarrantyType {
  MANUFACTURER = 'MANUFACTURER',
  EXTENDED = 'EXTENDED',
  STORE = 'STORE',
}

@Entity('warranties')
export class Warranty extends BaseEntity {
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
  description?: string;

  @Expose()
  @Column({
    name: 'duration_months',
    type: 'int',
  })
  durationMonths: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: WarrantyType,
  })
  type: WarrantyType;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  terms?: string;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  // Relations
  @OneToMany(() => Product, (product) => product.warranty)
  products?: Product[];

  // Virtual properties
  get productCount(): number {
    return this.products?.length || 0;
  }

  get durationInYears(): number {
    return Math.floor(this.durationMonths / 12);
  }

  get remainingMonths(): number {
    return this.durationMonths % 12;
  }
}