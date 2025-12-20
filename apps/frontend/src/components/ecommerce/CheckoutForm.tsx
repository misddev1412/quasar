'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Card, Input, Textarea, Checkbox, RadioGroup, Radio, Spinner } from '@heroui/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AddressForm, { AddressData } from './AddressForm';
import PaymentMethodForm from './PaymentMethodForm';
import OrderSummary from './OrderSummary';
import PriceDisplay from './PriceDisplay';
import { useCheckoutForm } from './useCheckoutForm';
import type {
  CheckoutFormProps,
  CheckoutFormData,
  CheckoutCountry,
  SavedAddress,
  DeliveryMethodOption,
} from './CheckoutForm.types';

export type {
  CheckoutFormProps,
  CheckoutFormData,
  CheckoutCountry,
  SavedAddress,
  DeliveryMethodOption,
} from './CheckoutForm.types';

const CHECKOUT_STEP_KEYS = ['information', 'shipping', 'payment'] as const;

const ADDRESS_FIELDS: Array<keyof CheckoutFormData['shippingAddress']> = [
  'firstName',
  'lastName',
  'company',
  'address1',
  'address2',
  'city',
  'state',
  'postalCode',
  'country',
  'phone',
];

const SHIPPING_QUERY_KEYS: Record<keyof CheckoutFormData['shippingAddress'], string> = {
  firstName: 'shippingFirstName',
  lastName: 'shippingLastName',
  company: 'shippingCompany',
  address1: 'shippingAddress1',
  address2: 'shippingAddress2',
  city: 'shippingCity',
  state: 'shippingState',
  postalCode: 'shippingPostalCode',
  country: 'shippingCountry',
  phone: 'shippingPhone',
};

const BILLING_QUERY_KEYS: Record<
  keyof NonNullable<CheckoutFormData['billingAddress']>,
  string
> = {
  firstName: 'billingFirstName',
  lastName: 'billingLastName',
  company: 'billingCompany',
  address1: 'billingAddress1',
  address2: 'billingAddress2',
  city: 'billingCity',
  state: 'billingState',
  postalCode: 'billingPostalCode',
  country: 'billingCountry',
  phone: 'billingPhone',
};

const PERSISTED_QUERY_PARAM_KEYS = [
  'email',
  ...Object.values(SHIPPING_QUERY_KEYS),
  'billingSameAsShipping',
  ...Object.values(BILLING_QUERY_KEYS),
  'shippingMethod',
  'paymentType',
  'paypalEmail',
  'orderNotes',
  'agreeToTerms',
  'agreeToMarketing',
];

const extractPersistedQueryParams = (params: URLSearchParams): Record<string, string> => {
  const result: Record<string, string> = {};

  PERSISTED_QUERY_PARAM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        result[key] = trimmed;
      }
    }
  });

  return result;
};

const serializePersistedQueryParams = (record: Record<string, string>): string | null => {
  const entries = Object.entries(record);
  if (entries.length === 0) {
    return null;
  }

  entries.sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0));

  return entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

const trimString = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const buildPersistableFormState = (data: CheckoutFormData): Record<string, string> => {
  const persistable: Record<string, string> = {};

  const email = trimString(data.email);
  if (email) {
    persistable.email = email;
  }

  (Object.entries(SHIPPING_QUERY_KEYS) as Array<[
    keyof CheckoutFormData['shippingAddress'],
    string,
  ]>).forEach(([field, key]) => {
    const value = trimString(data.shippingAddress[field]);
    if (value) {
      persistable[key] = value;
    }
  });

  if (!data.billingAddressSameAsShipping) {
    persistable.billingSameAsShipping = 'false';

    if (data.billingAddress) {
      (Object.entries(BILLING_QUERY_KEYS) as Array<[
        keyof NonNullable<CheckoutFormData['billingAddress']>,
        string,
      ]>).forEach(([field, key]) => {
        const value = trimString(data.billingAddress?.[field]);
        if (value) {
          persistable[key] = value;
        }
      });
    }
  }

  const shippingMethod = trimString(data.shippingMethod);
  if (shippingMethod) {
    persistable.shippingMethod = shippingMethod;
  }

  if (data.paymentMethod.type && data.paymentMethod.type !== 'credit_card') {
    persistable.paymentType = data.paymentMethod.type;
  }

  if (data.paymentMethod.type === 'paypal') {
    const paypalEmail = trimString(data.paymentMethod.paypalEmail);
    if (paypalEmail) {
      persistable.paypalEmail = paypalEmail;
    }
  }

  const orderNotes = trimString(data.orderNotes);
  if (orderNotes) {
    persistable.orderNotes = orderNotes;
  }

  if (data.agreeToTerms) {
    persistable.agreeToTerms = 'true';
  }

  if (data.agreeToMarketing) {
    persistable.agreeToMarketing = 'true';
  }

  return persistable;
};

