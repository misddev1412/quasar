import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { adminOnlyProcedure, createTRPCRouter } from '../../trpc/trpc-router.factory';
import {
  OrderFulfillmentService,
  CreateFulfillmentDto,
  CreateFulfillmentItemDto,
  UpdateFulfillmentDto,
  AddTrackingEventDto,
} from '../services/order-fulfillment.service';
import {
  ShippingProviderService,
  CreateShippingProviderDto,
  UpdateShippingProviderDto,
} from '../services/shipping-provider.service';
import {
  FulfillmentStatus,
  PriorityLevel,
  PackagingType,
} from '../entities/order-fulfillment.entity';
import {
  FulfillmentItemStatus,
} from '../entities/fulfillment-item.entity';
import {
  TrackingStatus,
} from '../entities/delivery-tracking.entity';
import { AuthenticatedContext } from '@backend/trpc/context';

const resolveService = <T>(
  ctx: AuthenticatedContext,
  Service: new (...args: any[]) => T,
): T => {
  if (!ctx?.resolve) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to resolve application service from context',
    });
  }

  return ctx.resolve(Service);
};

const resolveFulfillmentService = (ctx: AuthenticatedContext) =>
  resolveService(ctx, OrderFulfillmentService);

const resolveShippingProviderService = (ctx: AuthenticatedContext) =>
  resolveService(ctx, ShippingProviderService);

