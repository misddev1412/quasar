import React, { useState, useCallback } from 'react';
import { parsePhoneNumber, formatPhoneNumber, getCountryCallingCode } from 'react-phone-number-input';
import { CountrySelector } from './CountrySelector';
import clsx from 'clsx';

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
  defaultCountry = 'US',
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);

  // Explicit height classes for pixel-perfect consistency across all input types
  const sizeClasses = {
    sm: '!h-10',     // 40px height
    md: '!h-11',     // 44px height
    lg: '!h-12',     // 48px height
  };

  // Handle phone number change with formatting
  const handlePhoneChange = useCallback((phoneValue: string | undefined) => {
    if (!phoneValue) {
      onChange?.(phoneValue);
      return;
    }

    try {
      // Try to format the phone number for the selected country
      const countryCallingCode = getCountryCallingCode(selectedCountry as any);
      let formattedValue = phoneValue;

      // If the input doesn't start with +, add the country code
      if (!phoneValue.startsWith('+')) {
        formattedValue = `+${countryCallingCode}${phoneValue}`;
      }

      // Parse and format the phone number
      const phoneNumber = parsePhoneNumber(formattedValue);
      if (phoneNumber) {
        onChange?.(phoneNumber.format('E.164'));
      } else {
        onChange?.(formattedValue);
      }
    } catch (error) {
      // If parsing fails, just pass through the value
      onChange?.(phoneValue);
    }
  }, [onChange, selectedCountry]);

  // Handle country change
  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);

    // If there's an existing phone number, try to reformat it for the new country
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber) {
          // Reformat the number with the new country context
          const newCountryCallingCode = getCountryCallingCode(countryCode as any);
          const nationalNumber = phoneNumber.nationalNumber;
          const newFormattedNumber = `+${newCountryCallingCode}${nationalNumber}`;

          // Try to parse the new number to validate it
          const newPhoneNumber = parsePhoneNumber(newFormattedNumber);
          if (newPhoneNumber) {
            onChange?.(newPhoneNumber.format('E.164'));
          } else {
            onChange?.(value); // Keep original if new format is invalid
          }
        }
      } catch (error) {
        // If parsing fails, keep the original value
        onChange?.(value);
      }
    }
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {rightElement && rightElement}
      </div>

      <div className="relative">
        <div className={clsx(
          'flex items-stretch bg-white dark:bg-neutral-900 rounded-lg',
          // Ensure container height matches input height
          sizeClasses[size],
          error
            ? 'border border-error focus-within:ring-1 focus-within:ring-error'
            : 'border border-neutral-300 dark:border-neutral-700 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary',
          className
        )}>
        {/* Icon container with fixed width */}
        {icon && (
          <div className="flex-shrink-0 w-12 flex justify-center items-center border-r border-neutral-200 dark:border-neutral-700">
            {icon}
          </div>
        )}

        {/* Country Selector */}
        <div className="flex-shrink-0 relative">
          <div className="rounded-l-lg overflow-hidden">
            <CountrySelector
              value={selectedCountry}
              onChange={handleCountryChange}
              disabled={disabled}
              error={!!error}
              size={size}
              className="border-0 border-r border-neutral-200 dark:border-neutral-700"
            />
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative rounded-r-lg overflow-hidden">
          <input
            id={id}
            type="tel"
            value={value || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={placeholder || 'Enter phone number'}
            disabled={disabled}
            className={clsx(
              'w-full h-full px-3 border-0 outline-none focus:ring-0 focus:outline-none bg-transparent rounded-r-lg',
              'text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400',
              error && 'text-error placeholder-red-300 dark:placeholder-red-500'
            )}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
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
