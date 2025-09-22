import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum OrderSource {
  WEBSITE = 'WEBSITE',
  MOBILE_APP = 'MOBILE_APP',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  IN_STORE = 'IN_STORE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  MARKETPLACE = 'MARKETPLACE',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Expose()
  @Column({
    name: 'order_number',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  orderNumber: string;

  @Expose()
  @Column({
    name: 'customer_id',
    type: 'uuid',
    nullable: true,
  })
  customerId?: string;

  @Expose()
  @Column({
    name: 'customer_email',
    type: 'varchar',
    length: 255,
  })
  customerEmail: string;

  @Expose()
  @Column({
    name: 'customer_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  customerPhone?: string;

  @Expose()
  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 255,
  })
  customerName: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Expose()
  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Expose()
  @Column({
    type: 'enum',
    enum: OrderSource,
    default: OrderSource.WEBSITE,
  })
  source: OrderSource;

  @Expose()
  @Column({
    name: 'order_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  orderDate: Date;

  @Expose()
  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  subtotal: number;

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
    name: 'shipping_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shippingCost: number;

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
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Expose()
  @Column({
    name: 'currency',
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  currency: string;

  @Expose()
  @Column({
    name: 'billing_address',
    type: 'jsonb',
    nullable: true,
  })
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Expose()
  @Column({
    name: 'shipping_address',
    type: 'jsonb',
    nullable: true,
  })
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Expose()
  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  paymentMethod?: string;

  @Expose()
  @Column({
    name: 'payment_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paymentReference?: string;

  @Expose()
  @Column({
    name: 'shipping_method',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  shippingMethod?: string;

  @Expose()
  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  trackingNumber?: string;

  @Expose()
  @Column({
    name: 'shipped_date',
    type: 'timestamp',
    nullable: true,
  })
  shippedDate?: Date;

  @Expose()
  @Column({
    name: 'delivered_date',
    type: 'timestamp',
    nullable: true,
  })
  deliveredDate?: Date;

  @Expose()
  @Column({
    name: 'estimated_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  estimatedDeliveryDate?: Date;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'customer_notes',
    type: 'text',
    nullable: true,
  })
  customerNotes?: string;

  @Expose()
  @Column({
    name: 'internal_notes',
    type: 'text',
    nullable: true,
  })
  internalNotes?: string;

  @Expose()
  @Column({
    name: 'discount_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  discountCode?: string;

  @Expose()
  @Column({
    name: 'is_gift',
    type: 'boolean',
    default: false,
  })
  isGift: boolean;

  @Expose()
  @Column({
    name: 'gift_message',
    type: 'text',
    nullable: true,
  })
  giftMessage?: string;

  @Expose()
  @Column({
    name: 'cancelled_at',
    type: 'timestamp',
    nullable: true,
  })
  cancelledAt?: Date;

  @Expose()
  @Column({
    name: 'cancelled_reason',
    type: 'text',
    nullable: true,
  })
  cancelledReason?: string;

  @Expose()
  @Column({
    name: 'refunded_at',
    type: 'timestamp',
    nullable: true,
  })
  refundedAt?: Date;

  @Expose()
  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  refundAmount?: number;

  @Expose()
  @Column({
    name: 'refund_reason',
    type: 'text',
    nullable: true,
  })
  refundReason?: string;

  // Relations
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false,
  })
  items: OrderItem[];

  // Virtual properties
  get isPaid(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  get isCompleted(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  get isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  get isRefunded(): boolean {
    return this.status === OrderStatus.REFUNDED || this.paymentStatus === PaymentStatus.REFUNDED;
  }

  get isProcessing(): boolean {
    return [OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(this.status);
  }

  get isShipped(): boolean {
    return [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(this.status);
  }

  get canCancel(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  get canShip(): boolean {
    return this.status === OrderStatus.PROCESSING && this.isPaid;
  }

  get canRefund(): boolean {
    return this.isPaid && !this.isRefunded;
  }

  get itemCount(): number {
    return this.items?.length || 0;
  }

  get totalQuantity(): number {
    return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  getDaysSinceOrder(): number {
    const today = new Date();
    const diffTime = today.getTime() - this.orderDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  getFormattedTotal(): string {
    return `${this.currency} ${this.totalAmount.toFixed(2)}`;
  }

  getFullBillingAddress(): string {
    if (!this.billingAddress) return '';
    const addr = this.billingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
  }

  getFullShippingAddress(): string {
    if (!this.shippingAddress) return '';
    const addr = this.shippingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
  }

  getNetAmount(): number {
    return this.subtotal - this.discountAmount;
  }

  getTaxRate(): number {
    return this.subtotal > 0 ? (this.taxAmount / this.subtotal) * 100 : 0;
  }

  getDiscountPercentage(): number {
    return this.subtotal > 0 ? (this.discountAmount / this.subtotal) * 100 : 0;
  }
}