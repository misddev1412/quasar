import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '../../shared/services/response.service';
import { ClientOrderService } from '../services/client-order.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';

const getOrdersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  sortBy: z.enum(['orderDate', 'totalAmount', 'status']).default('orderDate'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

const getOrderByIdSchema = z.object({
  id: z.string(),
});

@Router({ alias: 'clientOrders' })
@Injectable()
export class ClientOrdersRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(ClientOrderService)
    private readonly orderService: ClientOrderService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getOrdersQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getOrdersQuerySchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }

      const filters = {
        page: query.page,
        limit: query.limit,
        status: query.status as any,
        paymentStatus: query.paymentStatus as any,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        userId: ctx.user.id,
      };

      const result = await this.orderService.getUserOrders(filters);

      // Transform result to match expected schema
      const transformedResult = {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        items: result.data,
      };

      return this.responseHandler.createTrpcSuccess(transformedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Failed to retrieve orders'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getOrderByIdSchema,
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: z.infer<typeof getOrderByIdSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }

      const order = await this.orderService.getOrderById(input.id, ctx.user.id);

      if (!order) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PRODUCT,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Order not found'
        );
      }

      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Order not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: paginatedResponseSchema,
  })
  async recent(
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }

      const filters = {
        page: 1,
        limit: 5,
        status: undefined as any,
        paymentStatus: undefined as any,
        sortBy: 'orderDate',
        sortOrder: 'DESC' as const,
        userId: ctx.user.id,
      };

      const result = await this.orderService.getUserOrders(filters);

      // Transform result to match expected schema
      const transformedResult = {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        items: result.data,
      };

      return this.responseHandler.createTrpcSuccess(transformedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Failed to retrieve recent orders'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async active(
    @Input() input: { page: number; limit: number },
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }

      const filters = {
        page: input.page,
        limit: input.limit,
        status: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] as any,
        paymentStatus: undefined as any,
        sortBy: 'orderDate',
        sortOrder: 'DESC' as const,
        userId: ctx.user.id,
      };

      const result = await this.orderService.getUserOrders(filters);

      // Transform result to match expected schema
      const transformedResult = {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        items: result.data,
      };

      return this.responseHandler.createTrpcSuccess(transformedResult);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Failed to retrieve active orders'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      id: z.string(),
      reason: z.string().min(1).max(500),
    }),
    output: apiResponseSchema,
  })
  async cancelOrder(
    @Input() input: { id: string; reason: string },
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!ctx.user?.id) {
        throw new Error('User not authenticated');
      }

      await this.orderService.cancelOrder(input.id, ctx.user.id, input.reason);

      return this.responseHandler.createTrpcSuccess({
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to cancel order'
      );
    }
  }
}