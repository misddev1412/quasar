import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminShippingProviderService } from '../services/admin-shipping-provider.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { CreateShippingProviderDto } from '../dto/create-shipping-provider.dto';
import { UpdateShippingProviderDto } from '../dto/update-shipping-provider.dto';

const listShippingProvidersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  hasTracking: z.boolean().optional(),
  supportsDomestic: z.boolean().optional(),
  supportsInternational: z.boolean().optional(),
  supportsExpress: z.boolean().optional(),
});

export const createShippingProviderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  code: z.string().min(1, 'Code is required').max(50, 'Code cannot exceed 50 characters'),
  trackingUrl: z.string().url('Tracking URL must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  apiKey: z.string().min(1, 'API key cannot be empty').max(255, 'API key cannot exceed 255 characters').optional().nullable(),
  apiSecret: z.string().min(1, 'API secret cannot be empty').max(255, 'API secret cannot exceed 255 characters').optional().nullable(),
});

export const updateShippingProviderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
  code: z.string().min(1, 'Code is required').max(50, 'Code cannot exceed 50 characters').optional(),
  trackingUrl: z.string().url('Tracking URL must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  apiKey: z.string().min(1, 'API key cannot be empty').max(255, 'API key cannot exceed 255 characters').optional().nullable(),
  apiSecret: z.string().min(1, 'API secret cannot be empty').max(255, 'API secret cannot exceed 255 characters').optional().nullable(),
});

const shippingProviderIdSchema = z.object({
  id: z.string().uuid('Invalid shipping provider ID'),
});

@Injectable()
@Router({ alias: 'adminShippingProviders' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminShippingProviderRouter {
  constructor(
    private readonly responseService: ResponseService,
    private readonly shippingProviderService: AdminShippingProviderService,
  ) {}

  @Query({
    input: listShippingProvidersSchema,
    output: paginatedResponseSchema,
  })
  async list(@Input() input: z.infer<typeof listShippingProvidersSchema>) {
    const { page, limit, search, isActive, hasTracking, supportsDomestic, supportsInternational, supportsExpress } = input;
    const normalizedSearch = search?.trim().toLowerCase();
    const allProviders = await this.shippingProviderService.findAll();

    const filteredProviders = allProviders.filter((provider) => {
      const matchesStatus = typeof isActive === 'boolean' ? provider.isActive === isActive : true;
      const matchesSearch = normalizedSearch && normalizedSearch.length > 0
        ? [provider.name, provider.code, provider.description]
            .filter((value): value is string => typeof value === 'string')
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;
      const matchesTracking = typeof hasTracking === 'boolean' ? provider.hasTracking === hasTracking : true;
      const matchesDomestic = typeof supportsDomestic === 'boolean' ? provider.supportsDomestic === supportsDomestic : true;
      const matchesInternational = typeof supportsInternational === 'boolean' ? provider.supportsInternational === supportsInternational : true;
      const matchesExpress = typeof supportsExpress === 'boolean' ? provider.supportsExpress === supportsExpress : true;

      return matchesStatus && matchesSearch && matchesTracking && matchesDomestic && matchesInternational && matchesExpress;
    });

    const total = filteredProviders.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const items = filteredProviders.slice(startIndex, startIndex + limit);

    return this.responseService.createTrpcSuccess({
      items,
      total,
      page,
      limit,
      totalPages,
    });
  }

  @Query({
    input: shippingProviderIdSchema,
    output: apiResponseSchema,
  })
  async getById(@Input() input: z.infer<typeof shippingProviderIdSchema>) {
    const provider = await this.shippingProviderService.findOne(input.id);
    return this.responseService.createTrpcSuccess(provider);
  }

  @Mutation({
    input: createShippingProviderSchema,
    output: apiResponseSchema,
  })
  async create(@Input() input: z.infer<typeof createShippingProviderSchema>) {
    const trackingUrl = input.trackingUrl?.trim();
    const payload: CreateShippingProviderDto = {
      name: input.name,
      code: input.code,
      description: input.description,
      isActive: input.isActive,
      trackingUrl: trackingUrl ? trackingUrl : undefined,
      apiKey: typeof input.apiKey === 'string'
        ? (input.apiKey.trim().length > 0 ? input.apiKey.trim() : null)
        : input.apiKey ?? null,
      apiSecret: typeof input.apiSecret === 'string'
        ? (input.apiSecret.trim().length > 0 ? input.apiSecret.trim() : null)
        : input.apiSecret ?? null,
    };

    const provider = await this.shippingProviderService.create(payload);
    return this.responseService.createTrpcSuccess(provider);
  }

  @Mutation({
    input: z.object({
      id: z.string().uuid('Invalid shipping provider ID'),
      data: updateShippingProviderSchema,
    }),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string; data: z.infer<typeof updateShippingProviderSchema> },
  ) {
    const trackingUrl = input.data.trackingUrl?.trim();
    const payload: UpdateShippingProviderDto = {
      ...input.data,
      trackingUrl: trackingUrl ? trackingUrl : undefined,
      apiKey: typeof input.data.apiKey === 'string'
        ? (input.data.apiKey.trim().length > 0 ? input.data.apiKey.trim() : null)
        : input.data.apiKey ?? null,
      apiSecret: typeof input.data.apiSecret === 'string'
        ? (input.data.apiSecret.trim().length > 0 ? input.data.apiSecret.trim() : null)
        : input.data.apiSecret ?? null,
    };

    const provider = await this.shippingProviderService.update(input.id, payload);
    return this.responseService.createTrpcSuccess(provider);
  }

  @Mutation({
    input: shippingProviderIdSchema,
    output: apiResponseSchema,
  })
  async delete(@Input() input: z.infer<typeof shippingProviderIdSchema>) {
    await this.shippingProviderService.remove(input.id);
    return this.responseService.createTrpcSuccess({
      message: 'Shipping provider deleted successfully',
    });
  }

  @Mutation({
    input: shippingProviderIdSchema,
    output: apiResponseSchema,
  })
  async toggleActive(@Input() input: z.infer<typeof shippingProviderIdSchema>) {
    const provider = await this.shippingProviderService.toggleActive(input.id);
    return this.responseService.createTrpcSuccess(provider);
  }
}
