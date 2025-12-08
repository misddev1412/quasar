import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Supplier } from './supplier.entity';
import { Warehouse } from './warehouse.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

@Entity('purchase_orders')
export class PurchaseOrder extends BaseEntity {
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
    name: 'supplier_id',
    type: 'uuid',
  })
  supplierId: string;

  @Expose()
  @Column({
    name: 'warehouse_id',
    type: 'uuid',
    nullable: true,
  })
  warehouseId?: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus;

  @Expose()
  @Column({
    name: 'order_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  orderDate: Date;

  @Expose()
  @Column({
    name: 'expected_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  expectedDeliveryDate?: Date;

  @Expose()
  @Column({
    name: 'actual_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  actualDeliveryDate?: Date;

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
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'terms_and_conditions',
    type: 'text',
    nullable: true,
  })
  termsAndConditions?: string;

  @Expose()
  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string;

  @Expose()
  @Column({
    name: 'approved_by',
    type: 'uuid',
    nullable: true,
  })
  approvedBy?: string;

  @Expose()
  @Column({
    name: 'approved_at',
    type: 'timestamp',
    nullable: true,
  })
  approvedAt?: Date;

  // Relations
  @ManyToOne(() => Supplier, { lazy: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Promise<Supplier>;

  @ManyToOne(() => Warehouse, { lazy: true, nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: Promise<Warehouse>;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
    eager: false,
  })
  items: PurchaseOrderItem[];

  // Virtual properties
  get isEditable(): boolean {
    return [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PENDING].includes(this.status);
  }

  get isApproved(): boolean {
    return this.status !== PurchaseOrderStatus.DRAFT && this.status !== PurchaseOrderStatus.PENDING;
  }

  get isCompleted(): boolean {
    return [PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CLOSED].includes(this.status);
  }

  get isCancelled(): boolean {
    return this.status === PurchaseOrderStatus.CANCELLED;
  }

  get canReceive(): boolean {
    return [PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.PARTIALLY_RECEIVED].includes(this.status);
  }

  get daysOverdue(): number {
    if (!this.expectedDeliveryDate || this.isCompleted || this.isCancelled) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.expectedDeliveryDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  get isOverdue(): boolean {
    return this.daysOverdue > 0;
  }

  get itemCount(): number {
    return this.items?.length || 0;
  }

  getTotalQuantity(): number {
    return this.items?.reduce((sum, item) => sum + item.quantityOrdered, 0) || 0;
  }

  getTotalReceivedQuantity(): number {
    return this.items?.reduce((sum, item) => sum + item.quantityReceived, 0) || 0;
  }

  getReceiveProgress(): number {
    const totalOrdered = this.getTotalQuantity();
    const totalReceived = this.getTotalReceivedQuantity();
    return totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
  }
}