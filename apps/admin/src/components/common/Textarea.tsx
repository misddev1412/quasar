import React from 'react';
import clsx from 'clsx';
import { BASE_LABEL_CLASS } from './styles';

interface TextareaProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
  rows?: number;
  labelClassName?: string;
}

export const Textarea: React.FC<TextareaProps & { [key: string]: any }> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className = '',
  rows = 4,
  labelClassName,
  ...rest
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className={clsx(BASE_LABEL_CLASS, labelClassName)}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-3 outline-none focus:ring-0 focus:outline-none resize-y rounded-lg bg-white dark:bg-neutral-900 ${
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

export default Textarea;
