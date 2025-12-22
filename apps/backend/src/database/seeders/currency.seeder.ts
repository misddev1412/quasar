import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../../modules/products/entities/currency.entity';

@Injectable()
export class CurrencySeeder {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  private readonly currenciesData = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      exchangeRate: 1.0,
      isDefault: true,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'VND',
      name: 'Vietnamese Dong',
      symbol: '₫',
      exchangeRate: 25455.0,
      isDefault: false,
      isActive: true,
      decimalPlaces: 0,
      format: '{amount}{symbol}'
    },
    {
      code: 'CNY',
      name: 'Chinese Yuan',
      symbol: '¥',
      exchangeRate: 7.24,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      exchangeRate: 0.92,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      exchangeRate: 149.50,
      isDefault: false,
      isActive: true,
      decimalPlaces: 0,
      format: '{symbol}{amount}'
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      exchangeRate: 0.79,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'KRW',
      name: 'South Korean Won',
      symbol: '₩',
      exchangeRate: 1318.0,
      isDefault: false,
      isActive: true,
      decimalPlaces: 0,
      format: '{symbol}{amount}'
    },
    {
      code: 'THB',
      name: 'Thai Baht',
      symbol: '฿',
      exchangeRate: 36.50,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: 'S$',
      exchangeRate: 1.35,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'MYR',
      name: 'Malaysian Ringgit',
      symbol: 'RM',
      exchangeRate: 4.65,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'AUD',
      name: 'Australian Dollar',
      symbol: 'A$',
      exchangeRate: 1.52,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C$',
      exchangeRate: 1.36,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'CHF',
      name: 'Swiss Franc',
      symbol: 'CHF',
      exchangeRate: 0.88,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{amount} {symbol}'
    },
    {
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹',
      exchangeRate: 83.12,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'IDR',
      name: 'Indonesian Rupiah',
      symbol: 'Rp',
      exchangeRate: 15875.0,
      isDefault: false,
      isActive: true,
      decimalPlaces: 0,
      format: '{symbol}{amount}'
    },
    {
      code: 'PHP',
      name: 'Philippine Peso',
      symbol: '₱',
      exchangeRate: 56.50,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'HKD',
      name: 'Hong Kong Dollar',
      symbol: 'HK$',
      exchangeRate: 7.82,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'TWD',
      name: 'Taiwan Dollar',
      symbol: 'NT$',
      exchangeRate: 31.85,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    },
    {
      code: 'RUB',
      name: 'Russian Ruble',
      symbol: '₽',
      exchangeRate: 90.25,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{amount} {symbol}'
    },
    {
      code: 'BRL',
      name: 'Brazilian Real',
      symbol: 'R$',
      exchangeRate: 4.95,
      isDefault: false,
      isActive: true,
      decimalPlaces: 2,
      format: '{symbol}{amount}'
    }
  ];

  async seed(): Promise<void> {
    let created = 0;
    let skipped = 0;
    let defaultCurrencyExists = false;

    // Check if default currency already exists
    const existingDefaultCurrency = await this.currencyRepository.findOne({
      where: { isDefault: true }
    });

    if (existingDefaultCurrency) {
      defaultCurrencyExists = true;
    }

    for (const currencyData of this.currenciesData) {
      const existingCurrency = await this.currencyRepository.findOne({
        where: { code: currencyData.code }
      });

      if (!existingCurrency) {
        // Ensure only one default currency
        if (currencyData.isDefault && defaultCurrencyExists) {
          skipped++;
          continue;
        }

        const currency = this.currencyRepository.create(currencyData);
        await this.currencyRepository.save(currency);
        created++;

        if (currencyData.isDefault) {
          defaultCurrencyExists = true;
        }

        if (created % 5 === 0) {
          // periodic checkpoint for large inserts
        }
      } else {
        // Update existing currency if needed
        let updated = false;

        if (existingCurrency.name !== currencyData.name) {
          existingCurrency.name = currencyData.name;
          updated = true;
        }

        if (existingCurrency.symbol !== currencyData.symbol) {
          existingCurrency.symbol = currencyData.symbol;
          updated = true;
        }

        if (Math.abs(existingCurrency.exchangeRate - currencyData.exchangeRate) > 0.0001) {
          existingCurrency.exchangeRate = currencyData.exchangeRate;
          updated = true;
        }

        if (updated) {
          await this.currencyRepository.save(existingCurrency);
        }

        skipped++;
      }
    }
  }

  async seedIfEmpty(): Promise<void> {
    const existingCount = await this.currencyRepository.count();

    if (existingCount === 0) {
      await this.seed();
    }
  }

  async reseed(): Promise<void> {
    await this.seed();
  }

  async clearAndReseed(): Promise<void> {
    try {
      await this.currencyRepository.query('DELETE FROM currencies');
      await this.seed();
    } catch (error) {
      console.error('❌ Clear and reseed failed:', error);
      throw error;
    }
  }

  async updateExchangeRates(): Promise<void> {
    const currencies = await this.currencyRepository.find();
    let updated = 0;

    for (const currencyData of this.currenciesData) {
      const currency = currencies.find(c => c.code === currencyData.code);

      if (currency && Math.abs(currency.exchangeRate - currencyData.exchangeRate) > 0.0001) {
        currency.exchangeRate = currencyData.exchangeRate;
        await this.currencyRepository.save(currency);
        updated++;
      }
    }

  }
}
