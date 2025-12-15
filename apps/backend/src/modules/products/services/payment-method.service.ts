import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethodRepository, CreatePaymentMethodDto, UpdatePaymentMethodDto, PaymentMethodFilters } from '../repositories/payment-method.repository';
import {
  PaymentMethodProviderRepository,
  CreatePaymentMethodProviderDto,
  UpdatePaymentMethodProviderDto,
} from '../repositories/payment-method-provider.repository';
import { PaymentMethod, PaymentMethodType } from '../entities/payment-method.entity';
import { PaymentMethodProvider } from '../entities/payment-method-provider.entity';

export interface PaymentMethodListResponse {
  items: PaymentMethod[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentCalculation {
  subtotal: number;
  processingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
}

export type SavePaymentMethodProviderDto = Omit<CreatePaymentMethodProviderDto, 'paymentMethodId'> & {
  id?: string;
};

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly paymentMethodProviderRepository: PaymentMethodProviderRepository,
  ) {}

  async create(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // Validate data
    this.validateCreateData(data);

    // If no sort order provided, set to next available
    if (data.sortOrder === undefined) {
      const count = await this.paymentMethodRepository.count();
      data.sortOrder = count + 1;
    }

    return await this.paymentMethodRepository.create(data);
  }

  async findAll(
    filters?: PaymentMethodFilters,
    page = 1,
    pageSize = 50
  ): Promise<PaymentMethodListResponse> {
    const allItems = await this.paymentMethodRepository.findAll(filters);
    const total = allItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = allItems.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      limit: pageSize,
      totalPages,
    };
  }

  async findById(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findById(id);
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
    return paymentMethod;
  }

  async findByType(type: PaymentMethodType): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.findByType(type);
  }

  async findActive(): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.findActive();
  }

  async findDefault(): Promise<PaymentMethod | null> {
    return await this.paymentMethodRepository.findDefault();
  }

  async findForAmount(amount: number, currency?: string): Promise<PaymentMethod[]> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    return await this.paymentMethodRepository.findForAmount(amount, currency);
  }

  async update(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const existingPaymentMethod = await this.findById(id);

    // Validate update data
    this.validateUpdateData(data);

    const updatedPaymentMethod = await this.paymentMethodRepository.update(id, data);
    if (!updatedPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return updatedPaymentMethod;
  }

  async delete(id: string): Promise<void> {
    const paymentMethod = await this.findById(id);

    // Don't allow deletion of default payment method
    if (paymentMethod.isDefault) {
      throw new BadRequestException('Cannot delete the default payment method. Please set another payment method as default first.');
    }

    const deleted = await this.paymentMethodRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }
  }

  async setDefault(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findById(id);

    if (!paymentMethod.isActive) {
      throw new BadRequestException('Cannot set inactive payment method as default');
    }

    const updatedPaymentMethod = await this.paymentMethodRepository.setDefault(id);
    if (!updatedPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return updatedPaymentMethod;
  }

  async toggleActive(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findById(id);

    // Don't allow deactivating default payment method
    if (paymentMethod.isDefault && paymentMethod.isActive) {
      throw new BadRequestException('Cannot deactivate the default payment method. Please set another payment method as default first.');
    }

    const updatedPaymentMethod = await this.paymentMethodRepository.toggleActive(id);
    if (!updatedPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return updatedPaymentMethod;
  }

  async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    // Validate all payment methods exist
    for (const item of items) {
      await this.findById(item.id);
    }

    await this.paymentMethodRepository.reorder(items);
  }

  async calculatePayment(paymentMethodId: string, amount: number, currency = 'USD'): Promise<PaymentCalculation> {
    const paymentMethod = await this.findById(paymentMethodId);

    if (!paymentMethod.isActive) {
      throw new BadRequestException('Payment method is not active');
    }

    if (!paymentMethod.isAmountSupported(amount)) {
      const minAmount = paymentMethod.minAmount;
      const maxAmount = paymentMethod.maxAmount;
      let message = 'Amount is not supported by this payment method';

      if (minAmount && maxAmount) {
        message = `Amount must be between ${minAmount} and ${maxAmount}`;
      } else if (minAmount) {
        message = `Amount must be at least ${minAmount}`;
      } else if (maxAmount) {
        message = `Amount must not exceed ${maxAmount}`;
      }

      throw new BadRequestException(message);
    }

    if (!paymentMethod.isCurrencySupported(currency)) {
      throw new BadRequestException(`Currency ${currency} is not supported by this payment method`);
    }

    const processingFee = paymentMethod.calculateProcessingFee(amount);
    const total = amount + processingFee;

    return {
      subtotal: amount,
      processingFee,
      total,
      paymentMethod,
    };
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<PaymentMethodType, number>;
  }> {
    const [total, active] = await Promise.all([
      this.paymentMethodRepository.count(),
      this.paymentMethodRepository.count({ isActive: true }),
    ]);

    const inactive = total - active;

    // Get counts by type
    const byType: Record<PaymentMethodType, number> = {} as Record<PaymentMethodType, number>;
    for (const type of Object.values(PaymentMethodType)) {
      byType[type] = await this.paymentMethodRepository.count({ type });
    }

    return {
      total,
      active,
      inactive,
      byType,
    };
  }

  private validateCreateData(data: CreatePaymentMethodDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Payment method name is required');
    }

    if (data.name.length > 255) {
      throw new BadRequestException('Payment method name cannot exceed 255 characters');
    }

    if (!Object.values(PaymentMethodType).includes(data.type)) {
      throw new BadRequestException('Invalid payment method type');
    }

    if (data.processingFee !== undefined && data.processingFee < 0) {
      throw new BadRequestException('Processing fee cannot be negative');
    }

    if (data.minAmount !== undefined && data.minAmount < 0) {
      throw new BadRequestException('Minimum amount cannot be negative');
    }

    if (data.maxAmount !== undefined && data.maxAmount < 0) {
      throw new BadRequestException('Maximum amount cannot be negative');
    }

    if (data.minAmount !== undefined && data.maxAmount !== undefined && data.minAmount > data.maxAmount) {
      throw new BadRequestException('Minimum amount cannot be greater than maximum amount');
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new BadRequestException('Sort order cannot be negative');
    }
  }

  private validateUpdateData(data: UpdatePaymentMethodDto): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Payment method name is required');
      }

      if (data.name.length > 255) {
        throw new BadRequestException('Payment method name cannot exceed 255 characters');
      }
    }

    if (data.type !== undefined && !Object.values(PaymentMethodType).includes(data.type)) {
      throw new BadRequestException('Invalid payment method type');
    }

    if (data.processingFee !== undefined && data.processingFee < 0) {
      throw new BadRequestException('Processing fee cannot be negative');
    }

    if (data.minAmount !== undefined && data.minAmount < 0) {
      throw new BadRequestException('Minimum amount cannot be negative');
    }

    if (data.maxAmount !== undefined && data.maxAmount < 0) {
      throw new BadRequestException('Maximum amount cannot be negative');
    }

    if (data.minAmount !== undefined && data.maxAmount !== undefined && data.minAmount > data.maxAmount) {
      throw new BadRequestException('Minimum amount cannot be greater than maximum amount');
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new BadRequestException('Sort order cannot be negative');
    }
  }

  async getProviderConfig(paymentMethodId: string): Promise<PaymentMethodProvider | null> {
    await this.findById(paymentMethodId);
    return await this.paymentMethodProviderRepository.findByPaymentMethod(paymentMethodId);
  }

  async saveProvider(paymentMethodId: string, data: SavePaymentMethodProviderDto): Promise<PaymentMethodProvider> {
    const paymentMethod = await this.findById(paymentMethodId);

    const payload: CreatePaymentMethodProviderDto = {
      paymentMethodId: paymentMethod.id,
      providerKey: data.providerKey,
      displayName: data.displayName,
      providerType: data.providerType ?? 'PAYMENT_GATEWAY',
      description: data.description,
      environment: data.environment ?? 'production',
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      checksumKey: data.checksumKey,
      publicKey: data.publicKey,
      webhookUrl: data.webhookUrl,
      webhookSecret: data.webhookSecret,
      callbackUrl: data.callbackUrl,
      credentials: data.credentials,
      settings: data.settings,
      metadata: data.metadata,
      isActive: data.isActive ?? true,
    };

    if (data.id) {
      const updated = await this.paymentMethodProviderRepository.update(data.id, payload as UpdatePaymentMethodProviderDto);
      if (!updated) {
        throw new NotFoundException(`Payment method provider with ID ${data.id} not found`);
      }
      return updated;
    }

    const existing = await this.paymentMethodProviderRepository.findByPaymentMethod(paymentMethod.id);
    if (existing) {
      const updated = await this.paymentMethodProviderRepository.update(existing.id, payload as UpdatePaymentMethodProviderDto);
      if (!updated) {
        throw new NotFoundException(`Payment method provider with ID ${existing.id} not found`);
      }
      return updated;
    }

    return await this.paymentMethodProviderRepository.create(payload);
  }

  async deleteProvider(providerId: string): Promise<void> {
    const provider = await this.paymentMethodProviderRepository.findById(providerId);
    if (!provider) {
      throw new NotFoundException(`Payment method provider with ID ${providerId} not found`);
    }

    const deleted = await this.paymentMethodProviderRepository.delete(providerId);
    if (!deleted) {
      throw new NotFoundException(`Payment method provider with ID ${providerId} not found`);
    }
  }
}
