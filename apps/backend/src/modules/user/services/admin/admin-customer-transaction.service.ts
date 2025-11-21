import { Injectable } from '@nestjs/common';
import { CustomerTransactionRepository } from '../../repositories/customer-transaction.repository';
import {
  CreateCustomerTransactionDto,
  CustomerTransactionFilters,
  TransactionStatsFilters,
  UpdateTransactionStatusDto,
} from '../../dto/admin/admin-customer-transaction.dto';
import {
  CustomerTransaction,
  CustomerTransactionEntry,
  CustomerTransactionStatus,
  CustomerTransactionType,
  LedgerAccountType,
  LedgerEntryDirection,
  TransactionChannel,
} from '../../entities/customer-transaction.entity';
import { OrderRepository } from '../../../products/repositories/order.repository';
import { Order, OrderStatus, PaymentStatus } from '../../../products/entities/order.entity';

@Injectable()
export class AdminCustomerTransactionService {
  constructor(
    private readonly customerTransactionRepository: CustomerTransactionRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async listTransactions(filters: CustomerTransactionFilters): Promise<{
    items: CustomerTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const safePage = filters.page > 0 ? filters.page : 1;
    const safeLimit = Math.min(Math.max(filters.limit, 1), 100);

    const queryBuilder = this.customerTransactionRepository.createDetailedQueryBuilder('transaction');

    if (filters.search) {
      queryBuilder.andWhere(
        `(transaction.transactionCode ILIKE :search OR transaction.referenceId ILIKE :search OR transaction.description ILIKE :search OR customer.email ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)`,
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.direction) {
      queryBuilder.andWhere('transaction.impact_direction = :direction', { direction: filters.direction });
    }

    if (filters.currency) {
      queryBuilder.andWhere('transaction.currency = :currency', { currency: filters.currency });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('transaction.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.relatedEntityType) {
      queryBuilder.andWhere('transaction.relatedEntityType = :relatedEntityType', {
        relatedEntityType: filters.relatedEntityType,
      });
    }

    if (filters.relatedEntityId) {
      queryBuilder.andWhere('transaction.relatedEntityId = :relatedEntityId', {
        relatedEntityId: filters.relatedEntityId,
      });
    }

    if (filters.minAmount !== undefined) {
      queryBuilder.andWhere('transaction.impact_amount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.impact_amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
    if (dateFrom && !isNaN(dateFrom.getTime())) {
      queryBuilder.andWhere('transaction.createdAt >= :dateFrom', { dateFrom });
    }

    const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;
    if (dateTo && !isNaN(dateTo.getTime())) {
      queryBuilder.andWhere('transaction.createdAt <= :dateTo', { dateTo });
    }

    const sortColumnMap: Record<string, string> = {
      createdAt: 'transaction.createdAt',
      amount: 'transaction.impact_amount',
      status: 'transaction.status',
    };

    const sortBy = sortColumnMap[filters.sortBy ?? 'createdAt'] ?? 'transaction.createdAt';
    const sortOrder: 'ASC' | 'DESC' = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(sortBy, sortOrder);

    const [items, total] = await queryBuilder
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getTransactionById(id: string): Promise<CustomerTransaction> {
    const transaction = await this.customerTransactionRepository.findOne({
      where: { id },
      relations: ['customer', 'entries'],
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  async createTransaction(
    createDto: CreateCustomerTransactionDto,
    actorId?: string,
  ): Promise<CustomerTransaction> {
    const normalizedAmount = Math.abs(createDto.amount);
    const status = createDto.status ?? CustomerTransactionStatus.PENDING;
    const transactionCode = createDto.transactionCode ?? this.generateTransactionCode();
    const processedAt = createDto.processedAt ?? (status === CustomerTransactionStatus.COMPLETED ? new Date() : undefined);

    const transaction = this.customerTransactionRepository.create({
      customerId: createDto.customerId,
      type: createDto.type,
      status,
      impactDirection: createDto.direction,
      impactAmount: normalizedAmount,
      currency: createDto.currency ?? 'USD',
      description: createDto.description,
      referenceId: createDto.referenceId,
      channel: createDto.channel ?? TransactionChannel.ADMIN,
      metadata: createDto.metadata ?? {},
      relatedEntityType: createDto.relatedEntityType,
      relatedEntityId: createDto.relatedEntityId,
      processedAt,
      failureReason: createDto.failureReason,
      transactionCode,
      totalAmount: normalizedAmount,
      entryCount: 0,
      createdBy: actorId,
      updatedBy: actorId,
    });

    const entries = this.buildDoubleEntryEntries(
      transaction,
      normalizedAmount,
      transaction.currency,
      createDto.direction,
      createDto.counterAccount ?? LedgerAccountType.PLATFORM_CLEARING,
      transaction.description,
    );

    transaction.entries = entries;
    transaction.entryCount = entries.length;

    const savedTransaction = await this.customerTransactionRepository.save(transaction);

    await this.handleOrderPaymentSideEffects(savedTransaction);

    return savedTransaction;
  }

  async updateTransactionStatus(
    transactionId: string,
    updateDto: UpdateTransactionStatusDto,
    actorId?: string,
  ): Promise<CustomerTransaction> {
    const transaction = await this.getTransactionById(transactionId);

    transaction.status = updateDto.status;
    transaction.failureReason = updateDto.failureReason;
    transaction.processedAt = updateDto.processedAt ?? (updateDto.status === CustomerTransactionStatus.COMPLETED ? new Date() : transaction.processedAt);
    transaction.updatedBy = actorId;

    const updatedTransaction = await this.customerTransactionRepository.save(transaction);

    await this.handleOrderPaymentSideEffects(updatedTransaction);

    return updatedTransaction;
  }

  async getTransactionStats(filters?: TransactionStatsFilters) {
    const startDate = filters?.dateFrom ? new Date(filters.dateFrom) : undefined;
    const endDate = filters?.dateTo ? new Date(filters.dateTo) : undefined;

    return this.customerTransactionRepository.getAggregatedStats({
      currency: filters?.currency,
      startDate: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
      endDate: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
    });
  }

  private generateTransactionCode(): string {
    return `CTX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  private buildDoubleEntryEntries(
    transaction: CustomerTransaction,
    amount: number,
    currency: string,
    direction: LedgerEntryDirection,
    counterAccount: LedgerAccountType,
    description?: string,
  ): CustomerTransactionEntry[] {
    const customerEntry = new CustomerTransactionEntry();
    customerEntry.transaction = transaction;
    customerEntry.ledgerAccount = LedgerAccountType.CUSTOMER_BALANCE;
    customerEntry.entryDirection = direction;
    customerEntry.amount = amount;
    customerEntry.currency = currency;
    customerEntry.description = description;

    const counterEntry = new CustomerTransactionEntry();
    counterEntry.transaction = transaction;
    counterEntry.ledgerAccount = counterAccount;
    counterEntry.entryDirection = direction === LedgerEntryDirection.CREDIT ? LedgerEntryDirection.DEBIT : LedgerEntryDirection.CREDIT;
    counterEntry.amount = amount;
    counterEntry.currency = currency;
    counterEntry.description = description;

    return [customerEntry, counterEntry];
  }

  private async handleOrderPaymentSideEffects(transaction: CustomerTransaction): Promise<void> {
    if (
      !transaction ||
      transaction.type !== CustomerTransactionType.ORDER_PAYMENT ||
      transaction.relatedEntityType !== 'order' ||
      !transaction.relatedEntityId
    ) {
      return;
    }

    await this.syncOrderPaymentProgress(transaction.relatedEntityId);
  }

  private async syncOrderPaymentProgress(orderId: string): Promise<void> {
    if (!orderId) {
      return;
    }

    const [order, totals] = await Promise.all([
      this.orderRepository.findById(orderId),
      this.customerTransactionRepository.getCompletedOrderPaymentTotals(orderId),
    ]);

    if (!order) {
      return;
    }

    const normalizedPaid = this.normalizeCurrencyValue(totals.totalPaid);
    const normalizedOrderTotal = this.normalizeCurrencyValue(order.totalAmount);

    let paymentStatus = PaymentStatus.PENDING;
    if (normalizedPaid >= normalizedOrderTotal && normalizedOrderTotal > 0) {
      paymentStatus = PaymentStatus.PAID;
    } else if (normalizedPaid > 0) {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    const updateData: Partial<Order> = {
      amountPaid: normalizedPaid,
      paymentStatus,
    };

    if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
      updateData.status = OrderStatus.CONFIRMED;
    }

    await this.orderRepository.update(orderId, updateData);
  }

  private normalizeCurrencyValue(value?: number | string): number {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    return Math.round((numericValue + Number.EPSILON) * 100) / 100;
  }
}
