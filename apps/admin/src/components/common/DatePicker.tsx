import React from 'react';
import { DateInput } from './DateInput';

interface DatePickerProps {
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
}

export const DatePicker: React.FC<DatePickerProps> = ({
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
}) => {
  return (
    <DateInput
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      className={className}
      required={required}
      min={min}
      max={max}
      size={size}
    />
  );
};

export default DatePicker;