import React from 'react';
import cn from 'classnames';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  description?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  id,
  className,
  'aria-label': ariaLabel,
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-9 h-5',
      dot: 'w-3.5 h-3.5', // 14px
      translate: 'translate-x-[18px]', // 18px
      position: 'top-[2px] left-[2px]', // 2px
    },
    md: {
      container: 'w-11 h-6',
      dot: 'w-5 h-5',
      translate: 'translate-x-5',
      position: 'top-0.5 left-0.5',
    },
  };

  const s = sizeClasses[size];

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const toggleElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleChange}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel || label}
      className={cn(
        'relative inline-flex flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        s.container,
        { 'bg-primary-600': checked, 'bg-gray-300': !checked },
        {
          'cursor-pointer': !disabled,
          'cursor-not-allowed opacity-50': disabled,
        }
      )}
    >
      <span className="sr-only">{ariaLabel || label || 'Toggle switch'}</span>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0 inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
          s.dot,
          { [s.translate]: checked, 'translate-x-0.5': !checked }
        )}
      />
    </button>
  );

  if (label || description) {
    return (
      <div className={cn('flex flex-col space-y-2', className)}>
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium cursor-pointer',
                disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-900 dark:text-gray-100'
              )}
              onClick={!disabled ? handleChange : undefined}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {toggleElement}
      </div>
    );
  }

  return toggleElement;
};