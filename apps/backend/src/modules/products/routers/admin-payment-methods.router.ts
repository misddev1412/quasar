import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { PaymentMethodService, type SavePaymentMethodProviderDto } from '../services/payment-method.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { PaymentMethodType, ProcessingFeeType } from '../entities/payment-method.entity';

export const paymentMethodTypeSchema = z.nativeEnum(PaymentMethodType);
export const processingFeeTypeSchema = z.nativeEnum(ProcessingFeeType);

export const getPaymentMethodsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  type: paymentMethodTypeSchema.optional(),
  isActive: z.boolean().optional(),
  currency: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  type: paymentMethodTypeSchema,
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional(),
  processingFee: z.number().min(0).optional().default(0),
  processingFeeType: processingFeeTypeSchema.optional().default(ProcessingFeeType.FIXED),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  supportedCurrencies: z.array(z.string()).optional(),
  iconUrl: z.string().url().optional(),
  isDefault: z.boolean().optional().default(false),
}).refine(
  (data) => {
    if (data.minAmount !== undefined && data.maxAmount !== undefined) {
      return data.minAmount <= data.maxAmount;
    }
    return true;
  },
  {
    message: 'Minimum amount cannot be greater than maximum amount',
    path: ['minAmount'],
  }
);

const basePaymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  type: paymentMethodTypeSchema,
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional(),
  processingFee: z.number().min(0).optional().default(0),
  processingFeeType: processingFeeTypeSchema.optional().default(ProcessingFeeType.FIXED),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  supportedCurrencies: z.array(z.string()).optional(),
  iconUrl: z.string().url().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updatePaymentMethodSchema = basePaymentMethodSchema.partial();

export const paymentMethodIdSchema = z.object({
  id: z.string().uuid('Invalid payment method ID'),
});

export const reorderPaymentMethodsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

export const calculatePaymentSchema = z.object({
  paymentMethodId: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().optional().default('USD'),
});

export const forAmountSchema = z.object({
  amount: z.number().min(0.01),
  currency: z.string().optional(),
});

