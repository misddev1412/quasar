export interface Country {
  id: string;
  name: string;
  code: string;
  iso2?: string;
  iso3?: string;
  phoneCode?: string;
}

export interface AdministrativeDivision {
  id: string;
  name: string;
  code?: string;
  type: 'PROVINCE' | 'WARD';
}

export interface Address {
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
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  formattedAddress: string;
  displayLabel: string;
  isShippingAddress: boolean;
  isBillingAddress: boolean;
}