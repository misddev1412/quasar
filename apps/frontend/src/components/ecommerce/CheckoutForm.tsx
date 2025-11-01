'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Card, Input, Textarea, Checkbox, RadioGroup, Radio, Spinner } from '@heroui/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  requireAccount: _requireAccount = false,
  guestCheckoutAllowed: _guestCheckoutAllowed = true,
  currency = '$',
  savedAddresses = [],
  countries = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStepParam = searchParams.get('step');
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
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

  const updateStepQuery = useCallback(
    (step: number) => {
      const desired = step <= 1 ? null : String(step);
      const current = currentStepParam ?? null;
      if (current === desired) {
        return;
      }

      const params = new URLSearchParams(searchParamsString);
      if (desired === null) {
        params.delete('step');
      } else {
        params.set('step', desired);
      }

      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target, { scroll: false });
    },
    [currentStepParam, pathname, router, searchParamsString]
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
  });

  void _requireAccount;
  void _guestCheckoutAllowed;

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
        <Card className="p-6">
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
                      className={`w-16 h-1 mx-4 ${activeStep > step ? 'bg-primary-500' : 'bg-gray-200'}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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
                      <Button variant="light" size="sm" onPress={clearSavedAddressSelection}>
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
                    Continue to Shipping
                  </Button>
                </div>
              </div>
            )}

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
                  <div>
                    <Checkbox
                      isSelected={formData.agreeToTerms}
                      onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                      isInvalid={!!errors.agreeToTerms}
                    >
                      I agree to the Terms and Conditions and Privacy Policy
                    </Checkbox>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-xs text-danger-500">{errors.agreeToTerms}</p>
                    )}
                  </div>

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
