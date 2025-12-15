import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not, IsNull } from 'typeorm';
import { PaymentMethod, PaymentMethodType } from '../entities/payment-method.entity';

export interface CreatePaymentMethodDto {
  name: string;
  type: PaymentMethodType;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  processingFee?: number;
  processingFeeType?: 'FIXED' | 'PERCENTAGE';
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies?: string[];
  iconUrl?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  type?: PaymentMethodType;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  processingFee?: number;
  processingFeeType?: 'FIXED' | 'PERCENTAGE';
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies?: string[];
  iconUrl?: string;
  isDefault?: boolean;
}

export interface PaymentMethodFilters {
  type?: PaymentMethodType;
  isActive?: boolean;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
}

@Injectable()
export class PaymentMethodRepository {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repository: Repository<PaymentMethod>,
  ) {}

  async create(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // If setting as default, remove default from others
    if (data.isDefault) {
      await this.removeDefaultFromOthers();
    }

    const paymentMethod = this.repository.create(data as any);
    return await this.repository.save(paymentMethod) as unknown as PaymentMethod;
  }

  async findAll(filters?: PaymentMethodFilters): Promise<PaymentMethod[]> {
    const query = this.repository.createQueryBuilder('pm')
      .where('pm.deleted_at IS NULL')
      .orderBy('pm.sort_order', 'ASC')
      .addOrderBy('pm.name', 'ASC');

    if (filters?.type) {
      query.andWhere('pm.type = :type', { type: filters.type });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('pm.is_active = :isActive', { isActive: filters.isActive });
    }

    if (filters?.currency) {
      query.andWhere(
        '(pm.supported_currencies IS NULL OR JSON_CONTAINS(pm.supported_currencies, :currency))',
        { currency: `"${filters.currency.toUpperCase()}"` }
      );
    }

    if (filters?.minAmount !== undefined) {
      query.andWhere('(pm.min_amount IS NULL OR pm.min_amount <= :minAmount)', {
        minAmount: filters.minAmount,
      });
    }

    if (filters?.maxAmount !== undefined) {
      query.andWhere('(pm.max_amount IS NULL OR pm.max_amount >= :maxAmount)', {
        maxAmount: filters.maxAmount,
      });
    }

    return await query.getMany();
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByType(type: PaymentMethodType): Promise<PaymentMethod[]> {
    return await this.repository.find({
      where: { type, deletedAt: IsNull() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActive(): Promise<PaymentMethod[]> {
    return await this.repository.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findDefault(): Promise<PaymentMethod | null> {
    return await this.repository.findOne({
      where: { isDefault: true, deletedAt: IsNull() },
    });
  }

  async findForAmount(amount: number, currency?: string): Promise<PaymentMethod[]> {
    const query = this.repository.createQueryBuilder('pm')
      .where('pm.deleted_at IS NULL')
      .andWhere('pm.is_active = :isActive', { isActive: true })
      .andWhere('(pm.min_amount IS NULL OR pm.min_amount <= :amount)', { amount })
      .andWhere('(pm.max_amount IS NULL OR pm.max_amount >= :amount)', { amount })
      .orderBy('pm.sort_order', 'ASC');

    if (currency) {
      query.andWhere(
        '(pm.supported_currencies IS NULL OR JSON_CONTAINS(pm.supported_currencies, :currency))',
        { currency: `"${currency.toUpperCase()}"` }
      );
    }

    return await query.getMany();
  }

  async update(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod | null> {
    // If setting as default, remove default from others
    if (data.isDefault) {
      await this.removeDefaultFromOthers(id);
    }

    const result = await this.repository.update(
      { id, deletedAt: IsNull() },
      data as any
    );

    if (result.affected === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async setDefault(id: string): Promise<PaymentMethod | null> {
    await this.removeDefaultFromOthers(id);

    const result = await this.repository.update(
      { id, deletedAt: IsNull() },
      { isDefault: true }
    );

    if (result.affected === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async toggleActive(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.findById(id);
    if (!paymentMethod) {
      return null;
    }

    const result = await this.repository.update(
      { id, deletedAt: IsNull() },
      { isActive: !paymentMethod.isActive }
    );

    if (result.affected === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async count(filters?: PaymentMethodFilters): Promise<number> {
    const where: FindOptionsWhere<PaymentMethod> = { deletedAt: IsNull() };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await this.repository.count({ where });
  }

  async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
    for (const item of items) {
      await this.repository.update(
        { id: item.id, deletedAt: IsNull() },
        { sortOrder: item.sortOrder }
      );
    }
  }

  private async removeDefaultFromOthers(excludeId?: string): Promise<void> {
    const query = this.repository.createQueryBuilder()
      .update(PaymentMethod)
      .set({ isDefault: false })
      .where('isDefault = :isDefault', { isDefault: true })
      .andWhere('deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('id != :excludeId', { excludeId });
    }

    await query.execute();
  }
}
