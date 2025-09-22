import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer, CustomerStatus, CustomerType } from '../entities/customer.entity';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.repository.create(customerData);
    return this.repository.save(customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['orders'],
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { userId },
      relations: ['orders'],
    });
  }

  async findByCustomerNumber(customerNumber: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { customerNumber },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: CustomerStatus;
      type?: CustomerType;
      search?: string;
      hasOrders?: boolean;
      isVip?: boolean;
    },
  ): Promise<{ customers: Customer[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('customer');

    if (filters?.status) {
      queryBuilder.andWhere('customer.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('customer.type = :type', { type: filters.type });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.companyName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.hasOrders === true) {
      queryBuilder.andWhere('customer.totalOrders > 0');
    } else if (filters?.hasOrders === false) {
      queryBuilder.andWhere('customer.totalOrders = 0');
    }

    if (filters?.isVip) {
      queryBuilder.andWhere('(customer.totalSpent >= 1000 OR customer.totalOrders >= 10)');
    }

    const total = await queryBuilder.getCount();

    const customers = await queryBuilder
      .orderBy('customer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { customers, total };
  }

  async update(id: string, updateData: Partial<Customer>): Promise<Customer | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async getCustomerStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
    vipCustomers: number;
    averageOrderValue: number;
    averageCustomerLifetime: number;
  }> {
    const totalCustomers = await this.repository.count();

    const activeCustomers = await this.repository.count({
      where: { status: CustomerStatus.ACTIVE },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await this.repository
      .createQueryBuilder('customer')
      .where('customer.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    const vipCustomers = await this.repository
      .createQueryBuilder('customer')
      .where('customer.totalSpent >= 1000 OR customer.totalOrders >= 10')
      .getCount();

    const avgOrderValueResult = await this.repository
      .createQueryBuilder('customer')
      .select('AVG(customer.averageOrderValue)', 'avg')
      .where('customer.totalOrders > 0')
      .getRawOne();

    const avgLifetimeResult = await this.repository
      .createQueryBuilder('customer')
      .select('AVG(EXTRACT(DAY FROM (NOW() - customer.firstOrderDate)))', 'avg')
      .where('customer.firstOrderDate IS NOT NULL')
      .getRawOne();

    return {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      vipCustomers,
      averageOrderValue: parseFloat(avgOrderValueResult?.avg || '0'),
      averageCustomerLifetime: parseFloat(avgLifetimeResult?.avg || '0'),
    };
  }

  async findTopCustomers(limit: number = 10): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .orderBy('customer.totalSpent', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findRecentCustomers(limit: number = 10): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .orderBy('customer.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findInactiveCustomers(daysSinceLastOrder: number = 90): Promise<Customer[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastOrder);

    return this.repository
      .createQueryBuilder('customer')
      .where('customer.lastOrderDate < :cutoffDate OR customer.lastOrderDate IS NULL', {
        cutoffDate,
      })
      .andWhere('customer.status = :status', { status: CustomerStatus.ACTIVE })
      .orderBy('customer.lastOrderDate', 'ASC')
      .getMany();
  }

  async findCustomersByTag(tag: string): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .where(':tag = ANY(customer.customerTags)', { tag })
      .getMany();
  }

  async updateOrderStats(customerId: string, orderValue: number): Promise<void> {
    const customer = await this.findById(customerId);
    if (customer) {
      customer.updateOrderStats(orderValue);
      await this.repository.save(customer);
    }
  }

  async addLoyaltyPoints(customerId: string, points: number): Promise<void> {
    await this.repository.increment({ id: customerId }, 'loyaltyPoints', points);
  }

  async redeemLoyaltyPoints(customerId: string, points: number): Promise<boolean> {
    const customer = await this.findById(customerId);
    if (customer && customer.loyaltyPoints >= points) {
      await this.repository.decrement({ id: customerId }, 'loyaltyPoints', points);
      return true;
    }
    return false;
  }

  async generateCustomerNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `CUST${currentYear}`;

    const lastCustomer = await this.repository
      .createQueryBuilder('customer')
      .where('customer.customerNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('customer.customerNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastCustomer?.customerNumber) {
      const lastNumber = parseInt(lastCustomer.customerNumber.replace(prefix, ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  async searchCustomers(
    searchTerm: string,
    limit: number = 20,
  ): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .where(
        'customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search OR customer.companyName ILIKE :search',
        { search: `%${searchTerm}%` },
      )
      .orderBy('customer.totalSpent', 'DESC')
      .limit(limit)
      .getMany();
  }

  async bulkUpdateStatus(customerIds: string[], status: CustomerStatus): Promise<void> {
    await this.repository.update(customerIds, { status });
  }

  async getCustomerSegments(): Promise<{
    new: number;
    active: number;
    atRisk: number;
    churned: number;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // New customers (first order within last 30 days)
    const newCustomers = await this.repository
      .createQueryBuilder('customer')
      .where('customer.firstOrderDate >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    // Active customers (order within last 30 days)
    const activeCustomers = await this.repository
      .createQueryBuilder('customer')
      .where('customer.lastOrderDate >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    // At-risk customers (last order 30-90 days ago)
    const atRiskCustomers = await this.repository
      .createQueryBuilder('customer')
      .where('customer.lastOrderDate < :thirtyDaysAgo AND customer.lastOrderDate >= :ninetyDaysAgo', {
        thirtyDaysAgo,
        ninetyDaysAgo,
      })
      .getCount();

    // Churned customers (last order more than 90 days ago)
    const churnedCustomers = await this.repository
      .createQueryBuilder('customer')
      .where('customer.lastOrderDate < :ninetyDaysAgo', { ninetyDaysAgo })
      .getCount();

    return {
      new: newCustomers,
      active: activeCustomers,
      atRisk: atRiskCustomers,
      churned: churnedCustomers,
    };
  }
}