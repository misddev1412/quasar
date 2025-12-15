import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { OrderRepository, OrderFilters, PaginatedOrders } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ProductVariantRepository } from '../repositories/product-variant.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Order, OrderStatus, PaymentStatus, OrderSource } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ApiStatusCodes } from '@shared';
import { DataExportService } from '../../export/services/data-export.service';
import { ExportFormat } from '../../export/entities/data-export-job.entity';
import { ORDER_EXPORT_COLUMNS } from '../export/order-export.columns';

export interface AdminOrderFilters {
  page: number;
  limit: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  source?: OrderSource;
  customerId?: string;
  customerEmail?: string;
  orderNumber?: string;
  minAmount?: number;
  maxAmount?: number;
  isPaid?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
  dateFrom?: string;
  dateTo?: string;
  shippedDateFrom?: string;
  shippedDateTo?: string;
  deliveredDateFrom?: string;
  deliveredDateTo?: string;
}

export interface OrderStatsResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: number;
  recentRevenue: number;
  statusStats: Record<string, number>;
  paymentStats: Record<string, number>;
  sourceStats: Record<string, number>;
  recentOrdersList: Order[];
  topCustomers: any[];
}

export interface CreateOrderDto {
  customerId?: string;
  customerEmail: string;
  customerPhone?: string;
  customerName: string;
  source?: OrderSource;
  billingAddress?: any;
  shippingAddress?: any;
  paymentMethod?: string;
  shippingMethod?: string;
  currency?: string;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  discountCode?: string;
  isGift?: boolean;
  giftMessage?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  productVariantId?: string;
  productName?: string;
  productSku?: string;
  variantName?: string;
  variantSku?: string;
  quantity: number;
  unitPrice?: number; // Made optional so it can be auto-retrieved
  discountAmount?: number;
  taxAmount?: number;
  productImage?: string;
  productAttributes?: Record<string, string>;
  isDigital?: boolean;
  weight?: number;
  dimensions?: string;
  requiresShipping?: boolean;
  isGiftCard?: boolean;
  giftCardCode?: string;
  notes?: string;
  sortOrder?: number;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  billingAddress?: any;
  shippingAddress?: any;
  paymentMethod?: string;
  paymentReference?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  discountCode?: string;
  discountAmount?: number;
  isGift?: boolean;
  giftMessage?: string;
  cancelledReason?: string;
  refundAmount?: number;
  refundReason?: string;
}

