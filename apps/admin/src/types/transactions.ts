export type CustomerTransactionType =
  | 'order_payment'
  | 'refund'
  | 'wallet_topup'
  | 'withdrawal'
  | 'adjustment'
  | 'subscription';

export type CustomerTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type LedgerEntryDirection = 'credit' | 'debit';

export type TransactionChannel = 'system' | 'admin' | 'customer' | 'automation';

export interface TransactionCustomerPreview {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  customer?: TransactionCustomerPreview;
  transactionCode: string;
  type: CustomerTransactionType;
  status: CustomerTransactionStatus;
  impactDirection: LedgerEntryDirection;
  impactAmount: number;
  currency: string;
  channel: TransactionChannel;
  referenceId?: string;
  description?: string;
  totalAmount: number;
  entryCount: number;
  processedAt?: string;
  failureReason?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  metadata: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStatsSummary {
  totalVolume: number;
  creditVolume: number;
  debitVolume: number;
  pendingCount: number;
  failedCount: number;
  totalTransactions: number;
  uniqueCustomers: number;
}

export interface TransactionFilterState {
  status?: CustomerTransactionStatus;
  type?: CustomerTransactionType;
  direction?: LedgerEntryDirection;
  currency?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}
