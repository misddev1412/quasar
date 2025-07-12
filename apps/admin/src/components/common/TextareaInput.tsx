import React from 'react';

interface TextareaInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
  rows?: number;
}

export const TextareaInput: React.FC<TextareaInputProps & { [key: string]: any }> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className = '',
  rows = 4,
  ...rest
}) => {
  return (
    <div className="space-y-2 h-full">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full h-full p-3 outline-none focus:ring-0 focus:outline-none resize-y rounded-lg bg-white dark:bg-neutral-900 ${
          error
            ? 'border border-error focus:border-error text-error placeholder-red-300 dark:placeholder-red-500'
            : 'border border-neutral-300 dark:border-neutral-700 focus:border-primary text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400'
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default TextareaInput; 