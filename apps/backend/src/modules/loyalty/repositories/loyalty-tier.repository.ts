import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LoyaltyTier } from '../entities/loyalty-tier.entity';
import { BaseRepository } from '@shared/repositories/base-repository.abstract';

@Injectable()
export class LoyaltyTierRepository extends BaseRepository<LoyaltyTier> {
  constructor(
    @InjectRepository(LoyaltyTier)
    protected readonly repository: Repository<LoyaltyTier>,
  ) {
    super(repository);
  }

  createQueryBuilder(alias: string = 'loyaltyTier'): SelectQueryBuilder<LoyaltyTier> {
    return this.repository.createQueryBuilder(alias);
  }

  async findActiveTiers(): Promise<LoyaltyTier[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', minPoints: 'ASC' },
    });
  }

  async findByPoints(points: number): Promise<LoyaltyTier | null> {
    return this.repository
      .createQueryBuilder('tier')
      .where('tier.isActive = :isActive', { isActive: true })
      .andWhere('tier.minPoints <= :points', { points })
      .andWhere('(tier.maxPoints IS NULL OR tier.maxPoints >= :points)', { points })
      .orderBy('tier.minPoints', 'DESC')
      .getOne();
  }

  async findWithStats() {
    return this.repository
      .createQueryBuilder('tier')
      .leftJoin('tier.customers', 'customer')
      .select('tier.*')
      .addSelect('COUNT(customer.id)', 'customerCount')
      .groupBy('tier.id')
      .orderBy('tier.sortOrder', 'ASC')
      .getRawMany();
  }

  async findByName(name: string): Promise<LoyaltyTier | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

  async countActive(): Promise<number> {
    return this.repository.count({
      where: { isActive: true },
    });
  }

  // Remove method is not in BaseRepository, so we need to add it
  async remove(entity: LoyaltyTier): Promise<LoyaltyTier> {
    return this.repository.remove(entity);
  }
}