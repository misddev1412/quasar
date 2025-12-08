import React, { useState, useCallback, useEffect, useRef } from 'react';
import { parsePhoneNumber, getCountryCallingCode } from 'react-phone-number-input';
import { CountrySelector } from './CountrySelector';
import clsx from 'clsx';
import { useDefaultCountry } from '../../hooks/useDefaultCountry';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface PhoneInputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  defaultCountry?: string;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  icon,
  required = false,
  error,
  rightElement,
  rightIcon,
  className = '',
  size = 'md',
  disabled = false,
  defaultCountry,
}) => {
  const { t } = useTranslationWithBackend();
  const { defaultCountry: settingsDefaultCountry } = useDefaultCountry();
  const effectiveDefaultCountry = (defaultCountry || settingsDefaultCountry || 'VN').toUpperCase();
  const [selectedCountry, setSelectedCountry] = useState<string>(effectiveDefaultCountry);
  const [displayValue, setDisplayValue] = useState<string>('');
  const userChangedCountryRef = useRef(false);

  // Sync local display value from external E.164 value.
  // Do NOT clear user's current input when the external value is not yet parseable
  // (e.g., short/partial numbers while typing). Only update when valid or cleared.
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    try {
      const phoneNumber = parsePhoneNumber(value);
      if (phoneNumber) {
        setDisplayValue(String(phoneNumber.nationalNumber || ''));
      }
      // If not parseable, keep current displayValue (avoid wiping first keystroke)
    } catch {
      // Ignore parse errors and keep current displayValue
    }
  }, [value]);

  // Update selected country if the settings default changes and the user hasn't overridden it
  useEffect(() => {
    if (!userChangedCountryRef.current) {
      setSelectedCountry(effectiveDefaultCountry);
    }
  }, [effectiveDefaultCountry]);

  // Explicit height classes for pixel-perfect consistency across all input types
  const sizeClasses = {
    sm: '!h-10',     // 40px height
    md: '!h-11',     // 44px height
    lg: '!h-12',     // 48px height
  };

  // Handle phone number change with formatting (display national number only)
  const handlePhoneChange = useCallback((input: string | undefined) => {
    // Keep local display value (national number)
    setDisplayValue(input || '');

    // If empty, clear parent value
    if (!input) {
      onChange?.(undefined);
      return;
    }

    try {
      const digits = (input || '').replace(/[^0-9]/g, '');
      if (!digits) {
        onChange?.(undefined);
        return;
      }
      const countryCallingCode = getCountryCallingCode(selectedCountry as any);
      const formattedValue = `+${countryCallingCode}${digits}`;

      const phoneNumber = parsePhoneNumber(formattedValue);
      if (phoneNumber) {
        onChange?.(phoneNumber.format('E.164'));
      } else {
        onChange?.(formattedValue);
      }
    } catch (_error) {
      onChange?.(undefined);
    }
  }, [onChange, selectedCountry]);

  // Handle country change
  const handleCountryChange = useCallback((countryCode: string) => {
    userChangedCountryRef.current = true;
    setSelectedCountry(countryCode);

    // Recompute E.164 from the current national display value
    const digits = (displayValue || '').replace(/[^0-9]/g, '');
    if (!digits) {
      onChange?.(undefined);
      return;
    }
    try {
      const newCountryCallingCode = getCountryCallingCode(countryCode as any);
      const newFormattedNumber = `+${newCountryCallingCode}${digits}`;
      const newPhoneNumber = parsePhoneNumber(newFormattedNumber);
      if (newPhoneNumber) {
        onChange?.(newPhoneNumber.format('E.164'));
      } else {
        onChange?.(newFormattedNumber);
      }
    } catch (_error) {
      // noop
    }
  }, [displayValue, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {rightElement && rightElement}
      </div>

      <div className="relative" style={{ overflow: 'visible', zIndex: 10, isolation: 'isolate' }}>
        <div className={clsx(
          'relative group flex items-center bg-white dark:bg-neutral-900 rounded-lg overflow-visible',
          sizeClasses[size],
          error
            ? 'border border-error focus-within:ring-1 focus-within:ring-error'
            : 'border border-neutral-300 dark:border-neutral-700 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary',
          className
        )}>
          {/* Icon container with fixed width */}
          {icon && (
            <div className="flex-shrink-0 w-12 flex justify-center items-center border-r border-neutral-200 dark:border-neutral-700 group-focus-within:border-primary">
              {icon}
            </div>
          )}

          {/* Country Selector */}
          <div className="flex-shrink-0 relative" style={{ overflow: 'visible', zIndex: 20, isolation: 'isolate' }}>
            <div className="rounded-l-lg" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
              <CountrySelector
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={disabled}
                error={!!error}
                size={size}
                variant="embedded"
                className="!border-0 !shadow-none border-r border-neutral-200 dark:border-neutral-700 group-focus-within:border-primary"
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="flex-1 relative rounded-r-lg overflow-hidden">
            <input
              id={id}
              type="tel"
              value={displayValue}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={placeholder || t('phone.placeholder', 'Enter phone number')}
              disabled={disabled}
              className={clsx(
                'w-full border-0 outline-none focus:ring-0 focus:outline-none focus:shadow-none focus-visible:shadow-none bg-transparent rounded-r-lg',
                // Ensure consistent height and padding with FormInput when there is no rightIcon
                '!py-0 !box-border !text-sm !leading-normal !pl-3',
                rightIcon ? '!pr-10' : '!pr-3',
                sizeClasses[size],
                error ? 'text-error placeholder-red-300 dark:placeholder-red-500' : 'text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400'
              )}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                boxShadow: 'none',
                WebkitBoxShadow: 'none',
              }}
            />

            {rightIcon && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 dark:text-neutral-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default PhoneInputField;