const createFulfillmentSchema = z.object({
  orderId: z.string().uuid(),
  priorityLevel: z.nativeEnum(PriorityLevel).optional(),
  shippingProviderId: z.string().uuid().optional(),
  packagingType: z.nativeEnum(PackagingType).optional(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  pickupAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  signatureRequired: z.boolean().optional(),
  deliveryInstructions: z.string().optional(),
  giftWrap: z.boolean().optional(),
  giftMessage: z.string().optional(),
  items: z.array(z.object({
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
  })).min(1),
});

const updateFulfillmentSchema = z.object({
  status: z.nativeEnum(FulfillmentStatus).optional(),
  shippingProviderId: z.string().uuid().optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().datetime().optional(),
  shippingCost: z.number().nonnegative().optional(),
  insuranceCost: z.number().nonnegative().optional(),
  packagingType: z.nativeEnum(PackagingType).optional(),
  packageWeight: z.number().positive().optional(),
  packageDimensions: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  priorityLevel: z.nativeEnum(PriorityLevel).optional(),
});

const addTrackingEventSchema = z.object({
  status: z.nativeEnum(TrackingStatus),
  location: z.string().optional(),
  description: z.string().optional(),
  eventDate: z.string().datetime().optional(),
  estimatedDeliveryDate: z.string().datetime().optional(),
  recipientName: z.string().optional(),
  relationship: z.string().optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
  exceptionReason: z.string().optional(),
});

const updateFulfillmentItemSchema = z.object({
  fulfilledQuantity: z.number().nonnegative().optional(),
  returnedQuantity: z.number().nonnegative().optional(),
  damagedQuantity: z.number().nonnegative().optional(),
  missingQuantity: z.number().nonnegative().optional(),
  locationPickedFrom: z.string().optional(),
  batchNumber: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  expiryDate: z.string().datetime().optional(),
  conditionNotes: z.string().optional(),
  packagingNotes: z.string().optional(),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const adminOrderFulfillmentsRouter = createTRPCRouter({
  // Fulfillment management
  list: adminOnlyProcedure
    .input(
      z.object({
        page: z.number().positive().default(1),
        limit: z.number().positive().max(100).default(20),
        search: z.string().optional(),
        orderId: z.string().uuid().optional(),
        status: z.nativeEnum(FulfillmentStatus).optional(),
        priorityLevel: z.nativeEnum(PriorityLevel).optional(),
        shippingProviderId: z.string().uuid().optional(),
        trackingNumber: z.string().optional(),
        shippedDateFrom: z.string().datetime().optional(),
        shippedDateTo: z.string().datetime().optional(),
        estimatedDeliveryFrom: z.string().datetime().optional(),
        estimatedDeliveryTo: z.string().datetime().optional(),
        hasTrackingNumber: z.boolean().optional(),
        isOverdue: z.boolean().optional(),
        fulfilledBy: z.string().uuid().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.getAllFulfillments(input);
    }),

  getById: adminOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.getFulfillmentById(input.id);
    }),

  getByOrderId: adminOnlyProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.getFulfillmentsByOrderId(input.orderId);
    }),

  getByTrackingNumber: adminOnlyProcedure
    .input(z.object({ trackingNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      const fulfillment = await fulfillmentService.getFulfillmentByTrackingNumber(input.trackingNumber);
      if (!fulfillment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No fulfillment found with this tracking number',
        });
      }
      return fulfillment;
    }),

  create: adminOnlyProcedure
    .input(createFulfillmentSchema)
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      const payload: CreateFulfillmentDto = {
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
        items: input.items.map(
          (item): CreateFulfillmentItemDto => ({
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
          }),
        ),
      };

      return await fulfillmentService.createFulfillment(payload);
    }),

  update: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateFulfillmentSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      const payload: UpdateFulfillmentDto = {
        ...input.data,
        estimatedDeliveryDate: input.data.estimatedDeliveryDate
          ? new Date(input.data.estimatedDeliveryDate)
          : undefined,
      };

      return await fulfillmentService.updateFulfillment(input.id, payload);
    }),

  addTrackingNumber: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        trackingNumber: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.addTrackingNumber(input.id, input.trackingNumber);
    }),

  addTrackingEvent: adminOnlyProcedure
    .input(
      z.object({
        fulfillmentId: z.string().uuid(),
        event: addTrackingEventSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      const payload: AddTrackingEventDto = {
        status: input.event.status,
        location: input.event.location,
        description: input.event.description,
        eventDate: input.event.eventDate ? new Date(input.event.eventDate) : undefined,
        estimatedDeliveryDate: input.event.estimatedDeliveryDate
          ? new Date(input.event.estimatedDeliveryDate)
          : undefined,
        recipientName: input.event.recipientName,
        relationship: input.event.relationship,
        photoUrl: input.event.photoUrl,
        notes: input.event.notes,
        exceptionReason: input.event.exceptionReason,
      };

      return await fulfillmentService.addTrackingEvent(input.fulfillmentId, payload);
    }),

  markAsDelivered: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        actualDeliveryDate: z.string().datetime().optional(),
        recipientName: z.string().optional(),
        photoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.markAsDelivered(
        input.id,
        input.actualDeliveryDate ? new Date(input.actualDeliveryDate) : undefined,
        input.recipientName,
        input.photoUrl
      );
    }),

  cancel: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        cancelReason: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.cancelFulfillment(input.id, input.cancelReason);
    }),

  delete: adminOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.deleteFulfillment(input.id);
    }),

  // Fulfillment items management
  getItems: adminOnlyProcedure
    .input(
      z.object({
        fulfillmentId: z.string().uuid(),
        page: z.number().positive().default(1),
        limit: z.number().positive().max(100).default(20),
        itemStatus: z.nativeEnum(FulfillmentItemStatus).optional(),
        qualityCheck: z.boolean().optional(),
        hasIssues: z.boolean().optional(),
        needsAttention: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      const fulfillment = await fulfillmentService.getFulfillmentById(input.fulfillmentId);
      return fulfillment.items;
    }),

  updateItem: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateFulfillmentItemSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      // TODO: Implement item update in OrderFulfillmentService
      // For now, return the item by calling get fulfillment and finding the item
      const fulfillment = await fulfillmentService.getFulfillmentById('dummy'); // This will be implemented
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Item update not yet implemented',
      });
    }),

  performQualityCheck: adminOnlyProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
        conditionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      // TODO: Implement quality check in OrderFulfillmentService
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Quality check not yet implemented',
      });
    }),

  // Tracking management
  getTrackingHistory: adminOnlyProcedure
    .input(z.object({ fulfillmentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      const fulfillment = await fulfillmentService.getFulfillmentById(input.fulfillmentId);
      return fulfillment.tracking;
    }),

  // Statistics and analytics
  getStats: adminOnlyProcedure.query(async ({ ctx }) => {
    const fulfillmentService = resolveFulfillmentService(ctx);
    return await fulfillmentService.getFulfillmentStats();
  }),

  getActiveFulfillments: adminOnlyProcedure.query(async ({ ctx }) => {
    const fulfillmentService = resolveFulfillmentService(ctx);
    return await fulfillmentService.getActiveFulfillments();
  }),

  getOverdueFulfillments: adminOnlyProcedure.query(async ({ ctx }) => {
    const fulfillmentService = resolveFulfillmentService(ctx);
    return await fulfillmentService.getOverdueFulfillments();
  }),

  search: adminOnlyProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const fulfillmentService = resolveFulfillmentService(ctx);
      return await fulfillmentService.searchFulfillments(input.query);
    }),
});

