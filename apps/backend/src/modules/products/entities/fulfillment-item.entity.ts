import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { OrderFulfillment } from './order-fulfillment.entity';
import { OrderItem } from './order-item.entity';
import { User } from '@backend/modules/user/entities/user.entity';
import { decimalColumnTransformer } from './transformers/decimal-column.transformer';

export enum FulfillmentItemStatus {
  PENDING = 'PENDING',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  DAMAGED = 'DAMAGED',
  MISSING = 'MISSING',
  CANCELLED = 'CANCELLED',
}

@Entity('order_fulfillment_items')
export class FulfillmentItem extends BaseEntity {
  @Expose()
  @Column({
    name: 'fulfillment_id',
    type: 'uuid',
  })
  fulfillmentId: string;

  @Expose()
  @Column({
    name: 'order_item_id',
    type: 'uuid',
  })
  orderItemId: string;

  @Expose()
  @Column({
    type: 'int',
  })
  quantity: number;

  @Expose()
  @Column({
    name: 'fulfilled_quantity',
    type: 'int',
    default: 0,
  })
  fulfilledQuantity: number;

  @Expose()
  @Column({
    name: 'returned_quantity',
    type: 'int',
    default: 0,
  })
  returnedQuantity: number;

  @Expose()
  @Column({
    name: 'damaged_quantity',
    type: 'int',
    default: 0,
  })
  damagedQuantity: number;

  @Expose()
  @Column({
    name: 'missing_quantity',
    type: 'int',
    default: 0,
  })
  missingQuantity: number;

