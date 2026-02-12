import type { ShippingProvider } from '@admin/types/shipping-provider';

export interface FulfillmentAddress {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderFulfillment {
  id: string;
  fulfillmentNumber: string;
  status: string;
  priorityLevel: string;
  createdAt: string;
  orderNumber: string;
  customerName: string;
  shippingProviderId?: string;
  shippingProvider?: Pick<ShippingProvider, 'id' | 'name'>;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  shippingCost?: number;
  insuranceCost?: number;
  packagingType?: string;
  packageWeight?: number;
  packageDimensions?: string;
  deliveryInstructions?: string;
  notes?: string;
  internalNotes?: string;
  shippingAddress?: FulfillmentAddress;
}

export interface OrderFulfillmentResponse {
  data?: OrderFulfillment;
}

export interface ShippingProvidersListResponse {
  items?: ShippingProvider[];
  data?: {
    items?: ShippingProvider[];
  };
}
