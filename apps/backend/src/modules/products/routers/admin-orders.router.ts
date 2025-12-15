import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminOrderService } from '../services/admin-order.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { OrderStatus, PaymentStatus, OrderSource } from '../entities/order.entity';

export const orderStatusSchema = z.nativeEnum(OrderStatus);
export const paymentStatusSchema = z.nativeEnum(PaymentStatus);
export const orderSourceSchema = z.nativeEnum(OrderSource);

export const addressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export const getOrdersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  source: orderSourceSchema.optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().optional(),
  orderNumber: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  isPaid: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  shippedDateFrom: z.string().optional(),
  shippedDateTo: z.string().optional(),
  deliveredDateFrom: z.string().optional(),
  deliveredDateTo: z.string().optional(),
});

export const createOrderItemSchema = z.object({
  productId: z.string(),
  productVariantId: z.string().optional(),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  variantName: z.string().optional(),
  variantSku: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0).optional(), // Made optional - will be auto-retrieved if not provided
  discountAmount: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  productImage: z.string().optional(),
  productAttributes: z.record(z.string()).optional(),
  isDigital: z.boolean().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  requiresShipping: z.boolean().optional(),
  isGiftCard: z.boolean().optional(),
  giftCardCode: z.string().optional(),
  notes: z.string().optional(),
  sortOrder: z.number().optional(),
});

export const getProductPriceSchema = z.object({
  productId: z.string(),
  productVariantId: z.string().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerName: z.string().min(1),
  source: orderSourceSchema.optional(),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  paymentMethod: z.string().optional(),
  shippingMethod: z.string().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  discountCode: z.string().optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1),
});

export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  shippingMethod: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  discountCode: z.string().optional(),
  discountAmount: z.number().optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional(),
  cancelledReason: z.string().optional(),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  reason: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: paymentStatusSchema,
  paymentReference: z.string().optional(),
});

export const shipOrderSchema = z.object({
  trackingNumber: z.string().optional(),
  shippingMethod: z.string().optional(),
});

export const refundOrderSchema = z.object({
  refundAmount: z.number().optional(),
  reason: z.string().optional(),
});

export const fulfillOrderItemSchema = z.object({
  quantity: z.number().min(1),
});

const exportFormatSchema = z.enum(['csv', 'json']);

