export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  decimalPlaces: number;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCurrencyData {
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
  isDefault?: boolean;
  isActive?: boolean;
  decimalPlaces?: number;
  format?: string;
}

export interface UpdateCurrencyData {
  code?: string;
  name?: string;
  symbol?: string;
  exchangeRate?: number;
  isDefault?: boolean;
  isActive?: boolean;
  decimalPlaces?: number;
  format?: string;
}

export interface CurrencyFiltersType {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CurrencyStatistics {
  total: number;
  active: number;
  inactive: number;
  hasDefault: boolean;
}