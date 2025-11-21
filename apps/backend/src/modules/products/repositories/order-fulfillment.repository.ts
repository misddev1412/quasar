import { Injectable } from '@nestjs/common';
import { Repository, Between, Like, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderFulfillment, FulfillmentStatus, PriorityLevel } from '../entities/order-fulfillment.entity';

export interface OrderFulfillmentFilters {
  orderId?: string;
  status?: FulfillmentStatus;
  priorityLevel?: PriorityLevel;
  shippingProviderId?: string;
  trackingNumber?: string;
  shippedDateFrom?: string;
  shippedDateTo?: string;
  estimatedDeliveryFrom?: string;
  estimatedDeliveryTo?: string;
  hasTrackingNumber?: boolean;
  isOverdue?: boolean;
  fulfilledBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrderFulfillments {
  items: OrderFulfillment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrderFulfillmentRepository {
  constructor(
    @InjectRepository(OrderFulfillment)
    private readonly repository: Repository<OrderFulfillment>,
  ) {}

  private parseDecimal(value: unknown, defaultValue?: number): number {
    if (value === null || value === undefined || value === '') {
      return defaultValue ?? 0;
    }

    if (typeof value === 'number') {
      return value;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return defaultValue ?? 0;
    }

    return parsed;
  }

  private parseNullableDecimal(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return value;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private normalizeDecimalFields(
    fulfillment: OrderFulfillment | null,
  ): OrderFulfillment | null {
    if (!fulfillment) {
      return fulfillment;
    }

    fulfillment.shippingCost = this.parseDecimal(
      fulfillment.shippingCost,
      0,
    );
    fulfillment.insuranceCost = this.parseDecimal(
      fulfillment.insuranceCost,
      0,
    );
    fulfillment.packageWeight = this.parseNullableDecimal(
      fulfillment.packageWeight,
    );

    if (fulfillment.fulfillmentItems?.length) {
      fulfillment.fulfillmentItems = fulfillment.fulfillmentItems.map(
        (item) => {
          item.weight = this.parseNullableDecimal(item.weight);
          return item;
        },
      );
    }

    return fulfillment;
  }

  private normalizeDecimalCollection(
    fulfillments: OrderFulfillment[],
  ): OrderFulfillment[] {
    return fulfillments.map(
      (item) => this.normalizeDecimalFields(item)!,
    );
  }

  private applyRelations(
    queryBuilder: SelectQueryBuilder<OrderFulfillment>,
    relations: string[] = [],
  ): void {
    if (!relations?.length) {
      return;
    }

    const joined = new Set<string>();
    const aliasMap = new Map<string, string>();
    const rootAlias = queryBuilder.alias || 'fulfillment';
    aliasMap.set('', rootAlias);

    relations.forEach((relationPath) => {
      if (!relationPath) {
        return;
      }

      const parts = relationPath.split('.');
      let parentKey = '';

      parts.forEach((part) => {
        const currentKey = parentKey ? `${parentKey}.${part}` : part;
        if (joined.has(currentKey)) {
          parentKey = currentKey;
          return;
        }

        const parentAlias = aliasMap.get(parentKey) ?? rootAlias;
        const alias = currentKey.replace(/\./g, '_');

        queryBuilder.leftJoinAndSelect(`${parentAlias}.${part}`, alias);

        joined.add(currentKey);
        aliasMap.set(currentKey, alias);
        parentKey = currentKey;
      });
    });
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      relations?: string[];
      filters?: OrderFulfillmentFilters;
    } = {}
  ): Promise<PaginatedOrderFulfillments> {
    const {
      page = 1,
      limit = 20,
      relations = [],
      filters = {}
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    // Apply relations
    this.applyRelations(queryBuilder, relations);

    // Apply filters
    if (filters.orderId) {
      queryBuilder.andWhere('fulfillment.orderId = :orderId', { orderId: filters.orderId });
    }

    if (filters.status) {
      queryBuilder.andWhere('fulfillment.status = :status', { status: filters.status });
    }

    if (filters.priorityLevel) {
      queryBuilder.andWhere('fulfillment.priorityLevel = :priorityLevel', { priorityLevel: filters.priorityLevel });
    }

    if (filters.shippingProviderId) {
      queryBuilder.andWhere('fulfillment.shippingProviderId = :shippingProviderId', {
        shippingProviderId: filters.shippingProviderId
      });
    }

    if (filters.trackingNumber) {
      queryBuilder.andWhere('fulfillment.trackingNumber ILIKE :trackingNumber', {
        trackingNumber: `%${filters.trackingNumber}%`
      });
    }

    if (filters.hasTrackingNumber !== undefined) {
      if (filters.hasTrackingNumber) {
        queryBuilder.andWhere('fulfillment.trackingNumber IS NOT NULL');
      } else {
        queryBuilder.andWhere('fulfillment.trackingNumber IS NULL');
      }
    }

    if (filters.shippedDateFrom && filters.shippedDateTo) {
      queryBuilder.andWhere('fulfillment.shippedDate BETWEEN :shippedDateFrom AND :shippedDateTo', {
        shippedDateFrom: filters.shippedDateFrom,
        shippedDateTo: filters.shippedDateTo,
      });
    } else if (filters.shippedDateFrom) {
      queryBuilder.andWhere('fulfillment.shippedDate >= :shippedDateFrom', {
        shippedDateFrom: filters.shippedDateFrom,
      });
    } else if (filters.shippedDateTo) {
      queryBuilder.andWhere('fulfillment.shippedDate <= :shippedDateTo', {
        shippedDateTo: filters.shippedDateTo,
      });
    }

    if (filters.estimatedDeliveryFrom && filters.estimatedDeliveryTo) {
      queryBuilder.andWhere('fulfillment.estimatedDeliveryDate BETWEEN :estimatedDeliveryFrom AND :estimatedDeliveryTo', {
        estimatedDeliveryFrom: filters.estimatedDeliveryFrom,
        estimatedDeliveryTo: filters.estimatedDeliveryTo,
      });
    } else if (filters.estimatedDeliveryFrom) {
      queryBuilder.andWhere('fulfillment.estimatedDeliveryDate >= :estimatedDeliveryFrom', {
        estimatedDeliveryFrom: filters.estimatedDeliveryFrom,
      });
    } else if (filters.estimatedDeliveryTo) {
      queryBuilder.andWhere('fulfillment.estimatedDeliveryDate <= :estimatedDeliveryTo', {
        estimatedDeliveryTo: filters.estimatedDeliveryTo,
      });
    }

    if (filters.fulfilledBy) {
      queryBuilder.andWhere('fulfillment.fulfilledBy = :fulfilledBy', { fulfilledBy: filters.fulfilledBy });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(fulfillment.fulfillmentNumber ILIKE :search OR fulfillment.trackingNumber ILIKE :search OR fulfillment.notes ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Filter overdue fulfillments
    if (filters.isOverdue !== undefined) {
      if (filters.isOverdue) {
        queryBuilder.andWhere(
          '(fulfillment.estimatedDeliveryDate < :now AND fulfillment.status NOT IN (:deliveredStatuses, :cancelledStatuses, :returnedStatuses))',
          {
            now: new Date(),
            deliveredStatuses: [FulfillmentStatus.DELIVERED],
            cancelledStatuses: [FulfillmentStatus.CANCELLED],
            returnedStatuses: [FulfillmentStatus.RETURNED],
          }
        );
      }
    }

    // Count total items
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by created date (newest first)
    queryBuilder.orderBy('fulfillment.createdAt', 'DESC');

    const items = this.normalizeDecimalCollection(await queryBuilder.getMany());

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, relations: string[] = []): Promise<OrderFulfillment | null> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    return this.normalizeDecimalFields(
      await queryBuilder.where('fulfillment.id = :id', { id }).getOne(),
    );
  }

  async findByFulfillmentNumber(fulfillmentNumber: string, relations: string[] = []): Promise<OrderFulfillment | null> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    return this.normalizeDecimalFields(
      await queryBuilder.where('fulfillment.fulfillmentNumber = :fulfillmentNumber', { fulfillmentNumber }).getOne(),
    );
  }

  async findByOrderId(orderId: string, relations: string[] = []): Promise<OrderFulfillment[]> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    const results = await queryBuilder
      .where('fulfillment.orderId = :orderId', { orderId })
      .orderBy('fulfillment.createdAt', 'ASC')
      .getMany();
    return this.normalizeDecimalCollection(results);
  }

  async findByTrackingNumber(trackingNumber: string, relations: string[] = []): Promise<OrderFulfillment | null> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    return this.normalizeDecimalFields(
      await queryBuilder
      .where('fulfillment.trackingNumber = :trackingNumber', { trackingNumber })
      .getOne(),
    );
  }

  async findByShippingProvider(shippingProviderId: string, relations: string[] = []): Promise<OrderFulfillment[]> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    const results = await queryBuilder
      .where('fulfillment.shippingProviderId = :shippingProviderId', { shippingProviderId })
      .orderBy('fulfillment.createdAt', 'DESC')
      .getMany();
    return this.normalizeDecimalCollection(results);
  }

