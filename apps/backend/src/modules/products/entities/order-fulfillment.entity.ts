import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Order } from './order.entity';
import { ShippingProvider } from './shipping-provider.entity';
import { FulfillmentItem } from './fulfillment-item.entity';
import { DeliveryTracking } from './delivery-tracking.entity';
import { User } from '@backend/modules/user/entities/user.entity';

export enum FulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PriorityLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum PackagingType {
  ENVELOPE = 'ENVELOPE',
  BOX = 'BOX',
  CRATE = 'CRATE',
  PALLET = 'PALLET',
  CUSTOM = 'CUSTOM',
}

@Entity('order_fulfillments')
export class OrderFulfillment extends BaseEntity {
  @Expose()
  @Column({
    name: 'order_id',
    type: 'uuid',
  })
  orderId: string;

  @Expose()
  @Column({
    name: 'fulfillment_number',
    type: 'varchar',
    length: 100,
  })
  fulfillmentNumber: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.PENDING,
  })
  status: FulfillmentStatus;

  @Expose()
  @Column({
    name: 'shipping_provider_id',
    type: 'uuid',
    nullable: true,
  })
  shippingProviderId?: string;

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
    name: 'estimated_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  estimatedDeliveryDate?: Date;

  @Expose()
  @Column({
    name: 'actual_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  actualDeliveryDate?: Date;

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
    name: 'insurance_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  insuranceCost: number;

  @Expose()
  @Column({
    name: 'packaging_type',
    type: 'enum',
    enum: PackagingType,
    nullable: true,
  })
  packagingType?: PackagingType;

  @Expose()
  @Column({
    name: 'package_weight',
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: true,
  })
  packageWeight?: number;

  @Expose()
  @Column({
    name: 'package_dimensions',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  packageDimensions?: string;

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
    name: 'pickup_address',
    type: 'jsonb',
    nullable: true,
  })
  pickupAddress?: {
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
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'internal_notes',
    type: 'text',
    nullable: true,
  })
  internalNotes?: string;

  @Expose()
  @Column({
    name: 'signature_required',
    type: 'boolean',
    default: false,
  })
  signatureRequired: boolean;

  @Expose()
  @Column({
    name: 'signature_received',
    type: 'boolean',
    default: false,
  })
  signatureReceived: boolean;

  @Expose()
  @Column({
    name: 'signature_image_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  signatureImageUrl?: string;

  @Expose()
  @Column({
    name: 'delivery_instructions',
    type: 'text',
    nullable: true,
  })
  deliveryInstructions?: string;

  @Expose()
  @Column({
    name: 'gift_wrap',
    type: 'boolean',
    default: false,
  })
  giftWrap: boolean;

  @Expose()
  @Column({
    name: 'gift_message',
    type: 'text',
    nullable: true,
  })
  giftMessage?: string;

  @Expose()
  @Column({
    name: 'priority_level',
    type: 'enum',
    enum: PriorityLevel,
    default: PriorityLevel.NORMAL,
  })
  priorityLevel: PriorityLevel;

  @Expose()
  @Column({
    name: 'fulfilled_by',
    type: 'uuid',
    nullable: true,
  })
  fulfilledBy?: string;

  @Expose()
  @Column({
    name: 'verified_by',
    type: 'uuid',
    nullable: true,
  })
  verifiedBy?: string;

  @Expose()
  @Column({
    name: 'verified_at',
    type: 'timestamp',
    nullable: true,
  })
  verifiedAt?: Date;

  @Expose()
  @Column({
    name: 'cancel_reason',
    type: 'text',
    nullable: true,
  })
  cancelReason?: string;

  @Expose()
  @Column({
    name: 'cancelled_at',
    type: 'timestamp',
    nullable: true,
  })
  cancelledAt?: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.fulfillments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ShippingProvider, (provider) => provider.fulfillments, { nullable: true })
  @JoinColumn({ name: 'shipping_provider_id' })
  shippingProvider?: ShippingProvider;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'fulfilled_by' })
  fulfilledByUser?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedByUser?: User;

  @OneToMany(() => FulfillmentItem, (item) => item.fulfillment, { cascade: true })
  fulfillmentItems: FulfillmentItem[];

  get items(): FulfillmentItem[] {
    return this.fulfillmentItems;
  }

  set items(items: FulfillmentItem[]) {
    this.fulfillmentItems = items;
  }

  @OneToMany(() => DeliveryTracking, (tracking) => tracking.fulfillment, { cascade: true })
  tracking: DeliveryTracking[];

  // Virtual properties
  get isPending(): boolean {
    return this.status === FulfillmentStatus.PENDING;
  }

  get isProcessing(): boolean {
    return [FulfillmentStatus.PROCESSING, FulfillmentStatus.PACKED].includes(this.status);
  }

  get isShipped(): boolean {
    return [FulfillmentStatus.SHIPPED, FulfillmentStatus.IN_TRANSIT, FulfillmentStatus.OUT_FOR_DELIVERY].includes(this.status);
  }

  get isDelivered(): boolean {
    return this.status === FulfillmentStatus.DELIVERED;
  }

  get isCompleted(): boolean {
    return [FulfillmentStatus.DELIVERED, FulfillmentStatus.RETURNED].includes(this.status);
  }

  get isCancelled(): boolean {
    return this.status === FulfillmentStatus.CANCELLED;
  }

  get isFailed(): boolean {
    return this.status === FulfillmentStatus.FAILED;
  }

  get isReturned(): boolean {
    return this.status === FulfillmentStatus.RETURNED;
  }

  get canShip(): boolean {
    return [FulfillmentStatus.PACKED, FulfillmentStatus.PROCESSING].includes(this.status);
  }

  get canCancel(): boolean {
    return [FulfillmentStatus.PENDING, FulfillmentStatus.PROCESSING, FulfillmentStatus.PACKED].includes(this.status);
  }

  get canTrack(): boolean {
    return this.isShipped || this.isDelivered;
  }

  get totalCost(): number {
    return this.shippingCost + this.insuranceCost;
  }

  get totalItems(): number {
    return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  get totalFulfilledItems(): number {
    return this.items?.reduce((sum, item) => sum + item.fulfilledQuantity, 0) || 0;
  }

  get fulfillmentProgress(): number {
    const total = this.totalItems;
    return total > 0 ? Math.round((this.totalFulfilledItems / total) * 100) : 0;
  }

  get daysInTransit(): number {
    if (!this.shippedDate) return 0;
    const endDate = this.actualDeliveryDate || new Date();
    const diffTime = endDate.getTime() - this.shippedDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get isOverdue(): boolean {
    if (!this.estimatedDeliveryDate || this.isDelivered) return false;
    return new Date() > this.estimatedDeliveryDate;
  }

  get daysOverdue(): number {
    if (!this.isOverdue) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.estimatedDeliveryDate!.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get hasSignatureRequired(): boolean {
    return this.signatureRequired && !this.signatureReceived;
  }

  get priorityDisplay(): string {
    switch (this.priorityLevel) {
      case PriorityLevel.URGENT:
        return '🔴 Urgent';
      case PriorityLevel.HIGH:
        return '🟠 High';
      case PriorityLevel.NORMAL:
        return '🟢 Normal';
      case PriorityLevel.LOW:
        return '🔵 Low';
      default:
        return '🟢 Normal';
    }
  }

  getShippingAddressDisplay(): string {
    if (!this.shippingAddress) return '';
    const addr = this.shippingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
  }

  getTrackingUrl(): string | null {
    if (!this.trackingNumber || !this.shippingProvider) return null;
    return this.shippingProvider.getTrackingUrl(this.trackingNumber);
  }

  getLatestTrackingEvent(): DeliveryTracking | null {
    if (!this.tracking || this.tracking.length === 0) return null;
    return this.tracking.reduce((latest, event) =>
      event.eventDate > latest.eventDate ? event : latest
    );
  }

  getFormattedShippingCost(): string {
    return `$${this.shippingCost.toFixed(2)}`;
  }

  getFormattedTotalCost(): string {
    return `$${this.totalCost.toFixed(2)}`;
  }

  getPackagingTypeDisplay(): string {
    if (!this.packagingType) return 'Standard';
    return this.packagingType.charAt(0) + this.packagingType.slice(1).toLowerCase();
  }

  getEstimatedDeliveryDateDisplay(): string {
    if (!this.estimatedDeliveryDate) return 'Not estimated';
    return this.estimatedDeliveryDate.toLocaleDateString();
  }

  getDaysSinceShipped(): number {
    if (!this.shippedDate) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.shippedDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
