import React from 'react';
import { FiGlobe, FiSettings, FiHash } from 'react-icons/fi';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { CreateLanguageFormData, createLanguageSchema } from '../../utils/validation';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface CreateLanguageFormProps {
  onSubmit: (data: CreateLanguageFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateLanguageForm: React.FC<CreateLanguageFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslationWithBackend();

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information', 'General Information'),
      icon: <FiGlobe className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('languages.form.basic_information_description'),
          icon: <FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'code',
              label: t('languages.code'),
              type: 'text',
              placeholder: t('languages.form.code_placeholder'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 10,
                pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
              },
              description: t('languages.form.code_description'),
            },
            {
              name: 'name',
              label: t('languages.name'),
              type: 'text',
              placeholder: t('languages.form.name_placeholder'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 100,
              },
            },
            {
              name: 'nativeName',
              label: t('languages.nativeName'),
              type: 'text',
              placeholder: t('languages.form.nativeName_placeholder'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 100,
              },
              description: t('languages.form.nativeName_description'),
            },
            {
              name: 'icon',
              label: t('languages.icon'),
              type: 'text',
              placeholder: t('languages.form.icon_placeholder'),
              required: false,
              validation: {
                maxLength: 10,
              },
              description: t('languages.form.icon_description'),
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
          description: t('languages.form.status_settings_description'),
          icon: <FiSettings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'isActive',
              label: t('languages.isActive'),
              type: 'checkbox',
              required: false,
              description: t('languages.form.isActive_description'),
            },
            {
              name: 'isDefault',
              label: t('languages.isDefault'),
              type: 'checkbox',
              required: false,
              description: t('languages.form.isDefault_description'),
            },
            {
              name: 'sortOrder',
              label: t('languages.sortOrder'),
              type: 'text',
              placeholder: t('languages.form.sortOrder_placeholder'),
              required: false,
              validation: {
                pattern: /^\d+$/,
                custom: (value: any) => {
                  const num = parseInt(value);
                  if (isNaN(num)) return 'Must be a number';
                  if (num < 0 || num > 9999) return 'Must be between 0 and 9999';
                  return undefined;
                },
              },
              icon: <FiHash className="w-4 h-4" />,
              description: t('languages.form.sortOrder_description'),
            },
          ],
        },
      ],
    },
  ];

  // Default values for the form
  const defaultValues: Partial<CreateLanguageFormData> = {
    isActive: true,
    isDefault: false,
    sortOrder: 100,
  };

  return (
    <EntityForm<CreateLanguageFormData>
      tabs={tabs}
      initialValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={createLanguageSchema}
      submitButtonText={t('languages.create')}
      cancelButtonText={t('common.cancel')}
      showCancelButton={true}
    />
  );
};

export default CreateLanguageForm;
