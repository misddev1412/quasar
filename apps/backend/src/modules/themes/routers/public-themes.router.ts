import { Inject, Injectable } from '@nestjs/common';
import { Router, Query } from 'nestjs-trpc';
import { PublicThemesService } from '../services/public-themes.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';

@Router({ alias: 'publicThemes' })
@Injectable()
export class PublicThemesRouter {
  constructor(
    @Inject(PublicThemesService)
    private readonly publicThemesService: PublicThemesService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  async getActiveTheme() {
    try {
      const theme = await this.publicThemesService.getActiveTheme();
      return this.responseService.createTrpcSuccess(theme);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.SETTINGS,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to load storefront theme',
      );
    }
  }
}
