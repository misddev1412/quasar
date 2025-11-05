export interface ShippingProvider {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  trackingUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  apiKey?: string | null;
  apiSecret?: string | null;
}

export interface ShippingProviderFiltersType {
  search?: string;
  isActive?: boolean;
  hasTracking?: boolean;
  supportsDomestic?: boolean;
  supportsInternational?: boolean;
  supportsExpress?: boolean;
  page?: number;
  limit?: number;
}
