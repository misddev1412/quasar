import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseClasses = clsx(
    'inline-flex items-center font-medium rounded-md',
    {
      'px-2 py-1 text-xs': size === 'sm' || size === 'md',
      'px-3 py-1 text-sm': size === 'lg'
    }
  );
  
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-200 text-gray-700 bg-white',
    secondary: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={clsx(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
};