import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { OrderFulfillmentService } from '../services/order-fulfillment.service';
import { FulfillmentItemRepository } from '../repositories/fulfillment-item.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { FulfillmentStatus, PriorityLevel, PackagingType } from '../entities/order-fulfillment.entity';
import { FulfillmentItemStatus } from '../entities/fulfillment-item.entity';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const fulfillmentStatusSchema = z.nativeEnum(FulfillmentStatus);
const fulfillmentPrioritySchema = z.nativeEnum(PriorityLevel);
const fulfillmentItemStatusSchema = z.nativeEnum(FulfillmentItemStatus);
const fulfillmentPackagingSchema = z.nativeEnum(PackagingType);

const fulfillmentAddressSchema = z.object({
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

const fulfillmentItemInputSchema = z.object({
  orderItemId: z.string().uuid(),
  quantity: z.number().positive(),
  locationPickedFrom: z.string().optional(),
  batchNumber: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  expiryDate: z.string().datetime().optional(),
  conditionNotes: z.string().optional(),
  packagingNotes: z.string().optional(),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
});

const listFulfillmentsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: fulfillmentStatusSchema.optional(),
  priorityLevel: fulfillmentPrioritySchema.optional(),
  shippingProviderId: z.string().uuid().optional(),
  hasTrackingNumber: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  orderId: z.string().optional(),
});

const fulfillmentIdSchema = z.object({
  id: z.string().uuid(),
});

const createFulfillmentInputSchema = z.object({
  orderId: z.string().uuid(),
  priorityLevel: fulfillmentPrioritySchema.optional(),
  shippingProviderId: z.string().uuid().optional(),
  packagingType: fulfillmentPackagingSchema.optional(),
  shippingAddress: fulfillmentAddressSchema.optional(),
  pickupAddress: fulfillmentAddressSchema.optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  signatureRequired: z.boolean().optional(),
  deliveryInstructions: z.string().optional(),
  giftWrap: z.boolean().optional(),
  giftMessage: z.string().optional(),
  items: z.array(fulfillmentItemInputSchema).min(1),
});

const updateStatusInputSchema = z.object({
  id: z.string().uuid(),
  status: fulfillmentStatusSchema,
  notes: z.string().optional(),
});

const updateTrackingInputSchema = z.object({
  id: z.string().uuid(),
  trackingNumber: z.string().min(1),
});

