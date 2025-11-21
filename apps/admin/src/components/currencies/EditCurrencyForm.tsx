import React from 'react';
import { FiDollarSign, FiSettings, FiPercent } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { UpdateCurrencyFormData, updateCurrencySchema } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Currency } from '../../types/currency';

interface EditCurrencyFormProps {
  currency: Currency;
  onSubmit: (data: UpdateCurrencyFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const EditCurrencyForm: React.FC<EditCurrencyFormProps> = ({
  currency,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslationWithBackend();

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information'),
      icon: <FiDollarSign className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information'),
          description: t('currencies.form.basic_information_description'),
          icon: <FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'code',
              label: t('currencies.code'),
              type: 'text',
              placeholder: t('currencies.form.code_placeholder'),
              required: true,
              validation: {
                minLength: 3,
                maxLength: 3,
                pattern: /^[A-Z]{3}$/,
              },
              description: t('currencies.form.code_description'),
            },
            {
              name: 'name',
              label: t('currencies.name'),
              type: 'text',
              placeholder: t('currencies.form.name_placeholder'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 100,
              },
            },
            {
              name: 'symbol',
              label: t('currencies.symbol'),
              type: 'text',
              placeholder: t('currencies.form.symbol_placeholder'),
              required: true,
              validation: {
                minLength: 1,
                maxLength: 10,
              },
              description: t('currencies.form.symbol_description'),
            },
            {
              name: 'exchangeRate',
              label: t('currencies.exchangeRate'),
              type: 'number',
              placeholder: t('currencies.form.exchangeRate_placeholder'),
              required: false,
              min: 0.00000001,
              max: 9999999999,
              step: 0.00000001,
              description: t('currencies.form.exchangeRate_description'),
            },
          ],
        },
      ],
    },
    {
      id: 'settings',
      label: t('form.tabs.settings'),
      icon: <FiSettings className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.display_settings'),
          description: t('currencies.form.display_settings_description'),
          icon: <FiSettings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'decimalPlaces',
              label: t('currencies.decimalPlaces'),
              type: 'number',
              placeholder: t('currencies.form.decimalPlaces_placeholder'),
              required: false,
              min: 0,
              max: 4,
              step: 1,
              description: t('currencies.form.decimalPlaces_description'),
            },
            {
              name: 'format',
              label: t('currencies.format'),
              type: 'select',
              placeholder: t('currencies.form.format_placeholder'),
              required: false,
              options: [
                { value: '{symbol}{amount}', label: '$100.00' },
                { value: '{amount}{symbol}', label: '100.00$' },
                { value: '{symbol} {amount}', label: '$ 100.00' },
                { value: '{amount} {symbol}', label: '100.00 $' },
              ],
              description: t('currencies.form.format_description'),
            },
          ],
        },
        {
          title: t('form.sections.status_settings'),
          description: t('currencies.form.status_settings_description'),
          icon: <FiSettings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'isActive',
              label: t('currencies.isActive'),
              type: 'checkbox',
              required: false,
              description: t('currencies.form.isActive_description'),
            },
            {
              name: 'isDefault',
              label: t('currencies.isDefault'),
              type: 'checkbox',
              required: false,
              description: t('currencies.form.isDefault_description'),
            },
          ],
        },
      ],
    },
  ];

  // Initial values for the form from the currency data
  const defaultValues: UpdateCurrencyFormData = {
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    exchangeRate: currency.exchangeRate,
    decimalPlaces: currency.decimalPlaces,
    format: currency.format,
    isActive: currency.isActive,
    isDefault: currency.isDefault,
  };

  return (
    <EntityForm<UpdateCurrencyFormData>
      tabs={tabs}
      initialValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={updateCurrencySchema}
      submitButtonText={t('common.update')}
      cancelButtonText={t('common.cancel')}
      showCancelButton={true}
    />
  );
};

export default EditCurrencyForm;