import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { SupplierTranslation } from './supplier-translation.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
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
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  logo?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  website?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country?: string;

  @Expose()
  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postalCode?: string;

  @Expose()
  @Column({
    name: 'contact_person',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  contactPerson?: string;

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
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations
  @OneToMany(() => Product, (product) => product.supplier)
  products?: Product[];

  @OneToMany(() => SupplierTranslation, (translation) => translation.supplier, {
    cascade: true,
    eager: false,
  })
  translations: SupplierTranslation[];

  // Virtual properties
  get productCount(): number {
    return this.products?.length || 0;
  }
}