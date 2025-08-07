import React, { useState, useCallback } from 'react';
import { useForm, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { Button } from './Button';
import { FormInput } from './FormInput';
import { Select } from './Select';
import { TextareaInput } from './TextareaInput';
import { PhoneInputField } from './PhoneInputField';
import Tabs from './Tabs';
import { FormSection } from './FormSection';
import { EntityFormProps, FormFieldConfig, FormTabConfig } from '../../types/forms';

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
}: EntityFormComponentProps<T>) {
  const [activeTab, setActiveTab] = useState(0);

  // Create a dynamic schema if none provided
  const defaultSchema = z.object({}) as unknown as z.ZodSchema<T>;
  const schema = validationSchema || defaultSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<T>({
    resolver: validationSchema ? zodResolver(validationSchema as any) : undefined,
    defaultValues: initialValues as any,
    mode: 'onBlur',
  });

  const renderField = useCallback((field: FormFieldConfig, tabIndex: number) => {
    const fieldName = field.name as FieldPath<T>;
    const error = errors[fieldName]?.message as string;

    const commonProps = {
      id: `${tabIndex}-${field.name}`,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      error,
      size: field.size || 'md',
      disabled: field.disabled,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <FormInput
                {...commonProps}
                type={field.type}
                value={formField.value || ''}
                onChange={formField.onChange}
                icon={field.icon}
                autoComplete={field.type === 'email' ? 'email' : field.type === 'password' ? 'current-password' : undefined}
              />
            )}
          />
        );

      case 'phone':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <PhoneInputField
                {...commonProps}
                value={formField.value || ''}
                onChange={formField.onChange}
                icon={field.icon}
                defaultCountry={field.defaultCountry || 'US'}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <Select
                {...commonProps}
                value={formField.value || ''}
                onChange={formField.onChange}
                options={field.options || []}
                placeholder={field.placeholder || 'Select an option...'}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <TextareaInput
                {...commonProps}
                value={formField.value || ''}
                onChange={formField.onChange}
                rows={field.rows || 4}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <input
                  id={commonProps.id}
                  type="checkbox"
                  checked={formField.value || false}
                  onChange={(e) => formField.onChange(e.target.checked)}
                  disabled={field.disabled}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={commonProps.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            )}
          />
        );

      default:
        return null;
    }
  }, [control, errors]);

  const renderTabContent = useCallback((tab: FormTabConfig, tabIndex: number) => (
    <div className="space-y-6">
      {tab.sections.map((section, sectionIndex) => (
        <FormSection
          key={`${tabIndex}-${sectionIndex}`}
          title={section.title}
          description={section.description}
          icon={section.icon}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={clsx(
                  field.type === 'textarea' && 'md:col-span-2'
                )}
              >
                {renderField(field, tabIndex)}
              </div>
            ))}
          </div>
        </FormSection>
      ))}
    </div>
  ), [renderField]);

  const tabsConfig = tabs.map((tab, index) => ({
    label: tab.label,
    icon: tab.icon,
    content: renderTabContent(tab, index),
  }));

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data as T);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <form onSubmit={handleFormSubmit} className={clsx('space-y-4', className)}>
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}

export default EntityForm;
