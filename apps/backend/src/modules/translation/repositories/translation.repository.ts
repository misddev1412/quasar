import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@quasar/shared';
import { Translation } from '../entities/translation.entity';
import { TranslationRepositoryInterface } from '../interfaces/translation-repository.interface';

@Injectable()
export class TranslationRepository extends BaseRepository<Translation> implements TranslationRepositoryInterface {
  constructor(
    @InjectRepository(Translation)
    protected readonly repository: Repository<Translation>
  ) {
    super(repository);
  }

  async findByKeyAndLocale(key: string, locale: string): Promise<Translation | null> {
    return this.repository.findOne({
      where: { key, locale, isActive: true }
    });
  }

  async findByLocale(locale: string): Promise<Translation[]> {
    return this.repository.find({
      where: { locale, isActive: true },
      order: { key: 'ASC' }
    });
  }

  async findByNamespace(namespace: string): Promise<Translation[]> {
    return this.repository.find({
      where: { namespace, isActive: true },
      order: { key: 'ASC' }
    });
  }

  async findActiveByLocale(locale: string): Promise<Translation[]> {
    return this.repository.find({
      where: { locale, isActive: true },
      order: { key: 'ASC' }
    });
  }

  async findAllGroupedByLocale(): Promise<Record<string, Translation[]>> {
    const translations = await this.repository.find({
      where: { isActive: true },
      order: { locale: 'ASC', key: 'ASC' }
    });

    return translations.reduce((acc, translation) => {
      if (!acc[translation.locale]) {
        acc[translation.locale] = [];
      }
      acc[translation.locale].push(translation);
      return acc;
    }, {} as Record<string, Translation[]>);
  }
} 