import { Injectable } from '@nestjs/common';
import { Router, Query } from 'nestjs-trpc';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminCurrencyService } from '../services/admin-currency.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

@Injectable()
@Router({ alias: 'clientCurrency' })
export class ClientCurrencyRouter {
  constructor(
    private readonly currencyService: AdminCurrencyService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  async getDefaultCurrency() {
    try {
      const currency = await this.currencyService.getDefaultCurrency();
      return this.responseService.createTrpcSuccess(currency);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to load default currency',
        error,
      );
    }
  }
}
