import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, OrderSource } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

export interface OrderFilters {
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

export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  filters?: OrderFilters;
  relations?: string[];
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll(options: OrderQueryOptions = {}): Promise<PaginatedOrders> {
    const { page = 1, limit = 20, filters = {}, relations = [] } = options;

    try {
      const queryBuilder = this.orderRepository.createQueryBuilder('order');

      // Add basic filters
      if (filters.search) {
        queryBuilder.andWhere(
          '(order.orderNumber ILIKE :search OR order.customerName ILIKE :search OR order.customerEmail ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.status) {
        queryBuilder.andWhere('order.status = :status', { status: filters.status });
      }

      if (filters.paymentStatus) {
        queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
      }

      if (filters.source) {
        queryBuilder.andWhere('order.source = :source', { source: filters.source });
      }

      if (filters.customerId) {
        queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
      }

      if (filters.customerEmail) {
        queryBuilder.andWhere('order.customerEmail ILIKE :customerEmail', { customerEmail: `%${filters.customerEmail}%` });
      }

      if (filters.orderNumber) {
        queryBuilder.andWhere('order.orderNumber ILIKE :orderNumber', { orderNumber: `%${filters.orderNumber}%` });
      }

      if (filters.minAmount !== undefined) {
        queryBuilder.andWhere('order.totalAmount >= :minAmount', { minAmount: filters.minAmount });
      }

      if (filters.maxAmount !== undefined) {
        queryBuilder.andWhere('order.totalAmount <= :maxAmount', { maxAmount: filters.maxAmount });
      }

      if (filters.isPaid !== undefined) {
        if (filters.isPaid) {
          queryBuilder.andWhere('order.paymentStatus = :paidStatus', { paidStatus: PaymentStatus.PAID });
        } else {
          queryBuilder.andWhere('order.paymentStatus != :paidStatus', { paidStatus: PaymentStatus.PAID });
        }
      }

      if (filters.isCompleted !== undefined) {
        if (filters.isCompleted) {
          queryBuilder.andWhere('order.status = :completedStatus', { completedStatus: OrderStatus.DELIVERED });
        } else {
          queryBuilder.andWhere('order.status != :completedStatus', { completedStatus: OrderStatus.DELIVERED });
        }
      }

      if (filters.isCancelled !== undefined) {
        if (filters.isCancelled) {
          queryBuilder.andWhere('order.status = :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED });
        } else {
          queryBuilder.andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED });
        }
      }

      // Date filters
      if (filters.dateFrom) {
        queryBuilder.andWhere('order.orderDate >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
      }

      if (filters.dateTo) {
        queryBuilder.andWhere('order.orderDate <= :dateTo', { dateTo: new Date(filters.dateTo) });
      }

      if (filters.shippedDateFrom) {
        queryBuilder.andWhere('order.shippedDate >= :shippedDateFrom', { shippedDateFrom: new Date(filters.shippedDateFrom) });
      }

      if (filters.shippedDateTo) {
        queryBuilder.andWhere('order.shippedDate <= :shippedDateTo', { shippedDateTo: new Date(filters.shippedDateTo) });
      }

      if (filters.deliveredDateFrom) {
        queryBuilder.andWhere('order.deliveredDate >= :deliveredDateFrom', { deliveredDateFrom: new Date(filters.deliveredDateFrom) });
      }

      if (filters.deliveredDateTo) {
        queryBuilder.andWhere('order.deliveredDate <= :deliveredDateTo', { deliveredDateTo: new Date(filters.deliveredDateTo) });
      }

      // Add relations if requested
      if (relations.length > 0) {
        relations.forEach(relation => {
          if (relation === 'items') {
            queryBuilder.leftJoinAndSelect('order.items', 'items');
          }
        });
      }

      // Apply pagination and ordering
      const skip = (page - 1) * limit;
      queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('order.orderDate', 'DESC');

      // Get count and items
      const [items, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string, relations: string[] = []): Promise<Order | null> {
    const options: any = { where: { id } };

    if (relations.length > 0) {
      const relationAliases: Record<string, string> = {
        'fulfillments.items': 'fulfillments.fulfillmentItems',
      };
      const allowedRelations = new Set([
        'items',
        'fulfillments',
        'fulfillments.fulfillmentItems',
      ]);
      const normalizedRelations = relations
        .map((relation) => relationAliases[relation] ?? relation)
        .filter((relation) => allowedRelations.has(relation));

      if (normalizedRelations.length > 0) {
        options.relations = normalizedRelations;
      }
    }

    return this.orderRepository.findOne(options);
  }

  async findByOrderNumber(orderNumber: string, relations: string[] = []): Promise<Order | null> {
    const options: any = { where: { orderNumber } };

    if (relations.length > 0) {
      const relationAliases: Record<string, string> = {
        'fulfillments.items': 'fulfillments.fulfillmentItems',
      };
      const allowedRelations = new Set([
        'items',
        'fulfillments',
        'fulfillments.fulfillmentItems',
      ]);
      const normalizedRelations = relations
        .map((relation) => relationAliases[relation] ?? relation)
        .filter((relation) => allowedRelations.has(relation));

      if (normalizedRelations.length > 0) {
        options.relations = normalizedRelations;
      }
    }

    return this.orderRepository.findOne(options);
  }

  async findByCustomerId(customerId: string, options: OrderQueryOptions = {}): Promise<PaginatedOrders> {
    return this.findAll({
      ...options,
      filters: {
        ...options.filters,
        customerId,
      },
    });
  }

  async findByCustomerEmail(customerEmail: string, options: OrderQueryOptions = {}): Promise<PaginatedOrders> {
    return this.findAll({
      ...options,
      filters: {
        ...options.filters,
        customerEmail,
      },
    });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async update(id: string, orderData: Partial<Order>): Promise<Order | null> {
    await this.orderRepository.update(id, orderData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    return result.affected > 0;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const updateData: Partial<Order> = { status };

    // Set specific dates based on status
    if (status === OrderStatus.SHIPPED) {
      updateData.shippedDate = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updateData.deliveredDate = new Date();
      if (!updateData.shippedDate) {
        updateData.shippedDate = new Date();
      }
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    } else if (status === OrderStatus.REFUNDED) {
      updateData.refundedAt = new Date();
    }

    await this.orderRepository.update(id, updateData);
    return this.findById(id);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order | null> {
    await this.orderRepository.update(id, { paymentStatus });
    return this.findById(id);
  }

  async updateTrackingNumber(id: string, trackingNumber: string): Promise<Order | null> {
    await this.orderRepository.update(id, { trackingNumber });
    return this.findById(id);
  }

  async getStats() {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    const orders = await queryBuilder.getMany();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const confirmedOrders = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;
    const processingOrders = orders.filter(o => o.status === OrderStatus.PROCESSING).length;
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED).length;
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;
    const refundedOrders = orders.filter(o => o.status === OrderStatus.REFUNDED).length;

    const paidOrders = orders.filter(o => o.paymentStatus === PaymentStatus.PAID).length;
    const pendingPaymentOrders = orders.filter(o => o.paymentStatus === PaymentStatus.PENDING).length;

    const totalRevenue = orders
      .filter(o => o.paymentStatus === PaymentStatus.PAID && o.status !== OrderStatus.CANCELLED)
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Last 30 days stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = orders.filter(o => o.orderDate >= thirtyDaysAgo);
    const recentRevenue = recentOrders
      .filter(o => o.paymentStatus === PaymentStatus.PAID && o.status !== OrderStatus.CANCELLED)
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Status breakdown
    const statusStats = {
      [OrderStatus.PENDING]: pendingOrders,
      [OrderStatus.CONFIRMED]: confirmedOrders,
      [OrderStatus.PROCESSING]: processingOrders,
      [OrderStatus.SHIPPED]: shippedOrders,
      [OrderStatus.DELIVERED]: deliveredOrders,
      [OrderStatus.CANCELLED]: cancelledOrders,
      [OrderStatus.REFUNDED]: refundedOrders,
    };

    // Payment status breakdown
    const paymentStats = {
      [PaymentStatus.PAID]: paidOrders,
      [PaymentStatus.PENDING]: pendingPaymentOrders,
      [PaymentStatus.FAILED]: orders.filter(o => o.paymentStatus === PaymentStatus.FAILED).length,
      [PaymentStatus.REFUNDED]: orders.filter(o => o.paymentStatus === PaymentStatus.REFUNDED).length,
    };

    // Source breakdown
    const sourceStats = orders.reduce((acc, order) => {
      acc[order.source] = (acc[order.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      averageOrderValue: Math.round(averageOrderValue),
      recentOrders: recentOrders.length,
      recentRevenue: Math.round(recentRevenue),
      statusStats,
      paymentStats,
      sourceStats,
      recentOrdersList: orders
        .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
        .slice(0, 10),
      topCustomers: this.getTopCustomers(orders),
    };
  }

  private getTopCustomers(orders: Order[]) {
    const customerStats = orders.reduce((acc, order) => {
      if (!acc[order.customerEmail]) {
        acc[order.customerEmail] = {
          email: order.customerEmail,
          name: order.customerName,
          orderCount: 0,
          totalSpent: 0,
        };
      }
      acc[order.customerEmail].orderCount++;
      if (order.paymentStatus === PaymentStatus.PAID && order.status !== OrderStatus.CANCELLED) {
        acc[order.customerEmail].totalSpent += Number(order.totalAmount);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(customerStats)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  async createOrderItem(itemData: Partial<OrderItem>): Promise<OrderItem> {
    const item = this.orderItemRepository.create(itemData);
    return this.orderItemRepository.save(item);
  }

  async updateOrderItem(id: string, itemData: Partial<OrderItem>): Promise<OrderItem | null> {
    await this.orderItemRepository.update(id, itemData);
    return this.orderItemRepository.findOne({ where: { id } });
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    const result = await this.orderItemRepository.delete(id);
    return result.affected > 0;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.orderItemRepository.find({
      where: { orderId },
      order: { sortOrder: 'ASC' },
    });
  }

  async deleteOrderItems(orderId: string): Promise<void> {
    await this.orderItemRepository.delete({ orderId });
  }

  async findOrderItemById(id: string, relations: string[] = []): Promise<OrderItem | null> {
    const findOptions: any = { where: { id } };

    if (relations.length > 0) {
      findOptions.relations = relations;
    }

    return this.orderItemRepository.findOne(findOptions);
  }

  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const prefix = `ORD${year}${month}${day}`;

    // Find the highest order number for today
    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.orderNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }
}
