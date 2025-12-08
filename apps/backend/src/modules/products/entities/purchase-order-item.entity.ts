import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { PurchaseOrder } from './purchase-order.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem extends BaseEntity {
  @Expose()
  @Column({
    name: 'purchase_order_id',
    type: 'uuid',
  })
  purchaseOrderId: string;

  @Expose()
  @Column({
    name: 'product_variant_id',
    type: 'uuid',
  })
  productVariantId: string;

  @Expose()
  @Column({
    name: 'quantity_ordered',
    type: 'int',
  })
  quantityOrdered: number;

  @Expose()
  @Column({
    name: 'quantity_received',
    type: 'int',
    default: 0,
  })
  quantityReceived: number;

  @Expose()
  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitCost: number;

  @Expose()
  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalCost: number;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'received_at',
    type: 'timestamp',
    nullable: true,
  })
  receivedAt?: Date;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations
  @ManyToOne(() => PurchaseOrder, (po) => po.items)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => ProductVariant, { lazy: true })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: Promise<ProductVariant>;

  // Virtual properties
  get quantityPending(): number {
    return this.quantityOrdered - this.quantityReceived;
  }

  get isFullyReceived(): boolean {
    return this.quantityReceived >= this.quantityOrdered;
  }

  get isPartiallyReceived(): boolean {
    return this.quantityReceived > 0 && this.quantityReceived < this.quantityOrdered;
  }

  get receiveProgress(): number {
    return this.quantityOrdered > 0 ? Math.round((this.quantityReceived / this.quantityOrdered) * 100) : 0;
  }

  get canReceive(): boolean {
    return this.quantityPending > 0;
  }

  get receivedValue(): number {
    return this.quantityReceived * this.unitCost;
  }

  get pendingValue(): number {
    return this.quantityPending * this.unitCost;
  }
}