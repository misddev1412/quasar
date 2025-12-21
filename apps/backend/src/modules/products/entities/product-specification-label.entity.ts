import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { ProductSpecification } from './product-specification.entity';

@Entity('product_specification_labels')
export class ProductSpecificationLabel extends BaseEntity {
  @Expose()
  @Column({
    name: 'group_name',
    type: 'varchar',
    length: 150,
  })
  groupName!: string;

  @Expose()
  @Column({
    name: 'group_code',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  groupCode?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
  })
  label!: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder!: number;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Expose()
  @Column({
    name: 'usage_count',
    type: 'int',
    default: 0,
  })
  usageCount!: number;

  @OneToMany(() => ProductSpecification, (specification) => specification.label, {
    cascade: false,
  })
  specifications!: ProductSpecification[];
}
