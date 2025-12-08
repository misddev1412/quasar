import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EmailChannel } from '../entities/email-channel.entity';
import { BaseRepository } from '@shared';

export interface IEmailChannelRepository {
  findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    providerName?: string;
    usageType?: string;
  }): Promise<{
    items: EmailChannel[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>;

  findById(id: string): Promise<EmailChannel | null>;
  findByName(name: string): Promise<EmailChannel | null>;
  findDefault(): Promise<EmailChannel | null>;
  findByPriority(priority: number): Promise<EmailChannel[]>;
  findByUsageType(usageType: string): Promise<EmailChannel[]>;
  findActiveChannels(): Promise<EmailChannel[]>;
  createEmailChannel(data: Partial<EmailChannel>): Promise<EmailChannel>;
  update(id: string, data: Partial<EmailChannel>): Promise<EmailChannel | null>;
  deleteEmailChannel(id: string): Promise<void>;
  setAsDefault(id: string): Promise<void>;
  validateUniqueConstraints(name: string, id?: string): Promise<{ isValid: boolean; errors: string[] }>;
}

@Injectable()
export class EmailChannelRepository extends BaseRepository<EmailChannel> implements IEmailChannelRepository {
  constructor(
    @InjectRepository(EmailChannel)
    private emailChannelRepository: Repository<EmailChannel>,
  ) {
    super(emailChannelRepository);
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    providerName?: string;
    usageType?: string;
  }): Promise<{
    items: EmailChannel[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { page, limit, search, isActive, providerName, usageType } = params;

    const queryBuilder = this.emailChannelRepository
      .createQueryBuilder('emailChannel')
      .orderBy('emailChannel.priority', 'ASC')
      .addOrderBy('emailChannel.name', 'ASC');

    this.applyFilters(queryBuilder, { search, isActive, providerName, usageType });

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<EmailChannel | null> {
    return await this.emailChannelRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<EmailChannel | null> {
    return await this.emailChannelRepository.findOne({ where: { name } });
  }

  async findDefault(): Promise<EmailChannel | null> {
    return await this.emailChannelRepository.findOne({ 
      where: { isDefault: true, isActive: true } 
    });
  }

  async findByPriority(priority: number): Promise<EmailChannel[]> {
    return await this.emailChannelRepository.find({
      where: { priority, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByUsageType(usageType: string): Promise<EmailChannel[]> {
    return await this.emailChannelRepository.find({
      where: { usageType, isActive: true },
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async findActiveChannels(): Promise<EmailChannel[]> {
    return await this.emailChannelRepository.find({
      where: { isActive: true },
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async createEmailChannel(data: Partial<EmailChannel>): Promise<EmailChannel> {
    const emailChannel = this.emailChannelRepository.create(data);
    return await this.emailChannelRepository.save(emailChannel);
  }

  async update(id: string, data: Partial<EmailChannel>): Promise<EmailChannel | null> {
    await this.emailChannelRepository.update(id, data);
    return await this.findById(id);
  }

  async deleteEmailChannel(id: string): Promise<void> {
    await this.emailChannelRepository.delete(id);
  }

  async setAsDefault(id: string): Promise<void> {
    // First, remove default from all channels
    await this.emailChannelRepository.update(
      {},
      { isDefault: false }
    );

    // Then set the specified channel as default
    await this.emailChannelRepository.update(id, { 
      isDefault: true,
      isActive: true // Ensure default channel is active
    });
  }

  async validateUniqueConstraints(name: string, id?: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check name uniqueness
    const queryBuilder = this.emailChannelRepository
      .createQueryBuilder('emailChannel')
      .where('emailChannel.name = :name', { name });

    if (id) {
      queryBuilder.andWhere('emailChannel.id != :id', { id });
    }

    const existingChannel = await queryBuilder.getOne();
    if (existingChannel) {
      errors.push('Email channel name must be unique');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<EmailChannel>,
    filters: {
      search?: string;
      isActive?: boolean;
      providerName?: string;
      usageType?: string;
    },
  ): void {
    const { search, isActive, providerName, usageType } = filters;

    if (search) {
      queryBuilder.andWhere(
        '(emailChannel.name LIKE :search OR emailChannel.description LIKE :search OR emailChannel.defaultFromEmail LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('emailChannel.isActive = :isActive', { isActive });
    }

    if (providerName) {
      queryBuilder.andWhere('emailChannel.providerName = :providerName', { providerName });
    }

    if (usageType) {
      queryBuilder.andWhere('emailChannel.usageType = :usageType', { usageType });
    }
  }
}