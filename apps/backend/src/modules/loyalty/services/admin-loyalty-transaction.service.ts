import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LoyaltyTransactionRepository } from '../repositories/loyalty-transaction.repository';
import { LoyaltyTransaction, TransactionType } from '../entities/loyalty-transaction.entity';
import { ResponseService } from '@backend/modules/shared/services/response.service';

export interface CreateLoyaltyTransactionDto {
  customerId: string;
  points: number;
  type: TransactionType;
  description: string;
  orderId?: string;
  rewardId?: string;
  balanceAfter: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface GetLoyaltyTransactionsDto {
  page: number;
  limit: number;
  search?: string;
  customerId?: string;
  type?: TransactionType;
  orderId?: string;
  rewardId?: string;
  sortBy?: 'createdAt' | 'points' | 'balanceAfter';
  sortOrder?: 'ASC' | 'DESC';
  createdFrom?: string;
  createdTo?: string;
}

@Injectable()
export class AdminLoyaltyTransactionService {
  constructor(
    @Inject(LoyaltyTransactionRepository)
    private readonly loyaltyTransactionRepository: LoyaltyTransactionRepository,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  async getAllTransactions(filters: GetLoyaltyTransactionsDto) {
    const {
      page,
      limit,
      search,
      customerId,
      type,
      orderId,
      rewardId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      createdFrom,
      createdTo,
    } = filters;

    const queryBuilder = this.loyaltyTransactionRepository.createQueryBuilder('transaction');

    if (search) {
      queryBuilder.where(
        '(transaction.description ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (customerId) {
      queryBuilder.andWhere('transaction.customerId = :customerId', { customerId });
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (orderId) {
      queryBuilder.andWhere('transaction.orderId = :orderId', { orderId });
    }

    if (rewardId) {
      queryBuilder.andWhere('transaction.rewardId = :rewardId', { rewardId });
    }

    if (createdFrom) {
      queryBuilder.andWhere('transaction.createdAt >= :createdFrom', { createdFrom });
    }

    if (createdTo) {
      queryBuilder.andWhere('transaction.createdAt <= :createdTo', { createdTo });
    }

    const [items, total] = await queryBuilder
      .orderBy(`transaction.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransactionById(id: string): Promise<LoyaltyTransaction> {
    const transaction = await this.loyaltyTransactionRepository.findOne({
      where: { id },
      relations: ['customer', 'order', 'reward'],
    });

    if (!transaction) {
      throw new NotFoundException('Loyalty transaction not found');
    }

    return transaction;
  }

  async createTransaction(createTransactionDto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction> {
    const transaction = this.loyaltyTransactionRepository.create({
      ...createTransactionDto,
      metadata: createTransactionDto.metadata || {},
    });

    return this.loyaltyTransactionRepository.save(transaction);
  }

  async createEarningTransaction(
    customerId: string,
    points: number,
    description: string,
    orderId?: string,
    expiresAt?: Date,
    metadata?: Record<string, any>
  ): Promise<LoyaltyTransaction> {
    // Get current balance
    const currentBalance = await this.loyaltyTransactionRepository.getCustomerCurrentBalance(customerId);
    const balanceAfter = currentBalance + points;

    return this.createTransaction({
      customerId,
      points,
      type: TransactionType.EARNED,
      description,
      orderId,
      balanceAfter,
      expiresAt,
      metadata,
    });
  }

  async createRedemptionTransaction(
    customerId: string,
    points: number,
    description: string,
    rewardId?: string,
    metadata?: Record<string, any>
  ): Promise<LoyaltyTransaction> {
    // Get current balance
    const currentBalance = await this.loyaltyTransactionRepository.getCustomerCurrentBalance(customerId);
    const balanceAfter = currentBalance - points;

    return this.createTransaction({
      customerId,
      points: -points, // Negative for redemption
      type: TransactionType.REDEEMED,
      description,
      rewardId,
      balanceAfter,
      metadata,
    });
  }

  async createAdjustmentTransaction(
    customerId: string,
    points: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<LoyaltyTransaction> {
    // Get current balance
    const currentBalance = await this.loyaltyTransactionRepository.getCustomerCurrentBalance(customerId);
    const balanceAfter = currentBalance + points;

    return this.createTransaction({
      customerId,
      points,
      type: TransactionType.ADJUSTED,
      description,
      balanceAfter,
      metadata,
    });
  }

  async getCustomerTransactions(customerId: string, limit: number = 50): Promise<LoyaltyTransaction[]> {
    return this.loyaltyTransactionRepository.findByCustomerId(customerId, limit);
  }

  async getCustomerCurrentBalance(customerId: string): Promise<number> {
    return this.loyaltyTransactionRepository.getCustomerCurrentBalance(customerId);
  }

  async getTransactionStats(days: number = 30): Promise<any> {
    return this.loyaltyTransactionRepository.getTransactionStats(days);
  }

  async getTopCustomers(days: number = 30, limit: number = 10): Promise<any[]> {
    return this.loyaltyTransactionRepository.getTopCustomers(days, limit);
  }

  async getPopularRewards(days: number = 30, limit: number = 10): Promise<any[]> {
    return this.loyaltyTransactionRepository.getPopularRewards(days, limit);
  }

  async getRecentTransactions(days: number = 30, limit: number = 100): Promise<LoyaltyTransaction[]> {
    return this.loyaltyTransactionRepository.findRecentTransactions(days, limit);
  }

  async getTransactionsByOrder(orderId: string): Promise<LoyaltyTransaction[]> {
    return this.loyaltyTransactionRepository.findByOrderId(orderId);
  }

  async getTransactionsByReward(rewardId: string): Promise<LoyaltyTransaction[]> {
    return this.loyaltyTransactionRepository.findByRewardId(rewardId);
  }

  async processExpiringPoints(): Promise<LoyaltyTransaction[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expiringTransactions = await this.loyaltyTransactionRepository.findExpiringPoints(tomorrow);
    const adjustmentTransactions: LoyaltyTransaction[] = [];

    for (const transaction of expiringTransactions) {
      const adjustment = await this.createAdjustmentTransaction(
        transaction.customerId,
        -transaction.points,
        `Points expired from transaction ${transaction.id}`,
        { expiredTransactionId: transaction.id, originalExpiryDate: transaction.expiresAt }
      );
      adjustmentTransactions.push(adjustment);
    }

    return adjustmentTransactions;
  }
}