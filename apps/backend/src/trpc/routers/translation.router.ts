import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { TranslationService } from '../../modules/translation/services/translation.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../middlewares/admin-role.middleware';
import { AdminLanguageService } from '../../modules/language/services/admin-language.service';
import { ApiStatusCodes, MessageLevelCode } from '@shared';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema } from '../schemas/response.schemas';

// Zod schemas for validation
const supportedLocalesSchema = z.enum(['vi', 'en']);

const getTranslationsSchema = z.object({
  locale: supportedLocalesSchema,
});

const getTranslationSchema = z.object({
  key: z.string(),
  locale: supportedLocalesSchema,
  defaultValue: z.string().optional(),
});

const createTranslationSchema = z.object({
  key: z.string(),
  locale: supportedLocalesSchema,
  value: z.string(),
  namespace: z.string().optional(),
});

const updateTranslationSchema = z.object({
  key: z.string(),
  locale: supportedLocalesSchema,
  value: z.string(),
  namespace: z.string().optional(),
});

const deleteTranslationSchema = z.object({
  key: z.string(),
  locale: supportedLocalesSchema,
});

@Router({ alias: 'translation' })
@Injectable()
export class TranslationRouter {
  constructor(
    @Inject(TranslationService)
    private readonly translationService: TranslationService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminLanguageService)
    private readonly languageService: AdminLanguageService,
  ) { }

  @Query({
    output: apiResponseSchema,
  })
  async getLocaleConfig(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const [defaultLang, activeLangs] = await Promise.all([
        this.languageService.getDefaultLanguage(),
        this.languageService.getActiveLanguages(),
      ]);

      const config = {
        defaultLocale: defaultLang.code,
        supportedLocales: activeLangs.map(l => l.code),
      };

      return this.responseHandler.createSuccessResponse(
        ModuleCode.TRANSLATION,
        OperationCode.READ,
        MessageLevelCode.SUCCESS,
        'Locale configuration retrieved successfully',
        config
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to get locale configuration'
      );
    }
  }

  @Query({
    input: getTranslationsSchema,
    output: apiResponseSchema,
  })
  async getTranslations(
    @Input() input: z.infer<typeof getTranslationsSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translations = await this.translationService.getTranslations(input.locale);

      const result = {
        locale: input.locale,
        translations,
      };

      return this.responseHandler.createSuccessResponse(
        ModuleCode.TRANSLATION,
        OperationCode.READ,
        MessageLevelCode.SUCCESS,
        'Translations retrieved successfully',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to get translations'
      );
    }
  }

  @Query({
    input: getTranslationSchema,
    output: apiResponseSchema,
  })
  async getTranslation(
    @Input() input: z.infer<typeof getTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.translationService.getTranslation(
        input.key,
        input.locale,
        input.defaultValue
      );

      return this.responseHandler.createSuccessResponse(
        ModuleCode.TRANSLATION,
        OperationCode.READ,
        MessageLevelCode.SUCCESS,
        'Translation retrieved successfully',
        { key: input.key, value: translation }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to get translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createTranslationSchema,
    output: apiResponseSchema,
  })
  async createTranslation(
    @Input() input: z.infer<typeof createTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.translationService.createOrUpdateTranslation(
        input.key,
        input.locale,
        input.value,
        input.namespace
      );

      return this.responseHandler.createCreatedResponse(
        ModuleCode.TRANSLATION,
        'translation',
        translation
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateTranslationSchema,
    output: apiResponseSchema,
  })
  async updateTranslation(
    @Input() input: z.infer<typeof updateTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.translationService.createOrUpdateTranslation(
        input.key,
        input.locale,
        input.value,
        input.namespace
      );

      return this.responseHandler.createUpdatedResponse(
        ModuleCode.TRANSLATION,
        'translation',
        translation
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: deleteTranslationSchema,
    output: apiResponseSchema,
  })
  async deleteTranslation(
    @Input() input: z.infer<typeof deleteTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const success = await this.translationService.deleteTranslation(
        input.key,
        input.locale
      );

      if (!success) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'Translation not found',
          'NOT_FOUND'
        );
      }

      return this.responseHandler.createDeletedResponse(
        ModuleCode.TRANSLATION,
        'translation'
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to delete translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    output: apiResponseSchema,
  })
  async clearCache(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      this.translationService.clearCache();

      return this.responseHandler.createSuccessResponse(
        ModuleCode.TRANSLATION,
        OperationCode.UPDATE,
        MessageLevelCode.SUCCESS,
        'Translation cache cleared successfully'
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSLATION,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to clear translation cache'
      );
    }
  }
} 