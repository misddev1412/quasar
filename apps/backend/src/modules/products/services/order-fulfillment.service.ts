import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { OrderFulfillmentRepository, OrderFulfillmentFilters, PaginatedOrderFulfillments } from '../repositories/order-fulfillment.repository';
import { FulfillmentItemRepository, FulfillmentItemFilters } from '../repositories/fulfillment-item.repository';
import { DeliveryTrackingRepository, DeliveryTrackingFilters } from '../repositories/delivery-tracking.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ShippingProviderRepository } from '../repositories/shipping-provider.repository';
import { OrderRepository as ProductOrderRepository } from '../repositories/order.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ApiStatusCodes } from '@shared';
import {
  OrderFulfillment,
  FulfillmentStatus,
  PriorityLevel,
  PackagingType,
} from '../entities/order-fulfillment.entity';
import {
  FulfillmentItem,
  FulfillmentItemStatus,
} from '../entities/fulfillment-item.entity';
import {
  DeliveryTracking,
  TrackingStatus,
} from '../entities/delivery-tracking.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ShippingProvider } from '../entities/shipping-provider.entity';

export interface CreateFulfillmentDto {
  orderId: string;
  priorityLevel?: PriorityLevel;
  shippingProviderId?: string;
  packagingType?: PackagingType;
  shippingAddress?: any;
  pickupAddress?: any;
  notes?: string;
  internalNotes?: string;
  signatureRequired?: boolean;
  deliveryInstructions?: string;
  giftWrap?: boolean;
  giftMessage?: string;
  items: CreateFulfillmentItemDto[];
}

export interface CreateFulfillmentItemDto {
  orderItemId: string;
  quantity: number;
  locationPickedFrom?: string;
  batchNumber?: string;
  serialNumbers?: string[];
  expiryDate?: Date;
  conditionNotes?: string;
  packagingNotes?: string;
  weight?: number;
  notes?: string;
}

export interface UpdateFulfillmentDto {
  status?: FulfillmentStatus;
  shippingProviderId?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  shippingCost?: number;
  insuranceCost?: number;
  packagingType?: PackagingType;
  packageWeight?: number;
  packageDimensions?: string;
  shippingAddress?: any;
  notes?: string;
  internalNotes?: string;
  deliveryInstructions?: string;
  priorityLevel?: PriorityLevel;
}

export interface AddTrackingEventDto {
  status: TrackingStatus;
  location?: string;
  description?: string;
  eventDate?: Date;
  estimatedDeliveryDate?: Date;
  recipientName?: string;
  relationship?: string;
  photoUrl?: string;
  notes?: string;
  exceptionReason?: string;
}

export interface FulfillmentStatsResponse {
  totalFulfillments: number;
  pendingFulfillments: number;
  processingFulfillments: number;
  shippedFulfillments: number;
  deliveredFulfillments: number;
  overdueFulfillments: number;
  fulfillmentByStatus: Record<string, number>;
  fulfillmentByPriority: Record<string, number>;
  recentFulfillments: OrderFulfillment[];
  topShippingProviders: any[];
}

