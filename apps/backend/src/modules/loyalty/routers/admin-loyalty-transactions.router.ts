import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminLoyaltyTransactionService, CreateLoyaltyTransactionDto } from '../services/admin-loyalty-transaction.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { TransactionType } from '../entities/loyalty-transaction.entity';

export const transactionTypeSchema = z.nativeEnum(TransactionType);

export const getLoyaltyTransactionsQuerySchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  customerId: z.string().optional(),
  type: transactionTypeSchema.optional(),
  orderId: z.string().optional(),
  rewardId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'points', 'balanceAfter']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
});

export const createLoyaltyTransactionSchema = z.object({
  customerId: z.string(),
  points: z.number(),
  type: transactionTypeSchema,
  description: z.string().min(1),
  orderId: z.string().optional(),
  rewardId: z.string().optional(),
  balanceAfter: z.number(),
  expiresAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export const adjustPointsSchema = z.object({
  customerId: z.string(),
  points: z.number(),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

@Router({ alias: 'adminLoyaltyTransactions' })
@Injectable()
export class AdminLoyaltyTransactionsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminLoyaltyTransactionService)
    private readonly loyaltyTransactionService: AdminLoyaltyTransactionService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getLoyaltyTransactionsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getLoyaltyTransactionsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.loyaltyTransactionService.getAllTransactions({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        search: query.search,
        customerId: query.customerId,
        type: query.type,
        orderId: query.orderId,
        rewardId: query.rewardId,
        sortBy: query.sortBy ?? 'createdAt',
        sortOrder: query.sortOrder ?? 'DESC',
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve loyalty transactions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transaction = await this.loyaltyTransactionService.getTransactionById(input.id);
      return this.responseHandler.createTrpcSuccess(transaction);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Loyalty transaction not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createLoyaltyTransactionSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createLoyaltyTransactionSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transaction = await this.loyaltyTransactionService.createTransaction(input as CreateLoyaltyTransactionDto);
      return this.responseHandler.createTrpcSuccess(transaction);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create loyalty transaction'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: adjustPointsSchema,
    output: apiResponseSchema,
  })
  async adjustPoints(
    @Input() input: z.infer<typeof adjustPointsSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transaction = await this.loyaltyTransactionService.createAdjustmentTransaction(
        input.customerId,
        input.points,
        input.description,
        {
          ...input.metadata,
          adjustedBy: ctx?.user?.id,
          adjustedAt: new Date(),
        }
      );
      return this.responseHandler.createTrpcSuccess(transaction);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to adjust points'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ customerId: z.string() }),
    output: apiResponseSchema,
  })
  async customerTransactions(
    @Input() input: { customerId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transactions = await this.loyaltyTransactionService.getCustomerTransactions(input.customerId);
      return this.responseHandler.createTrpcSuccess(transactions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customer transactions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ customerId: z.string() }),
    output: apiResponseSchema,
  })
  async customerBalance(
    @Input() input: { customerId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const balance = await this.loyaltyTransactionService.getCustomerCurrentBalance(input.customerId);
      return this.responseHandler.createTrpcSuccess({ balance });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customer balance'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ orderId: z.string() }),
    output: apiResponseSchema,
  })
  async orderTransactions(
    @Input() input: { orderId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transactions = await this.loyaltyTransactionService.getTransactionsByOrder(input.orderId);
      return this.responseHandler.createTrpcSuccess(transactions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve order transactions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ days: z.number().min(1).max(365).default(30) }),
    output: apiResponseSchema,
  })
  async stats(
    @Input() input: { days: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.loyaltyTransactionService.getTransactionStats(input.days);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve transaction statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(50).default(10) }),
    output: apiResponseSchema,
  })
  async topCustomers(
    @Input() input: { days: number; limit: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const topCustomers = await this.loyaltyTransactionService.getTopCustomers(input.days, input.limit);
      return this.responseHandler.createTrpcSuccess(topCustomers);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve top customers'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(50).default(10) }),
    output: apiResponseSchema,
  })
  async popularRewards(
    @Input() input: { days: number; limit: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const popularRewards = await this.loyaltyTransactionService.getPopularRewards(input.days, input.limit);
      return this.responseHandler.createTrpcSuccess(popularRewards);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve popular rewards'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ days: z.number().min(1).max(365).default(30), limit: z.number().min(1).max(100).default(20) }),
    output: apiResponseSchema,
  })
  async recent(
    @Input() input: { days: number; limit: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const transactions = await this.loyaltyTransactionService.getRecentTransactions(input.days, input.limit);
      return this.responseHandler.createTrpcSuccess(transactions);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        25, // ModuleCode.LOYALTY
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve recent transactions'
      );
    }
  }
}