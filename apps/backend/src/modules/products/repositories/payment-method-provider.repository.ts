import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodProvider } from '../entities/payment-method-provider.entity';

export interface CreatePaymentMethodProviderDto {
  paymentMethodId: string;
  providerKey: string;
  displayName: string;
  providerType?: string;
  description?: string;
  environment?: string;
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  checksumKey?: string;
  publicKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  callbackUrl?: string;
  credentials?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface UpdatePaymentMethodProviderDto extends Partial<CreatePaymentMethodProviderDto> {}

@Injectable()
export class PaymentMethodProviderRepository {
  constructor(
    @InjectRepository(PaymentMethodProvider)
    private readonly repository: Repository<PaymentMethodProvider>,
  ) {}

  async create(data: CreatePaymentMethodProviderDto): Promise<PaymentMethodProvider> {
    const entity = this.repository.create({
      ...data,
    });
    return await this.repository.save(entity);
  }

  async update(id: string, data: UpdatePaymentMethodProviderDto): Promise<PaymentMethodProvider | null> {
    const result = await this.repository.update(id, data);
    if (result.affected === 0) {
      return null;
    }
    return await this.findById(id);
  }

  async findByPaymentMethod(paymentMethodId: string): Promise<PaymentMethodProvider | null> {
    return await this.repository.findOne({
      where: { paymentMethodId },
    });
  }

  async findById(id: string): Promise<PaymentMethodProvider | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findActiveByProviderKey(providerKey: string): Promise<PaymentMethodProvider | null> {
    return this.repository
      .createQueryBuilder('provider')
      .where('LOWER(provider.provider_key) = LOWER(:providerKey)', { providerKey })
      .andWhere('provider.is_active = :isActive', { isActive: true })
      .orderBy('provider.updated_at', 'DESC')
      .getOne();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
