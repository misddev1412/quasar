import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { TranslationRepository } from '../repositories/translation.repository';
import { Translation } from '../entities/translation.entity';
import { SupportedLocale, TranslationMap, LocaleTranslations } from '@quasar/shared';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly translationCache = new Map<string, LocaleTranslations>();
  private readonly cacheExpiry = 1000 * 60 * 5; // 5 minutes
  private cacheTimestamp = 0;

  constructor(
    private readonly translationRepository: TranslationRepository
  ) {}

  async getTranslations(locale: SupportedLocale): Promise<TranslationMap> {
    try {
      // Try to get from cache first
      const cachedTranslations = this.getCachedTranslations();
      if (cachedTranslations && cachedTranslations[locale]) {
        return cachedTranslations[locale];
      }

      // Get from database
      const dbTranslations = await this.getTranslationsFromDatabase(locale);
      
      // Get fallback from files
      const fileTranslations = this.getTranslationsFromFile(locale);
      
      // Merge database translations with file fallbacks
      const merged = this.mergeTranslations(dbTranslations, fileTranslations);
      
      // Update cache
      this.updateCache(locale, merged);
      
      return merged;
    } catch (error) {
      this.logger.error(`Failed to get translations for locale ${locale}:`, error);
      // Fallback to file translations only
      return this.getTranslationsFromFile(locale);
    }
  }

  async getTranslation(key: string, locale: SupportedLocale, defaultValue?: string): Promise<string> {
    try {
      // Try database first
      const dbTranslation = await this.translationRepository.findByKeyAndLocale(key, locale);
      if (dbTranslation) {
        return dbTranslation.value;
      }

      // Fallback to file translations
      const fileTranslations = this.getTranslationsFromFile(locale);
      const value = this.getNestedValue(fileTranslations, key);
      
      if (value) {
        return value;
      }

      // Fallback to English if not Vietnamese
      if (locale !== 'en') {
        const enTranslations = this.getTranslationsFromFile('en');
        const enValue = this.getNestedValue(enTranslations, key);
        if (enValue) {
          return enValue;
        }
      }

      return defaultValue || key;
    } catch (error) {
      this.logger.error(`Failed to get translation for key ${key}:`, error);
      return defaultValue || key;
    }
  }

  private async getTranslationsFromDatabase(locale: SupportedLocale): Promise<TranslationMap> {
    const translations = await this.translationRepository.findActiveByLocale(locale);
    
    const result: TranslationMap = {};
    
    translations.forEach(translation => {
      this.setNestedValue(result, translation.key, translation.value);
    });
    
    return result;
  }

  private getTranslationsFromFile(locale: SupportedLocale): TranslationMap {
    try {
      const filePath = join(process.cwd(), 'src', 'assets', 'i18n', `${locale}.json`);
      
      if (!existsSync(filePath)) {
        this.logger.warn(`Translation file not found: ${filePath}`);
        return {};
      }

      const fileContent = readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      this.logger.error(`Failed to load translation file for locale ${locale}:`, error);
      return {};
    }
  }

  private mergeTranslations(dbTranslations: TranslationMap, fileTranslations: TranslationMap): TranslationMap {
    // Database translations take priority
    return { ...fileTranslations, ...dbTranslations };
  }

  private getCachedTranslations(): LocaleTranslations | null {
    const now = Date.now();
    if (now - this.cacheTimestamp > this.cacheExpiry) {
      this.translationCache.clear();
      return null;
    }

    const cached = this.translationCache.get('all');
    return cached || null;
  }

  private updateCache(locale: SupportedLocale, translations: TranslationMap): void {
    const existing = this.translationCache.get('all') || {};
    existing[locale] = translations;
    this.translationCache.set('all', existing);
    this.cacheTimestamp = Date.now();
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private setNestedValue(obj: any, path: string, value: string): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    let current = obj;
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  async createOrUpdateTranslation(key: string, locale: SupportedLocale, value: string, namespace?: string): Promise<Translation> {
    const existing = await this.translationRepository.findByKeyAndLocale(key, locale);
    
    if (existing) {
      return this.translationRepository.update(existing.id, { value });
    }

    const newTranslation = this.translationRepository.create({
      key,
      locale,
      value,
      namespace
    });
    
    return this.translationRepository.save(newTranslation);
  }

  async deleteTranslation(key: string, locale: SupportedLocale): Promise<boolean> {
    const translation = await this.translationRepository.findByKeyAndLocale(key, locale);
    if (!translation) {
      return false;
    }

    return this.translationRepository.delete(translation.id);
  }

  clearCache(): void {
    this.translationCache.clear();
    this.cacheTimestamp = 0;
  }
} 