// Shipping providers router
export const adminShippingProvidersRouter = createTRPCRouter({
  list: adminOnlyProcedure
    .input(
      z.object({
        page: z.number().positive().default(1),
        limit: z.number().positive().max(100).default(20),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        hasTracking: z.boolean().optional(),
        supportsDomestic: z.boolean().optional(),
        supportsInternational: z.boolean().optional(),
        supportsExpress: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      return await shippingProviderService.getAllProviders(input);
    }),

  getById: adminOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      const provider = await shippingProviderService.getProviderById(input.id);
      if (!provider) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Shipping provider not found',
        });
      }
      return provider;
    }),

  create: adminOnlyProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        website: z.string().url().optional(),
        trackingUrl: z.string().url().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        deliveryTimeEstimate: z.number().positive().optional(),
        description: z.string().optional(),
        contactInfo: z.object({
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          supportHours: z.string().optional(),
        }).optional(),
        services: z.object({
          domestic: z.boolean().default(true),
          international: z.boolean().default(false),
          express: z.boolean().default(false),
          standard: z.boolean().default(true),
          economy: z.boolean().default(false),
          tracking: z.boolean().default(true),
          insurance: z.boolean().default(false),
          signature: z.boolean().default(false),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      const payload: CreateShippingProviderDto = {
        name: input.name,
        code: input.code,
        website: input.website,
        trackingUrl: input.trackingUrl,
        apiKey: input.apiKey,
        apiSecret: input.apiSecret,
        deliveryTimeEstimate: input.deliveryTimeEstimate,
        description: input.description,
        contactInfo: input.contactInfo,
        services: input.services,
      };

      return await shippingProviderService.createProvider(payload);
    }),

  update: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(1).optional(),
          website: z.string().url().optional(),
          trackingUrl: z.string().url().optional(),
          apiKey: z.string().optional(),
          apiSecret: z.string().optional(),
          deliveryTimeEstimate: z.number().positive().optional(),
          description: z.string().optional(),
          contactInfo: z.object({
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z.string().optional(),
            supportHours: z.string().optional(),
          }).optional(),
          services: z.object({
            domestic: z.boolean(),
            international: z.boolean(),
            express: z.boolean(),
            standard: z.boolean(),
            economy: z.boolean(),
            tracking: z.boolean(),
            insurance: z.boolean(),
            signature: z.boolean(),
          }).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      const payload: UpdateShippingProviderDto = { ...input.data };

      return await shippingProviderService.updateProvider(input.id, payload);
    }),

  activate: adminOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      return await shippingProviderService.activateProvider(input.id);
    }),

  deactivate: adminOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      return await shippingProviderService.deactivateProvider(input.id);
    }),

  getActiveProviders: adminOnlyProcedure.query(async ({ ctx }) => {
    const shippingProviderService = resolveShippingProviderService(ctx);
    return await shippingProviderService.getActiveProviders();
  }),

  getProvidersForService: adminOnlyProcedure
    .input(z.object({ serviceType: z.string() }))
    .query(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      return await shippingProviderService.getProvidersForService(input.serviceType);
    }),

  validateTrackingNumber: adminOnlyProcedure
    .input(
      z.object({
        providerId: z.string().uuid(),
        trackingNumber: z.string().min(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      return await shippingProviderService.validateTrackingNumber(input.providerId, input.trackingNumber);
    }),

  getStats: adminOnlyProcedure.query(async ({ ctx }) => {
    const shippingProviderService = resolveShippingProviderService(ctx);
    return await shippingProviderService.getStats();
  }),

  search: adminOnlyProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const shippingProviderService = resolveShippingProviderService(ctx);
      return await shippingProviderService.searchProviders(input.query);
    }),
});
