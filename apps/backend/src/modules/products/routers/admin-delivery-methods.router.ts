import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { DeliveryMethodService } from '../services/delivery-method.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { DeliveryMethodType, CostCalculationType } from '../entities/delivery-method.entity';

// Validation schemas
const deliveryMethodTypeSchema = z.enum([
  'STANDARD',
  'EXPRESS',
  'OVERNIGHT',
  'SAME_DAY',
  'PICKUP',
  'DIGITAL',
  'COURIER',
  'FREIGHT',
  'OTHER'
]);

const costCalculationTypeSchema = z.enum([
  'FIXED',
  'WEIGHT_BASED',
  'DISTANCE_BASED',
  'FREE'
]);

const getDeliveryMethodsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  type: deliveryMethodTypeSchema.optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  costCalculationType: costCalculationTypeSchema.optional(),
  trackingEnabled: z.boolean().optional(),
  insuranceEnabled: z.boolean().optional(),
  signatureRequired: z.boolean().optional(),
  search: z.string().optional(),
});

export const createDeliveryMethodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  type: deliveryMethodTypeSchema,
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).nullable().optional(),
  deliveryCost: z.coerce.number().min(0).nullable().optional().default(0),
  costCalculationType: costCalculationTypeSchema.optional().default('FIXED'),
  freeDeliveryThreshold: z.coerce.number().min(0).nullable().optional(),
  minDeliveryTimeHours: z.coerce.number().int().min(0).nullable().optional(),
  maxDeliveryTimeHours: z.coerce.number().int().min(0).nullable().optional(),
  weightLimitKg: z.coerce.number().min(0).nullable().optional(),
  sizeLimitCm: z.string().max(50).nullable().optional(),
  coverageAreas: z.array(z.string()).nullable().optional(),
  supportedPaymentMethods: z.array(z.string().uuid()).nullable().optional(),
  providerName: z.string().max(255).nullable().optional(),
  providerApiConfig: z.record(z.any()).nullable().optional(),
  trackingEnabled: z.boolean().optional().default(false),
  insuranceEnabled: z.boolean().optional().default(false),
  signatureRequired: z.boolean().optional().default(false),
  useThirdPartyIntegration: z.boolean().optional().default(false),
  iconUrl: z.string().max(512).url().nullable().optional(),
}).refine(
  (data) => {
    if (data.minDeliveryTimeHours !== undefined && data.minDeliveryTimeHours !== null &&
        data.maxDeliveryTimeHours !== undefined && data.maxDeliveryTimeHours !== null) {
      return data.minDeliveryTimeHours <= data.maxDeliveryTimeHours;
    }
    return true;
  },
  {
    message: 'Minimum delivery time cannot be greater than maximum delivery time',
    path: ['minDeliveryTimeHours'],
  }
);

const baseDeliveryMethodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  type: deliveryMethodTypeSchema,
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).nullable().optional(),
  deliveryCost: z.coerce.number().min(0).nullable().optional(),
  costCalculationType: costCalculationTypeSchema.optional(),
  freeDeliveryThreshold: z.coerce.number().min(0).nullable().optional(),
  minDeliveryTimeHours: z.coerce.number().int().min(0).nullable().optional(),
  maxDeliveryTimeHours: z.coerce.number().int().min(0).nullable().optional(),
  weightLimitKg: z.coerce.number().min(0).nullable().optional(),
  sizeLimitCm: z.string().max(50).nullable().optional(),
  coverageAreas: z.array(z.string()).nullable().optional(),
  supportedPaymentMethods: z.array(z.string().uuid()).nullable().optional(),
  providerName: z.string().max(255).nullable().optional(),
  providerApiConfig: z.record(z.any()).nullable().optional(),
  trackingEnabled: z.boolean().optional(),
  insuranceEnabled: z.boolean().optional(),
  signatureRequired: z.boolean().optional(),
  useThirdPartyIntegration: z.boolean().optional(),
  iconUrl: z.string().max(512).url().nullable().optional(),
});

export const updateDeliveryMethodSchema = baseDeliveryMethodSchema.partial();

export const deliveryMethodIdSchema = z.object({
  id: z.string().uuid(),
});

export const deliveryMethodUpdateSchema = z.object({
  id: z.string().uuid(),
  data: updateDeliveryMethodSchema,
});

export const calculateDeliverySchema = z.object({
  deliveryMethodId: z.string().uuid(),
  orderAmount: z.number().min(0),
  weight: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  coverageArea: z.string().optional(),
  paymentMethodId: z.string().uuid().optional(),
});

