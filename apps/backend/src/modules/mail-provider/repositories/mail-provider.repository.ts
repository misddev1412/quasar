import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MailProvider } from '../entities/mail-provider.entity';
import { BaseRepository } from '@shared';

export interface IMailProviderRepository {
  findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    providerType?: string;
  }): Promise<{
    items: MailProvider[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }>;

  findById(id: string): Promise<MailProvider | null>;
  findByName(name: string): Promise<MailProvider | null>;
  findActiveProviders(): Promise<MailProvider[]>;
  findByProviderType(providerType: string): Promise<MailProvider[]>;
  createMailProvider(data: Partial<MailProvider>): Promise<MailProvider>;
  update(id: string, data: Partial<MailProvider>): Promise<MailProvider | null>;
  deleteMailProvider(id: string): Promise<void>;
  validateUniqueConstraints(name: string, id?: string): Promise<{ isValid: boolean; errors: string[] }>;
}

@Injectable()
export class MailProviderRepository extends BaseRepository<MailProvider> implements IMailProviderRepository {
  constructor(
    @InjectRepository(MailProvider)
    private mailProviderRepository: Repository<MailProvider>,
  ) {
    super(mailProviderRepository);
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    providerType?: string;
  }): Promise<{
    items: MailProvider[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const { page, limit, search, isActive, providerType } = params;

    const queryBuilder = this.mailProviderRepository
      .createQueryBuilder('mailProvider')
      .orderBy('mailProvider.priority', 'ASC')
      .addOrderBy('mailProvider.name', 'ASC');

    this.applyFilters(queryBuilder, { search, isActive, providerType });

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

  async findById(id: string): Promise<MailProvider | null> {
    return await this.mailProviderRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<MailProvider | null> {
    return await this.mailProviderRepository.findOne({ where: { name } });
  }

  async findActiveProviders(): Promise<MailProvider[]> {
    return await this.mailProviderRepository.find({
      where: { isActive: true },
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async findByProviderType(providerType: string): Promise<MailProvider[]> {
    return await this.mailProviderRepository.find({
      where: { providerType, isActive: true },
      order: { priority: 'ASC', name: 'ASC' },
    });
  }

  async createMailProvider(data: Partial<MailProvider>): Promise<MailProvider> {
    const mailProvider = this.mailProviderRepository.create(data);
    return await this.mailProviderRepository.save(mailProvider);
  }

  async update(id: string, data: Partial<MailProvider>): Promise<MailProvider | null> {
    await this.mailProviderRepository.update(id, data);
    return await this.findById(id);
  }

  async deleteMailProvider(id: string): Promise<void> {
    await this.mailProviderRepository.delete(id);
  }

  async validateUniqueConstraints(name: string, id?: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check name uniqueness
    const queryBuilder = this.mailProviderRepository
      .createQueryBuilder('mailProvider')
      .where('mailProvider.name = :name', { name });

    if (id) {
      queryBuilder.andWhere('mailProvider.id != :id', { id });
    }

    const existingProvider = await queryBuilder.getOne();
    if (existingProvider) {
      errors.push('Mail provider name must be unique');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<MailProvider>,
    filters: {
      search?: string;
      isActive?: boolean;
      providerType?: string;
    },
  ): void {
    const { search, isActive, providerType } = filters;

    if (search) {
      queryBuilder.andWhere(
        '(mailProvider.name LIKE :search OR mailProvider.description LIKE :search OR mailProvider.defaultFromEmail LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('mailProvider.isActive = :isActive', { isActive });
    }

    if (providerType) {
      queryBuilder.andWhere('mailProvider.providerType = :providerType', { providerType });
    }
  }
}










