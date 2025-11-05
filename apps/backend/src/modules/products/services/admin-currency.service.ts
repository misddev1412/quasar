import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entities/currency.entity';

export interface CurrencyListFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CreateCurrencyInput {
  code?: string;
  name?: string;
  symbol?: string;
  exchangeRate?: number;
  decimalPlaces?: number;
  format?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

@Injectable()
export class AdminCurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async list(filters: CurrencyListFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 20;

    const queryBuilder = this.currencyRepository.createQueryBuilder('currency');

    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(currency.code) LIKE :searchTerm OR LOWER(currency.name) LIKE :searchTerm)',
        { searchTerm },
      );
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('currency.is_active = :isActive', { isActive: filters.isActive });
    }

    if (filters.isDefault !== undefined) {
      queryBuilder.andWhere('currency.is_default = :isDefault', { isDefault: filters.isDefault });
    }

    queryBuilder
      .orderBy('currency.is_default', 'DESC')
      .addOrderBy('currency.code', 'ASC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1 && totalPages > 0,
    };
  }

  async create(input: CreateCurrencyInput) {
    const rawCode = input.code?.trim().toUpperCase();
    if (!rawCode) {
      throw new BadRequestException('Currency code is required');
    }

    if (rawCode.length !== 3) {
      throw new BadRequestException('Currency code must be exactly 3 characters');
    }

    const existing = await this.currencyRepository.findOne({ where: { code: rawCode } });
    if (existing) {
      throw new BadRequestException(`Currency with code ${rawCode} already exists`);
    }

    const name = input.name?.trim();
    if (!name) {
      throw new BadRequestException('Currency name is required');
    }

    const symbol = input.symbol?.trim();
    if (!symbol) {
      throw new BadRequestException('Currency symbol is required');
    }

    const exchangeRate = input.exchangeRate ?? 1;
    if (exchangeRate <= 0) {
      throw new BadRequestException('Exchange rate must be greater than 0');
    }

    const decimalPlaces = input.decimalPlaces ?? 2;
    if (decimalPlaces < 0 || decimalPlaces > 8) {
      throw new BadRequestException('Decimal places must be between 0 and 8');
    }

    const payload: Partial<Currency> = {
      code: rawCode,
      name,
      symbol,
      exchangeRate,
      decimalPlaces,
      format: input.format?.trim() || '{symbol}{amount}',
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
    };

    return this.currencyRepository.manager.transaction(async manager => {
      if (payload.isDefault) {
        await manager
          .createQueryBuilder()
          .update(Currency)
          .set({ isDefault: false })
          .where('is_default = :isDefault', { isDefault: true })
          .execute();
      }

      const currency = manager.create(Currency, payload);
      return manager.save(currency);
    });
  }

  async delete(id: string) {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    if (currency.isDefault) {
      throw new BadRequestException('Cannot delete the default currency');
    }

    await this.currencyRepository.remove(currency);
  }

  async toggleStatus(id: string) {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    const nextStatus = !currency.isActive;
    if (!nextStatus && currency.isDefault) {
      throw new BadRequestException('Cannot deactivate the default currency');
    }

    currency.isActive = nextStatus;
    return this.currencyRepository.save(currency);
  }

  async setDefault(id: string) {
    return this.currencyRepository.manager.transaction(async manager => {
      const currency = await manager.findOne(Currency, { where: { id } });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }

      await manager
        .createQueryBuilder()
        .update(Currency)
        .set({ isDefault: false })
        .where('is_default = :isDefault', { isDefault: true })
        .execute();

      currency.isDefault = true;
      currency.isActive = true;
      return manager.save(currency);
    });
  }
}
