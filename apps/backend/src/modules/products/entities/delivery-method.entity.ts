import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum DeliveryMethodType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  OVERNIGHT = 'OVERNIGHT',
  SAME_DAY = 'SAME_DAY',
  PICKUP = 'PICKUP',
  DIGITAL = 'DIGITAL',
  COURIER = 'COURIER',
  FREIGHT = 'FREIGHT',
  OTHER = 'OTHER',
}

export enum CostCalculationType {
  FIXED = 'FIXED',
  WEIGHT_BASED = 'WEIGHT_BASED',
  DISTANCE_BASED = 'DISTANCE_BASED',
  FREE = 'FREE',
}

@Entity('delivery_methods')
export class DeliveryMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'type', type: 'enum', enum: DeliveryMethodType, nullable: false })
  type: DeliveryMethodType;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false, nullable: false })
  isDefault: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0, nullable: false })
  sortOrder: number;

  @Column({ name: 'delivery_cost', type: 'decimal', precision: 10, scale: 2, default: 0, nullable: false })
  deliveryCost: number;

  @Column({ name: 'cost_calculation_type', type: 'enum', enum: CostCalculationType, default: CostCalculationType.FIXED, nullable: false })
  costCalculationType: CostCalculationType;

  @Column({ name: 'free_delivery_threshold', type: 'decimal', precision: 10, scale: 2, nullable: true })
  freeDeliveryThreshold?: number;

  @Column({ name: 'min_delivery_time_hours', type: 'int', nullable: true })
  minDeliveryTimeHours?: number;

  @Column({ name: 'max_delivery_time_hours', type: 'int', nullable: true })
  maxDeliveryTimeHours?: number;

  @Column({ name: 'weight_limit_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
  weightLimitKg?: number;

  @Column({ name: 'size_limit_cm', type: 'varchar', length: 50, nullable: true })
  sizeLimitCm?: string;

  @Column({ name: 'coverage_areas', type: 'json', nullable: true })
  coverageAreas?: string[];

  @Column({ name: 'supported_payment_methods', type: 'json', nullable: true })
  supportedPaymentMethods?: string[];

  @Column({ name: 'provider_name', type: 'varchar', length: 255, nullable: true })
  providerName?: string;

  @Column({ name: 'provider_api_config', type: 'json', nullable: true })
  providerApiConfig?: Record<string, any>;

  @Column({ name: 'tracking_enabled', type: 'boolean', default: false, nullable: false })
  trackingEnabled: boolean;

  @Column({ name: 'insurance_enabled', type: 'boolean', default: false, nullable: false })
  insuranceEnabled: boolean;

  @Column({ name: 'signature_required', type: 'boolean', default: false, nullable: false })
  signatureRequired: boolean;

  @Column({ name: 'use_third_party_integration', type: 'boolean', default: false, nullable: false })
  useThirdPartyIntegration: boolean;

  @Column({ name: 'icon_url', type: 'varchar', length: 512, nullable: true })
  iconUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Helper methods
  calculateDeliveryCost(orderAmount?: number, weight?: number, distance?: number): number {
    // For third-party integrations, cost calculation should be handled by external API
    if (this.useThirdPartyIntegration) {
      throw new Error('Delivery cost for third-party integration must be calculated via external API');
    }

    switch (this.costCalculationType) {
      case CostCalculationType.FREE:
        return 0;

      case CostCalculationType.FIXED:
        if (this.freeDeliveryThreshold && orderAmount && orderAmount >= this.freeDeliveryThreshold) {
          return 0;
        }
        return this.deliveryCost;

      case CostCalculationType.WEIGHT_BASED:
        if (!weight) return this.deliveryCost;
        return this.deliveryCost * Math.ceil(weight);

      case CostCalculationType.DISTANCE_BASED:
        if (!distance) return this.deliveryCost;
        return this.deliveryCost * distance;

      default:
        return this.deliveryCost;
    }
  }

  isWeightSupported(weight?: number): boolean {
    if (!weight || !this.weightLimitKg) return true;
    return weight <= this.weightLimitKg;
  }

  isCoverageAreaSupported(area: string): boolean {
    if (!this.coverageAreas || this.coverageAreas.length === 0) return true;
    return this.coverageAreas.some(coverageArea =>
      area.toLowerCase().includes(coverageArea.toLowerCase()) ||
      coverageArea.toLowerCase().includes(area.toLowerCase())
    );
  }

  isPaymentMethodSupported(paymentMethodId: string): boolean {
    if (!this.supportedPaymentMethods || this.supportedPaymentMethods.length === 0) return true;
    return this.supportedPaymentMethods.includes(paymentMethodId);
  }

  getEstimatedDeliveryTime(): string {
    // For third-party integrations, delivery time should be fetched from external API
    if (this.useThirdPartyIntegration) {
      return 'Calculated by third-party provider';
    }

    if (!this.minDeliveryTimeHours && !this.maxDeliveryTimeHours) {
      return 'Contact for delivery time';
    }

    const formatTime = (hours: number): string => {
      if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        const days = Math.ceil(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
    };

    if (this.minDeliveryTimeHours && this.maxDeliveryTimeHours) {
      return `${formatTime(this.minDeliveryTimeHours)} - ${formatTime(this.maxDeliveryTimeHours)}`;
    } else if (this.minDeliveryTimeHours) {
      return `At least ${formatTime(this.minDeliveryTimeHours)}`;
    } else if (this.maxDeliveryTimeHours) {
      return `Within ${formatTime(this.maxDeliveryTimeHours)}`;
    }

    return 'Contact for delivery time';
  }
}