@Injectable()
export class OrderFulfillmentService {
  constructor(
    private readonly fulfillmentRepository: OrderFulfillmentRepository,
    private readonly fulfillmentItemRepository: FulfillmentItemRepository,
    private readonly trackingRepository: DeliveryTrackingRepository,
    private readonly orderRepository: ProductOrderRepository,
    private readonly shippingProviderRepository: ShippingProviderRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async getAllFulfillments(
    filters: OrderFulfillmentFilters
  ): Promise<PaginatedOrderFulfillments> {
    try {
      return await this.fulfillmentRepository.findAll({
        page: filters.page,
        limit: filters.limit,
        relations: ['order', 'shippingProvider', 'fulfillmentItems', 'tracking'],
        filters,
      });
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve fulfillments: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getFulfillmentById(id: string): Promise<OrderFulfillment> {
    const fulfillment = await this.fulfillmentRepository.findById(id, [
      'order',
      'shippingProvider',
      'fulfillmentItems.orderItem.product',
      'fulfillmentItems.orderItem.productVariant',
      'fulfillmentItems.qualityCheckByUser',
      'tracking',
    ]);

    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    return fulfillment;
  }

  async getFulfillmentsByOrderId(orderId: string): Promise<OrderFulfillment[]> {
    return await this.fulfillmentRepository.findByOrderId(orderId, [
      'shippingProvider',
      'fulfillmentItems',
      'tracking',
    ]);
  }

  async getFulfillmentByTrackingNumber(trackingNumber: string): Promise<OrderFulfillment | null> {
    return await this.fulfillmentRepository.findByTrackingNumber(trackingNumber, [
      'order',
      'shippingProvider',
      'fulfillmentItems',
      'tracking',
    ]);
  }

  async createFulfillment(fulfillmentData: CreateFulfillmentDto): Promise<OrderFulfillment> {
    try {
      // Validate order
      const order = await this.orderRepository.findById(fulfillmentData.orderId);
      if (!order) {
        throw new NotFoundException(`Order with ID ${fulfillmentData.orderId} not found`);
      }

      // Check if order can be fulfilled
      if (!order.canCreateFulfillment) {
        throw new ConflictException('Order cannot be fulfilled in its current state');
      }

      // Validate shipping provider if provided
      let shippingProvider: ShippingProvider | null = null;
      if (fulfillmentData.shippingProviderId) {
        shippingProvider = await this.shippingProviderRepository.findById(
          fulfillmentData.shippingProviderId
        );
        if (!shippingProvider || !shippingProvider.isActive) {
          throw new BadRequestException('Invalid or inactive shipping provider');
        }
      }

      // Generate fulfillment number
      const fulfillmentNumber = await this.fulfillmentRepository.generateFulfillmentNumber();

      // Calculate total weight and package info
      let totalWeight = 0;
      let packageDimensions = '';

      // Validate order items and calculate totals
      const validatedItems = await Promise.all(
        fulfillmentData.items.map(async (item) => {
          const orderItem = await this.validateOrderItemForFulfillment(
            item.orderItemId,
            item.quantity
          );

          // Add to weight calculation
          if (item.weight || orderItem.weight) {
            totalWeight += (item.weight || orderItem.weight || 0) * item.quantity;
          }

          return {
            ...item,
            orderItem,
          };
        })
      );

      // Create fulfillment
      const fulfillment = await this.fulfillmentRepository.create({
        fulfillmentNumber,
        orderId: fulfillmentData.orderId,
        status: FulfillmentStatus.PENDING,
        shippingProviderId: fulfillmentData.shippingProviderId,
        packagingType: fulfillmentData.packagingType || PackagingType.BOX,
        packageWeight: totalWeight > 0 ? totalWeight : undefined,
        packageDimensions: packageDimensions || undefined,
        shippingAddress: fulfillmentData.shippingAddress || order.shippingAddress,
        priorityLevel: fulfillmentData.priorityLevel || PriorityLevel.NORMAL,
        signatureRequired: fulfillmentData.signatureRequired || false,
        deliveryInstructions: fulfillmentData.deliveryInstructions,
        giftWrap: fulfillmentData.giftWrap || false,
        giftMessage: fulfillmentData.giftMessage,
        notes: fulfillmentData.notes,
        internalNotes: fulfillmentData.internalNotes,
      });

      // Create fulfillment items
      for (const itemData of validatedItems) {
        await this.fulfillmentItemRepository.create({
          fulfillmentId: fulfillment.id,
          orderItemId: itemData.orderItemId,
          quantity: itemData.quantity,
          fulfilledQuantity: 0,
          locationPickedFrom: itemData.locationPickedFrom,
          batchNumber: itemData.batchNumber,
          serialNumbers: itemData.serialNumbers ? JSON.stringify(itemData.serialNumbers) : undefined,
          expiryDate: itemData.expiryDate,
          conditionNotes: itemData.conditionNotes,
          packagingNotes: itemData.packagingNotes,
          weight: itemData.weight,
          notes: itemData.notes,
          itemStatus: FulfillmentItemStatus.PENDING,
        });
      }

      // Update order status if needed
      if (order.status === OrderStatus.CONFIRMED) {
        await this.orderRepository.update(order.id, {
          status: OrderStatus.PROCESSING,
        });
      }

      return await this.getFulfillmentById(fulfillment.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to create fulfillment',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateFulfillment(id: string, updateData: UpdateFulfillmentDto): Promise<OrderFulfillment> {
    const existingFulfillment = await this.fulfillmentRepository.findById(id);
    if (!existingFulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    try {
      // Validate shipping provider if provided
      if (updateData.shippingProviderId) {
        const shippingProvider = await this.shippingProviderRepository.findById(
          updateData.shippingProviderId
        );
        if (!shippingProvider || !shippingProvider.isActive) {
          throw new BadRequestException('Invalid or inactive shipping provider');
        }
      }

      // Handle status-specific updates
      const dataToUpdate: Partial<OrderFulfillment> = { ...updateData };

      if (updateData.status) {
        if (updateData.status === FulfillmentStatus.SHIPPED && !existingFulfillment.trackingNumber) {
          throw new BadRequestException('Tracking number is required to mark fulfillment as shipped');
        }

        if (updateData.status === FulfillmentStatus.SHIPPED) {
          dataToUpdate.shippedDate = new Date();
        }

        if (updateData.status === FulfillmentStatus.CANCELLED) {
          dataToUpdate.cancelledAt = new Date();
        }
      }

      const updatedFulfillment = await this.fulfillmentRepository.update(id, dataToUpdate);
      if (!updatedFulfillment) {
        throw new NotFoundException('Fulfillment not found after update');
      }

      // Update order status if this is the only active fulfillment
      await this.updateOrderStatusBasedOnFulfillments(existingFulfillment.orderId);

      return await this.getFulfillmentById(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update fulfillment',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async addTrackingNumber(id: string, trackingNumber: string): Promise<OrderFulfillment> {
    const fulfillment = await this.fulfillmentRepository.findById(id);
    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    // Validate tracking number format with shipping provider
    if (fulfillment.shippingProviderId) {
      const isValid = await this.shippingProviderRepository.validateTrackingNumber(
        fulfillment.shippingProviderId,
        trackingNumber
      );
      if (!isValid) {
        throw new BadRequestException('Invalid tracking number format for selected shipping provider');
      }
    }

    const success = await this.fulfillmentRepository.addTrackingNumber(id, trackingNumber);
    if (!success) {
      throw new BadRequestException('Failed to add tracking number');
    }

    // Create initial tracking event
    await this.trackingRepository.create({
      fulfillmentId: id,
      trackingNumber,
      status: TrackingStatus.LABEL_CREATED,
      description: 'Shipping label created',
      eventDate: new Date(),
      isDelivered: false,
      isException: false,
    });

    return await this.getFulfillmentById(id);
  }

  async addTrackingEvent(
    fulfillmentId: string,
    eventData: AddTrackingEventDto
  ): Promise<DeliveryTracking> {
    const fulfillment = await this.fulfillmentRepository.findById(fulfillmentId);
    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    if (!fulfillment.trackingNumber) {
      throw new BadRequestException('Fulfillment must have a tracking number to add tracking events');
    }

    const trackingEvent = await this.trackingRepository.create({
      fulfillmentId,
      trackingNumber: fulfillment.trackingNumber,
      status: eventData.status,
      location: eventData.location,
      description: eventData.description,
      eventDate: eventData.eventDate || new Date(),
      estimatedDeliveryDate: eventData.estimatedDeliveryDate,
      recipientName: eventData.recipientName,
      relationship: eventData.relationship,
      photoUrl: eventData.photoUrl,
      notes: eventData.notes,
      exceptionReason: eventData.exceptionReason,
      isDelivered: eventData.status === TrackingStatus.DELIVERED,
      isException: [TrackingStatus.EXCEPTION, TrackingStatus.FAILED_ATTEMPT, TrackingStatus.LOST].includes(
        eventData.status
      ),
    });

    // Update fulfillment status based on tracking event
    await this.updateFulfillmentStatusFromTracking(fulfillmentId, eventData.status);

    return trackingEvent;
  }

  async markAsDelivered(
    id: string,
    actualDeliveryDate?: Date,
    recipientName?: string,
    photoUrl?: string
  ): Promise<OrderFulfillment> {
    const fulfillment = await this.fulfillmentRepository.findById(id);
    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    const success = await this.fulfillmentRepository.markAsDelivered(id, actualDeliveryDate);
    if (!success) {
      throw new BadRequestException('Failed to mark fulfillment as delivered');
    }

    // Add delivery tracking event
    if (fulfillment.trackingNumber) {
      await this.trackingRepository.create({
        fulfillmentId: id,
        trackingNumber: fulfillment.trackingNumber,
        status: TrackingStatus.DELIVERED,
        description: 'Package delivered',
        eventDate: actualDeliveryDate || new Date(),
        recipientName,
        photoUrl,
        isDelivered: true,
        isException: false,
      });
    }

    // Update fulfillment items as delivered
    const items = await this.fulfillmentItemRepository.findByFulfillmentId(id);
    for (const item of items) {
      await this.fulfillmentItemRepository.updateStatus(item.id, FulfillmentItemStatus.DELIVERED);
    }

    // Update order status if all fulfillments are delivered
    await this.updateOrderStatusBasedOnFulfillments(fulfillment.orderId);

    return await this.getFulfillmentById(id);
  }

  async cancelFulfillment(id: string, cancelReason: string): Promise<OrderFulfillment> {
    const fulfillment = await this.fulfillmentRepository.findById(id);
    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    if (!fulfillment.canCancel) {
      throw new BadRequestException('Fulfillment cannot be cancelled in its current status');
    }

    const success = await this.fulfillmentRepository.markAsCancelled(id, cancelReason);
    if (!success) {
      throw new BadRequestException('Failed to cancel fulfillment');
    }

    // Update fulfillment items as cancelled
    const items = await this.fulfillmentItemRepository.findByFulfillmentId(id);
    for (const item of items) {
      await this.fulfillmentItemRepository.updateStatus(item.id, FulfillmentItemStatus.CANCELLED);
    }

    return await this.getFulfillmentById(id);
  }

  async deleteFulfillment(id: string): Promise<boolean> {
    const fulfillment = await this.fulfillmentRepository.findById(id);
    if (!fulfillment) {
      throw new NotFoundException('Fulfillment not found');
    }

    if (!fulfillment.isPending) {
      throw new BadRequestException('Only pending fulfillments can be deleted');
    }

    try {
      // Delete tracking events
      await this.trackingRepository.deleteByFulfillmentId(id);

      // Delete fulfillment items
      await this.fulfillmentItemRepository.deleteByFulfillmentId(id);

      // Delete fulfillment
      return await this.fulfillmentRepository.delete(id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to delete fulfillment',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getFulfillmentStats(): Promise<FulfillmentStatsResponse> {
    try {
      const stats = await this.fulfillmentRepository.getStats();
      const recentFulfillments = await this.fulfillmentRepository.findAll({
        page: 1,
        limit: 10,
        relations: ['order', 'shippingProvider'],
      });

      const topShippingProviders = await this.getTopShippingProviders();

      return {
        ...stats,
        recentFulfillments: recentFulfillments.items,
        topShippingProviders,
      };
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve fulfillment statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getActiveFulfillments(): Promise<OrderFulfillment[]> {
    return await this.fulfillmentRepository.findActiveFulfillments([
      'order',
      'shippingProvider',
      'items',
    ]);
  }

  async getOverdueFulfillments(): Promise<OrderFulfillment[]> {
    return await this.fulfillmentRepository.findOverdueFulfillments([
      'order',
      'shippingProvider',
      'items',
    ]);
  }

  async searchFulfillments(query: string): Promise<OrderFulfillment[]> {
    return await this.fulfillmentRepository.searchByTrackingNumberOrFulfillmentNumber(query);
  }

  // Fulfillment Items Management Methods

  async updateFulfillmentItemStatus(
    itemId: string,
    status: FulfillmentItemStatus,
    notes?: string
  ): Promise<FulfillmentItem> {
    const item = await this.fulfillmentItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Fulfillment item not found');
    }

    const success = await this.fulfillmentItemRepository.updateStatus(itemId, status);
    if (!success) {
      throw new BadRequestException('Failed to update item status');
    }

    // Update fulfillment status based on item statuses
    await this.updateFulfillmentStatusFromItems(item.fulfillmentId);

    return await this.fulfillmentItemRepository.findById(itemId, [
      'orderItem.product',
      'orderItem.productVariant',
      'qualityCheckByUser',
    ]) as FulfillmentItem;
  }

  async updateItemFulfilledQuantity(
    itemId: string,
    fulfilledQuantity: number
  ): Promise<FulfillmentItem> {
    const item = await this.fulfillmentItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Fulfillment item not found');
    }

    if (fulfilledQuantity > item.quantity) {
      throw new BadRequestException('Fulfilled quantity cannot exceed ordered quantity');
    }

    const success = await this.fulfillmentItemRepository.updateFulfilledQuantity(itemId, fulfilledQuantity);
    if (!success) {
      throw new BadRequestException('Failed to update fulfilled quantity');
    }

    // Update fulfillment status based on item statuses
    await this.updateFulfillmentStatusFromItems(item.fulfillmentId);

    return await this.fulfillmentItemRepository.findById(itemId, [
      'orderItem.product',
      'orderItem.productVariant',
    ]) as FulfillmentItem;
  }

  async performItemQualityCheck(
    itemId: string,
    qualityCheckBy: string,
    conditionNotes?: string
  ): Promise<FulfillmentItem> {
    const item = await this.fulfillmentItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Fulfillment item not found');
    }

    if (item.qualityCheck) {
      throw new BadRequestException('Item has already undergone quality check');
    }

    const success = await this.fulfillmentItemRepository.performQualityCheck(itemId, qualityCheckBy, conditionNotes);
    if (!success) {
      throw new BadRequestException('Failed to perform quality check');
    }

    return await this.fulfillmentItemRepository.findById(itemId, [
      'orderItem.product',
      'orderItem.productVariant',
      'qualityCheckByUser',
    ]) as FulfillmentItem;
  }

  async addItemDamage(itemId: string, damagedQuantity: number, notes?: string): Promise<FulfillmentItem> {
    const item = await this.fulfillmentItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Fulfillment item not found');
    }

    const availableQuantity = item.quantity - item.damagedQuantity - item.missingQuantity;
    if (damagedQuantity > availableQuantity) {
      throw new BadRequestException('Cannot damage more items than available');
    }

    const success = await this.fulfillmentItemRepository.addDamagedQuantity(itemId, damagedQuantity);
    if (!success) {
      throw new BadRequestException('Failed to add damaged quantity');
    }

    if (notes) {
      await this.fulfillmentItemRepository.update(itemId, { notes });
    }

    return await this.fulfillmentItemRepository.findById(itemId, [
      'orderItem.product',
      'orderItem.productVariant',
    ]) as FulfillmentItem;
  }

  async addItemMissing(itemId: string, missingQuantity: number, notes?: string): Promise<FulfillmentItem> {
    const item = await this.fulfillmentItemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Fulfillment item not found');
    }

    const availableQuantity = item.quantity - item.damagedQuantity - item.missingQuantity;
    if (missingQuantity > availableQuantity) {
      throw new BadRequestException('Cannot mark more items as missing than available');
    }

    const success = await this.fulfillmentItemRepository.addMissingQuantity(itemId, missingQuantity);
    if (!success) {
      throw new BadRequestException('Failed to add missing quantity');
    }

    if (notes) {
      await this.fulfillmentItemRepository.update(itemId, { notes });
    }

    return await this.fulfillmentItemRepository.findById(itemId, [
      'orderItem.product',
      'orderItem.productVariant',
    ]) as FulfillmentItem;
  }

  async getFulfillmentItems(fulfillmentId: string): Promise<FulfillmentItem[]> {
    return await this.fulfillmentItemRepository.findByFulfillmentId(fulfillmentId, [
      'orderItem.product',
      'orderItem.productVariant',
      'qualityCheckByUser',
    ]);
  }

  async getItemsNeedingAttention(): Promise<FulfillmentItem[]> {
    return await this.fulfillmentItemRepository.findAll({
      relations: ['fulfillment', 'orderItem.product', 'orderItem.productVariant'],
      filters: { needsAttention: true },
    }).then(result => result.items);
  }

  async getQualityCheckPendingItems(): Promise<FulfillmentItem[]> {
    return await this.fulfillmentItemRepository.findItemsNeedingQualityCheck([
      'fulfillment',
      'orderItem.product',
      'orderItem.productVariant',
    ]);
  }

  // Private helper methods
  private async validateOrderItemForFulfillment(
    orderItemId: string,
    quantity: number
  ): Promise<OrderItem> {
    const orderItem = await this.orderRepository.findOrderItemById(orderItemId);
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${orderItemId} not found`);
    }

    const pendingQuantity = orderItem.pendingQuantity;
    if (quantity > pendingQuantity) {
      throw new ConflictException(
        `Cannot fulfill ${quantity} items. Only ${pendingQuantity} items are available for fulfillment`
      );
    }

    return orderItem;
  }

  private async updateFulfillmentStatusFromTracking(
    fulfillmentId: string,
    trackingStatus: TrackingStatus,
  ): Promise<void> {
    const fulfillment = await this.fulfillmentRepository.findById(fulfillmentId);
    if (!fulfillment) return;

    let newFulfillmentStatus: FulfillmentStatus | null = null;

    switch (trackingStatus) {
      case TrackingStatus.PICKED_UP:
        newFulfillmentStatus = FulfillmentStatus.SHIPPED;
        break;
      case TrackingStatus.IN_TRANSIT:
        newFulfillmentStatus = FulfillmentStatus.IN_TRANSIT;
        break;
      case TrackingStatus.OUT_FOR_DELIVERY:
        newFulfillmentStatus = FulfillmentStatus.OUT_FOR_DELIVERY;
        break;
      case TrackingStatus.DELIVERED:
        newFulfillmentStatus = FulfillmentStatus.DELIVERED;
        break;
    }

    if (newFulfillmentStatus && fulfillment.status !== newFulfillmentStatus) {
      await this.fulfillmentRepository.updateStatus(fulfillmentId, newFulfillmentStatus);
    }

    // Update order status if needed
    if (newFulfillmentStatus === FulfillmentStatus.DELIVERED) {
      await this.updateOrderStatusBasedOnFulfillments(fulfillment.orderId);
    }
  }

  private async updateFulfillmentStatusFromItems(fulfillmentId: string): Promise<void> {
    const fulfillment = await this.fulfillmentRepository.findById(fulfillmentId);
    if (!fulfillment) return;

    const items = await this.fulfillmentItemRepository.findByFulfillmentId(fulfillmentId);

    if (items.length === 0) return;

    const allItemsPicked = items.every(item => item.itemStatus === FulfillmentItemStatus.PICKED || item.isCompleted);
    const allItemsPacked = items.every(item => item.itemStatus === FulfillmentItemStatus.PACKED || item.isCompleted);
    const allItemsShipped = items.every(item => item.itemStatus === FulfillmentItemStatus.SHIPPED || item.isCompleted);
    const allItemsDelivered = items.every(item => item.itemStatus === FulfillmentItemStatus.DELIVERED);

    let newStatus: FulfillmentStatus | null = null;

    if (allItemsDelivered && fulfillment.status !== FulfillmentStatus.DELIVERED) {
      newStatus = FulfillmentStatus.DELIVERED;
    } else if (allItemsShipped && fulfillment.status !== FulfillmentStatus.SHIPPED) {
      newStatus = FulfillmentStatus.SHIPPED;
    } else if (allItemsPacked && fulfillment.status !== FulfillmentStatus.PACKED) {
      newStatus = FulfillmentStatus.PACKED;
    } else if (allItemsPicked && fulfillment.status === FulfillmentStatus.PENDING) {
      newStatus = FulfillmentStatus.PROCESSING;
    }

    if (newStatus) {
      await this.fulfillmentRepository.updateStatus(fulfillmentId, newStatus);

      // Update order status if fulfillment is delivered
      if (newStatus === FulfillmentStatus.DELIVERED) {
        await this.updateOrderStatusBasedOnFulfillments(fulfillment.orderId);
      }
    }
  }

  private async updateOrderStatusBasedOnFulfillments(orderId: string): Promise<void> {
    const fulfillments = await this.fulfillmentRepository.findByOrderId(orderId);
    const order = await this.orderRepository.findById(orderId);
    if (!order) return;

    const allDelivered = fulfillments.every(f => f.isDelivered);
    const allCancelledOrReturned = fulfillments.every(f => f.isCancelled || f.isReturned);
    const hasActiveFulfillments = fulfillments.some(f => !f.isCompleted && !f.isCancelled);

    let newStatus: OrderStatus | null = null;

    if (allDelivered && fulfillments.length > 0) {
      newStatus = OrderStatus.DELIVERED;
    } else if (allCancelledOrReturned && fulfillments.length > 0) {
      newStatus = OrderStatus.CANCELLED;
    } else if (hasActiveFulfillments) {
      newStatus = OrderStatus.PROCESSING;
    }

    if (newStatus && order.status !== newStatus) {
      await this.orderRepository.update(orderId, { status: newStatus });
    }
  }

  private async getTopShippingProviders(): Promise<any[]> {
    const fulfillments = await this.fulfillmentRepository.findAll({
      page: 1,
      limit: 1000,
      relations: ['shippingProvider'],
    });

    const providerStats = fulfillments.items.reduce((acc, fulfillment) => {
      if (fulfillment.shippingProvider) {
        const providerId = fulfillment.shippingProvider.id;
        if (!acc[providerId]) {
          acc[providerId] = {
            provider: fulfillment.shippingProvider,
            count: 0,
            successfulDeliveries: 0,
            totalShipments: 0,
          };
        }
        acc[providerId].count++;
        acc[providerId].totalShipments++;
        if (fulfillment.isDelivered) {
          acc[providerId].successfulDeliveries++;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(providerStats)
      .map((stat: any) => ({
        ...stat.provider,
        totalFulfillments: stat.count,
        successfulDeliveries: stat.successfulDeliveries,
        deliveryRate: stat.totalShipments > 0 ? (stat.successfulDeliveries / stat.totalShipments) * 100 : 0,
      }))
      .sort((a, b) => b.totalFulfillments - a.totalFulfillments)
      .slice(0, 10);
  }
}
