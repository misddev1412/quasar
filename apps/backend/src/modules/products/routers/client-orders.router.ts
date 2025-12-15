import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '../../shared/services/response.service';
import { ClientOrderService, type CreateClientOrderDto } from '../services/client-order.service';
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

const lookupOrderSchema = z.object({
  orderNumber: z.string().min(1),
  emailOrPhone: z.string().min(1),
});

const checkoutAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  phone: z.string().optional(),
});

const checkoutItemSchema = z.object({
  productId: z.string(),
  productVariantId: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  variantName: z.string().optional(),
  variantSku: z.string().optional(),
  productImage: z.string().optional(),
  productAttributes: z.record(z.string()).optional(),
});

const checkoutTotalsSchema = z.object({
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  currency: z.string().max(3).optional(),
});

const checkoutPaymentMethodSchema = z.object({
  type: z.string().min(1),
  cardholderName: z.string().optional(),
  last4: z.string().optional(),
  provider: z.string().optional(),
  reference: z.string().optional(),
  paymentMethodId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

const createClientOrderSchema = z.object({
  email: z.string().email(),
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  shippingMethodId: z.string().optional(),
  paymentMethod: checkoutPaymentMethodSchema,
  orderNotes: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1),
  totals: checkoutTotalsSchema.optional(),
  agreeToMarketing: z.boolean().optional(),
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

  /**
   * Public endpoint for guest order lookup
   * Allows customers to track their orders using order number and email or phone
   * No authentication required
   */
  @Query({
    input: lookupOrderSchema,
    output: apiResponseSchema,
  })
  async lookup(
    @Input() input: z.infer<typeof lookupOrderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.lookupOrderByNumberAndContact(
        input.orderNumber,
        input.emailOrPhone
      );

      if (!order) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PRODUCT,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Order not found. Please check your order number and email address.'
        );
      }

      // Return sanitized order data for public view
      const sanitizedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
        totalAmount: Number(order.totalAmount ?? 0),
        subtotal: Number(order.subtotal ?? 0),
        taxAmount: Number(order.taxAmount ?? 0),
        shippingCost: Number(order.shippingCost ?? 0),
        discountAmount: Number(order.discountAmount ?? 0),
        currency: order.currency,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        shippedDate: order.shippedDate,
        deliveredDate: order.deliveredDate,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        items: order.items?.map(item => ({
          id: item.id,
          productName: item.productName,
          productImage: item.productImage,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice ?? 0),
          totalPrice: Number(item.totalPrice ?? 0),
          productAttributes: item.productAttributes,
        })) || [],
        fulfillments: order.fulfillments?.map(fulfillment => ({
          id: fulfillment.id,
          status: fulfillment.status,
          trackingNumber: fulfillment.trackingNumber,
          carrier: fulfillment.shippingProvider?.name || fulfillment.shippingProvider?.code,
          shippedAt: fulfillment.shippedDate,
          deliveredAt: fulfillment.actualDeliveryDate,
          estimatedDeliveryDate: fulfillment.estimatedDeliveryDate,
        })) || [],
      };

      return this.responseHandler.createTrpcSuccess(sanitizedOrder);
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Failed to lookup order'
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

  @Mutation({
    input: createClientOrderSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createClientOrderSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { order, paymentInstruction } = await this.orderService.createOrder(input as CreateClientOrderDto, ctx.user?.id);

      const sanitizedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: Number(order.totalAmount ?? 0),
        currency: order.currency,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        createdAt:
          order.createdAt instanceof Date
            ? order.createdAt.toISOString()
            : order.createdAt,
      };

      const payment = paymentInstruction
        ? {
            provider: paymentInstruction.provider,
            displayName: paymentInstruction.providerDisplayName,
            checkoutUrl: paymentInstruction.checkoutUrl,
            qrCode: paymentInstruction.qrCode,
            paymentLinkId: paymentInstruction.paymentLinkId,
            orderCode: paymentInstruction.orderCode,
            expiresAt: paymentInstruction.expiresAt,
          }
        : undefined;

      return this.responseHandler.createTrpcSuccess({
        order: sanitizedOrder,
        payment,
        isGuestCheckout: !ctx.user?.id,
      });
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create order'
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
