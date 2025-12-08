import { IBaseRepository } from '@shared';
import { Translation } from '../entities/translation.entity';

export interface TranslationRepositoryInterface extends IBaseRepository<Translation> {
  findByKeyAndLocale(key: string, locale: string): Promise<Translation | null>;
  findByLocale(locale: string): Promise<Translation[]>;
  findByNamespace(namespace: string): Promise<Translation[]>;
  findActiveByLocale(locale: string): Promise<Translation[]>;
  findAllGroupedByLocale(): Promise<Record<string, Translation[]>>;
} 