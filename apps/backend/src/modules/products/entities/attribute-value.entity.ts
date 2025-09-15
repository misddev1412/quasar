import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Attribute } from './attribute.entity';
import { ProductVariantItem } from './product-variant-item.entity';

@Entity('attribute_values')
export class AttributeValue extends BaseEntity {
  @Expose()
  @Column({
    name: 'attribute_id',
    type: 'uuid',
  })
  attributeId: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
  })
  value: string;

  @Expose()
  @Column({
    name: 'display_value',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  displayValue?: string;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations with lazy loading
  @ManyToOne(() => Attribute, (attribute) => attribute.values, { lazy: true })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Promise<Attribute>;

  @OneToMany(() => ProductVariantItem, (item) => item.attributeValue, { lazy: true })
  variantItems: Promise<ProductVariantItem[]>;

  // Virtual properties
  get displayName(): string {
    return this.displayValue || this.value;
  }
}