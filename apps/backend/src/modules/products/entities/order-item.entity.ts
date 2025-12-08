import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Expose()
  @Column({
    name: 'order_id',
    type: 'uuid',
  })
  orderId: string;

  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    name: 'product_variant_id',
    type: 'uuid',
    nullable: true,
  })
  productVariantId?: string;

  @Expose()
  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 255,
  })
  productName: string;

  @Expose()
  @Column({
    name: 'product_sku',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  productSku?: string;

  @Expose()
  @Column({
    name: 'variant_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  variantName?: string;

  @Expose()
  @Column({
    name: 'variant_sku',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  variantSku?: string;

  @Expose()
  @Column({
    name: 'quantity',
    type: 'int',
  })
  quantity: number;

  @Expose()
  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  @Expose()
  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Expose()
  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Expose()
  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Expose()
  @Column({
    name: 'product_image',
    type: 'text',
    nullable: true,
  })
  productImage?: string;

  @Expose()
  @Column({
    name: 'product_attributes',
    type: 'jsonb',
    nullable: true,
  })
  productAttributes?: Record<string, string>;

  @Expose()
  @Column({
    name: 'is_digital',
    type: 'boolean',
    default: false,
  })
  isDigital: boolean;

  @Expose()
  @Column({
    name: 'weight',
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: true,
  })
  weight?: number;

  @Expose()
  @Column({
    name: 'dimensions',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  dimensions?: string;

  @Expose()
  @Column({
    name: 'requires_shipping',
    type: 'boolean',
    default: true,
  })
  requiresShipping: boolean;

  @Expose()
  @Column({
    name: 'is_gift_card',
    type: 'boolean',
    default: false,
  })
  isGiftCard: boolean;

  @Expose()
  @Column({
    name: 'gift_card_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  giftCardCode?: string;

  @Expose()
  @Column({
    name: 'notes',
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'fulfilled_quantity',
    type: 'int',
    default: 0,
  })
  fulfilledQuantity: number;

  @Expose()
  @Column({
    name: 'refunded_quantity',
    type: 'int',
    default: 0,
  })
  refundedQuantity: number;

  @Expose()
  @Column({
    name: 'returned_quantity',
    type: 'int',
    default: 0,
  })
  returnedQuantity: number;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { lazy: true })
  @JoinColumn({ name: 'product_id' })
  product: Promise<Product>;

  @ManyToOne(() => ProductVariant, { lazy: true, nullable: true })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant?: Promise<ProductVariant>;

  // Virtual properties
  get subTotal(): number {
    return this.unitPrice * this.quantity;
  }

  get netPrice(): number {
    return this.totalPrice - this.discountAmount;
  }

  get totalWithTax(): number {
    return this.netPrice + this.taxAmount;
  }

  get pendingQuantity(): number {
    return this.quantity - this.fulfilledQuantity;
  }

  get isFullyFulfilled(): boolean {
    return this.fulfilledQuantity >= this.quantity;
  }

  get isPartiallyFulfilled(): boolean {
    return this.fulfilledQuantity > 0 && this.fulfilledQuantity < this.quantity;
  }

  get isPending(): boolean {
    return this.fulfilledQuantity === 0;
  }

  get canFulfill(): boolean {
    return this.pendingQuantity > 0;
  }

  get canRefund(): boolean {
    return this.fulfilledQuantity > this.refundedQuantity;
  }

  get canReturn(): boolean {
    return this.fulfilledQuantity > this.returnedQuantity && !this.isDigital;
  }

  get fulfillmentProgress(): number {
    return this.quantity > 0 ? Math.round((this.fulfilledQuantity / this.quantity) * 100) : 0;
  }

  get discountPercentage(): number {
    return this.subTotal > 0 ? (this.discountAmount / this.subTotal) * 100 : 0;
  }

  get taxRate(): number {
    const netAmount = this.netPrice;
    return netAmount > 0 ? (this.taxAmount / netAmount) * 100 : 0;
  }

  get unitWeight(): number {
    return this.weight || 0;
  }

  get totalWeight(): number {
    return this.unitWeight * this.quantity;
  }

  getFormattedPrice(): string {
    return `$${this.unitPrice.toFixed(2)}`;
  }

  getFormattedTotal(): string {
    return `$${this.totalPrice.toFixed(2)}`;
  }

  getFormattedAttributes(): string {
    if (!this.productAttributes) return '';
    return Object.entries(this.productAttributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  getDisplayName(): string {
    return this.variantName ? `${this.productName} - ${this.variantName}` : this.productName;
  }

  getSku(): string {
    return this.variantSku || this.productSku || '';
  }
}