const paymentMethodProviderBaseSchema = z.object({
  providerKey: z.string().min(1).max(100),
  displayName: z.string().min(1).max(255),
  providerType: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  environment: z.string().min(2).max(50).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  checksumKey: z.string().optional(),
  publicKey: z.string().optional(),
  webhookUrl: z.string().optional(),
  webhookSecret: z.string().optional(),
  callbackUrl: z.string().optional(),
  credentials: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const savePaymentMethodProviderSchema = paymentMethodProviderBaseSchema.extend({
  id: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid(),
});

export const getPaymentMethodProviderSchema = z.object({
  paymentMethodId: z.string().uuid(),
});

export const deletePaymentMethodProviderSchema = z.object({
  id: z.string().uuid(),
});

@Injectable()
@Router({ alias: 'adminPaymentMethods' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminPaymentMethodsRouter {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: getPaymentMethodsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(@Input() input: z.infer<typeof getPaymentMethodsQuerySchema>) {
    const filters = {
      type: input.type,
      isActive: input.isActive,
      currency: input.currency,
      minAmount: input.minAmount,
      maxAmount: input.maxAmount,
    };

    const result = await this.paymentMethodService.findAll(filters, input.page, input.limit);
    return this.responseService.createTrpcSuccess(result);
  }

  @Query({
    output: apiResponseSchema,
  })
  async active() {
    const paymentMethods = await this.paymentMethodService.findActive();
    return this.responseService.createTrpcSuccess(paymentMethods);
  }

  @Query({
    input: forAmountSchema,
    output: apiResponseSchema,
  })
  async forAmount(@Input() input: z.infer<typeof forAmountSchema>) {
    const paymentMethods = await this.paymentMethodService.findForAmount(input.amount, input.currency);
    return this.responseService.createTrpcSuccess(paymentMethods);
  }

  @Query({
    input: paymentMethodIdSchema,
    output: apiResponseSchema,
  })
  async getById(@Input() input: z.infer<typeof paymentMethodIdSchema>) {
    const paymentMethod = await this.paymentMethodService.findById(input.id);
    return this.responseService.createTrpcSuccess(paymentMethod);
  }

  @Mutation({
    input: createPaymentMethodSchema,
    output: apiResponseSchema,
  })
  async create(@Input() input: z.infer<typeof createPaymentMethodSchema>) {
    const paymentMethod = await this.paymentMethodService.create(input as any);
    return this.responseService.createTrpcSuccess(paymentMethod);
  }

  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: updatePaymentMethodSchema,
    }),
    output: apiResponseSchema,
  })
  async update(@Input() input: { id: string; data: z.infer<typeof updatePaymentMethodSchema> }) {
    const paymentMethod = await this.paymentMethodService.update(input.id, input.data);
    return this.responseService.createTrpcSuccess(paymentMethod);
  }

  @Mutation({
    input: paymentMethodIdSchema,
    output: apiResponseSchema,
  })
  async delete(@Input() input: z.infer<typeof paymentMethodIdSchema>) {
    await this.paymentMethodService.delete(input.id);
    return this.responseService.createTrpcSuccess({ message: 'Payment method deleted successfully' });
  }

  @Mutation({
    input: paymentMethodIdSchema,
    output: apiResponseSchema,
  })
  async setDefault(@Input() input: z.infer<typeof paymentMethodIdSchema>) {
    const paymentMethod = await this.paymentMethodService.setDefault(input.id);
    return this.responseService.createTrpcSuccess(paymentMethod);
  }

  @Mutation({
    input: paymentMethodIdSchema,
    output: apiResponseSchema,
  })
  async toggleActive(@Input() input: z.infer<typeof paymentMethodIdSchema>) {
    const paymentMethod = await this.paymentMethodService.toggleActive(input.id);
    const message = `Payment method ${paymentMethod.isActive ? 'activated' : 'deactivated'} successfully`;
    return this.responseService.createTrpcSuccess(paymentMethod);
  }

  @Mutation({
    input: reorderPaymentMethodsSchema,
    output: apiResponseSchema,
  })
  async reorder(@Input() input: z.infer<typeof reorderPaymentMethodsSchema>) {
    await this.paymentMethodService.reorder(input.items as any);
    return this.responseService.createTrpcSuccess({ message: 'Payment methods reordered successfully' });
  }

  @Query({
    input: calculatePaymentSchema,
    output: apiResponseSchema,
  })
  async calculatePayment(@Input() input: z.infer<typeof calculatePaymentSchema>) {
    const calculation = await this.paymentMethodService.calculatePayment(
      input.paymentMethodId,
      input.amount,
      input.currency
    );
    return this.responseService.createTrpcSuccess(calculation);
  }

  @Query({
    output: apiResponseSchema,
  })
  async stats() {
    const stats = await this.paymentMethodService.getStats();
    return this.responseService.createTrpcSuccess(stats);
  }

  @Query({
    input: getPaymentMethodProviderSchema,
    output: apiResponseSchema,
  })
  async providerConfig(@Input() input: z.infer<typeof getPaymentMethodProviderSchema>) {
    const provider = await this.paymentMethodService.getProviderConfig(input.paymentMethodId);
    return this.responseService.createTrpcSuccess(provider);
  }

  @Mutation({
    input: savePaymentMethodProviderSchema,
    output: apiResponseSchema,
  })
  async saveProviderConfig(@Input() input: z.infer<typeof savePaymentMethodProviderSchema>) {
    const { paymentMethodId, ...providerData } = input;
    const providerPayload = providerData as SavePaymentMethodProviderDto;
    const provider = await this.paymentMethodService.saveProvider(paymentMethodId, providerPayload);
    return this.responseService.createTrpcSuccess(provider);
  }

  @Mutation({
    input: deletePaymentMethodProviderSchema,
    output: apiResponseSchema,
  })
  async deleteProviderConfig(@Input() input: z.infer<typeof deletePaymentMethodProviderSchema>) {
    await this.paymentMethodService.deleteProvider(input.id);
    return this.responseService.createTrpcSuccess({ message: 'Payment provider configuration deleted successfully' });
  }
}
