import { Inject, Injectable } from '@nestjs/common';
import { Router, Query } from 'nestjs-trpc';
import { ResponseService } from '../../shared/services/response.service';
import { AdminLanguageService } from '../services/admin-language.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';

@Router({ alias: 'clientLanguage' })
@Injectable()
export class ClientLanguageRouter {
  constructor(
    @Inject(AdminLanguageService)
    private readonly adminLanguageService: AdminLanguageService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  async getActiveLanguages() {
    try {
      const languages = await this.adminLanguageService.getActiveLanguages();
      return this.responseHandler.createTrpcSuccess(languages);
    } catch (error) {
      // For this public endpoint, handle errors gracefully
      console.warn('Failed to get active languages:', error.message);
      return this.responseHandler.createTrpcSuccess([]);
    }
  }

  @Query({
    output: apiResponseSchema,
  })
  async getDefaultLanguage() {
    try {
      const language = await this.adminLanguageService.getDefaultLanguage();
      return this.responseHandler.createTrpcSuccess(language);
    } catch (error) {
      console.warn('Failed to get default language:', error.message);
      // Return English as fallback
      return this.responseHandler.createTrpcSuccess({
        id: '1',
        code: 'en',
        name: 'English',
        nativeName: 'English',
        icon: '🇺🇸',
        isActive: true,
        isDefault: true,
        sortOrder: 0,
      });
    }
  }
}