export const getQuotesSchema = z.object({
  orderAmount: z.number().min(0),
  weight: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  coverageArea: z.string().optional(),
  paymentMethodId: z.string().uuid().optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

export const getByTypeSchema = z.object({
  type: deliveryMethodTypeSchema,
});

@Injectable()
@Router({ alias: 'adminDeliveryMethods' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminDeliveryMethodsRouter {
  constructor(
    private readonly deliveryMethodService: DeliveryMethodService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: getDeliveryMethodsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(@Input() input: z.infer<typeof getDeliveryMethodsQuerySchema>) {
    const filters = {
      type: input.type,
      isActive: input.isActive,
      isDefault: input.isDefault,
      costCalculationType: input.costCalculationType,
      trackingEnabled: input.trackingEnabled,
      insuranceEnabled: input.insuranceEnabled,
      signatureRequired: input.signatureRequired,
      search: input.search,
    };

    const result = await this.deliveryMethodService.findAll(filters as any, input.page, input.limit);
    return this.responseService.createTrpcSuccess(result);
  }

  @Query({
    input: deliveryMethodIdSchema,
    output: apiResponseSchema,
  })
  async getById(@Input() input: z.infer<typeof deliveryMethodIdSchema>) {
    const deliveryMethod = await this.deliveryMethodService.findById(input.id);
    return this.responseService.createTrpcSuccess(deliveryMethod);
  }

  @Query({
    output: apiResponseSchema,
  })
  async getActive() {
    const deliveryMethods = await this.deliveryMethodService.findActive();
    return this.responseService.createTrpcSuccess(deliveryMethods);
  }

  @Query({
    input: getByTypeSchema,
    output: apiResponseSchema,
  })
  async getByType(@Input() input: z.infer<typeof getByTypeSchema>) {
    const deliveryMethods = await this.deliveryMethodService.findByType(input.type as any);
    return this.responseService.createTrpcSuccess(deliveryMethods);
  }

  @Mutation({
    input: createDeliveryMethodSchema,
    output: apiResponseSchema,
  })
  async create(@Input() input: z.infer<typeof createDeliveryMethodSchema>) {
    const deliveryMethod = await this.deliveryMethodService.create(input as any);
    return this.responseService.createTrpcSuccess({
      data: deliveryMethod,
      message: 'Delivery method created successfully'
    });
  }

  @Mutation({
    input: deliveryMethodUpdateSchema,
    output: apiResponseSchema,
  })
  async update(@Input() input: z.infer<typeof deliveryMethodUpdateSchema>) {
    console.log('Backend received update input:', JSON.stringify(input, null, 2));
    const deliveryMethod = await this.deliveryMethodService.update(input.id, input.data as any);
    return this.responseService.createTrpcSuccess({
      data: deliveryMethod,
      message: 'Delivery method updated successfully'
    });
  }

  @Mutation({
    input: deliveryMethodIdSchema,
    output: apiResponseSchema,
  })
  async delete(@Input() input: z.infer<typeof deliveryMethodIdSchema>) {
    await this.deliveryMethodService.delete(input.id);
    return this.responseService.createTrpcSuccess({
      data: null,
      message: 'Delivery method deleted successfully'
    });
  }

  @Mutation({
    input: deliveryMethodIdSchema,
    output: apiResponseSchema,
  })
  async setDefault(@Input() input: z.infer<typeof deliveryMethodIdSchema>) {
    const deliveryMethod = await this.deliveryMethodService.setDefault(input.id);
    return this.responseService.createTrpcSuccess({
      data: deliveryMethod,
      message: 'Default delivery method updated successfully'
    });
  }

  @Mutation({
    input: deliveryMethodIdSchema,
    output: apiResponseSchema,
  })
  async toggleActive(@Input() input: z.infer<typeof deliveryMethodIdSchema>) {
    const deliveryMethod = await this.deliveryMethodService.toggleActive(input.id);
    return this.responseService.createTrpcSuccess({
      data: deliveryMethod,
      message: 'Delivery method status updated successfully'
    });
  }

  @Mutation({
    input: reorderSchema,
    output: apiResponseSchema,
  })
  async reorder(@Input() input: z.infer<typeof reorderSchema>) {
    await this.deliveryMethodService.reorder(input.items as any);
    return this.responseService.createTrpcSuccess({
      data: null,
      message: 'Delivery methods reordered successfully'
    });
  }

  @Query({
    input: calculateDeliverySchema,
    output: apiResponseSchema,
  })
  async calculateDelivery(@Input() input: z.infer<typeof calculateDeliverySchema>) {
    const { deliveryMethodId, orderAmount, ...options } = input;
    const calculation = await this.deliveryMethodService.calculateDelivery(deliveryMethodId, orderAmount, options);
    return this.responseService.createTrpcSuccess(calculation);
  }

  @Query({
    input: getQuotesSchema,
    output: apiResponseSchema,
  })
  async getQuotes(@Input() input: z.infer<typeof getQuotesSchema>) {
    const { orderAmount, ...options } = input;
    const quotes = await this.deliveryMethodService.getDeliveryQuotes(orderAmount, options);
    return this.responseService.createTrpcSuccess(quotes);
  }

  @Query({
    output: apiResponseSchema,
  })
  async stats() {
    const stats = await this.deliveryMethodService.getStats();
    return this.responseService.createTrpcSuccess(stats);
  }
}