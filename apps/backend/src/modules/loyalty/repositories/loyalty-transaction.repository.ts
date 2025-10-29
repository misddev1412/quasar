import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, MoreThan, LessThan } from 'typeorm';
import { LoyaltyTransaction, TransactionType } from '../entities/loyalty-transaction.entity';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';

@Injectable()
export class LoyaltyTransactionRepository extends BaseRepository<LoyaltyTransaction> {
  constructor(
    @InjectRepository(LoyaltyTransaction)
    protected readonly repository: Repository<LoyaltyTransaction>,
  ) {
    super(repository);
  }

  createQueryBuilder(alias: string = 'loyaltyTransaction'): SelectQueryBuilder<LoyaltyTransaction> {
    return this.repository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.customer`, 'customer')
      .leftJoinAndSelect(`${alias}.order`, 'order')
      .leftJoinAndSelect(`${alias}.reward`, 'reward');
  }

  async findByCustomerId(customerId: string, limit: number = 50): Promise<LoyaltyTransaction[]> {
    return this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['customer', 'order', 'reward'],
    });
  }

  async findByType(type: TransactionType, limit: number = 100): Promise<LoyaltyTransaction[]> {
    return this.repository.find({
      where: { type },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['customer', 'order', 'reward'],
    });
  }

  async findByOrderId(orderId: string): Promise<LoyaltyTransaction[]> {
    return this.repository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
      relations: ['customer', 'order', 'reward'],
    });
  }

  async findByRewardId(rewardId: string): Promise<LoyaltyTransaction[]> {
    return this.repository.find({
      where: { rewardId },
      order: { createdAt: 'DESC' },
      relations: ['customer', 'order', 'reward'],
    });
  }

  async findExpiringPoints(beforeDate: Date): Promise<LoyaltyTransaction[]> {
    return this.repository.find({
      where: {
        type: TransactionType.EARNED,
        expiresAt: LessThan(beforeDate),
      },
      relations: ['customer'],
    });
  }

  async findRecentTransactions(days: number = 30, limit: number = 100): Promise<LoyaltyTransaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('transaction.order', 'order')
      .leftJoinAndSelect('transaction.reward', 'reward')
      .where('transaction.createdAt >= :startDate', { startDate })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async getCustomerCurrentBalance(customerId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.points)', 'total')
      .where('transaction.customerId = :customerId', { customerId })
      .andWhere('(transaction.expiresAt IS NULL OR transaction.expiresAt > :now)', { now: new Date() })
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }

  async getTransactionStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const earnedResult = await this.repository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.points)', 'total')
      .where('transaction.type = :type', { type: TransactionType.EARNED })
      .andWhere('transaction.createdAt >= :startDate', { startDate })
      .getRawOne();

    const redeemedResult = await this.repository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.points)', 'total')
      .where('transaction.type = :type', { type: TransactionType.REDEEMED })
      .andWhere('transaction.createdAt >= :startDate', { startDate })
      .getRawOne();

    const totalTransactions = await this.repository.count({
      where: {
        createdAt: MoreThan(startDate),
      },
    });

    return {
      totalEarned: parseInt(earnedResult?.total || '0', 10),
      totalRedeemed: parseInt(redeemedResult?.total || '0', 10),
      totalTransactions,
      periodDays: days,
    };
  }

  async getTopCustomers(days: number = 30, limit: number = 10): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.repository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.customer', 'customer')
      .select('customer.id', 'customerId')
      .addSelect('customer.email', 'customerEmail')
      .addSelect('customer.firstName', 'customerFirstName')
      .addSelect('customer.lastName', 'customerLastName')
      .addSelect('SUM(transaction.points)', 'totalPoints')
      .addSelect('COUNT(transaction.id)', 'transactionCount')
      .where('transaction.type = :type', { type: TransactionType.EARNED })
      .andWhere('transaction.createdAt >= :startDate', { startDate })
      .groupBy('customer.id')
      .orderBy('totalPoints', 'DESC')
      .take(limit)
      .getRawMany();
  }

  async getPopularRewards(days: number = 30, limit: number = 10): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.repository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.reward', 'reward')
      .select('reward.id', 'rewardId')
      .addSelect('reward.name', 'rewardName')
      .addSelect('COUNT(transaction.id)', 'redemptionCount')
      .addSelect('SUM(transaction.points)', 'totalPointsSpent')
      .where('transaction.type = :type', { type: TransactionType.REDEEMED })
      .andWhere('transaction.createdAt >= :startDate', { startDate })
      .andWhere('reward.id IS NOT NULL')
      .groupBy('reward.id')
      .orderBy('redemptionCount', 'DESC')
      .take(limit)
      .getRawMany();
  }

  // Remove method is not in BaseRepository, so we need to add it
  async remove(entity: LoyaltyTransaction): Promise<LoyaltyTransaction> {
    return this.repository.remove(entity);
  }
}