  @Expose()
  @Column({
    name: 'location_picked_from',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  locationPickedFrom?: string;

  @Expose()
  @Column({
    name: 'batch_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  batchNumber?: string;

  @Expose()
  @Column({
    name: 'serial_numbers',
    type: 'text',
    nullable: true,
  })
  serialNumbers?: string; // JSON string of serial numbers array

  @Expose()
  @Column({
    name: 'expiry_date',
    type: 'timestamp',
    nullable: true,
  })
  expiryDate?: Date;

  @Expose()
  @Column({
    name: 'condition_notes',
    type: 'text',
    nullable: true,
  })
  conditionNotes?: string;

  @Expose()
  @Column({
    name: 'quality_check',
    type: 'boolean',
    default: false,
  })
  qualityCheck: boolean;

  @Expose()
  @Column({
    name: 'quality_check_by',
    type: 'uuid',
    nullable: true,
  })
  qualityCheckBy?: string;

  @Expose()
  @Column({
    name: 'quality_check_at',
    type: 'timestamp',
    nullable: true,
  })
  qualityCheckAt?: Date;

  @Expose()
  @Column({
    name: 'packaging_notes',
    type: 'text',
    nullable: true,
  })
  packagingNotes?: string;

  @Expose()
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: true,
    transformer: decimalColumnTransformer,
  })
  weight?: number;

  @Expose()
  @Column({
    name: 'item_status',
    type: 'enum',
    enum: FulfillmentItemStatus,
    default: FulfillmentItemStatus.PENDING,
  })
  itemStatus: FulfillmentItemStatus;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  // Relations
  @ManyToOne(() => OrderFulfillment, (fulfillment) => fulfillment.fulfillmentItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fulfillment_id' })
  fulfillment: OrderFulfillment;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'quality_check_by' })
  qualityCheckByUser?: User;

  // Virtual properties
  get isPending(): boolean {
    return this.itemStatus === FulfillmentItemStatus.PENDING;
  }

  get isPicked(): boolean {
    return this.itemStatus === FulfillmentItemStatus.PICKED;
  }

  get isPacked(): boolean {
    return this.itemStatus === FulfillmentItemStatus.PACKED;
  }

  get isShipped(): boolean {
    return this.itemStatus === FulfillmentItemStatus.SHIPPED;
  }

  get isDelivered(): boolean {
    return this.itemStatus === FulfillmentItemStatus.DELIVERED;
  }

  get isReturned(): boolean {
    return this.itemStatus === FulfillmentItemStatus.RETURNED;
  }

  get isDamaged(): boolean {
    return this.itemStatus === FulfillmentItemStatus.DAMAGED;
  }

  get isMissing(): boolean {
    return this.itemStatus === FulfillmentItemStatus.MISSING;
  }

  get isCancelled(): boolean {
    return this.itemStatus === FulfillmentItemStatus.CANCELLED;
  }

  get isCompleted(): boolean {
    return [FulfillmentItemStatus.DELIVERED, FulfillmentItemStatus.RETURNED].includes(this.itemStatus);
  }

  get isProblematic(): boolean {
    return [FulfillmentItemStatus.DAMAGED, FulfillmentItemStatus.MISSING].includes(this.itemStatus);
  }

  get canPick(): boolean {
    return this.isPending && this.quantity > 0;
  }

  get canPack(): boolean {
    return this.isPicked && this.fulfilledQuantity === this.quantity;
  }

  get canShip(): boolean {
    return this.isPacked && this.fulfilledQuantity === this.quantity;
  }

  get canQualityCheck(): boolean {
    return !this.qualityCheck && !this.isCompleted;
  }

  get hasIssues(): boolean {
    return this.damagedQuantity > 0 || this.missingQuantity > 0;
  }

  get pendingQuantity(): number {
    return this.quantity - this.fulfilledQuantity;
  }

  get actualFulfilledQuantity(): number {
    return this.fulfilledQuantity - this.damagedQuantity - this.missingQuantity;
  }

  get fulfillmentProgress(): number {
    return this.quantity > 0 ? Math.round((this.fulfilledQuantity / this.quantity) * 100) : 0;
  }

  get issueProgress(): number {
    return this.quantity > 0 ? Math.round(((this.damagedQuantity + this.missingQuantity) / this.quantity) * 100) : 0;
  }

  get qualityScore(): number {
    if (this.quantity === 0) return 100;
    const goodQuantity = this.quantity - this.damagedQuantity - this.missingQuantity;
    return Math.round((goodQuantity / this.quantity) * 100);
  }

  get hasSerialNumbers(): boolean {
    return !!(this.serialNumbers && this.serialNumbers.length > 0);
  }

  get getSerialNumbers(): string[] {
    if (!this.serialNumbers) return [];
    try {
      return JSON.parse(this.serialNumbers);
    } catch {
      return [];
    }
  }

  setSerialNumbers(numbers: string[]): void {
    this.serialNumbers = JSON.stringify(numbers);
  }

  get isExpiringSoon(): boolean {
    if (!this.expiryDate) return false;
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return this.expiryDate <= thirtyDaysFromNow;
  }

  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get daysUntilExpiry(): number {
    if (!this.expiryDate) return -1;
    const today = new Date();
    const diffTime = this.expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusDisplay(): string {
    switch (this.itemStatus) {
      case FulfillmentItemStatus.PENDING:
        return '⏳ Pending';
      case FulfillmentItemStatus.PICKED:
        return '📦 Picked';
      case FulfillmentItemStatus.PACKED:
        return '📋 Packed';
      case FulfillmentItemStatus.SHIPPED:
        return '🚚 Shipped';
      case FulfillmentItemStatus.DELIVERED:
        return '✅ Delivered';
      case FulfillmentItemStatus.RETURNED:
        return '↩️ Returned';
      case FulfillmentItemStatus.DAMAGED:
        return '💔 Damaged';
      case FulfillmentItemStatus.MISSING:
        return '❌ Missing';
      case FulfillmentItemStatus.CANCELLED:
        return '🚫 Cancelled';
      default:
        return '❓ Unknown';
    }
  }

  getQualityStatusDisplay(): string {
    if (this.qualityCheck) {
      return '✅ Quality Checked';
    }
    return '⏳ Pending Quality Check';
  }

  getIssueSummary(): string {
    const issues: string[] = [];
    if (this.damagedQuantity > 0) issues.push(`${this.damagedQuantity} damaged`);
    if (this.missingQuantity > 0) issues.push(`${this.missingQuantity} missing`);
    return issues.length > 0 ? issues.join(', ') : 'No issues';
  }

  getFulfillmentSummary(): string {
    return `${this.fulfilledQuantity}/${this.quantity} fulfilled`;
  }

  getWeightDisplay(): string {
    if (!this.weight) return 'Not specified';
    return `${this.weight} kg`;
  }

  getLocationDisplay(): string {
    return this.locationPickedFrom || 'Not specified';
  }

  getConditionDisplay(): string {
    if (!this.conditionNotes) return 'No notes';
    return this.conditionNotes.length > 50
      ? this.conditionNotes.substring(0, 50) + '...'
      : this.conditionNotes;
  }

  getPackagingDisplay(): string {
    if (!this.packagingNotes) return 'Standard packaging';
    return this.packagingNotes.length > 50
      ? this.packagingNotes.substring(0, 50) + '...'
      : this.packagingNotes;
  }

  getBatchDisplay(): string {
    return this.batchNumber || 'N/A';
  }

  getExpiryDisplay(): string {
    if (!this.expiryDate) return 'No expiry';
    return this.expiryDate.toLocaleDateString();
  }

  needsAttention(): boolean {
    return this.hasIssues || this.isExpiringSoon || this.isExpired || !this.qualityCheck;
  }

  getAttentionReasons(): string[] {
    const reasons: string[] = [];
    if (this.hasIssues) reasons.push('Item quality issues');
    if (this.isExpiringSoon) reasons.push('Expiring soon');
    if (this.isExpired) reasons.push('Expired item');
    if (!this.qualityCheck) reasons.push('Quality check pending');
    return reasons;
  }
}
