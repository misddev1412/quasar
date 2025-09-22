import { Entity, Column, OneToMany, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { CategoryTranslation } from './category-translation.entity';
import { ProductCategory } from './product-category.entity';

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

  // Products via ProductCategory junction table
  // @ManyToMany(() => Product, (product) => product.categories)
  // products?: Product[];

  @OneToMany(() => CategoryTranslation, (translation) => translation.category, {
    cascade: true,
    eager: false,
  })
  translations: CategoryTranslation[];

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.category)
  productCategories: ProductCategory[];

  // Virtual properties
  get productCount(): number {
    return this.productCategories?.length || 0;
  }

  // Getter for products through ProductCategory junction
  async getProducts(): Promise<Product[]> {
    if (!this.productCategories) return [];
    const products = await Promise.all(
      this.productCategories.map(pc => pc.product)
    );
    return products.filter(p => p !== null);
  }

  get isRootCategory(): boolean {
    return !this.parentId;
  }

  get hasChildren(): boolean {
    return (this.children?.length || 0) > 0;
  }
}