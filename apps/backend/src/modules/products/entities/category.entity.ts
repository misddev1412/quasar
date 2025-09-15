import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { CategoryTranslation } from './category-translation.entity';

@Entity('categories')
export class Category extends BaseEntity {
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
    name: 'parent_id',
    type: 'uuid',
    nullable: true,
  })
  parentId?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  image?: string;

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

  @Expose()
  @Column({
    type: 'int',
    default: 0,
  })
  level: number;

  // Relations
  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @OneToMany(() => CategoryTranslation, (translation) => translation.category, {
    cascade: true,
    eager: false,
  })
  translations: CategoryTranslation[];

  // Virtual properties
  get productCount(): number {
    return this.products?.length || 0;
  }

  get isRootCategory(): boolean {
    return !this.parentId;
  }

  get hasChildren(): boolean {
    return (this.children?.length || 0) > 0;
  }
}