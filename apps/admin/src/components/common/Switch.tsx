import React from 'react';

interface SwitchProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  const switchButton = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-0 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? 'bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-400'
          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
      }`}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        className={`pointer-events-none absolute top-0.5 left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  if (label || description) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {switchButton}
        <div className="flex flex-col">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <div className={className}>{switchButton}</div>;
};

export default Switch;
