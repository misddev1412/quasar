import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Divider, Input, Textarea, Checkbox, RadioGroup, Radio, Spinner } from '@heroui/react';
import AddressForm, { CountryOption, AdministrativeDivisionOption } from './AddressForm';
import PaymentMethodForm from './PaymentMethodForm';
import OrderSummary from './OrderSummary';
import type { CartItemDetails } from '../../types/cart';
import { trpc } from '../../utils/trpc';

export interface CheckoutFormData {
  // Customer Information
  email: string;

  // Shipping Address
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

  // Billing Address
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

  // Shipping Method
  shippingMethod: string;

  // Payment Method
  paymentMethod: {
    type: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
    paypalEmail?: string;
    bankAccountNumber?: string;
    bankName?: string;
  };

  // Order Notes
  orderNotes?: string;

  // Terms and Conditions
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

interface CheckoutFormProps {
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

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cartItems,
  subtotal,
  shippingCost,
  tax,
  total,
  onSubmit,
  loading = false,
  className = '',
  showOrderSummary = true,
  requireAccount = false,
  guestCheckoutAllowed = true,
  currency = '$',
  savedAddresses = [],
  countries = [],
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    shippingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
    },
    billingAddressSameAsShipping: true,
    shippingMethod: '',
    paymentMethod: {
      type: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    },
    orderNotes: '',
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(1);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [hasClearedSavedAddress, setHasClearedSavedAddress] = useState(false);

