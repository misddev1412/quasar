import React from 'react';
import { FiFileText, FiSettings, FiGlobe } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Translation, UpdateTranslationData } from '../../types/translation';
import { z } from 'zod';

interface EditTranslationFormProps {
  translation: Translation;
  onSubmit: (data: UpdateTranslationData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const updateTranslationSchema: z.ZodType<UpdateTranslationData> = z.object({
  key: z.string().min(1, 'Key is required').max(255).optional(),
  locale: z.string().length(5, 'Locale must be exactly 5 characters (e.g., vi_VN, en_US)').optional(),
  value: z.string().min(1, 'Value is required').optional(),
  namespace: z.string().max(100).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
}) as z.ZodType<UpdateTranslationData>;

export const EditTranslationForm: React.FC<EditTranslationFormProps> = ({
  translation,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslationWithBackend();

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information', 'General Information'),
      icon: <FiFileText className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('translations.form.basic_information_description'),
          icon: <FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'key',
              label: t('translations.key'),
              type: 'text',
              placeholder: t('translations.form.key_placeholder'),
              required: true,
              validation: {
                minLength: 1,
                maxLength: 255,
              },
              description: t('translations.form.key_description'),
            },
            {
              name: 'locale',
              label: t('translations.locale'),
              type: 'text',
              placeholder: t('translations.form.locale_placeholder'),
              required: true,
              validation: {
                minLength: 5,
                maxLength: 5,
                pattern: /^[a-z]{2}_[A-Z]{2}$/,
              },
              description: t('translations.form.locale_description'),
              icon: <FiGlobe className="w-4 h-4" />,
            },
            {
              name: 'value',
              label: t('translations.value'),
              type: 'textarea',
              placeholder: t('translations.form.value_placeholder'),
              required: true,
              rows: 4,
              description: t('translations.form.value_description'),
            },
            {
              name: 'namespace',
              label: t('translations.namespace'),
              type: 'text',
              placeholder: t('translations.form.namespace_placeholder'),
              required: false,
              validation: {
                maxLength: 100,
              },
              description: t('translations.form.namespace_description'),
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
          title: t('form.sections.status_settings'),
          description: t('translations.form.status_settings_description'),
          icon: <FiSettings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'isActive',
              label: t('translations.isActive'),
              type: 'checkbox',
              required: false,
              description: t('translations.form.isActive_description'),
            },
          ],
        },
      ],
    },
  ];

  const initialValues: Partial<UpdateTranslationData> = {
    key: translation.key,
    locale: translation.locale,
    value: translation.value,
    namespace: translation.namespace || '',
    isActive: translation.isActive,
  };

  return (
    <EntityForm<UpdateTranslationData>
      tabs={tabs}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={updateTranslationSchema}
      submitButtonText={t('translations.update')}
      cancelButtonText={t('common.cancel')}
      showCancelButton={true}
    />
  );
};
