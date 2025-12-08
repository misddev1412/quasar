import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@heroui/react';
import clsx from 'clsx';
import { CountryCode, getCountryCallingCode, parsePhoneNumber } from 'react-phone-number-input';
import SelectField, { SelectOption } from './SelectField';
import type { StylesConfig } from 'react-select';

export interface PhoneInputCountryOption {
  code: string;
  name: string;
  phoneCode?: string | null;
}

export interface PhoneInputFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  countryOptions?: PhoneInputCountryOption[];
  defaultCountry?: string;
  onCountryChange?: (countryCode: string) => void;
  className?: string;
}

const normalizeCountryCode = (code?: string | null) => (code ? String(code).toUpperCase() : '');

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  id,
  label = 'Phone number',
  placeholder = 'e.g. 912 345 678',
  value,
  onChange,
  required = false,
  error,
  helperText,
  disabled = false,
  countryOptions = [],
  defaultCountry,
  onCountryChange,
  className,
}) => {
  const normalizedCountryOptions = useMemo(() => {
    if (!countryOptions || countryOptions.length === 0) {
      return [] as PhoneInputCountryOption[];
    }

    return countryOptions
      .map((option) => ({
        code: normalizeCountryCode(option.code),
        name: option.name,
        phoneCode: option.phoneCode ?? undefined,
      }))
      .filter((option) => Boolean(option.code));
  }, [countryOptions]);

  const fallbackCountry = useMemo(() => {
    const explicitDefault = normalizeCountryCode(defaultCountry);
    if (explicitDefault) {
      return explicitDefault;
    }
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed?.country) {
          return normalizeCountryCode(parsed.country);
        }
      } catch {
        // Ignore parse errors and fall through to list defaults
      }
    }
    if (normalizedCountryOptions.length > 0) {
      return normalizedCountryOptions[0].code;
    }
    return 'US';
  }, [defaultCountry, normalizedCountryOptions, value]);

  const [selectedCountry, setSelectedCountry] = useState<string>(fallbackCountry);
  const [displayValue, setDisplayValue] = useState<string>('');
  const userChangedCountryRef = useRef(false);

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      if (!userChangedCountryRef.current) {
        setSelectedCountry(fallbackCountry);
      }
      return;
    }

    try {
      const parsed = parsePhoneNumber(value);
      if (parsed) {
        setDisplayValue(String(parsed.nationalNumber || ''));
        if (parsed.country) {
          const parsedCountry = normalizeCountryCode(parsed.country);
          setSelectedCountry(parsedCountry);
        }
      }
    } catch {
      // Keep current display value on parse errors (partial input)
    }
  }, [value, fallbackCountry]);

  useEffect(() => {
    if (!userChangedCountryRef.current) {
      setSelectedCountry(fallbackCountry);
    }
  }, [fallbackCountry]);

  const getCallingCodeForCountry = useCallback(
    (countryCode: string): string | undefined => {
      const normalizedCode = normalizeCountryCode(countryCode);
      if (!normalizedCode) {
        return undefined;
      }

      const match = normalizedCountryOptions.find((option) => option.code === normalizedCode);
      if (match?.phoneCode) {
        return match.phoneCode.replace(/^\+/, '');
      }

      try {
        return getCountryCallingCode(normalizedCode as CountryCode);
      } catch {
        return undefined;
      }
    },
    [normalizedCountryOptions]
  );

  const selectedDialCode = useMemo(() => {
    const callingCode = getCallingCodeForCountry(selectedCountry);
    return callingCode ? `+${callingCode}` : '+';
  }, [getCallingCodeForCountry, selectedCountry]);

  const formatToE164 = useCallback(
    (input: string | undefined, countryCode: string): string | undefined => {
      const digits = (input || '').replace(/[^0-9]/g, '');
      if (!digits) {
        return undefined;
      }

      const callingCode = getCallingCodeForCountry(countryCode);
      if (!callingCode) {
        return undefined;
      }

      const formatted = `+${callingCode}${digits}`;
      try {
        const parsed = parsePhoneNumber(formatted);
        if (parsed) {
          return parsed.format('E.164');
        }
      } catch {
        // Fall back to returning the formatted value even if parsing fails
      }
      return formatted;
    },
    [getCallingCodeForCountry]
  );

  const handlePhoneChange = useCallback(
    (input: string | undefined) => {
      setDisplayValue(input || '');

      if (!onChange) {
        return;
      }

      const formatted = formatToE164(input, selectedCountry);
      onChange(formatted);
    },
    [formatToE164, onChange, selectedCountry]
  );

  const handleCountryChange = useCallback(
    (countryCode: string | null) => {
      const normalized = normalizeCountryCode(countryCode) || fallbackCountry;
      userChangedCountryRef.current = true;
      setSelectedCountry(normalized);

      onCountryChange?.(normalized);

      const formatted = formatToE164(displayValue, normalized);
      onChange?.(formatted);
    },
    [displayValue, fallbackCountry, formatToE164, onChange, onCountryChange]
  );

  const groupedClassName = clsx('space-y-2', className);
  const labelId = `${id}-label`;
  const countrySelectOptions = useMemo<SelectOption[]>(() => {
    if (normalizedCountryOptions.length === 0) {
      return [
        {
          value: 'US',
          label: 'United States',
        },
      ];
    }

    return normalizedCountryOptions.map((option) => ({
      value: option.code,
      label: option.phoneCode ? `${option.name} (${option.phoneCode})` : option.name,
    }));
  }, [normalizedCountryOptions]);

  const countrySelectStyles = useMemo<StylesConfig<SelectOption, false>>(
    () => ({
      control: (base) => ({
        ...base,
        minHeight: '48px',
        height: '48px',
        borderRadius: '0.75rem',
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
      }),
    }),
    []
  );

  return (
    <div className={groupedClassName}>
      <label id={labelId} className="block text-sm font-medium text-gray-600">
        {label}
        {required && <span className="text-danger-500">*</span>}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-48">
          <SelectField
            placeholder="Country"
            value={selectedCountry}
            onChange={handleCountryChange}
            options={countrySelectOptions}
            isClearable={false}
            menuPosition="fixed"
            styles={countrySelectStyles}
            aria-labelledby={labelId}
            aria-label="Country"
            containerClassName="sm:min-w-[12rem]"
            isDisabled={disabled || countrySelectOptions.length <= 1}
          />
        </div>

        <div className="flex-1">
          <Input
            id={id}
            type="tel"
            value={displayValue}
            onChange={(event) => handlePhoneChange(event.target.value)}
            placeholder={placeholder}
            variant="bordered"
            isInvalid={!!error}
            errorMessage={error}
            required={required}
            disabled={disabled}
            startContent={<span className="text-sm text-gray-500">{selectedDialCode}</span>}
          />
          {!error && helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
        </div>
      </div>
    </div>
  );
};

export default PhoneInputField;
