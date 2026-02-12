export type PaymentMethodType =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'DIGITAL_WALLET'
  | 'CASH'
  | 'CHECK'
  | 'CRYPTOCURRENCY'
  | 'BUY_NOW_PAY_LATER'
  | 'OTHER';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  processingFee: number;
  processingFeeType: 'FIXED' | 'PERCENTAGE';
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies?: string[];
  iconUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodListResponse {
  data?: {
    items?: PaymentMethod[];
    total?: number;
    totalPages?: number;
  };
}

export interface PaymentMethodStatsResponse {
  data?: {
    total: number;
    active: number;
    inactive: number;
  };
}
