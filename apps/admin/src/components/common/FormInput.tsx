import React from 'react';
import clsx from 'clsx';

export type IconSpacing = 'compact' | 'standard' | 'large';

interface FormInputProps {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inputRef?: React.Ref<HTMLInputElement>;
  /** Use new icon spacing system instead of bordered icon container */
  useIconSpacing?: boolean;
  /** Icon spacing size when useIconSpacing is true */
  iconSpacing?: IconSpacing;
  labelClassName?: string;
}

const BASE_LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400';

export const FormInput: React.FC<FormInputProps & { [key: string]: any }> = ({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  icon,
  required = false,
  error,
  rightElement,
  rightIcon,
  autoComplete,
  className = '',
  size = 'md',
  inputRef,
  useIconSpacing = false,
  iconSpacing = 'standard',
  labelClassName,
  ...rest
}) => {
  // Explicit height classes for pixel-perfect consistency across all input types
  const sizeClasses = {
    sm: '!h-10',     // 40px height
    md: '!h-11',     // 44px height
    lg: '!h-12',     // 48px height
  };

  // Icon spacing classes for new system
  const spacingClasses = {
    compact: 'input-with-left-icon-compact',
    standard: 'input-with-left-icon',
    large: 'input-with-left-icon-large'
  };

  return (
    <div className={label ? 'space-y-1.5' : ''}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className={clsx(BASE_LABEL_CLASS, labelClassName)}>
            {label}
          </label>
          {rightElement && rightElement}
        </div>
      )}
      <div className={clsx(
        'relative group bg-white dark:bg-neutral-900 rounded-lg overflow-hidden',
        // Conditional flex layout for old bordered icon system
        !useIconSpacing && 'flex items-center',
        // Ensure container height matches input height
        sizeClasses[size],
        error
          ? 'border border-error focus-within:ring-1 focus-within:ring-error'
          : 'border border-neutral-300 dark:border-neutral-700 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary',
        className
      )}>
        {/* Old bordered icon container - only when not using new spacing system */}
        {icon && !useIconSpacing && (
          <div className="flex-shrink-0 w-12 flex justify-center items-center border-r border-neutral-200 dark:border-neutral-700 group-focus-within:border-primary">
            {icon}
          </div>
        )}

        {/* New icon positioning system */}
        {icon && useIconSpacing && (
          <div className="input-icon-left">
            {icon}
          </div>
        )}
        
        {/* Input without border since the container has border */}
        <input
          id={id}
          ref={inputRef as any}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={clsx(
            'w-full border-0 outline-none focus:ring-0 focus:outline-none focus:shadow-none focus-visible:shadow-none bg-transparent',
            // Explicit sizing and spacing for pixel-perfect consistency
            '!py-0 !box-border !text-sm !leading-normal',
            // Conditional padding based on icon system
            useIconSpacing && icon ? spacingClasses[iconSpacing] : (icon ? '' : '!pl-4'),
            rightIcon ? '!pr-12' : '!pr-4',
            sizeClasses[size],
            error
              ? 'text-error placeholder-red-300 dark:placeholder-red-500'
              : 'text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400'
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
            // Conditional padding based on icon system
            padding: useIconSpacing
              ? (rightIcon ? '0 48px 0 0' : '0 16px 0 0')
              : (icon ? '0 48px 0 12px' : rightIcon ? '0 48px 0 16px' : '0 16px 0 16px'),
            border: 'none',
            background: 'transparent',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
          }}
          {...rest}
        />
        {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-500 dark:text-neutral-400">
              {rightIcon}
            </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default FormInput; 
