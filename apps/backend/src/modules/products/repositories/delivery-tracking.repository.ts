import { Injectable } from '@nestjs/common';
import { Repository, Between, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryTracking, TrackingStatus } from '../entities/delivery-tracking.entity';

export interface DeliveryTrackingFilters {
  fulfillmentId?: string;
  trackingNumber?: string;
  status?: TrackingStatus;
  location?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
  isDelivered?: boolean;
  isException?: boolean;
  requiresAttention?: boolean;
  recipientName?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDeliveryTracking {
  items: DeliveryTracking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class DeliveryTrackingRepository {
  constructor(
    @InjectRepository(DeliveryTracking)
    private readonly repository: Repository<DeliveryTracking>,
  ) {}

  async findAll(
    options: {
      page?: number;
      limit?: number;
      relations?: string[];
      filters?: DeliveryTrackingFilters;
    } = {}
  ): Promise<PaginatedDeliveryTracking> {
    const {
      page = 1,
      limit = 20,
      relations = [],
      filters = {}
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('tracking');

    // Apply relations
    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    // Apply filters
    if (filters.fulfillmentId) {
      queryBuilder.andWhere('tracking.fulfillmentId = :fulfillmentId', { fulfillmentId: filters.fulfillmentId });
    }

    if (filters.trackingNumber) {
      queryBuilder.andWhere('tracking.trackingNumber = :trackingNumber', { trackingNumber: filters.trackingNumber });
    }

    if (filters.status) {
      queryBuilder.andWhere('tracking.status = :status', { status: filters.status });
    }

    if (filters.location) {
      queryBuilder.andWhere('tracking.location ILIKE :location', { location: `%${filters.location}%` });
    }

    if (filters.recipientName) {
      queryBuilder.andWhere('tracking.recipientName ILIKE :recipientName', {
        recipientName: `%${filters.recipientName}%`
      });
    }

    if (filters.eventDateFrom && filters.eventDateTo) {
      queryBuilder.andWhere('tracking.eventDate BETWEEN :eventDateFrom AND :eventDateTo', {
        eventDateFrom: filters.eventDateFrom,
        eventDateTo: filters.eventDateTo,
      });
    } else if (filters.eventDateFrom) {
      queryBuilder.andWhere('tracking.eventDate >= :eventDateFrom', {
        eventDateFrom: filters.eventDateFrom,
      });
    } else if (filters.eventDateTo) {
      queryBuilder.andWhere('tracking.eventDate <= :eventDateTo', {
        eventDateTo: filters.eventDateTo,
      });
    }

    if (filters.isDelivered !== undefined) {
      queryBuilder.andWhere('tracking.isDelivered = :isDelivered', { isDelivered: filters.isDelivered });
    }

    if (filters.isException !== undefined) {
      queryBuilder.andWhere('tracking.isException = :isException', { isException: filters.isException });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(tracking.trackingNumber ILIKE :search OR tracking.location ILIKE :search OR tracking.description ILIKE :search OR tracking.recipientName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Filter tracking requiring attention
    if (filters.requiresAttention !== undefined) {
      if (filters.requiresAttention) {
        queryBuilder.andWhere(
          '(tracking.isException = true OR (tracking.estimatedDeliveryDate < :now AND tracking.isDelivered = false))',
          { now: new Date() }
        );
      } else {
        queryBuilder.andWhere(
          '(tracking.isException = false AND (tracking.estimatedDeliveryDate >= :now OR tracking.isDelivered = true))',
          { now: new Date() }
        );
      }
    }

    // Count total items
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by event date (newest first)
    queryBuilder.orderBy('tracking.eventDate', 'DESC');

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, relations: string[] = []): Promise<DeliveryTracking | null> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder.where('tracking.id = :id', { id }).getOne();
  }

  async findByFulfillmentId(fulfillmentId: string, relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.fulfillmentId = :fulfillmentId', { fulfillmentId })
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findByTrackingNumber(trackingNumber: string, relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.trackingNumber = :trackingNumber', { trackingNumber })
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findByStatus(status: TrackingStatus, relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.status = :status', { status })
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findByLocation(location: string, relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.location ILIKE :location', { location: `%${location}%` })
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findActiveTracking(relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.status IN (:activeStatuses)', {
        activeStatuses: [
          TrackingStatus.LABEL_CREATED,
          TrackingStatus.PICKUP_SCHEDULED,
          TrackingStatus.PICKED_UP,
          TrackingStatus.IN_TRANSIT,
          TrackingStatus.OUT_FOR_DELIVERY,
        ],
      })
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findProblematicTracking(relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.status IN (:problemStatuses)', {
        problemStatuses: [
          TrackingStatus.FAILED_ATTEMPT,
          TrackingStatus.EXCEPTION,
          TrackingStatus.LOST,
        ],
      })
      .orWhere('tracking.isException = true')
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findOverdueTracking(relations: string[] = []): Promise<DeliveryTracking[]> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.estimatedDeliveryDate < :now', { now: new Date() })
      .andWhere('tracking.isDelivered = false')
      .andWhere('tracking.status NOT IN (:completedStatuses)', {
        completedStatuses: [TrackingStatus.DELIVERED, TrackingStatus.RETURNED],
      })
      .orderBy('tracking.estimatedDeliveryDate', 'ASC')
      .getMany();
  }

  async findRecentEvents(hours: number = 24, relations: string[] = []): Promise<DeliveryTracking[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.eventDate >= :cutoffTime', { cutoffTime })
      .orderBy('tracking.eventDate', 'DESC')
      .getMany();
  }

  async findLatestTrackingEvent(fulfillmentId: string, relations: string[] = []): Promise<DeliveryTracking | null> {
    const queryBuilder = this.repository.createQueryBuilder('tracking');

    if (relations.length > 0) {
      relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`tracking.${relation}`, relation);
      });
    }

    return queryBuilder
      .where('tracking.fulfillmentId = :fulfillmentId', { fulfillmentId })
      .orderBy('tracking.eventDate', 'DESC')
      .limit(1)
      .getOne();
  }

  async create(trackingData: Partial<DeliveryTracking>): Promise<DeliveryTracking> {
    const tracking = this.repository.create(trackingData);
    return this.repository.save(tracking);
  }

  async update(id: string, updateData: Partial<DeliveryTracking>): Promise<DeliveryTracking | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateStatus(id: string, status: TrackingStatus): Promise<boolean> {
    const updateData: Partial<DeliveryTracking> = { status };

    // Update related fields based on status
    if (status === TrackingStatus.DELIVERED) {
      updateData.isDelivered = true;
    }

    if ([TrackingStatus.EXCEPTION, TrackingStatus.FAILED_ATTEMPT, TrackingStatus.LOST].includes(status)) {
      updateData.isException = true;
    }

    const result = await this.repository.update(id, updateData);
    return result.affected > 0;
  }

  async markAsDelivered(id: string, recipientName?: string, photoUrl?: string): Promise<boolean> {
    const updateData: Partial<DeliveryTracking> = {
      status: TrackingStatus.DELIVERED,
      isDelivered: true,
    };

    if (recipientName) {
      updateData.recipientName = recipientName;
    }

    if (photoUrl) {
      updateData.photoUrl = photoUrl;
    }

    const result = await this.repository.update(id, updateData);
    return result.affected > 0;
  }

  async markAsFailedAttempt(id: string, notes?: string): Promise<boolean> {
    const updateData: Partial<DeliveryTracking> = {
      status: TrackingStatus.FAILED_ATTEMPT,
      isException: true,
    };

    if (notes) {
      updateData.notes = notes;
    }

    // Increment delivery attempts
    const existingTracking = await this.findById(id);
    if (existingTracking) {
      updateData.deliveryAttempts = existingTracking.deliveryAttempts + 1;
    }

    const result = await this.repository.update(id, updateData);
    return result.affected > 0;
  }

  async markAsException(id: string, exceptionReason: string, notes?: string): Promise<boolean> {
    const updateData: Partial<DeliveryTracking> = {
      status: TrackingStatus.EXCEPTION,
      isException: true,
      exceptionReason,
    };

    if (notes) {
      updateData.notes = notes;
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
    totalTrackingEvents: number;
    activeTracking: number;
    deliveredTracking: number;
    problematicTracking: number;
    overdueTracking: number;
    trackingByStatus: Record<string, number>;
    recentEvents: number;
    deliverySuccessRate: number;
  }> {
    const [
      totalTrackingEvents,
      activeTracking,
      deliveredTracking,
      problematicTracking,
      overdueTracking,
      recentEvents,
    ] = await Promise.all([
      this.repository.count(),
      this.repository.createQueryBuilder('tracking')
        .where('tracking.status IN (:activeStatuses)', {
          activeStatuses: [
            TrackingStatus.LABEL_CREATED,
            TrackingStatus.PICKUP_SCHEDULED,
            TrackingStatus.PICKED_UP,
            TrackingStatus.IN_TRANSIT,
            TrackingStatus.OUT_FOR_DELIVERY,
          ],
        })
        .getCount(),
      this.repository.count({ where: { isDelivered: true } }),
      this.repository.createQueryBuilder('tracking')
        .where('tracking.isException = true')
        .getCount(),
      this.repository.createQueryBuilder('tracking')
        .where('tracking.estimatedDeliveryDate < :now', { now: new Date() })
        .andWhere('tracking.isDelivered = false')
        .getCount(),
      this.repository.createQueryBuilder('tracking')
        .where('tracking.eventDate >= :yesterday', {
          yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000),
        })
        .getCount(),
    ]);

    // Get tracking by status
    const trackingByStatus = await this.repository
      .createQueryBuilder('tracking')
      .select('tracking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tracking.status')
      .getRawMany()
      .then(results =>
        results.reduce((acc, { status, count }) => {
          acc[status] = parseInt(count);
          return acc;
        }, {} as Record<string, number>)
      );

    // Calculate delivery success rate
    const completedTracking = await this.repository
      .createQueryBuilder('tracking')
      .where('tracking.status IN (:completedStatuses)', {
        completedStatuses: [TrackingStatus.DELIVERED, TrackingStatus.RETURNED],
      })
      .getCount();

    const deliverySuccessRate = completedTracking > 0 ? (deliveredTracking / completedTracking) * 100 : 0;

    return {
      totalTrackingEvents,
      activeTracking,
      deliveredTracking,
      problematicTracking,
      overdueTracking,
      trackingByStatus,
      recentEvents,
      deliverySuccessRate: Math.round(deliverySuccessRate * 100) / 100,
    };
  }

  async searchByTrackingNumber(query: string): Promise<DeliveryTracking[]> {
    return this.repository.createQueryBuilder('tracking')
      .where('tracking.trackingNumber ILIKE :query', { query: `%${query}%` })
      .orderBy('tracking.eventDate', 'DESC')
      .limit(20)
      .getMany();
  }
}