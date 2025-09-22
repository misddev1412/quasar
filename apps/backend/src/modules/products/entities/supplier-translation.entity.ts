import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Supplier } from './supplier.entity';

@Entity('supplier_translations')
@Unique(['supplier_id', 'locale'])
export class SupplierTranslation extends BaseEntity {
  @Expose()
  @Column({
    name: 'supplier_id',
    type: 'uuid',
  })
  supplier_id: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 5,
  })
  locale: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

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
    name: 'contact_person',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  contactPerson?: string;

  // Relations
  @ManyToOne(() => Supplier, (supplier) => supplier.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;
}