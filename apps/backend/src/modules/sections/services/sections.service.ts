import { Injectable } from '@nestjs/common';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { SectionRepository } from '../repositories/section.repository';
import { SectionTranslationRepository } from '../repositories/section-translation.repository';
import type { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from '../dto/section.dto';
import { SectionEntity } from '../entities/section.entity';
import { SectionTranslationEntity } from '../entities/section-translation.entity';
import { LanguageRepository } from '@backend/modules/language/repositories/language.repository';
import { ComponentConfigRepository } from '@backend/modules/component-configs/repositories/component-config.repository';
import { ComponentConfigDefaults } from '@backend/modules/component-configs/entities/component-config.entity';
import { SectionType } from '@shared/enums/section.enums';

interface SectionWithResolvedTranslation {
  section: SectionEntity;
  translation: SectionTranslationEntity | null;
  fallbackLocale: string | null;
}

@Injectable()
export class SectionsService {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly sectionTranslationRepository: SectionTranslationRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly componentConfigRepository: ComponentConfigRepository,
    private readonly responseService: ResponseService,
  ) {}

  private async getFallbackLocale(): Promise<string> {
    try {
      const defaultLanguage = await this.languageRepository.findDefault();
      return defaultLanguage?.code ?? 'en';
    } catch (error) {
      return 'en';
    }
  }

  private resolveTranslation(
    translations: SectionTranslationEntity[] | undefined,
    locale: string,
    fallbackLocale: string,
  ): SectionTranslationEntity | null {
    if (!translations || translations.length === 0) {
      return null;
    }

    const exactMatch = translations.find((translation) => translation.locale === locale);
    if (exactMatch) {
      return exactMatch;
    }

    const fallbackMatch = translations.find((translation) => translation.locale === fallbackLocale);
    if (fallbackMatch) {
      return fallbackMatch;
    }

    return translations[0] ?? null;
  }

  private mergeConfig(baseConfig: Record<string, any>, override?: Record<string, any> | null) {
    if (!override) {
      return baseConfig ?? {};
    }

    return {
      ...(baseConfig ?? {}),
      ...override,
    };
  }

  private mapSectionForPublic(section: SectionEntity, locale: string, fallbackLocale: string): SectionWithResolvedTranslation {
    const translation = this.resolveTranslation(section.translations, locale, fallbackLocale);
    return {
      section,
      translation,
      fallbackLocale,
    };
  }

  private async getComponentDefaultsMap(sectionTypes: SectionType[]): Promise<Record<string, ComponentConfigDefaults>> {
    if (!Array.isArray(sectionTypes) || sectionTypes.length === 0) {
      return {};
    }

    const uniqueKeys = Array.from(new Set(sectionTypes));
    const components = await this.componentConfigRepository.findEnabledByKeys(uniqueKeys);

    return components.reduce<Record<string, ComponentConfigDefaults>>((map, component) => {
      map[component.componentKey] = component.defaultConfig ?? {};
      return map;
    }, {});
  }

  private mergeWithComponentDefaults(
    sectionType: SectionType,
    config: Record<string, any>,
    defaultsMap: Record<string, ComponentConfigDefaults>,
  ): Record<string, any> {
    const defaults = defaultsMap[sectionType];
    if (!defaults) {
      return config;
    }

    const merged = { ...(config ?? {}) };
    if (defaults.sidebar && !merged.sidebar) {
      merged.sidebar = defaults.sidebar;
    }

    return merged;
  }

  async list(page: string, locale: string) {
    try {
      const fallbackLocale = await this.getFallbackLocale();
      const sections = await this.sectionRepository.findEnabledByPage(page);
      const defaultsMap = await this.getComponentDefaultsMap(sections.map((section) => section.type));

      return sections.map((section) => {
        const { translation } = this.mapSectionForPublic(section, locale, fallbackLocale);
        const baseConfig = this.mergeConfig(section.config ?? {}, translation?.configOverride ?? null);
        const configWithDefaults = this.mergeWithComponentDefaults(section.type, baseConfig, defaultsMap);

        return {
          id: section.id,
          page: section.page,
          type: section.type,
          position: section.position,
          isEnabled: section.isEnabled,
          version: section.version,
          updatedAt: section.updatedAt,
          config: configWithDefaults,
          translation: translation
            ? {
                locale: translation.locale,
                title: translation.title,
                subtitle: translation.subtitle,
                description: translation.description,
                heroDescription: translation.heroDescription,
              }
            : null,
        };
      });
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load sections',
        error,
      );
    }
  }

  async adminList(page: string) {
    try {
      const sections = await this.sectionRepository.findAllByPage(page);
      return sections.map((section) => ({
        ...section,
        translations: section.translations ?? [],
      }));
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load sections for admin',
        error,
      );
    }
  }

  async create(dto: CreateSectionDto, userId?: string): Promise<SectionEntity> {
    try {
      const position =
        dto.position ?? (await this.sectionRepository.findMaxPosition(dto.page)) + 1;

      const section = this.sectionRepository.create({
        page: dto.page,
        type: dto.type,
        position,
        isEnabled: dto.isEnabled ?? true,
        config: dto.config ?? {},
        createdBy: userId,
        updatedBy: userId,
      });

      const saved = await this.sectionRepository.save(section);

      if (dto.translations && dto.translations.length > 0) {
        const translationEntities = dto.translations.map((translation) =>
          this.sectionTranslationRepository.create({
            sectionId: saved.id,
            locale: translation.locale,
            title: translation.title ?? null,
            subtitle: translation.subtitle ?? null,
            description: translation.description ?? null,
            heroDescription: translation.heroDescription ?? null,
            configOverride: translation.configOverride ?? null,
            createdBy: userId,
            updatedBy: userId,
          }),
        );

        await this.sectionTranslationRepository.saveMultiple(translationEntities);
      }

      return await this.sectionRepository.findById(saved.id) as SectionEntity;
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to create section',
        error,
      );
    }
  }

  async update(id: string, dto: UpdateSectionDto, userId?: string): Promise<SectionEntity> {
    try {
      const existing = await this.sectionRepository.findById(id);
      if (!existing || existing.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.CONFIG,
          OperationCode.UPDATE,
          ErrorLevelCode.NOT_FOUND,
          'Section not found',
        );
      }

      const updatePayload: Partial<SectionEntity> = {
        updatedBy: userId,
      };

      if (dto.page !== undefined) {
        updatePayload.page = dto.page;
      }

      if (dto.type !== undefined) {
        updatePayload.type = dto.type;
      }

      if (dto.position !== undefined) {
        updatePayload.position = dto.position;
      }

      if (dto.isEnabled !== undefined) {
        updatePayload.isEnabled = dto.isEnabled;
      }

      if (dto.config !== undefined) {
        updatePayload.config = dto.config;
      }

      await this.sectionRepository.update(id, updatePayload);

      if (dto.translations) {
        for (const translation of dto.translations) {
          await this.sectionTranslationRepository.upsertTranslation(id, translation.locale, {
            title: translation.title ?? null,
            subtitle: translation.subtitle ?? null,
            description: translation.description ?? null,
            heroDescription: translation.heroDescription ?? null,
            configOverride: translation.configOverride ?? null,
            updatedBy: userId,
            ...(userId ? { createdBy: userId } : {}),
          });
        }
      }

      return (await this.sectionRepository.findById(id)) as SectionEntity;
    } catch (error) {
      if (error instanceof Error && error.message === 'Section not found') {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to update section',
        error,
      );
    }
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    try {
      const section = await this.sectionRepository.findById(id);
      if (!section || section.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.CONFIG,
          OperationCode.DELETE,
          ErrorLevelCode.NOT_FOUND,
          'Section not found',
        );
      }

      if (userId) {
        await this.sectionRepository.update(id, { deletedBy: userId, updatedBy: userId });
      }

      await this.sectionRepository.softDelete(id);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === 'Section not found') {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to delete section',
        error,
      );
    }
  }

  async reorder(dto: ReorderSectionsDto, userId?: string): Promise<void> {
    try {
      const sections = await this.sectionRepository.findAllByPage(dto.page);
      const sectionIds = sections.map((section) => section.id);
      const providedIds = dto.sections.map((item) => item.id);

      const missing = providedIds.filter((id) => !sectionIds.includes(id));
      if (missing.length > 0) {
        throw this.responseService.createTRPCError(
          ModuleCode.CONFIG,
          OperationCode.UPDATE,
          ErrorLevelCode.VALIDATION,
          `Invalid section ids: ${missing.join(', ')}`,
        );
      }

      for (const section of dto.sections) {
        await this.sectionRepository.update(section.id, {
          position: section.position,
          updatedBy: userId,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Invalid section ids')) {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to reorder sections',
        error,
      );
    }
  }
}
