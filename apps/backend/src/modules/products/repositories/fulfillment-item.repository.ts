import { Injectable } from '@nestjs/common';
import { Repository, Between, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FulfillmentItem, FulfillmentItemStatus } from '../entities/fulfillment-item.entity';

export interface FulfillmentItemFilters {
  fulfillmentId?: string;
  orderItemId?: string;
  itemStatus?: FulfillmentItemStatus;
  locationPickedFrom?: string;
  batchNumber?: string;
  qualityCheck?: boolean;
  hasIssues?: boolean;
  needsAttention?: boolean;
  qualityCheckBy?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedFulfillmentItems {
  items: FulfillmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FulfillmentItemRepository {
  constructor(
    @InjectRepository(FulfillmentItem)
    private readonly repository: Repository<FulfillmentItem>,
  ) {}

  async findAll(
    options: {
      page?: number;
      limit?: number;
      relations?: string[];
      filters?: FulfillmentItemFilters;
    } = {}
  ): Promise<PaginatedFulfillmentItems> {
    const {
      page = 1,
      limit = 20,
      relations = [],
      filters = {}
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('item');

    // Apply relations
    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    // Apply filters
    if (filters.fulfillmentId) {
      queryBuilder.andWhere('item.fulfillmentId = :fulfillmentId', { fulfillmentId: filters.fulfillmentId });
    }

    if (filters.orderItemId) {
      queryBuilder.andWhere('item.orderItemId = :orderItemId', { orderItemId: filters.orderItemId });
    }

    if (filters.itemStatus) {
      queryBuilder.andWhere('item.itemStatus = :itemStatus', { itemStatus: filters.itemStatus });
    }

    if (filters.locationPickedFrom) {
      queryBuilder.andWhere('item.locationPickedFrom = :locationPickedFrom', {
        locationPickedFrom: filters.locationPickedFrom
      });
    }

    if (filters.batchNumber) {
      queryBuilder.andWhere('item.batchNumber = :batchNumber', { batchNumber: filters.batchNumber });
    }

    if (filters.qualityCheck !== undefined) {
      queryBuilder.andWhere('item.qualityCheck = :qualityCheck', { qualityCheck: filters.qualityCheck });
    }

    if (filters.qualityCheckBy) {
      queryBuilder.andWhere('item.qualityCheckBy = :qualityCheckBy', { qualityCheckBy: filters.qualityCheckBy });
    }

    if (filters.expiryDateFrom && filters.expiryDateTo) {
      queryBuilder.andWhere('item.expiryDate BETWEEN :expiryDateFrom AND :expiryDateTo', {
        expiryDateFrom: filters.expiryDateFrom,
        expiryDateTo: filters.expiryDateTo,
      });
    } else if (filters.expiryDateFrom) {
      queryBuilder.andWhere('item.expiryDate >= :expiryDateFrom', {
        expiryDateFrom: filters.expiryDateFrom,
      });
    } else if (filters.expiryDateTo) {
      queryBuilder.andWhere('item.expiryDate <= :expiryDateTo', {
        expiryDateTo: filters.expiryDateTo,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(item.batchNumber ILIKE :search OR item.serialNumbers ILIKE :search OR item.conditionNotes ILIKE :search OR item.packagingNotes ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Filter items with issues
    if (filters.hasIssues !== undefined) {
      if (filters.hasIssues) {
        queryBuilder.andWhere('(item.damagedQuantity > 0 OR item.missingQuantity > 0)');
      } else {
        queryBuilder.andWhere('(item.damagedQuantity = 0 AND item.missingQuantity = 0)');
      }
    }

    // Filter items needing attention
    if (filters.needsAttention !== undefined) {
      if (filters.needsAttention) {
        queryBuilder.andWhere(
          '(item.damagedQuantity > 0 OR item.missingQuantity > 0 OR item.qualityCheck = false OR (item.expiryDate IS NOT NULL AND item.expiryDate <= :thirtyDaysFromNow))',
          { thirtyDaysFromNow: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        );
      } else {
        queryBuilder.andWhere(
          '(item.damagedQuantity = 0 AND item.missingQuantity = 0 AND item.qualityCheck = true AND (item.expiryDate IS NULL OR item.expiryDate > :thirtyDaysFromNow))',
          { thirtyDaysFromNow: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        );
      }
    }

    // Count total items
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by created date (newest first)
    queryBuilder.orderBy('item.createdAt', 'DESC');

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, relations: string[] = []): Promise<FulfillmentItem | null> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder.where('item.id = :id', { id }).getOne();
  }

  async findByFulfillmentId(fulfillmentId: string, relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.fulfillmentId = :fulfillmentId', { fulfillmentId })
      .orderBy('item.createdAt', 'ASC')
      .getMany();
  }

  async findByOrderItemId(orderItemId: string, relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.orderItemId = :orderItemId', { orderItemId })
      .orderBy('item.createdAt', 'ASC')
      .getMany();
  }

  async findByStatus(status: FulfillmentItemStatus, relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.itemStatus = :status', { status })
      .orderBy('item.createdAt', 'DESC')
      .getMany();
  }

  async findByBatchNumber(batchNumber: string, relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.batchNumber = :batchNumber', { batchNumber })
      .orderBy('item.createdAt', 'DESC')
      .getMany();
  }

  async findByLocation(location: string, relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.locationPickedFrom = :location', { location })
      .orderBy('item.createdAt', 'DESC')
      .getMany();
  }

  async findItemsNeedingQualityCheck(relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.qualityCheck = false')
      .andWhere('item.itemStatus NOT IN (:completedStatuses)', {
        completedStatuses: [FulfillmentItemStatus.DELIVERED, FulfillmentItemStatus.RETURNED, FulfillmentItemStatus.CANCELLED],
      })
      .orderBy('item.createdAt', 'ASC')
      .getMany();
  }

  async findExpiringItems(daysFromNow: number = 30, relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    const futureDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

    return queryBuilder
      .where('item.expiryDate BETWEEN :now AND :futureDate', {
        now: new Date(),
        futureDate,
      })
      .andWhere('item.itemStatus NOT IN (:completedStatuses)', {
        completedStatuses: [FulfillmentItemStatus.DELIVERED, FulfillmentItemStatus.RETURNED, FulfillmentItemStatus.CANCELLED],
      })
      .orderBy('item.expiryDate', 'ASC')
      .getMany();
  }

  async findExpiredItems(relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('item.expiryDate < :now', { now: new Date() })
      .andWhere('item.itemStatus NOT IN (:completedStatuses)', {
        completedStatuses: [FulfillmentItemStatus.DELIVERED, FulfillmentItemStatus.RETURNED, FulfillmentItemStatus.CANCELLED],
      })
      .orderBy('item.expiryDate', 'ASC')
      .getMany();
  }

  async findItemsWithIssues(relations: string[] = []): Promise<FulfillmentItem[]> {
    const queryBuilder = this.repository.createQueryBuilder('item');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('(item.damagedQuantity > 0 OR item.missingQuantity > 0)')
      .orderBy('item.createdAt', 'DESC')
      .getMany();
  }

  async create(itemData: Partial<FulfillmentItem>): Promise<FulfillmentItem> {
    const item = this.repository.create(itemData);
    return this.repository.save(item);
  }

  async update(id: string, updateData: Partial<FulfillmentItem>): Promise<FulfillmentItem | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateStatus(id: string, status: FulfillmentItemStatus): Promise<boolean> {
    const result = await this.repository.update(id, { itemStatus: status });
    return result.affected > 0;
  }

  async updateFulfilledQuantity(id: string, fulfilledQuantity: number): Promise<boolean> {
    const result = await this.repository.update(id, { fulfilledQuantity });
    return result.affected > 0;
  }

  async addDamagedQuantity(id: string, damagedQuantity: number): Promise<boolean> {
    // First get current item to add to existing damaged quantity
    const item = await this.findById(id);
    if (!item) return false;

    const newDamagedQuantity = item.damagedQuantity + damagedQuantity;
    const result = await this.repository.update(id, { damagedQuantity: newDamagedQuantity });
    return result.affected > 0;
  }

  async addMissingQuantity(id: string, missingQuantity: number): Promise<boolean> {
    // First get current item to add to existing missing quantity
    const item = await this.findById(id);
    if (!item) return false;

    const newMissingQuantity = item.missingQuantity + missingQuantity;
    const result = await this.repository.update(id, { missingQuantity: newMissingQuantity });
    return result.affected > 0;
  }

  async performQualityCheck(id: string, qualityCheckBy: string, conditionNotes?: string): Promise<boolean> {
    const updateData: Partial<FulfillmentItem> = {
      qualityCheck: true,
      qualityCheckBy,
      qualityCheckAt: new Date(),
    };

    if (conditionNotes) {
      updateData.conditionNotes = conditionNotes;
    }

    const result = await this.repository.update(id, updateData);
    return result.affected > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async deleteByFulfillmentId(fulfillmentId: string): Promise<boolean> {
    const result = await this.repository.delete({ fulfillmentId });
    return result.affected > 0;
  }

  async getStats(): Promise<{
    totalItems: number;
    pendingItems: number;
    pickedItems: number;
    packedItems: number;
    shippedItems: number;
    deliveredItems: number;
    damagedItems: number;
    missingItems: number;
    qualityCheckPending: number;
    expiringItems: number;
    expiredItems: number;
    itemsByStatus: Record<string, number>;
    itemsByLocation: Record<string, number>;
  }> {
    const [
      totalItems,
      pendingItems,
      pickedItems,
      packedItems,
      shippedItems,
      deliveredItems,
      qualityCheckPending,
    ] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { itemStatus: FulfillmentItemStatus.PENDING } }),
      this.repository.count({ where: { itemStatus: FulfillmentItemStatus.PICKED } }),
      this.repository.count({ where: { itemStatus: FulfillmentItemStatus.PACKED } }),
      this.repository.count({ where: { itemStatus: FulfillmentItemStatus.SHIPPED } }),
      this.repository.count({ where: { itemStatus: FulfillmentItemStatus.DELIVERED } }),
      this.repository.count({ where: { qualityCheck: false } }),
    ]);

    // Get damaged and missing items
    const [damagedItems, missingItems] = await Promise.all([
      this.repository.createQueryBuilder('item')
        .where('item.damagedQuantity > 0')
        .getCount(),
      this.repository.createQueryBuilder('item')
        .where('item.missingQuantity > 0')
        .getCount(),
    ]);

    // Get expiring and expired items
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [expiringItems, expiredItems] = await Promise.all([
      this.repository.createQueryBuilder('item')
        .where('item.expiryDate BETWEEN :now AND :futureDate', {
          now: new Date(),
          futureDate: thirtyDaysFromNow,
        })
        .getCount(),
      this.repository.createQueryBuilder('item')
        .where('item.expiryDate < :now', { now: new Date() })
        .getCount(),
    ]);

    // Get items by status
    const itemsByStatus = await this.repository
      .createQueryBuilder('item')
      .select('item.itemStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('item.itemStatus')
      .getRawMany()
      .then(results =>
        results.reduce((acc, { status, count }) => {
          acc[status] = parseInt(count);
          return acc;
        }, {} as Record<string, number>)
      );

    // Get items by location
    const itemsByLocation = await this.repository
      .createQueryBuilder('item')
      .select('item.locationPickedFrom', 'location')
      .addSelect('COUNT(*)', 'count')
      .where('item.locationPickedFrom IS NOT NULL')
      .groupBy('item.locationPickedFrom')
      .getRawMany()
      .then(results =>
        results.reduce((acc, { location, count }) => {
          acc[location] = parseInt(count);
          return acc;
        }, {} as Record<string, number>)
      );

    return {
      totalItems,
      pendingItems,
      pickedItems,
      packedItems,
      shippedItems,
      deliveredItems,
      damagedItems,
      missingItems,
      qualityCheckPending,
      expiringItems,
      expiredItems,
      itemsByStatus,
      itemsByLocation,
    };
  }

  async searchByBatchOrSerial(query: string): Promise<FulfillmentItem[]> {
    return this.repository.createQueryBuilder('item')
      .where('item.batchNumber ILIKE :query', { query: `%${query}%` })
      .orWhere('item.serialNumbers ILIKE :query', { query: `%${query}%` })
      .orderBy('item.createdAt', 'DESC')
      .limit(20)
      .getMany();
  }
}