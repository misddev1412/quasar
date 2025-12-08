import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ResponseService } from '../../shared/services/response.service';
import { AdminCustomerTransactionService } from '../services/admin/admin-customer-transaction.service';
import {
  CustomerTransactionStatus,
  CustomerTransactionType,
  LedgerAccountType,
  LedgerEntryDirection,
  TransactionChannel,
} from '../entities/customer-transaction.entity';
import { CreateCustomerTransactionDto } from '../dto/admin/admin-customer-transaction.dto';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const transactionTypeSchema = z.nativeEnum(CustomerTransactionType);
const transactionStatusSchema = z.nativeEnum(CustomerTransactionStatus);
const ledgerDirectionSchema = z.nativeEnum(LedgerEntryDirection);
const transactionChannelSchema = z.nativeEnum(TransactionChannel);
const ledgerAccountSchema = z.nativeEnum(LedgerAccountType);

const listTransactionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: transactionStatusSchema.optional(),
  type: transactionTypeSchema.optional(),
  direction: ledgerDirectionSchema.optional(),
  currency: z.string().length(3).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'status']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  relatedEntityType: z.string().max(50).optional(),
  relatedEntityId: z.string().uuid().optional(),
});

const createTransactionSchema = z.object({
  customerId: z.string().uuid(),
  type: transactionTypeSchema,
  direction: ledgerDirectionSchema,
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
  referenceId: z.string().optional(),
  channel: transactionChannelSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  status: transactionStatusSchema.optional(),
  counterAccount: ledgerAccountSchema.optional(),
  relatedEntityType: z.string().max(50).optional(),
  relatedEntityId: z.string().uuid().optional(),
});

const updateTransactionStatusSchema = z.object({
  id: z.string().uuid(),
  status: transactionStatusSchema,
  failureReason: z.string().optional(),
  processedAt: z.string().optional(),
});

const statsQuerySchema = z.object({
  currency: z.string().length(3).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).optional();

@Router({ alias: 'adminCustomerTransactions' })
@Injectable()
export class AdminCustomerTransactionsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminCustomerTransactionService)
    private readonly adminCustomerTransactionService: AdminCustomerTransactionService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: listTransactionsSchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() input: z.infer<typeof listTransactionsSchema>,
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.adminCustomerTransactionService.listTransactions({
        page: input.page,
        limit: input.limit,
        search: input.search,
        status: input.status,
        type: input.type,
        direction: input.direction,
        currency: input.currency,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        customerId: input.customerId,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
      });

      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSACTION,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve customer transactions',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: { id: string },
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transaction = await this.adminCustomerTransactionService.getTransactionById(input.id);
      return this.responseHandler.createTrpcSuccess(transaction);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSACTION,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Transaction not found',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createTransactionSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: CreateCustomerTransactionDto,
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transaction = await this.adminCustomerTransactionService.createTransaction(
        {
          ...input,
        },
        ctx.user?.id,
      );

      return this.responseHandler.createTrpcSuccess(transaction);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSACTION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create transaction',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateTransactionStatusSchema,
    output: apiResponseSchema,
  })
  async updateStatus(
    @Input() input: z.infer<typeof updateTransactionStatusSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const processedAt = input.processedAt ? new Date(input.processedAt) : undefined;

      const transaction = await this.adminCustomerTransactionService.updateTransactionStatus(
        input.id,
        {
          status: input.status,
          failureReason: input.failureReason,
          processedAt: processedAt && !isNaN(processedAt.getTime()) ? processedAt : undefined,
        },
        ctx.user?.id,
      );

      return this.responseHandler.createTrpcSuccess(transaction);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSACTION,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to update transaction status',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: statsQuerySchema,
    output: apiResponseSchema,
  })
  async stats(
    @Input() input: z.infer<typeof statsQuerySchema> = {},
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.adminCustomerTransactionService.getTransactionStats(input);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.TRANSACTION,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve transaction stats',
        error,
      );
    }
  }
}
