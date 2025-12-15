import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { PaymentMethodProvider } from './payment-method-provider.entity';

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  CASH = 'CASH',
  CHECK = 'CHECK',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  BUY_NOW_PAY_LATER = 'BUY_NOW_PAY_LATER',
  PAYOS = 'PAYOS',
  OTHER = 'OTHER',
}

export enum ProcessingFeeType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    nullable: false,
  })
  @Index()
  type: PaymentMethodType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  @Index()
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0, nullable: false })
  @Index()
  sortOrder: number;

  @Column({
    name: 'processing_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
  })
  processingFee: number;

  @Column({
    name: 'processing_fee_type',
    type: 'enum',
    enum: ProcessingFeeType,
    default: ProcessingFeeType.FIXED,
    nullable: false,
  })
  processingFeeType: ProcessingFeeType;

  @Column({
    name: 'min_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minAmount?: number;

  @Column({
    name: 'max_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxAmount?: number;

  @Column({
    name: 'supported_currencies',
    type: 'json',
    nullable: true,
    comment: 'Array of supported currency codes',
  })
  supportedCurrencies?: string[];

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl?: string;

  @Column({ name: 'is_default', type: 'boolean', default: false, nullable: false })
  @Index()
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToOne(() => PaymentMethodProvider, (provider) => provider.paymentMethod, { cascade: true })
  providerConfig?: PaymentMethodProvider;

  // Helper methods
  calculateProcessingFee(amount: number): number {
    if (this.processingFeeType === ProcessingFeeType.PERCENTAGE) {
      return (amount * this.processingFee) / 100;
    }
    return this.processingFee;
  }

  isAmountSupported(amount: number): boolean {
    if (this.minAmount !== undefined && amount < this.minAmount) {
      return false;
    }
    if (this.maxAmount !== undefined && amount > this.maxAmount) {
      return false;
    }
    return true;
  }

  isCurrencySupported(currency: string): boolean {
    if (!this.supportedCurrencies || this.supportedCurrencies.length === 0) {
      return true; // No restriction means all currencies are supported
    }
    return this.supportedCurrencies.includes(currency.toUpperCase());
  }
}
