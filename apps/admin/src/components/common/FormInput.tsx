import React from 'react';

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
}

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
  ...rest
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </label>
        {rightElement && rightElement}
      </div>
      <div className={`relative flex items-center bg-white dark:bg-neutral-900 rounded-lg overflow-hidden ${
        error 
          ? 'border border-error focus-within:ring-1 focus-within:ring-error'
          : 'border border-neutral-300 dark:border-neutral-700 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary'
      } ${className}`}>
        {/* Icon container with fixed width */}
        {icon && (
          <div className="flex-shrink-0 w-12 flex justify-center items-center">
            {icon}
          </div>
        )}
        
        {/* Input without border since the container has border */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full py-3 border-0 outline-none focus:ring-0 focus:outline-none bg-transparent ${icon ? '' : 'pl-4'} ${rightIcon ? 'pr-12' : 'pr-4'} ${
            error 
              ? 'text-error placeholder-red-300 dark:placeholder-red-500'
              : 'text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400'
          } themed-input`}
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