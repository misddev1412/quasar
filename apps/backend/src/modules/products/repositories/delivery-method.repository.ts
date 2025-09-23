import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { DeliveryMethod, DeliveryMethodType, CostCalculationType } from '../entities/delivery-method.entity';

export interface CreateDeliveryMethodDto {
  name: string;
  type: DeliveryMethodType;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
  deliveryCost?: number;
  costCalculationType?: CostCalculationType;
  freeDeliveryThreshold?: number;
  minDeliveryTimeHours?: number;
  maxDeliveryTimeHours?: number;
  weightLimitKg?: number;
  sizeLimitCm?: string;
  coverageAreas?: string[];
  supportedPaymentMethods?: string[];
  providerName?: string;
  providerApiConfig?: Record<string, any>;
  trackingEnabled?: boolean;
  insuranceEnabled?: boolean;
  signatureRequired?: boolean;
  iconUrl?: string;
}

export interface UpdateDeliveryMethodDto {
  name?: string;
  type?: DeliveryMethodType;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
  deliveryCost?: number;
  costCalculationType?: CostCalculationType;
  freeDeliveryThreshold?: number;
  minDeliveryTimeHours?: number;
  maxDeliveryTimeHours?: number;
  weightLimitKg?: number;
  sizeLimitCm?: string;
  coverageAreas?: string[];
  supportedPaymentMethods?: string[];
  providerName?: string;
  providerApiConfig?: Record<string, any>;
  trackingEnabled?: boolean;
  insuranceEnabled?: boolean;
  signatureRequired?: boolean;
  iconUrl?: string;
}

export interface DeliveryMethodFilters {
  type?: DeliveryMethodType;
  isActive?: boolean;
  isDefault?: boolean;
  costCalculationType?: CostCalculationType;
  trackingEnabled?: boolean;
  insuranceEnabled?: boolean;
  signatureRequired?: boolean;
  search?: string;
}

@Injectable()
export class DeliveryMethodRepository {
  constructor(
    @InjectRepository(DeliveryMethod)
    private readonly repository: Repository<DeliveryMethod>,
  ) {}

  async create(data: CreateDeliveryMethodDto): Promise<DeliveryMethod> {
    const deliveryMethod = this.repository.create(data);
    return await this.repository.save(deliveryMethod);
  }

  async findAll(filters?: DeliveryMethodFilters): Promise<DeliveryMethod[]> {
    const queryBuilder = this.repository.createQueryBuilder('delivery_method')
      .where('delivery_method.deletedAt IS NULL');

    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('delivery_method.type = :type', { type: filters.type });
      }

      if (filters.isActive !== undefined) {
        queryBuilder.andWhere('delivery_method.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters.isDefault !== undefined) {
        queryBuilder.andWhere('delivery_method.isDefault = :isDefault', { isDefault: filters.isDefault });
      }

      if (filters.costCalculationType) {
        queryBuilder.andWhere('delivery_method.costCalculationType = :costCalculationType', { costCalculationType: filters.costCalculationType });
      }

      if (filters.trackingEnabled !== undefined) {
        queryBuilder.andWhere('delivery_method.trackingEnabled = :trackingEnabled', { trackingEnabled: filters.trackingEnabled });
      }

      if (filters.insuranceEnabled !== undefined) {
        queryBuilder.andWhere('delivery_method.insuranceEnabled = :insuranceEnabled', { insuranceEnabled: filters.insuranceEnabled });
      }

      if (filters.signatureRequired !== undefined) {
        queryBuilder.andWhere('delivery_method.signatureRequired = :signatureRequired', { signatureRequired: filters.signatureRequired });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(delivery_method.name ILIKE :search OR delivery_method.description ILIKE :search OR delivery_method.providerName ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    return await queryBuilder
      .orderBy('delivery_method.sortOrder', 'ASC')
      .addOrderBy('delivery_method.name', 'ASC')
      .getMany();
  }

  async findById(id: string): Promise<DeliveryMethod | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByType(type: DeliveryMethodType): Promise<DeliveryMethod[]> {
    return await this.repository.find({
      where: { type, deletedAt: IsNull() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActive(): Promise<DeliveryMethod[]> {
    return await this.repository.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findDefault(): Promise<DeliveryMethod | null> {
    return await this.repository.findOne({
      where: { isDefault: true, deletedAt: IsNull() },
    });
  }

  async findForOrderValue(orderAmount: number): Promise<DeliveryMethod[]> {
    const allMethods = await this.findActive();

    return allMethods.filter(method => {
      if (method.costCalculationType === CostCalculationType.FREE) {
        return true;
      }

      if (method.freeDeliveryThreshold && orderAmount >= method.freeDeliveryThreshold) {
        return true;
      }

      return true; // All methods are available, cost will be calculated separately
    });
  }

  async findByCoverageArea(area: string): Promise<DeliveryMethod[]> {
    const allMethods = await this.findActive();

    return allMethods.filter(method => method.isCoverageAreaSupported(area));
  }

  async update(id: string, data: UpdateDeliveryMethodDto): Promise<DeliveryMethod | null> {
    await this.repository.update({ id, deletedAt: IsNull() }, data);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete({ id, deletedAt: IsNull() });
    return (result.affected || 0) > 0;
  }

  async setDefault(id: string): Promise<DeliveryMethod | null> {
    // First, remove default from all other delivery methods
    await this.repository.update(
      { isDefault: true, deletedAt: IsNull() },
      { isDefault: false }
    );

    // Then set the specified delivery method as default
    await this.repository.update(
      { id, deletedAt: IsNull() },
      { isDefault: true }
    );

    return await this.findById(id);
  }

  async toggleActive(id: string): Promise<DeliveryMethod | null> {
    const deliveryMethod = await this.findById(id);
    if (!deliveryMethod) return null;

    await this.repository.update(
      { id, deletedAt: IsNull() },
      { isActive: !deliveryMethod.isActive }
    );

    return await this.findById(id);
  }

  async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    for (const item of items) {
      await this.repository.update(
        { id: item.id, deletedAt: IsNull() },
        { sortOrder: item.sortOrder }
      );
    }
  }

  async count(filters?: DeliveryMethodFilters): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('delivery_method')
      .where('delivery_method.deletedAt IS NULL');

    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('delivery_method.type = :type', { type: filters.type });
      }

      if (filters.isActive !== undefined) {
        queryBuilder.andWhere('delivery_method.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters.isDefault !== undefined) {
        queryBuilder.andWhere('delivery_method.isDefault = :isDefault', { isDefault: filters.isDefault });
      }

      if (filters.costCalculationType) {
        queryBuilder.andWhere('delivery_method.costCalculationType = :costCalculationType', { costCalculationType: filters.costCalculationType });
      }

      if (filters.trackingEnabled !== undefined) {
        queryBuilder.andWhere('delivery_method.trackingEnabled = :trackingEnabled', { trackingEnabled: filters.trackingEnabled });
      }

      if (filters.insuranceEnabled !== undefined) {
        queryBuilder.andWhere('delivery_method.insuranceEnabled = :insuranceEnabled', { insuranceEnabled: filters.insuranceEnabled });
      }

      if (filters.signatureRequired !== undefined) {
        queryBuilder.andWhere('delivery_method.signatureRequired = :signatureRequired', { signatureRequired: filters.signatureRequired });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(delivery_method.name ILIKE :search OR delivery_method.description ILIKE :search OR delivery_method.providerName ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    return await queryBuilder.getCount();
  }
}