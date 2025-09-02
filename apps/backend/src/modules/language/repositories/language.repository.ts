import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { Language } from '../entities/language.entity';

@Injectable()
export class LanguageRepository extends BaseRepository<Language> {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {
    super(languageRepository);
  }

  /**
   * Find all active languages
   */
  async findActive(): Promise<Language[]> {
    return this.languageRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Find default language
   */
  async findDefault(): Promise<Language | null> {
    return this.languageRepository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  /**
   * Find by language code
   */
  async findByCode(code: string): Promise<Language | null> {
    return this.languageRepository.findOne({
      where: { code: code.toLowerCase() },
    });
  }

  /**
   * Set default language (ensures only one default)
   */
  async setDefault(id: string): Promise<Language> {
    // First, unset all existing defaults
    await this.languageRepository.update(
      { isDefault: true },
      { isDefault: false }
    );

    // Then set the new default
    await this.languageRepository.update(id, { isDefault: true, isActive: true });
    
    const language = await this.findById(id);
    if (!language) {
      throw new Error('Language not found');
    }
    
    return language;
  }

  /**
   * Update sort orders for multiple languages
   */
  async updateSortOrders(updates: Array<{ id: string; sortOrder: number }>): Promise<void> {
    for (const update of updates) {
      await this.languageRepository.update(update.id, { sortOrder: update.sortOrder });
    }
  }

  /**
   * Find languages with pagination and filtering
   */
  async findWithFilters(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 10, search, isActive } = options;

    const qb = this.languageRepository.createQueryBuilder('language');

    if (search) {
      qb.andWhere(
        '(LOWER(language.name) LIKE LOWER(:search) OR LOWER(language.nativeName) LIKE LOWER(:search) OR LOWER(language.code) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('language.isActive = :isActive', { isActive });
    }

    qb.orderBy('language.sortOrder', 'ASC')
      .addOrderBy('language.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}