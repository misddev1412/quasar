import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity('product_categories')
@Unique('UQ_product_categories_product_category', ['productId', 'categoryId'])
@Index('IDX_product_categories_product_id', ['productId'])
@Index('IDX_product_categories_category_id', ['categoryId'])
export class ProductCategory extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    name: 'category_id',
    type: 'uuid',
  })
  categoryId: string;

  // Relations
  @ManyToOne(() => Product, (product) => product.productCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Category, (category) => category.productCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}