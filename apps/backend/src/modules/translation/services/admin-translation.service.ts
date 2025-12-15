import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TranslationRepository } from '../repositories/translation.repository';
import { Translation } from '../entities/translation.entity';
import { PaginatedResult } from '@shared';

interface TranslationFilters {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  namespace?: string;
  isActive?: boolean;
}

interface CreateTranslationDto {
  key: string;
  locale: string;
  value: string;
  namespace?: string;
  isActive?: boolean;
}

interface UpdateTranslationDto {
  key?: string;
  locale?: string;
  value?: string;
  namespace?: string;
  isActive?: boolean;
}

@Injectable()
export class AdminTranslationService {
  constructor(
    private readonly translationRepository: TranslationRepository
  ) {}

  async getTranslations(filters: TranslationFilters): Promise<PaginatedResult<Translation>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.locale) {
      where.locale = filters.locale;
    }

    if (filters.namespace) {
      where.namespace = filters.namespace;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const queryBuilder = this.translationRepository.createQueryBuilder('translation');

    // Apply filters
    Object.entries(where).forEach(([key, value]) => {
      queryBuilder.andWhere(`translation.${key} = :${key}`, { [key]: value });
    });

    // Apply search
    if (filters.search) {
      queryBuilder.andWhere(
        '(translation.key LIKE :search OR translation.value LIKE :search OR translation.namespace LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Pagination
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('translation.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async getTranslationById(id: string): Promise<Translation> {
    const translation = await this.translationRepository.findById(id);

    if (!translation) {
      throw new NotFoundException(`Translation with ID ${id} not found`);
    }

    return translation;
  }

  async getLocales(): Promise<string[]> {
    const translations = await this.translationRepository.findAll();
    const locales = [...new Set(translations.map(t => t.locale))];
    return locales.sort() as string[];
  }

  async getNamespaces(): Promise<string[]> {
    const translations = await this.translationRepository.findAll();
    const namespaces = [...new Set(translations.map(t => t.namespace).filter(Boolean))];
    return namespaces.sort() as string[];
  }

  async createTranslation(createDto: CreateTranslationDto): Promise<Translation> {
    // Check if translation already exists
    const existing = await this.translationRepository.findByKeyAndLocale(
      createDto.key,
      createDto.locale
    );

    if (existing) {
      throw new ConflictException(
        `Translation with key "${createDto.key}" and locale "${createDto.locale}" already exists`
      );
    }

    const translation = this.translationRepository.create({
      key: createDto.key,
      locale: createDto.locale,
      value: createDto.value,
      namespace: createDto.namespace,
      isActive: createDto.isActive !== undefined ? createDto.isActive : true,
    });

    return this.translationRepository.save(translation);
  }

  async updateTranslation(id: string, updateDto: UpdateTranslationDto): Promise<Translation> {
    const translation = await this.getTranslationById(id);

    // Check if updating key/locale would create a duplicate
    if ((updateDto.key || updateDto.locale) &&
        (updateDto.key !== translation.key || updateDto.locale !== translation.locale)) {
      const newKey = updateDto.key || translation.key;
      const newLocale = updateDto.locale || translation.locale;

      const existing = await this.translationRepository.findByKeyAndLocale(newKey, newLocale);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Translation with key "${newKey}" and locale "${newLocale}" already exists`
        );
      }
    }

    Object.assign(translation, updateDto);

    return this.translationRepository.save(translation);
  }

  async deleteTranslation(id: string): Promise<void> {
    const translation = await this.getTranslationById(id);
    await this.translationRepository.delete(translation.id);
  }

  async toggleTranslationStatus(id: string): Promise<Translation> {
    const translation = await this.getTranslationById(id);
    translation.isActive = !translation.isActive;
    return this.translationRepository.save(translation);
  }
}