  const countryOptions = useMemo<CountryOption[]>(() => {
    if (!countries.length) {
      return [];
    }
    return countries.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code,
    }));
  }, [countries]);

  const shippingCountryId = formData.shippingAddress.country;
  const shippingProvinceId = formData.shippingAddress.state;

  const shippingProvincesQuery = trpc.clientAddressBook.getAdministrativeDivisions.useQuery(
    { countryId: shippingCountryId, type: 'PROVINCE' },
    { enabled: Boolean(shippingCountryId) }
  );

  const shippingWardsQuery = trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: shippingProvinceId },
    { enabled: Boolean(shippingProvinceId) }
  );

  const shippingProvinceOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (shippingProvincesQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [shippingProvincesQuery.data]);

  const shippingWardOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (shippingWardsQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [shippingWardsQuery.data]);

  const billingCountryId = formData.billingAddressSameAsShipping
    ? shippingCountryId
    : formData.billingAddress?.country ?? '';
  const billingProvinceId = formData.billingAddressSameAsShipping
    ? shippingProvinceId
    : formData.billingAddress?.state ?? '';

  const billingProvincesQuery = trpc.clientAddressBook.getAdministrativeDivisions.useQuery(
    { countryId: billingCountryId, type: 'PROVINCE' },
    { enabled: Boolean(billingCountryId) && !formData.billingAddressSameAsShipping }
  );

  const billingWardsQuery = trpc.clientAddressBook.getAdministrativeDivisionsByParentId.useQuery(
    { parentId: billingProvinceId },
    { enabled: Boolean(billingProvinceId) && !formData.billingAddressSameAsShipping }
  );

  const billingProvinceOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (billingProvincesQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [billingProvincesQuery.data]);

  const billingWardOptions = useMemo<AdministrativeDivisionOption[]>(() => {
    const divisions = (billingWardsQuery.data as AdministrativeDivisionOption[] | undefined) ?? [];
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      code: division.code,
      type: division.type,
    }));
  }, [billingWardsQuery.data]);

  const billingAddressValue = formData.billingAddress ?? {
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: billingCountryId,
    phone: '',
  };

  const coverageArea = useMemo(() => {
    const provinceName =
      shippingProvinceOptions.find((province) => province.id === shippingProvinceId)?.name ||
      formData.shippingAddress.state;
    const wardName =
      shippingWardOptions.find((ward) => ward.id === formData.shippingAddress.city)?.name ||
      formData.shippingAddress.city;
    return [wardName, provinceName].filter(Boolean).join(', ') || undefined;
  }, [
    shippingProvinceOptions,
    shippingWardOptions,
    shippingProvinceId,
    formData.shippingAddress.city,
    formData.shippingAddress.state,
  ]);

  const deliveryMethodInput = useMemo(
    () => ({
      orderAmount: subtotal,
      coverageArea,
    }),
    [subtotal, coverageArea]
  );

  const deliveryMethodsQuery = trpc.clientDeliveryMethods.list.useQuery(deliveryMethodInput, {
    keepPreviousData: true,
  });

  const deliveryMethods = useMemo<DeliveryMethodOption[]>(() => {
    const raw = deliveryMethodsQuery.data as
      | { items?: DeliveryMethodOption[] }
      | { data?: { items?: DeliveryMethodOption[] } }
      | undefined;

    const items = raw?.items ?? (raw && typeof raw === 'object' ? (raw as any).data?.items : undefined);

    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      ...item,
      deliveryCost: Number(item.deliveryCost ?? 0),
    }));
  }, [deliveryMethodsQuery.data]);

  const selectedShippingMethod = useMemo(
    () => deliveryMethods.find((method) => method.id === formData.shippingMethod),
    [deliveryMethods, formData.shippingMethod]
  );

  const updateFormData = useCallback((path: string, value: any) => {
    setFormData((prev) => {
      const newData: any = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });

    if (errors[path]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  }, [errors]);

  const applySavedAddress = useCallback(
    (address: SavedAddress, { autoSelect = false }: { autoSelect?: boolean } = {}) => {
      setHasClearedSavedAddress(false);
      setSelectedSavedAddressId(address.id);

      const newShippingAddress = {
        firstName: address.firstName || '',
      lastName: address.lastName || '',
      company: address.companyName || '',
      address1: address.addressLine1 || '',
      address2: address.addressLine2 || '',
      city: address.wardId || '',
      state: address.provinceId || '',
      postalCode: address.postalCode || '',
      country: address.countryId || '',
      phone: address.phoneNumber || '',
    };

    updateFormData('shippingAddress', newShippingAddress);

    if (!formData.email && address.email) {
      updateFormData('email', address.email);
    }

      if (!autoSelect) {
        setActiveStep(1);
      }
    },
    [formData.email, updateFormData]
  );

  const handleManualShippingChange = useCallback(
    (address: CheckoutFormData['shippingAddress']) => {
      setHasClearedSavedAddress(true);
      setSelectedSavedAddressId(null);
      updateFormData('shippingAddress', address);
    },
    [updateFormData]
  );

  const handleBillingAddressChange = useCallback(
    (address: CheckoutFormData['billingAddress']) => {
      updateFormData('billingAddress', address);
    },
    [updateFormData]
  );

  const handleSavedAddressSelect = useCallback(
    (address: SavedAddress) => {
      applySavedAddress(address);
    },
    [applySavedAddress]
  );

  useEffect(() => {
    if (!formData.shippingAddress.country && countryOptions.length > 0) {
      updateFormData('shippingAddress.country', countryOptions[0].id);
    }
  }, [countryOptions, formData.shippingAddress.country, updateFormData]);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      return;
    }

    const selected = savedAddresses.find((address) => address.id === selectedSavedAddressId);

    if (selectedSavedAddressId && !selected) {
      setSelectedSavedAddressId(null);
    }

    if (!selectedSavedAddressId && !hasClearedSavedAddress) {
      const defaultShippingAddress =
        savedAddresses.find((address) => address.isDefault && address.isShippingAddress) ??
        savedAddresses.find((address) => address.isShippingAddress) ??
        savedAddresses[0];

      if (defaultShippingAddress) {
        applySavedAddress(defaultShippingAddress, { autoSelect: true });
      }
    }
  }, [savedAddresses, selectedSavedAddressId, hasClearedSavedAddress, applySavedAddress]);

  useEffect(() => {
    if (deliveryMethods.length === 0) {
      if (formData.shippingMethod) {
        updateFormData('shippingMethod', '');
      }
      return;
    }

    const selected = deliveryMethods.find((method) => method.id === formData.shippingMethod);
    if (selected && selected.isAvailable) {
      return;
    }

    const available = deliveryMethods.filter((method) => method.isAvailable);
    const preferred =
      available.find((method) => method.isDefault) ?? available[0] ?? deliveryMethods[0];

    if (preferred && preferred.id !== formData.shippingMethod) {
      updateFormData('shippingMethod', preferred.id);
    }
  }, [deliveryMethods, formData.shippingMethod, updateFormData]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validate contact information
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      // Validate shipping address
      if (!formData.shippingAddress.firstName.trim()) {
        newErrors['shippingAddress.firstName'] = 'First name is required';
      }
      if (!formData.shippingAddress.lastName.trim()) {
        newErrors['shippingAddress.lastName'] = 'Last name is required';
      }
      if (!formData.shippingAddress.address1.trim()) {
        newErrors['shippingAddress.address1'] = 'Address is required';
      }
      if (!formData.shippingAddress.city.trim()) {
        newErrors['shippingAddress.city'] = 'City is required';
      }
      if (!formData.shippingAddress.state.trim()) {
        newErrors['shippingAddress.state'] = 'State is required';
      }
      if (!formData.shippingAddress.postalCode.trim()) {
        newErrors['shippingAddress.postalCode'] = 'Postal code is required';
      }
      if (!formData.shippingAddress.country.trim()) {
        newErrors['shippingAddress.country'] = 'Country is required';
      }

      // Validate billing address if different from shipping
      if (!formData.billingAddressSameAsShipping) {
        if (!formData.billingAddress?.firstName.trim()) {
          newErrors['billingAddress.firstName'] = 'First name is required';
        }
        if (!formData.billingAddress?.lastName.trim()) {
          newErrors['billingAddress.lastName'] = 'Last name is required';
        }
        if (!formData.billingAddress?.address1.trim()) {
          newErrors['billingAddress.address1'] = 'Address is required';
        }
        if (!formData.billingAddress?.city.trim()) {
          newErrors['billingAddress.city'] = 'City is required';
        }
        if (!formData.billingAddress?.state.trim()) {
          newErrors['billingAddress.state'] = 'State is required';
        }
        if (!formData.billingAddress?.postalCode.trim()) {
          newErrors['billingAddress.postalCode'] = 'Postal code is required';
        }
        if (!formData.billingAddress?.country.trim()) {
          newErrors['billingAddress.country'] = 'Country is required';
        }
      }
    }

    if (step === 2) {
      // Validate shipping method
      if (!formData.shippingMethod) {
        newErrors.shippingMethod = 'Please select a shipping method';
      } else {
        const method = deliveryMethods.find((option) => option.id === formData.shippingMethod);
        if (!method) {
          newErrors.shippingMethod = 'Selected delivery method is invalid';
        } else if (!method.isAvailable) {
          newErrors.shippingMethod = method.unavailableReason || 'Delivery method is not available';
        }
      }
    }

    if (step === 3) {
      // Validate payment method
      if (formData.paymentMethod.type === 'credit_card') {
        if (!formData.paymentMethod.cardNumber?.trim()) {
          newErrors['paymentMethod.cardNumber'] = 'Card number is required';
        }
        if (!formData.paymentMethod.expiryDate?.trim()) {
          newErrors['paymentMethod.expiryDate'] = 'Expiry date is required';
        }
        if (!formData.paymentMethod.cvv?.trim()) {
          newErrors['paymentMethod.cvv'] = 'CVV is required';
        }
        if (!formData.paymentMethod.cardholderName?.trim()) {
          newErrors['paymentMethod.cardholderName'] = 'Cardholder name is required';
        }
      }

      if (formData.paymentMethod.type === 'paypal') {
        if (!formData.paymentMethod.paypalEmail?.trim()) {
          newErrors['paymentMethod.paypalEmail'] = 'PayPal email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.paymentMethod.paypalEmail)) {
          newErrors['paymentMethod.paypalEmail'] = 'PayPal email is invalid';
        }
      }

      // Validate terms agreement
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      onSubmit(formData);
    }
  };

  const adjustedShippingCost = selectedShippingMethod
    ? selectedShippingMethod.deliveryCost
    : shippingCost;
  const discountAmountRaw = subtotal + shippingCost + tax - total;
  const discountAmount = Number.isFinite(discountAmountRaw)
    ? Math.max(0, discountAmountRaw)
    : 0;
  const adjustedTotal = Math.max(0, subtotal + adjustedShippingCost + tax - discountAmount);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${className}`}>
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      activeStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      activeStep >= step ? 'text-primary-500 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 ? 'Information' : step === 2 ? 'Shipping' : 'Payment'}
                  </span>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-4 ${
                        activeStep > step ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Contact & Address Information */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Contact Information</h3>

                <Input
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  variant="bordered"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                  fullWidth
                />

                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold mt-6">Saved Shipping Addresses</h3>
                    <div className="space-y-3">
                      {savedAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                            selectedSavedAddressId === address.id
                              ? 'border-primary-500 bg-primary-50/40'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="saved-shipping-address"
                            className="mt-1 h-4 w-4"
                            checked={selectedSavedAddressId === address.id}
                            onChange={() => handleSavedAddressSelect(address)}
                          />
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-gray-900">{address.fullName}</div>
                            <div className="whitespace-pre-line text-gray-600">{address.formattedAddress}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              {address.phoneNumber && <span>Phone: {address.phoneNumber}</span>}
                              {address.email && <span>Email: {address.email}</span>}
                            </div>
                            <div className="flex gap-2 text-xs">
                              {address.isDefault && (
                                <span className="rounded bg-primary-100 px-2 py-0.5 text-primary-600">Default</span>
                              )}
                              {address.label && (
                                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">{address.label}</span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setSelectedSavedAddressId(null);
                          setHasClearedSavedAddress(true);
                        }}
                      >
                        Use a different address
                      </Button>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-semibold mt-6">Shipping Address</h3>

                <AddressForm
                  address={formData.shippingAddress}
                  onChange={handleManualShippingChange}
                  errors={errors}
                  prefix="shippingAddress"
                  countries={countryOptions}
                  provinces={shippingProvinceOptions}
                  wards={shippingWardOptions}
                  loading={{
                    provinces: shippingProvincesQuery.isLoading,
                    wards: shippingWardsQuery.isLoading,
                  }}
                  onCountryChange={() => {
                    setHasClearedSavedAddress(true);
                    setSelectedSavedAddressId(null);
                  }}
                  onProvinceChange={() => {
                    setHasClearedSavedAddress(true);
                    setSelectedSavedAddressId(null);
                  }}
                  onWardChange={() => {
                    setHasClearedSavedAddress(true);
                    setSelectedSavedAddressId(null);
                  }}
                />

                <Checkbox
                  isSelected={formData.billingAddressSameAsShipping}
                  onChange={(e) => {
                    updateFormData('billingAddressSameAsShipping', e.target.checked);
                    if (e.target.checked) {
                      updateFormData('billingAddress', undefined);
                    }
                  }}
                >
                  Billing address is the same as shipping address
                </Checkbox>

                {!formData.billingAddressSameAsShipping && (
                  <>
                    <h3 className="text-lg font-semibold mt-6">Billing Address</h3>

                    <AddressForm
                      address={billingAddressValue}
                      onChange={handleBillingAddressChange}
                      errors={errors}
                      prefix="billingAddress"
                      countries={countryOptions}
                      provinces={billingProvinceOptions}
                      wards={billingWardOptions}
                      loading={{
                        provinces: billingProvincesQuery.isLoading,
                        wards: billingWardsQuery.isLoading,
                      }}
                    />
                  </>
                )}

                <div className="flex justify-end mt-6">
                  <Button color="primary" onPress={handleNextStep}>
                    Continue to Shipping
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Shipping Method</h3>

                <RadioGroup
                  value={formData.shippingMethod}
                  onValueChange={(value) => updateFormData('shippingMethod', value)}
                  isInvalid={!!errors.shippingMethod}
                  errorMessage={errors.shippingMethod}
                >
                  {deliveryMethodsQuery.isLoading ? (
                    <div className="py-6 flex justify-center">
                      <Spinner size="sm" label="Loading delivery methods" labelPlacement="right" />
                    </div>
                  ) : deliveryMethodsQuery.isError ? (
                    <div className="rounded-lg border border-dashed border-danger-300 bg-danger-50/40 p-4 text-sm text-danger-600">
                      Unable to load delivery methods. Please try again or revise your address details.
                    </div>
                  ) : deliveryMethods.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                      No delivery methods are available for the selected address. Please verify your details or try again later.
                    </div>
                  ) : (
                    deliveryMethods.map((method) => (
                      <Radio key={method.id} value={method.id} isDisabled={!method.isAvailable}>
                        <div className="flex justify-between items-start gap-4 w-full">
                          <div>
                            <div className="font-medium text-gray-900">{method.name}</div>
                            {method.description && (
                              <div className="text-sm text-gray-500">{method.description}</div>
                            )}
                            {method.estimatedDeliveryTime && (
                              <div className="text-xs text-gray-400 mt-1">
                                Estimated: {method.estimatedDeliveryTime}
                              </div>
                            )}
                            {!method.isAvailable && method.unavailableReason && (
                              <div className="text-xs text-danger-500 mt-1">
                                {method.unavailableReason}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <PriceDisplay price={method.deliveryCost} currency={currency} />
                            {method.isDefault && method.isAvailable && (
                              <div className="text-xs text-primary-500 mt-1">Recommended</div>
                            )}
                          </div>
                        </div>
                      </Radio>
                    ))
                  )}
                </RadioGroup>

                <h3 className="text-lg font-semibold mt-6">Order Notes (Optional)</h3>

                <Textarea
                  label="Special instructions for your order"
                  placeholder="Any special delivery instructions or notes about your order"
                  value={formData.orderNotes}
                  onChange={(e) => updateFormData('orderNotes', e.target.value)}
                  variant="bordered"
                  minRows={3}
                  fullWidth
                />

                <div className="flex justify-between mt-6">
                  <Button variant="flat" onPress={handlePrevStep}>
                    Return to Information
                  </Button>
                  <Button color="primary" onPress={handleNextStep}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Payment Method</h3>

                <RadioGroup
                  value={formData.paymentMethod.type}
                  onValueChange={(value) => updateFormData('paymentMethod.type', value)}
                >
                  <Radio value="credit_card">Credit Card</Radio>
                  <Radio value="paypal">PayPal</Radio>
                  <Radio value="bank_transfer">Bank Transfer</Radio>
                  <Radio value="cash_on_delivery">Cash on Delivery</Radio>
                </RadioGroup>

                {formData.paymentMethod.type === 'credit_card' && (
                  <PaymentMethodForm
                    paymentMethod={formData.paymentMethod}
                    onChange={(paymentMethod) => updateFormData('paymentMethod', paymentMethod)}
                    errors={errors}
                    prefix="paymentMethod"
                  />
                )}

                {formData.paymentMethod.type === 'paypal' && (
                  <div className="mt-4">
                    <Input
                      label="PayPal Email"
                      placeholder="your.paypal@email.com"
                      value={formData.paymentMethod.paypalEmail || ''}
                      onChange={(e) => updateFormData('paymentMethod.paypalEmail', e.target.value)}
                      variant="bordered"
                      isInvalid={!!errors['paymentMethod.paypalEmail']}
                      errorMessage={errors['paymentMethod.paypalEmail']}
                      fullWidth
                    />
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <Checkbox
                    isSelected={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    isInvalid={!!errors.agreeToTerms}
                    errorMessage={errors.agreeToTerms}
                  >
                    I agree to the Terms and Conditions and Privacy Policy
                  </Checkbox>

                  <Checkbox
                    isSelected={formData.agreeToMarketing}
                    onChange={(e) => updateFormData('agreeToMarketing', e.target.checked)}
                  >
                    I want to receive exclusive offers and updates via email
                  </Checkbox>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="flat" onPress={handlePrevStep}>
                    Return to Shipping
                  </Button>
                  <Button type="submit" color="primary" isLoading={loading}>
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>

      {/* Order Summary */}
      {showOrderSummary && (
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shippingCost={adjustedShippingCost}
              tax={tax}
              total={adjustedTotal}
              currency={currency}
              discount={discountAmount > 0 ? { amount: discountAmount } : undefined}
              className="mb-6"
            />

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contact our customer support if you have any questions about your order.
              </p>
              <Button variant="flat" size="sm" className="w-full">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
