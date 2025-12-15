import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseExportHandler, ExportPageResult } from '../../export/handlers/base-export.handler';
import { ExportHandlerRegistry } from '../../export/services/export-handler.registry';
import { OrderRepository, OrderFilters } from '../../products/repositories/order.repository';
import { Order, OrderStatus, PaymentStatus, OrderSource } from '../../products/entities/order.entity';
import { ORDER_EXPORT_COLUMNS } from '../../products/export/order-export.columns';

@Injectable()
export class OrderExportHandler extends BaseExportHandler<Record<string, any>, Order> implements OnModuleInit {
  readonly resource = 'orders';

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly registry: ExportHandlerRegistry,
  ) {
    super();
  }

  onModuleInit(): void {
    this.registry.register(this);
  }

  getColumns() {
    return ORDER_EXPORT_COLUMNS;
  }

  private normalizeFilters(filters?: Record<string, any>): OrderFilters {
    if (!filters) {
      return {};
    }

    const normalized: OrderFilters = {};

    if (typeof filters.search === 'string' && filters.search.trim()) {
      normalized.search = filters.search.trim();
    }

    const assignEnum = <T extends string>(value: unknown, values: readonly T[]): T | undefined => {
      if (typeof value === 'string') {
        const upper = value.toUpperCase();
        if (values.includes(upper as T)) {
          return upper as T;
        }
      }
      return undefined;
    };

    const assignString = (value: unknown): string | undefined => {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      return undefined;
    };

    const booleans = (value: unknown): boolean | undefined => {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
      }
      return undefined;
    };

    const numbers = (value: unknown): number | undefined => {
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

    normalized.status = assignEnum(filters.status, Object.values(OrderStatus));
    normalized.paymentStatus = assignEnum(filters.paymentStatus, Object.values(PaymentStatus));
    normalized.source = assignEnum(filters.source, Object.values(OrderSource));

    normalized.customerId = assignString(filters.customerId);
    normalized.customerEmail = assignString(filters.customerEmail);
    normalized.orderNumber = assignString(filters.orderNumber);
    normalized.dateFrom = assignString(filters.dateFrom);
    normalized.dateTo = assignString(filters.dateTo);
    normalized.shippedDateFrom = assignString(filters.shippedDateFrom);
    normalized.shippedDateTo = assignString(filters.shippedDateTo);
    normalized.deliveredDateFrom = assignString(filters.deliveredDateFrom);
    normalized.deliveredDateTo = assignString(filters.deliveredDateTo);

    normalized.minAmount = numbers(filters.minAmount);
    normalized.maxAmount = numbers(filters.maxAmount);

    normalized.isPaid = booleans(filters.isPaid);
    normalized.isCompleted = booleans(filters.isCompleted);
    normalized.isCancelled = booleans(filters.isCancelled);

    return normalized;
  }

  async fetchPage(
    params: { page: number; limit: number },
    filters?: Record<string, any>,
  ): Promise<ExportPageResult<Order>> {
    const normalizedFilters = this.normalizeFilters(filters);
    const result = await this.orderRepository.findAll({
      page: params.page,
      limit: params.limit,
      filters: normalizedFilters,
    });

    return {
      items: result.items,
      total: result.total,
    };
  }

  transformRecord(order: Order): Record<string, any> {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      source: order.source,
      totalAmount: Number(order.totalAmount),
      amountPaid: Number(order.amountPaid),
      currency: order.currency,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      shippingCountry: order.shippingAddress?.country,
      shippingCity: order.shippingAddress?.city,
      orderDate: order.orderDate,
      shippedDate: order.shippedDate,
      deliveredDate: order.deliveredDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
