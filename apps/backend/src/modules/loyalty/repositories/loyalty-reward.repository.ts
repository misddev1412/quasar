import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, LessThan, MoreThan } from 'typeorm';
import { LoyaltyReward, RewardType } from '../entities/loyalty-reward.entity';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';

@Injectable()
export class LoyaltyRewardRepository extends BaseRepository<LoyaltyReward> {
  constructor(
    @InjectRepository(LoyaltyReward)
    protected readonly repository: Repository<LoyaltyReward>,
  ) {
    super(repository);
  }

  createQueryBuilder(alias: string = 'loyaltyReward'): SelectQueryBuilder<LoyaltyReward> {
    return this.repository.createQueryBuilder(alias);
  }

  async findActiveRewards(): Promise<LoyaltyReward[]> {
    const now = new Date();
    return this.repository.find({
      where: [
        {
          isActive: true,
          startsAt: LessThan(now),
          endsAt: MoreThan(now),
        },
        {
          isActive: true,
          startsAt: LessThan(now),
          endsAt: null,
        },
      ],
      order: { sortOrder: 'ASC', pointsRequired: 'ASC' },
    });
  }

  async findByType(type: RewardType): Promise<LoyaltyReward[]> {
    return this.repository.find({
      where: { type, isActive: true },
      order: { sortOrder: 'ASC', pointsRequired: 'ASC' },
    });
  }

  async findByPointsRange(minPoints: number, maxPoints?: number): Promise<LoyaltyReward[]> {
    const query = this.repository
      .createQueryBuilder('reward')
      .where('reward.isActive = :isActive', { isActive: true })
      .andWhere('reward.pointsRequired >= :minPoints', { minPoints });

    if (maxPoints) {
      query.andWhere('reward.pointsRequired <= :maxPoints', { maxPoints });
    }

    return query.orderBy('reward.pointsRequired', 'ASC').getMany();
  }

  async findAvailableForCustomer(customerPoints: number): Promise<LoyaltyReward[]> {
    const now = new Date();
    return this.repository
      .createQueryBuilder('reward')
      .where('reward.isActive = :isActive', { isActive: true })
      .andWhere('reward.pointsRequired <= :customerPoints', { customerPoints })
      .andWhere('(reward.startsAt IS NULL OR reward.startsAt <= :now)', { now })
      .andWhere('(reward.endsAt IS NULL OR reward.endsAt >= :now)', { now })
      .andWhere('(reward.isLimited = false OR (reward.isLimited = true AND reward.remainingQuantity > 0))', {})
      .orderBy('reward.pointsRequired', 'ASC')
      .getMany();
  }

  async findByName(name: string): Promise<LoyaltyReward | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

  async updateRemainingQuantity(id: string, quantity: number): Promise<void> {
    await this.repository.update(id, { remainingQuantity: quantity });
  }

  async findExpiringSoon(days: number = 30): Promise<LoyaltyReward[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.repository.find({
      where: {
        isActive: true,
        endsAt: Between(new Date(), futureDate),
      },
      order: { endsAt: 'ASC' },
    });
  }

  async countActive(): Promise<number> {
    return this.repository.count({
      where: { isActive: true },
    });
  }

  // Remove method is not in BaseRepository, so we need to add it
  async remove(entity: LoyaltyReward): Promise<LoyaltyReward> {
    return this.repository.remove(entity);
  }
}