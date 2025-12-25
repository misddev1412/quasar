import React, { useState, useCallback, useImperativeHandle, useRef } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import clsx from 'clsx';
import { Button } from './Button';
import Tabs from './Tabs';
import { FormSection } from './FormSection';
import { useDefaultCountry } from '../../hooks/useDefaultCountry';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useEntityForm } from '../../hooks/useEntityForm';
import { useFormFieldRenderer } from '../../hooks/useFormFieldRenderer';
import { EntityFormProps, FormActionsAlignment, FormSubmitAction } from '../../types/forms';

const alignmentClassMap: Record<FormActionsAlignment, string> = {
  start: 'justify-start',
  center: 'justify-center',
  middle: 'justify-center',
  end: 'justify-end',
};

interface EntityFormComponentProps<T extends FieldValues = FieldValues> extends EntityFormProps<T> {
  validationSchema?: z.ZodSchema<T>;
  formRef?: React.RefObject<{ getValues: () => T }>;
}

export function EntityForm<T extends FieldValues = FieldValues>({
  tabs,
  initialValues = {} as Partial<T>,
  onSubmit,
  isSubmitting = false,
  customActions,
  submitButtonText = 'Create',
  cancelButtonText = 'Cancel',
  onCancel,
  className,
  showCancelButton = true,
  validationSchema,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  formRef,
  actionsAlignment = 'end',
  mode,
  showSaveAndStay = false,
}: EntityFormComponentProps<T>) {
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  // Use external tab control if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const handleTabChange = externalOnTabChange || setInternalActiveTab;
  const { defaultCountry: settingsDefaultCountry } = useDefaultCountry();
  const { t } = useTranslationWithBackend();
  const [showPasswordFields, setShowPasswordFields] = useState<Record<string, boolean>>({});

  // Track which submit action was clicked
  const submitActionRef = useRef<FormSubmitAction>('save');
  const [lastSubmitAction, setLastSubmitAction] = useState<FormSubmitAction>('save');

  // Determine if we should show save and stay button
  // Always show for edit mode, optionally for create mode based on prop
  const shouldShowSaveAndStay = mode === 'edit' || showSaveAndStay;

  // Create a dynamic schema if none provided
  const defaultSchema = z.object({}) as unknown as z.ZodSchema<T>;
  const schema = validationSchema || defaultSchema;

  const { form, handleSubmit: handleHookSubmit } = useEntityForm<T>({
    initialValues,
    onSubmit,
    validationSchema: validationSchema as any as z.ZodSchema<T>,
    mode: 'onBlur',
    submitActionRef,
  });

  const { control, formState: { errors }, setValue, trigger, getValues } = form;

  // Expose form methods via ref if provided
  useImperativeHandle(formRef, () => ({
    getValues: () => getValues() as T,
    setValue: (name: string, value: any) => {
      setValue(name as any, value, { shouldValidate: false });
    },
  }), [getValues, setValue]);

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
    handleHookSubmit(e);
  };

  const handleSubmitActionSelect = (action: FormSubmitAction) => {
    submitActionRef.current = action;
    setLastSubmitAction(action);
  };

  return (
    <form onSubmit={handleFormSubmit} className={clsx('space-y-4', className)}>
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange} // Handle tab changes with URL persistence
      />

      {/* Form Actions */}
      <div
        className={clsx(
          'flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700',
          alignmentClassMap[actionsAlignment] || alignmentClassMap.end,
        )}
      >
        {customActions ?? (
          <>
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
            {shouldShowSaveAndStay ? (
              <>
                <Button
                  type="submit"
                  variant="secondary"
                  onClick={() => handleSubmitActionSelect('save_and_stay')}
                  isLoading={isSubmitting && lastSubmitAction === 'save_and_stay'}
                  disabled={isSubmitting}
                >
                  {isSubmitting && lastSubmitAction === 'save_and_stay'
                    ? t('common.saving', 'Saving...')
                    : t('common.save_and_stay', 'Save and stay')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => handleSubmitActionSelect('save')}
                  isLoading={isSubmitting && lastSubmitAction === 'save'}
                  disabled={isSubmitting && lastSubmitAction !== 'save'}
                >
                  {isSubmitting && lastSubmitAction === 'save'
                    ? t('common.saving', 'Saving...')
                    : submitButtonText}
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                onClick={() => handleSubmitActionSelect('save')}
              >
                {submitButtonText}
              </Button>
            )}
          </>
        )}
      </div>
    </form>
  );
}

export default EntityForm;