@Injectable()
export class AdminOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly responseHandler: ResponseService,
    private readonly dataExportService: DataExportService,
  ) {}

  async getProductPriceInfo(productId: string, productVariantId?: string) {
    if (productVariantId) {
      // Get variant price
      const variant = await this.productVariantRepository.findById(productVariantId);
      if (!variant) {
        throw new NotFoundException(`Product variant with ID ${productVariantId} not found`);
      }

      return {
        unitPrice: variant.price,
        productName: variant.name,
        productSku: variant.sku,
        variantName: variant.name,
        variantSku: variant.sku,
        productImage: variant.image,
        weight: variant.weight,
        dimensions: variant.dimensions,
        isActive: variant.isActive && variant.canPurchase,
      };
    } else {
      // Get product with variants to find the price
      const product = await this.productRepository.findById(productId, ['variants']);
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const variants = product.variants;
      if (!variants || variants.length === 0) {
        throw new NotFoundException(`Product ${productId} has no variants with pricing information`);
      }

      // Use the first active variant or the first variant as default
      const defaultVariant = variants.find(v => v.isActive) || variants[0];

      return {
        unitPrice: defaultVariant.price,
        productName: product.name,
        productSku: product.sku || defaultVariant.sku,
        variantName: defaultVariant.name,
        variantSku: defaultVariant.sku,
        productImage: defaultVariant.image || product.primaryImage,
        weight: defaultVariant.weight,
        dimensions: defaultVariant.dimensions,
        isActive: product.isPublished && defaultVariant.isActive,
      };
    }
  }

  async getAllOrders(filters: AdminOrderFilters): Promise<PaginatedOrders> {
    try {
      const result = await this.orderRepository.findAll({
        page: filters.page,
        limit: filters.limit,
        relations: ['items'],
        filters: {
          search: filters.search,
          status: filters.status,
          paymentStatus: filters.paymentStatus,
          source: filters.source,
          customerId: filters.customerId,
          customerEmail: filters.customerEmail,
          orderNumber: filters.orderNumber,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          isPaid: filters.isPaid,
          isCompleted: filters.isCompleted,
          isCancelled: filters.isCancelled,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          shippedDateFrom: filters.shippedDateFrom,
          shippedDateTo: filters.shippedDateTo,
          deliveredDateFrom: filters.deliveredDateFrom,
          deliveredDateTo: filters.deliveredDateTo,
        }
      });

      return result;
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve orders: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getOrderById(id: string, relations: string[] = ['items']): Promise<Order> {
    const order = await this.orderRepository.findById(id, relations);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrderByOrderNumber(orderNumber: string, relations: string[] = ['items']): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber, relations);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  private parseExportFilters(filters?: string | Record<string, any>): Record<string, any> | undefined {
    if (!filters) {
      return undefined;
    }

    if (typeof filters === 'object') {
      return filters;
    }

    try {
      return JSON.parse(filters);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Invalid filters payload',
        'INVALID_FILTERS'
      );
    }
  }

  private sanitizeExportFilters(filters?: Record<string, any>): OrderFilters | undefined {
    if (!filters) {
      return undefined;
    }

    const sanitized: OrderFilters = {};

    if (typeof filters.search === 'string' && filters.search.trim()) {
      sanitized.search = filters.search.trim();
    }

    const status = typeof filters.status === 'string' ? filters.status.toUpperCase() : undefined;
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      sanitized.status = status as OrderStatus;
    }

    const paymentStatus =
      typeof filters.paymentStatus === 'string' ? filters.paymentStatus.toUpperCase() : undefined;
    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      sanitized.paymentStatus = paymentStatus as PaymentStatus;
    }

    const source = typeof filters.source === 'string' ? filters.source.toUpperCase() : undefined;
    if (source && Object.values(OrderSource).includes(source as OrderSource)) {
      sanitized.source = source as OrderSource;
    }

    if (typeof filters.customerId === 'string' && filters.customerId.trim()) {
      sanitized.customerId = filters.customerId.trim();
    }

    if (typeof filters.customerEmail === 'string' && filters.customerEmail.trim()) {
      sanitized.customerEmail = filters.customerEmail.trim();
    }

    if (typeof filters.orderNumber === 'string' && filters.orderNumber.trim()) {
      sanitized.orderNumber = filters.orderNumber.trim();
    }

    const parseNumber = (value: unknown): number | undefined => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return undefined;
    };

    const minAmount = parseNumber(filters.minAmount);
    if (minAmount !== undefined) {
      sanitized.minAmount = minAmount;
    }

    const maxAmount = parseNumber(filters.maxAmount);
    if (maxAmount !== undefined) {
      sanitized.maxAmount = maxAmount;
    }

    const normalizeBoolean = (value: unknown): boolean | undefined => {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
      }
      return undefined;
    };

    const isPaid = normalizeBoolean(filters.isPaid);
    if (isPaid !== undefined) {
      sanitized.isPaid = isPaid;
    }

    const isCompleted = normalizeBoolean(filters.isCompleted);
    if (isCompleted !== undefined) {
      sanitized.isCompleted = isCompleted;
    }

    const isCancelled = normalizeBoolean(filters.isCancelled);
    if (isCancelled !== undefined) {
      sanitized.isCancelled = isCancelled;
    }

    const assignDate = (sourceValue: unknown): string | undefined => {
      if (typeof sourceValue === 'string' && sourceValue.trim()) {
        return sourceValue;
      }
      return undefined;
    };

    sanitized.dateFrom = assignDate(filters.dateFrom);
    sanitized.dateTo = assignDate(filters.dateTo);
    sanitized.shippedDateFrom = assignDate(filters.shippedDateFrom);
    sanitized.shippedDateTo = assignDate(filters.shippedDateTo);
    sanitized.deliveredDateFrom = assignDate(filters.deliveredDateFrom);
    sanitized.deliveredDateTo = assignDate(filters.deliveredDateTo);

    const hasFilters = Object.values(sanitized as Record<string, unknown>).some(
      (value) => value !== undefined && value !== null
    );

    return hasFilters ? sanitized : undefined;
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    try {
      // Generate order number
      const orderNumber = await this.orderRepository.generateOrderNumber();

      // Enrich order items with product price information
      const enrichedItems = await Promise.all(
        orderData.items.map(async (item) => {
          let finalItem = { ...item };

          // If unitPrice is not provided, get it from product/variant
          if (!item.unitPrice) {
            const priceInfo = await this.getProductPriceInfo(item.productId, item.productVariantId);

            finalItem = {
              ...finalItem,
              unitPrice: priceInfo.unitPrice,
              productName: finalItem.productName || priceInfo.productName,
              productSku: finalItem.productSku || priceInfo.productSku,
              variantName: finalItem.variantName || priceInfo.variantName,
              variantSku: finalItem.variantSku || priceInfo.variantSku,
              productImage: finalItem.productImage || priceInfo.productImage,
              weight: finalItem.weight || priceInfo.weight,
              dimensions: finalItem.dimensions || priceInfo.dimensions,
            };

            // Validate that the product/variant is available for purchase
            if (!priceInfo.isActive) {
              throw new ConflictException(`Product/variant ${item.productId}${item.productVariantId ? '/' + item.productVariantId : ''} is not available for purchase`);
            }
          }

          return finalItem;
        })
      );

      // Calculate totals using enriched items
      const subtotal = enrichedItems.reduce((sum, item) =>
        sum + (item.unitPrice * item.quantity), 0
      );

      const totalDiscountAmount = enrichedItems.reduce((sum, item) =>
        sum + (item.discountAmount || 0), 0
      );

      const totalTaxAmount = enrichedItems.reduce((sum, item) =>
        sum + (item.taxAmount || 0), 0
      );

      const netAmount = subtotal - totalDiscountAmount;
      const totalAmount = netAmount + totalTaxAmount;

      // Create order
      const order = await this.orderRepository.create({
        orderNumber,
        customerId: orderData.customerId,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerName: orderData.customerName,
        source: orderData.source || OrderSource.WEBSITE,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderDate: new Date(),
        subtotal,
        taxAmount: totalTaxAmount,
        shippingCost: 0, // Will be calculated separately
        discountAmount: totalDiscountAmount,
        totalAmount,
        amountPaid: 0,
        currency: orderData.currency || 'USD',
        billingAddress: orderData.billingAddress,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        shippingMethod: orderData.shippingMethod,
        notes: orderData.notes,
        customerNotes: orderData.customerNotes,
        internalNotes: orderData.internalNotes,
        discountCode: orderData.discountCode,
        isGift: orderData.isGift || false,
        giftMessage: orderData.giftMessage,
      });

      // Create order items using enriched data
      for (const [index, itemData] of enrichedItems.entries()) {
        const totalPrice = itemData.unitPrice * itemData.quantity;

        await this.orderRepository.createOrderItem({
          orderId: order.id,
          productId: itemData.productId,
          productVariantId: itemData.productVariantId,
          productName: itemData.productName,
          productSku: itemData.productSku,
          variantName: itemData.variantName,
          variantSku: itemData.variantSku,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          totalPrice,
          discountAmount: itemData.discountAmount || 0,
          taxAmount: itemData.taxAmount || 0,
          productImage: itemData.productImage,
          productAttributes: itemData.productAttributes,
          isDigital: itemData.isDigital || false,
          weight: itemData.weight,
          dimensions: itemData.dimensions,
          requiresShipping: itemData.requiresShipping !== false,
          isGiftCard: itemData.isGiftCard || false,
          giftCardCode: itemData.giftCardCode,
          notes: itemData.notes,
          sortOrder: itemData.sortOrder || index,
          fulfilledQuantity: 0,
          refundedQuantity: 0,
          returnedQuantity: 0,
        });
      }

      return this.getOrderById(order.id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to create order',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateOrder(id: string, orderData: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    try {
      const updateData: Partial<Order> = {
        ...orderData,
      };

      // Handle status-specific updates
      if (orderData.status) {
        if (orderData.status === OrderStatus.CANCELLED) {
          updateData.cancelledAt = new Date();
          updateData.cancelledReason = orderData.cancelledReason;
        } else if (orderData.status === OrderStatus.SHIPPED) {
          updateData.shippedDate = new Date();
        } else if (orderData.status === OrderStatus.DELIVERED) {
          updateData.deliveredDate = new Date();
          if (!existingOrder.shippedDate) {
            updateData.shippedDate = new Date();
          }
        } else if (orderData.status === OrderStatus.REFUNDED) {
          updateData.refundedAt = new Date();
          updateData.refundAmount = orderData.refundAmount;
          updateData.refundReason = orderData.refundReason;
          updateData.paymentStatus = PaymentStatus.REFUNDED;
        }
      }

      const updatedOrder = await this.orderRepository.update(id, updateData);
      if (!updatedOrder) {
        throw new NotFoundException('Order not found after update');
      }

      return updatedOrder;
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update order',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus, reason?: string): Promise<Order> {
    const updateData: UpdateOrderDto = { status };

    if (status === OrderStatus.CANCELLED) {
      updateData.cancelledReason = reason;
    } else if (status === OrderStatus.REFUNDED) {
      updateData.refundReason = reason;
    }

    return this.updateOrder(id, updateData);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentReference?: string): Promise<Order> {
    const updateData: UpdateOrderDto = {
      paymentStatus,
      paymentReference
    };

    return this.updateOrder(id, updateData);
  }

  async updateTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    return this.updateOrder(id, { trackingNumber });
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const order = await this.getOrderById(id);

    if (!order.canCancel) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Order cannot be cancelled in its current status',
        'BAD_REQUEST'
      );
    }

    return this.updateOrderStatus(id, OrderStatus.CANCELLED, reason);
  }

  async refundOrder(id: string, refundAmount?: number, reason?: string): Promise<Order> {
    const order = await this.getOrderById(id);

    if (!order.canRefund) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Order cannot be refunded',
        'BAD_REQUEST'
      );
    }

    const updateData: UpdateOrderDto = {
      status: OrderStatus.REFUNDED,
      refundAmount: refundAmount || order.totalAmount,
      refundReason: reason,
    };

    return this.updateOrder(id, updateData);
  }

  async shipOrder(id: string, trackingNumber?: string, shippingMethod?: string): Promise<Order> {
    const order = await this.getOrderById(id);

    if (!order.canShip) {
      throw this.responseHandler.createError(
        ApiStatusCodes.BAD_REQUEST,
        'Order cannot be shipped in its current status or payment status',
        'BAD_REQUEST'
      );
    }

    const updateData: UpdateOrderDto = {
      status: OrderStatus.SHIPPED,
      trackingNumber,
      shippingMethod,
    };

    return this.updateOrder(id, updateData);
  }

  async fulfillOrder(id: string): Promise<Order> {
    const order = await this.getOrderById(id, ['items']);

    // Mark all items as fulfilled
    if (order.items) {
      for (const item of order.items) {
        await this.orderRepository.updateOrderItem(item.id, {
          fulfilledQuantity: item.quantity,
        });
      }
    }

    return this.updateOrderStatus(id, OrderStatus.DELIVERED);
  }

  async deleteOrder(id: string): Promise<boolean> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    try {
      // Delete order items first
      await this.orderRepository.deleteOrderItems(id);

      // Delete order
      return await this.orderRepository.delete(id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to delete order',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getOrderStats(): Promise<OrderStatsResponse> {
    try {
      return await this.orderRepository.getStats();
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve order statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getOrdersByCustomer(customerId: string, filters: Partial<AdminOrderFilters> = {}): Promise<PaginatedOrders> {
    return this.orderRepository.findByCustomerId(customerId, {
      page: filters.page || 1,
      limit: filters.limit || 20,
      relations: ['items'],
      filters: {
        ...filters,
        customerId,
      },
    });
  }

  async getOrdersByCustomerEmail(customerEmail: string, filters: Partial<AdminOrderFilters> = {}): Promise<PaginatedOrders> {
    return this.orderRepository.findByCustomerEmail(customerEmail, {
      page: filters.page || 1,
      limit: filters.limit || 20,
      relations: ['items'],
      filters: {
        ...filters,
        customerEmail,
      },
    });
  }

  // Order item operations
  async updateOrderItem(itemId: string, itemData: Partial<OrderItem>): Promise<OrderItem> {
    const updatedItem = await this.orderRepository.updateOrderItem(itemId, itemData);
    if (!updatedItem) {
      throw new NotFoundException('Order item not found');
    }
    return updatedItem;
  }

  async deleteOrderItem(itemId: string): Promise<boolean> {
    return this.orderRepository.deleteOrderItem(itemId);
  }

  async fulfillOrderItem(itemId: string, quantity: number): Promise<OrderItem> {
    const item = await this.orderRepository.updateOrderItem(itemId, {
      fulfilledQuantity: quantity,
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    return item;
  }

  async refundOrderItem(itemId: string, quantity: number): Promise<OrderItem> {
    const item = await this.orderRepository.updateOrderItem(itemId, {
      refundedQuantity: quantity,
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    return item;
  }

  async exportOrders(format: string, filters?: string | Record<string, any>, requestedBy?: string) {
    const parsedFilters = this.parseExportFilters(filters);
    const sanitizedFilters = this.sanitizeExportFilters(parsedFilters);
    const resolvedFormat: ExportFormat = format === 'json' ? 'json' : 'csv';

    return this.dataExportService.requestExportJob({
      resource: 'orders',
      format: resolvedFormat,
      filters: sanitizedFilters as Record<string, any> | undefined,
      columns: ORDER_EXPORT_COLUMNS,
      options: {
        pageSize: 500,
      },
      requestedBy,
    });
  }

  async estimateOrderExport(filters?: string | Record<string, any>) {
    const parsedFilters = this.parseExportFilters(filters);
    const sanitizedFilters = this.sanitizeExportFilters(parsedFilters);
    const result = await this.orderRepository.findAll({
      page: 1,
      limit: 1,
      filters: sanitizedFilters || {},
    });

    return { total: result.total };
  }

  async listOrderExportJobs(limit = 10, requestedBy?: string, page = 1) {
    return this.dataExportService.listJobs('orders', {
      limit,
      page,
      requestedBy,
    });
  }
}
