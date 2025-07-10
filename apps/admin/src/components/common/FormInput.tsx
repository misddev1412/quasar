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
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {rightElement && rightElement}
      </div>
      <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 dark:focus-within:border-blue-500 bg-white dark:bg-gray-800/50 overflow-hidden">
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
          className={`w-full py-3 pr-4 border-0 outline-none focus:ring-0 focus:outline-none bg-transparent dark:text-white dark:placeholder-gray-400 ${
            error ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default FormInput; 