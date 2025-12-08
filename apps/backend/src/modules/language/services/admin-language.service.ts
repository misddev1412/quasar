import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Language } from '../entities/language.entity';
import { LanguageRepository } from '../repositories/language.repository';
import { CreateLanguageDto, UpdateLanguageDto, LanguageFiltersDto } from '../dto/language.dto';

@Injectable()
export class AdminLanguageService {
  constructor(
    private readonly languageRepository: LanguageRepository,
  ) {}

  /**
   * Get all languages with pagination and filtering
   */
  async getLanguages(filters: LanguageFiltersDto) {
    const { page = 1, limit = 10, search, isActive } = filters;
    
    return this.languageRepository.findWithFilters({
      page,
      limit,
      search,
      isActive,
    });
  }

  /**
   * Get all active languages (for dropdowns, etc.)
   */
  async getActiveLanguages(): Promise<Language[]> {
    return this.languageRepository.findActive();
  }

  /**
   * Get language by ID
   */
  async getLanguageById(id: string): Promise<Language> {
    const language = await this.languageRepository.findById(id);
    if (!language) {
      throw new NotFoundException('Language not found');
    }
    return language;
  }

  /**
   * Get language by code
   */
  async getLanguageByCode(code: string): Promise<Language | null> {
    return this.languageRepository.findByCode(code);
  }

  /**
   * Get default language
   */
  async getDefaultLanguage(): Promise<Language> {
    const defaultLanguage = await this.languageRepository.findDefault();
    if (!defaultLanguage) {
      // Fallback to English if no default is set
      const english = await this.languageRepository.findByCode('en');
      if (english) {
        return this.setDefaultLanguage(english.id);
      }
      throw new NotFoundException('No default language found');
    }
    return defaultLanguage;
  }

  /**
   * Create a new language
   */
  async createLanguage(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const { code, name, nativeName, icon, isActive, isDefault, sortOrder } = createLanguageDto;

    // Check if language code already exists
    const existingLanguage = await this.languageRepository.findByCode(code);
    if (existingLanguage) {
      throw new BadRequestException(`Language with code '${code}' already exists`);
    }

    // Create the language
    const languageEntity = this.languageRepository.create({
      code: code.toLowerCase(),
      name,
      nativeName,
      icon,
      isActive: isActive ?? true,
      isDefault: false, // Will be set separately if needed
      sortOrder: sortOrder ?? 0,
    });

    const language = await this.languageRepository.save(languageEntity);

    // If this should be the default language, set it
    if (isDefault) {
      return this.setDefaultLanguage(language.id);
    }

    return language;
  }

  /**
   * Update a language
   */
  async updateLanguage(id: string, updateLanguageDto: UpdateLanguageDto): Promise<Language> {
    const language = await this.getLanguageById(id);
    const { code, name, nativeName, icon, isActive, isDefault, sortOrder } = updateLanguageDto;

    // If updating code, check for conflicts
    if (code && code !== language.code) {
      const existingLanguage = await this.languageRepository.findByCode(code);
      if (existingLanguage && existingLanguage.id !== id) {
        throw new BadRequestException(`Language with code '${code}' already exists`);
      }
    }

    // Update the language
    const updatedLanguage = await this.languageRepository.update(id, {
      ...(code && { code: code.toLowerCase() }),
      ...(name && { name }),
      ...(nativeName && { nativeName }),
      ...(icon !== undefined && { icon }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    // If this should be the default language, set it
    if (isDefault && !language.isDefault) {
      return this.setDefaultLanguage(id);
    }

    return updatedLanguage;
  }

  /**
   * Delete a language
   */
  async deleteLanguage(id: string): Promise<void> {
    const language = await this.getLanguageById(id);

    // Prevent deletion of default language
    if (language.isDefault) {
      throw new BadRequestException('Cannot delete the default language');
    }

    // Check if language is being used in translations
    // TODO: Add check for existing post/content translations using this language

    await this.languageRepository.delete(id);
  }

  /**
   * Set default language
   */
  async setDefaultLanguage(id: string): Promise<Language> {
    const language = await this.getLanguageById(id);
    return this.languageRepository.setDefault(id);
  }

  /**
   * Update language sort orders
   */
  async updateSortOrders(updates: Array<{ id: string; sortOrder: number }>): Promise<void> {
    // Validate all IDs exist
    for (const update of updates) {
      await this.getLanguageById(update.id);
    }

    await this.languageRepository.updateSortOrders(updates);
  }

  /**
   * Toggle language active status
   */
  async toggleLanguageStatus(id: string): Promise<Language> {
    const language = await this.getLanguageById(id);

    // Prevent deactivating default language
    if (language.isDefault && language.isActive) {
      throw new BadRequestException('Cannot deactivate the default language');
    }

    return this.languageRepository.update(id, { isActive: !language.isActive });
  }
}