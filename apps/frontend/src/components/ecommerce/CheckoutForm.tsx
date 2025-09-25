import React, { useState } from 'react';
import { Button, Card, Divider, Input, Textarea, Checkbox, RadioGroup, Radio } from '@heroui/react';
import AddressForm from './AddressForm';
import PaymentMethodForm from './PaymentMethodForm';
import OrderSummary from './OrderSummary';

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
  cartItems: any[];
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
      country: 'US',
      phone: '',
    },
    billingAddressSameAsShipping: true,
    shippingMethod: 'standard',
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

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
    { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1 business day' },
  ];

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

  const updateFormData = (path: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Clear error for this field if it exists
    if (errors[path]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };

  const selectedShipping = shippingOptions.find((option) => option.id === formData.shippingMethod);
  const adjustedShippingCost = selectedShipping ? selectedShipping.price : shippingCost;
  const adjustedTotal = subtotal + adjustedShippingCost + tax;

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

                <h3 className="text-lg font-semibold mt-6">Shipping Address</h3>

                <AddressForm
                  address={formData.shippingAddress}
                  onChange={(address) => updateFormData('shippingAddress', address)}
                  errors={errors}
                  prefix="shippingAddress"
                />

                <Checkbox
                  isSelected={formData.billingAddressSameAsShipping}
                  onChange={(e) => updateFormData('billingAddressSameAsShipping', e.target.checked)}
                >
                  Billing address is the same as shipping address
                </Checkbox>

                {!formData.billingAddressSameAsShipping && (
                  <>
                    <h3 className="text-lg font-semibold mt-6">Billing Address</h3>

                    <AddressForm
                      address={formData.billingAddress || formData.shippingAddress}
                      onChange={(address) => updateFormData('billingAddress', address)}
                      errors={errors}
                      prefix="billingAddress"
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
                  {shippingOptions.map((option) => (
                    <Radio key={option.id} value={option.id}>
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-gray-500">{option.days}</div>
                        </div>
                        <div className="font-medium">${option.price.toFixed(2)}</div>
                      </div>
                    </Radio>
                  ))}
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
