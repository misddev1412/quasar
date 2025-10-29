import React from 'react';
import clsx from 'clsx';

export type IconSpacing = 'compact' | 'standard' | 'large';

export interface InputWithIconProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconSpacing?: IconSpacing;
}

/**
 * InputWithIcon - A reusable input component with consistent icon spacing
 * 
 * Features:
 * - Consistent left/right icon positioning
 * - Three spacing options: compact (44px), standard (56px), large (64px)
 * - Dark mode support
 * - Accessible design
 * - Customizable styling
 * 
 * Usage:
 * ```tsx
 * <InputWithIcon
 *   leftIcon={<FiSearch className="h-5 w-5" />}
 *   placeholder="Search..."
 *   iconSpacing="standard"
 * />
 * ```
 */
export const InputWithIcon: React.FC<InputWithIconProps> = ({
  leftIcon,
  rightIcon,
  iconSpacing = 'standard',
  className = '',
  disabled,
  ...inputProps
}) => {
  // Map spacing options to CSS classes
  const spacingClasses = {
    compact: 'input-with-left-icon-compact',
    standard: 'input-with-left-icon',
    large: 'input-with-left-icon-large'
  };

  const leftPaddingClass = leftIcon ? spacingClasses[iconSpacing] : '';
  const rightPaddingClass = rightIcon ? 'pr-12' : 'pr-3';

  return (
    <div className="relative">
      {/* Left Icon */}
      {leftIcon && (
        <div className="input-icon-left">
          {leftIcon}
        </div>
      )}

      {/* Input Field */}
      <input
        disabled={disabled}
        className={clsx(
          // Base input styles
          'block w-full py-2 border rounded-md leading-5 bg-white dark:bg-gray-700',
          'text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
          'border-gray-300 dark:border-gray-600',
          'focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
          // Icon spacing
          leftPaddingClass,
          rightPaddingClass,
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          // Custom classes
          className
        )}
        {...inputProps}
      />

      {/* Right Icon */}
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
          {rightIcon}
        </div>
      )}
    </div>
  );
};

export default InputWithIcon;
