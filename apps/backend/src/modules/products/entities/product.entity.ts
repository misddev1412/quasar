import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Brand } from './brand.entity';
import { Supplier } from './supplier.entity';
import { Category } from './category.entity';
import { Warranty } from './warranty.entity';
import { ProductTag } from './product-tag.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductMedia } from './product-media.entity';
import { ProductCategory } from './product-category.entity';
import { Wishlist } from './wishlist.entity';
import { ProductSpecification } from './product-specification.entity';
import { ProductWarehouseQuantity } from './product-warehouse-quantity.entity';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

@Entity('products')
export class Product extends BaseEntity {
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
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  sku?: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Expose()
  @Column({
    name: 'brand_id',
    type: 'uuid',
    nullable: true,
  })
  brandId?: string;

  @Expose()
  @Column({
    name: 'supplier_id',
    type: 'uuid',
    nullable: true,
  })
  supplierId?: string;

  @Expose()
  @Column({
    name: 'warranty_id',
    type: 'uuid',
    nullable: true,
  })
  warrantyId?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  images?: string;

  @Expose()
  @Column({
    name: 'meta_title',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  metaTitle?: string;

  @Expose()
  @Column({
    name: 'meta_description',
    type: 'text',
    nullable: true,
  })
  metaDescription?: string;

  @Expose()
  @Column({
    name: 'meta_keywords',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  metaKeywords?: string;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'is_featured',
    type: 'boolean',
    default: false,
  })
  isFeatured: boolean;

  @Expose()
  @Column({
    name: 'stock_quantity',
    type: 'int',
    default: 0,
  })
  stockQuantity: number;

  @Expose()
  @Column({
    name: 'enable_warehouse_quantity',
    type: 'boolean',
    default: false,
  })
  enableWarehouseQuantity: boolean;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations with lazy loading
  @ManyToOne(() => Brand, (brand) => brand.products, { lazy: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Promise<Brand>;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, { lazy: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Promise<Supplier>;

  // Categories via ProductCategory junction table
  // @ManyToMany(() => Category, (category) => category.products, { lazy: true })
  // @JoinTable({
  //   name: 'product_categories',
  //   joinColumn: { name: 'product_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  // })
  // categories: Promise<Category[]>;

  @ManyToOne(() => Warranty, (warranty) => warranty.products, { lazy: true })
  @JoinColumn({ name: 'warranty_id' })
  warranty: Promise<Warranty>;

  @ManyToMany(() => ProductTag, (tag) => tag.products, { lazy: true })
  @JoinTable({
    name: 'product_product_tags',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Promise<ProductTag[]>;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { eager: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.product, { lazy: true })
  productAttributes: Promise<ProductAttribute[]>;

  @OneToMany(() => ProductSpecification, (specification) => specification.product, { eager: true })
  specifications: ProductSpecification[];

  @OneToMany(() => ProductMedia, (media) => media.product)
  media: ProductMedia[];

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.product)
  productCategories: ProductCategory[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

  @OneToMany(() => ProductWarehouseQuantity, (warehouseQuantity) => warehouseQuantity.product, { eager: true })
  warehouseQuantities: ProductWarehouseQuantity[];

  // Getter for categories through ProductCategory junction
  async getCategories(): Promise<Category[]> {
    if (!this.productCategories) return [];
    const categories = await Promise.all(
      this.productCategories.map(pc => pc.category)
    );
    return categories.filter(c => c !== null);
  }

  // Virtual properties - keeping for backward compatibility
  get imageList(): string[] {
    if (!this.images) return [];
    try {
      return JSON.parse(this.images);
    } catch {
      return [];
    }
  }

  set imageList(images: string[]) {
    this.images = JSON.stringify(images);
  }

  get primaryImage(): string | null {
    const images = this.imageList;
    return images.length > 0 ? images[0] : null;
  }

  // New methods for ProductMedia
  getMediaByType(type?: string): ProductMedia[] {
    const allMedia = this.media;
    if (!type) return allMedia || [];
    return allMedia?.filter(m => m.type === type) || [];
  }

  getImages(): ProductMedia[] {
    return this.getMediaByType('image');
  }

  getVideos(): ProductMedia[] {
    return this.getMediaByType('video');
  }

  getPrimaryMedia(): ProductMedia | null {
    const allMedia = this.media;
    return allMedia?.find(m => m.isPrimary) || allMedia?.[0] || null;
  }

  getPrimaryImageUrl(): string | null {
    const primaryMedia = this.getPrimaryMedia();
    return primaryMedia?.isImage ? primaryMedia.url : null;
  }

  get isPublished(): boolean {
    return this.status === ProductStatus.ACTIVE && this.isActive;
  }

  async getTagNames(): Promise<string[]> {
    const tags = await this.tags;
    return tags?.map(tag => tag.name) || [];
  }

  getVariantCount(): number {
    return this.variants?.length || 0;
  }

  getTotalStock(): number {
    return this.variants?.reduce((sum, variant) => sum + variant.stockQuantity, 0) || 0;
  }

  getLowestPrice(): number | null {
    if (!this.variants?.length) return null;
    return Math.min(...this.variants.map(v => v.price));
  }

  getHighestPrice(): number | null {
    if (!this.variants?.length) return null;
    return Math.max(...this.variants.map(v => v.price));
  }

  getPriceRange(): string | null {
    const lowest = this.getLowestPrice();
    const highest = this.getHighestPrice();

    if (lowest === null || highest === null) return null;
    if (lowest === highest) return `$${lowest.toFixed(2)}`;
    return `$${lowest.toFixed(2)} - $${highest.toFixed(2)}`;
  }
}
