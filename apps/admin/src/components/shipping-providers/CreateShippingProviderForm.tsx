import React from 'react';
import { FiTruck, FiSettings, FiGlobe, FiKey, FiLock } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { z } from 'zod';

export const createShippingProviderFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code can only contain uppercase letters, numbers, underscores, or hyphens'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  trackingUrl: z
    .string()
    .url('Tracking URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
  apiKey: z
    .string()
    .max(255, 'API key must not exceed 255 characters')
    .optional()
    .nullable(),
  apiSecret: z
    .string()
    .max(255, 'API secret must not exceed 255 characters')
    .optional()
    .nullable(),
});

export type CreateShippingProviderFormData = z.infer<typeof createShippingProviderFormSchema>;

interface CreateShippingProviderFormProps {
  onSubmit: (data: CreateShippingProviderFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  initialValues?: Partial<CreateShippingProviderFormData>;
  submitButtonText?: string;
  mode?: 'create' | 'edit';
}

export const CreateShippingProviderForm: React.FC<CreateShippingProviderFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
  initialValues,
  submitButtonText,
  mode = 'create',
}) => {
  const { t } = useTranslationWithBackend();

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information', 'General Information'),
      icon: <FiTruck className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('shippingProviders.form.basic_information_description'),
          icon: <FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'name',
              label: t('shippingProviders.name'),
              type: 'text',
              placeholder: t('shippingProviders.form.name_placeholder'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 100,
              },
              description: t('shippingProviders.form.name_description'),
            },
            {
              name: 'code',
              label: t('shippingProviders.code'),
              type: 'text',
              placeholder: t('shippingProviders.form.code_placeholder'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 20,
                pattern: /^[A-Z0-9_-]+$/,
              },
              description: t('shippingProviders.form.code_description'),
            },
            {
              name: 'description',
              label: t('shippingProviders.description'),
              type: 'textarea',
              placeholder: t('shippingProviders.form.description_placeholder'),
              required: false,
              validation: {
                maxLength: 500,
              },
              description: t('shippingProviders.form.description_description'),
              rows: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'configuration',
      label: t('form.tabs.configuration'),
      icon: <FiSettings className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.tracking_configuration'),
          description: t('shippingProviders.form.tracking_configuration_description'),
          icon: <FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'trackingUrl',
              label: t('shippingProviders.trackingUrl'),
              type: 'text',
              placeholder: t('shippingProviders.form.trackingUrl_placeholder'),
              required: false,
              validation: {
                pattern: /^https?:\/\/.+/,
              },
              description: t('shippingProviders.form.trackingUrl_description'),
            },
          ],
        },
        {
          title: t('form.sections.api_configuration'),
          description: t('shippingProviders.form.api_configuration_description'),
          icon: <FiKey className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'apiKey',
              label: t('shippingProviders.apiKey'),
              type: 'password-simple',
              placeholder: t('shippingProviders.form.apiKey_placeholder'),
              required: false,
              validation: {
                maxLength: 255,
              },
              description: t('shippingProviders.form.apiKey_description'),
              icon: <FiKey className="w-4 h-4" />,
            },
            {
              name: 'apiSecret',
              label: t('shippingProviders.apiSecret'),
              type: 'password-simple',
              placeholder: t('shippingProviders.form.apiSecret_placeholder'),
              required: false,
              validation: {
                maxLength: 255,
              },
              description: t('shippingProviders.form.apiSecret_description'),
              icon: <FiLock className="w-4 h-4" />,
            },
          ],
        },
        {
          title: t('form.sections.status_settings'),
          description: t('shippingProviders.form.status_settings_description'),
          icon: <FiSettings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'isActive',
              label: t('shippingProviders.isActive'),
              type: 'checkbox',
              required: false,
              description: t('shippingProviders.form.isActive_description'),
            },
          ],
        },
      ],
    },
  ];

  // Default values for the form
  const defaultValues: Partial<CreateShippingProviderFormData> = {
    isActive: true,
    trackingUrl: '',
    description: '',
    apiKey: '',
    apiSecret: '',
  };

  const mergedInitialValues: Partial<CreateShippingProviderFormData> = {
    ...defaultValues,
    ...initialValues,
  };

  return (
    <EntityForm<CreateShippingProviderFormData>
      tabs={tabs}
      initialValues={mergedInitialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={createShippingProviderFormSchema}
      submitButtonText={submitButtonText ?? (mode === 'edit' ? t('common.save', 'Save') : t('shippingProviders.create'))}
      cancelButtonText={t('common.cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};

export default CreateShippingProviderForm;
