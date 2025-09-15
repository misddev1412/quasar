import React from 'react';
import { Controller, FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import clsx from 'clsx';
import { FormFieldConfig, FormTabConfig } from '../types/forms';
import { FormInput } from '../components/common/FormInput';
import PasswordStrengthMeter from '../components/user/PasswordStrengthMeter';
import { Eye, EyeOff, CheckCircle2, XCircle, Shield, RefreshCw } from 'lucide-react';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { usePasswordGeneration } from './usePasswordGeneration';
import { PasswordRule, getPasswordRules } from '../utils/password';
import { PhoneInputField } from '../components/common/PhoneInputField';
import { Select } from '../components/common/Select';
import { TextareaInput } from '../components/common/TextareaInput';
import { FormSection } from '../components/common/FormSection';
import { RichTextEditor } from '../components/common/RichTextEditor';
import { RoleMultiSelect } from '../components/common/RoleMultiSelect';
import { TagInput } from '../components/common/TagInput';
import { FileTypeSelector } from '../components/common/FileTypeSelector';
import { MediaUpload } from '../components/common/MediaUpload';
import { ImageGalleryUpload } from '../components/common/ImageGalleryUpload';
import { ProductMediaUpload, MediaType } from '../components/common/ProductMediaUpload';
import { SlugField } from '../components/posts/SlugField';

export function useFormFieldRenderer<T extends FieldValues = FieldValues>(
  form: UseFormReturn<T>,
  showPasswordFields: Record<string, boolean>,
  setShowPasswordFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  defaultCountry?: string,
) {
  const { control, formState: { errors }, setValue, trigger, watch } = form;
  const { t } = useTranslationWithBackend();
  const rules: PasswordRule[] = getPasswordRules(t);
  const { generateAndApply } = usePasswordGeneration<T>(setValue, trigger);

  const renderField = (field: FormFieldConfig, tabIndex: number) => {
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
      case 'tel':
      case 'number':
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
                autoComplete={field.type === 'email' ? 'email' : undefined}
                min={field.min}
                max={field.max}
                step={field.step}
              />
            )}
          />
        );

      case 'password':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => {
              const value = (formField.value as string) || '';
              const isVisible = !!showPasswordFields[field.name];
              const inputElRef = React.useRef<HTMLInputElement | null>(null);
              const toggleVisibility = () => {
                setShowPasswordFields(prev => {
                  const next = { ...prev, [field.name]: !prev[field.name] } as Record<string, boolean>;
                  try { console.debug('Password visibility toggled', { field: field.name, nextVisible: next[field.name] }); } catch {}
                  return next;
                });
                requestAnimationFrame(() => inputElRef.current?.focus());
              };

              const rightIcon = (
                <div className="flex items-center gap-2">
                  {field.name !== 'confirmPassword' && (
                    <button
                      type="button"
                      onClick={() => generateAndApply(fieldName)}
                      className="p-0.5 rounded text-neutral-500 hover:text-white dark:text-neutral-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      title={t('user.generate_password')}
                      aria-label={t('user.generate_password')}
                    >
                      <RefreshCw size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="p-0.5 rounded text-neutral-500 hover:text-white dark:text-neutral-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    title={isVisible ? t('common.hide') : t('common.show')}
                    aria-pressed={isVisible}
                    aria-label={isVisible ? t('common.hide') : t('common.show')}
                  >
                    {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              );

              return (
                <div className="space-y-3">
                  <FormInput
                    key={`pw-${isVisible ? 'text' : 'password'}`}
                    {...commonProps}
                    inputRef={inputElRef}
                    type={isVisible ? 'text' : 'password'}
                    value={value}
                    onChange={formField.onChange}
                    icon={field.icon}
                    rightIcon={rightIcon}
                    autoComplete="new-password"
                  />
                  <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700 p-3">
                    <PasswordStrengthMeter password={value} />
                  </div>
                  <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-700 p-3">
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                      <div className="font-medium flex items-center gap-2">
                        <Shield size={14} /> {t('user.password_requirements', 'Password requirements')}
                      </div>
                      <div role="list" className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 m-0 p-0">
                        {rules.map(rule => (
                          <div role="listitem" key={rule.id} className={rule.regex.test(value) ? 'text-emerald-600 dark:text-emerald-500' : 'text-neutral-600 dark:text-neutral-400'}>
                            <span className="inline-flex items-center gap-2">
                              {rule.regex.test(value) ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                              <span className="text-[13px] md:text-sm">{rule.text}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        );

      case 'password-simple':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => {
              const value = (formField.value as string) || '';
              const isVisible = !!showPasswordFields[field.name];
              
              const toggleVisibility = () => {
                setShowPasswordFields(prev => ({
                  ...prev,
                  [field.name]: !prev[field.name]
                }));
              };

              const rightIcon = (
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              );

              return (
                <FormInput
                  {...commonProps}
                  type={isVisible ? 'text' : 'password'}
                  value={value}
                  onChange={formField.onChange}
                  onBlur={formField.onBlur}
                  name={formField.name}
                  icon={field.icon}
                  rightIcon={rightIcon}
                  autoComplete="new-password"
                />
              );
            }}
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
                defaultCountry={field.defaultCountry || (defaultCountry as any) || 'VN'}
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
                rows={(field as any).rows || 4}
              />
            )}
          />
        );

      case 'richtext':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <div className="space-y-2">
                {field.label && (
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                <RichTextEditor
                  value={formField.value || ''}
                  onChange={formField.onChange}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  minHeight={(field as any).minHeight || '300px'}
                />
                {field.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>
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
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="relative inline-flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-9 h-5 bg-primary-600 cursor-pointer" 
                       style={{ backgroundColor: formField.value ? '#2563eb' : '#d1d5db' }}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formField.value || false}
                      onClick={() => formField.onChange(!formField.value)}
                      disabled={field.disabled}
                      id={commonProps.id}
                      className="w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">{field.label}</span>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out w-3.5 h-3.5 top-[2px] left-[2px]"
                        style={{
                          transform: formField.value ? 'translate(18px, 0)' : 'translate(2px, 0)'
                        }}
                      />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label htmlFor={commonProps.id} className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {field.description}
                      </p>
                    )}
                  </div>
                </div>
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>
            )}
          />
        );

      case 'role-multiselect':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <RoleMultiSelect
                value={formField.value || []}
                onChange={formField.onChange}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                description={field.description}
                error={error}
              />
            )}
          />
        );

      case 'custom':
        return (
          <div key={field.name} className="w-full space-y-2">
            {field.label && (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {field.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {field.description}
              </p>
            )}
            <div className="w-full">
              {field.component}
            </div>
          </div>
        );

      case 'tags':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <div className="space-y-2">
                {field.label && (
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                <TagInput
                  value={
                    typeof formField.value === 'string' 
                      ? formField.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      : formField.value || []
                  }
                  onChange={(tags) => {
                    // Convert tags array back to comma-separated string for compatibility
                    formField.onChange(tags.join(', '));
                  }}
                  placeholder={field.placeholder || 'Add tags...'}
                  disabled={field.disabled}
                />
                {field.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>
            )}
          />
        );

      case 'file-types':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <FileTypeSelector
                value={formField.value || []}
                onChange={formField.onChange}
                label={field.label}
                placeholder={field.placeholder || 'Select allowed file types...'}
                required={field.required}
                disabled={field.disabled}
                description={field.description}
                error={error}
              />
            )}
          />
        );

      case 'media-upload':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <MediaUpload
                value={formField.value || (field.multiple ? [] : '')}
                onChange={formField.onChange}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                description={field.description}
                error={error}
                accept={field.accept || 'image/*,video/*'}
                maxSize={field.maxSize || 10}
                multiple={field.multiple || false}
              />
            )}
          />
        );

      case 'image-gallery':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <ImageGalleryUpload
                value={Array.isArray(formField.value) ? formField.value : []}
                onChange={formField.onChange}
                label={field.label}
                description={field.description}
                required={field.required}
                disabled={field.disabled}
                error={error}
                maxImages={field.maxImages || 10}
                maxSize={field.maxSize || 10}
              />
            )}
          />
        );

      case 'product-media':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => (
              <ProductMediaUpload
                value={Array.isArray(formField.value) ? formField.value : []}
                onChange={formField.onChange}
                label={field.label}
                description={field.description}
                required={field.required}
                disabled={field.disabled}
                error={error}
                maxItems={field.maxItems || 10}
                maxSize={field.maxSize || 100}
                allowedTypes={field.allowedTypes || [MediaType.IMAGE, MediaType.VIDEO]}
              />
            )}
          />
        );

      case 'slug':
        return (
          <Controller
            key={field.name}
            name={fieldName}
            control={control}
            render={({ field: formField }) => {
              const sourceFieldValue = field.sourceField ? watch(field.sourceField as FieldPath<T>) : '';
              return (
                <SlugField
                  {...commonProps}
                  value={formField.value || ''}
                  onChange={formField.onChange}
                  sourceText={sourceFieldValue || ''}
                  description={field.description}
                />
              );
            }}
          />
        );

      default:
        return null;
    }
  };

  const renderTabContent = (tab: FormTabConfig, tabIndex: number) => (
    <div className="space-y-8">
      {tab.sections.map((section, sectionIndex) => (
        <div key={`${tabIndex}-${sectionIndex}`}>
          <div className="flex items-center gap-4 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="pr-3 border-r border-neutral-200 dark:border-neutral-700">
              {section.icon}
            </div>
            <div>
              <h3 className="font-medium">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{section.description}</p>
              )}
            </div>
          </div>
          {section.customContent ? (
            <div className="w-full">
              {section.customContent}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map((field) => {
                // Handle conditional field rendering
                if (field.dependsOn) {
                  const dependentFieldValue = watch(field.dependsOn.field as FieldPath<T>);
                  if (dependentFieldValue !== field.dependsOn.value) {
                    return null;
                  }
                }
                
                return (
                  <div key={field.name} className={clsx((field.type === 'textarea' || field.type === 'richtext' || field.type === 'role-multiselect' || field.type === 'custom' || field.type === 'file-types' || field.type === 'media-upload' || field.type === 'image-gallery' || field.type === 'product-media') && 'md:col-span-2')}>
                    {renderField(field, tabIndex)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return { renderField, renderTabContent };
}

