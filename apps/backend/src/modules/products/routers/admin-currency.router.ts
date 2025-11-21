import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AdminCurrencyService } from '../services/admin-currency.service';

const getCurrenciesSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const createCurrencySchema = z.object({
  code: z.string().min(3, 'Code must be 3 characters').max(3, 'Code must be 3 characters'),
  name: z.string().min(2).max(100),
  symbol: z.string().min(1).max(10),
  exchangeRate: z.number().positive().optional(),
  decimalPlaces: z.number().int().min(0).max(8).optional(),
  format: z.string().min(3).max(30).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const updateCurrencySchema = z.object({
  code: z.string().min(3, 'Code must be 3 characters').max(3, 'Code must be 3 characters').optional(),
  name: z.string().min(2).max(100).optional(),
  symbol: z.string().min(1).max(10).optional(),
  exchangeRate: z.number().positive().optional(),
  decimalPlaces: z.number().int().min(0).max(8).optional(),
  format: z.string().min(3).max(30).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const currencyIdSchema = z.object({
  id: z.string().uuid('Invalid currency id'),
});

@Injectable()
@Router({ alias: 'adminCurrency' })
export class AdminCurrencyRouter {
  constructor(
    private readonly currencyService: AdminCurrencyService,
    private readonly responseService: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: currencyIdSchema,
    output: apiResponseSchema,
  })
  async getCurrencyById(@Input() input: z.infer<typeof currencyIdSchema>) {
    try {
      const currency = await this.currencyService.findById(input.id);
      return this.responseService.createTrpcSuccess(currency);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to load currency',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getCurrenciesSchema,
    output: paginatedResponseSchema,
  })
  async getCurrencies(@Input() input: z.infer<typeof getCurrenciesSchema>) {
    try {
      const result = await this.currencyService.list(input);
      return this.responseService.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to load currencies',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateCurrencySchema,
    output: apiResponseSchema,
  })
  async updateCurrency(@Input() input: z.infer<typeof updateCurrencySchema> & { id: string }) {
    try {
      const currency = await this.currencyService.update(input.id, input);
      return this.responseService.createTrpcSuccess(currency);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to update currency',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createCurrencySchema,
    output: apiResponseSchema,
  })
  async createCurrency(@Input() input: z.infer<typeof createCurrencySchema>) {
    try {
      const currency = await this.currencyService.create(input);
      return this.responseService.createTrpcSuccess(currency);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to create currency',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: currencyIdSchema,
    output: apiResponseSchema,
  })
  async deleteCurrency(@Input() input: z.infer<typeof currencyIdSchema>) {
    try {
      await this.currencyService.delete(input.id);
      return this.responseService.createTrpcSuccess({ message: 'Currency deleted successfully' });
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to delete currency',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: currencyIdSchema,
    output: apiResponseSchema,
  })
  async toggleCurrencyStatus(@Input() input: z.infer<typeof currencyIdSchema>) {
    try {
      const currency = await this.currencyService.toggleStatus(input.id);
      return this.responseService.createTrpcSuccess(currency);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to update currency status',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: currencyIdSchema,
    output: apiResponseSchema,
  })
  async setDefaultCurrency(@Input() input: z.infer<typeof currencyIdSchema>) {
    try {
      const currency = await this.currencyService.setDefault(input.id);
      return this.responseService.createTrpcSuccess(currency);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to set default currency',
        error,
      );
    }
  }
}
