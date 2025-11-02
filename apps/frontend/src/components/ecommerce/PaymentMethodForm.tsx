import React, { useState } from 'react';
import { Input } from '@heroui/react';
import { useTranslations } from 'next-intl';

export interface PaymentMethodData {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  paypalEmail?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankRoutingNumber?: string;
}

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethodData;
  onChange: (paymentMethod: PaymentMethodData) => void;
  errors?: Record<string, string>;
  prefix?: string;
  className?: string;
  showSavedCards?: boolean;
  savedCards?: Array<{
    id: string;
    lastFourDigits: string;
    expiryDate: string;
    cardType: string;
  }>;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onChange,
  errors = {},
  prefix = '',
  className = '',
  showSavedCards = false,
  savedCards = [],
}) => {
  const t = useTranslations('ecommerce.checkout.form.payment');
  const [useSavedCard, setUseSavedCard] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState(paymentMethod.cardNumber || '');
  const [expiryDate, setExpiryDate] = useState(paymentMethod.expiryDate || '');
  const [cvv, setCvv] = useState(paymentMethod.cvv || '');
  const [cardholderName, setCardholderName] = useState(paymentMethod.cardholderName || '');

  const getFieldError = (field: keyof PaymentMethodData) => {
    return errors[`${prefix}.${field}`] || '';
  };

  const updateField = (field: keyof PaymentMethodData, value: string) => {
    onChange({
      ...paymentMethod,
      [field]: value,
    });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = '';

    // Add space every 4 digits
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }

    // Limit to 19 characters (16 digits + 3 spaces)
    formattedValue = formattedValue.substring(0, 19);

    setCardNumber(formattedValue);
    updateField('cardNumber', formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    // Add slash after 2 digits
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    // Limit to 5 characters (MM/YY)
    value = value.substring(0, 5);

    setExpiryDate(value);
    updateField('expiryDate', value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    // Limit to 3 or 4 digits
    value = value.substring(0, 4);

    setCvv(value);
    updateField('cvv', value);
  };

  const handleCardholderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardholderName(e.target.value);
    updateField('cardholderName', e.target.value);
  };

  const handleSavedCardSelect = (cardId: string) => {
    setUseSavedCard(cardId);
    // If selecting a saved card, clear the new card form
    if (cardId) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
    }
  };

  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (cleanNumber.startsWith('4')) {
      return 'visa';
    } else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) {
      return 'mastercard';
    } else if (cleanNumber.startsWith('3')) {
      return 'amex';
    } else if (cleanNumber.startsWith('6')) {
      return 'discover';
    }

    return '';
  };

  const cardType = detectCardType(cardNumber);
  const cardTypeIcon =
    cardType === 'visa'
      ? '💳'
      : cardType === 'mastercard'
      ? '💳'
      : cardType === 'amex'
      ? '💳'
      : cardType === 'discover'
      ? '💳'
      : '💳';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Saved Cards */}
      {showSavedCards && savedCards.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">{t('savedCards.title')}</h4>
          <div className="space-y-2">
            <div
              className={`flex items-center p-3 border rounded-md cursor-pointer ${
                useSavedCard === null ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
              onClick={() => handleSavedCardSelect('')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mr-3">
                <span className="text-lg">+</span>
              </div>
              <div>
                <div className="font-medium">{t('savedCards.useNew')}</div>
              </div>
            </div>

            {savedCards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center p-3 border rounded-md cursor-pointer ${
                  useSavedCard === card.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
                onClick={() => handleSavedCardSelect(card.id)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mr-3">
                  <span className="text-lg">💳</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {t('savedCards.endingIn', {
                      type: card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1),
                      lastFour: card.lastFourDigits,
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('savedCards.expires', { date: card.expiryDate })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Card Form - Only show if not using a saved card */}
      {useSavedCard === null && (
        <>
          <div className="relative">
            <Input
              label={t('labels.cardNumber')}
              placeholder={t('placeholders.cardNumber')}
              value={cardNumber}
              onChange={handleCardNumberChange}
              variant="bordered"
              isInvalid={!!getFieldError('cardNumber')}
              errorMessage={getFieldError('cardNumber')}
              startContent={<span className="text-lg mr-2">{cardTypeIcon}</span>}
              fullWidth
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('labels.expiryDate')}
              placeholder={t('placeholders.expiryDate')}
              value={expiryDate}
              onChange={handleExpiryDateChange}
              variant="bordered"
              isInvalid={!!getFieldError('expiryDate')}
              errorMessage={getFieldError('expiryDate')}
              fullWidth
            />

            <Input
              label={t('labels.cvv')}
              placeholder={t('placeholders.cvv')}
              value={cvv}
              onChange={handleCvvChange}
              variant="bordered"
              isInvalid={!!getFieldError('cvv')}
              errorMessage={getFieldError('cvv')}
              fullWidth
            />
          </div>

          <Input
            label={t('labels.cardholderName')}
            placeholder={t('placeholders.cardholderName')}
            value={cardholderName}
            onChange={handleCardholderNameChange}
            variant="bordered"
            isInvalid={!!getFieldError('cardholderName')}
            errorMessage={getFieldError('cardholderName')}
            fullWidth
          />
        </>
      )}

      {/* Security Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-start">
          <span className="text-blue-500 mr-2 mt-0.5">🔒</span>
          <div className="text-sm text-blue-700">
            {t('security.note')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
