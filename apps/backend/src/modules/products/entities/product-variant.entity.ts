import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { ProductVariantItem } from './product-variant-item.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  sku?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  barcode?: string;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Expose()
  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  compareAtPrice?: number;

  @Expose()
  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  costPrice?: number;

  @Expose()
  @Column({
    name: 'stock_quantity',
    type: 'int',
    default: 0,
  })
  stockQuantity: number;

  @Expose()
  @Column({
    name: 'low_stock_threshold',
    type: 'int',
    nullable: true,
  })
  lowStockThreshold?: number;

  @Expose()
  @Column({
    name: 'track_inventory',
    type: 'boolean',
    default: true,
  })
  trackInventory: boolean;

  @Expose()
  @Column({
    name: 'allow_backorders',
    type: 'boolean',
    default: false,
  })
  allowBackorders: boolean;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  weight?: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  dimensions?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  image?: string;

  @Expose()
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  attributes?: Record<string, any>;

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
  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @OneToMany(() => ProductVariantItem, (item) => item.productVariant, {
    cascade: true,
    eager: false,
  })
  variantItems: ProductVariantItem[];

  // Virtual properties
  get primaryImage(): string | null {
    return this.image || null;
  }

  get isInStock(): boolean {
    return this.stockQuantity > 0;
  }

  get isLowStock(): boolean {
    if (!this.lowStockThreshold) return false;
    return this.stockQuantity <= this.lowStockThreshold;
  }

  get isOutOfStock(): boolean {
    return this.stockQuantity === 0;
  }

  get canPurchase(): boolean {
    return this.isActive && (this.isInStock || this.allowBackorders);
  }

  get discountPercentage(): number | null {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) return null;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }

  get profitMargin(): number | null {
    if (!this.costPrice || this.costPrice >= this.price) return null;
    return Math.round(((this.price - this.costPrice) / this.price) * 100);
  }
}