  async findByStatus(status: FulfillmentStatus, relations: string[] = []): Promise<OrderFulfillment[]> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    const results = await queryBuilder
      .where('fulfillment.status = :status', { status })
      .orderBy('fulfillment.createdAt', 'DESC')
      .getMany();
    return this.normalizeDecimalCollection(results);
  }

  async findOverdueFulfillments(relations: string[] = []): Promise<OrderFulfillment[]> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    const results = await queryBuilder
      .where('fulfillment.estimatedDeliveryDate < :now', { now: new Date() })
      .andWhere('fulfillment.status NOT IN (:deliveredStatuses, :cancelledStatuses, :returnedStatuses)', {
        deliveredStatuses: [FulfillmentStatus.DELIVERED],
        cancelledStatuses: [FulfillmentStatus.CANCELLED],
        returnedStatuses: [FulfillmentStatus.RETURNED],
      })
      .orderBy('fulfillment.estimatedDeliveryDate', 'ASC')
      .getMany();
    return this.normalizeDecimalCollection(results);
  }

  async findActiveFulfillments(relations: string[] = []): Promise<OrderFulfillment[]> {
    const queryBuilder = this.repository.createQueryBuilder('fulfillment');

    this.applyRelations(queryBuilder, relations);

    const results = await queryBuilder
      .where('fulfillment.status IN (:activeStatuses)', {
        activeStatuses: [
          FulfillmentStatus.PENDING,
          FulfillmentStatus.PROCESSING,
          FulfillmentStatus.PACKED,
          FulfillmentStatus.SHIPPED,
          FulfillmentStatus.IN_TRANSIT,
          FulfillmentStatus.OUT_FOR_DELIVERY,
        ],
      })
      .orderBy('fulfillment.createdAt', 'ASC')
      .getMany();
    return this.normalizeDecimalCollection(results);
  }

  async create(fulfillmentData: Partial<OrderFulfillment>): Promise<OrderFulfillment> {
    const fulfillment = this.repository.create(fulfillmentData);
    return this.repository.save(fulfillment);
  }

  async update(id: string, updateData: Partial<OrderFulfillment>): Promise<OrderFulfillment | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateStatus(id: string, status: FulfillmentStatus): Promise<boolean> {
    const result = await this.repository.update(id, { status });
    return result.affected > 0;
  }

  async addTrackingNumber(id: string, trackingNumber: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      trackingNumber,
      shippedDate: new Date(),
      status: FulfillmentStatus.SHIPPED
    });
    return result.affected > 0;
  }

  async markAsDelivered(id: string, actualDeliveryDate?: Date): Promise<boolean> {
    const result = await this.repository.update(id, {
      status: FulfillmentStatus.DELIVERED,
      actualDeliveryDate: actualDeliveryDate || new Date(),
    });
    return result.affected > 0;
  }

  async markAsCancelled(id: string, cancelReason: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      status: FulfillmentStatus.CANCELLED,
      cancelReason,
      cancelledAt: new Date(),
    });
    return result.affected > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async generateFulfillmentNumber(): Promise<string> {
    const prefix = 'FUL';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Find the last fulfillment number for this month
    const lastFulfillment = await this.repository
      .createQueryBuilder('fulfillment')
      .where('fulfillment.fulfillmentNumber LIKE :pattern', { pattern: `${prefix}${year}${month}%` })
      .orderBy('fulfillment.fulfillmentNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastFulfillment) {
      const lastSequence = parseInt(lastFulfillment.fulfillmentNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
  }

  async getStats(): Promise<{
    totalFulfillments: number;
    pendingFulfillments: number;
    processingFulfillments: number;
    shippedFulfillments: number;
    deliveredFulfillments: number;
    overdueFulfillments: number;
    fulfillmentByStatus: Record<string, number>;
    fulfillmentByPriority: Record<string, number>;
  }> {
    const [
      totalFulfillments,
      pendingFulfillments,
      processingFulfillments,
      shippedFulfillments,
      deliveredFulfillments,
      overdueFulfillments,
    ] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: FulfillmentStatus.PENDING } }),
      this.repository.count({ where: { status: FulfillmentStatus.PROCESSING } }),
      this.repository.count({ where: { status: FulfillmentStatus.SHIPPED } }),
      this.repository.count({ where: { status: FulfillmentStatus.DELIVERED } }),
      this.repository.createQueryBuilder('fulfillment')
        .where('fulfillment.estimatedDeliveryDate < :now', { now: new Date() })
        .andWhere('fulfillment.status NOT IN (:completedStatuses)', {
          completedStatuses: [FulfillmentStatus.DELIVERED, FulfillmentStatus.CANCELLED, FulfillmentStatus.RETURNED],
        })
        .getCount(),
    ]);

    // Get fulfillment by status
    const fulfillmentByStatus = await this.repository
      .createQueryBuilder('fulfillment')
      .select('fulfillment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('fulfillment.status')
      .getRawMany()
      .then(results =>
        results.reduce((acc, { status, count }) => {
          acc[status] = parseInt(count);
          return acc;
        }, {} as Record<string, number>)
      );

    // Get fulfillment by priority
    const fulfillmentByPriority = await this.repository
      .createQueryBuilder('fulfillment')
      .select('fulfillment.priorityLevel', 'priorityLevel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('fulfillment.priorityLevel')
      .getRawMany()
      .then(results =>
        results.reduce((acc, { priorityLevel, count }) => {
          acc[priorityLevel] = parseInt(count);
          return acc;
        }, {} as Record<string, number>)
      );

    return {
      totalFulfillments,
      pendingFulfillments,
      processingFulfillments,
      shippedFulfillments,
      deliveredFulfillments,
      overdueFulfillments,
      fulfillmentByStatus,
      fulfillmentByPriority,
    };
  }

  async searchByTrackingNumberOrFulfillmentNumber(query: string): Promise<OrderFulfillment[]> {
    const results = await this.repository.createQueryBuilder('fulfillment')
      .where('fulfillment.trackingNumber ILIKE :query', { query: `%${query}%` })
      .orWhere('fulfillment.fulfillmentNumber ILIKE :query', { query: `%${query}%` })
      .orderBy('fulfillment.createdAt', 'DESC')
      .limit(20)
      .getMany();
    return this.normalizeDecimalCollection(results);
  }
}
