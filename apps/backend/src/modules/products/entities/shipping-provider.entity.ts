import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { OrderFulfillment } from './order-fulfillment.entity';

export enum ShippingProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('shipping_providers')
export class ShippingProvider extends BaseEntity {
  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  code: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  website?: string;

  @Expose()
  @Column({
    name: 'tracking_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  trackingUrl?: string;

  @Expose()
  @Column({
    name: 'api_key',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  apiKey?: string;

  @Expose()
  @Column({
    name: 'api_secret',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  apiSecret?: string;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'delivery_time_estimate',
    type: 'int',
    nullable: true,
  })
  deliveryTimeEstimate?: number; // in days

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    name: 'contact_info',
    type: 'jsonb',
    nullable: true,
  })
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    supportHours?: string;
  };

  @Expose()
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  services?: {
    domestic: boolean;
    international: boolean;
    express: boolean;
    standard: boolean;
    economy: boolean;
    tracking: boolean;
    insurance: boolean;
    signature: boolean;
  };

  // Relations
  @OneToMany(() => OrderFulfillment, (fulfillment) => fulfillment.shippingProvider)
  fulfillments: OrderFulfillment[];

  // Virtual properties
  get isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  get hasTracking(): boolean {
    return !!this.trackingUrl;
  }

  get supportsDomestic(): boolean {
    return this.services?.domestic || false;
  }

  get supportsInternational(): boolean {
    return this.services?.international || false;
  }

  get supportsExpress(): boolean {
    return this.services?.express || false;
  }

  get supportsInsurance(): boolean {
    return this.services?.insurance || false;
  }

  get supportsSignature(): boolean {
    return this.services?.signature || false;
  }

  getTrackingUrl(trackingNumber?: string): string | null {
    if (!this.trackingUrl || !trackingNumber) return null;
    return this.trackingUrl.replace('{tracking_number}', trackingNumber);
  }

  getEstimatedDeliveryDate(): Date | null {
    if (!this.deliveryTimeEstimate) return null;
    const date = new Date();
    date.setDate(date.getDate() + this.deliveryTimeEstimate);
    return date;
  }

  getStatus(): ShippingProviderStatus {
    if (!this.isActive) return ShippingProviderStatus.INACTIVE;
    // Could add logic to detect maintenance status
    return ShippingProviderStatus.ACTIVE;
  }

  getServiceTypes(): string[] {
    const services: string[] = [];
    if (this.services?.standard) services.push('Standard');
    if (this.services?.express) services.push('Express');
    if (this.services?.economy) services.push('Economy');
    return services;
  }

  getFeatures(): string[] {
    const features: string[] = [];
    if (this.services?.tracking) features.push('Tracking');
    if (this.services?.insurance) features.push('Insurance');
    if (this.services?.signature) features.push('Signature Required');
    return features;
  }

  getContactInfo(): string {
    if (!this.contactInfo) return '';
    const info = this.contactInfo;
    const parts: string[] = [];
    if (info.email) parts.push(`Email: ${info.email}`);
    if (info.phone) parts.push(`Phone: ${info.phone}`);
    if (info.supportHours) parts.push(`Hours: ${info.supportHours}`);
    return parts.join(' | ');
  }

  getDisplayName(): string {
    return `${this.name} (${this.code})`;
  }

  isAvailableFor(serviceType?: string): boolean {
    if (!this.isActive) return false;
    if (!serviceType) return true;

    switch (serviceType.toLowerCase()) {
      case 'express':
        return this.supportsExpress;
      case 'standard':
        return this.services?.standard || false;
      case 'economy':
        return this.services?.economy || false;
      default:
        return true;
    }
  }
}