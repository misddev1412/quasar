import type { CartItemDetails } from '../../types/cart';
import type { CountryOption } from './AddressForm';

export interface CheckoutFormData {
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddressSameAsShipping: boolean;
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  shippingMethod: string;
  paymentMethod: {
    type: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery' | 'payos';
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
    paypalEmail?: string;
    bankAccountNumber?: string;
    bankName?: string;
    provider?: string;
    metadata?: Record<string, any>;
    paymentMethodId?: string;
  };
  orderNotes?: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

export interface CheckoutCountry extends CountryOption {
  iso2?: string;
  iso3?: string;
  phoneCode?: string;
}

export interface SavedAddress {
  id: string;
  customerId: string;
  countryId: string;
  provinceId?: string;
  wardId?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  addressType: 'BILLING' | 'SHIPPING' | 'BOTH';
  isDefault: boolean;
  label?: string;
  deliveryInstructions?: string;
  createdAt?: Date;
  updatedAt?: Date;
  fullName: string;
  formattedAddress: string;
  displayLabel: string;
  isShippingAddress: boolean;
  isBillingAddress: boolean;
}

export interface DeliveryMethodOption {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  costCalculationType: string;
  deliveryCost: number;
  estimatedDeliveryTime?: string;
  providerName?: string;
  trackingEnabled: boolean;
  insuranceEnabled: boolean;
  signatureRequired: boolean;
  iconUrl?: string;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface CheckoutFormProps {
  cartItems: CartItemDetails[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  onSubmit: (data: CheckoutFormData) => void;
  loading?: boolean;
  className?: string;
  showOrderSummary?: boolean;
  requireAccount?: boolean;
  guestCheckoutAllowed?: boolean;
  currency?: string;
  savedAddresses?: SavedAddress[];
  countries?: CheckoutCountry[];
  isAuthenticated?: boolean;
  authLoading?: boolean;
  userEmail?: string;
  userName?: string;
  initialFormData?: Partial<CheckoutFormData>;
  onFormDataChange?: (data: CheckoutFormData) => void;
  defaultCountryId?: string;
}
