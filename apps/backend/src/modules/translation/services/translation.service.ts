import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { TranslationRepository } from '../repositories/translation.repository';
import { Translation } from '../entities/translation.entity';
import { SupportedLocale, TranslationMap, LocaleTranslations } from '@shared';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly translationCache = new Map<string, LocaleTranslations>();
  private readonly cacheExpiry = 1000 * 60 * 5; // 5 minutes
  private cacheTimestamp = 0;

  constructor(
    private readonly translationRepository: TranslationRepository
  ) { }

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
    const candidatePaths = [
      join(process.cwd(), 'apps', 'backend', 'src', 'assets', 'i18n', `${locale}.json`),
      join(process.cwd(), 'src', 'assets', 'i18n', `${locale}.json`),
      resolve(__dirname, '..', '..', 'assets', 'i18n', `${locale}.json`),
      resolve(__dirname, '..', '..', '..', '..', 'assets', 'i18n', `${locale}.json`),
    ];

    let result: TranslationMap = {};

    // 1. Load main backend translations
    for (const filePath of candidatePaths) {
      try {
        if (!existsSync(filePath)) {
          continue;
        }

        const fileContent = readFileSync(filePath, 'utf8');
        const translations = JSON.parse(fileContent);
        result = this.deepMerge(result, translations);
        // We found the main file, but we might want to continue to merge others if necessary
        // In original logic it returned immediately. Let's keep one main file logic but...
        // We really want to merge admin/sections.json too.
        break;
      } catch (error) {
        this.logger.warn(`Failed to read translation file at ${filePath}: ${error.message}`);
      }
    }

    // 2. Load admin sections.json
    const sectionsPath = join(process.cwd(), 'apps', 'admin', 'src', 'i18n', 'locales', locale, 'sections.json');
    try {
      if (existsSync(sectionsPath)) {
        const sectionsContent = readFileSync(sectionsPath, 'utf8');
        const sectionsJson = JSON.parse(sectionsContent);
        // sections.json has "sections": { ... } structure natively
        result = this.deepMerge(result, sectionsJson);
      }
    } catch (error) {
      this.logger.warn(`Failed to read sections translation file at ${sectionsPath}: ${error.message}`);
    }

    if (Object.keys(result).length === 0) {
      this.logger.warn(`Translation file not found for locale ${locale}`);
    }

    return result;
  }

  private mergeTranslations(dbTranslations: TranslationMap, fileTranslations: TranslationMap): TranslationMap {
    return this.deepMerge(fileTranslations, dbTranslations);
  }

  private deepMerge(base: TranslationMap, override: TranslationMap): TranslationMap {
    const result: TranslationMap = { ...base };

    Object.entries(override || {}).forEach(([key, value]) => {
      const existing = result[key];

      if (this.isObject(existing) && this.isObject(value)) {
        result[key] = this.deepMerge(existing, value);
        return;
      }

      result[key] = value;
    });

    return result;
  }

  private isObject(value: unknown): value is TranslationMap {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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
    const normalizedNamespace = namespace === '' ? null : namespace;

    if (existing) {
      const updateData: Partial<Translation> = { value };
      if (normalizedNamespace !== undefined) {
        updateData.namespace = normalizedNamespace;
      }

      const updated = await this.translationRepository.update(existing.id, updateData);
      if (updated) {
        this.clearCache();
        return updated;
      }

      // If we failed to update for any reason, fall back to returning the existing entity
      this.clearCache();
      return existing;
    }

    const newTranslation = this.translationRepository.create({
      key,
      locale,
      value,
      namespace: normalizedNamespace,
    });

    const saved = await this.translationRepository.save(newTranslation);
    this.clearCache();
    return saved;
  }

  async deleteTranslation(key: string, locale: SupportedLocale): Promise<boolean> {
    const translation = await this.translationRepository.findByKeyAndLocale(key, locale);
    if (!translation) {
      return false;
    }

    const deleted = await this.translationRepository.delete(translation.id);
    if (deleted) {
      this.clearCache();
    }
    return deleted;
  }

  clearCache(): void {
    this.translationCache.clear();
    this.cacheTimestamp = 0;
  }
} 
