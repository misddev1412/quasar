import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { FormInput } from '../common/FormInput';
import { generateSlug, isValidSlug } from '../../utils/slugUtils';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface SlugFieldProps {
  id?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  sourceText: string; // Text to generate slug from (e.g., title)
  description?: string;
}

export const SlugField: React.FC<SlugFieldProps> = ({
  id,
  label,
  placeholder,
  required,
  error,
  size = 'md',
  disabled,
  value,
  onChange,
  sourceText,
  description,
}) => {
  const { t } = useTranslationWithBackend();
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  // Auto-generate slug from source text when it changes (IMMEDIATELY)
  useEffect(() => {
    if (!sourceText || isManuallyEdited) {
      return;
    }

    // Generate slug immediately without debouncing
    const newSlug = generateSlug(sourceText);
    if (newSlug !== value) {
      onChange(newSlug);
    }
  }, [sourceText, isManuallyEdited, onChange, value]);

  // Handle manual changes
  const handleManualChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setIsManuallyEdited(true);
    onChange(newValue);
  }, [onChange]);

  // Handle regenerate button click
  const handleRegenerate = useCallback(() => {
    if (sourceText) {
      const newSlug = generateSlug(sourceText);
      onChange(newSlug);
      setIsManuallyEdited(false);
    }
  }, [sourceText, onChange]);

  // Generate suffix with auto button when manually edited
  const suffix = isManuallyEdited ? (
    <button
      type="button"
      onClick={handleRegenerate}
      disabled={!sourceText}
      className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
      title={t('form.descriptions.regenerateSlug')}
    >
      <RefreshCw className="w-3 h-3" />
      Auto
    </button>
  ) : null;

  const finalDescription = isManuallyEdited 
    ? t('form.descriptions.slug_manually_edited') || 'Slug manually edited. Click Auto to regenerate from title.'
    : description || t('form.descriptions.slug_auto_generated') || 'Slug auto-generated from title.';

  return (
    <div className="relative">
      <FormInput
        id={id}
        label={label}
        placeholder={placeholder}
        required={required}
        error={error}
        size={size}
        disabled={disabled}
        type="text"
        value={value}
        onChange={handleManualChange}
        rightIcon={suffix}
      />
      {finalDescription && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {finalDescription}
        </p>
      )}
    </div>
  );
};