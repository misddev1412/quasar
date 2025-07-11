import React from 'react';

interface FormInputProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
  autoComplete?: string;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
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
  autoComplete,
  className = '',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-theme-primary">
          {label}
        </label>
        {rightElement && rightElement}
      </div>
      <div className={`relative flex items-center bg-theme-surface rounded-lg overflow-hidden ${
        error 
          ? 'border border-error focus-within:ring-1 focus-within:ring-error'
          : 'border border-theme-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary'
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
          className={`w-full py-3 pr-4 border-0 outline-none focus:ring-0 focus:outline-none bg-transparent ${
            error 
              ? 'text-error placeholder-red-300 dark:placeholder-red-500'
              : 'text-theme-primary placeholder-theme-muted'
          } themed-input`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default FormInput; 