import React from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  error,
  className,
  required = false,
  size = 'md',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  // Explicit height classes for pixel-perfect consistency across all input types
  const sizeClasses = {
    sm: '!h-10',     // 40px height
    md: '!h-11',     // 44px height
    lg: '!h-12',     // 48px height
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={clsx(
        'relative flex items-center bg-white dark:bg-neutral-900 rounded-lg overflow-hidden',
        // Ensure container height matches input height
        sizeClasses[size],
        error
          ? 'border border-error focus-within:ring-1 focus-within:ring-error'
          : 'border border-neutral-300 dark:border-neutral-700 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary',
        {
          'opacity-50 cursor-not-allowed': disabled,
        }
      )}>
        <select
          id={id}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={clsx(
            'w-full border-0 outline-none focus:ring-0 focus:outline-none bg-transparent',
            'text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400',
            'appearance-none cursor-pointer',
            // Explicit sizing and spacing for pixel-perfect consistency
            '!pl-4 !pr-12 !py-0 !box-border !text-sm !leading-normal',
            sizeClasses[size],
            {
              'text-error': error,
              'cursor-not-allowed': disabled,
            }
          )}
          style={{
            // Complete browser reset for consistent rendering
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            lineHeight: '1.5',
            fontSize: '14px',
            fontFamily: 'inherit',
            margin: 0,
            padding: '0 48px 0 16px',
            border: 'none',
            background: 'transparent',
            outline: 'none',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg
            className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};
