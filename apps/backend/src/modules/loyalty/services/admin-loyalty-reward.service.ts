import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { LoyaltyRewardRepository } from '../repositories/loyalty-reward.repository';
import { LoyaltyReward, RewardType, DiscountType } from '../entities/loyalty-reward.entity';
import { ResponseService } from '@backend/modules/shared/services/response.service';

export interface CreateLoyaltyRewardDto {
  name: string;
  description?: string;
  type: RewardType;
  pointsRequired: number;
  value?: number;
  discountType?: DiscountType;
  conditions?: string;
  isActive?: boolean;
  isLimited?: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
  imageUrl?: string;
  termsConditions?: string;
  tierRestrictions?: string[];
  autoApply?: boolean;
  sortOrder?: number;
}

export interface UpdateLoyaltyRewardDto {
  name?: string;
  description?: string;
  type?: RewardType;
  pointsRequired?: number;
  value?: number;
  discountType?: DiscountType;
  conditions?: string;
  isActive?: boolean;
  isLimited?: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
  imageUrl?: string;
  termsConditions?: string;
  tierRestrictions?: string[];
  autoApply?: boolean;
  sortOrder?: number;
}

export interface GetLoyaltyRewardsDto {
  page: number;
  limit: number;
  search?: string;
  type?: RewardType;
  isActive?: boolean;
  sortBy?: 'name' | 'pointsRequired' | 'sortOrder' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class AdminLoyaltyRewardService {
  constructor(
    @Inject(LoyaltyRewardRepository)
    private readonly loyaltyRewardRepository: LoyaltyRewardRepository,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  async getAllRewards(filters: GetLoyaltyRewardsDto) {
    const { page, limit, search, type, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = filters;

    const queryBuilder = this.loyaltyRewardRepository.createQueryBuilder('reward');

    if (search) {
      queryBuilder.where(
        '(reward.name ILIKE :search OR reward.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('reward.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('reward.isActive = :isActive', { isActive });
    }

    const [items, total] = await queryBuilder
      .orderBy(`reward.${sortBy}`, sortOrder)
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

  async getRewardById(id: string): Promise<LoyaltyReward> {
    const reward = await this.loyaltyRewardRepository.findOne({
      where: { id },
    });

    if (!reward) {
      throw new NotFoundException('Loyalty reward not found');
    }

    return reward;
  }

  async createReward(createRewardDto: CreateLoyaltyRewardDto): Promise<LoyaltyReward> {
    // Check if reward with same name already exists
    const existingReward = await this.loyaltyRewardRepository.findByName(createRewardDto.name);
    if (existingReward) {
      throw new ConflictException('Loyalty reward with this name already exists');
    }

    const reward = this.loyaltyRewardRepository.create({
      ...createRewardDto,
      tierRestrictions: createRewardDto.tierRestrictions || [],
      isActive: createRewardDto.isActive ?? true,
      isLimited: createRewardDto.isLimited ?? false,
      autoApply: createRewardDto.autoApply ?? false,
      sortOrder: createRewardDto.sortOrder ?? 0,
      remainingQuantity: createRewardDto.isLimited
        ? (createRewardDto.remainingQuantity ?? createRewardDto.totalQuantity)
        : null,
    });

    return this.loyaltyRewardRepository.save(reward);
  }

  async updateReward(id: string, updateRewardDto: UpdateLoyaltyRewardDto): Promise<LoyaltyReward> {
    const reward = await this.getRewardById(id);

    // If name is being updated, check for duplicates
    if (updateRewardDto.name && updateRewardDto.name !== reward.name) {
      const existingReward = await this.loyaltyRewardRepository.findByName(updateRewardDto.name);
      if (existingReward) {
        throw new ConflictException('Loyalty reward with this name already exists');
      }
    }

    Object.assign(reward, updateRewardDto);

    return this.loyaltyRewardRepository.save(reward);
  }

  async deleteReward(id: string): Promise<void> {
    const reward = await this.getRewardById(id);
    await this.loyaltyRewardRepository.remove(reward);
  }

  async getRewardStats() {
    const totalRewards = await this.loyaltyRewardRepository.count();
    const activeRewards = await this.loyaltyRewardRepository.countActive();
    const expiringSoon = await this.loyaltyRewardRepository.findExpiringSoon(30);

    return {
      totalRewards,
      activeRewards,
      expiringSoonCount: expiringSoon.length,
      expiringSoon: expiringSoon.slice(0, 5), // Return only first 5
    };
  }

  async getRewardsAvailableForCustomer(customerPoints: number): Promise<LoyaltyReward[]> {
    return this.loyaltyRewardRepository.findAvailableForCustomer(customerPoints);
  }

  async updateRemainingQuantity(id: string, quantity: number): Promise<void> {
    await this.loyaltyRewardRepository.updateRemainingQuantity(id, quantity);
  }

  async getActiveRewards(): Promise<LoyaltyReward[]> {
    return this.loyaltyRewardRepository.findActiveRewards();
  }

  async getRewardsByType(type: RewardType): Promise<LoyaltyReward[]> {
    return this.loyaltyRewardRepository.findByType(type);
  }
}