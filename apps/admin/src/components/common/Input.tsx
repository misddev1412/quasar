import React from 'react';
import clsx from 'clsx';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({ className, inputSize = 'md', ...props }) => {
  // Explicit height classes to match Select component
  const sizeClasses = {
    sm: '!h-10',     // 40px height
    md: '!h-11',     // 44px height
    lg: '!h-12',     // 48px height
  };

  // Padding adjustments for different sizes
  const paddingClasses = {
    sm: 'px-3 py-2',      // Slightly smaller padding
    md: 'px-3.5 py-2.5',  // Default padding
    lg: 'px-4 py-3',      // Larger padding
  };

  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 transition focus:outline-none focus:border-indigo-500 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed placeholder:text-gray-400',
        paddingClasses[inputSize],
        sizeClasses[inputSize],
        className
      )}
      {...props}
    />
  );
};
