import {
  CustomerTransactionStatus,
  CustomerTransactionType,
  LedgerAccountType,
  LedgerEntryDirection,
  TransactionChannel,
} from '../../entities/customer-transaction.entity';

export interface CreateCustomerTransactionDto {
  customerId: string;
  type: CustomerTransactionType;
  direction: LedgerEntryDirection;
  amount: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  channel?: TransactionChannel;
  metadata?: Record<string, unknown>;
  status?: CustomerTransactionStatus;
  relatedEntityType?: string;
  relatedEntityId?: string;
  processedAt?: Date;
  failureReason?: string;
  transactionCode?: string;
  counterAccount?: LedgerAccountType;
}

export interface CustomerTransactionFilters {
  page: number;
  limit: number;
  search?: string;
  status?: CustomerTransactionStatus;
  type?: CustomerTransactionType;
  direction?: LedgerEntryDirection;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface UpdateTransactionStatusDto {
  status: CustomerTransactionStatus;
  failureReason?: string;
  processedAt?: Date;
}

export interface TransactionStatsFilters {
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
}
