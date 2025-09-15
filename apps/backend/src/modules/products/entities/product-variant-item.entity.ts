import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { ProductVariant } from './product-variant.entity';
import { Attribute } from './attribute.entity';
import { AttributeValue } from './attribute-value.entity';

@Entity('product_variant_items')
@Index(['productVariantId', 'attributeId'], { unique: true }) // Ensure one value per attribute per variant
export class ProductVariantItem extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_variant_id',
    type: 'uuid',
  })
  productVariantId: string;

  @Expose()
  @Column({
    name: 'attribute_id',
    type: 'uuid',
  })
  attributeId: string;

  @Expose()
  @Column({
    name: 'attribute_value_id',
    type: 'uuid',
  })
  attributeValueId: string;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations
  @ManyToOne(() => ProductVariant, (variant) => variant.variantItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @ManyToOne(() => Attribute, (attribute) => attribute.variantItems, {
    eager: true,
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @ManyToOne(() => AttributeValue, (value) => value.variantItems, {
    eager: true,
  })
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue: AttributeValue;

  // Virtual properties
  get attributeName(): string {
    return this.attribute?.name || '';
  }

  get attributeDisplayName(): string {
    return this.attribute?.displayName || this.attribute?.name || '';
  }

  get value(): string {
    return this.attributeValue?.value || '';
  }

  get displayValue(): string {
    return this.attributeValue?.displayValue || this.attributeValue?.value || '';
  }
}