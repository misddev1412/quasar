export interface Country {
  id: string;
  name: string;
  code: string;
  iso2?: string;
  iso3?: string;
  phoneCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdministrativeDivision {
  id: string;
  countryId?: string;
  parentId?: string;
  name: string;
  code?: string;
  type: 'PROVINCE' | 'WARD';
  i18nKey: string;
  latitude?: number;
  longitude?: number;
  country?: Country;
  parent?: AdministrativeDivision;
  children?: AdministrativeDivision[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  userId?: string;
  customerNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  companyName?: string;
  jobTitle?: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  defaultBillingAddress?: AddressData;
  defaultShippingAddress?: AddressData;
  marketingConsent: boolean;
  newsletterSubscribed: boolean;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  customerTags?: string[];
  notes?: string;
  referralSource?: string;
  loyaltyPoints: number;
  taxExempt: boolean;
  taxId?: string;
  addressBook?: AddressBook[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressData {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AddressBook {
  id: string;
  customerId: string;
  customer?: Customer;
  countryId: string;
  country?: Country;
  provinceId?: string;
  province?: AdministrativeDivision;
  wardId?: string;
  ward?: AdministrativeDivision;
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
  fullName: string;
  formattedAddress: string;
  displayLabel: string;
  isShippingAddress: boolean;
  isBillingAddress: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface CreateAddressBookFormData {
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
  isDefault?: boolean;
  label?: string;
  deliveryInstructions?: string;
}

export interface UpdateAddressBookFormData extends Partial<CreateAddressBookFormData> {
  id: string;
}

// API Response types
export interface AddressBooksResponse {
  data: AddressBook[];
  total: number;
  page: number;
  limit: number;
}

export interface AddressBookStatsResponse {
  total: number;
  billing: number;
  shipping: number;
  both: number;
}

// Search and filter types
export interface AddressBookFilters {
  customerId?: string;
  countryId?: string;
  addressType?: 'BILLING' | 'SHIPPING' | 'BOTH';
  isDefault?: boolean;
  search?: string;
}

export interface AddressBookQueryOptions {
  page?: number;
  limit?: number;
  customerId?: string;
  countryId?: string;
  addressType?: 'BILLING' | 'SHIPPING' | 'BOTH';
}

// Component props types
export interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  addressBook?: AddressBook;
  onSuccess?: (addressBook: AddressBook) => void;
}

export interface AddressBookListProps {
  customerId: string;
  addressType?: 'BILLING' | 'SHIPPING' | 'BOTH';
  allowSelection?: boolean;
  selectedAddressId?: string;
  onAddressSelect?: (addressBook: AddressBook) => void;
  onAddressEdit?: (addressBook: AddressBook) => void;
  onAddressDelete?: (addressBookId: string) => void;
  onSetDefault?: (addressBookId: string) => void;
}

export interface AddressDisplayProps {
  addressBook: AddressBook;
  showCustomer?: boolean;
  showActions?: boolean;
  isSelected?: boolean;
  onEdit?: (addressBook: AddressBook) => void;
  onDelete?: (addressBookId: string) => void;
  onSetDefault?: (addressBookId: string) => void;
  onSelect?: (addressBook: AddressBook) => void;
}