import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { OrderFulfillment } from './order-fulfillment.entity';

export enum TrackingStatus {
  LABEL_CREATED = 'LABEL_CREATED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_ATTEMPT = 'FAILED_ATTEMPT',
  EXCEPTION = 'EXCEPTION',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
}

@Entity('delivery_tracking')
export class DeliveryTracking extends BaseEntity {
  @Expose()
  @Column({
    name: 'fulfillment_id',
    type: 'uuid',
  })
  fulfillmentId: string;

  @Expose()
  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 255,
  })
  trackingNumber: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: TrackingStatus,
    default: TrackingStatus.IN_TRANSIT,
  })
  status: TrackingStatus;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    name: 'event_date',
    type: 'timestamp',
    nullable: true,
  })
  eventDate?: Date;

  @Expose()
  @Column({
    name: 'estimated_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  estimatedDeliveryDate?: Date;

  @Expose()
  @Column({
    name: 'delivery_attempts',
    type: 'int',
    default: 0,
  })
  deliveryAttempts: number;

  @Expose()
  @Column({
    name: 'recipient_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  recipientName?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  relationship?: string;

  @Expose()
  @Column({
    name: 'photo_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  photoUrl?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'is_delivered',
    type: 'boolean',
    default: false,
  })
  isDelivered: boolean;

  @Expose()
  @Column({
    name: 'is_exception',
    type: 'boolean',
    default: false,
  })
  isException: boolean;

  @Expose()
  @Column({
    name: 'exception_reason',
    type: 'text',
    nullable: true,
  })
  exceptionReason?: string;

  // Relations
  @ManyToOne(() => OrderFulfillment, (fulfillment) => fulfillment.tracking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fulfillment_id' })
  fulfillment: OrderFulfillment;

  // Virtual properties
  get isLabelCreated(): boolean {
    return this.status === TrackingStatus.LABEL_CREATED;
  }

  get isPickupScheduled(): boolean {
    return this.status === TrackingStatus.PICKUP_SCHEDULED;
  }

  get isPickedUp(): boolean {
    return this.status === TrackingStatus.PICKED_UP;
  }

  get isInTransit(): boolean {
    return this.status === TrackingStatus.IN_TRANSIT;
  }

  get isOutForDelivery(): boolean {
    return this.status === TrackingStatus.OUT_FOR_DELIVERY;
  }

  get isFailedAttempt(): boolean {
    return this.status === TrackingStatus.FAILED_ATTEMPT;
  }

  get isExceptionStatus(): boolean {
    return this.status === TrackingStatus.EXCEPTION;
  }

  get isReturned(): boolean {
    return this.status === TrackingStatus.RETURNED;
  }

  get isLost(): boolean {
    return this.status === TrackingStatus.LOST;
  }

  get isActive(): boolean {
    return [TrackingStatus.LABEL_CREATED, TrackingStatus.PICKUP_SCHEDULED, TrackingStatus.PICKED_UP, TrackingStatus.IN_TRANSIT, TrackingStatus.OUT_FOR_DELIVERY].includes(this.status);
  }

  get isCompleted(): boolean {
    return this.isDelivered || this.isReturned;
  }

  get hasProblem(): boolean {
    return [TrackingStatus.FAILED_ATTEMPT, TrackingStatus.EXCEPTION, TrackingStatus.LOST].includes(this.status);
  }

  get needsAction(): boolean {
    return this.isFailedAttempt || this.isExceptionStatus;
  }

  get statusDisplay(): string {
    switch (this.status) {
      case TrackingStatus.LABEL_CREATED:
        return '📋 Label Created';
      case TrackingStatus.PICKUP_SCHEDULED:
        return '📅 Pickup Scheduled';
      case TrackingStatus.PICKED_UP:
        return '📦 Picked Up';
      case TrackingStatus.IN_TRANSIT:
        return '🚚 In Transit';
      case TrackingStatus.OUT_FOR_DELIVERY:
        return '🏠 Out for Delivery';
      case TrackingStatus.DELIVERED:
        return '✅ Delivered';
      case TrackingStatus.FAILED_ATTEMPT:
        return '❌ Failed Attempt';
      case TrackingStatus.EXCEPTION:
        return '⚠️ Exception';
      case TrackingStatus.RETURNED:
        return '↩️ Returned';
      case TrackingStatus.LOST:
        return '🔍 Lost';
      default:
        return '❓ Unknown';
    }
  }

  get statusColor(): string {
    switch (this.status) {
      case TrackingStatus.LABEL_CREATED:
        return 'blue';
      case TrackingStatus.PICKUP_SCHEDULED:
        return 'orange';
      case TrackingStatus.PICKED_UP:
        return 'indigo';
      case TrackingStatus.IN_TRANSIT:
        return 'blue';
      case TrackingStatus.OUT_FOR_DELIVERY:
        return 'green';
      case TrackingStatus.DELIVERED:
        return 'green';
      case TrackingStatus.FAILED_ATTEMPT:
        return 'red';
      case TrackingStatus.EXCEPTION:
        return 'red';
      case TrackingStatus.RETURNED:
        return 'yellow';
      case TrackingStatus.LOST:
        return 'red';
      default:
        return 'gray';
    }
  }

  get isRecent(): boolean {
    if (!this.eventDate) return false;
    const now = new Date();
    const hoursDiff = (now.getTime() - this.eventDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }

  get timeAgo(): string {
    if (!this.eventDate) return '';
    const now = new Date();
    const diffMs = now.getTime() - this.eventDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }

  get formattedEventDate(): string {
    if (!this.eventDate) return '';
    return this.eventDate.toLocaleString();
  }

  get formattedEstimatedDelivery(): string {
    if (!this.estimatedDeliveryDate) return 'Not estimated';
    return this.estimatedDeliveryDate.toLocaleDateString();
  }

  get isDeliveryOverdue(): boolean {
    if (!this.estimatedDeliveryDate || this.isDelivered) return false;
    return new Date() > this.estimatedDeliveryDate;
  }

  get daysOverdue(): number {
    if (!this.isDeliveryOverdue) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.estimatedDeliveryDate!.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get deliveryProgress(): number {
    // Simple progress calculation based on status
    const statusProgress: Record<TrackingStatus, number> = {
      [TrackingStatus.LABEL_CREATED]: 10,
      [TrackingStatus.PICKUP_SCHEDULED]: 20,
      [TrackingStatus.PICKED_UP]: 30,
      [TrackingStatus.IN_TRANSIT]: 50,
      [TrackingStatus.OUT_FOR_DELIVERY]: 80,
      [TrackingStatus.DELIVERED]: 100,
      [TrackingStatus.FAILED_ATTEMPT]: 60,
      [TrackingStatus.EXCEPTION]: 60,
      [TrackingStatus.RETURNED]: 100,
      [TrackingStatus.LOST]: 60,
    };
    return statusProgress[this.status] || 0;
  }

  get nextExpectedStatus(): TrackingStatus | null {
    switch (this.status) {
      case TrackingStatus.LABEL_CREATED:
        return TrackingStatus.PICKUP_SCHEDULED;
      case TrackingStatus.PICKUP_SCHEDULED:
        return TrackingStatus.PICKED_UP;
      case TrackingStatus.PICKED_UP:
        return TrackingStatus.IN_TRANSIT;
      case TrackingStatus.IN_TRANSIT:
        return TrackingStatus.OUT_FOR_DELIVERY;
      case TrackingStatus.OUT_FOR_DELIVERY:
        return TrackingStatus.DELIVERED;
      case TrackingStatus.FAILED_ATTEMPT:
        return TrackingStatus.OUT_FOR_DELIVERY;
      default:
        return null;
    }
  }

  getRecipientDisplay(): string {
    if (!this.recipientName) return 'Not specified';
    if (this.relationship) {
      return `${this.recipientName} (${this.relationship})`;
    }
    return this.recipientName;
  }

  hasPhoto(): boolean {
    return !!this.photoUrl;
  }

  hasException(): boolean {
    return this.isException || !!this.exceptionReason;
  }

  getExceptionDisplay(): string {
    return this.exceptionReason || 'Unknown exception';
  }

  requiresAttention(): boolean {
    return this.hasProblem || this.isDeliveryOverdue || this.hasException();
  }

  getAttentionReasons(): string[] {
    const reasons: string[] = [];
    if (this.hasProblem) reasons.push('Delivery issue detected');
    if (this.isDeliveryOverdue) reasons.push(`Delivery ${this.daysOverdue} days overdue`);
    if (this.hasException()) reasons.push('Exception occurred');
    return reasons;
  }

  canRetry(): boolean {
    return this.isFailedAttempt;
  }

  canInvestigate(): boolean {
    return this.isException || this.isLost;
  }

  getEventSummary(): string {
    let summary = this.statusDisplay;
    if (this.location) {
      summary += ` - ${this.location}`;
    }
    if (this.description) {
      summary += `: ${this.description}`;
    }
    return summary;
  }

  static createDeliveryEvent(
    fulfillmentId: string,
    trackingNumber: string,
    status: TrackingStatus,
    location?: string,
    description?: string,
    eventDate?: Date
  ): Partial<DeliveryTracking> {
    return {
      fulfillmentId,
      trackingNumber,
      status,
      location,
      description,
      eventDate: eventDate || new Date(),
      isDelivered: status === TrackingStatus.DELIVERED,
      isException: [TrackingStatus.EXCEPTION, TrackingStatus.FAILED_ATTEMPT, TrackingStatus.LOST].includes(status),
    };
  }
}
