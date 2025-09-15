import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { Warranty } from './warranty.entity';
import { ProductTag } from './product-tag.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductMedia } from './product-media.entity';

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
    name: 'category_id',
    type: 'uuid',
    nullable: true,
  })
  categoryId?: string;

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
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations with lazy loading
  @ManyToOne(() => Brand, (brand) => brand.products, { lazy: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Promise<Brand>;

  @ManyToOne(() => Category, (category) => category.products, { lazy: true })
  @JoinColumn({ name: 'category_id' })
  category: Promise<Category>;

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

  @OneToMany(() => ProductVariant, (variant) => variant.product, { lazy: true })
  variants: Promise<ProductVariant[]>;

  @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.product, { lazy: true })
  productAttributes: Promise<ProductAttribute[]>;

  @OneToMany(() => ProductMedia, (media) => media.product)
  media: ProductMedia[];

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

  async getVariantCount(): Promise<number> {
    const variants = await this.variants;
    return variants?.length || 0;
  }

  async getTotalStock(): Promise<number> {
    const variants = await this.variants;
    return variants?.reduce((sum, variant) => sum + variant.stockQuantity, 0) || 0;
  }

  async getLowestPrice(): Promise<number | null> {
    const variants = await this.variants;
    if (!variants?.length) return null;
    return Math.min(...variants.map(v => v.price));
  }

  async getHighestPrice(): Promise<number | null> {
    const variants = await this.variants;
    if (!variants?.length) return null;
    return Math.max(...variants.map(v => v.price));
  }

  async getPriceRange(): Promise<string | null> {
    const lowest = await this.getLowestPrice();
    const highest = await this.getHighestPrice();
    
    if (lowest === null || highest === null) return null;
    if (lowest === highest) return `$${lowest.toFixed(2)}`;
    return `$${lowest.toFixed(2)} - $${highest.toFixed(2)}`;
  }
}