const parsePersistedAddress = (raw: any): CheckoutFormData['shippingAddress'] | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  let hasValue = false;
  const address: CheckoutFormData['shippingAddress'] = {
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
  };

  ADDRESS_FIELDS.forEach((field) => {
    if (typeof raw[field] === 'string' && raw[field].trim().length > 0) {
      address[field] = raw[field];
      hasValue = true;
    }
  });

  return hasValue ? address : undefined;
};

const parseLegacyPersistedFormState = (
  raw: string | null
): Partial<CheckoutFormData> | undefined => {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }

    const result: Partial<CheckoutFormData> = {};

    if (typeof parsed.email === 'string') {
      result.email = parsed.email;
    }

    if (typeof parsed.billingAddressSameAsShipping === 'boolean') {
      result.billingAddressSameAsShipping = parsed.billingAddressSameAsShipping;
    }

    if (typeof parsed.shippingMethod === 'string') {
      result.shippingMethod = parsed.shippingMethod;
    }

    if (typeof parsed.orderNotes === 'string') {
      result.orderNotes = parsed.orderNotes;
    }

    if (typeof parsed.agreeToTerms === 'boolean') {
      result.agreeToTerms = parsed.agreeToTerms;
    }

    if (typeof parsed.agreeToMarketing === 'boolean') {
      result.agreeToMarketing = parsed.agreeToMarketing;
    }

    const shippingAddress = parsePersistedAddress(parsed.shippingAddress);
    if (shippingAddress) {
      result.shippingAddress = shippingAddress;
    }

    const billingAddress = parsePersistedAddress(parsed.billingAddress);
    if (billingAddress) {
      result.billingAddress = billingAddress;
    }

    if (parsed.paymentMethod && typeof parsed.paymentMethod === 'object') {
      const paymentMethod: Partial<CheckoutFormData['paymentMethod']> = {};
      if (typeof parsed.paymentMethod.type === 'string') {
        paymentMethod.type = parsed.paymentMethod.type;
      }
      if (typeof parsed.paymentMethod.paypalEmail === 'string') {
        paymentMethod.paypalEmail = parsed.paymentMethod.paypalEmail;
      }
      if (Object.keys(paymentMethod).length > 0) {
        result.paymentMethod = paymentMethod as CheckoutFormData['paymentMethod'];
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  } catch (error) {
    console.warn('Failed to parse persisted checkout form state', error);
    return undefined;
  }
};