@Router({ alias: 'adminOrders' })
@Injectable()
export class AdminOrdersRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminOrderService)
    private readonly orderService: AdminOrderService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getOrdersQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getOrdersQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.orderService.getAllOrders({
        page: query.page,
        limit: query.limit,
        ...query,
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve orders'
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
      const order = await this.orderService.getOrderById(input.id);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Order not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ orderNumber: z.string() }),
    output: apiResponseSchema,
  })
  async getByOrderNumber(
    @Input() input: { orderNumber: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.getOrderByOrderNumber(input.orderNumber);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Order not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createOrderSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createOrderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.createOrder({
        customerId: input.customerId,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        customerName: input.customerName,
        source: input.source,
        billingAddress: input.billingAddress,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
        currency: input.currency,
        notes: input.notes,
        customerNotes: input.customerNotes,
        internalNotes: input.internalNotes,
        discountCode: input.discountCode,
        isGift: input.isGift,
        giftMessage: input.giftMessage,
        items: input.items.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          productName: item.productName,
          productSku: item.productSku,
          variantName: item.variantName,
          variantSku: item.variantSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          productImage: item.productImage,
          productAttributes: item.productAttributes,
          isDigital: item.isDigital,
          weight: item.weight,
          dimensions: item.dimensions,
          requiresShipping: item.requiresShipping,
          isGiftCard: item.isGiftCard,
          giftCardCode: item.giftCardCode,
          notes: item.notes,
          sortOrder: item.sortOrder,
        })),
      });
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateOrderSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateOrderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const updateDto = {
        ...updateData,
        estimatedDeliveryDate: updateData.estimatedDeliveryDate ? new Date(updateData.estimatedDeliveryDate) : undefined,
      };
      const order = await this.orderService.updateOrder(id, updateDto);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateOrderStatusSchema),
    output: apiResponseSchema,
  })
  async updateStatus(
    @Input() input: { id: string } & z.infer<typeof updateOrderStatusSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.updateOrderStatus(input.id, input.status, input.reason);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update order status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updatePaymentStatusSchema),
    output: apiResponseSchema,
  })
  async updatePaymentStatus(
    @Input() input: { id: string } & z.infer<typeof updatePaymentStatusSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.updatePaymentStatus(
        input.id,
        input.paymentStatus,
        input.paymentReference
      );
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update payment status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string(), reason: z.string().optional() }),
    output: apiResponseSchema,
  })
  async cancel(
    @Input() input: { id: string; reason?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.cancelOrder(input.id, input.reason);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to cancel order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(refundOrderSchema),
    output: apiResponseSchema,
  })
  async refund(
    @Input() input: { id: string } & z.infer<typeof refundOrderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.refundOrder(input.id, input.refundAmount, input.reason);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to refund order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(shipOrderSchema),
    output: apiResponseSchema,
  })
  async ship(
    @Input() input: { id: string } & z.infer<typeof shipOrderSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.shipOrder(
        input.id,
        input.trackingNumber,
        input.shippingMethod
      );
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to ship order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async fulfill(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const order = await this.orderService.fulfillOrder(input.id);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to fulfill order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.orderService.deleteOrder(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete order'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.orderService.getOrderStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve order statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      customerId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async getByCustomer(
    @Input() input: { customerId: string; page: number; limit: number }
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.orderService.getOrdersByCustomer(input.customerId, {
        page: input.page,
        limit: input.limit,
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customer orders'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      customerEmail: z.string().email(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }),
    output: paginatedResponseSchema,
  })
  async getByCustomerEmail(
    @Input() input: { customerEmail: string; page: number; limit: number }
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.orderService.getOrdersByCustomerEmail(input.customerEmail, {
        page: input.page,
        limit: input.limit,
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve customer orders'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getProductPriceSchema,
    output: apiResponseSchema,
  })
  async getProductPrice(
    @Input() input: z.infer<typeof getProductPriceSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const priceInfo = await this.orderService.getProductPriceInfo(input.productId, input.productVariantId);
      return this.responseHandler.createTrpcSuccess(priceInfo);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve product price information'
      );
    }
  }

  // Order item operations
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ itemId: z.string() }).merge(fulfillOrderItemSchema),
    output: apiResponseSchema,
  })
  async fulfillItem(
    @Input() input: { itemId: string } & z.infer<typeof fulfillOrderItemSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const item = await this.orderService.fulfillOrderItem(input.itemId, input.quantity);
      return this.responseHandler.createTrpcSuccess(item);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to fulfill order item'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ itemId: z.string(), quantity: z.number().min(1) }),
    output: apiResponseSchema,
  })
  async refundItem(
    @Input() input: { itemId: string; quantity: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const item = await this.orderService.refundOrderItem(input.itemId, input.quantity);
      return this.responseHandler.createTrpcSuccess(item);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to refund order item'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ itemId: z.string() }),
    output: apiResponseSchema,
  })
  async deleteItem(
    @Input() input: { itemId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.orderService.deleteOrderItem(input.itemId);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete order item'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      filters: z.record(z.any()).optional(),
    }),
    output: apiResponseSchema,
  })
  async estimateExportOrders(
    @Input() input: { filters?: Record<string, any> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const estimate = await this.orderService.estimateOrderExport(input.filters);
      return this.responseHandler.createTrpcSuccess(estimate);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        2,
        30,
        (error as any)?.message || 'Failed to estimate export records',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      format: exportFormatSchema.default('csv'),
      filters: z.record(z.any()).optional(),
    }),
    output: apiResponseSchema,
  })
  async exportOrders(
    @Ctx() ctx: AuthenticatedContext,
    @Input() input: { format: z.infer<typeof exportFormatSchema>; filters?: Record<string, any> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const job = await this.orderService.exportOrders(input.format, input.filters, ctx.user.id);
      return this.responseHandler.createTrpcSuccess(job);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        1,
        30,
        (error as any)?.message || 'Failed to start export job',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      limit: z.number().min(1).max(50).default(10),
      page: z.number().min(1).default(1),
    }),
    output: apiResponseSchema,
  })
  async listExportJobs(
    @Ctx() ctx: AuthenticatedContext,
    @Input() input: { limit: number; page: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const jobs = await this.orderService.listOrderExportJobs(input.limit, ctx.user.id, input.page);
      return this.responseHandler.createTrpcSuccess(jobs);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        2,
        30,
        (error as any)?.message || 'Failed to load export jobs',
      );
    }
  }
}
