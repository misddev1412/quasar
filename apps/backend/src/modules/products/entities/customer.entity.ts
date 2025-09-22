import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Order } from './order.entity';
import { AddressBook } from './address-book.entity';

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}

@Entity('customers')
export class Customer extends BaseEntity {
  @Expose()
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId?: string;

  @Expose()
  @Column({
    name: 'customer_number',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  customerNumber?: string;

  @Expose()
  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  firstName?: string;

  @Expose()
  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName?: string;

  @Expose()
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email?: string;

  @Expose()
  @Column({
    name: 'phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone?: string;

  @Expose()
  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  @Expose()
  @Column({
    name: 'gender',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  gender?: string;

  @Expose()
  @Column({
    name: 'company_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  companyName?: string;

  @Expose()
  @Column({
    name: 'job_title',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  jobTitle?: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  type: CustomerType;

  @Expose()
  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;


  @Expose()
  @Column({
    name: 'default_billing_address',
    type: 'jsonb',
    nullable: true,
  })
  defaultBillingAddress?: {
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
    name: 'default_shipping_address',
    type: 'jsonb',
    nullable: true,
  })
  defaultShippingAddress?: {
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
    name: 'marketing_consent',
    type: 'boolean',
    default: false,
  })
  marketingConsent: boolean;

  @Expose()
  @Column({
    name: 'newsletter_subscribed',
    type: 'boolean',
    default: false,
  })
  newsletterSubscribed: boolean;


  @Expose()
  @Column({
    name: 'total_orders',
    type: 'integer',
    default: 0,
  })
  totalOrders: number;

  @Expose()
  @Column({
    name: 'total_spent',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalSpent: number;

  @Expose()
  @Column({
    name: 'average_order_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  averageOrderValue: number;

  @Expose()
  @Column({
    name: 'first_order_date',
    type: 'timestamp',
    nullable: true,
  })
  firstOrderDate?: Date;

  @Expose()
  @Column({
    name: 'last_order_date',
    type: 'timestamp',
    nullable: true,
  })
  lastOrderDate?: Date;

  @Expose()
  @Column({
    name: 'customer_tags',
    type: 'text',
    array: true,
    nullable: true,
  })
  customerTags?: string[];

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'referral_source',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referralSource?: string;

  @Expose()
  @Column({
    name: 'loyalty_points',
    type: 'integer',
    default: 0,
  })
  loyaltyPoints: number;

  @Expose()
  @Column({
    name: 'tax_exempt',
    type: 'boolean',
    default: false,
  })
  taxExempt: boolean;

  @Expose()
  @Column({
    name: 'tax_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  taxId?: string;

  // Relations
  @OneToMany(() => Order, (order) => order.customerId)
  orders: Order[];

  @OneToMany(() => AddressBook, (addressBook) => addressBook.customer)
  addressBook: AddressBook[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get displayName(): string {
    if (this.type === CustomerType.BUSINESS && this.companyName) {
      return this.companyName;
    }
    return this.fullName || 'Unnamed Customer';
  }

  get isActive(): boolean {
    return this.status === CustomerStatus.ACTIVE;
  }

  get isBlocked(): boolean {
    return this.status === CustomerStatus.BLOCKED;
  }

  get hasOrders(): boolean {
    return this.totalOrders > 0;
  }

  get isVip(): boolean {
    return this.totalSpent >= 1000 || this.totalOrders >= 10;
  }

  get daysSinceLastOrder(): number {
    if (!this.lastOrderDate) return -1;
    const today = new Date();
    const diffTime = today.getTime() - this.lastOrderDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get customerLifetimeInDays(): number {
    if (!this.firstOrderDate) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.firstOrderDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  getFormattedTotalSpent(currency: string = 'USD'): string {
    return `${currency} ${this.totalSpent.toFixed(2)}`;
  }

  getFormattedAverageOrderValue(currency: string = 'USD'): string {
    return `${currency} ${this.averageOrderValue.toFixed(2)}`;
  }

  updateOrderStats(orderValue: number): void {
    this.totalOrders += 1;
    this.totalSpent += orderValue;
    this.averageOrderValue = this.totalSpent / this.totalOrders;
    this.lastOrderDate = new Date();

    if (!this.firstOrderDate) {
      this.firstOrderDate = new Date();
    }
  }

  addLoyaltyPoints(points: number): void {
    this.loyaltyPoints += points;
  }

  redeemLoyaltyPoints(points: number): boolean {
    if (this.loyaltyPoints >= points) {
      this.loyaltyPoints -= points;
      return true;
    }
    return false;
  }

  addCustomerTag(tag: string): void {
    if (!this.customerTags) {
      this.customerTags = [];
    }
    if (!this.customerTags.includes(tag)) {
      this.customerTags.push(tag);
    }
  }

  removeCustomerTag(tag: string): void {
    if (this.customerTags) {
      this.customerTags = this.customerTags.filter(t => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.customerTags?.includes(tag) || false;
  }

  getFullBillingAddress(): string {
    if (!this.defaultBillingAddress) return '';
    const addr = this.defaultBillingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
  }

  getFullShippingAddress(): string {
    if (!this.defaultShippingAddress) return '';
    const addr = this.defaultShippingAddress;
    return `${addr.firstName} ${addr.lastName}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
  }
}