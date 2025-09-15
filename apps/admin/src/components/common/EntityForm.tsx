import React, { useState, useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import clsx from 'clsx';
import { Button } from './Button';
import Tabs from './Tabs';
import { FormSection } from './FormSection';
import { EntityFormProps, FormTabConfig } from '../../types/forms';
import { useDefaultCountry } from '../../hooks/useDefaultCountry';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useFormFieldRenderer } from '../../hooks/useFormFieldRenderer';

interface EntityFormComponentProps<T extends FieldValues = FieldValues> extends EntityFormProps<T> {
  validationSchema?: z.ZodSchema<T>;
}

export function EntityForm<T extends FieldValues = FieldValues>({
  tabs,
  initialValues = {} as Partial<T>,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Create',
  cancelButtonText = 'Cancel',
  onCancel,
  className,
  showCancelButton = true,
  validationSchema,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
}: EntityFormComponentProps<T>) {
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  
  // Use external tab control if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const handleTabChange = externalOnTabChange || setInternalActiveTab;
  const { defaultCountry: settingsDefaultCountry } = useDefaultCountry();
  const { t } = useTranslationWithBackend();
  const [showPasswordFields, setShowPasswordFields] = useState<Record<string, boolean>>({});

  // Create a dynamic schema if none provided
  const defaultSchema = z.object({}) as unknown as z.ZodSchema<T>;
  const schema = validationSchema || defaultSchema;

  const { form, handleSubmit: handleHookSubmit } = useEntityForm<T>({
    initialValues,
    onSubmit,
    validationSchema: validationSchema as any as z.ZodSchema<T>,
    mode: 'onBlur',
  });

  const { control, formState: { errors }, setValue, trigger } = form;

  const { renderField, renderTabContent } = useFormFieldRenderer<T>(
    form,
    showPasswordFields,
    setShowPasswordFields,
    settingsDefaultCountry || 'VN',
  );

  const tabsConfig = tabs.map((tab, index) => ({
    label: tab.label,
    icon: tab.icon,
    content: renderTabContent(tab, index),
  }));

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('🎯 [EntityForm] Form submit event triggered');
    console.log('🎯 [EntityForm] Form state:', {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      isDirty: form.formState.isDirty,
    });
    handleHookSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className={clsx('space-y-4', className)}>
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange} // Handle tab changes with URL persistence
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {showCancelButton && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          onClick={(e) => {
            console.log('🔥 [EntityForm] Submit button clicked!');
            console.log('🔥 [EntityForm] Event:', e);
            // Don't prevent default - let form handle it
          }}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}

export default EntityForm;
