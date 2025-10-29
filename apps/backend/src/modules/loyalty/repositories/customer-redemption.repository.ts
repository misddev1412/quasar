import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CustomerRedemption } from '../entities/customer-redemption.entity';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';

@Injectable()
export class CustomerRedemptionRepository extends BaseRepository<CustomerRedemption> {
  constructor(
    @InjectRepository(CustomerRedemption)
    protected readonly repository: Repository<CustomerRedemption>,
  ) {
    super(repository);
  }

  createQueryBuilder(alias: string = 'customerRedemption'): SelectQueryBuilder<CustomerRedemption> {
    return this.repository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.customer`, 'customer')
      .leftJoinAndSelect(`${alias}.reward`, 'reward');
  }

  async findByCustomerId(customerId: string): Promise<CustomerRedemption[]> {
    return this.repository.find({
      where: { customerId },
      relations: ['customer', 'reward'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRewardId(rewardId: string): Promise<CustomerRedemption[]> {
    return this.repository.find({
      where: { rewardId },
      relations: ['customer', 'reward'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(redemptionCode: string): Promise<CustomerRedemption | null> {
    return this.repository.findOne({
      where: { redemptionCode },
      relations: ['customer', 'reward'],
    });
  }

  async findActiveRedemptions(customerId: string): Promise<CustomerRedemption[]> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('redemption')
      .leftJoinAndSelect('redemption.reward', 'reward')
      .where('redemption.customerId = :customerId', { customerId })
      .andWhere('redemption.isUsed = :isUsed', { isUsed: false })
      .andWhere('(redemption.expiresAt IS NULL OR redemption.expiresAt > :now)', { now })
      .orderBy('redemption.createdAt', 'DESC')
      .getMany();
  }

  async countByReward(rewardId: string): Promise<number> {
    return this.repository.count({
      where: { rewardId },
    });
  }

  async countUsedByReward(rewardId: string): Promise<number> {
    return this.repository.count({
      where: { rewardId, isUsed: true },
    });
  }
}