const parsePersistedFormState = (
  params: URLSearchParams,
  legacyRaw: string | null
): Partial<CheckoutFormData> | undefined => {
  const result: Partial<CheckoutFormData> = {};
  let hasAny = false;

  const readParam = (key: string): string | undefined => {
    const value = params.get(key);
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const email = readParam('email');
  if (email) {
    result.email = email;
    hasAny = true;
  }

  const shippingRaw: Partial<CheckoutFormData['shippingAddress']> = {};
  (Object.entries(SHIPPING_QUERY_KEYS) as Array<[
    keyof CheckoutFormData['shippingAddress'],
    string,
  ]>).forEach(([field, key]) => {
    const value = readParam(key);
    if (value) {
      shippingRaw[field] = value;
    }
  });
  const shippingAddress = parsePersistedAddress(shippingRaw);
  if (shippingAddress) {
    result.shippingAddress = shippingAddress;
    hasAny = true;
  }

  const billingSameRaw = readParam('billingSameAsShipping');
  if (billingSameRaw) {
    const normalized = billingSameRaw.toLowerCase();
    result.billingAddressSameAsShipping = !(
      normalized === 'false' ||
      normalized === '0'
    );
    hasAny = true;
  }

  if (result.billingAddressSameAsShipping === false) {
    const billingRaw: Partial<CheckoutFormData['billingAddress']> = {};
    (Object.entries(BILLING_QUERY_KEYS) as Array<[
      keyof NonNullable<CheckoutFormData['billingAddress']>,
      string,
    ]>).forEach(([field, key]) => {
      const value = readParam(key);
      if (value) {
        billingRaw[field] = value;
      }
    });
    const billingAddress = parsePersistedAddress(billingRaw);
    if (billingAddress) {
      result.billingAddress = billingAddress;
      hasAny = true;
    }
  }

  const shippingMethod = readParam('shippingMethod');
  if (shippingMethod) {
    result.shippingMethod = shippingMethod;
    hasAny = true;
  }

  let paymentMethod: Partial<CheckoutFormData['paymentMethod']> | undefined;
  const paymentType = readParam('paymentType');
  if (paymentType) {
    paymentMethod = {
      type: paymentType as CheckoutFormData['paymentMethod']['type'],
    };
    hasAny = true;
  }

  const paypalEmail = readParam('paypalEmail');
  if (paypalEmail) {
    if (!paymentMethod) {
      paymentMethod = {
        type: 'paypal',
      };
    }
    paymentMethod.paypalEmail = paypalEmail;
    hasAny = true;
  }

  if (paymentMethod) {
    result.paymentMethod = paymentMethod as CheckoutFormData['paymentMethod'];
  }

  const orderNotes = readParam('orderNotes');
  if (orderNotes) {
    result.orderNotes = orderNotes;
    hasAny = true;
  }

  const agreeToTermsRaw = readParam('agreeToTerms');
  if (agreeToTermsRaw) {
    const normalized = agreeToTermsRaw.toLowerCase();
    result.agreeToTerms = !(normalized === 'false' || normalized === '0');
    hasAny = true;
  }

  const agreeToMarketingRaw = readParam('agreeToMarketing');
  if (agreeToMarketingRaw) {
    const normalized = agreeToMarketingRaw.toLowerCase();
    result.agreeToMarketing = !(normalized === 'false' || normalized === '0');
    hasAny = true;
  }

  if (hasAny) {
    return result;
  }

  return parseLegacyPersistedFormState(legacyRaw);
};

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
  currency = 'USD',
  savedAddresses = [],
  countries = [],
  isAuthenticated = false,
  authLoading = false,
  userEmail,
  userName,
  defaultCountryId,
}) => {
  const t = useTranslations('ecommerce.checkout');
  const stepLabels = useMemo<Record<(typeof CHECKOUT_STEP_KEYS)[number], string>>(
    () => ({
      information: t('form.steps.information'),
      shipping: t('form.steps.shipping'),
      payment: t('form.steps.payment'),
    }),
    [t]
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStepParam = searchParams.get('step');
  const rawFormStateParam = searchParams.get('form');
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
  const persistedQueryParamsString = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const extracted = extractPersistedQueryParams(params);
    return serializePersistedQueryParams(extracted);
  }, [searchParamsString]);
  const currentPath = useMemo(
    () => (searchParamsString ? `${pathname}?${searchParamsString}` : pathname),
    [pathname, searchParamsString]
  );
  const initialStep = useMemo(() => {
    const parsed = Number(currentStepParam);
    if (Number.isFinite(parsed)) {
      const truncated = Math.trunc(parsed);
      if (truncated >= 1 && truncated <= 3) {
        return truncated;
      }
    }
    return 1;
  }, [currentStepParam]);

  const lastSyncedStepRef = useRef(initialStep);
  const lastSerializedFormRef = useRef<string | null>(persistedQueryParamsString);

  useEffect(() => {
    lastSerializedFormRef.current = persistedQueryParamsString;
  }, [persistedQueryParamsString]);

  const persistedFormState = useMemo(
    () => parsePersistedFormState(new URLSearchParams(searchParamsString), rawFormStateParam),
    [rawFormStateParam, searchParamsString]
  );

  const updateQueryParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParamsString);
      const before = params.toString();
      mutator(params);
      const after = params.toString();
      if (before === after) {
        return;
      }
      const target = after ? `${pathname}?${after}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router, searchParamsString]
  );

  const updateStepQuery = useCallback(
    (step: number) => {
      const desired = step <= 1 ? null : String(step);
      updateQueryParams((params) => {
        if (desired === null) {
          params.delete('step');
        } else {
          params.set('step', desired);
        }
      });
    },
    [updateQueryParams]
  );

  const handlePersistedFormStateUpdate = useCallback(
    (data: CheckoutFormData) => {
      const persistable = buildPersistableFormState(data);
      const serialized = serializePersistedQueryParams(persistable);

      if (lastSerializedFormRef.current === serialized) {
        return;
      }

      updateQueryParams((params) => {
        params.delete('form');
        PERSISTED_QUERY_PARAM_KEYS.forEach((key) => params.delete(key));

        Object.entries(persistable).forEach(([key, value]) => {
          params.set(key, value);
        });
      });

      lastSerializedFormRef.current = serialized;
    },
    [updateQueryParams]
  );

  const {
    formData,
    errors,
    countryOptions,
    phoneCountryOptions,
    shippingProvinceOptions,
    shippingWardOptions,
    billingAddressValue,
    billingProvinceOptions,
    billingWardOptions,
    shippingRequiredFields,
    billingRequiredFields,
    shippingProvincesQuery,
    shippingWardsQuery,
    billingProvincesQuery,
    billingWardsQuery,
    selectedSavedAddressId,
    handleSavedAddressSelect,
    handleManualShippingChange,
    handleBillingAddressChange,
    handleBillingSameAsShippingChange,
    clearSavedAddressSelection,
    markSavedAddressModified,
    updateFormData,
    handleSubmit,
    activeStep,
    handleNextStep,
    handlePrevStep,
    goToStep,
    deliveryMethods,
    deliveryMethodsQuery,
    adjustedShippingCost,
    discountAmount,
    adjustedTotal,
  } = useCheckoutForm({
    subtotal,
    shippingCost,
    tax,
    total,
    onSubmit,
    savedAddresses,
    countries,
    initialStep,
    onStepChange: updateStepQuery,
    defaultEmail: isAuthenticated && userEmail ? userEmail : undefined,
    initialData: persistedFormState,
    onFormDataChange: handlePersistedFormStateUpdate,
    defaultCountryId,
  });

  const handleLoginRedirect = useCallback(() => {
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }, [router, currentPath]);

  const handleRegisterRedirect = useCallback(() => {
    router.push(`/register?redirect=${encodeURIComponent(currentPath)}`);
  }, [router, currentPath]);

  const isAuthStatePending = requireAccount && authLoading;
  const isCheckoutLocked = !authLoading && requireAccount && !isAuthenticated;
  const shouldShowGuestPrompt = !authLoading && !isAuthenticated && guestCheckoutAllowed;
  const shouldShowLoggedInPrompt = !authLoading && isAuthenticated;
  const safeName = userName?.trim() || userEmail || '';
  const safeEmail = userEmail?.trim() || '';

  useEffect(() => {
    if (lastSyncedStepRef.current === initialStep) {
      return;
    }
    lastSyncedStepRef.current = initialStep;
    if (initialStep !== activeStep) {
      goToStep(initialStep);
    }
  }, [activeStep, goToStep, initialStep]);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${className}`}>
      <div className="lg:col-span-2">
        {isAuthStatePending ? (
          <Card className="p-6">
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" label={t('form.auth.loading')} labelPlacement="right" />
            </div>
          </Card>
        ) : isCheckoutLocked ? (
          <Card className="p-6">
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-2xl font-semibold text-gray-900">{t('form.auth.loginRequired.title')}</h3>
              <p className="text-gray-600">{t('form.auth.loginRequired.description')}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button color="primary" onPress={handleLoginRedirect}>
                  {t('form.auth.actions.login')}
                </Button>
                <Button variant="flat" onPress={handleRegisterRedirect}>
                  {t('form.auth.actions.register')}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="mb-8">
              <div className="flex">
                {CHECKOUT_STEP_KEYS.map((stepKey, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = activeStep > stepNumber;
                  const isReached = activeStep >= stepNumber;

                  return (
                    <div key={stepKey} className="flex-1 min-w-0 flex flex-col items-center">
                      <div className="relative flex w-full items-center justify-center">
                        {index > 0 && (
                          <span
                            className={`absolute left-0 right-1/2 top-1/2 h-1 -translate-y-1/2 rounded-full ${
                              isReached ? 'bg-primary-500' : 'bg-gray-200'
                            }`}
                          />
                        )}
                        {index < CHECKOUT_STEP_KEYS.length - 1 && (
                          <span
                            className={`absolute left-1/2 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full ${
                              isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            isReached ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {stepNumber}
                        </div>
                      </div>
                      <span
                        className={`mt-3 text-center text-sm ${
                          isReached ? 'text-primary-500 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {stepLabels[stepKey]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {activeStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('form.headings.contact')}</h3>

                  {shouldShowLoggedInPrompt && (
                    <div className="rounded-xl border border-success-200 bg-success-50/60 p-4 text-sm text-success-700">
                      <span className="block font-medium text-success-800">
                        {t('form.auth.loggedIn.title', { name: safeName || t('form.auth.loggedIn.fallbackName') })}
                      </span>
                      <span className="mt-1 block text-success-600">
                        {safeEmail
                          ? t('form.auth.loggedIn.subtitle', { email: safeEmail })
                          : t('form.auth.loggedIn.subtitle_no_email')}
                      </span>
                    </div>
                  )}

                  {shouldShowGuestPrompt && (
                    <div className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50/60 p-4 text-sm text-primary-700 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="block font-medium text-primary-800">{t('form.auth.guest.title')}</span>
                        <span className="mt-1 block text-primary-600">{t('form.auth.guest.description')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" color="primary" onPress={handleLoginRedirect}>
                          {t('form.auth.actions.login')}
                        </Button>
                        <Button size="sm" variant="flat" onPress={handleRegisterRedirect}>
                          {t('form.auth.actions.register')}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Input
                    label={t('form.fields.email.label')}
                    placeholder={t('form.fields.email.placeholder')}
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    variant="bordered"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    fullWidth
                  />

                  {savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold mt-6">{t('form.headings.savedAddresses')}</h3>
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
                                {address.phoneNumber && (
                                  <span>{t('form.savedAddresses.phone', { phone: address.phoneNumber })}</span>
                                )}
                                {address.email && (
                                  <span>{t('form.savedAddresses.email', { email: address.email })}</span>
                                )}
                              </div>
                              <div className="flex gap-2 text-xs">
                                {address.isDefault && (
                                  <span className="rounded bg-primary-100 px-2 py-0.5 text-primary-600">
                                    {t('form.savedAddresses.defaultTag')}
                                  </span>
                                )}
                                {address.label && (
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">{address.label}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                        <Button variant="light" size="sm" onPress={clearSavedAddressSelection}>
                          {t('form.buttons.useDifferentAddress')}
                        </Button>
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mt-6">{t('form.headings.shippingAddress')}</h3>

                  <AddressForm
                    address={formData.shippingAddress}
                    onChange={handleManualShippingChange}
                    errors={errors}
                    prefix="shippingAddress"
                    countries={countryOptions}
                    phoneCountryOptions={phoneCountryOptions}
                    provinces={shippingProvinceOptions}
                    wards={shippingWardOptions}
                    requiredFields={shippingRequiredFields as (keyof AddressData)[]}
                    loading={{
                      provinces: shippingProvincesQuery.isLoading,
                      wards: shippingWardsQuery.isLoading,
                    }}
                    onCountryChange={() => markSavedAddressModified()}
                    onProvinceChange={() => markSavedAddressModified()}
                    onWardChange={() => markSavedAddressModified()}
                  />

                  <Checkbox
                    isSelected={formData.billingAddressSameAsShipping}
                    onChange={(e) => handleBillingSameAsShippingChange(e.target.checked)}
                  >
                    {t('form.checkboxes.billingSame')}
                  </Checkbox>

                  {!formData.billingAddressSameAsShipping && (
                    <>
                      <h3 className="text-lg font-semibold mt-6">{t('form.headings.billingAddress')}</h3>

                      <AddressForm
                        address={billingAddressValue}
                        onChange={handleBillingAddressChange}
                        errors={errors}
                        prefix="billingAddress"
                        countries={countryOptions}
                        phoneCountryOptions={phoneCountryOptions}
                        provinces={billingProvinceOptions}
                        wards={billingWardOptions}
                        requiredFields={billingRequiredFields as (keyof AddressData)[]}
                        loading={{
                          provinces: billingProvincesQuery.isLoading,
                          wards: billingWardsQuery.isLoading,
                        }}
                      />
                    </>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button color="primary" onPress={handleNextStep}>
                      {t('actions.continue_to_shipping')}
                    </Button>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('form.headings.shippingMethod')}</h3>

                  <RadioGroup
                    value={formData.shippingMethod}
                    onValueChange={(value) => updateFormData('shippingMethod', value)}
                    isInvalid={!!errors.shippingMethod}
                    errorMessage={errors.shippingMethod}
                  >
                    {deliveryMethodsQuery.isLoading ? (
                      <div className="py-6 flex justify-center">
                        <Spinner size="sm" label={t('form.delivery.loading')} labelPlacement="right" />
                      </div>
                    ) : deliveryMethodsQuery.isError ? (
                      <div className="rounded-lg border border-dashed border-danger-300 bg-danger-50/40 p-4 text-sm text-danger-600">
                        {t('form.delivery.error')}
                      </div>
                    ) : deliveryMethods.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        {t('form.delivery.empty')}
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
                                  {t('form.delivery.estimated', {
                                    time: method.estimatedDeliveryTime,
                                  })}
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
                                <div className="text-xs text-primary-500 mt-1">{t('form.delivery.recommended')}</div>
                              )}
                            </div>
                          </div>
                        </Radio>
                      ))
                    )}
                  </RadioGroup>

                  <h3 className="text-lg font-semibold mt-6">{t('form.headings.orderNotes')}</h3>

                  <Textarea
                    label={t('form.fields.orderNotes.label')}
                    placeholder={t('form.fields.orderNotes.placeholder')}
                    value={formData.orderNotes}
                    onChange={(e) => updateFormData('orderNotes', e.target.value)}
                    variant="bordered"
                    minRows={3}
                    fullWidth
                  />

                  <div className="flex justify-between mt-6">
                    <Button variant="flat" onPress={handlePrevStep}>
                      {t('form.actions.return_to_information')}
                    </Button>
                    <Button color="primary" onPress={handleNextStep}>
                      {t('form.actions.continue_to_payment')}
                    </Button>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('form.headings.paymentMethod')}</h3>

                  <RadioGroup
                    value={formData.paymentMethod.type}
                    onValueChange={(value) => updateFormData('paymentMethod.type', value)}
                  >
                    <Radio value="credit_card">{t('form.paymentMethods.credit_card')}</Radio>
                    <Radio value="paypal">{t('form.paymentMethods.paypal')}</Radio>
                    <Radio value="bank_transfer">{t('form.paymentMethods.bank_transfer')}</Radio>
                    <Radio value="cash_on_delivery">{t('form.paymentMethods.cash_on_delivery')}</Radio>
                    <Radio value="payos">{t('form.paymentMethods.payos')}</Radio>
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
                        label={t('form.fields.paypalEmail.label')}
                        placeholder={t('form.fields.paypalEmail.placeholder')}
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
                    <div>
                      <Checkbox
                        isSelected={formData.agreeToTerms}
                        onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                        isInvalid={!!errors.agreeToTerms}
                      >
                        {t('form.checkboxes.agreeTerms')}
                      </Checkbox>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-xs text-danger-500">{errors.agreeToTerms}</p>
                      )}
                    </div>

                    <Checkbox
                      isSelected={formData.agreeToMarketing}
                      onChange={(e) => updateFormData('agreeToMarketing', e.target.checked)}
                    >
                      {t('form.checkboxes.agreeMarketing')}
                    </Checkbox>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="flat" onPress={handlePrevStep}>
                      {t('form.actions.return_to_shipping')}
                    </Button>
                    <Button type="submit" color="primary" isLoading={loading}>
                      {t('form.actions.place_order')}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>
        )}
      </div>

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
              <h3 className="font-semibold mb-3">{t('form.support.title')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('form.support.description')}</p>
              <Button variant="flat" size="sm" className="w-full">
                {t('form.support.action')}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
