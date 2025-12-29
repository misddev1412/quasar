import { Injectable, Logger } from '@nestjs/common';
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
import { AdminOrderService } from '@backend/modules/products/services/admin-order.service';
import { AdminCustomerService } from '@backend/modules/products/services/admin-customer.service';
import {
  SectionMetricResolverContext,
  getSectionMetricDefinition,
} from '@shared/constants/section-stats.metrics';

interface ComponentDefaultsLookup {
  global: Record<string, ComponentConfigDefaults>;
  overrides: Record<string, ComponentConfigDefaults>;
}

interface SectionWithResolvedTranslation {
  section: SectionEntity;
  translation: SectionTranslationEntity | null;
  fallbackLocale: string | null;
}

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly sectionTranslationRepository: SectionTranslationRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly componentConfigRepository: ComponentConfigRepository,
    private readonly responseService: ResponseService,
    private readonly adminOrderService: AdminOrderService,
    private readonly adminCustomerService: AdminCustomerService,
  ) { }

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

    const normalizedLocale = this.normalizeLocale(locale);
    const normalizedFallback = this.normalizeLocale(fallbackLocale);

    const matchByLocale = (target?: string | null) => {
      if (!target) {
        return undefined;
      }
      return translations.find((translation) => this.normalizeLocale(translation.locale) === target);
    };

    const exactMatch = matchByLocale(normalizedLocale);
    if (exactMatch) {
      return exactMatch;
    }

    const fallbackMatch = matchByLocale(normalizedFallback);
    if (fallbackMatch) {
      return fallbackMatch;
    }

    return translations[0] ?? null;
  }

  private normalizeLocale(locale?: string | null): string | null {
    if (!locale) {
      return null;
    }
    const trimmed = locale.trim().toLowerCase();
    if (!trimmed) {
      return null;
    }
    const [base] = trimmed.split(/[-_]/);
    return base || trimmed;
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

  private async getComponentDefaultsMap(sections: SectionEntity[]): Promise<ComponentDefaultsLookup> {
    if (!Array.isArray(sections) || sections.length === 0) {
      return { global: {}, overrides: {} };
    }

    const uniqueKeys = Array.from(new Set(sections.map((section) => section.type)));
    const sectionIds = sections.map((section) => section.id);
    const components = await this.componentConfigRepository.findEnabledByKeys(uniqueKeys, {
      sectionIds,
    });

    return components.reduce<ComponentDefaultsLookup>(
      (map, component) => {
        if (component.sections && component.sections.length > 0) {
          for (const section of component.sections) {
            if (section?.id) {
              map.overrides[section.id] = component.defaultConfig ?? {};
            }
          }
        } else {
          map.global[component.componentKey] = component.defaultConfig ?? {};
        }

        return map;
      },
      { global: {}, overrides: {} },
    );
  }

  private mergeWithComponentDefaults(
    section: SectionEntity,
    config: Record<string, any>,
    defaultsMap: ComponentDefaultsLookup,
  ): Record<string, any> {
    const defaults = defaultsMap.overrides[section.id] ?? defaultsMap.global[section.type];
    if (!defaults) {
      return config;
    }

    const merged = { ...(config ?? {}) };
    if (defaults.sidebar && !merged.sidebar) {
      merged.sidebar = defaults.sidebar;
    }

    return merged;
  }

  private async resolveStatsSectionConfig(
    config: Record<string, any>,
    getStatsContext: () => Promise<SectionMetricResolverContext>,
  ): Promise<Record<string, any>> {
    if (!config || !Array.isArray(config.stats)) {
      return config;
    }

    const requiresDynamicData = config.stats.some(
      (stat: any) =>
        stat &&
        stat.sourceType === 'metric' &&
        typeof stat.metricId === 'string' &&
        stat.metricId.trim().length > 0,
    );

    if (!requiresDynamicData) {
      return config;
    }

    const context = await getStatsContext();
    const resolvedStats = config.stats.map((stat: any) => this.applyMetricToStat(stat, context));

    return {
      ...config,
      stats: resolvedStats,
    };
  }

  private applyMetricToStat(stat: any, context: SectionMetricResolverContext) {
    if (!stat || stat.sourceType !== 'metric' || typeof stat.metricId !== 'string') {
      return stat;
    }

    const definition = getSectionMetricDefinition(stat.metricId);
    if (!definition) {
      return stat;
    }

    const resolvedValue = definition.resolver(context);
    if (resolvedValue === null || resolvedValue === undefined) {
      return stat;
    }

    return {
      ...stat,
      value: resolvedValue,
      prefix: stat.prefix ?? definition.defaultPrefix,
      suffix: stat.suffix ?? definition.defaultSuffix,
    };
  }

  async list(page: string, locale: string) {
    try {
      const fallbackLocale = await this.getFallbackLocale();
      const sections = await this.sectionRepository.findEnabledByPage(page);
      const defaultsMap = await this.getComponentDefaultsMap(sections);

      let statsContextCache: SectionMetricResolverContext | null = null;
      const getStatsContext = async (): Promise<SectionMetricResolverContext> => {
        if (statsContextCache) {
          return statsContextCache;
        }

        const [orders, customers] = await Promise.all([
          this.adminOrderService.getOrderStats().catch((error) => {
            this.logger.warn(`Failed to load order stats for sections: ${error.message}`);
            return null;
          }),
          this.adminCustomerService.getCustomerStats().catch((error) => {
            this.logger.warn(`Failed to load customer stats for sections: ${error.message}`);
            return null;
          }),
        ]);

        statsContextCache = {
          orders: orders ?? undefined,
          customers: customers ?? undefined,
        };
        return statsContextCache;
      };

      const resolvedSections = await Promise.all(
        sections.map(async (section) => {
          const { translation } = this.mapSectionForPublic(section, locale, fallbackLocale);
          const baseConfig = this.mergeConfig(section.config ?? {}, translation?.configOverride ?? null);
          const configWithDefaults = this.mergeWithComponentDefaults(section, baseConfig, defaultsMap);
          const config =
            section.type === SectionType.STATS
              ? await this.resolveStatsSectionConfig(configWithDefaults, getStatsContext)
              : configWithDefaults;

          return {
            id: section.id,
            page: section.page,
            type: section.type,
            position: section.position,
            isEnabled: section.isEnabled,
            version: section.version,
            updatedAt: section.updatedAt,
            config,
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
        }),
      );

      return resolvedSections;
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

  async adminList(page?: string) {
    try {
      const sections = page
        ? await this.sectionRepository.findAllByPage(page)
        : await this.sectionRepository.findAll();
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

  async clone(id: string, userId?: string): Promise<SectionEntity> {
    try {
      const sourceSection = await this.sectionRepository.findById(id);
      if (!sourceSection || sourceSection.deletedAt) {
        throw this.responseService.createTRPCError(
          ModuleCode.CONFIG,
          OperationCode.CREATE,
          ErrorLevelCode.NOT_FOUND,
          'Source section not found',
        );
      }

      const maxPosition = await this.sectionRepository.findMaxPosition(sourceSection.page);

      const newSection = this.sectionRepository.create({
        page: sourceSection.page,
        type: sourceSection.type,
        position: maxPosition + 1,
        isEnabled: false,
        config: sourceSection.config ? JSON.parse(JSON.stringify(sourceSection.config)) : {},
        createdBy: userId,
        updatedBy: userId,
      });

      const savedSection = await this.sectionRepository.save(newSection);

      if (sourceSection.translations && sourceSection.translations.length > 0) {
        const newTranslations = sourceSection.translations.map((t) =>
          this.sectionTranslationRepository.create({
            sectionId: savedSection.id,
            locale: t.locale,
            title: t.title ? `${t.title} (Copy)` : null,
            subtitle: t.subtitle,
            description: t.description,
            heroDescription: t.heroDescription,
            configOverride: t.configOverride
              ? JSON.parse(JSON.stringify(t.configOverride))
              : null,
            createdBy: userId,
            updatedBy: userId,
          }),
        );

        await this.sectionTranslationRepository.saveMultiple(newTranslations);
      }

      return (await this.sectionRepository.findById(savedSection.id)) as SectionEntity;
    } catch (error) {
      if (error instanceof Error && error.message === 'Source section not found') {
        throw error;
      }

      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to clone section',
        error,
      );
    }
  }
}
