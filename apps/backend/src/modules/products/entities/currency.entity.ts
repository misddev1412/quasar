import { Entity, Column, Unique, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';

@Entity('currencies')
@Unique(['code'])
@Index(['code'])
@Index(['isDefault'])
@Index(['isActive'])
export class Currency extends BaseEntity {
  @Expose()
  @Column({ type: 'varchar', length: 3 })
  code: string;

  @Expose()
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Expose()
  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Expose()
  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 1.0
  })
  exchangeRate: number;

  @Expose()
  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false
  })
  isDefault: boolean;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'decimal_places',
    type: 'integer',
    default: 2
  })
  decimalPlaces: number;

  @Expose()
  @Column({
    type: 'varchar',
    length: 20,
    default: '{symbol}{amount}'
  })
  format: string;

  // Helper methods
  formatAmount(amount: number): string {
    const formattedAmount = amount.toFixed(this.decimalPlaces);

    switch (this.format) {
      case '{symbol}{amount}':
        return `${this.symbol}${formattedAmount}`;
      case '{amount}{symbol}':
        return `${formattedAmount}${this.symbol}`;
      case '{symbol} {amount}':
        return `${this.symbol} ${formattedAmount}`;
      case '{amount} {symbol}':
        return `${formattedAmount} ${this.symbol}`;
      default:
        return `${this.symbol}${formattedAmount}`;
    }
  }

  convertToDefault(amount: number): number {
    return amount * this.exchangeRate;
  }

  convertFromDefault(amount: number): number {
    return amount / this.exchangeRate;
  }

  convertToTarget(amount: number, targetCurrency: Currency): number {
    const amountInDefault = this.convertToDefault(amount);
    return targetCurrency.convertFromDefault(amountInDefault);
  }

  isExchangeRateValid(): boolean {
    return this.exchangeRate > 0;
  }

  setAsDefault(): void {
    this.isDefault = true;
  }

  unsetAsDefault(): void {
    this.isDefault = false;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
    // Cannot deactivate default currency
    if (this.isDefault) {
      throw new Error('Cannot deactivate the default currency');
    }
  }

  updateExchangeRate(newRate: number): void {
    if (newRate <= 0) {
      throw new Error('Exchange rate must be greater than 0');
    }
    this.exchangeRate = newRate;
  }
}