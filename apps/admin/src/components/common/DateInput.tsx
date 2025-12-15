import React from 'react';
import clsx from 'clsx';

const BASE_LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400';

interface DateInputProps {
  id?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
  min?: string;
  max?: string;
  size?: 'sm' | 'md' | 'lg';
  labelClassName?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className,
  required = false,
  min,
  max,
  size = 'md',
  labelClassName,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          className={clsx(BASE_LABEL_CLASS, labelClassName)}
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
        <input
          id={id}
          type="date"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          placeholder={placeholder}
          className={clsx(
            'w-full border-0 outline-none focus:ring-0 focus:outline-none bg-transparent',
            'text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400',
            // Explicit sizing and spacing for pixel-perfect consistency - matching Select component
            '!pl-4 !pr-12 !py-0 !box-border !text-sm !leading-normal',
            // Custom class to position native date picker calendar icon
            'date-input-custom',
            sizeClasses[size],
            {
              'text-error': error,
              'cursor-not-allowed': disabled,
            }
          )}
          style={{
            // Complete browser reset for consistent rendering - minimal inline styles
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            appearance: 'none',
            lineHeight: '1.5',
            fontSize: '14px',
            fontFamily: 'inherit',
            margin: 0,
            border: 'none',
            background: 'transparent',
            outline: 'none',
          }}
        />

        {/* Calendar icon - positioned behind the native calendar picker */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-0">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
