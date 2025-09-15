import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { AttributeValue } from './attribute-value.entity';
import { ProductAttribute } from './product-attribute.entity';
import { AttributeTranslation } from './attribute-translation.entity';
import { ProductVariantItem } from './product-variant-item.entity';

export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  COLOR = 'COLOR',
  DATE = 'DATE',
}

@Entity('attributes')
export class Attribute extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  name: string;

  @Expose()
  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 20,
    enum: AttributeType,
  })
  type: AttributeType;

  @Expose()
  @Column({
    name: 'is_required',
    type: 'boolean',
    default: false,
  })
  isRequired: boolean;

  @Expose()
  @Column({
    name: 'is_filterable',
    type: 'boolean',
    default: false,
  })
  isFilterable: boolean;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations with lazy loading
  @OneToMany(() => AttributeValue, (attributeValue) => attributeValue.attribute, { lazy: true })
  values: Promise<AttributeValue[]>;

  @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.attribute, { lazy: true })
  productAttributes: Promise<ProductAttribute[]>;

  @OneToMany(() => AttributeTranslation, (translation) => translation.attribute, {
    cascade: true,
    eager: false,
  })
  translations: AttributeTranslation[];

  @OneToMany(() => ProductVariantItem, (item) => item.attribute, { lazy: true })
  variantItems: Promise<ProductVariantItem[]>;

  // Virtual properties
  async getValueCount(): Promise<number> {
    const values = await this.values;
    return values?.length || 0;
  }

  async hasValues(): Promise<boolean> {
    const values = await this.values;
    return (values?.length || 0) > 0;
  }

  get isSelectType(): boolean {
    return this.type === AttributeType.SELECT || this.type === AttributeType.MULTISELECT;
  }
}