const listFulfillmentItemsInputSchema = z.object({
  fulfillmentId: z.string().uuid(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  itemStatus: fulfillmentItemStatusSchema.optional(),
  locationPickedFrom: z.string().optional(),
  batchNumber: z.string().optional(),
  qualityCheck: z.boolean().optional(),
  hasIssues: z.boolean().optional(),
  needsAttention: z.boolean().optional(),
  search: z.string().optional(),
});

const updateFulfillmentItemStatusInputSchema = z.object({
  id: z.string().uuid(),
  itemStatus: fulfillmentItemStatusSchema,
  notes: z.string().optional(),
});

const updateFulfilledQuantityInputSchema = z.object({
  id: z.string().uuid(),
  fulfilledQuantity: z.number().min(0),
});

const qualityCheckInputSchema = z.object({
  id: z.string().uuid(),
  conditionNotes: z.string().optional(),
});

const addDamagedQuantityInputSchema = z.object({
  id: z.string().uuid(),
  damagedQuantity: z.number().min(1),
});

const addMissingQuantityInputSchema = z.object({
  id: z.string().uuid(),
  missingQuantity: z.number().min(1),
});

const DEFAULT_ERROR_MESSAGE = 'Failed to process order fulfillment request';

@Router({ alias: 'orderFulfillments' })
@Injectable()
export class AdminOrderFulfillmentsRouter {
  constructor(
    private readonly responseHandler: ResponseService,
    private readonly fulfillmentService: OrderFulfillmentService,
    private readonly fulfillmentItemRepository: FulfillmentItemRepository,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: listFulfillmentsInputSchema,
    output: paginatedResponseSchema,
  })
  async getAll(
    @Input() input: z.infer<typeof listFulfillmentsInputSchema>
  ) {
    try {
      const result = await this.fulfillmentService.getAllFulfillments({
        page: input.page,
        limit: input.limit,
        search: input.search,
        status: input.status,
        priorityLevel: input.priorityLevel,
        shippingProviderId: input.shippingProviderId,
        hasTrackingNumber: input.hasTrackingNumber,
        isOverdue: input.isOverdue,
        orderId: input.orderId,
      });

      return this.responseHandler.createTrpcSuccess({
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        this.extractErrorMessage(error, 'Failed to retrieve order fulfillments'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: fulfillmentIdSchema,
    output: apiResponseSchema,
  })
  async getById(
    @Input() input: z.infer<typeof fulfillmentIdSchema>
  ) {
    try {
      const fulfillment = await this.fulfillmentService.getFulfillmentById(input.id);
      return this.responseHandler.createTrpcSuccess(fulfillment);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.READ,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Order fulfillment not found'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createFulfillmentInputSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createFulfillmentInputSchema>
  ) {
    try {
      const payload = {
        orderId: input.orderId,
        priorityLevel: input.priorityLevel,
        shippingProviderId: input.shippingProviderId,
        packagingType: input.packagingType,
        shippingAddress: input.shippingAddress,
        pickupAddress: input.pickupAddress,
        notes: input.notes,
        internalNotes: input.internalNotes,
        signatureRequired: input.signatureRequired,
        deliveryInstructions: input.deliveryInstructions,
        giftWrap: input.giftWrap,
        giftMessage: input.giftMessage,
        items: input.items.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          locationPickedFrom: item.locationPickedFrom,
          batchNumber: item.batchNumber,
          serialNumbers: item.serialNumbers,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          conditionNotes: item.conditionNotes,
          packagingNotes: item.packagingNotes,
          weight: item.weight,
          notes: item.notes,
        })),
      };

      const fulfillment = await this.fulfillmentService.createFulfillment(payload);
      return this.responseHandler.createTrpcSuccess(fulfillment);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.CREATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Failed to create order fulfillment'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateStatusInputSchema,
    output: apiResponseSchema,
  })
  async updateStatus(
    @Input() input: z.infer<typeof updateStatusInputSchema>
  ) {
    try {
      const fulfillment = await this.fulfillmentService.updateFulfillment(input.id, {
        status: input.status,
        notes: input.notes,
      });

      return this.responseHandler.createTrpcSuccess(fulfillment);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, DEFAULT_ERROR_MESSAGE),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateTrackingInputSchema,
    output: apiResponseSchema,
  })
  async updateTracking(
    @Input() input: z.infer<typeof updateTrackingInputSchema>
  ) {
    try {
      const fulfillment = await this.fulfillmentService.addTrackingNumber(
        input.id,
        input.trackingNumber,
      );

      return this.responseHandler.createTrpcSuccess(fulfillment);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, DEFAULT_ERROR_MESSAGE),
        error,
      );
    }
  }

  // Fulfillment Items Management

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: listFulfillmentItemsInputSchema,
    output: paginatedResponseSchema,
  })
  async getItems(
    @Input() input: z.infer<typeof listFulfillmentItemsInputSchema>
  ) {
    try {
      const result = await this.fulfillmentItemRepository.findAll({
        page: input.page,
        limit: input.limit,
        relations: ['orderItem.product', 'orderItem.productVariant', 'qualityCheckByUser'],
        filters: {
          fulfillmentId: input.fulfillmentId,
          itemStatus: input.itemStatus,
          locationPickedFrom: input.locationPickedFrom,
          batchNumber: input.batchNumber,
          qualityCheck: input.qualityCheck,
          hasIssues: input.hasIssues,
          needsAttention: input.needsAttention,
          search: input.search,
        },
      });

      return this.responseHandler.createTrpcSuccess({
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        this.extractErrorMessage(error, 'Failed to retrieve fulfillment items'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateFulfillmentItemStatusInputSchema,
    output: apiResponseSchema,
  })
  async updateItemStatus(
    @Input() input: z.infer<typeof updateFulfillmentItemStatusInputSchema>
  ) {
    try {
      const success = await this.fulfillmentItemRepository.updateStatus(
        input.id,
        input.itemStatus
      );

      if (!success) {
        throw new Error('Failed to update fulfillment item status');
      }

      const updatedItem = await this.fulfillmentItemRepository.findById(input.id, [
        'orderItem.product',
        'orderItem.productVariant',
        'qualityCheckByUser',
      ]);

      return this.responseHandler.createTrpcSuccess(updatedItem);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Failed to update fulfillment item status'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateFulfilledQuantityInputSchema,
    output: apiResponseSchema,
  })
  async updateFulfilledQuantity(
    @Input() input: z.infer<typeof updateFulfilledQuantityInputSchema>
  ) {
    try {
      const success = await this.fulfillmentItemRepository.updateFulfilledQuantity(
        input.id,
        input.fulfilledQuantity
      );

      if (!success) {
        throw new Error('Failed to update fulfilled quantity');
      }

      const updatedItem = await this.fulfillmentItemRepository.findById(input.id, [
        'orderItem.product',
        'orderItem.productVariant',
      ]);

      return this.responseHandler.createTrpcSuccess(updatedItem);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Failed to update fulfilled quantity'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: qualityCheckInputSchema,
    output: apiResponseSchema,
  })
  async performQualityCheck(
    @Input() input: z.infer<typeof qualityCheckInputSchema>
  ) {
    try {
      // For now, we'll use a hardcoded user ID. In a real implementation,
      // you'd get this from the authenticated user context
      const qualityCheckBy = 'current-user-id'; // TODO: Get from auth context

      const success = await this.fulfillmentItemRepository.performQualityCheck(
        input.id,
        qualityCheckBy,
        input.conditionNotes
      );

      if (!success) {
        throw new Error('Failed to perform quality check');
      }

      const updatedItem = await this.fulfillmentItemRepository.findById(input.id, [
        'orderItem.product',
        'orderItem.productVariant',
        'qualityCheckByUser',
      ]);

      return this.responseHandler.createTrpcSuccess(updatedItem);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Failed to perform quality check'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: addDamagedQuantityInputSchema,
    output: apiResponseSchema,
  })
  async addDamagedQuantity(
    @Input() input: z.infer<typeof addDamagedQuantityInputSchema>
  ) {
    try {
      const success = await this.fulfillmentItemRepository.addDamagedQuantity(
        input.id,
        input.damagedQuantity
      );

      if (!success) {
        throw new Error('Failed to add damaged quantity');
      }

      const updatedItem = await this.fulfillmentItemRepository.findById(input.id, [
        'orderItem.product',
        'orderItem.productVariant',
      ]);

      return this.responseHandler.createTrpcSuccess(updatedItem);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Failed to add damaged quantity'),
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: addMissingQuantityInputSchema,
    output: apiResponseSchema,
  })
  async addMissingQuantity(
    @Input() input: z.infer<typeof addMissingQuantityInputSchema>
  ) {
    try {
      const success = await this.fulfillmentItemRepository.addMissingQuantity(
        input.id,
        input.missingQuantity
      );

      if (!success) {
        throw new Error('Failed to add missing quantity');
      }

      const updatedItem = await this.fulfillmentItemRepository.findById(input.id, [
        'orderItem.product',
        'orderItem.productVariant',
      ]);

      return this.responseHandler.createTrpcSuccess(updatedItem);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ORDER,
        OperationCode.UPDATE,
        this.mapErrorLevel(error),
        this.extractErrorMessage(error, 'Failed to add missing quantity'),
        error,
      );
    }
  }

  private mapErrorLevel(error: unknown): ErrorLevelCode {
    if (this.isHttpException(error)) {
      const status = error.getStatus();
      if (status === 400) {
        return ErrorLevelCode.VALIDATION;
      }
      if (status === 401) {
        return ErrorLevelCode.AUTHORIZATION;
      }
      if (status === 403) {
        return ErrorLevelCode.FORBIDDEN;
      }
      if (status === 404) {
        return ErrorLevelCode.NOT_FOUND;
      }
      if (status === 409) {
        return ErrorLevelCode.CONFLICT;
      }
    }

    return ErrorLevelCode.SERVER_ERROR;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (!error) {
      return fallback;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (this.isHttpException(error)) {
      const response = error.getResponse() as { message?: string | string[] } | undefined;
      if (response?.message) {
        return Array.isArray(response.message) ? response.message[0] : response.message;
      }
    }

    if (typeof error === 'object' && 'error' in (error as Record<string, unknown>)) {
      const embedded = (error as Record<string, any>).error;
      if (embedded?.message) {
        return embedded.message;
      }
    }

    return fallback;
  }

  private isHttpException(error: unknown): error is { getStatus: () => number; getResponse: () => unknown } {
    return (
      typeof error === 'object' &&
      error !== null &&
      typeof (error as any).getStatus === 'function' &&
      typeof (error as any).getResponse === 'function'
    );
  }
}
