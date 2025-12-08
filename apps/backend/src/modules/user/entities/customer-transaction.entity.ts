import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Customer } from '../../products/entities/customer.entity';

export enum CustomerTransactionType {
  ORDER_PAYMENT = 'order_payment',
  REFUND = 'refund',
  WALLET_TOPUP = 'wallet_topup',
  WITHDRAWAL = 'withdrawal',
  ADJUSTMENT = 'adjustment',
  SUBSCRIPTION = 'subscription',
}

export enum CustomerTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum LedgerEntryDirection {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum LedgerAccountType {
  CUSTOMER_BALANCE = 'customer_balance',
  PLATFORM_CLEARING = 'platform_clearing',
  PROMOTION_RESERVE = 'promotion_reserve',
  BANK_SETTLEMENT = 'bank_settlement',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionChannel {
  SYSTEM = 'system',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  AUTOMATION = 'automation',
}

@Entity('customer_transactions')
@Index('IDX_customer_transactions_customer', ['customerId'])
@Index('IDX_customer_transactions_status', ['status'])
@Index('IDX_customer_transactions_type', ['type'])
@Index('IDX_customer_transactions_code', ['transactionCode'], { unique: true })
@Index('IDX_customer_transactions_related_entity', ['relatedEntityType', 'relatedEntityId'])
export class CustomerTransaction extends BaseEntity {
  @Expose()
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Expose()
  @ManyToOne(() => Customer, customer => customer.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Expose()
  @Column({ name: 'transaction_code', type: 'varchar', length: 30, unique: true })
  transactionCode!: string;

  @Expose()
  @Column({ type: 'enum', enum: CustomerTransactionType })
  type!: CustomerTransactionType;

  @Expose()
  @Column({ type: 'enum', enum: CustomerTransactionStatus, default: CustomerTransactionStatus.PENDING })
  status!: CustomerTransactionStatus;

  @Expose()
  @Column({ name: 'impact_direction', type: 'enum', enum: LedgerEntryDirection })
  impactDirection!: LedgerEntryDirection;

  @Expose()
  @Column({ name: 'impact_amount', type: 'decimal', precision: 12, scale: 2 })
  impactAmount!: number;

  @Expose()
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Expose()
  @Column({ type: 'enum', enum: TransactionChannel, default: TransactionChannel.ADMIN })
  channel!: TransactionChannel;

  @Expose()
  @Column({ name: 'reference_id', type: 'varchar', length: 100, nullable: true })
  referenceId?: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Expose()
  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Expose()
  @Column({ name: 'entry_count', type: 'integer', default: 0 })
  entryCount!: number;

  @Expose()
  @Column({ name: 'related_entity_type', type: 'varchar', length: 50, nullable: true })
  relatedEntityType?: string;

  @Expose()
  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId?: string;

  @Expose()
  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Expose()
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Expose()
  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Expose()
  @OneToMany(() => CustomerTransactionEntry, entry => entry.transaction, {
    cascade: ['insert'],
  })
  entries?: CustomerTransactionEntry[];

  toJSON(): Record<string, unknown> {
    const { entries, ...rest } = this;
    return {
      ...rest,
      entries: Array.isArray(entries)
        ? entries.map((entry) => {
            const { transaction, ...entryRest } = entry || {};
            return entryRest;
          })
        : entries,
    };
  }
}

@Entity('customer_transaction_entries')
@Index('IDX_transaction_entries_transaction', ['transactionId'])
@Index('IDX_transaction_entries_account', ['ledgerAccount'])
export class CustomerTransactionEntry extends BaseEntity {
  @Expose()
  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId!: string;

  @Expose()
  @ManyToOne(() => CustomerTransaction, transaction => transaction.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: CustomerTransaction;

  @Expose()
  @Column({ name: 'entry_direction', type: 'enum', enum: LedgerEntryDirection })
  entryDirection!: LedgerEntryDirection;

  @Expose()
  @Column({ name: 'ledger_account', type: 'enum', enum: LedgerAccountType })
  ledgerAccount!: LedgerAccountType;

  @Expose()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Expose()
  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description?: string;

  toJSON(): Record<string, unknown> {
    const { transaction, ...rest } = this;
    return rest;
  }
}
