import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';
import { User } from '../../user/entities/user.entity';

export interface OrderFilters {
  page: number;
  limit: number;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ClientOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getUserOrders(filters: OrderFilters): Promise<PaginatedResult<Order>> {
    const { page, limit, status, paymentStatus, sortBy, sortOrder, userId, startDate, endDate } = filters;

    // Find customer associated with the user
    const customer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['orders'],
    });

    if (!customer) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.customerId = :customerId', { customerId: customer.id });

    // Apply status filter
    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere('order.status IN (:...status)', { status });
      } else {
        queryBuilder.andWhere('order.status = :status', { status });
      }
    }

    // Apply payment status filter
    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    // Apply date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('order.orderDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('order.orderDate <= :endDate', { endDate });
    }

    // Apply sorting
    const sortColumn = this.getSortColumn(sortBy);
    queryBuilder.orderBy(`order.${sortColumn}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.offset(offset).limit(limit);

    const orders = await queryBuilder.getMany();

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, userId: string): Promise<Order | null> {
    // Find customer associated with the user
    const customer = await this.customerRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      return null;
    }

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        customerId: customer.id,
      },
      relations: ['items', 'items.product', 'customer'],
    });

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string): Promise<void> {
    // Find customer associated with the user
    const customer = await this.customerRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        customerId: customer.id,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (!order.canCancel) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Update order status and add cancellation reason
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelledReason = reason;
    order.internalNotes = (order.internalNotes || '') + `\n\nCancelled by customer: ${reason}`;

    await this.orderRepository.save(order);
  }

  async getOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  }> {
    // Find customer associated with the user
    const customer = await this.customerRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
      };
    }

    const orders = await this.orderRepository.find({
      where: { customerId: customer.id },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const pendingOrders = orders.filter(order =>
      [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter(order => order.status === OrderStatus.CANCELLED).length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
    };
  }

  private getSortColumn(sortBy: string): string {
    switch (sortBy) {
      case 'totalAmount':
        return 'totalAmount';
      case 'status':
        return 'status';
      case 'orderDate':
      default:
        return 'orderDate';
    }
  }
}