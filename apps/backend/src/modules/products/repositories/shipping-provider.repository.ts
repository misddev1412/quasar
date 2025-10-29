import { Injectable } from '@nestjs/common';
import { Repository, Between, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShippingProvider } from '../entities/shipping-provider.entity';

export interface ShippingProviderFilters {
  search?: string;
  isActive?: boolean;
  hasTracking?: boolean;
  supportsDomestic?: boolean;
  supportsInternational?: boolean;
  supportsExpress?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedShippingProviders {
  items: ShippingProvider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ShippingProviderRepository {
  constructor(
    @InjectRepository(ShippingProvider)
    private readonly repository: Repository<ShippingProvider>,
  ) {}

  async findAll(
    options: {
      page?: number;
      limit?: number;
      relations?: string[];
      filters?: ShippingProviderFilters;
    } = {}
  ): Promise<PaginatedShippingProviders> {
    const {
      page = 1,
      limit = 20,
      relations = [],
      filters = {}
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('provider');

    // Apply relations
    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`provider.${relation}`, relation);
      });
    }

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(provider.name ILIKE :search OR provider.code ILIKE :search OR provider.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('provider.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.hasTracking !== undefined) {
      if (filters.hasTracking) {
        queryBuilder.andWhere('provider.trackingUrl IS NOT NULL');
      } else {
        queryBuilder.andWhere('provider.trackingUrl IS NULL');
      }
    }

    if (filters.supportsDomestic !== undefined) {
      queryBuilder.andWhere('provider.services ->> :domesticKey = :domesticValue', {
        domesticKey: 'domestic',
        domesticValue: filters.supportsDomestic.toString()
      });
    }

    if (filters.supportsInternational !== undefined) {
      queryBuilder.andWhere('provider.services ->> :internationalKey = :internationalValue', {
        internationalKey: 'international',
        internationalValue: filters.supportsInternational.toString()
      });
    }

    if (filters.supportsExpress !== undefined) {
      queryBuilder.andWhere('provider.services ->> :expressKey = :expressValue', {
        expressKey: 'express',
        expressValue: filters.supportsExpress.toString()
      });
    }

    // Count total items
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by name
    queryBuilder.orderBy('provider.name', 'ASC');

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, relations: string[] = []): Promise<ShippingProvider | null> {
    const queryBuilder = this.repository.createQueryBuilder('provider');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`provider.${relation}`, relation);
      });
    }

    return queryBuilder.where('provider.id = :id', { id }).getOne();
  }

  async findByCode(code: string, relations: string[] = []): Promise<ShippingProvider | null> {
    const queryBuilder = this.repository.createQueryBuilder('provider');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`provider.${relation}`, relation);
      });
    }

    return queryBuilder.where('provider.code = :code', { code }).getOne();
  }

  async findActiveProviders(): Promise<ShippingProvider[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findProvidersWithTracking(): Promise<ShippingProvider[]> {
    return this.repository.createQueryBuilder('provider')
      .where('provider.isActive = :isActive', { isActive: true })
      .andWhere('provider.trackingUrl IS NOT NULL')
      .orderBy('provider.name', 'ASC')
      .getMany();
  }

  async findProvidersForService(serviceType: string): Promise<ShippingProvider[]> {
    const queryBuilder = this.repository.createQueryBuilder('provider')
      .where('provider.isActive = :isActive', { isActive: true });

    switch (serviceType.toLowerCase()) {
      case 'domestic':
        queryBuilder.andWhere('provider.services ->> :domesticKey = :domesticValue', {
          domesticKey: 'domestic',
          domesticValue: 'true'
        });
        break;
      case 'international':
        queryBuilder.andWhere('provider.services ->> :internationalKey = :internationalValue', {
          internationalKey: 'international',
          internationalValue: 'true'
        });
        break;
      case 'express':
        queryBuilder.andWhere('provider.services ->> :expressKey = :expressValue', {
          expressKey: 'express',
          expressValue: 'true'
        });
        break;
    }

    return queryBuilder.orderBy('provider.name', 'ASC').getMany();
  }

  async create(providerData: Partial<ShippingProvider>): Promise<ShippingProvider> {
    const provider = this.repository.create(providerData);
    return this.repository.save(provider);
  }

  async update(id: string, updateData: Partial<ShippingProvider>): Promise<ShippingProvider | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async activate(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: true });
    return result.affected > 0;
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected > 0;
  }

  async getStats(): Promise<{
    totalProviders: number;
    activeProviders: number;
    providersWithTracking: number;
    domesticProviders: number;
    internationalProviders: number;
    expressProviders: number;
  }> {
    const [totalProviders, activeProviders, providersWithTracking] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { isActive: true } }),
      this.repository.count({ where: { trackingUrl: Like('%') } }),
    ]);

    const [domesticProviders, internationalProviders, expressProviders] = await Promise.all([
      this.repository.createQueryBuilder('provider')
        .where('provider.services ->> :domesticKey = :domesticValue', {
          domesticKey: 'domestic',
          domesticValue: 'true'
        })
        .getCount(),
      this.repository.createQueryBuilder('provider')
        .where('provider.services ->> :internationalKey = :internationalValue', {
          internationalKey: 'international',
          internationalValue: 'true'
        })
        .getCount(),
      this.repository.createQueryBuilder('provider')
        .where('provider.services ->> :expressKey = :expressValue', {
          expressKey: 'express',
          expressValue: 'true'
        })
        .getCount(),
    ]);

    return {
      totalProviders,
      activeProviders,
      providersWithTracking,
      domesticProviders,
      internationalProviders,
      expressProviders,
    };
  }

  async findByDeliveryTimeEstimate(minDays: number, maxDays: number): Promise<ShippingProvider[]> {
    return this.repository.createQueryBuilder('provider')
      .where('provider.isActive = :isActive', { isActive: true })
      .andWhere('provider.deliveryTimeEstimate BETWEEN :minDays AND :maxDays', {
        minDays,
        maxDays
      })
      .orderBy('provider.deliveryTimeEstimate', 'ASC')
      .getMany();
  }

  async searchByNameOrCode(query: string): Promise<ShippingProvider[]> {
    return this.repository.createQueryBuilder('provider')
      .where('provider.isActive = :isActive', { isActive: true })
      .andWhere(
        '(provider.name ILIKE :query OR provider.code ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('provider.name', 'ASC')
      .limit(10)
      .getMany();
  }

  async validateTrackingNumber(providerId: string, trackingNumber: string): Promise<boolean> {
    const provider = await this.findById(providerId);
    if (!provider || !provider.trackingUrl) return false;

    // Basic validation - could be extended with provider-specific validation
    return trackingNumber && trackingNumber.trim().length > 0;
  }

  async getProviderServices(providerId: string): Promise<any> {
    const provider = await this.findById(providerId);
    return provider?.services || null;
  }

  async updateProviderServices(providerId: string, services: any): Promise<boolean> {
    const result = await this.repository.update(providerId, { services });
    return result.affected > 0;
  }
}