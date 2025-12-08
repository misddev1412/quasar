import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { PurchaseOrderService, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, ReceiveItemsDto } from '../services/purchase-order.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  expectedDeliveryDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(z.object({
    productVariantId: z.string().uuid(),
    quantityOrdered: z.number().min(1),
    unitCost: z.number().min(0),
    notes: z.string().optional(),
  })).min(1),
});

const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  expectedDeliveryDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    productVariantId: z.string().uuid(),
    quantityOrdered: z.number().min(1),
    unitCost: z.number().min(0),
    notes: z.string().optional(),
  })).optional(),
});

const receiveItemsSchema = z.object({
  items: z.array(z.object({
    purchaseOrderItemId: z.string().uuid(),
    quantityReceived: z.number().min(1),
    locationId: z.string().uuid().optional(),
    batchNumber: z.string().optional(),
    expiryDate: z.string().transform((str) => new Date(str)).optional(),
    notes: z.string().optional(),
  })).min(1),
});

const purchaseOrderQuerySchema = z.object({
  status: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
});

const uuidSchema = z.object({
  id: z.string().uuid(),
});

@Injectable()
@Router({ alias: 'adminPurchaseOrders' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminPurchaseOrdersRouter {
  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: purchaseOrderQuerySchema,
    output: apiResponseSchema
  })
  async list(
    @Input() query: z.infer<typeof purchaseOrderQuerySchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      let orders;
      if (query.status) {
        orders = await this.purchaseOrderService.getPurchaseOrdersByStatus(query.status);
      } else if (query.supplierId) {
        orders = await this.purchaseOrderService.getPurchaseOrdersBySupplier(query.supplierId);
      } else if (query.warehouseId) {
        orders = await this.purchaseOrderService.getPurchaseOrdersByWarehouse(query.warehouseId);
      } else {
        orders = await this.purchaseOrderService.getAllPurchaseOrders();
      }

      return this.responseHandler.createTrpcSuccess(orders);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to fetch purchase orders'
      );
    }
  }

  @Mutation({
    input: createPurchaseOrderSchema,
    output: apiResponseSchema
  })
  async create(
    @Input() input: z.infer<typeof createPurchaseOrderSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const createDto: CreatePurchaseOrderDto = {
        supplierId: input.supplierId,
        warehouseId: input.warehouseId,
        expectedDeliveryDate: input.expectedDeliveryDate,
        notes: input.notes,
        termsAndConditions: input.termsAndConditions,
        createdBy: ctx.user?.id,
        items: input.items.map(item => ({
          productVariantId: item.productVariantId,
          quantityOrdered: item.quantityOrdered,
          unitCost: item.unitCost,
          notes: item.notes,
        })),
      };
      const order = await this.purchaseOrderService.createPurchaseOrder(createDto);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create purchase order'
      );
    }
  }

  @Query({
    input: uuidSchema,
    output: apiResponseSchema
  })
  async detail(
    @Input() input: z.infer<typeof uuidSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const order = await this.purchaseOrderService.getPurchaseOrder(input.id);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Purchase order not found'
      );
    }
  }

  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updatePurchaseOrderSchema),
    output: apiResponseSchema
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updatePurchaseOrderSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const { id, ...inputData } = input;
      const updateDto: UpdatePurchaseOrderDto = {
        supplierId: inputData.supplierId,
        warehouseId: inputData.warehouseId,
        expectedDeliveryDate: inputData.expectedDeliveryDate,
        notes: inputData.notes,
        termsAndConditions: inputData.termsAndConditions,
        items: inputData.items?.map(item => ({
          id: item.id,
          productVariantId: item.productVariantId,
          quantityOrdered: item.quantityOrdered,
          unitCost: item.unitCost,
          notes: item.notes,
        })),
      };
      const order = await this.purchaseOrderService.updatePurchaseOrder(id, updateDto);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update purchase order'
      );
    }
  }

  @Mutation({
    input: uuidSchema,
    output: apiResponseSchema
  })
  async delete(
    @Input() input: z.infer<typeof uuidSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.purchaseOrderService.deletePurchaseOrder(input.id);
      return this.responseHandler.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to delete purchase order'
      );
    }
  }

  @Mutation({
    input: uuidSchema,
    output: apiResponseSchema
  })
  async approve(
    @Input() input: z.infer<typeof uuidSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const order = await this.purchaseOrderService.approvePurchaseOrder(input.id, ctx.user?.id);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.APPROVE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to approve purchase order'
      );
    }
  }

  @Mutation({
    input: uuidSchema,
    output: apiResponseSchema
  })
  async send(
    @Input() input: z.infer<typeof uuidSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const order = await this.purchaseOrderService.sendPurchaseOrder(input.id);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.SEND,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to send purchase order'
      );
    }
  }

  @Mutation({
    input: uuidSchema,
    output: apiResponseSchema
  })
  async cancel(
    @Input() input: z.infer<typeof uuidSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const order = await this.purchaseOrderService.cancelPurchaseOrder(input.id);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.CANCEL,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to cancel purchase order'
      );
    }
  }

  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(receiveItemsSchema),
    output: apiResponseSchema
  })
  async receiveItems(
    @Input() input: { id: string } & z.infer<typeof receiveItemsSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const { id, ...receiveData } = input;
      const receiveDto: ReceiveItemsDto = {
        items: receiveData.items.map(item => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          quantityReceived: item.quantityReceived,
          locationId: item.locationId,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          notes: item.notes,
        })),
        receivedBy: ctx.user?.id,
      };
      const order = await this.purchaseOrderService.receiveItems(id, receiveDto);
      return this.responseHandler.createTrpcSuccess(order);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.RECEIVE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to receive items'
      );
    }
  }

  @Query({
    output: apiResponseSchema
  })
  async getOverdueOrders(
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const orders = await this.purchaseOrderService.getOverdueOrders();
      return this.responseHandler.createTrpcSuccess(orders);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to fetch overdue orders'
      );
    }
  }

  @Query({
    output: apiResponseSchema
  })
  async getPendingReceivingOrders(
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const orders = await this.purchaseOrderService.getPendingReceivingOrders();
      return this.responseHandler.createTrpcSuccess(orders);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to fetch pending receiving orders'
      );
    }
  }

  @Query({
    input: z.object({ warehouseId: z.string().uuid().optional() }),
    output: apiResponseSchema
  })
  async getOrderStats(
    @Input() input: { warehouseId?: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const stats = await this.purchaseOrderService.getOrderStats(input.warehouseId);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.INVENTORY,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to fetch order statistics'
      );
    }
  }
}