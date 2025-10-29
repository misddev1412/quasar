import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { LoyaltyTierRepository } from '../repositories/loyalty-tier.repository';
import { LoyaltyTier } from '../entities/loyalty-tier.entity';
import { ResponseService } from '@backend/modules/shared/services/response.service';

export interface CreateLoyaltyTierDto {
  name: string;
  description?: string;
  minPoints: number;
  maxPoints?: number;
  color?: string;
  icon?: string;
  benefits?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateLoyaltyTierDto {
  name?: string;
  description?: string;
  minPoints?: number;
  maxPoints?: number;
  color?: string;
  icon?: string;
  benefits?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface GetLoyaltyTiersDto {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'minPoints' | 'sortOrder' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class AdminLoyaltyTierService {
  constructor(
    @Inject(LoyaltyTierRepository)
    private readonly loyaltyTierRepository: LoyaltyTierRepository,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  async getAllTiers(filters: GetLoyaltyTiersDto) {
    const { page, limit, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = filters;

    const queryBuilder = this.loyaltyTierRepository.createQueryBuilder('tier');

    if (search) {
      queryBuilder.where(
        '(tier.name ILIKE :search OR tier.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('tier.isActive = :isActive', { isActive });
    }

    const [items, total] = await queryBuilder
      .orderBy(`tier.${sortBy}`, sortOrder)
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

  async getTierById(id: string): Promise<LoyaltyTier> {
    const tier = await this.loyaltyTierRepository.findOne({
      where: { id },
    });

    if (!tier) {
      throw new NotFoundException('Loyalty tier not found');
    }

    return tier;
  }

  async createTier(createTierDto: CreateLoyaltyTierDto): Promise<LoyaltyTier> {
    // Check if tier with same name already exists
    const existingTier = await this.loyaltyTierRepository.findByName(createTierDto.name);
    if (existingTier) {
      throw new ConflictException('Loyalty tier with this name already exists');
    }

    const tier = this.loyaltyTierRepository.create({
      ...createTierDto,
      benefits: createTierDto.benefits || [],
      isActive: createTierDto.isActive ?? true,
      sortOrder: createTierDto.sortOrder ?? 0,
    });

    return this.loyaltyTierRepository.save(tier);
  }

  async updateTier(id: string, updateTierDto: UpdateLoyaltyTierDto): Promise<LoyaltyTier> {
    const tier = await this.getTierById(id);

    // If name is being updated, check for duplicates
    if (updateTierDto.name && updateTierDto.name !== tier.name) {
      const existingTier = await this.loyaltyTierRepository.findByName(updateTierDto.name);
      if (existingTier) {
        throw new ConflictException('Loyalty tier with this name already exists');
      }
    }

    Object.assign(tier, updateTierDto);

    return this.loyaltyTierRepository.save(tier);
  }

  async deleteTier(id: string): Promise<void> {
    const tier = await this.getTierById(id);
    await this.loyaltyTierRepository.remove(tier);
  }

  async getTierStats() {
    const totalTiers = await this.loyaltyTierRepository.count();
    const activeTiers = await this.loyaltyTierRepository.countActive();
    const tiersWithStats = await this.loyaltyTierRepository.findWithStats();

    return {
      totalTiers,
      activeTiers,
      tiers: tiersWithStats,
    };
  }

  async getTierForPoints(points: number): Promise<LoyaltyTier | null> {
    return this.loyaltyTierRepository.findByPoints(points);
  }

  async getActiveTiers(): Promise<LoyaltyTier[]> {
    return this.loyaltyTierRepository.findActiveTiers();
  }
}